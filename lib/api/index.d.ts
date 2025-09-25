import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Shared } from "../shared";
import { SystemConfig } from "../shared/types";
import * as appsync from "aws-cdk-lib/aws-appsync";
export interface GmraApiProps {
    readonly shared: Shared;
    readonly config: SystemConfig;
    readonly userPool: cognito.UserPool;
}
export declare class GmraApi extends Construct {
    readonly filesBucket: s3.Bucket;
    readonly graphqlApi: appsync.GraphqlApi;
    constructor(scope: Construct, id: string, props: GmraApiProps);
}
