import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { NagSuppressions } from "cdk-nag";

export interface AuroraMySQLProps {
  readonly vpc: Vpc;
}

export class AuroraMySQLTable extends Construct {
  public readonly auroraCluster: rds.DatabaseCluster;
  public readonly databaseSecret: rds.DatabaseSecret;
  public readonly defaultDatabaseName: string;

  constructor(scope: Construct, id: string, props: AuroraMySQLProps) {
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
    NagSuppressions.addResourceSuppressions(cluster, [
      {
        id: "AwsSolutions-RDS10",
        reason:
          "This code is a sample and should allow removal of the database",
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

    NagSuppressions.addResourceSuppressions(databaseSecret, [
      {
        id: "AwsSolutions-SMG4",
        reason: "Not rotation resources needed for a demo",
      },
    ]);
  }
}
