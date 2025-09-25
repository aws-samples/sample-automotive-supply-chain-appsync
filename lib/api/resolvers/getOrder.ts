import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { Order } from "./types/AppSync";
import { OrderTableRow } from "./types/AuroraTables";
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

  const orderId = ctx.args.orderId as number;

  if (!orderId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.INVALID_INPUT,
      errorCode: ErrorTypes.VALIDATION,
      context: ctx,
    });
  }

  return rds.createPgStatement(
    rds.select({
      table: "orders",
      where: { order_id: { eq: orderId } },
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

  const result = jsonResult[0][0] as OrderTableRow;

  const parsedResult: Order = {
    orderId: result.order_id,
    partId: result.part_id,
    orderDate: result.order_date,
    quantityOrdered: result.quantity_ordered,
    fulfilled: result.fulfilled,
  };

  return parsedResult;
}
