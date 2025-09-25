import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SystemConfig } from "./shared/types";
import { Authentication } from "./authentication";

import { Shared } from "./shared";
import { GmraApi } from "./api";
import { NagSuppressions } from "cdk-nag";

export interface GmraStackProps extends cdk.StackProps {
  readonly config: SystemConfig;
}

export class GMRAStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GmraStackProps) {
    super(scope, id, {
      description: "Graviton MRA",
      ...props,
    });

    const shared = new Shared(this, "Shared", { config: props.config });
    const authentication = new Authentication(this, "Authentication");

    new GmraApi(this, "GmraApi", {
      shared,
      config: props.config,
      userPool: authentication.userPool,
    });

    /**
     * CDK NAG suppression
     */
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      [
        `/${this.stackName}/GmraApi/GmraApi/assessmentsDataSource/ServiceRole/DefaultPolicy/Resource`,
      ],
      [
        {
          id: "AwsSolutions-IAM5",
          reason:
            "Permissions needed on AppSync service role for writting on Assesment DDB and all its indexes",
        },
      ]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      [
        `/${this.stackName}/Authentication/IdentityPool/AuthenticatedRole/DefaultPolicy/Resource`,
        `/${this.stackName}/Authentication/UserPool/smsRole/Resource`,
        `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource`,
        `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource`,
      ],
      [
        {
          id: "AwsSolutions-IAM4",
          reason: "IAM role implicitly created by CDK.",
        },
        {
          id: "AwsSolutions-IAM5",
          reason: "IAM role implicitly created by CDK.",
        },
      ]
    );
    // Implicitly created resources with changing paths
    NagSuppressions.addStackSuppressions(this, [
      {
        id: "CdkNagValidationFailure",
        reason: "Intrinstic function references.",
      },
    ]);
  }
}
