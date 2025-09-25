"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GMRAStack = void 0;
const cdk = require("aws-cdk-lib");
const authentication_1 = require("./authentication");
const shared_1 = require("./shared");
const api_1 = require("./api");
const cdk_nag_1 = require("cdk-nag");
class GMRAStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, {
            description: "Graviton MRA",
            ...props,
        });
        const shared = new shared_1.Shared(this, "Shared", { config: props.config });
        const authentication = new authentication_1.Authentication(this, "Authentication");
        new api_1.GmraApi(this, "GmraApi", {
            shared,
            config: props.config,
            userPool: authentication.userPool,
        });
        /**
         * CDK NAG suppression
         */
        cdk_nag_1.NagSuppressions.addResourceSuppressionsByPath(this, [
            `/${this.stackName}/GmraApi/GmraApi/assessmentsDataSource/ServiceRole/DefaultPolicy/Resource`,
        ], [
            {
                id: "AwsSolutions-IAM5",
                reason: "Permissions needed on AppSync service role for writting on Assesment DDB and all its indexes",
            },
        ]);
        cdk_nag_1.NagSuppressions.addResourceSuppressionsByPath(this, [
            `/${this.stackName}/Authentication/IdentityPool/AuthenticatedRole/DefaultPolicy/Resource`,
            `/${this.stackName}/Authentication/UserPool/smsRole/Resource`,
            `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource`,
            `/${this.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource`,
        ], [
            {
                id: "AwsSolutions-IAM4",
                reason: "IAM role implicitly created by CDK.",
            },
            {
                id: "AwsSolutions-IAM5",
                reason: "IAM role implicitly created by CDK.",
            },
        ]);
        // Implicitly created resources with changing paths
        cdk_nag_1.NagSuppressions.addStackSuppressions(this, [
            {
                id: "CdkNagValidationFailure",
                reason: "Intrinstic function references.",
            },
        ]);
    }
}
exports.GMRAStack = GMRAStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ21yYS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImdtcmEtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLHFEQUFrRDtBQUVsRCxxQ0FBa0M7QUFDbEMsK0JBQWdDO0FBQ2hDLHFDQUEwQztBQU0xQyxNQUFhLFNBQVUsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN0QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXFCO1FBQzdELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFO1lBQ2YsV0FBVyxFQUFFLGNBQWM7WUFDM0IsR0FBRyxLQUFLO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNwRSxNQUFNLGNBQWMsR0FBRyxJQUFJLCtCQUFjLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFbEUsSUFBSSxhQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUMzQixNQUFNO1lBQ04sTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ3BCLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUTtTQUNsQyxDQUFDLENBQUM7UUFFSDs7V0FFRztRQUNILHlCQUFlLENBQUMsNkJBQTZCLENBQzNDLElBQUksRUFDSjtZQUNFLElBQUksSUFBSSxDQUFDLFNBQVMsMkVBQTJFO1NBQzlGLEVBQ0Q7WUFDRTtnQkFDRSxFQUFFLEVBQUUsbUJBQW1CO2dCQUN2QixNQUFNLEVBQ0osOEZBQThGO2FBQ2pHO1NBQ0YsQ0FDRixDQUFDO1FBRUYseUJBQWUsQ0FBQyw2QkFBNkIsQ0FDM0MsSUFBSSxFQUNKO1lBQ0UsSUFBSSxJQUFJLENBQUMsU0FBUyx1RUFBdUU7WUFDekYsSUFBSSxJQUFJLENBQUMsU0FBUywyQ0FBMkM7WUFDN0QsSUFBSSxJQUFJLENBQUMsU0FBUyxvRUFBb0U7WUFDdEYsSUFBSSxJQUFJLENBQUMsU0FBUyxrRkFBa0Y7U0FDckcsRUFDRDtZQUNFO2dCQUNFLEVBQUUsRUFBRSxtQkFBbUI7Z0JBQ3ZCLE1BQU0sRUFBRSxxQ0FBcUM7YUFDOUM7WUFDRDtnQkFDRSxFQUFFLEVBQUUsbUJBQW1CO2dCQUN2QixNQUFNLEVBQUUscUNBQXFDO2FBQzlDO1NBQ0YsQ0FDRixDQUFDO1FBQ0YsbURBQW1EO1FBQ25ELHlCQUFlLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFO1lBQ3pDO2dCQUNFLEVBQUUsRUFBRSx5QkFBeUI7Z0JBQzdCLE1BQU0sRUFBRSxpQ0FBaUM7YUFDMUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1REQsOEJBNERDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IFN5c3RlbUNvbmZpZyB9IGZyb20gXCIuL3NoYXJlZC90eXBlc1wiO1xuaW1wb3J0IHsgQXV0aGVudGljYXRpb24gfSBmcm9tIFwiLi9hdXRoZW50aWNhdGlvblwiO1xuXG5pbXBvcnQgeyBTaGFyZWQgfSBmcm9tIFwiLi9zaGFyZWRcIjtcbmltcG9ydCB7IEdtcmFBcGkgfSBmcm9tIFwiLi9hcGlcIjtcbmltcG9ydCB7IE5hZ1N1cHByZXNzaW9ucyB9IGZyb20gXCJjZGstbmFnXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR21yYVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IGNvbmZpZzogU3lzdGVtQ29uZmlnO1xufVxuXG5leHBvcnQgY2xhc3MgR01SQVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEdtcmFTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJHcmF2aXRvbiBNUkFcIixcbiAgICAgIC4uLnByb3BzLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2hhcmVkID0gbmV3IFNoYXJlZCh0aGlzLCBcIlNoYXJlZFwiLCB7IGNvbmZpZzogcHJvcHMuY29uZmlnIH0pO1xuICAgIGNvbnN0IGF1dGhlbnRpY2F0aW9uID0gbmV3IEF1dGhlbnRpY2F0aW9uKHRoaXMsIFwiQXV0aGVudGljYXRpb25cIik7XG5cbiAgICBuZXcgR21yYUFwaSh0aGlzLCBcIkdtcmFBcGlcIiwge1xuICAgICAgc2hhcmVkLFxuICAgICAgY29uZmlnOiBwcm9wcy5jb25maWcsXG4gICAgICB1c2VyUG9vbDogYXV0aGVudGljYXRpb24udXNlclBvb2wsXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDREsgTkFHIHN1cHByZXNzaW9uXG4gICAgICovXG4gICAgTmFnU3VwcHJlc3Npb25zLmFkZFJlc291cmNlU3VwcHJlc3Npb25zQnlQYXRoKFxuICAgICAgdGhpcyxcbiAgICAgIFtcbiAgICAgICAgYC8ke3RoaXMuc3RhY2tOYW1lfS9HbXJhQXBpL0dtcmFBcGkvYXNzZXNzbWVudHNEYXRhU291cmNlL1NlcnZpY2VSb2xlL0RlZmF1bHRQb2xpY3kvUmVzb3VyY2VgLFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIkF3c1NvbHV0aW9ucy1JQU01XCIsXG4gICAgICAgICAgcmVhc29uOlxuICAgICAgICAgICAgXCJQZXJtaXNzaW9ucyBuZWVkZWQgb24gQXBwU3luYyBzZXJ2aWNlIHJvbGUgZm9yIHdyaXR0aW5nIG9uIEFzc2VzbWVudCBEREIgYW5kIGFsbCBpdHMgaW5kZXhlc1wiLFxuICAgICAgICB9LFxuICAgICAgXVxuICAgICk7XG5cbiAgICBOYWdTdXBwcmVzc2lvbnMuYWRkUmVzb3VyY2VTdXBwcmVzc2lvbnNCeVBhdGgoXG4gICAgICB0aGlzLFxuICAgICAgW1xuICAgICAgICBgLyR7dGhpcy5zdGFja05hbWV9L0F1dGhlbnRpY2F0aW9uL0lkZW50aXR5UG9vbC9BdXRoZW50aWNhdGVkUm9sZS9EZWZhdWx0UG9saWN5L1Jlc291cmNlYCxcbiAgICAgICAgYC8ke3RoaXMuc3RhY2tOYW1lfS9BdXRoZW50aWNhdGlvbi9Vc2VyUG9vbC9zbXNSb2xlL1Jlc291cmNlYCxcbiAgICAgICAgYC8ke3RoaXMuc3RhY2tOYW1lfS9Mb2dSZXRlbnRpb25hYWUwYWEzYzViNGQ0Zjg3YjAyZDg1YjIwMWVmZGQ4YS9TZXJ2aWNlUm9sZS9SZXNvdXJjZWAsXG4gICAgICAgIGAvJHt0aGlzLnN0YWNrTmFtZX0vTG9nUmV0ZW50aW9uYWFlMGFhM2M1YjRkNGY4N2IwMmQ4NWIyMDFlZmRkOGEvU2VydmljZVJvbGUvRGVmYXVsdFBvbGljeS9SZXNvdXJjZWAsXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICB7XG4gICAgICAgICAgaWQ6IFwiQXdzU29sdXRpb25zLUlBTTRcIixcbiAgICAgICAgICByZWFzb246IFwiSUFNIHJvbGUgaW1wbGljaXRseSBjcmVhdGVkIGJ5IENESy5cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIkF3c1NvbHV0aW9ucy1JQU01XCIsXG4gICAgICAgICAgcmVhc29uOiBcIklBTSByb2xlIGltcGxpY2l0bHkgY3JlYXRlZCBieSBDREsuXCIsXG4gICAgICAgIH0sXG4gICAgICBdXG4gICAgKTtcbiAgICAvLyBJbXBsaWNpdGx5IGNyZWF0ZWQgcmVzb3VyY2VzIHdpdGggY2hhbmdpbmcgcGF0aHNcbiAgICBOYWdTdXBwcmVzc2lvbnMuYWRkU3RhY2tTdXBwcmVzc2lvbnModGhpcywgW1xuICAgICAge1xuICAgICAgICBpZDogXCJDZGtOYWdWYWxpZGF0aW9uRmFpbHVyZVwiLFxuICAgICAgICByZWFzb246IFwiSW50cmluc3RpYyBmdW5jdGlvbiByZWZlcmVuY2VzLlwiLFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxufVxuIl19