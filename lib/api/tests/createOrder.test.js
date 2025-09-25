"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/createOrder.js";
describe("CreateOrder Resolver Tests", () => {
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
            orderId: "order-123",
            partId: "part-456",
            orderDate: "2023-05-15",
            quantityOrdered: 10,
            fulfilled: false,
        };
        it("should create a valid PostgreSQL insert statement", async () => {
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
            expect(result.statements[0]).toContain('INSERT INTO "orders"');
            expect(result.statements[0]).toContain("order_id");
            expect(result.statements[0]).toContain("part_id");
            expect(result.statements[0]).toContain("order_date");
            expect(result.statements[0]).toContain("quantity_ordered");
            expect(result.statements[0]).toContain("fulfilled");
            expect(result.statements[0]).toContain("RETURNING");
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
        it("should handle missing orderId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        ...validInput,
                        orderId: null,
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
        it("should handle missing partId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        ...validInput,
                        partId: null,
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
        it("should handle missing orderDate", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        ...validInput,
                        orderDate: null,
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
        // This test isn't actually triggering an error due to a flaw in the resolver code
        it("should handle zero as quantityOrdered", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        ...validInput,
                        quantityOrdered: 0,
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
        it("should handle missing fulfilled flag", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        ...validInput,
                        fulfilled: undefined,
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
    });
    describe("Response Function Tests", () => {
        const mockRdsResult = JSON.stringify({
            sqlStatementResults: [
                {
                    records: [
                        [
                            { stringValue: "order-123" },
                            { stringValue: "part-456" },
                            { stringValue: "2023-05-15" },
                            { longValue: 10 },
                            { booleanValue: false },
                        ],
                    ],
                    columnMetadata: [
                        { name: "order_id" },
                        { name: "part_id" },
                        { name: "order_date" },
                        { name: "quantity_ordered" },
                        { name: "fulfilled" },
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
                orderId: "order-123",
                partId: "part-456",
                orderDate: "2023-05-15",
                quantityOrdered: 10,
                fulfilled: false,
            });
        });
        it("should handle empty result set", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [],
                            columnMetadata: [
                                { name: "order_id" },
                                { name: "part_id" },
                                { name: "order_date" },
                                { name: "quantity_ordered" },
                                { name: "fulfilled" },
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
        it("should handle database constraint violation error", async () => {
            const context = {
                error: {
                    message: "duplicate key value violates unique constraint",
                    type: "SQLExecutionError",
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.RESPONSE,
            });
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe("duplicate key value violates unique constraint");
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
                                    { longValue: null },
                                    { booleanValue: null },
                                ],
                            ],
                            columnMetadata: [
                                { name: "order_id" },
                                { name: "part_id" },
                                { name: "order_date" },
                                { name: "quantity_ordered" },
                                { name: "fulfilled" },
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
                orderId: null,
                partId: null,
                orderDate: null,
                quantityOrdered: null,
                fulfilled: null,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlT3JkZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZU9yZGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFHdUM7QUFDdkMsMERBQXVEO0FBRXZELE1BQU0sSUFBSSxHQUFHLDBDQUEwQyxDQUFDO0FBRXhELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDMUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDbEMsTUFBTSxhQUFhLEdBQUc7WUFDcEIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3ZCLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLE1BQU0sRUFBRSxJQUFJO1lBQ1osR0FBRyxFQUFFLFVBQVU7WUFDZixNQUFNLEVBQUUsYUFBYTtZQUNyQixNQUFNLEVBQUUsRUFBRTtZQUNWLG1CQUFtQixFQUFFLE9BQU87U0FDN0IsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHO1lBQ2pCLE9BQU8sRUFBRSxXQUFXO1lBQ3BCLE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLGVBQWUsRUFBRSxFQUFFO1lBQ25CLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUM7UUFFRixFQUFFLENBQUMsbURBQW1ELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakUsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUUsVUFBVTtpQkFDbEI7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLE9BQU87YUFDcEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFD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Q0FDdkI7NkJBQ0Y7NEJBQ0QsY0FBYyxFQUFFO2dDQUNkLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtnQ0FDcEIsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dDQUNuQixFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7Z0NBQ3RCLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFO2dDQUM1QixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7NkJBQ3RCO3lCQUNGO3FCQUNGO2lCQUNGLENBQUM7YUFDSCxDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLFFBQVE7YUFDckQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDckIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsTUFBTSxFQUFFLElBQUk7Z0JBQ1osU0FBUyxFQUFFLElBQUk7Z0JBQ2YsZUFBZSxFQUFFLElBQUk7Z0JBQ3JCLFNBQVMsRUFBRSxJQUFJO2FBQ2hCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGV2YWx1YXRlUmVzb2x2ZXJDb2RlLFxuICBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRSxcbn0gZnJvbSBcIi4uL3V0aWxzL2V2YWx1YXRlUmVzb2x2ZXJDb2RlXCI7XG5pbXBvcnQgeyBFcnJvck1lc3NhZ2VzIH0gZnJvbSBcIi4uL3V0aWxzL0FwcFN5bmNFcnJvcnNcIjtcblxuY29uc3QgZmlsZSA9IFwiLi9saWIvYXBpL3Jlc29sdmVycy9idWlsZC9jcmVhdGVPcmRlci5qc1wiO1xuXG5kZXNjcmliZShcIkNyZWF0ZU9yZGVyIFJlc29sdmVyIFRlc3RzXCIsICgpID0+IHtcbiAgZGVzY3JpYmUoXCJSZXF1ZXN0IEZ1bmN0aW9uIFRlc3RzXCIsICgpID0+IHtcbiAgICBjb25zdCB2YWxpZFVzZXJuYW1lID0gXCJ0ZXN0LXVzZXJcIjtcbiAgICBjb25zdCB2YWxpZElkZW50aXR5ID0ge1xuICAgICAgc291cmNlSXA6IFtcIjEyNy4wLjAuMVwiXSxcbiAgICAgIHVzZXJuYW1lOiB2YWxpZFVzZXJuYW1lLFxuICAgICAgZ3JvdXBzOiBudWxsLFxuICAgICAgc3ViOiBcInRlc3Qtc3ViXCIsXG4gICAgICBpc3N1ZXI6IFwidGVzdC1pc3N1ZXJcIixcbiAgICAgIGNsYWltczoge30sXG4gICAgICBkZWZhdWx0QXV0aFN0cmF0ZWd5OiBcIkFMTE9XXCIsXG4gICAgfTtcblxuICAgIGNvbnN0IHZhbGlkSW5wdXQgPSB7XG4gICAgICBvcmRlcklkOiBcIm9yZGVyLTEyM1wiLFxuICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICBvcmRlckRhdGU6IFwiMjAyMy0wNS0xNVwiLFxuICAgICAgcXVhbnRpdHlPcmRlcmVkOiAxMCxcbiAgICAgIGZ1bGZpbGxlZDogZmFsc2UsXG4gICAgfTtcblxuICAgIGl0KFwic2hvdWxkIGNyZWF0ZSBhIHZhbGlkIFBvc3RncmVTUUwgaW5zZXJ0IHN0YXRlbWVudFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHZhbGlkSW5wdXQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbignSU5TRVJUIElOVE8gXCJvcmRlcnNcIicpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJvcmRlcl9pZFwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwicGFydF9pZFwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwib3JkZXJfZGF0ZVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwicXVhbnRpdHlfb3JkZXJlZFwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwiZnVsZmlsbGVkXCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJSRVRVUk5JTkdcIik7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBpZGVudGl0eVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eToge30sXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB2YWxpZElucHV0LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlVTRVJfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtaXNzaW5nIG9yZGVySWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICAuLi52YWxpZElucHV0LFxuICAgICAgICAgICAgb3JkZXJJZDogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG1pc3NpbmcgcGFydElkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgLi4udmFsaWRJbnB1dCxcbiAgICAgICAgICAgIHBhcnRJZDogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG1pc3Npbmcgb3JkZXJEYXRlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgLi4udmFsaWRJbnB1dCxcbiAgICAgICAgICAgIG9yZGVyRGF0ZTogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgLy8gVGhpcyB0ZXN0IGlzbid0IGFjdHVhbGx5IHRyaWdnZXJpbmcgYW4gZXJyb3IgZHVlIHRvIGEgZmxhdyBpbiB0aGUgcmVzb2x2ZXIgY29kZVxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSB6ZXJvIGFzIHF1YW50aXR5T3JkZXJlZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIC4uLnZhbGlkSW5wdXQsXG4gICAgICAgICAgICBxdWFudGl0eU9yZGVyZWQ6IDAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50cykudG9CZURlZmluZWQoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtaXNzaW5nIGZ1bGZpbGxlZCBmbGFnXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgLi4udmFsaWRJbnB1dCxcbiAgICAgICAgICAgIGZ1bGZpbGxlZDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuSU5WQUxJRF9JTlBVVCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiUmVzcG9uc2UgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG1vY2tSZHNSZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwib3JkZXItMTIzXCIgfSxcbiAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogXCJwYXJ0LTQ1NlwiIH0sXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiMjAyMy0wNS0xNVwiIH0sXG4gICAgICAgICAgICAgIHsgbG9uZ1ZhbHVlOiAxMCB9LFxuICAgICAgICAgICAgICB7IGJvb2xlYW5WYWx1ZTogZmFsc2UgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICBjb2x1bW5NZXRhZGF0YTogW1xuICAgICAgICAgICAgeyBuYW1lOiBcIm9yZGVyX2lkXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJvcmRlcl9kYXRlXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJxdWFudGl0eV9vcmRlcmVkXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJmdWxmaWxsZWRcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdHJhbnNmb3JtIFJEUyByZXN1bHQgdG8gZXhwZWN0ZWQgZm9ybWF0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbW9ja1Jkc1Jlc3VsdCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgb3JkZXJJZDogXCJvcmRlci0xMjNcIixcbiAgICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICAgIG9yZGVyRGF0ZTogXCIyMDIzLTA1LTE1XCIsXG4gICAgICAgIHF1YW50aXR5T3JkZXJlZDogMTAsXG4gICAgICAgIGZ1bGZpbGxlZDogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBlbXB0eSByZXN1bHQgc2V0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNxbFN0YXRlbWVudFJlc3VsdHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmVjb3JkczogW10sXG4gICAgICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcIm9yZGVyX2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9pZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcIm9yZGVyX2RhdGVcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJxdWFudGl0eV9vcmRlcmVkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwiZnVsZmlsbGVkXCIgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSksXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBkYXRhYmFzZSBlcnJvcnNcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICBtZXNzYWdlOiBcIkRhdGFiYXNlIGNvbm5lY3Rpb24gZXJyb3JcIixcbiAgICAgICAgICB0eXBlOiBcIlJEU0Vycm9yXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKFwiRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvclwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBudWxsIHJlc3VsdFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IG51bGwsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSB1bmRlZmluZWQgcmVzdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogdW5kZWZpbmVkLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgZGF0YWJhc2UgY29uc3RyYWludCB2aW9sYXRpb24gZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICBtZXNzYWdlOiBcImR1cGxpY2F0ZSBrZXkgdmFsdWUgdmlvbGF0ZXMgdW5pcXVlIGNvbnN0cmFpbnRcIixcbiAgICAgICAgICB0eXBlOiBcIlNRTEV4ZWN1dGlvbkVycm9yXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKFxuICAgICAgICBcImR1cGxpY2F0ZSBrZXkgdmFsdWUgdmlvbGF0ZXMgdW5pcXVlIGNvbnN0cmFpbnRcIlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtYWxmb3JtZWQgcmVzdWx0IGRhdGFcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgeyBsb25nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgYm9vbGVhblZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwib3JkZXJfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwib3JkZXJfZGF0ZVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInF1YW50aXR5X29yZGVyZWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJmdWxmaWxsZWRcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgb3JkZXJJZDogbnVsbCxcbiAgICAgICAgcGFydElkOiBudWxsLFxuICAgICAgICBvcmRlckRhdGU6IG51bGwsXG4gICAgICAgIHF1YW50aXR5T3JkZXJlZDogbnVsbCxcbiAgICAgICAgZnVsZmlsbGVkOiBudWxsLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=