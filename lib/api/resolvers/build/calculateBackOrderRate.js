// lib/api/resolvers/calculateBackOrderRate.ts
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

// lib/api/resolvers/calculateBackOrderRate.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    `
    SELECT
      p.part_name,
      ROUND(COUNT(*) FILTER (WHERE o.fulfilled = FALSE) * 100.0 / COUNT(*), 2) AS backorder_rate
    FROM Orders o
    JOIN Parts p ON o.part_id = p.part_id
    GROUP BY p.part_name;
    `
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
  const result = jsonResult[0];
  const parsedResult = result.map((row) => ({
    partName: row.part_name,
    backorderRate: row.backorder_rate
  }));
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY2FsY3VsYXRlQmFja09yZGVyUmF0ZS50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksU0FBUzs7O0FDRHJCLFNBQWtCLFlBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU8sS0FBSztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQSxFQUFFLFdBQVcsUUFBUSxNQUFNLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0Y7OztBRHZDTyxTQUFTLFFBQVEsS0FBYztBQUNwQyxRQUFNLFNBQVUsSUFBSSxTQUFvQztBQUV4RCxNQUFJLENBQUMsUUFBUTtBQUNYLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFXO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRRjtBQUNGO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsTUFBSSxJQUFJLE9BQU87QUFDYixzQkFBa0I7QUFBQSxNQUNoQixjQUFjLElBQUksTUFBTTtBQUFBLE1BQ3hCLFdBQVcsSUFBSSxNQUFNO0FBQUEsTUFDckIsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxNQUFJLENBQUMsSUFBSSxRQUFRO0FBQ2Ysc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sYUFBaUIsaUJBQWEsSUFBSSxNQUFNO0FBRTlDLE1BQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssV0FBVyxDQUFDLEVBQUUsV0FBVyxHQUFHO0FBQy9ELHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLFNBQVMsV0FBVyxDQUFDO0FBSzNCLFFBQU0sZUFBb0MsT0FBTyxJQUFJLENBQUMsU0FBUztBQUFBLElBQzdELFVBQVUsSUFBSTtBQUFBLElBQ2QsZUFBZSxJQUFJO0FBQUEsRUFDckIsRUFBRTtBQUVGLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
