import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as rds from "@aws-appsync/utils/rds";
import { Part } from "./types/AppSync";
import { PartTableRow } from "./types/AuroraTables";
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

  const partId = ctx.args.partId as number;

  if (!partId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.INVALID_INPUT,
      errorCode: ErrorTypes.VALIDATION,
      context: ctx,
    });
  }

  return rds.createPgStatement(
    rds.remove({
      table: "parts",
      where: { part_id: { eq: partId } },
      returning: ["part_id", "part_name", "part_category", "unit_price"],
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

  const result = jsonResult[0][0] as PartTableRow;

  const parsedResult: Part = {
    partId: result.part_id,
    partCategory: result.part_category,
    partName: result.part_name,
    unitPrice: result.unit_price,
  };

  return parsedResult;
}
