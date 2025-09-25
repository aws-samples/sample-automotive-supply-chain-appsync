import { Context } from "@aws-appsync/utils";
export declare enum ErrorTypes {
    VALIDATION = "ValidationError",
    UNAUTHORIZED = "UnauthorizedError",
    FORBIDDEN = "ForbiddenError",
    NOT_FOUND = "NotFoundError",
    INTERNAL = "InternalError"
}
export declare enum ErrorMessages {
    USER_NOT_FOUND = "User ID not found in the authorizer context.",
    INVALID_INPUT = "The provided input is invalid.",
    ACCESS_DENIED = "Access is denied.",
    RESOURCE_NOT_FOUND = "The requested resource could not be found.",
    INTERNAL_ERROR = "An unexpected error occurred."
}
export interface RaiseAppSyncErrorInput {
    errorMessage: string;
    errorCode: string;
    context: Context;
    errorInfo?: Record<string, unknown>;
}
export declare function logAppSyncError(input: RaiseAppSyncErrorInput): void;
export declare function raiseAppSyncError(input: RaiseAppSyncErrorInput): never;
