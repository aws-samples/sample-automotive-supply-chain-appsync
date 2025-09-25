import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { SystemConfig } from "./types";
export interface SharedProps {
    readonly config: SystemConfig;
}
export declare class Shared extends Construct {
    readonly vpc: ec2.Vpc;
    readonly configParameter: ssm.StringParameter;
    readonly xOriginVerifySecret: secretsmanager.Secret;
    readonly apiKeysSecret: secretsmanager.Secret;
    readonly s3vpcEndpoint: ec2.InterfaceVpcEndpoint;
    constructor(scope: Construct, id: string, props: SharedProps);
}
