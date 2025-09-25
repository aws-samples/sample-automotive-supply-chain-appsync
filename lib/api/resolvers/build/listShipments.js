// lib/api/resolvers/listShipments.ts
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

// lib/api/resolvers/listShipments.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  return rds.createPgStatement(rds.select({ table: "shipments" }));
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
    shipmentId: row.shipment_id,
    partId: row.part_id,
    shipmentDate: row.shipment_date,
    quantityShipped: row.quantity_shipped
  }));
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGlzdFNoaXBtZW50cy50cyIsICIuLi8uLi91dGlscy9BcHBTeW5jRXJyb3JzLnRzIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksU0FBUzs7O0FDRHJCLFNBQWtCLFlBQVk7QUF5QnZCLFNBQVMsZ0JBQWdCLE9BQXFDO0FBQ25FLFFBQU0sRUFBRSxXQUFXLGNBQWMsV0FBVyxRQUFRLElBQUk7QUFFeEQsVUFBUSxNQUFNO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsUUFBUTtBQUFBLElBQzFCLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxTQUFTO0FBQUEsRUFDekMsQ0FBQztBQUNIO0FBRU8sU0FBUyxrQkFBa0IsT0FBc0M7QUFDdEUsUUFBTSxFQUFFLGNBQWMsV0FBVyxTQUFTLFlBQVksS0FBSyxJQUFJO0FBRS9ELGtCQUFnQixLQUFLO0FBRXJCLFNBQU8sS0FBSztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQSxFQUFFLFdBQVcsUUFBUSxNQUFNLFVBQVUsUUFBUSxTQUFTO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0Y7OztBRHRDTyxTQUFTLFFBQVEsS0FBYztBQUNwQyxRQUFNLFNBQVUsSUFBSSxTQUFvQztBQUV4RCxNQUFJLENBQUMsUUFBUTtBQUNYLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxTQUFXLHNCQUFzQixXQUFPLEVBQUUsT0FBTyxZQUFZLENBQUMsQ0FBQztBQUNqRTtBQUVPLFNBQVMsU0FBUyxLQUFjO0FBQ3JDLE1BQUksSUFBSSxPQUFPO0FBQ2Isc0JBQWtCO0FBQUEsTUFDaEIsY0FBYyxJQUFJLE1BQU07QUFBQSxNQUN4QixXQUFXLElBQUksTUFBTTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsTUFBSSxDQUFDLElBQUksUUFBUTtBQUNmLHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLGFBQWlCLGlCQUFhLElBQUksTUFBTTtBQUU5QyxNQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFdBQVcsR0FBRztBQUMvRCxzQkFBa0I7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBRUEsUUFBTSxTQUFTLFdBQVcsQ0FBQztBQUUzQixRQUFNLGVBQTJCLE9BQU8sSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNwRCxZQUFZLElBQUk7QUFBQSxJQUNoQixRQUFRLElBQUk7QUFBQSxJQUNaLGNBQWMsSUFBSTtBQUFBLElBQ2xCLGlCQUFpQixJQUFJO0FBQUEsRUFDdkIsRUFBRTtBQUVGLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
