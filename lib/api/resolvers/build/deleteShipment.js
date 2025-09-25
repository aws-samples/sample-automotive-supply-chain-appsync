// lib/api/resolvers/deleteShipment.ts
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

// lib/api/resolvers/deleteShipment.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  const shipmentId = ctx.args.shipmentId;
  if (!shipmentId) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.remove({
      table: "shipments",
      where: { shipment_id: { eq: shipmentId } },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZGVsZXRlU2hpcG1lbnQudHMiLCAiLi4vLi4vdXRpbHMvQXBwU3luY0Vycm9ycy50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxZQUFZLFNBQVM7OztBQ0RyQixTQUFrQixZQUFZO0FBeUJ2QixTQUFTLGdCQUFnQixPQUFxQztBQUNuRSxRQUFNLEVBQUUsV0FBVyxjQUFjLFdBQVcsUUFBUSxJQUFJO0FBRXhELFVBQVEsTUFBTTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLFFBQVE7QUFBQSxJQUMxQixpQkFBaUIsRUFBRSxHQUFHLFFBQVEsU0FBUztBQUFBLEVBQ3pDLENBQUM7QUFDSDtBQUVPLFNBQVMsa0JBQWtCLE9BQXNDO0FBQ3RFLFFBQU0sRUFBRSxjQUFjLFdBQVcsU0FBUyxZQUFZLEtBQUssSUFBSTtBQUUvRCxrQkFBZ0IsS0FBSztBQUVyQixTQUFPLEtBQUs7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsRUFBRSxXQUFXLFFBQVEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGOzs7QUR0Q08sU0FBUyxRQUFRLEtBQWM7QUFDcEMsUUFBTSxTQUFVLElBQUksU0FBb0M7QUFFeEQsTUFBSSxDQUFDLFFBQVE7QUFDWCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxhQUFhLElBQUksS0FBSztBQUU1QixNQUFJLENBQUMsWUFBWTtBQUNmLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFXO0FBQUEsSUFDTCxXQUFPO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxPQUFPLEVBQUUsYUFBYSxFQUFFLElBQUksV0FBVyxFQUFFO0FBQUEsTUFDekMsV0FBVztBQUFBLFFBQ1Q7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsTUFBSSxJQUFJLE9BQU87QUFDYixzQkFBa0I7QUFBQSxNQUNoQixjQUFjLElBQUksTUFBTTtBQUFBLE1BQ3hCLFdBQVcsSUFBSSxNQUFNO0FBQUEsTUFDckIsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxNQUFJLENBQUMsSUFBSSxRQUFRO0FBQ2Ysc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sYUFBaUIsaUJBQWEsSUFBSSxNQUFNO0FBRTlDLE1BQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssV0FBVyxDQUFDLEVBQUUsV0FBVyxHQUFHO0FBQy9ELHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLFNBQVMsV0FBVyxDQUFDLEVBQUUsQ0FBQztBQUU5QixRQUFNLGVBQXlCO0FBQUEsSUFDN0IsWUFBWSxPQUFPO0FBQUEsSUFDbkIsUUFBUSxPQUFPO0FBQUEsSUFDZixjQUFjLE9BQU87QUFBQSxJQUNyQixpQkFBaUIsT0FBTztBQUFBLEVBQzFCO0FBRUEsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogW10KfQo=
