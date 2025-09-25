// lib/api/resolvers/calculateSafetyStockLevel.ts
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

// lib/api/resolvers/calculateSafetyStockLevel.ts
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
    WITH DemandVariability AS (
      SELECT
        part_id,
        STDDEV_POP(monthly_quantity) AS demand_stddev
      FROM (
        SELECT
          part_id,
          DATE_TRUNC('month', CAST(order_date AS DATE)) AS order_month,
          SUM(quantity_ordered) AS monthly_quantity
        FROM Orders
        GROUP BY part_id, DATE_TRUNC('month', CAST(order_date AS DATE))
      ) subquery
      GROUP BY part_id
    ), LeadTimeStats AS (
      SELECT
        o.part_id,
        AVG(CAST(s.shipment_date AS DATE) - CAST(o.order_date AS DATE)) AS avg_lead_time
      FROM Orders o
      JOIN Shipments s ON o.part_id = s.part_id AND CAST(s.shipment_date AS DATE) >= CAST(o.order_date AS DATE)
      GROUP BY o.part_id
    )
    SELECT
      p.part_name,
      dv.demand_stddev,
      lts.avg_lead_time,
      ROUND(dv.demand_stddev * SQRT(lts.avg_lead_time), 2) AS safety_stock_level
    FROM DemandVariability dv
    JOIN LeadTimeStats lts ON dv.part_id = lts.part_id
    JOIN Parts p ON dv.part_id = p.part_id;
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
    demandStddev: row.demand_stddev,
    avgLeadTime: row.avg_lead_time,
    safetyStockLevel: row.safety_stock_level
  }));
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY2FsY3VsYXRlU2FmZXR5U3RvY2tMZXZlbC50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksU0FBUzs7O0FDRHJCLFNBQWtCLFlBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU8sS0FBSztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQSxFQUFFLFdBQVcsUUFBUSxNQUFNLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0Y7OztBRHZDTyxTQUFTLFFBQVEsS0FBYztBQUNwQyxRQUFNLFNBQVUsSUFBSSxTQUFvQztBQUV4RCxNQUFJLENBQUMsUUFBUTtBQUNYLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFXO0FBQUEsSUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBK0JGO0FBQ0Y7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxNQUFJLElBQUksT0FBTztBQUNiLHNCQUFrQjtBQUFBLE1BQ2hCLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDeEIsV0FBVyxJQUFJLE1BQU07QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksQ0FBQyxJQUFJLFFBQVE7QUFDZixzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxhQUFpQixpQkFBYSxJQUFJLE1BQU07QUFFOUMsTUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxXQUFXLEdBQUc7QUFDL0Qsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sU0FBUyxXQUFXLENBQUM7QUFPM0IsUUFBTSxlQUF1QyxPQUFPLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDaEUsVUFBVSxJQUFJO0FBQUEsSUFDZCxjQUFjLElBQUk7QUFBQSxJQUNsQixhQUFhLElBQUk7QUFBQSxJQUNqQixrQkFBa0IsSUFBSTtBQUFBLEVBQ3hCLEVBQUU7QUFFRixTQUFPO0FBQ1Q7IiwKICAibmFtZXMiOiBbXQp9Cg==
