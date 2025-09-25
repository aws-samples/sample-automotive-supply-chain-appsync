import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { Shipment } from "./types/AppSync";
import { ShipmentTableRow } from "./types/AuroraTables";
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

  return rds.createPgStatement(rds.select({ table: "shipments" }));
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

  const result = jsonResult[0] as ShipmentTableRow[];

  const parsedResult: Shipment[] = result.map((row) => ({
    shipmentId: row.shipment_id,
    partId: row.part_id,
    shipmentDate: row.shipment_date,
    quantityShipped: row.quantity_shipped,
  }));

  return parsedResult;
}
