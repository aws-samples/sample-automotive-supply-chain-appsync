import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class GmraDynamoDBTables extends Construct {
  public readonly assessmentsTable: dynamodb.Table;
  public readonly templatesTable: dynamodb.Table;
  public readonly byAssessmentOwnerIdIndex: string = "byAssessmentOwnerId";
  public readonly byTemplateOwnerIdIndex: string = "byTemplateOwnerId";

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const assessmentsTable = new dynamodb.Table(this, "assessmentsTable", {
      partitionKey: {
        name: "assessmentId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "ownerId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    assessmentsTable.addGlobalSecondaryIndex({
      indexName: this.byAssessmentOwnerIdIndex,
      partitionKey: { name: "ownerId", type: dynamodb.AttributeType.STRING },
    });

    const templatesTable = new dynamodb.Table(this, "templatesTable", {
      partitionKey: {
        name: "templateId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "ownerId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    templatesTable.addGlobalSecondaryIndex({
      indexName: this.byTemplateOwnerIdIndex,
      partitionKey: { name: "ownerId", type: dynamodb.AttributeType.STRING },
    });

    this.assessmentsTable = assessmentsTable;
    this.templatesTable = templatesTable;
  }
}
