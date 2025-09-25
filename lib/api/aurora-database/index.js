"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuroraMySQLTable = void 0;
const cdk = require("aws-cdk-lib");
const constructs_1 = require("constructs");
const rds = require("aws-cdk-lib/aws-rds");
const cdk_nag_1 = require("cdk-nag");
class AuroraMySQLTable extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const databaseSecret = new rds.DatabaseSecret(this, "DatabaseSecret", {
            username: "postgres",
        });
        const defaultDatabaseName = "demo_database";
        const cluster = new rds.DatabaseCluster(this, "Database", {
            engine: rds.DatabaseClusterEngine.auroraPostgres({
                version: rds.AuroraPostgresEngineVersion.VER_16_2,
            }),
            writer: rds.ClusterInstance.serverlessV2("writer", {
                autoMinorVersionUpgrade: true,
            }),
            readers: [
                rds.ClusterInstance.serverlessV2("reader1", {
                    autoMinorVersionUpgrade: true,
                }),
                rds.ClusterInstance.serverlessV2("reader2", {
                    autoMinorVersionUpgrade: true,
                }),
            ],
            vpc: props.vpc,
            credentials: rds.Credentials.fromSecret(databaseSecret),
            defaultDatabaseName: defaultDatabaseName,
            enableDataApi: true, // This is required for accessing data from the serverless cluster
            iamAuthentication: true, // This is required for accessing data from the serverless cluster
        });
        this.auroraCluster = cluster;
        this.databaseSecret = databaseSecret;
        this.defaultDatabaseName = defaultDatabaseName;
        new cdk.CfnOutput(this, "Database Secret ARN", {
            value: databaseSecret.secretArn,
        });
        new cdk.CfnOutput(this, "Name of the Default Database", {
            value: defaultDatabaseName,
        });
        // Add CDK Nag suppression for deletion protection
        cdk_nag_1.NagSuppressions.addResourceSuppressions(cluster, [
            {
                id: "AwsSolutions-RDS10",
                reason: "This code is a sample and should allow removal of the database",
            },
            {
                id: "AwsSolutions-RDS11",
                reason: "Not connection expetected via TCP port",
            },
            {
                id: "AwsSolutions-RDS2",
                reason: "Not encryption needed for a demo",
            },
        ]);
        cdk_nag_1.NagSuppressions.addResourceSuppressions(databaseSecret, [
            {
                id: "AwsSolutions-SMG4",
                reason: "Not rotation resources needed for a demo",
            },
        ]);
    }
}
exports.AuroraMySQLTable = AuroraMySQLTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsMkNBQXVDO0FBQ3ZDLDJDQUEyQztBQUUzQyxxQ0FBMEM7QUFNMUMsTUFBYSxnQkFBaUIsU0FBUSxzQkFBUztJQUs3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXVCO1FBQy9ELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNwRSxRQUFRLEVBQUUsVUFBVTtTQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLG1CQUFtQixHQUFHLGVBQWUsQ0FBQztRQUU1QyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUN4RCxNQUFNLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQztnQkFDL0MsT0FBTyxFQUFFLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRO2FBQ2xELENBQUM7WUFDRixNQUFNLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO2dCQUNqRCx1QkFBdUIsRUFBRSxJQUFJO2FBQzlCLENBQUM7WUFDRixPQUFPLEVBQUU7Z0JBQ1AsR0FBRyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFO29CQUMxQyx1QkFBdUIsRUFBRSxJQUFJO2lCQUM5QixDQUFDO2dCQUNGLEdBQUcsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRTtvQkFDMUMsdUJBQXVCLEVBQUUsSUFBSTtpQkFDOUIsQ0FBQzthQUNIO1lBQ0QsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQztZQUN2RCxtQkFBbUIsRUFBRSxtQkFBbUI7WUFDeEMsYUFBYSxFQUFFLElBQUksRUFBRSxrRUFBa0U7WUFDdkYsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGtFQUFrRTtTQUM1RixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFFL0MsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUM3QyxLQUFLLEVBQUUsY0FBYyxDQUFDLFNBQVM7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSw4QkFBOEIsRUFBRTtZQUN0RCxLQUFLLEVBQUUsbUJBQW1CO1NBQzNCLENBQUMsQ0FBQztRQUVILGtEQUFrRDtRQUNsRCx5QkFBZSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRTtZQUMvQztnQkFDRSxFQUFFLEVBQUUsb0JBQW9CO2dCQUN4QixNQUFNLEVBQ0osZ0VBQWdFO2FBQ25FO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLG9CQUFvQjtnQkFDeEIsTUFBTSxFQUFFLHdDQUF3QzthQUNqRDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxtQkFBbUI7Z0JBQ3ZCLE1BQU0sRUFBRSxrQ0FBa0M7YUFDM0M7U0FDRixDQUFDLENBQUM7UUFFSCx5QkFBZSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRTtZQUN0RDtnQkFDRSxFQUFFLEVBQUUsbUJBQW1CO2dCQUN2QixNQUFNLEVBQUUsMENBQTBDO2FBQ25EO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBeEVELDRDQXdFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgKiBhcyByZHMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1yZHNcIjtcbmltcG9ydCB7IFZwYyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWMyXCI7XG5pbXBvcnQgeyBOYWdTdXBwcmVzc2lvbnMgfSBmcm9tIFwiY2RrLW5hZ1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEF1cm9yYU15U1FMUHJvcHMge1xuICByZWFkb25seSB2cGM6IFZwYztcbn1cblxuZXhwb3J0IGNsYXNzIEF1cm9yYU15U1FMVGFibGUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgYXVyb3JhQ2x1c3RlcjogcmRzLkRhdGFiYXNlQ2x1c3RlcjtcbiAgcHVibGljIHJlYWRvbmx5IGRhdGFiYXNlU2VjcmV0OiByZHMuRGF0YWJhc2VTZWNyZXQ7XG4gIHB1YmxpYyByZWFkb25seSBkZWZhdWx0RGF0YWJhc2VOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEF1cm9yYU15U1FMUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgZGF0YWJhc2VTZWNyZXQgPSBuZXcgcmRzLkRhdGFiYXNlU2VjcmV0KHRoaXMsIFwiRGF0YWJhc2VTZWNyZXRcIiwge1xuICAgICAgdXNlcm5hbWU6IFwicG9zdGdyZXNcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlZmF1bHREYXRhYmFzZU5hbWUgPSBcImRlbW9fZGF0YWJhc2VcIjtcblxuICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgcmRzLkRhdGFiYXNlQ2x1c3Rlcih0aGlzLCBcIkRhdGFiYXNlXCIsIHtcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlQ2x1c3RlckVuZ2luZS5hdXJvcmFQb3N0Z3Jlcyh7XG4gICAgICAgIHZlcnNpb246IHJkcy5BdXJvcmFQb3N0Z3Jlc0VuZ2luZVZlcnNpb24uVkVSXzE2XzIsXG4gICAgICB9KSxcbiAgICAgIHdyaXRlcjogcmRzLkNsdXN0ZXJJbnN0YW5jZS5zZXJ2ZXJsZXNzVjIoXCJ3cml0ZXJcIiwge1xuICAgICAgICBhdXRvTWlub3JWZXJzaW9uVXBncmFkZTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgcmVhZGVyczogW1xuICAgICAgICByZHMuQ2x1c3Rlckluc3RhbmNlLnNlcnZlcmxlc3NWMihcInJlYWRlcjFcIiwge1xuICAgICAgICAgIGF1dG9NaW5vclZlcnNpb25VcGdyYWRlOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICAgcmRzLkNsdXN0ZXJJbnN0YW5jZS5zZXJ2ZXJsZXNzVjIoXCJyZWFkZXIyXCIsIHtcbiAgICAgICAgICBhdXRvTWlub3JWZXJzaW9uVXBncmFkZTogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICBjcmVkZW50aWFsczogcmRzLkNyZWRlbnRpYWxzLmZyb21TZWNyZXQoZGF0YWJhc2VTZWNyZXQpLFxuICAgICAgZGVmYXVsdERhdGFiYXNlTmFtZTogZGVmYXVsdERhdGFiYXNlTmFtZSxcbiAgICAgIGVuYWJsZURhdGFBcGk6IHRydWUsIC8vIFRoaXMgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2luZyBkYXRhIGZyb20gdGhlIHNlcnZlcmxlc3MgY2x1c3RlclxuICAgICAgaWFtQXV0aGVudGljYXRpb246IHRydWUsIC8vIFRoaXMgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2luZyBkYXRhIGZyb20gdGhlIHNlcnZlcmxlc3MgY2x1c3RlclxuICAgIH0pO1xuXG4gICAgdGhpcy5hdXJvcmFDbHVzdGVyID0gY2x1c3RlcjtcbiAgICB0aGlzLmRhdGFiYXNlU2VjcmV0ID0gZGF0YWJhc2VTZWNyZXQ7XG4gICAgdGhpcy5kZWZhdWx0RGF0YWJhc2VOYW1lID0gZGVmYXVsdERhdGFiYXNlTmFtZTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiRGF0YWJhc2UgU2VjcmV0IEFSTlwiLCB7XG4gICAgICB2YWx1ZTogZGF0YWJhc2VTZWNyZXQuc2VjcmV0QXJuLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJOYW1lIG9mIHRoZSBEZWZhdWx0IERhdGFiYXNlXCIsIHtcbiAgICAgIHZhbHVlOiBkZWZhdWx0RGF0YWJhc2VOYW1lLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIENESyBOYWcgc3VwcHJlc3Npb24gZm9yIGRlbGV0aW9uIHByb3RlY3Rpb25cbiAgICBOYWdTdXBwcmVzc2lvbnMuYWRkUmVzb3VyY2VTdXBwcmVzc2lvbnMoY2x1c3RlciwgW1xuICAgICAge1xuICAgICAgICBpZDogXCJBd3NTb2x1dGlvbnMtUkRTMTBcIixcbiAgICAgICAgcmVhc29uOlxuICAgICAgICAgIFwiVGhpcyBjb2RlIGlzIGEgc2FtcGxlIGFuZCBzaG91bGQgYWxsb3cgcmVtb3ZhbCBvZiB0aGUgZGF0YWJhc2VcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIkF3c1NvbHV0aW9ucy1SRFMxMVwiLFxuICAgICAgICByZWFzb246IFwiTm90IGNvbm5lY3Rpb24gZXhwZXRlY3RlZCB2aWEgVENQIHBvcnRcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIkF3c1NvbHV0aW9ucy1SRFMyXCIsXG4gICAgICAgIHJlYXNvbjogXCJOb3QgZW5jcnlwdGlvbiBuZWVkZWQgZm9yIGEgZGVtb1wiLFxuICAgICAgfSxcbiAgICBdKTtcblxuICAgIE5hZ1N1cHByZXNzaW9ucy5hZGRSZXNvdXJjZVN1cHByZXNzaW9ucyhkYXRhYmFzZVNlY3JldCwgW1xuICAgICAge1xuICAgICAgICBpZDogXCJBd3NTb2x1dGlvbnMtU01HNFwiLFxuICAgICAgICByZWFzb246IFwiTm90IHJvdGF0aW9uIHJlc291cmNlcyBuZWVkZWQgZm9yIGEgZGVtb1wiLFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxufVxuIl19