// lib/api/resolvers/getPart.ts
import * as rds from "@aws-appsync/utils/rds";

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

// lib/api/resolvers/getPart.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const partId = ctx.args.partId;
  if (!partId) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.select({
      table: "parts",
      where: { part_id: { eq: partId } }
    })
  );
}
function response(ctx) {
  if (ctx.error) {
    raiseAppSyncError({
      errorMessage: ctx.error.message,
      errorCode: ctx.error.type,
      context: ctx
    });
  }
  if (!ctx.result) {
    raiseAppSyncError({
      errorMessage: "The requested resource could not be found." /* RESOURCE_NOT_FOUND */,
      errorCode: "NotFoundError" /* NOT_FOUND */,
      context: ctx
    });
  }
  const jsonResult = rds.toJsonObject(ctx.result);
  if (!jsonResult || !jsonResult[0] || jsonResult[0].length === 0) {
    raiseAppSyncError({
      errorMessage: "The requested resource could not be found." /* RESOURCE_NOT_FOUND */,
      errorCode: "NotFoundError" /* NOT_FOUND */,
      context: ctx
    });
  }
  const result = jsonResult[0][0];
  const parsedResult = {
    partId: result.part_id,
    partCategory: result.part_category,
    partName: result.part_name,
    unitPrice: result.unit_price
  };
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZ2V0UGFydC50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksU0FBUzs7O0FDRHJCLFNBQWtCLFlBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU8sS0FBSztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQSxFQUFFLFdBQVcsUUFBUSxNQUFNLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0Y7OztBRHRDTyxTQUFTLFFBQVEsS0FBYztBQUNwQyxRQUFNLFNBQVUsSUFBSSxTQUFvQztBQUV4RCxNQUFJLENBQUMsUUFBUTtBQUNYLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLFNBQVMsSUFBSSxLQUFLO0FBRXhCLE1BQUksQ0FBQyxRQUFRO0FBQ1gsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQVc7QUFBQSxJQUNMLFdBQU87QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxPQUFPLEVBQUU7QUFBQSxJQUNuQyxDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsTUFBSSxJQUFJLE9BQU87QUFDYixzQkFBa0I7QUFBQSxNQUNoQixjQUFjLElBQUksTUFBTTtBQUFBLE1BQ3hCLFdBQVcsSUFBSSxNQUFNO0FBQUEsTUFDckIsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxNQUFJLENBQUMsSUFBSSxRQUFRO0FBQ2Ysc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sYUFBaUIsaUJBQWEsSUFBSSxNQUFNO0FBRTlDLE1BQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssV0FBVyxDQUFDLEVBQUUsV0FBVyxHQUFHO0FBQy9ELHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLFNBQVMsV0FBVyxDQUFDLEVBQUUsQ0FBQztBQUU5QixRQUFNLGVBQXFCO0FBQUEsSUFDekIsUUFBUSxPQUFPO0FBQUEsSUFDZixjQUFjLE9BQU87QUFBQSxJQUNyQixVQUFVLE9BQU87QUFBQSxJQUNqQixXQUFXLE9BQU87QUFBQSxFQUNwQjtBQUVBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
