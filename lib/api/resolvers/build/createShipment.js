// lib/api/resolvers/createShipment.ts
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

// lib/api/resolvers/createShipment.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const { shipmentId, partId, shipmentDate, quantityShipped } = ctx.args.input;
  if (!shipmentId || !partId || !shipmentDate || quantityShipped === void 0) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.insert({
      table: "shipments",
      values: {
        shipment_id: shipmentId,
        part_id: partId,
        shipment_date: shipmentDate,
        quantity_shipped: quantityShipped
      },
      returning: [
        "shipment_id",
        "part_id",
        "shipment_date",
        "quantity_shipped"
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
    shipmentId: result.shipment_id,
    partId: result.part_id,
    shipmentDate: result.shipment_date,
    quantityShipped: result.quantity_shipped
  };
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vY3JlYXRlU2hpcG1lbnQudHMiLCAiLi4vLi4vdXRpbHMvQXBwU3luY0Vycm9ycy50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxZQUFZLFNBQVM7OztBQ0RyQixTQUFrQixZQUFZO0FBeUJ2QixTQUFTLGdCQUFnQixPQUFxQztBQUNuRSxRQUFNLEVBQUUsV0FBVyxjQUFjLFdBQVcsUUFBUSxJQUFJO0FBRXhELFVBQVEsTUFBTTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLFFBQVE7QUFBQSxJQUMxQixpQkFBaUIsRUFBRSxHQUFHLFFBQVEsU0FBUztBQUFBLEVBQ3pDLENBQUM7QUFDSDtBQUVPLFNBQVMsa0JBQWtCLE9BQXNDO0FBQ3RFLFFBQU0sRUFBRSxjQUFjLFdBQVcsU0FBUyxZQUFZLEtBQUssSUFBSTtBQUUvRCxrQkFBZ0IsS0FBSztBQUVyQixTQUFPLEtBQUs7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsRUFBRSxXQUFXLFFBQVEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGOzs7QUR0Q08sU0FBUyxRQUFRLEtBQWM7QUFDcEMsUUFBTSxTQUFVLElBQUksU0FBb0M7QUFFeEQsTUFBSSxDQUFDLFFBQVE7QUFDWCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQ0EsUUFBTSxFQUFFLFlBQVksUUFBUSxjQUFjLGdCQUFnQixJQUFJLElBQUksS0FBSztBQUV2RSxNQUNFLENBQUMsY0FDRCxDQUFDLFVBQ0QsQ0FBQyxnQkFDRCxvQkFBb0IsUUFDcEI7QUFDQSxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBVztBQUFBLElBQ0wsV0FBTztBQUFBLE1BQ1QsT0FBTztBQUFBLE1BQ1AsUUFBUTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2IsU0FBUztBQUFBLFFBQ1QsZUFBZTtBQUFBLFFBQ2Ysa0JBQWtCO0FBQUEsTUFDcEI7QUFBQSxNQUNBLFdBQVc7QUFBQSxRQUNUO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLE1BQUksSUFBSSxPQUFPO0FBQ2Isc0JBQWtCO0FBQUEsTUFDaEIsY0FBYyxJQUFJLE1BQU07QUFBQSxNQUN4QixXQUFXLElBQUksTUFBTTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsTUFBSSxDQUFDLElBQUksUUFBUTtBQUNmLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLGFBQWlCLGlCQUFhLElBQUksTUFBTTtBQUU5QyxNQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFdBQVcsR0FBRztBQUMvRCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxTQUFTLFdBQVcsQ0FBQyxFQUFFLENBQUM7QUFFOUIsUUFBTSxlQUF5QjtBQUFBLElBQzdCLFlBQVksT0FBTztBQUFBLElBQ25CLFFBQVEsT0FBTztBQUFBLElBQ2YsY0FBYyxPQUFPO0FBQUEsSUFDckIsaUJBQWlCLE9BQU87QUFBQSxFQUMxQjtBQUVBLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
