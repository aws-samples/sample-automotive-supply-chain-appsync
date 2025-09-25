export declare enum RESOLVER_FUNCTIONS_TYPE {
    REQUEST = "request",
    RESPONSE = "response"
}
export interface evaluateResolverCodeInput {
    filePath: string;
    context: object;
    functionToEvaluate: RESOLVER_FUNCTIONS_TYPE;
}
export declare function evaluateResolverCode(param: evaluateResolverCodeInput): Promise<import("@aws-sdk/client-appsync").EvaluateCodeCommandOutput>;
