// lib/api/resolvers/createAssessment.ts
import * as dynamodb from "@aws-appsync/utils/dynamodb";

// lib/api/utils/AppSyncErrors.ts
import { util as util2 } from "@aws-appsync/utils";
function logAppSyncError(input) {
  const { errorCode, errorMessage, errorInfo, context } = input;
  console.error({
    errorCode,
    errorMessage,
    errorInfo,
    requestArguments: context.args,
    requestIdentity: { ...context.identity }
  });
}
function raiseAppSyncError(input) {
  const { errorMessage, errorCode, context, errorInfo = null } = input;
  logAppSyncError(input);
  return util2.error(
    errorMessage,
    errorCode,
    { arguments: context.args, identity: context.identity },
    errorInfo
  );
}

// lib/api/resolvers/createAssessment.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const templateSections = ctx.prev.result;
  if (!templateSections) {
    raiseAppSyncError({
      errorMessage: "The requested resource could not be found." /* RESOURCE_NOT_FOUND */,
      errorCode: "NotFoundError" /* NOT_FOUND */,
      context: ctx
    });
  }
  return dynamodb.put({
    key: {
      assessmentId: util.autoId(),
      ownerId: userId
    },
    item: {
      name: ctx.args.name,
      template: templateSections,
      progress: {
        completedQuestions: [],
        lastUpdated: util.time.nowISO8601()
      }
    }
  });
}
function response(ctx) {
  if (ctx.error) {
    raiseAppSyncError({
      errorMessage: ctx.error.message,
      errorCode: ctx.error.type,
      context: ctx
    });
  }
  return ctx.result;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY3JlYXRlQXNzZXNzbWVudC50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksY0FBYzs7O0FDRDFCLFNBQWtCLFFBQUFBLGFBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU9DLE1BQUs7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsRUFBRSxXQUFXLFFBQVEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGOzs7QURuQ08sU0FBUyxRQUFRLEtBQTRDO0FBQ2xFLFFBQU0sU0FBVSxJQUFJLFNBQW9DO0FBRXhELE1BQUksQ0FBQyxRQUFRO0FBQ1gsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sbUJBQTZCLElBQUksS0FBSztBQUU1QyxNQUFJLENBQUMsa0JBQWtCO0FBQ3JCLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFnQixhQUFnQjtBQUFBLElBQzlCLEtBQUs7QUFBQSxNQUNILGNBQWMsS0FBSyxPQUFPO0FBQUEsTUFDMUIsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLE1BQU07QUFBQSxNQUNKLE1BQU0sSUFBSSxLQUFLO0FBQUEsTUFDZixVQUFVO0FBQUEsTUFDVixVQUFVO0FBQUEsUUFDUixvQkFBb0IsQ0FBQztBQUFBLFFBQ3JCLGFBQWEsS0FBSyxLQUFLLFdBQVc7QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVPLFNBQVMsU0FBUyxLQUE0QztBQUNuRSxNQUFJLElBQUksT0FBTztBQUNiLHNCQUFrQjtBQUFBLE1BQ2hCLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDeEIsV0FBVyxJQUFJLE1BQU07QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQU8sSUFBSTtBQUNiOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgInV0aWwiXQp9Cg==
