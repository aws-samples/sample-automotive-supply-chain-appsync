import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { PartLeadTime } from "./types/AppSync";
import {
  ErrorMessages,
  ErrorTypes,
  raiseAppSyncError,
} from "../utils/AppSyncErrors";

export function request(ctx: Context) {
  const userId = (ctx.identity as AppSyncIdentityCognito).username;

  if (!userId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.USER_NOT_FOUND,
      errorCode: ErrorTypes.UNAUTHORIZED,
      context: ctx,
    });
  }

  return rds.createPgStatement(
    `
    WITH OrderShipmentPairs AS (
      SELECT
        o.part_id,
        CAST(o.order_date AS DATE) AS order_date,
        MIN(CAST(s.shipment_date AS DATE)) AS shipment_date
      FROM Orders o
      JOIN Shipments s ON o.part_id = s.part_id AND CAST(s.shipment_date AS DATE) >= CAST(o.order_date AS DATE)
      GROUP BY o.part_id, CAST(o.order_date AS DATE)
    ), LeadTimes AS (
      SELECT
        part_id,
        CAST(shipment_date AS DATE) - CAST(order_date AS DATE) AS lead_time
      FROM OrderShipmentPairs
    )
    SELECT
      p.part_name,
      CAST(AVG(lead_time) AS INT) AS avg_lead_time
    FROM LeadTimes lt
    JOIN Parts p ON lt.part_id = p.part_id
    GROUP BY p.part_name;
    `
  );
}

export function response(ctx: Context) {
  if (ctx.error) {
    raiseAppSyncError({
      errorMessage: ctx.error.message,
      errorCode: ctx.error.type,
      context: ctx,
    });
  }

  if (!ctx.result) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.RESOURCE_NOT_FOUND,
      errorCode: ErrorTypes.NOT_FOUND,
      context: ctx,
    });
  }

  const jsonResult = rds.toJsonObject(ctx.result);

  if (!jsonResult || !jsonResult[0] || jsonResult[0].length === 0) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.RESOURCE_NOT_FOUND,
      errorCode: ErrorTypes.NOT_FOUND,
      context: ctx,
    });
  }

  const result = jsonResult[0] as {
    part_name: string;
    avg_lead_time: number;
  }[];

  const parsedResult: PartLeadTime[] = result.map((row) => ({
    partName: row.part_name,
    avgLeadTime: row.avg_lead_time,
  }));

  return parsedResult;
}
