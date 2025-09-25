"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/updatePart.js";
describe("UpdatePart Resolver Tests", () => {
    describe("Request Function Tests", () => {
        const validUsername = "test-user";
        const validIdentity = {
            sourceIp: ["127.0.0.1"],
            username: validUsername,
            groups: null,
            sub: "test-sub",
            issuer: "test-issuer",
            claims: {},
            defaultAuthStrategy: "ALLOW",
        };
        const validInput = {
            partId: "part-123",
            partName: "Updated Part Name",
            partCategory: "Updated Category",
            unitPrice: 29.99,
        };
        it("should create a valid PostgreSQL update statement with all fields", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: validInput,
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
            expect(result.statements).toBeDefined();
            expect(result.statements[0]).toContain('UPDATE "parts" SET');
            expect(result.statements[0]).toContain("part_name");
            expect(result.statements[0]).toContain("part_category");
            expect(result.statements[0]).toContain("unit_price");
            expect(result.statements[0]).toContain("WHERE");
            expect(result.statements[0]).toContain("part_id");
            expect(result.statements[0]).toContain("RETURNING");
        });
        it("should create a valid PostgreSQL update statement with only some fields", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-123",
                        unitPrice: 29.99,
                    },
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
            expect(result.statements).toBeDefined();
            expect(result.statements[0]).toContain('UPDATE "parts" SET');
            // Extract the SET clause and verify its contents
            const setClauseMatch = result.statements[0].match(/SET\s+(.*?)\s+WHERE/);
            expect(setClauseMatch).toBeTruthy();
            const setClause = setClauseMatch[1];
            expect(setClause).toContain("unit_price");
            expect(setClause).not.toContain("part_name");
            expect(setClause).not.toContain("part_category");
        });
        it("should handle missing identity", async () => {
            const context = {
                identity: {},
                arguments: {
                    input: validInput,
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
        it("should handle missing partId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partName: "Updated Part Name",
                        partCategory: "Updated Category",
                        unitPrice: 29.99,
                    },
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
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should handle no fields to update", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-123",
                    },
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
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should handle null partId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: null,
                        partName: "Updated Part Name",
                    },
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
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should handle explicit null for update fields", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-123",
                        partName: null,
                    },
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            // The resolver rejects null values for fields, aligning with the behavior
            // we saw in UpdateOrder resolver
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should accept zero as a valid unitPrice", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-123",
                        unitPrice: 0,
                    },
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
            expect(result.statements).toBeDefined();
        });
        it("should accept negative unitPrice", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-123",
                        unitPrice: -10.99,
                    },
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
            expect(result.statements).toBeDefined();
        });
    });
    describe("Response Function Tests", () => {
        const mockRdsResult = JSON.stringify({
            sqlStatementResults: [
                {
                    records: [
                        [
                            { stringValue: "12345" },
                            { stringValue: "Updated Part Name" },
                            { stringValue: "Electronics" },
                            { doubleValue: 29.99 },
                        ],
                    ],
                    columnMetadata: [
                        { name: "part_id" },
                        { name: "part_name" },
                        { name: "part_category" },
                        { name: "unit_price" },
                    ],
                },
            ],
        });
        it("should transform RDS result to expected format", async () => {
            const context = {
                result: mockRdsResult,
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.evaluationResult ?? "{}");
            expect(result).toEqual({
                partId: "12345",
                partName: "Updated Part Name",
                partCategory: "Electronics",
                unitPrice: 29.99,
            });
        });
        it("should handle empty result set", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [],
                            columnMetadata: [
                                { name: "part_id" },
                                { name: "part_name" },
                                { name: "part_category" },
                                { name: "unit_price" },
                            ],
                        },
                    ],
                }),
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.RESOURCE_NOT_FOUND);
        });
        it("should handle database errors", async () => {
            const context = {
                error: {
                    message: "Database connection error",
                    type: "RDSError",
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe("Database connection error");
        });
        it("should handle null result", async () => {
            const context = {
                result: null,
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.RESOURCE_NOT_FOUND);
        });
        it("should handle undefined result", async () => {
            const context = {
                result: undefined,
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.RESOURCE_NOT_FOUND);
        });
        it("should handle SQL syntax errors", async () => {
            const context = {
                error: {
                    message: 'syntax error at or near "parts"',
                    type: "SQLSyntaxError",
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe('syntax error at or near "parts"');
        });
        it("should handle record not found error", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [],
                            columnMetadata: [
                                { name: "part_id" },
                                { name: "part_name" },
                                { name: "part_category" },
                                { name: "unit_price" },
                            ],
                        },
                    ],
                }),
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.RESOURCE_NOT_FOUND);
        });
        it("should handle malformed result data", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [
                                [
                                    { stringValue: null },
                                    { stringValue: null },
                                    { stringValue: null },
                                    { doubleValue: null },
                                ],
                            ],
                            columnMetadata: [
                                { name: "part_id" },
                                { name: "part_name" },
                                { name: "part_category" },
                                { name: "unit_price" },
                            ],
                        },
                    ],
                }),
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeUndefined();
            const result = JSON.parse(response.evaluationResult ?? "{}");
            expect(result).toEqual({
                partId: null,
                partName: null,
                partCategory: null,
                unitPrice: null,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUGFydC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBkYXRlUGFydC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBR3VDO0FBQ3ZDLDBEQUF1RDtBQUV2RCxNQUFNLElBQUksR0FBRyx5Q0FBeUMsQ0FBQztBQUV2RCxRQUFRLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO0lBQ3pDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLE1BQU0sYUFBYSxHQUFHO1lBQ3BCLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQztZQUN2QixRQUFRLEVBQUUsYUFBYTtZQUN2QixNQUFNLEVBQUUsSUFBSTtZQUNaLEdBQUcsRUFBRSxVQUFVO1lBQ2YsTUFBTSxFQUFFLGFBQWE7WUFDckIsTUFBTSxFQUFFLEVBQUU7WUFDVixtQkFBbUIsRUFBRSxPQUFPO1NBQzdCLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBRztZQUNqQixNQUFNLEVBQUUsVUFBVTtZQUNsQixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFlBQVksRUFBRSxrQkFBa0I7WUFDaEMsU0FBUyxFQUFFLEtBQUs7U0FDakIsQ0FBQztRQUVGLEVBQUUsQ0FBQyxtRUFBbUUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNqRixNQUFNLE9BQU8sR0FBRztnQkFDZCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsU0FBUyxFQUFFO29CQUNULEtBQUssRUFBRSxVQUFVO2lCQUNsQjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMseUVBQXlFLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkYsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLFNBQVMsRUFBRSxLQUFLO3FCQUNqQjtpQkFDRjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFN0QsaURBQWlEO1lBQ2pELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRXBDLE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlDLE1BQU0sT0FBTyxHQUFHO2dCQUNkLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUUsVUFBVTtpQkFDbEI7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLE9BQU87YUFDcEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzVDLE1BQU0sT0FBTyxHQUFHO2dCQUNkLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixTQUFTLEVBQUU7b0JBQ1QsS0FBSyxFQUFFO3dCQUNMLFFBQVEsRUFBRSxtQkFBbUI7d0JBQzdCLFlBQVksRUFBRSxrQkFBa0I7d0JBQ2hDLFNBQVMsRUFBRSxLQUFLO3FCQUNqQjtpQkFDRjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLFVBQVU7cUJBQ25CO2lCQUNGO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsNkJBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6QyxNQUFNLE9BQU8sR0FBRztnQkFDZCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsU0FBUyxFQUFFO29CQUNULEtBQUssRUFBRTt3QkFDTCxNQUFNLEVBQUUsSUFBSTt3QkFDWixRQUFRLEVBQUUsbUJBQW1CO3FCQUM5QjtpQkFDRjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsT0FBTzthQUNwRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0QsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLFFBQVEsRUFBRSxJQUFJO3FCQUNmO2lCQUNGO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILDBFQUEwRTtZQUMxRSxpQ0FBaUM7WUFDakMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLFNBQVMsRUFBRSxDQUFDO3FCQUNiO2lCQUNGO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsa0NBQWtDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDaEQsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLFVBQVU7d0JBQ2xCLFNBQVMsRUFBRSxDQUFDLEtBQUs7cUJBQ2xCO2lCQUNGO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDdkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNuQyxtQkFBbUIsRUFBRTtnQkFDbkI7b0JBQ0UsT0FBTyxFQUFFO3dCQUNQOzRCQUNFLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRTs0QkFDeEIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUU7NEJBQ3BDLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRTs0QkFDOUIsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO3lCQUN2QjtxQkFDRjtvQkFDRCxjQUFjLEVBQUU7d0JBQ2QsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO3dCQUNuQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7d0JBQ3JCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRTt3QkFDekIsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO3FCQUN2QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdEQUFnRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlELE1BQU0sT0FBTyxHQUFHO2dCQUNkLE1BQU0sRUFBRSxhQUFhO2FBQ3RCLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUNyQixNQUFNLEVBQUUsT0FBTztnQkFDZixRQUFRLEVBQUUsbUJBQW1CO2dCQUM3QixZQUFZLEVBQUUsYUFBYTtnQkFDM0IsU0FBUyxFQUFFLEtBQUs7YUFDakIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDOUMsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ3JCLG1CQUFtQixFQUFFO3dCQUNuQjs0QkFDRSxPQUFPLEVBQUUsRUFBRTs0QkFDWCxjQUFjLEVBQUU7Z0NBQ2QsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dDQUNuQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7Z0NBQ3JCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRTtnQ0FDekIsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFOzZCQUN2Qjt5QkFDRjtxQkFDRjtpQkFDRixDQUFDO2FBQ0gsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxRQUFRO2FBQ3JELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2QkFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDekUsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0MsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsS0FBSyxFQUFFO29CQUNMLE9BQU8sRUFBRSwyQkFBMkI7b0JBQ3BDLElBQUksRUFBRSxVQUFVO2lCQUNqQjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6QyxNQUFNLE9BQU8sR0FBRztnQkFDZCxNQUFNLEVBQUUsSUFBSTthQUNiLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsNkJBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlDLE1BQU0sT0FBTyxHQUFHO2dCQUNkLE1BQU0sRUFBRSxTQUFTO2FBQ2xCLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsNkJBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQy9DLE1BQU0sT0FBTyxHQUFHO2dCQUNkLEtBQUssRUFBRTtvQkFDTCxPQUFPLEVBQUUsaUNBQWlDO29CQUMxQyxJQUFJLEVBQUUsZ0JBQWdCO2lCQUN2QjthQUNGLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsMkNBQW9CLEVBQUM7Z0JBQzFDLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU87Z0JBQ1Asa0JBQWtCLEVBQUUsOENBQXVCLENBQUMsUUFBUTthQUNyRCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNwRCxNQUFNLE9BQU8sR0FBRztnQkFDZCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDckIsbUJBQW1CLEVBQUU7d0JBQ25COzRCQUNFLE9BQU8sRUFBRSxFQUFFOzRCQUNYLGNBQWMsRUFBRTtnQ0FDZCxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7Z0NBQ25CLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQ0FDckIsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dDQUN6QixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7NkJBQ3ZCO3lCQUNGO3FCQUNGO2lCQUNGLENBQUM7YUFDSCxDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLFFBQVE7YUFDckQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZCQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuRCxNQUFNLE9BQU8sR0FBRztnQkFDZCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDckIsbUJBQW1CLEVBQUU7d0JBQ25COzRCQUNFLE9BQU8sRUFBRTtnQ0FDUDtvQ0FDRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7b0NBQ3JCLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtvQ0FDckIsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO29DQUNyQixFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUU7aUNBQ3RCOzZCQUNGOzRCQUNELGNBQWMsRUFBRTtnQ0FDZCxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7Z0NBQ25CLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQ0FDckIsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFO2dDQUN6QixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7NkJBQ3ZCO3lCQUNGO3FCQUNGO2lCQUNGLENBQUM7YUFDSCxDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLFFBQVE7YUFDckQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDckIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osUUFBUSxFQUFFLElBQUk7Z0JBQ2QsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGV2YWx1YXRlUmVzb2x2ZXJDb2RlLFxuICBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRSxcbn0gZnJvbSBcIi4uL3V0aWxzL2V2YWx1YXRlUmVzb2x2ZXJDb2RlXCI7XG5pbXBvcnQgeyBFcnJvck1lc3NhZ2VzIH0gZnJvbSBcIi4uL3V0aWxzL0FwcFN5bmNFcnJvcnNcIjtcblxuY29uc3QgZmlsZSA9IFwiLi9saWIvYXBpL3Jlc29sdmVycy9idWlsZC91cGRhdGVQYXJ0LmpzXCI7XG5cbmRlc2NyaWJlKFwiVXBkYXRlUGFydCBSZXNvbHZlciBUZXN0c1wiLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwiUmVxdWVzdCBGdW5jdGlvbiBUZXN0c1wiLCAoKSA9PiB7XG4gICAgY29uc3QgdmFsaWRVc2VybmFtZSA9IFwidGVzdC11c2VyXCI7XG4gICAgY29uc3QgdmFsaWRJZGVudGl0eSA9IHtcbiAgICAgIHNvdXJjZUlwOiBbXCIxMjcuMC4wLjFcIl0sXG4gICAgICB1c2VybmFtZTogdmFsaWRVc2VybmFtZSxcbiAgICAgIGdyb3VwczogbnVsbCxcbiAgICAgIHN1YjogXCJ0ZXN0LXN1YlwiLFxuICAgICAgaXNzdWVyOiBcInRlc3QtaXNzdWVyXCIsXG4gICAgICBjbGFpbXM6IHt9LFxuICAgICAgZGVmYXVsdEF1dGhTdHJhdGVneTogXCJBTExPV1wiLFxuICAgIH07XG5cbiAgICBjb25zdCB2YWxpZElucHV0ID0ge1xuICAgICAgcGFydElkOiBcInBhcnQtMTIzXCIsXG4gICAgICBwYXJ0TmFtZTogXCJVcGRhdGVkIFBhcnQgTmFtZVwiLFxuICAgICAgcGFydENhdGVnb3J5OiBcIlVwZGF0ZWQgQ2F0ZWdvcnlcIixcbiAgICAgIHVuaXRQcmljZTogMjkuOTksXG4gICAgfTtcblxuICAgIGl0KFwic2hvdWxkIGNyZWF0ZSBhIHZhbGlkIFBvc3RncmVTUUwgdXBkYXRlIHN0YXRlbWVudCB3aXRoIGFsbCBmaWVsZHNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB2YWxpZElucHV0LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oJ1VQREFURSBcInBhcnRzXCIgU0VUJyk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInBhcnRfbmFtZVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwicGFydF9jYXRlZ29yeVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwidW5pdF9wcmljZVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwiV0hFUkVcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInBhcnRfaWRcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcIlJFVFVSTklOR1wiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGNyZWF0ZSBhIHZhbGlkIFBvc3RncmVTUUwgdXBkYXRlIHN0YXRlbWVudCB3aXRoIG9ubHkgc29tZSBmaWVsZHNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBwYXJ0SWQ6IFwicGFydC0xMjNcIixcbiAgICAgICAgICAgIHVuaXRQcmljZTogMjkuOTksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50cykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKCdVUERBVEUgXCJwYXJ0c1wiIFNFVCcpO1xuXG4gICAgICAvLyBFeHRyYWN0IHRoZSBTRVQgY2xhdXNlIGFuZCB2ZXJpZnkgaXRzIGNvbnRlbnRzXG4gICAgICBjb25zdCBzZXRDbGF1c2VNYXRjaCA9IHJlc3VsdC5zdGF0ZW1lbnRzWzBdLm1hdGNoKC9TRVRcXHMrKC4qPylcXHMrV0hFUkUvKTtcbiAgICAgIGV4cGVjdChzZXRDbGF1c2VNYXRjaCkudG9CZVRydXRoeSgpO1xuXG4gICAgICBjb25zdCBzZXRDbGF1c2UgPSBzZXRDbGF1c2VNYXRjaFsxXTtcbiAgICAgIGV4cGVjdChzZXRDbGF1c2UpLnRvQ29udGFpbihcInVuaXRfcHJpY2VcIik7XG4gICAgICBleHBlY3Qoc2V0Q2xhdXNlKS5ub3QudG9Db250YWluKFwicGFydF9uYW1lXCIpO1xuICAgICAgZXhwZWN0KHNldENsYXVzZSkubm90LnRvQ29udGFpbihcInBhcnRfY2F0ZWdvcnlcIik7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBpZGVudGl0eVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eToge30sXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB2YWxpZElucHV0LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlVTRVJfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtaXNzaW5nIHBhcnRJZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIHBhcnROYW1lOiBcIlVwZGF0ZWQgUGFydCBOYW1lXCIsXG4gICAgICAgICAgICBwYXJ0Q2F0ZWdvcnk6IFwiVXBkYXRlZCBDYXRlZ29yeVwiLFxuICAgICAgICAgICAgdW5pdFByaWNlOiAyOS45OSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG5vIGZpZWxkcyB0byB1cGRhdGVcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBwYXJ0SWQ6IFwicGFydC0xMjNcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG51bGwgcGFydElkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgcGFydElkOiBudWxsLFxuICAgICAgICAgICAgcGFydE5hbWU6IFwiVXBkYXRlZCBQYXJ0IE5hbWVcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGV4cGxpY2l0IG51bGwgZm9yIHVwZGF0ZSBmaWVsZHNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBwYXJ0SWQ6IFwicGFydC0xMjNcIixcbiAgICAgICAgICAgIHBhcnROYW1lOiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBUaGUgcmVzb2x2ZXIgcmVqZWN0cyBudWxsIHZhbHVlcyBmb3IgZmllbGRzLCBhbGlnbmluZyB3aXRoIHRoZSBiZWhhdmlvclxuICAgICAgLy8gd2Ugc2F3IGluIFVwZGF0ZU9yZGVyIHJlc29sdmVyXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5JTlZBTElEX0lOUFVUKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFjY2VwdCB6ZXJvIGFzIGEgdmFsaWQgdW5pdFByaWNlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgcGFydElkOiBcInBhcnQtMTIzXCIsXG4gICAgICAgICAgICB1bml0UHJpY2U6IDAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50cykudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFjY2VwdCBuZWdhdGl2ZSB1bml0UHJpY2VcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBwYXJ0SWQ6IFwicGFydC0xMjNcIixcbiAgICAgICAgICAgIHVuaXRQcmljZTogLTEwLjk5LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiUmVzcG9uc2UgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG1vY2tSZHNSZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiMTIzNDVcIiB9LFxuICAgICAgICAgICAgICB7IHN0cmluZ1ZhbHVlOiBcIlVwZGF0ZWQgUGFydCBOYW1lXCIgfSxcbiAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogXCJFbGVjdHJvbmljc1wiIH0sXG4gICAgICAgICAgICAgIHsgZG91YmxlVmFsdWU6IDI5Ljk5IH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X25hbWVcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfY2F0ZWdvcnlcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInVuaXRfcHJpY2VcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdHJhbnNmb3JtIFJEUyByZXN1bHQgdG8gZXhwZWN0ZWQgZm9ybWF0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbW9ja1Jkc1Jlc3VsdCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgcGFydElkOiBcIjEyMzQ1XCIsXG4gICAgICAgIHBhcnROYW1lOiBcIlVwZGF0ZWQgUGFydCBOYW1lXCIsXG4gICAgICAgIHBhcnRDYXRlZ29yeTogXCJFbGVjdHJvbmljc1wiLFxuICAgICAgICB1bml0UHJpY2U6IDI5Ljk5LFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgZW1wdHkgcmVzdWx0IHNldFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgICAgICAgICBjb2x1bW5NZXRhZGF0YTogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9uYW1lXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9jYXRlZ29yeVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInVuaXRfcHJpY2VcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGRhdGFiYXNlIGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6IFwiRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvclwiLFxuICAgICAgICAgIHR5cGU6IFwiUkRTRXJyb3JcIixcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoXCJEYXRhYmFzZSBjb25uZWN0aW9uIGVycm9yXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG51bGwgcmVzdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHVuZGVmaW5lZCByZXN1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiB1bmRlZmluZWQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBTUUwgc3ludGF4IGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdzeW50YXggZXJyb3IgYXQgb3IgbmVhciBcInBhcnRzXCInLFxuICAgICAgICAgIHR5cGU6IFwiU1FMU3ludGF4RXJyb3JcIixcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoJ3N5bnRheCBlcnJvciBhdCBvciBuZWFyIFwicGFydHNcIicpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHJlY29yZCBub3QgZm91bmQgZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9pZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfbmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfY2F0ZWdvcnlcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJ1bml0X3ByaWNlXCIgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSksXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtYWxmb3JtZWQgcmVzdWx0IGRhdGFcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBkb3VibGVWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X25hbWVcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2NhdGVnb3J5XCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwidW5pdF9wcmljZVwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoe1xuICAgICAgICBwYXJ0SWQ6IG51bGwsXG4gICAgICAgIHBhcnROYW1lOiBudWxsLFxuICAgICAgICBwYXJ0Q2F0ZWdvcnk6IG51bGwsXG4gICAgICAgIHVuaXRQcmljZTogbnVsbCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19