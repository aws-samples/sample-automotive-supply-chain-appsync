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

  const shipmentId = ctx.args.shipmentId as number;

  if (!shipmentId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.INVALID_INPUT,
      errorCode: ErrorTypes.VALIDATION,
      context: ctx,
    });
  }

  return rds.createPgStatement(
    rds.remove({
      table: "shipments",
      where: { shipment_id: { eq: shipmentId } },
      returning: [
        "shipment_id",
        "part_id",
        "shipment_date",
        "quantity_shipped",
      ],
    })
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

  const result = jsonResult[0][0] as ShipmentTableRow;

  const parsedResult: Shipment = {
    shipmentId: result.shipment_id,
    partId: result.part_id,
    shipmentDate: result.shipment_date,
    quantityShipped: result.quantity_shipped,
  };

  return parsedResult;
}
