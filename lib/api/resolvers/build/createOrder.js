// lib/api/resolvers/createOrder.ts
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

// lib/api/resolvers/createOrder.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const { orderId, partId, orderDate, quantityOrdered, fulfilled } = ctx.args.input;
  if (!orderId || !partId || !orderDate || !quantityOrdered === void 0 || fulfilled === void 0) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.insert({
      table: "orders",
      values: {
        order_id: orderId,
        part_id: partId,
        order_date: orderDate,
        quantity_ordered: quantityOrdered,
        fulfilled
      },
      returning: [
        "order_id",
        "part_id",
        "order_date",
        "quantity_ordered",
        "fulfilled"
      ]
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
    orderId: result.order_id,
    partId: result.part_id,
    orderDate: result.order_date,
    quantityOrdered: result.quantity_ordered,
    fulfilled: result.fulfilled
  };
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY3JlYXRlT3JkZXIudHMiLCAiLi4vLi4vdXRpbHMvQXBwU3luY0Vycm9ycy50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxZQUFZLFNBQVM7OztBQ0RyQixTQUFrQixZQUFZO0FBeUJ2QixTQUFTLGdCQUFnQixPQUFxQztBQUNuRSxRQUFNLEVBQUUsV0FBVyxjQUFjLFdBQVcsUUFBUSxJQUFJO0FBRXhELFVBQVEsTUFBTTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLFFBQVE7QUFBQSxJQUMxQixpQkFBaUIsRUFBRSxHQUFHLFFBQVEsU0FBUztBQUFBLEVBQ3pDLENBQUM7QUFDSDtBQUVPLFNBQVMsa0JBQWtCLE9BQXNDO0FBQ3RFLFFBQU0sRUFBRSxjQUFjLFdBQVcsU0FBUyxZQUFZLEtBQUssSUFBSTtBQUUvRCxrQkFBZ0IsS0FBSztBQUVyQixTQUFPLEtBQUs7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsRUFBRSxXQUFXLFFBQVEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGOzs7QUR0Q08sU0FBUyxRQUFRLEtBQWM7QUFDcEMsUUFBTSxTQUFVLElBQUksU0FBb0M7QUFFeEQsTUFBSSxDQUFDLFFBQVE7QUFDWCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQ0EsUUFBTSxFQUFFLFNBQVMsUUFBUSxXQUFXLGlCQUFpQixVQUFVLElBQzdELElBQUksS0FBSztBQUVYLE1BQ0UsQ0FBQyxXQUNELENBQUMsVUFDRCxDQUFDLGFBQ0QsQ0FBQyxvQkFBb0IsVUFDckIsY0FBYyxRQUNkO0FBQ0Esc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQVc7QUFBQSxJQUNMLFdBQU87QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULFlBQVk7QUFBQSxRQUNaLGtCQUFrQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLE1BQUksSUFBSSxPQUFPO0FBQ2Isc0JBQWtCO0FBQUEsTUFDaEIsY0FBYyxJQUFJLE1BQU07QUFBQSxNQUN4QixXQUFXLElBQUksTUFBTTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsTUFBSSxDQUFDLElBQUksUUFBUTtBQUNmLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLGFBQWlCLGlCQUFhLElBQUksTUFBTTtBQUU5QyxNQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFdBQVcsR0FBRztBQUMvRCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxTQUFTLFdBQVcsQ0FBQyxFQUFFLENBQUM7QUFFOUIsUUFBTSxlQUFzQjtBQUFBLElBQzFCLFNBQVMsT0FBTztBQUFBLElBQ2hCLFFBQVEsT0FBTztBQUFBLElBQ2YsV0FBVyxPQUFPO0FBQUEsSUFDbEIsaUJBQWlCLE9BQU87QUFBQSxJQUN4QixXQUFXLE9BQU87QUFBQSxFQUNwQjtBQUVBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
