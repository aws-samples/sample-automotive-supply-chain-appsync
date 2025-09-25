import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { PartSafetyStockLevel } from "./types/AppSync";
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
    WITH DemandVariability AS (
      SELECT
        part_id,
        STDDEV_POP(monthly_quantity) AS demand_stddev
      FROM (
        SELECT
          part_id,
          DATE_TRUNC('month', CAST(order_date AS DATE)) AS order_month,
          SUM(quantity_ordered) AS monthly_quantity
        FROM Orders
        GROUP BY part_id, DATE_TRUNC('month', CAST(order_date AS DATE))
      ) subquery
      GROUP BY part_id
    ), LeadTimeStats AS (
      SELECT
        o.part_id,
        AVG(CAST(s.shipment_date AS DATE) - CAST(o.order_date AS DATE)) AS avg_lead_time
      FROM Orders o
      JOIN Shipments s ON o.part_id = s.part_id AND CAST(s.shipment_date AS DATE) >= CAST(o.order_date AS DATE)
      GROUP BY o.part_id
    )
    SELECT
      p.part_name,
      dv.demand_stddev,
      lts.avg_lead_time,
      ROUND(dv.demand_stddev * SQRT(lts.avg_lead_time), 2) AS safety_stock_level
    FROM DemandVariability dv
    JOIN LeadTimeStats lts ON dv.part_id = lts.part_id
    JOIN Parts p ON dv.part_id = p.part_id;
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
    demand_stddev: number;
    avg_lead_time: number;
    safety_stock_level: number;
  }[];

  const parsedResult: PartSafetyStockLevel[] = result.map((row) => ({
    partName: row.part_name,
    demandStddev: row.demand_stddev,
    avgLeadTime: row.avg_lead_time,
    safetyStockLevel: row.safety_stock_level,
  }));

  return parsedResult;
}
