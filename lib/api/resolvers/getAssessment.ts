import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as dynamodb from "@aws-appsync/utils/dynamodb";
import { QueryGetAssessmentArgs } from "./types/AppSync";
import {
  ErrorMessages,
  ErrorTypes,
  raiseAppSyncError,
} from "../utils/AppSyncErrors";

interface GetAssessmentProps extends QueryGetAssessmentArgs {
  ownerId: String;
}

export function request(ctx: Context<QueryGetAssessmentArgs>) {
  const userId = (ctx.identity as AppSyncIdentityCognito).username;

  if (!userId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.USER_NOT_FOUND,
      errorCode: ErrorTypes.UNAUTHORIZED,
      context: ctx,
    });
  }

  const { assessmentId } = ctx.args;

  if (!assessmentId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.INVALID_INPUT,
      errorCode: ErrorTypes.VALIDATION,
      context: ctx,
    });
  }

  return dynamodb.get<GetAssessmentProps>({
    key: {
      assessmentId: assessmentId,
      ownerId: userId,
    },
  });
}

export function response(ctx: Context<QueryGetAssessmentArgs>) {
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

  return ctx.result;
}
