import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import { Vpc } from "aws-cdk-lib/aws-ec2";
export interface AuroraMySQLProps {
    readonly vpc: Vpc;
}
export declare class AuroraMySQLTable extends Construct {
    readonly auroraCluster: rds.DatabaseCluster;
    readonly databaseSecret: rds.DatabaseSecret;
    readonly defaultDatabaseName: string;
    constructor(scope: Construct, id: string, props: AuroraMySQLProps);
}
