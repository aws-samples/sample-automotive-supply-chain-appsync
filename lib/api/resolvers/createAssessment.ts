import { Context, AppSyncIdentityCognito } from "@aws-appsync/utils";
import * as dynamodb from "@aws-appsync/utils/dynamodb";
import {
  MutationCreateAssessmentArgs,
  Assessment,
  Template,
} from "./types/AppSync";
import {
  ErrorMessages,
  ErrorTypes,
  raiseAppSyncError,
} from "../utils/AppSyncErrors";

export function request(ctx: Context<MutationCreateAssessmentArgs>) {
  const userId = (ctx.identity as AppSyncIdentityCognito).username;

  if (!userId) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.USER_NOT_FOUND,
      errorCode: ErrorTypes.UNAUTHORIZED,
      context: ctx,
    });
  }

  const templateSections: Template = ctx.prev.result;

  if (!templateSections) {
    raiseAppSyncError({
      errorMessage: ErrorMessages.RESOURCE_NOT_FOUND,
      errorCode: ErrorTypes.NOT_FOUND,
      context: ctx,
    });
  }

  return dynamodb.put<Assessment>({
    key: {
      assessmentId: util.autoId(),
      ownerId: userId,
    },
    item: {
      name: ctx.args.name,
      template: templateSections,
      progress: {
        completedQuestions: [],
        lastUpdated: util.time.nowISO8601(),
      },
    },
  });
}

export function response(ctx: Context<MutationCreateAssessmentArgs>) {
  if (ctx.error) {
    raiseAppSyncError({
      errorMessage: ctx.error.message,
      errorCode: ctx.error.type,
      context: ctx,
    });
  }

  return ctx.result;
}
