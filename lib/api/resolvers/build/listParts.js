// lib/api/resolvers/listParts.ts
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

// lib/api/resolvers/listParts.ts
function request(ctx) {
  const userId = ctx.identity.username;
  if (!userId) {
    raiseAppSyncError({
      errorMessage: "User ID not found in the authorizer context." /* USER_NOT_FOUND */,
      errorCode: "UnauthorizedError" /* UNAUTHORIZED */,
      context: ctx
    });
  }
  return rds.createPgStatement(rds.select({ table: "parts" }));
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
    partId: row.part_id,
    partCategory: row.part_category,
    partName: row.part_name,
    unitPrice: row.unit_price
  }));
  return parsedResult;
}
export {
  request,
  response
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbGlzdFBhcnRzLnRzIiwgIi4uLy4uL3V0aWxzL0FwcFN5bmNFcnJvcnMudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsWUFBWSxTQUFTOzs7QUNEckIsU0FBa0IsWUFBWTtBQXlCdkIsU0FBUyxnQkFBZ0IsT0FBcUM7QUFDbkUsUUFBTSxFQUFFLFdBQVcsY0FBYyxXQUFXLFFBQVEsSUFBSTtBQUV4RCxVQUFRLE1BQU07QUFBQSxJQUNaO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLGtCQUFrQixRQUFRO0FBQUEsSUFDMUIsaUJBQWlCLEVBQUUsR0FBRyxRQUFRLFNBQVM7QUFBQSxFQUN6QyxDQUFDO0FBQ0g7QUFFTyxTQUFTLGtCQUFrQixPQUFzQztBQUN0RSxRQUFNLEVBQUUsY0FBYyxXQUFXLFNBQVMsWUFBWSxLQUFLLElBQUk7QUFFL0Qsa0JBQWdCLEtBQUs7QUFFckIsU0FBTyxLQUFLO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBLEVBQUUsV0FBVyxRQUFRLE1BQU0sVUFBVSxRQUFRLFNBQVM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRjs7O0FEdENPLFNBQVMsUUFBUSxLQUFjO0FBQ3BDLFFBQU0sU0FBVSxJQUFJLFNBQW9DO0FBRXhELE1BQUksQ0FBQyxRQUFRO0FBQ1gsc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQVcsc0JBQXNCLFdBQU8sRUFBRSxPQUFPLFFBQVEsQ0FBQyxDQUFDO0FBQzdEO0FBRU8sU0FBUyxTQUFTLEtBQWM7QUFDckMsTUFBSSxJQUFJLE9BQU87QUFDYixzQkFBa0I7QUFBQSxNQUNoQixjQUFjLElBQUksTUFBTTtBQUFBLE1BQ3hCLFdBQVcsSUFBSSxNQUFNO0FBQUEsTUFDckIsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxNQUFJLENBQUMsSUFBSSxRQUFRO0FBQ2Ysc0JBQWtCO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUVBLFFBQU0sYUFBaUIsaUJBQWEsSUFBSSxNQUFNO0FBRTlDLE1BQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssV0FBVyxDQUFDLEVBQUUsV0FBVyxHQUFHO0FBQy9ELHNCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxRQUFNLFNBQVMsV0FBVyxDQUFDO0FBRTNCLFFBQU0sZUFBdUIsT0FBTyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ2hELFFBQVEsSUFBSTtBQUFBLElBQ1osY0FBYyxJQUFJO0FBQUEsSUFDbEIsVUFBVSxJQUFJO0FBQUEsSUFDZCxXQUFXLElBQUk7QUFBQSxFQUNqQixFQUFFO0FBRUYsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogW10KfQo=
