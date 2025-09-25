"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmraApi = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const cdk = require("aws-cdk-lib");
const path = require("path");
const constructs_1 = require("constructs");
const gmra_s3_buckets_1 = require("./gmra-s3-buckets");
const gmra_dynamodb_tables_1 = require("./gmra-dynamodb-tables");
const appsync = require("aws-cdk-lib/aws-appsync");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const cdk_nag_1 = require("cdk-nag");
const aurora_database_1 = require("./aurora-database");
var ResolverType;
(function (ResolverType) {
    ResolverType[ResolverType["DYNAMODB"] = 0] = "DYNAMODB";
    ResolverType[ResolverType["AURORA"] = 1] = "AURORA";
})(ResolverType || (ResolverType = {}));
var GraphQLOperation;
(function (GraphQLOperation) {
    GraphQLOperation["MUTATION"] = "Mutation";
    GraphQLOperation["QUERY"] = "Query";
    GraphQLOperation["SUBSCRIPTION"] = "Subscription";
})(GraphQLOperation || (GraphQLOperation = {}));
class GmraApi extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const backendTables = new aurora_database_1.AuroraMySQLTable(this, "BackendTables", {
            vpc: props.shared.vpc,
        });
        const dynamoTables = new gmra_dynamodb_tables_1.GmraDynamoDBTables(this, "DynamoTables");
        const chatBuckets = new gmra_s3_buckets_1.GmraS3Buckets(this, "ChatBuckets");
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
            definition: appsync.Definition.fromFile(path.join(__dirname, "schema/schema.graphql")),
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
                retention: aws_logs_1.RetentionDays.ONE_WEEK,
                role: loggingRole,
            },
            xrayEnabled: true,
            visibility: appsync.Visibility.GLOBAL,
        });
        // Create Data Sources
        const assessmentsDataSource = api.addRdsDataSource("assessmentsDataSource", backendTables.auroraCluster, backendTables.databaseSecret, backendTables.defaultDatabaseName);
        const dynamoDataSource = api.addDynamoDbDataSource("dynamoDataSource", dynamoTables.assessmentsTable);
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
            const datasource = resolver.type === ResolverType.AURORA
                ? assessmentsDataSource
                : dynamoDataSource;
            // Validate resolver name to prevent path traversal
            const sanitizedResolverName = resolver.name.replace(/[^a-zA-Z0-9_-]/g, "");
            datasource.createResolver(resolver.name, {
                typeName: resolver.operation,
                fieldName: resolver.name,
                code: appsync.Code.fromAsset(path.join(__dirname, "resolvers/build", `${sanitizedResolverName}.js`)),
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
        cdk_nag_1.NagSuppressions.addResourceSuppressions(loggingRole, [
            {
                id: "AwsSolutions-IAM5",
                reason: "Access to all log groups required for CloudWatch log group creation.",
            },
        ]);
    }
}
exports.GmraApi = GmraApi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwyQ0FBMkM7QUFDM0MsbUNBQW1DO0FBQ25DLDZCQUE2QjtBQUM3QiwyQ0FBdUM7QUFHdkMsdURBQWtEO0FBQ2xELGlFQUE0RDtBQUM1RCxtREFBbUQ7QUFDbkQsbURBQXFEO0FBQ3JELHFDQUEwQztBQUMxQyx1REFBcUQ7QUFFckQsSUFBSyxZQUdKO0FBSEQsV0FBSyxZQUFZO0lBQ2YsdURBQVEsQ0FBQTtJQUNSLG1EQUFNLENBQUE7QUFDUixDQUFDLEVBSEksWUFBWSxLQUFaLFlBQVksUUFHaEI7QUFFRCxJQUFLLGdCQUlKO0FBSkQsV0FBSyxnQkFBZ0I7SUFDbkIseUNBQXFCLENBQUE7SUFDckIsbUNBQWUsQ0FBQTtJQUNmLGlEQUE2QixDQUFBO0FBQy9CLENBQUMsRUFKSSxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBSXBCO0FBUUQsTUFBYSxPQUFRLFNBQVEsc0JBQVM7SUFJcEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFtQjtRQUMzRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sYUFBYSxHQUFHLElBQUksa0NBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNoRSxHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHO1NBQ3RCLENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLElBQUkseUNBQWtCLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sV0FBVyxHQUFHLElBQUksK0JBQWEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN2RCxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdC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LFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDdkMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxTQUFTO2dCQUM1QixTQUFTLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxxQkFBcUIsS0FBSyxDQUFDLENBQ3ZFO2dCQUNELE9BQU8sRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVE7YUFDMUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxpQkFBaUI7UUFDakIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQ3RCLENBQUMsQ0FBQztRQUVILHlEQUF5RDtRQUN6RCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFO1NBQ3ZCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUV0Qjs7V0FFRztRQUNILHlCQUFlLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFO1lBQ25EO2dCQUNFLEVBQUUsRUFBRSxtQkFBbUI7Z0JBQ3ZCLE1BQU0sRUFDSixzRUFBc0U7YUFDekU7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2T0QsMEJBdU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY29nbml0byBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZ25pdG9cIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IFNoYXJlZCB9IGZyb20gXCIuLi9zaGFyZWRcIjtcbmltcG9ydCB7IFN5c3RlbUNvbmZpZyB9IGZyb20gXCIuLi9zaGFyZWQvdHlwZXNcIjtcbmltcG9ydCB7IEdtcmFTM0J1Y2tldHMgfSBmcm9tIFwiLi9nbXJhLXMzLWJ1Y2tldHNcIjtcbmltcG9ydCB7IEdtcmFEeW5hbW9EQlRhYmxlcyB9IGZyb20gXCIuL2dtcmEtZHluYW1vZGItdGFibGVzXCI7XG5pbXBvcnQgKiBhcyBhcHBzeW5jIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBwc3luY1wiO1xuaW1wb3J0IHsgUmV0ZW50aW9uRGF5cyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0IHsgTmFnU3VwcHJlc3Npb25zIH0gZnJvbSBcImNkay1uYWdcIjtcbmltcG9ydCB7IEF1cm9yYU15U1FMVGFibGUgfSBmcm9tIFwiLi9hdXJvcmEtZGF0YWJhc2VcIjtcblxuZW51bSBSZXNvbHZlclR5cGUge1xuICBEWU5BTU9EQixcbiAgQVVST1JBLFxufVxuXG5lbnVtIEdyYXBoUUxPcGVyYXRpb24ge1xuICBNVVRBVElPTiA9IFwiTXV0YXRpb25cIixcbiAgUVVFUlkgPSBcIlF1ZXJ5XCIsXG4gIFNVQlNDUklQVElPTiA9IFwiU3Vic2NyaXB0aW9uXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR21yYUFwaVByb3BzIHtcbiAgcmVhZG9ubHkgc2hhcmVkOiBTaGFyZWQ7XG4gIHJlYWRvbmx5IGNvbmZpZzogU3lzdGVtQ29uZmlnO1xuICByZWFkb25seSB1c2VyUG9vbDogY29nbml0by5Vc2VyUG9vbDtcbn1cblxuZXhwb3J0IGNsYXNzIEdtcmFBcGkgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZmlsZXNCdWNrZXQ6IHMzLkJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IGdyYXBocWxBcGk6IGFwcHN5bmMuR3JhcGhxbEFwaTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogR21yYUFwaVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IGJhY2tlbmRUYWJsZXMgPSBuZXcgQXVyb3JhTXlTUUxUYWJsZSh0aGlzLCBcIkJhY2tlbmRUYWJsZXNcIiwge1xuICAgICAgdnBjOiBwcm9wcy5zaGFyZWQudnBjLFxuICAgIH0pO1xuICAgIGNvbnN0IGR5bmFtb1RhYmxlcyA9IG5ldyBHbXJhRHluYW1vREJUYWJsZXModGhpcywgXCJEeW5hbW9UYWJsZXNcIik7XG4gICAgY29uc3QgY2hhdEJ1Y2tldHMgPSBuZXcgR21yYVMzQnVja2V0cyh0aGlzLCBcIkNoYXRCdWNrZXRzXCIpO1xuXG4gICAgY29uc3QgbG9nZ2luZ1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgXCJhcGlMb2dnaW5nUm9sZVwiLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImFwcHN5bmMuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIGxvZ2dpbmdQb2xpY3k6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJsb2dzOipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcHBzeW5jLkdyYXBocWxBcGkodGhpcywgXCJHbXJhQXBpXCIsIHtcbiAgICAgIG5hbWU6IFwiR21yYUdyYXBocWxBcGlcIixcbiAgICAgIGRlZmluaXRpb246IGFwcHN5bmMuRGVmaW5pdGlvbi5mcm9tRmlsZShcbiAgICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgXCJzY2hlbWEvc2NoZW1hLmdyYXBocWxcIilcbiAgICAgICksXG4gICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgIGFkZGl0aW9uYWxBdXRob3JpemF0aW9uTW9kZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBwc3luYy5BdXRob3JpemF0aW9uVHlwZS5JQU0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBwc3luYy5BdXRob3JpemF0aW9uVHlwZS5VU0VSX1BPT0wsXG4gICAgICAgICAgICB1c2VyUG9vbENvbmZpZzoge1xuICAgICAgICAgICAgICB1c2VyUG9vbDogcHJvcHMudXNlclBvb2wsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgbG9nQ29uZmlnOiB7XG4gICAgICAgIGZpZWxkTG9nTGV2ZWw6IGFwcHN5bmMuRmllbGRMb2dMZXZlbC5BTEwsXG4gICAgICAgIHJldGVudGlvbjogUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgICAgcm9sZTogbG9nZ2luZ1JvbGUsXG4gICAgICB9LFxuXG4gICAgICB4cmF5RW5hYmxlZDogdHJ1ZSxcbiAgICAgIHZpc2liaWxpdHk6IGFwcHN5bmMuVmlzaWJpbGl0eS5HTE9CQUwsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgRGF0YSBTb3VyY2VzXG4gICAgY29uc3QgYXNzZXNzbWVudHNEYXRhU291cmNlID0gYXBpLmFkZFJkc0RhdGFTb3VyY2UoXG4gICAgICBcImFzc2Vzc21lbnRzRGF0YVNvdXJjZVwiLFxuICAgICAgYmFja2VuZFRhYmxlcy5hdXJvcmFDbHVzdGVyLFxuICAgICAgYmFja2VuZFRhYmxlcy5kYXRhYmFzZVNlY3JldCxcbiAgICAgIGJhY2tlbmRUYWJsZXMuZGVmYXVsdERhdGFiYXNlTmFtZVxuICAgICk7XG5cbiAgICBjb25zdCBkeW5hbW9EYXRhU291cmNlID0gYXBpLmFkZER5bmFtb0RiRGF0YVNvdXJjZShcbiAgICAgIFwiZHluYW1vRGF0YVNvdXJjZVwiLFxuICAgICAgZHluYW1vVGFibGVzLmFzc2Vzc21lbnRzVGFibGVcbiAgICApO1xuXG4gICAgLy8gRGVmaW5lIHJlc29sdmVycyBmb3IgQ1JVRCBvcGVyYXRpb25zXG4gICAgY29uc3QgZHluYW1vRGJSZXNvbHZlckZ1bmN0aW9ucyA9IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJnZXRBc3Nlc3NtZW50XCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5EWU5BTU9EQixcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLlFVRVJZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJsaXN0QXNzZXNzbWVudHNcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkRZTkFNT0RCLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uUVVFUlksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcImNyZWF0ZUFzc2Vzc21lbnRcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkRZTkFNT0RCLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uTVVUQVRJT04sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcImxpc3RQYXJ0c1wiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uUVVFUlksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcImdldFBhcnRcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLlFVRVJZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJjcmVhdGVQYXJ0XCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5NVVRBVElPTixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwidXBkYXRlUGFydFwiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uTVVUQVRJT04sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcImRlbGV0ZVBhcnRcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLk1VVEFUSU9OLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJsaXN0T3JkZXJzXCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5RVUVSWSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiZ2V0T3JkZXJcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLlFVRVJZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJjcmVhdGVPcmRlclwiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uTVVUQVRJT04sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcInVwZGF0ZU9yZGVyXCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5NVVRBVElPTixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiZGVsZXRlT3JkZXJcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLk1VVEFUSU9OLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJsaXN0U2hpcG1lbnRzXCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5RVUVSWSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiZ2V0U2hpcG1lbnRcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLlFVRVJZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJjcmVhdGVTaGlwbWVudFwiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uTVVUQVRJT04sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcInVwZGF0ZVNoaXBtZW50XCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5NVVRBVElPTixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiZGVsZXRlU2hpcG1lbnRcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLk1VVEFUSU9OLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJjYWxjdWxhdGVMZWFkVGltZVwiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uUVVFUlksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiBcImNhbGN1bGF0ZUJhY2tPcmRlclJhdGVcIixcbiAgICAgICAgdHlwZTogUmVzb2x2ZXJUeXBlLkFVUk9SQSxcbiAgICAgICAgb3BlcmF0aW9uOiBHcmFwaFFMT3BlcmF0aW9uLlFVRVJZLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogXCJjYWxjdWxhdGVPcmRlckZpbGxSYXRlXCIsXG4gICAgICAgIHR5cGU6IFJlc29sdmVyVHlwZS5BVVJPUkEsXG4gICAgICAgIG9wZXJhdGlvbjogR3JhcGhRTE9wZXJhdGlvbi5RVUVSWSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiY2FsY3VsYXRlU2FmZXR5U3RvY2tMZXZlbFwiLFxuICAgICAgICB0eXBlOiBSZXNvbHZlclR5cGUuQVVST1JBLFxuICAgICAgICBvcGVyYXRpb246IEdyYXBoUUxPcGVyYXRpb24uUVVFUlksXG4gICAgICB9LFxuICAgICAgLy8gXCJ1cGRhdGVBc3Nlc3NtZW50XCIsXG4gICAgICAvLyBcImRlbGV0ZUFzc2Vzc21lbnRcIixcbiAgICBdO1xuXG4gICAgZHluYW1vRGJSZXNvbHZlckZ1bmN0aW9ucy5mb3JFYWNoKChyZXNvbHZlcikgPT4ge1xuICAgICAgY29uc3QgZGF0YXNvdXJjZSA9XG4gICAgICAgIHJlc29sdmVyLnR5cGUgPT09IFJlc29sdmVyVHlwZS5BVVJPUkFcbiAgICAgICAgICA/IGFzc2Vzc21lbnRzRGF0YVNvdXJjZVxuICAgICAgICAgIDogZHluYW1vRGF0YVNvdXJjZTtcblxuICAgICAgLy8gVmFsaWRhdGUgcmVzb2x2ZXIgbmFtZSB0byBwcmV2ZW50IHBhdGggdHJhdmVyc2FsXG4gICAgICBjb25zdCBzYW5pdGl6ZWRSZXNvbHZlck5hbWUgPSByZXNvbHZlci5uYW1lLnJlcGxhY2UoXG4gICAgICAgIC9bXmEtekEtWjAtOV8tXS9nLFxuICAgICAgICBcIlwiXG4gICAgICApO1xuXG4gICAgICBkYXRhc291cmNlLmNyZWF0ZVJlc29sdmVyKHJlc29sdmVyLm5hbWUsIHtcbiAgICAgICAgdHlwZU5hbWU6IHJlc29sdmVyLm9wZXJhdGlvbixcbiAgICAgICAgZmllbGROYW1lOiByZXNvbHZlci5uYW1lLFxuICAgICAgICBjb2RlOiBhcHBzeW5jLkNvZGUuZnJvbUFzc2V0KFxuICAgICAgICAgIHBhdGguam9pbihfX2Rpcm5hbWUsIFwicmVzb2x2ZXJzL2J1aWxkXCIsIGAke3Nhbml0aXplZFJlc29sdmVyTmFtZX0uanNgKVxuICAgICAgICApLFxuICAgICAgICBydW50aW1lOiBhcHBzeW5jLkZ1bmN0aW9uUnVudGltZS5KU18xXzBfMCxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gUHJpbnRzIG91dCBVUkxcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIkdyYXBocWxBUElVUkxcIiwge1xuICAgICAgdmFsdWU6IGFwaS5ncmFwaHFsVXJsLFxuICAgIH0pO1xuXG4gICAgLy8gUHJpbnRzIG91dCB0aGUgQXBwU3luYyBHcmFwaFFMIEFQSSBrZXkgdG8gdGhlIHRlcm1pbmFsXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJHcmFwaHFsLWFwaUlkXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuYXBpSWQgfHwgXCJcIixcbiAgICB9KTtcblxuICAgIHRoaXMuZmlsZXNCdWNrZXQgPSBjaGF0QnVja2V0cy5maWxlc0J1Y2tldDtcbiAgICB0aGlzLmdyYXBocWxBcGkgPSBhcGk7XG5cbiAgICAvKipcbiAgICAgKiBDREsgTkFHIHN1cHByZXNzaW9uXG4gICAgICovXG4gICAgTmFnU3VwcHJlc3Npb25zLmFkZFJlc291cmNlU3VwcHJlc3Npb25zKGxvZ2dpbmdSb2xlLCBbXG4gICAgICB7XG4gICAgICAgIGlkOiBcIkF3c1NvbHV0aW9ucy1JQU01XCIsXG4gICAgICAgIHJlYXNvbjpcbiAgICAgICAgICBcIkFjY2VzcyB0byBhbGwgbG9nIGdyb3VwcyByZXF1aXJlZCBmb3IgQ2xvdWRXYXRjaCBsb2cgZ3JvdXAgY3JlYXRpb24uXCIsXG4gICAgICB9LFxuICAgIF0pO1xuICB9XG59XG4iXX0=