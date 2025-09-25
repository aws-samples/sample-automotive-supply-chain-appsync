// lib/api/resolvers/listAssessments.ts
import * as dynamodb from "@aws-appsync/utils/dynamodb";

// lib/api/utils/AppSyncErrors.ts
import { util } from "@aws-appsync/utils";
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
  return util.error(
    errorMessage,
    errorCode,
    { arguments: context.args, identity: context.identity },
    errorInfo
  );
}

// lib/api/resolvers/listAssessments.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  return dynamodb.query({
    query: {
      ownerId: { eq: userId }
    },
    index: "byAssessmentOwnerId"
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
  if (!ctx.result.items) {
    raiseAppSyncError({
      errorMessage: "The requested resource could not be found." /* RESOURCE_NOT_FOUND */,
      errorCode: "NotFoundError" /* NOT_FOUND */,
      context: ctx
    });
  }
  return ctx.result.items;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGlzdEFzc2Vzc21lbnRzLnRzIiwgIi4uLy4uL3V0aWxzL0FwcFN5bmNFcnJvcnMudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsWUFBWSxjQUFjOzs7QUNEMUIsU0FBa0IsWUFBWTtBQXlCdkIsU0FBUyxnQkFBZ0IsT0FBcUM7QUFDbkUsUUFBTSxFQUFFLFdBQVcsY0FBYyxXQUFXLFFBQVEsSUFBSTtBQUV4RCxVQUFRLE1BQU07QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLGtCQUFrQixRQUFRO0FBQUEsSUFDMUIsaUJBQWlCLEVBQUUsR0FBRyxRQUFRLFNBQVM7QUFBQSxFQUN6QyxDQUFDO0FBQ0g7QUFFTyxTQUFTLGtCQUFrQixPQUFzQztBQUN0RSxRQUFNLEVBQUUsY0FBYyxXQUFXLFNBQVMsWUFBWSxLQUFLLElBQUk7QUFFL0Qsa0JBQWdCLEtBQUs7QUFFckIsU0FBTyxLQUFLO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBLEVBQUUsV0FBVyxRQUFRLE1BQU0sVUFBVSxRQUFRLFNBQVM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRjs7O0FEaENPLFNBQVMsUUFBUSxLQUFjO0FBQ3BDLFFBQU0sU0FBVSxJQUFJLFNBQW9DO0FBRXhELE1BQUksQ0FBQyxRQUFRO0FBQ1gsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQWdCLGVBQU07QUFBQSxJQUNwQixPQUFPO0FBQUEsTUFDTCxTQUFTLEVBQUUsSUFBSSxPQUFPO0FBQUEsSUFDeEI7QUFBQSxJQUNBLE9BQU87QUFBQSxFQUNULENBQUM7QUFDSDtBQUVPLFNBQVMsU0FBUyxLQUF3QjtBQUMvQyxNQUFJLElBQUksT0FBTztBQUNiLHNCQUFrQjtBQUFBLE1BQ2hCLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDeEIsV0FBVyxJQUFJLE1BQU07QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksQ0FBQyxJQUFJLE9BQU8sT0FBTztBQUNyQixzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTyxJQUFJLE9BQU87QUFDcEI7IiwKICAibmFtZXMiOiBbXQp9Cg==
