"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/updateShipment.js";
describe("UpdateShipment Resolver Tests", () => {
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
            shipmentId: "ship-123",
            partId: "part-456",
            shipmentDate: "2023-05-15",
            quantityShipped: 15,
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
            expect(result.statements[0]).toContain('UPDATE "shipments" SET');
            expect(result.statements[0]).toContain("part_id");
            expect(result.statements[0]).toContain("shipment_date");
            expect(result.statements[0]).toContain("quantity_shipped");
            expect(result.statements[0]).toContain("WHERE");
            expect(result.statements[0]).toContain("shipment_id");
            expect(result.statements[0]).toContain("RETURNING");
        });
        it("should create a valid PostgreSQL update statement with only some fields", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        shipmentId: "ship-123",
                        quantityShipped: 25,
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
            expect(result.statements[0]).toContain('UPDATE "shipments" SET');
            // Extract the SET clause and verify its contents
            const setClauseMatch = result.statements[0].match(/SET\s+(.*?)\s+WHERE/);
            expect(setClauseMatch).toBeTruthy();
            const setClause = setClauseMatch[1];
            expect(setClause).toContain("quantity_shipped");
            expect(setClause).not.toContain("part_id");
            expect(setClause).not.toContain("shipment_date");
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
        it("should handle missing shipmentId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        partId: "part-456",
                        shipmentDate: "2023-05-15",
                        quantityShipped: 15,
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
                        shipmentId: "ship-123",
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
        it("should handle null shipmentId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        shipmentId: null,
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
                        shipmentId: "ship-123",
                        partId: null,
                    },
                },
            };
            const response = await (0, evaluateResolverCode_1.evaluateResolverCode)({
                filePath: file,
                context,
                functionToEvaluate: evaluateResolverCode_1.RESOLVER_FUNCTIONS_TYPE.REQUEST,
            });
            // Based on previous tests, we expect the resolver to reject null values
            expect(response).toBeDefined();
            expect(response.error).toBeDefined();
            expect(response.error?.message).toBe(AppSyncErrors_1.ErrorMessages.INVALID_INPUT);
        });
        it("should accept zero as a valid quantityShipped", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        shipmentId: "ship-123",
                        quantityShipped: 0,
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
        it("should accept negative quantityShipped", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    input: {
                        shipmentId: "ship-123",
                        quantityShipped: -5,
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
                            { stringValue: "ship-123" },
                            { stringValue: "part-456" },
                            { stringValue: "2023-05-15" },
                            { longValue: 15 },
                        ],
                    ],
                    columnMetadata: [
                        { name: "shipment_id" },
                        { name: "part_id" },
                        { name: "shipment_date" },
                        { name: "quantity_shipped" },
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
                shipmentId: "ship-123",
                partId: "part-456",
                shipmentDate: "2023-05-15",
                quantityShipped: 15,
            });
        });
        it("should handle empty result set", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [],
                            columnMetadata: [
                                { name: "shipment_id" },
                                { name: "part_id" },
                                { name: "shipment_date" },
                                { name: "quantity_shipped" },
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
                    message: 'syntax error at or near "shipments"',
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
            expect(response.error?.message).toBe('syntax error at or near "shipments"');
        });
        it("should handle record not found error", async () => {
            const context = {
                result: JSON.stringify({
                    sqlStatementResults: [
                        {
                            records: [],
                            columnMetadata: [
                                { name: "shipment_id" },
                                { name: "part_id" },
                                { name: "shipment_date" },
                                { name: "quantity_shipped" },
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
                                ],
                            ],
                            columnMetadata: [
                                { name: "shipment_id" },
                                { name: "part_id" },
                                { name: "shipment_date" },
                                { name: "quantity_shipped" },
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
                shipmentId: null,
                partId: null,
                shipmentDate: null,
                quantityShipped: null,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlU2hpcG1lbnQudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVwZGF0ZVNoaXBtZW50LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFHdUM7QUFDdkMsMERBQXVEO0FBRXZELE1BQU0sSUFBSSxHQUFHLDZDQUE2QyxDQUFDO0FBRTNELFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7SUFDN0MsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUN0QyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUM7UUFDbEMsTUFBTSxhQUFhLEdBQUc7WUFDcEIsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3ZCLFFBQVEsRUFBRSxhQUFhO1lBQ3ZCLE1BQU0sRUFBRSxJQUFJO1lBQ1osR0FBRyxFQUFFLFVBQVU7WUFDZixNQUFNLEVBQUUsYUFBYTtZQUNyQixNQUFNLEVBQUUsRUFBRTtZQUNWLG1CQUFtQixFQUFFLE9BQU87U0FDN0IsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHO1lBQ2pCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFlBQVksRUFBRSxZQUFZO1lBQzFCLGVBQWUsRUFBRSxFQUFFO1NBQ3BCLENBQUM7UUFFRixFQUFFLENBQUMsbUVBQW1FLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakYsTUFBTSxPQUFPLEdBQUc7Z0JBQ2QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCxLQUFLLEVBQUUsVUFBVTtpQkFDbEI7YUFDRixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDJDQUFvQixFQUFDO2dCQUMxQyxRQUFRLEVBQUUsSUFBSTtnQkFDZCxPQUFPO2dCQUNQLGtCQUFrQixFQUFFLDhDQUF1QixDQUFDLE9BQU87YUFDcEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFD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STthQUN0QixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBldmFsdWF0ZVJlc29sdmVyQ29kZSxcbiAgUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUsXG59IGZyb20gXCIuLi91dGlscy9ldmFsdWF0ZVJlc29sdmVyQ29kZVwiO1xuaW1wb3J0IHsgRXJyb3JNZXNzYWdlcyB9IGZyb20gXCIuLi91dGlscy9BcHBTeW5jRXJyb3JzXCI7XG5cbmNvbnN0IGZpbGUgPSBcIi4vbGliL2FwaS9yZXNvbHZlcnMvYnVpbGQvdXBkYXRlU2hpcG1lbnQuanNcIjtcblxuZGVzY3JpYmUoXCJVcGRhdGVTaGlwbWVudCBSZXNvbHZlciBUZXN0c1wiLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwiUmVxdWVzdCBGdW5jdGlvbiBUZXN0c1wiLCAoKSA9PiB7XG4gICAgY29uc3QgdmFsaWRVc2VybmFtZSA9IFwidGVzdC11c2VyXCI7XG4gICAgY29uc3QgdmFsaWRJZGVudGl0eSA9IHtcbiAgICAgIHNvdXJjZUlwOiBbXCIxMjcuMC4wLjFcIl0sXG4gICAgICB1c2VybmFtZTogdmFsaWRVc2VybmFtZSxcbiAgICAgIGdyb3VwczogbnVsbCxcbiAgICAgIHN1YjogXCJ0ZXN0LXN1YlwiLFxuICAgICAgaXNzdWVyOiBcInRlc3QtaXNzdWVyXCIsXG4gICAgICBjbGFpbXM6IHt9LFxuICAgICAgZGVmYXVsdEF1dGhTdHJhdGVneTogXCJBTExPV1wiLFxuICAgIH07XG5cbiAgICBjb25zdCB2YWxpZElucHV0ID0ge1xuICAgICAgc2hpcG1lbnRJZDogXCJzaGlwLTEyM1wiLFxuICAgICAgcGFydElkOiBcInBhcnQtNDU2XCIsXG4gICAgICBzaGlwbWVudERhdGU6IFwiMjAyMy0wNS0xNVwiLFxuICAgICAgcXVhbnRpdHlTaGlwcGVkOiAxNSxcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgY3JlYXRlIGEgdmFsaWQgUG9zdGdyZVNRTCB1cGRhdGUgc3RhdGVtZW50IHdpdGggYWxsIGZpZWxkc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHZhbGlkSW5wdXQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbignVVBEQVRFIFwic2hpcG1lbnRzXCIgU0VUJyk7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInBhcnRfaWRcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInNoaXBtZW50X2RhdGVcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcInF1YW50aXR5X3NoaXBwZWRcIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHNbMF0pLnRvQ29udGFpbihcIldIRVJFXCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJzaGlwbWVudF9pZFwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwiUkVUVVJOSU5HXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY3JlYXRlIGEgdmFsaWQgUG9zdGdyZVNRTCB1cGRhdGUgc3RhdGVtZW50IHdpdGggb25seSBzb21lIGZpZWxkc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIHNoaXBtZW50SWQ6IFwic2hpcC0xMjNcIixcbiAgICAgICAgICAgIHF1YW50aXR5U2hpcHBlZDogMjUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50cykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKCdVUERBVEUgXCJzaGlwbWVudHNcIiBTRVQnKTtcblxuICAgICAgLy8gRXh0cmFjdCB0aGUgU0VUIGNsYXVzZSBhbmQgdmVyaWZ5IGl0cyBjb250ZW50c1xuICAgICAgY29uc3Qgc2V0Q2xhdXNlTWF0Y2ggPSByZXN1bHQuc3RhdGVtZW50c1swXS5tYXRjaCgvU0VUXFxzKyguKj8pXFxzK1dIRVJFLyk7XG4gICAgICBleHBlY3Qoc2V0Q2xhdXNlTWF0Y2gpLnRvQmVUcnV0aHkoKTtcblxuICAgICAgY29uc3Qgc2V0Q2xhdXNlID0gc2V0Q2xhdXNlTWF0Y2hbMV07XG4gICAgICBleHBlY3Qoc2V0Q2xhdXNlKS50b0NvbnRhaW4oXCJxdWFudGl0eV9zaGlwcGVkXCIpO1xuICAgICAgZXhwZWN0KHNldENsYXVzZSkubm90LnRvQ29udGFpbihcInBhcnRfaWRcIik7XG4gICAgICBleHBlY3Qoc2V0Q2xhdXNlKS5ub3QudG9Db250YWluKFwic2hpcG1lbnRfZGF0ZVwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtaXNzaW5nIGlkZW50aXR5XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB7fSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHZhbGlkSW5wdXQsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuVVNFUl9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG1pc3Npbmcgc2hpcG1lbnRJZFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIHBhcnRJZDogXCJwYXJ0LTQ1NlwiLFxuICAgICAgICAgICAgc2hpcG1lbnREYXRlOiBcIjIwMjMtMDUtMTVcIixcbiAgICAgICAgICAgIHF1YW50aXR5U2hpcHBlZDogMTUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5JTlZBTElEX0lOUFVUKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBubyBmaWVsZHMgdG8gdXBkYXRlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgc2hpcG1lbnRJZDogXCJzaGlwLTEyM1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuSU5WQUxJRF9JTlBVVCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbnVsbCBzaGlwbWVudElkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgc2hpcG1lbnRJZDogbnVsbCxcbiAgICAgICAgICAgIHBhcnRJZDogXCJwYXJ0LTQ1NlwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuSU5WQUxJRF9JTlBVVCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgZXhwbGljaXQgbnVsbCBmb3IgdXBkYXRlIGZpZWxkc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgIHNoaXBtZW50SWQ6IFwic2hpcC0xMjNcIixcbiAgICAgICAgICAgIHBhcnRJZDogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgLy8gQmFzZWQgb24gcHJldmlvdXMgdGVzdHMsIHdlIGV4cGVjdCB0aGUgcmVzb2x2ZXIgdG8gcmVqZWN0IG51bGwgdmFsdWVzXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5JTlZBTElEX0lOUFVUKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFjY2VwdCB6ZXJvIGFzIGEgdmFsaWQgcXVhbnRpdHlTaGlwcGVkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgc2hpcG1lbnRJZDogXCJzaGlwLTEyM1wiLFxuICAgICAgICAgICAgcXVhbnRpdHlTaGlwcGVkOiAwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVRVUVTVCxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0LnN0YXRlbWVudHMpLnRvQmVEZWZpbmVkKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBhY2NlcHQgbmVnYXRpdmUgcXVhbnRpdHlTaGlwcGVkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgc2hpcG1lbnRJZDogXCJzaGlwLTEyM1wiLFxuICAgICAgICAgICAgcXVhbnRpdHlTaGlwcGVkOiAtNSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzKS50b0JlRGVmaW5lZCgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIlJlc3BvbnNlIEZ1bmN0aW9uIFRlc3RzXCIsICgpID0+IHtcbiAgICBjb25zdCBtb2NrUmRzUmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICB7XG4gICAgICAgICAgcmVjb3JkczogW1xuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB7IHN0cmluZ1ZhbHVlOiBcInNoaXAtMTIzXCIgfSxcbiAgICAgICAgICAgICAgeyBzdHJpbmdWYWx1ZTogXCJwYXJ0LTQ1NlwiIH0sXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiMjAyMy0wNS0xNVwiIH0sXG4gICAgICAgICAgICAgIHsgbG9uZ1ZhbHVlOiAxNSB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICB7IG5hbWU6IFwic2hpcG1lbnRfaWRcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfaWRcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInNoaXBtZW50X2RhdGVcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInF1YW50aXR5X3NoaXBwZWRcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdHJhbnNmb3JtIFJEUyByZXN1bHQgdG8gZXhwZWN0ZWQgZm9ybWF0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbW9ja1Jkc1Jlc3VsdCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgc2hpcG1lbnRJZDogXCJzaGlwLTEyM1wiLFxuICAgICAgICBwYXJ0SWQ6IFwicGFydC00NTZcIixcbiAgICAgICAgc2hpcG1lbnREYXRlOiBcIjIwMjMtMDUtMTVcIixcbiAgICAgICAgcXVhbnRpdHlTaGlwcGVkOiAxNSxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGVtcHR5IHJlc3VsdCBzZXRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgc3FsU3RhdGVtZW50UmVzdWx0czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICByZWNvcmRzOiBbXSxcbiAgICAgICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwic2hpcG1lbnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwic2hpcG1lbnRfZGF0ZVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInF1YW50aXR5X3NoaXBwZWRcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIGRhdGFiYXNlIGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6IFwiRGF0YWJhc2UgY29ubmVjdGlvbiBlcnJvclwiLFxuICAgICAgICAgIHR5cGU6IFwiUkRTRXJyb3JcIixcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoXCJEYXRhYmFzZSBjb25uZWN0aW9uIGVycm9yXCIpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIG51bGwgcmVzdWx0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHVuZGVmaW5lZCByZXN1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiB1bmRlZmluZWQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKEVycm9yTWVzc2FnZXMuUkVTT1VSQ0VfTk9UX0ZPVU5EKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBTUUwgc3ludGF4IGVycm9yc1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG1lc3NhZ2U6ICdzeW50YXggZXJyb3IgYXQgb3IgbmVhciBcInNoaXBtZW50c1wiJyxcbiAgICAgICAgICB0eXBlOiBcIlNRTFN5bnRheEVycm9yXCIsXG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yPy5tZXNzYWdlKS50b0JlKFxuICAgICAgICAnc3ludGF4IGVycm9yIGF0IG9yIG5lYXIgXCJzaGlwbWVudHNcIidcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgcmVjb3JkIG5vdCBmb3VuZCBlcnJvclwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgICAgICAgICBjb2x1bW5NZXRhZGF0YTogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJzaGlwbWVudF9pZFwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJzaGlwbWVudF9kYXRlXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicXVhbnRpdHlfc2hpcHBlZFwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWFsZm9ybWVkIHJlc3VsdCBkYXRhXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNxbFN0YXRlbWVudFJlc3VsdHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmVjb3JkczogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgbG9uZ1ZhbHVlOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgY29sdW1uTWV0YWRhdGE6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwic2hpcG1lbnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwic2hpcG1lbnRfZGF0ZVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInF1YW50aXR5X3NoaXBwZWRcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgc2hpcG1lbnRJZDogbnVsbCxcbiAgICAgICAgcGFydElkOiBudWxsLFxuICAgICAgICBzaGlwbWVudERhdGU6IG51bGwsXG4gICAgICAgIHF1YW50aXR5U2hpcHBlZDogbnVsbCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19