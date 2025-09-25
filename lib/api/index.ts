import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import { Shared } from "../shared";
import { SystemConfig } from "../shared/types";
import { GmraS3Buckets } from "./gmra-s3-buckets";
import { GmraDynamoDBTables } from "./gmra-dynamodb-tables";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { NagSuppressions } from "cdk-nag";
import { AuroraMySQLTable } from "./aurora-database";

enum ResolverType {
  DYNAMODB,
  AURORA,
}

enum GraphQLOperation {
  MUTATION = "Mutation",
  QUERY = "Query",
  SUBSCRIPTION = "Subscription",
}

export interface GmraApiProps {
  readonly shared: Shared;
  readonly config: SystemConfig;
  readonly userPool: cognito.UserPool;
}

export class GmraApi extends Construct {
  public readonly filesBucket: s3.Bucket;
  public readonly graphqlApi: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: GmraApiProps) {
    super(scope, id);

    const backendTables = new AuroraMySQLTable(this, "BackendTables", {
      vpc: props.shared.vpc,
    });
    const dynamoTables = new GmraDynamoDBTables(this, "DynamoTables");
    const chatBuckets = new GmraS3Buckets(this, "ChatBuckets");

    const loggingRole = new iam.Role(this, "apiLoggingRole", {
      assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      inlinePolicies: {
        loggingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["logs:*"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    const api = new appsync.GraphqlApi(this, "GmraApi", {
      name: "GmraGraphqlApi",
      definition: appsync.Definition.fromFile(
        path.join(__dirname, "schema/schema.graphql")
      ),
      authorizationConfig: {
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM,
          },
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: props.userPool,
            },
          },
        ],
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
        retention: RetentionDays.ONE_WEEK,
        role: loggingRole,
      },

      xrayEnabled: true,
      visibility: appsync.Visibility.GLOBAL,
    });

    // Create Data Sources
    const assessmentsDataSource = api.addRdsDataSource(
      "assessmentsDataSource",
      backendTables.auroraCluster,
      backendTables.databaseSecret,
      backendTables.defaultDatabaseName
    );

    const dynamoDataSource = api.addDynamoDbDataSource(
      "dynamoDataSource",
      dynamoTables.assessmentsTable
    );

    // Define resolvers for CRUD operations
    const dynamoDbResolverFunctions = [
      {
        name: "getAssessment",
        type: ResolverType.DYNAMODB,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "listAssessments",
        type: ResolverType.DYNAMODB,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "createAssessment",
        type: ResolverType.DYNAMODB,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "listParts",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "getPart",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "createPart",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "updatePart",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "deletePart",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "listOrders",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "getOrder",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "createOrder",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "updateOrder",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "deleteOrder",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "listShipments",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "getShipment",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "createShipment",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "updateShipment",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "deleteShipment",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.MUTATION,
      },
      {
        name: "calculateLeadTime",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "calculateBackOrderRate",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "calculateOrderFillRate",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      {
        name: "calculateSafetyStockLevel",
        type: ResolverType.AURORA,
        operation: GraphQLOperation.QUERY,
      },
      // "updateAssessment",
      // "deleteAssessment",
    ];

    dynamoDbResolverFunctions.forEach((resolver) => {
      const datasource =
        resolver.type === ResolverType.AURORA
          ? assessmentsDataSource
          : dynamoDataSource;

      // Validate resolver name to prevent path traversal
      const sanitizedResolverName = resolver.name.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );

      datasource.createResolver(resolver.name, {
        typeName: resolver.operation,
        fieldName: resolver.name,
        code: appsync.Code.fromAsset(
          path.join(__dirname, "resolvers/build", `${sanitizedResolverName}.js`)
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      });
    });

    // Prints out URL
    new cdk.CfnOutput(this, "GraphqlAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "Graphql-apiId", {
      value: api.apiId || "",
    });

    this.filesBucket = chatBuckets.filesBucket;
    this.graphqlApi = api;

    /**
     * CDK NAG suppression
     */
    NagSuppressions.addResourceSuppressions(loggingRole, [
      {
        id: "AwsSolutions-IAM5",
        reason:
          "Access to all log groups required for CloudWatch log group creation.",
      },
    ]);
  }
}
