import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SystemConfig } from "./shared/types";
export interface GmraStackProps extends cdk.StackProps {
    readonly config: SystemConfig;
}
export declare class GMRAStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GmraStackProps);
}
