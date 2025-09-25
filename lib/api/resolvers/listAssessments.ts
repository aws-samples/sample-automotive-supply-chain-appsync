import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as dynamodb from "@aws-appsync/utils/dynamodb";
import { Assessment } from "./types/AppSync";
import {
  ErrorMessages,
  ErrorTypes,
  raiseAppSyncError,
} from "../utils/AppSyncErrors";

interface QueryContextProps extends Context {
  result: {
    items: [Assessment];
    scannedCount: Number;
  };
}

export function request(ctx: Context) {
  const userId = (ctx.identity as AppSyncIdentityCognito).username;

  if (!userId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.USER_NOT_FOUND,
      errorCode: ErrorTypes.UNAUTHORIZED,
      context: ctx,
    });
  }

  return dynamodb.query({
    query: {
      ownerId: { eq: userId },
    },
    index: "byAssessmentOwnerId",
  });
}

export function response(ctx: QueryContextProps) {
  if (ctx.error) {
    raiseAppSyncError({
      errorMessage: ctx.error.message,
      errorCode: ctx.error.type,
      context: ctx,
    });
  }

  if (!ctx.result.items) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.RESOURCE_NOT_FOUND,
      errorCode: ErrorTypes.NOT_FOUND,
      context: ctx,
    });
  }

  return ctx.result.items;
}
