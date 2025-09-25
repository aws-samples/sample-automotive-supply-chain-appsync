"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/createAssessment.js";
describe("CreateAssessment Resolver Tests", () => {
    describe("Request Function Tests", () => {
        const validUsername = "test-user";
        const validName = "Test Assessment";
        const mockTemplateResult = {
            id: "template-123",
            name: "Sample Template",
            sections: [
                {
                    id: "section-1",
                    title: "First Section",
                    questions: [
                        {
                            id: "q-1",
                            text: "Sample question?",
                            type: "MULTIPLE_CHOICE",
                            options: ["Option 1", "Option 2"],
                        },
                    ],
                },
            ],
        };
        const validIdentity = {
            sourceIp: ["127.0.0.1"],
            username: validUsername,
            groups: null,
            sub: "test-sub",
            issuer: "test-issuer",
            claims: {},
            defaultAuthStrategy: "ALLOW",
        };
        it("should create a valid DynamoDB put request with correct parameters", async () => {
            const context = {
                arguments: {
                    name: validName,
                },
                identity: validIdentity,
                prev: {
                    result: mockTemplateResult,
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.evaluationResult ?? "{}");
            expect(result.operation).toBe("PutItem");
            // Extract the key fields directly since they should be at top level
            const keys = (0, util_dynamodb_1.unmarshall)(result.key);
            expect(keys.assessmentId).toBeDefined(); // Auto-generated ID
            expect(keys.ownerId).toBe(validUsername);
            // Check the attributes that would go into the item
            const attributeValues = (0, util_dynamodb_1.unmarshall)(result.attributeValues);
            expect(attributeValues.name).toBe(validName);
            expect(attributeValues.template).toEqual(mockTemplateResult);
            expect(attributeValues.progress).toBeDefined();
            expect(attributeValues.progress.completedQuestions).toEqual([]);
            expect(typeof attributeValues.progress.lastUpdated).toBe("string"); // ISO timestamp
        }, 10000);
        it("should fail when user identity is missing", async () => {
            const context = {
                arguments: {
                    name: validName,
                },
                identity: {},
                prev: {
                    result: mockTemplateResult,
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.evaluationResult).toBeUndefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.USER_NOT_FOUND);
        });
        it("should fail when template sections are missing", async () => {
            const context = {
                arguments: {
                    name: validName,
                },
                identity: validIdentity,
                prev: {
                    result: null,
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.evaluationResult).toBeUndefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.RESOURCE_NOT_FOUND);
        });
        it("should handle missing name argument", async () => {
            const context = {
                arguments: {},
                identity: validIdentity,
                prev: {
                    result: mockTemplateResult,
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeUndefined();
            // Since the handler doesn't explicitly check for name, it will create
            // an assessment with a null name when not provided
            const result = JSON.parse(response.evaluationResult ?? "{}");
            const attributeValues = (0, util_dynamodb_1.unmarshall)(result.attributeValues);
            expect(attributeValues.name).toBeNull();
        });
    });
    describe("Response Function Tests", () => {
        const mockAssessment = {
            assessmentId: "test-assessment-123",
            ownerId: "test-user",
            name: "Test Assessment",
            template: {
                id: "template-123",
                name: "Sample Template",
                sections: [],
            },
            progress: {
                completedQuestions: [],
                lastUpdated: "2023-01-01T00:00:00Z",
            },
        };
        it("should return the result when successful", async () => {
            const context = {
                result: mockAssessment,
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.evaluationResult ?? "{}");
            expect(result).toEqual(mockAssessment);
        });
        it("should handle DynamoDB errors", async () => {
            const context = {
                error: {
                    message: "DynamoDB Error",
                    type: "DynamoDBError",
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe("DynamoDB Error");
        });
        it("should handle conditional check failed errors", async () => {
            const context = {
                error: {
                    message: "The conditional request failed",
                    type: "ConditionalCheckFailedException",
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe("The conditional request failed");
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQXNzZXNzbWVudC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlQXNzZXNzbWVudC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMERBQW9EO0FBQ3BELHdFQUd1QztBQUN2QywwREFBdUQ7QUFFdkQsTUFBTSxJQUFJLEdBQUcsK0NBQStDLENBQUM7QUFFN0QsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtJQUMvQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQztRQUNsQyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztRQUNwQyxNQUFNLGtCQUFrQixHQUFHO1lBQ3pCLEVBQUUsRUFBRSxjQUFjO1lBQ2xCLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsUUFBUSxFQUFFO2dCQUNSO29CQUNFLEVBQUUsRUFBRSxXQUFXO29CQUNmLEtBQUssRUFBRSxlQUFlO29CQUN0QixTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsRUFBRSxFQUFFLEtBQUs7NEJBQ1QsSUFBSSxFQUFFLGtCQUFrQjs0QkFDeEIsSUFBSSxFQUFFLGlCQUFpQjs0QkFDdkIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQzt5QkFDbEM7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUM7UUFFRixNQUFNLGFBQWEsR0FBRztZQUNwQixRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDdkIsUUFBUSxFQUFFLGFBQWE7WUFDdkIsTUFBTSxFQUFFLElBQUk7WUFDWixHQUFHLEVBQUUsVUFBVTtZQUNmLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsbUJBQW1CLEVBQUUsT0FBTztTQUM3QixDQUFDO1FBRUYsRUFBRSxDQUFDLG9FQUFvRSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xGLE1BQU0sT0FBTyxHQUFHO2dCQUNkLFNBQVMsRUFBRTtvQkFDVCxJQUFJLEVBQUUsU0FBUztpQkFDaEI7Z0JBQ0QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsa0JBQWtCO2lCQUMzQjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV6QyxvRUFBb0U7WUFDcEUsTUFBTSxJQUFJLEdBQUcsSUFBQSwwQkFBVSxFQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsb0JBQW9CO1lBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXpDLG1EQUFtRDtZQUNuRCxNQUFNLGVBQWUsR0FBRyxJQUFBLDBCQUFVLEVBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQyxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtRQUN0RixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFVixFQUFFLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDekQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsU0FBUyxFQUFFO29CQUNULElBQUksRUFBRSxTQUFTO2lCQUNoQjtnQkFDRCxRQUFRLEVBQUUsRUFBRTtnQkFDWixJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLGtCQUFrQjtpQkFDM0I7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLE9BQU87YUFDcEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdEQUFnRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlELE1BQU0sT0FBTyxHQUFHO2dCQUNkLFNBQVMsRUFBRTtvQkFDVCxJQUFJLEVBQUUsU0FBUztpQkFDaEI7Z0JBQ0QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLElBQUksRUFBRTtvQkFDSixNQUFNLEVBQUUsSUFBSTtpQkFDYjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuRCxNQUFNLE9BQU8sR0FBRztnQkFDZCxTQUFTLEVBQUUsRUFBRTtnQkFDYixRQUFRLEVBQUUsYUFBYTtnQkFDdkIsSUFBSSxFQUFFO29CQUNKLE1BQU0sRUFBRSxrQkFBa0I7aUJBQzNCO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLHNFQUFzRTtZQUN0RSxtREFBbUQ7WUFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxlQUFlLEdBQUcsSUFBQSwwQkFBVSxFQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ3ZDLE1BQU0sY0FBYyxHQUFHO1lBQ3JCLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsT0FBTyxFQUFFLFdBQVc7WUFDcEIsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixRQUFRLEVBQUU7Z0JBQ1IsRUFBRSxFQUFFLGNBQWM7Z0JBQ2xCLElBQUksRUFBRSxpQkFBaUI7Z0JBQ3ZCLFFBQVEsRUFBRSxFQUFFO2FBQ2I7WUFDRCxRQUFRLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUUsRUFBRTtnQkFDdEIsV0FBVyxFQUFFLHNCQUFzQjthQUNwQztTQUNGLENBQUM7UUFFRixFQUFFLENBQUMsMENBQTBDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsTUFBTSxFQUFFLGNBQWM7YUFDdkIsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxRQUFRO2FBQ3JELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0MsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsS0FBSyxFQUFFO29CQUNMLE9BQU8sRUFBRSxnQkFBZ0I7b0JBQ3pCLElBQUksRUFBRSxlQUFlO2lCQUN0QjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM3RCxNQUFNLE9BQU8sR0FBRztnQkFDZCxLQUFLLEVBQUU7b0JBQ0wsT0FBTyxFQUFFLGdDQUFnQztvQkFDekMsSUFBSSxFQUFFLGlDQUFpQztpQkFDeEM7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLFFBQVE7YUFDckQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdW5tYXJzaGFsbCB9IGZyb20gXCJAYXdzLXNkay91dGlsLWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICBldmFsdWF0ZVJlc29sdmVyQ29kZSxcbiAgUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUsXG59IGZyb20gXCIuLi91dGlscy9ldmFsdWF0ZVJlc29sdmVyQ29kZVwiO1xuaW1wb3J0IHsgRXJyb3JNZXNzYWdlcyB9IGZyb20gXCIuLi91dGlscy9BcHBTeW5jRXJyb3JzXCI7XG5cbmNvbnN0IGZpbGUgPSBcIi4vbGliL2FwaS9yZXNvbHZlcnMvYnVpbGQvY3JlYXRlQXNzZXNzbWVudC5qc1wiO1xuXG5kZXNjcmliZShcIkNyZWF0ZUFzc2Vzc21lbnQgUmVzb2x2ZXIgVGVzdHNcIiwgKCkgPT4ge1xuICBkZXNjcmliZShcIlJlcXVlc3QgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHZhbGlkVXNlcm5hbWUgPSBcInRlc3QtdXNlclwiO1xuICAgIGNvbnN0IHZhbGlkTmFtZSA9IFwiVGVzdCBBc3Nlc3NtZW50XCI7XG4gICAgY29uc3QgbW9ja1RlbXBsYXRlUmVzdWx0ID0ge1xuICAgICAgaWQ6IFwidGVtcGxhdGUtMTIzXCIsXG4gICAgICBuYW1lOiBcIlNhbXBsZSBUZW1wbGF0ZVwiLFxuICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcInNlY3Rpb24tMVwiLFxuICAgICAgICAgIHRpdGxlOiBcIkZpcnN0IFNlY3Rpb25cIixcbiAgICAgICAgICBxdWVzdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6IFwicS0xXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiU2FtcGxlIHF1ZXN0aW9uP1wiLFxuICAgICAgICAgICAgICB0eXBlOiBcIk1VTFRJUExFX0NIT0lDRVwiLFxuICAgICAgICAgICAgICBvcHRpb25zOiBbXCJPcHRpb24gMVwiLCBcIk9wdGlvbiAyXCJdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuXG4gICAgY29uc3QgdmFsaWRJZGVudGl0eSA9IHtcbiAgICAgIHNvdXJjZUlwOiBbXCIxMjcuMC4wLjFcIl0sXG4gICAgICB1c2VybmFtZTogdmFsaWRVc2VybmFtZSxcbiAgICAgIGdyb3VwczogbnVsbCxcbiAgICAgIHN1YjogXCJ0ZXN0LXN1YlwiLFxuICAgICAgaXNzdWVyOiBcInRlc3QtaXNzdWVyXCIsXG4gICAgICBjbGFpbXM6IHt9LFxuICAgICAgZGVmYXVsdEF1dGhTdHJhdGVneTogXCJBTExPV1wiLFxuICAgIH07XG5cbiAgICBpdChcInNob3VsZCBjcmVhdGUgYSB2YWxpZCBEeW5hbW9EQiBwdXQgcmVxdWVzdCB3aXRoIGNvcnJlY3QgcGFyYW1ldGVyc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBuYW1lOiB2YWxpZE5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBwcmV2OiB7XG4gICAgICAgICAgcmVzdWx0OiBtb2NrVGVtcGxhdGVSZXN1bHQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0Lm9wZXJhdGlvbikudG9CZShcIlB1dEl0ZW1cIik7XG5cbiAgICAgIC8vIEV4dHJhY3QgdGhlIGtleSBmaWVsZHMgZGlyZWN0bHkgc2luY2UgdGhleSBzaG91bGQgYmUgYXQgdG9wIGxldmVsXG4gICAgICBjb25zdCBrZXlzID0gdW5tYXJzaGFsbChyZXN1bHQua2V5KTtcbiAgICAgIGV4cGVjdChrZXlzLmFzc2Vzc21lbnRJZCkudG9CZURlZmluZWQoKTsgLy8gQXV0by1nZW5lcmF0ZWQgSURcbiAgICAgIGV4cGVjdChrZXlzLm93bmVySWQpLnRvQmUodmFsaWRVc2VybmFtZSk7XG5cbiAgICAgIC8vIENoZWNrIHRoZSBhdHRyaWJ1dGVzIHRoYXQgd291bGQgZ28gaW50byB0aGUgaXRlbVxuICAgICAgY29uc3QgYXR0cmlidXRlVmFsdWVzID0gdW5tYXJzaGFsbChyZXN1bHQuYXR0cmlidXRlVmFsdWVzKTtcbiAgICAgIGV4cGVjdChhdHRyaWJ1dGVWYWx1ZXMubmFtZSkudG9CZSh2YWxpZE5hbWUpO1xuICAgICAgZXhwZWN0KGF0dHJpYnV0ZVZhbHVlcy50ZW1wbGF0ZSkudG9FcXVhbChtb2NrVGVtcGxhdGVSZXN1bHQpO1xuICAgICAgZXhwZWN0KGF0dHJpYnV0ZVZhbHVlcy5wcm9ncmVzcykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChhdHRyaWJ1dGVWYWx1ZXMucHJvZ3Jlc3MuY29tcGxldGVkUXVlc3Rpb25zKS50b0VxdWFsKFtdKTtcbiAgICAgIGV4cGVjdCh0eXBlb2YgYXR0cmlidXRlVmFsdWVzLnByb2dyZXNzLmxhc3RVcGRhdGVkKS50b0JlKFwic3RyaW5nXCIpOyAvLyBJU08gdGltZXN0YW1wXG4gICAgfSwgMTAwMDApO1xuXG4gICAgaXQoXCJzaG91bGQgZmFpbCB3aGVuIHVzZXIgaWRlbnRpdHkgaXMgbWlzc2luZ1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBuYW1lOiB2YWxpZE5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIGlkZW50aXR5OiB7fSxcbiAgICAgICAgcHJldjoge1xuICAgICAgICAgIHJlc3VsdDogbW9ja1RlbXBsYXRlUmVzdWx0LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlVTRVJfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGZhaWwgd2hlbiB0ZW1wbGF0ZSBzZWN0aW9ucyBhcmUgbWlzc2luZ1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBuYW1lOiB2YWxpZE5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBwcmV2OiB7XG4gICAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBuYW1lIGFyZ3VtZW50XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGFyZ3VtZW50czoge30sXG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBwcmV2OiB7XG4gICAgICAgICAgcmVzdWx0OiBtb2NrVGVtcGxhdGVSZXN1bHQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgLy8gU2luY2UgdGhlIGhhbmRsZXIgZG9lc24ndCBleHBsaWNpdGx5IGNoZWNrIGZvciBuYW1lLCBpdCB3aWxsIGNyZWF0ZVxuICAgICAgLy8gYW4gYXNzZXNzbWVudCB3aXRoIGEgbnVsbCBuYW1lIHdoZW4gbm90IHByb3ZpZGVkXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZVZhbHVlcyA9IHVubWFyc2hhbGwocmVzdWx0LmF0dHJpYnV0ZVZhbHVlcyk7XG4gICAgICBleHBlY3QoYXR0cmlidXRlVmFsdWVzLm5hbWUpLnRvQmVOdWxsKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiUmVzcG9uc2UgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG1vY2tBc3Nlc3NtZW50ID0ge1xuICAgICAgYXNzZXNzbWVudElkOiBcInRlc3QtYXNzZXNzbWVudC0xMjNcIixcbiAgICAgIG93bmVySWQ6IFwidGVzdC11c2VyXCIsXG4gICAgICBuYW1lOiBcIlRlc3QgQXNzZXNzbWVudFwiLFxuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgaWQ6IFwidGVtcGxhdGUtMTIzXCIsXG4gICAgICAgIG5hbWU6IFwiU2FtcGxlIFRlbXBsYXRlXCIsXG4gICAgICAgIHNlY3Rpb25zOiBbXSxcbiAgICAgIH0sXG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICBjb21wbGV0ZWRRdWVzdGlvbnM6IFtdLFxuICAgICAgICBsYXN0VXBkYXRlZDogXCIyMDIzLTAxLTAxVDAwOjAwOjAwWlwiLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIHRoZSByZXN1bHQgd2hlbiBzdWNjZXNzZnVsXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbW9ja0Fzc2Vzc21lbnQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbChtb2NrQXNzZXNzbWVudCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgRHluYW1vREIgZXJyb3JzXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgbWVzc2FnZTogXCJEeW5hbW9EQiBFcnJvclwiLFxuICAgICAgICAgIHR5cGU6IFwiRHluYW1vREJFcnJvclwiLFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShcIkR5bmFtb0RCIEVycm9yXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGNvbmRpdGlvbmFsIGNoZWNrIGZhaWxlZCBlcnJvcnNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICBtZXNzYWdlOiBcIlRoZSBjb25kaXRpb25hbCByZXF1ZXN0IGZhaWxlZFwiLFxuICAgICAgICAgIHR5cGU6IFwiQ29uZGl0aW9uYWxDaGVja0ZhaWxlZEV4Y2VwdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShcIlRoZSBjb25kaXRpb25hbCByZXF1ZXN0IGZhaWxlZFwiKTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==