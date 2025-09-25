// lib/api/resolvers/updateShipment.ts
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

// lib/api/resolvers/updateShipment.ts
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
  if (!shipmentId) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  const updateValues = {};
  if (partId !== void 0) updateValues.part_id = partId;
  if (shipmentDate !== void 0) updateValues.shipment_date = shipmentDate;
  if (quantityShipped !== void 0)
    updateValues.quantity_shipped = quantityShipped;
  if (Object.keys(updateValues).length === 0) {
    raiseAppSyncError({
      errorMessage: "The provided input is invalid." /* INVALID_INPUT */,
      errorCode: "ValidationError" /* VALIDATION */,
      context: ctx
    });
  }
  return rds.createPgStatement(
    rds.update({
      table: "shipments",
      values: updateValues,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vdXBkYXRlU2hpcG1lbnQudHMiLCAiLi4vLi4vdXRpbHMvQXBwU3luY0Vycm9ycy50cyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxZQUFZLFNBQVM7OztBQ0RyQixTQUFrQixZQUFZO0FBeUJ2QixTQUFTLGdCQUFnQixPQUFxQztBQUNuRSxRQUFNLEVBQUUsV0FBVyxjQUFjLFdBQVcsUUFBUSxJQUFJO0FBRXhELFVBQVEsTUFBTTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0Esa0JBQWtCLFFBQVE7QUFBQSxJQUMxQixpQkFBaUIsRUFBRSxHQUFHLFFBQVEsU0FBUztBQUFBLEVBQ3pDLENBQUM7QUFDSDtBQUVPLFNBQVMsa0JBQWtCLE9BQXNDO0FBQ3RFLFFBQU0sRUFBRSxjQUFjLFdBQVcsU0FBUyxZQUFZLEtBQUssSUFBSTtBQUUvRCxrQkFBZ0IsS0FBSztBQUVyQixTQUFPLEtBQUs7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsRUFBRSxXQUFXLFFBQVEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGOzs7QUR0Q08sU0FBUyxRQUFRLEtBQWM7QUFDcEMsUUFBTSxTQUFVLElBQUksU0FBb0M7QUFFeEQsTUFBSSxDQUFDLFFBQVE7QUFDWCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxFQUFFLFlBQVksUUFBUSxjQUFjLGdCQUFnQixJQUFJLElBQUksS0FBSztBQUV2RSxNQUFJLENBQUMsWUFBWTtBQUNmLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLGVBQW9CLENBQUM7QUFDM0IsTUFBSSxXQUFXLE9BQVcsY0FBYSxVQUFVO0FBQ2pELE1BQUksaUJBQWlCLE9BQVcsY0FBYSxnQkFBZ0I7QUFDN0QsTUFBSSxvQkFBb0I7QUFDdEIsaUJBQWEsbUJBQW1CO0FBRWxDLE1BQUksT0FBTyxLQUFLLFlBQVksRUFBRSxXQUFXLEdBQUc7QUFDMUMsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQVc7QUFBQSxJQUNMLFdBQU87QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLE9BQU8sRUFBRSxhQUFhLEVBQUUsSUFBSSxXQUFXLEVBQUU7QUFBQSxNQUN6QyxXQUFXO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFTyxTQUFTLFNBQVMsS0FBYztBQUNyQyxNQUFJLElBQUksT0FBTztBQUNiLHNCQUFrQjtBQUFBLE1BQ2hCLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDeEIsV0FBVyxJQUFJLE1BQU07QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksQ0FBQyxJQUFJLFFBQVE7QUFDZixzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxhQUFpQixpQkFBYSxJQUFJLE1BQU07QUFFOUMsTUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxXQUFXLEdBQUc7QUFDL0Qsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sU0FBUyxXQUFXLENBQUMsRUFBRSxDQUFDO0FBRTlCLFFBQU0sZUFBeUI7QUFBQSxJQUM3QixZQUFZLE9BQU87QUFBQSxJQUNuQixRQUFRLE9BQU87QUFBQSxJQUNmLGNBQWMsT0FBTztBQUFBLElBQ3JCLGlCQUFpQixPQUFPO0FBQUEsRUFDMUI7QUFFQSxTQUFPO0FBQ1Q7IiwKICAibmFtZXMiOiBbXQp9Cg==
