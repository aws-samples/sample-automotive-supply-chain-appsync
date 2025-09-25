"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/updateOrder.js";
describe("UpdateOrder Resolver Tests", () => {
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
            quantityOrdered: 15,
            fulfilled: true,
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
            expect(result.statements[0]).toContain('UPDATE "orders" SET');
            expect(result.statements[0]).toContain("part_id");
            expect(result.statements[0]).toContain("order_date");
            expect(result.statements[0]).toContain("quantity_ordered");
            expect(result.statements[0]).toContain("fulfilled");
            expect(result.statements[0]).toContain("WHERE");
            expect(result.statements[0]).toContain("order_id");
            expect(result.statements[0]).toContain("RETURNING");
        });
        it("should create a valid PostgreSQL update statement with only some fields", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        orderId: "order-123",
                        fulfilled: true,
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
            expect(result.statements[0]).toContain('UPDATE "orders" SET');
            expect(result.statements[0]).toContain("fulfilled");
            // Check that only fulfilled is in the SET clause
            const setClauseMatch = result.statements[0].match(/SET\s+(.*?)\s+WHERE/);
            expect(setClauseMatch).toBeTruthy();
            const setClause = setClauseMatch[1];
            expect(setClause).toContain("fulfilled");
            expect(setClause).not.toContain("part_id");
            expect(setClause).not.toContain("order_date");
            expect(setClause).not.toContain("quantity_ordered");
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
                        partId: "part-456",
                        orderDate: "2023-05-15",
                        quantityOrdered: 15,
                        fulfilled: true,
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
                        orderId: "order-123",
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
        it("should handle null orderId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        orderId: null,
                        partId: "part-456",
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
                        orderId: "order-123",
                        partId: null,
                    },
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            // The resolver rejects null values for fields
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should accept zero as a valid quantityOrdered", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        orderId: "order-123",
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
    });
    describe("Response Function Tests", () => {
        const mockRdsResult = JSON.stringify({
            sqlStatementResults: [
                {
                    records: [
                        [
                            { stringValue: "12345" },
                            { stringValue: "part-456" },
                            { stringValue: "2023-05-15" },
                            { longValue: 15 },
                            { booleanValue: true },
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
                orderId: "12345",
                partId: "part-456",
                orderDate: "2023-05-15",
                quantityOrdered: 15,
                fulfilled: true,
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
        it("should handle SQL syntax errors", async () => {
            const context = {
                error: {
                    message: 'syntax error at or near "orders"',
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
            expect(response.error?.message).toBe('syntax error at or near "orders"');
        });
        it("should handle record not found error", async () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlT3JkZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVwZGF0ZU9yZGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFHdUM7QUFDdkMsMERBQXVEO0FBRXZELE1BQU0sSUFBSSxHQUFHLDBDQUEwQyxDQUFDO0FBRXhELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDMUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDbEMsTUFBTSxhQUFhLEdBQUc7WUFDcEIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3ZCLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLE1BQU0sRUFBRSxJQUFJO1lBQ1osR0FBRyxFQUFFLFVBQVU7WUFDZixNQUFNLEVBQUUsYUFBYTtZQUNyQixNQUFNLEVBQUUsRUFBRTtZQUNWLG1CQUFtQixFQUFFLE9BQU87U0FDN0IsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHO1lBQ2pCLE9BQU8sRUFBRSxXQUFXO1lBQ3BCLE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFNBQVMsRUFBRSxZQUFZO1lBQ3ZCLGVBQWUsRUFBRSxFQUFFO1lBQ25CLFNBQVMsRUFBRSxJQUFJO1NBQ2hCLENBQUM7UUFFRixFQUFFLENBQUMsbUVBQW1FLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakYsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUUsVUFBVTtpQkFDbEI7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLE9BQU87YUFDcEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFD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Q0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGV2YWx1YXRlUmVzb2x2ZXJDb2RlLFxuICBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRSxcbn0gZnJvbSBcIi4uL3V0aWxzL2V2YWx1YXRlUmVzb2x2ZXJDb2RlXCI7XG5pbXBvcnQgeyBFcnJvck1lc3NhZ2VzIH0gZnJvbSBcIi4uL3V0aWxzL0FwcFN5bmNFcnJvcnNcIjtcblxuY29uc3QgZmlsZSA9IFwiLi9saWIvYXBpL3Jlc29sdmVycy9idWlsZC91cGRhdGVPcmRlci5qc1wiO1xuXG5kZXNjcmliZShcIlVwZGF0ZU9yZGVyIFJlc29sdmVyIFRlc3RzXCIsICgpID0+IHtcbiAgZGVzY3JpYmUoXCJSZXF1ZXN0IEZ1bmN0aW9uIFRlc3RzXCIsICgpID0+IHtcbiAgICBjb25zdCB2YWxpZFVzZXJuYW1lID0gXCJ0ZXN0LXVzZXJcIjtcbiAgICBjb25zdCB2YWxpZElkZW50aXR5ID0ge1xuICAgICAgc291cmNlSXA6IFtcIjEyNy4wLjAuMVwiXSxcbiAgICAgIHVzZXJuYW1lOiB2YWxpZFVzZXJuYW1lLFxuICAgICAgZ3JvdXBzOiBudWxsLFxuICAgICAgc3ViOiBcInRlc3Qtc3ViXCIsXG4gICAgICBpc3N1ZXI6IFwidGVzdC1pc3N1ZXJcIixcbiAgICAgIGNsYWltczoge30sXG4gICAgICBkZWZhdWx0QXV0aFN0cmF0ZWd5OiBcIkFMTE9XXCIsXG4gICAgfTtcblxuICAgIGNvbnN0IHZhbGlkSW5wdXQgPSB7XG4gICAgICBvcmRlcklkOiBcIm9yZGVyLTEyM1wiLFxuICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICBvcmRlckRhdGU6IFwiMjAyMy0wNS0xNVwiLFxuICAgICAgcXVhbnRpdHlPcmRlcmVkOiAxNSxcbiAgICAgIGZ1bGZpbGxlZDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgY3JlYXRlIGEgdmFsaWQgUG9zdGdyZVNRTCB1cGRhdGUgc3RhdGVtZW50IHdpdGggYWxsIGZpZWxkc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHZhbGlkSW5wdXQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbignVVBEQVRFIFwib3JkZXJzXCIgU0VUJyk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInBhcnRfaWRcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcIm9yZGVyX2RhdGVcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInF1YW50aXR5X29yZGVyZWRcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcImZ1bGZpbGxlZFwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwiV0hFUkVcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcIm9yZGVyX2lkXCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJSRVRVUk5JTkdcIik7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBjcmVhdGUgYSB2YWxpZCBQb3N0Z3JlU1FMIHVwZGF0ZSBzdGF0ZW1lbnQgd2l0aCBvbmx5IHNvbWUgZmllbGRzXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgb3JkZXJJZDogXCJvcmRlci0xMjNcIixcbiAgICAgICAgICAgIGZ1bGZpbGxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oJ1VQREFURSBcIm9yZGVyc1wiIFNFVCcpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJmdWxmaWxsZWRcIik7XG5cbiAgICAgIC8vIENoZWNrIHRoYXQgb25seSBmdWxmaWxsZWQgaXMgaW4gdGhlIFNFVCBjbGF1c2VcbiAgICAgIGNvbnN0IHNldENsYXVzZU1hdGNoID0gcmVzdWx0LnN0YXRlbWVudHNbMF0ubWF0Y2goL1NFVFxccysoLio/KVxccytXSEVSRS8pO1xuICAgICAgZXhwZWN0KHNldENsYXVzZU1hdGNoKS50b0JlVHJ1dGh5KCk7XG5cbiAgICAgIGNvbnN0IHNldENsYXVzZSA9IHNldENsYXVzZU1hdGNoWzFdO1xuICAgICAgZXhwZWN0KHNldENsYXVzZSkudG9Db250YWluKFwiZnVsZmlsbGVkXCIpO1xuICAgICAgZXhwZWN0KHNldENsYXVzZSkubm90LnRvQ29udGFpbihcInBhcnRfaWRcIik7XG4gICAgICBleHBlY3Qoc2V0Q2xhdXNlKS5ub3QudG9Db250YWluKFwib3JkZXJfZGF0ZVwiKTtcbiAgICAgIGV4cGVjdChzZXRDbGF1c2UpLm5vdC50b0NvbnRhaW4oXCJxdWFudGl0eV9vcmRlcmVkXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG1pc3NpbmcgaWRlbnRpdHlcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHt9LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDogdmFsaWRJbnB1dCxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5VU0VSX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBvcmRlcklkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICAgICAgICBvcmRlckRhdGU6IFwiMjAyMy0wNS0xNVwiLFxuICAgICAgICAgICAgcXVhbnRpdHlPcmRlcmVkOiAxNSxcbiAgICAgICAgICAgIGZ1bGZpbGxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG5vIGZpZWxkcyB0byB1cGRhdGVcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBvcmRlcklkOiBcIm9yZGVyLTEyM1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuSU5WQUxJRF9JTlBVVCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbnVsbCBvcmRlcklkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgb3JkZXJJZDogbnVsbCxcbiAgICAgICAgICAgIHBhcnRJZDogXCJwYXJ0LTQ1NlwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuSU5WQUxJRF9JTlBVVCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgZXhwbGljaXQgbnVsbCBmb3IgdXBkYXRlIGZpZWxkc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIG9yZGVySWQ6IFwib3JkZXItMTIzXCIsXG4gICAgICAgICAgICBwYXJ0SWQ6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRoZSByZXNvbHZlciByZWplY3RzIG51bGwgdmFsdWVzIGZvciBmaWVsZHNcbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgYWNjZXB0IHplcm8gYXMgYSB2YWxpZCBxdWFudGl0eU9yZGVyZWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgICBvcmRlcklkOiBcIm9yZGVyLTEyM1wiLFxuICAgICAgICAgICAgcXVhbnRpdHlPcmRlcmVkOiAwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiUmVzcG9uc2UgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG1vY2tSZHNSZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiMTIzNDVcIiB9LFxuICAgICAgICAgICAgICB7IHN0cmluZ1ZhbHVlOiBcInBhcnQtNDU2XCIgfSxcbiAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogXCIyMDIzLTA1LTE1XCIgfSxcbiAgICAgICAgICAgICAgeyBsb25nVmFsdWU6IDE1IH0sXG4gICAgICAgICAgICAgIHsgYm9vbGVhblZhbHVlOiB0cnVlIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJvcmRlcl9pZFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwicGFydF9pZFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwib3JkZXJfZGF0ZVwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwicXVhbnRpdHlfb3JkZXJlZFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiZnVsZmlsbGVkXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHRyYW5zZm9ybSBSRFMgcmVzdWx0IHRvIGV4cGVjdGVkIGZvcm1hdFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IG1vY2tSZHNSZXN1bHQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbCh7XG4gICAgICAgIG9yZGVySWQ6IFwiMTIzNDVcIixcbiAgICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICAgIG9yZGVyRGF0ZTogXCIyMDIzLTA1LTE1XCIsXG4gICAgICAgIHF1YW50aXR5T3JkZXJlZDogMTUsXG4gICAgICAgIGZ1bGZpbGxlZDogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGVtcHR5IHJlc3VsdCBzZXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwib3JkZXJfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwib3JkZXJfZGF0ZVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInF1YW50aXR5X29yZGVyZWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJmdWxmaWxsZWRcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGRhdGFiYXNlIGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6IFwiRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvclwiLFxuICAgICAgICAgIHR5cGU6IFwiUkRTRXJyb3JcIixcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoXCJEYXRhYmFzZSBjb25uZWN0aW9uIGVycm9yXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG51bGwgcmVzdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHVuZGVmaW5lZCByZXN1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiB1bmRlZmluZWQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBTUUwgc3ludGF4IGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdzeW50YXggZXJyb3IgYXQgb3IgbmVhciBcIm9yZGVyc1wiJyxcbiAgICAgICAgICB0eXBlOiBcIlNRTFN5bnRheEVycm9yXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKCdzeW50YXggZXJyb3IgYXQgb3IgbmVhciBcIm9yZGVyc1wiJyk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgcmVjb3JkIG5vdCBmb3VuZCBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgICAgICAgICBjb2x1bW5NZXRhZGF0YTogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJvcmRlcl9pZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJvcmRlcl9kYXRlXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicXVhbnRpdHlfb3JkZXJlZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcImZ1bGZpbGxlZFwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWFsZm9ybWVkIHJlc3VsdCBkYXRhXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNxbFN0YXRlbWVudFJlc3VsdHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmVjb3JkczogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgbG9uZ1ZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICB7IGJvb2xlYW5WYWx1ZTogbnVsbCB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcIm9yZGVyX2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9pZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcIm9yZGVyX2RhdGVcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJxdWFudGl0eV9vcmRlcmVkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwiZnVsZmlsbGVkXCIgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSksXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbCh7XG4gICAgICAgIG9yZGVySWQ6IG51bGwsXG4gICAgICAgIHBhcnRJZDogbnVsbCxcbiAgICAgICAgb3JkZXJEYXRlOiBudWxsLFxuICAgICAgICBxdWFudGl0eU9yZGVyZWQ6IG51bGwsXG4gICAgICAgIGZ1bGZpbGxlZDogbnVsbCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19