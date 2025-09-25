// lib/api/resolvers/createPart.ts
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

// lib/api/resolvers/createPart.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const { partId, partName, partCategory, unitPrice } = ctx.args.input;
  if (!partId || !partName || !partCategory || unitPrice === void 0) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.insert({
      table: "parts",
      values: {
        part_id: partId,
        part_name: partName,
        part_category: partCategory,
        unit_price: unitPrice
      },
      returning: ["part_id", "part_name", "part_category", "unit_price"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY3JlYXRlUGFydC50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksU0FBUzs7O0FDRHJCLFNBQWtCLFlBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU8sS0FBSztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQSxFQUFFLFdBQVcsUUFBUSxNQUFNLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0Y7OztBRHRDTyxTQUFTLFFBQVEsS0FBYztBQUNwQyxRQUFNLFNBQVUsSUFBSSxTQUFvQztBQUV4RCxNQUFJLENBQUMsUUFBUTtBQUNYLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFDQSxRQUFNLEVBQUUsUUFBUSxVQUFVLGNBQWMsVUFBVSxJQUFJLElBQUksS0FBSztBQUUvRCxNQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsY0FBYyxRQUFXO0FBQ3BFLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFXO0FBQUEsSUFDTCxXQUFPO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxlQUFlO0FBQUEsUUFDZixZQUFZO0FBQUEsTUFDZDtBQUFBLE1BQ0EsV0FBVyxDQUFDLFdBQVcsYUFBYSxpQkFBaUIsWUFBWTtBQUFBLElBQ25FLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxNQUFJLElBQUksT0FBTztBQUNiLHNCQUFrQjtBQUFBLE1BQ2hCLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDeEIsV0FBVyxJQUFJLE1BQU07QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksQ0FBQyxJQUFJLFFBQVE7QUFDZixzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxhQUFpQixpQkFBYSxJQUFJLE1BQU07QUFFOUMsTUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxXQUFXLEdBQUc7QUFDL0Qsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sU0FBUyxXQUFXLENBQUMsRUFBRSxDQUFDO0FBRTlCLFFBQU0sZUFBcUI7QUFBQSxJQUN6QixRQUFRLE9BQU87QUFBQSxJQUNmLGNBQWMsT0FBTztBQUFBLElBQ3JCLFVBQVUsT0FBTztBQUFBLElBQ2pCLFdBQVcsT0FBTztBQUFBLEVBQ3BCO0FBRUEsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogW10KfQo=
