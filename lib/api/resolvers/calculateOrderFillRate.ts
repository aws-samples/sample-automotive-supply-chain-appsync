import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { PartOrderFillRate } from "./types/AppSync";
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
    SELECT
      p.part_name,
      ROUND(SUM(o.quantity_ordered * (CASE WHEN o.fulfilled = TRUE THEN 1 ELSE 0 END)) * 100.0 / SUM(o.quantity_ordered), 2) AS order_fill_rate
    FROM Orders o
    JOIN Parts p ON o.part_id = p.part_id
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
    order_fill_rate: number;
  }[];

  const parsedResult: PartOrderFillRate[] = result.map((row) => ({
    partName: row.part_name,
    orderFillRate: row.order_fill_rate,
  }));

  return parsedResult;
}
