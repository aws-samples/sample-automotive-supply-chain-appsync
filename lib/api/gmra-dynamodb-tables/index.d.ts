import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
export declare class GmraDynamoDBTables extends Construct {
    readonly assessmentsTable: dynamodb.Table;
    readonly templatesTable: dynamodb.Table;
    readonly byAssessmentOwnerIdIndex: string;
    readonly byTemplateOwnerIdIndex: string;
    constructor(scope: Construct, id: string);
}
