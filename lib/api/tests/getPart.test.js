"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateResolverCode_1 = require("../utils/evaluateResolverCode");
const AppSyncErrors_1 = require("../utils/AppSyncErrors");
const file = "./lib/api/resolvers/build/getPart.js";
describe("GetPart Resolver Tests", () => {
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
        const validPartId = 12345;
        it("should create a valid PostgreSQL select statement", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    partId: validPartId,
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
            expect(result.statements[0]).toContain('SELECT * FROM "parts"');
            expect(result.statements[0]).toContain("WHERE");
            expect(result.statements[0]).toContain("part_id");
        });
        it("should handle missing identity", async () => {
            const context = {
                identity: {},
                arguments: {
                    partId: validPartId,
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
                    partId: null,
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
        it("should handle undefined partId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {},
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
        it("should handle zero as a partId", async () => {
            const context = {
                identity: validIdentity,
                arguments: {
                    partId: 0,
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
            // Zero is falsy in JavaScript, so it would fail validation
        });
    });
    describe("Response Function Tests", () => {
        const mockRdsResult = JSON.stringify({
            sqlStatementResults: [
                {
                    records: [
                        [
                            { stringValue: "12345" },
                            { stringValue: "Test Part" },
                            { stringValue: "Electronics" },
                            { doubleValue: 19.99 },
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
                partName: "Test Part",
                partCategory: "Electronics",
                unitPrice: 19.99,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFydC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2V0UGFydC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBR3VDO0FBQ3ZDLDBEQUF1RDtBQUV2RCxNQUFNLElBQUksR0FBRyxzQ0FBc0MsQ0FBQztBQUVwRCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBQ3RDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLE1BQU0sYUFBYSxHQUFHO1lBQ3BCLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQztZQUN2QixRQUFRLEVBQUUsYUFBYTtZQUN2QixNQUFNLEVBQUUsSUFBSTtZQUNaLEdBQUcsRUFBRSxVQUFVO1lBQ2YsTUFBTSxFQUFFLGFBQWE7WUFDckIsTUFBTSxFQUFFLEVBQUU7WUFDVixtQkFBbUIsRUFBRSxPQUFPO1NBQzdCLENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFFMUIsRUFBRSxDQUFDLG1EQUFtRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pFLE1BQU0sT0FBTyxHQUFHO2dCQUNkLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixTQUFTLEVBQUU7b0JBQ1QsTUFBTSxFQUFFLFdBQVc7aUJBQ3BCO2FBQ0YsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxPQUFPO2FBQ3BELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMs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QUNuQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7Z0NBQ3JCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRTtnQ0FDekIsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFOzZCQUN2Qjt5QkFDRjtxQkFDRjtpQkFDRixDQUFDO2FBQ0gsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSwyQ0FBb0IsRUFBQztnQkFDMUMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsT0FBTztnQkFDUCxrQkFBa0IsRUFBRSw4Q0FBdUIsQ0FBQyxRQUFRO2FBQ3JELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFlBQVksRUFBRSxJQUFJO2dCQUNsQixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBldmFsdWF0ZVJlc29sdmVyQ29kZSxcbiAgUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUsXG59IGZyb20gXCIuLi91dGlscy9ldmFsdWF0ZVJlc29sdmVyQ29kZVwiO1xuaW1wb3J0IHsgRXJyb3JNZXNzYWdlcyB9IGZyb20gXCIuLi91dGlscy9BcHBTeW5jRXJyb3JzXCI7XG5cbmNvbnN0IGZpbGUgPSBcIi4vbGliL2FwaS9yZXNvbHZlcnMvYnVpbGQvZ2V0UGFydC5qc1wiO1xuXG5kZXNjcmliZShcIkdldFBhcnQgUmVzb2x2ZXIgVGVzdHNcIiwgKCkgPT4ge1xuICBkZXNjcmliZShcIlJlcXVlc3QgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHZhbGlkVXNlcm5hbWUgPSBcInRlc3QtdXNlclwiO1xuICAgIGNvbnN0IHZhbGlkSWRlbnRpdHkgPSB7XG4gICAgICBzb3VyY2VJcDogW1wiMTI3LjAuMC4xXCJdLFxuICAgICAgdXNlcm5hbWU6IHZhbGlkVXNlcm5hbWUsXG4gICAgICBncm91cHM6IG51bGwsXG4gICAgICBzdWI6IFwidGVzdC1zdWJcIixcbiAgICAgIGlzc3VlcjogXCJ0ZXN0LWlzc3VlclwiLFxuICAgICAgY2xhaW1zOiB7fSxcbiAgICAgIGRlZmF1bHRBdXRoU3RyYXRlZ3k6IFwiQUxMT1dcIixcbiAgICB9O1xuXG4gICAgY29uc3QgdmFsaWRQYXJ0SWQgPSAxMjM0NTtcblxuICAgIGl0KFwic2hvdWxkIGNyZWF0ZSBhIHZhbGlkIFBvc3RncmVTUUwgc2VsZWN0IHN0YXRlbWVudFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICBpZGVudGl0eTogdmFsaWRJZGVudGl0eSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgcGFydElkOiB2YWxpZFBhcnRJZCxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZVVuZGVmaW5lZCgpO1xuXG4gICAgICBjb25zdCByZXN1bHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQgPz8gXCJ7fVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50cykudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKCdTRUxFQ1QgKiBGUk9NIFwicGFydHNcIicpO1xuICAgICAgZXhwZWN0KHJlc3VsdC5zdGF0ZW1lbnRzWzBdKS50b0NvbnRhaW4oXCJXSEVSRVwiKTtcbiAgICAgIGV4cGVjdChyZXN1bHQuc3RhdGVtZW50c1swXSkudG9Db250YWluKFwicGFydF9pZFwiKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBtaXNzaW5nIGlkZW50aXR5XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB7fSxcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgcGFydElkOiB2YWxpZFBhcnRJZCxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5VU0VSX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWlzc2luZyBwYXJ0SWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIHBhcnRJZDogbnVsbCxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5JTlZBTElEX0lOUFVUKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSB1bmRlZmluZWQgcGFydElkXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGlkZW50aXR5OiB2YWxpZElkZW50aXR5LFxuICAgICAgICBhcmd1bWVudHM6IHt9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFUVVFU1QsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmV2YWx1YXRpb25SZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLklOVkFMSURfSU5QVVQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIHplcm8gYXMgYSBwYXJ0SWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgaWRlbnRpdHk6IHZhbGlkSWRlbnRpdHksXG4gICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgIHBhcnRJZDogMCxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVFVRVNULFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5JTlZBTElEX0lOUFVUKTtcbiAgICAgIC8vIFplcm8gaXMgZmFsc3kgaW4gSmF2YVNjcmlwdCwgc28gaXQgd291bGQgZmFpbCB2YWxpZGF0aW9uXG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiUmVzcG9uc2UgRnVuY3Rpb24gVGVzdHNcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG1vY2tSZHNSZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzcWxTdGF0ZW1lbnRSZXN1bHRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICByZWNvcmRzOiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiMTIzNDVcIiB9LFxuICAgICAgICAgICAgICB7IHN0cmluZ1ZhbHVlOiBcIlRlc3QgUGFydFwiIH0sXG4gICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IFwiRWxlY3Ryb25pY3NcIiB9LFxuICAgICAgICAgICAgICB7IGRvdWJsZVZhbHVlOiAxOS45OSB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICB7IG5hbWU6IFwicGFydF9pZFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwicGFydF9uYW1lXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2NhdGVnb3J5XCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJ1bml0X3ByaWNlXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHRyYW5zZm9ybSBSRFMgcmVzdWx0IHRvIGV4cGVjdGVkIGZvcm1hdFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IG1vY2tSZHNSZXN1bHQsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV2YWx1YXRlUmVzb2x2ZXJDb2RlKHtcbiAgICAgICAgZmlsZVBhdGg6IGZpbGUsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGZ1bmN0aW9uVG9FdmFsdWF0ZTogUkVTT0xWRVJfRlVOQ1RJT05TX1RZUEUuUkVTUE9OU0UsXG4gICAgICB9KTtcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlRGVmaW5lZCgpO1xuICAgICAgZXhwZWN0KHJlc3BvbnNlLmVycm9yKS50b0JlVW5kZWZpbmVkKCk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IEpTT04ucGFyc2UocmVzcG9uc2UuZXZhbHVhdGlvblJlc3VsdCA/PyBcInt9XCIpO1xuICAgICAgZXhwZWN0KHJlc3VsdCkudG9FcXVhbCh7XG4gICAgICAgIHBhcnRJZDogXCIxMjM0NVwiLFxuICAgICAgICBwYXJ0TmFtZTogXCJUZXN0IFBhcnRcIixcbiAgICAgICAgcGFydENhdGVnb3J5OiBcIkVsZWN0cm9uaWNzXCIsXG4gICAgICAgIHVuaXRQcmljZTogMTkuOTksXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGhhbmRsZSBlbXB0eSByZXN1bHQgc2V0XCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNxbFN0YXRlbWVudFJlc3VsdHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmVjb3JkczogW10sXG4gICAgICAgICAgICAgIGNvbHVtbk1ldGFkYXRhOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInBhcnRfaWRcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X25hbWVcIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2NhdGVnb3J5XCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwidW5pdF9wcmljZVwiIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgZGF0YWJhc2UgZXJyb3JzXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgbWVzc2FnZTogXCJEYXRhYmFzZSBjb25uZWN0aW9uIGVycm9yXCIsXG4gICAgICAgICAgdHlwZTogXCJSRFNFcnJvclwiLFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShcIkRhdGFiYXNlIGNvbm5lY3Rpb24gZXJyb3JcIik7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbnVsbCByZXN1bHRcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZShFcnJvck1lc3NhZ2VzLlJFU09VUkNFX05PVF9GT1VORCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgdW5kZWZpbmVkIHJlc3VsdFwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICByZXN1bHQ6IHVuZGVmaW5lZCxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UpLnRvQmUoRXJyb3JNZXNzYWdlcy5SRVNPVVJDRV9OT1RfRk9VTkQpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgaGFuZGxlIFNRTCBzeW50YXggZXJyb3JzXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgbWVzc2FnZTogJ3N5bnRheCBlcnJvciBhdCBvciBuZWFyIFwicGFydHNcIicsXG4gICAgICAgICAgdHlwZTogXCJTUUxTeW50YXhFcnJvclwiLFxuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBldmFsdWF0ZVJlc29sdmVyQ29kZSh7XG4gICAgICAgIGZpbGVQYXRoOiBmaWxlLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBmdW5jdGlvblRvRXZhbHVhdGU6IFJFU09MVkVSX0ZVTkNUSU9OU19UWVBFLlJFU1BPTlNFLFxuICAgICAgfSk7XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcikudG9CZURlZmluZWQoKTtcbiAgICAgIGV4cGVjdChyZXNwb25zZS5lcnJvcj8ubWVzc2FnZSkudG9CZSgnc3ludGF4IGVycm9yIGF0IG9yIG5lYXIgXCJwYXJ0c1wiJyk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBoYW5kbGUgbWFsZm9ybWVkIHJlc3VsdCBkYXRhXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgIHJlc3VsdDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHNxbFN0YXRlbWVudFJlc3VsdHM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmVjb3JkczogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgc3RyaW5nVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgIHsgZG91YmxlVmFsdWU6IG51bGwgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBjb2x1bW5NZXRhZGF0YTogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJwYXJ0X2lkXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9uYW1lXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwicGFydF9jYXRlZ29yeVwiIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiBcInVuaXRfcHJpY2VcIiB9LFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXZhbHVhdGVSZXNvbHZlckNvZGUoe1xuICAgICAgICBmaWxlUGF0aDogZmlsZSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgZnVuY3Rpb25Ub0V2YWx1YXRlOiBSRVNPTFZFUl9GVU5DVElPTlNfVFlQRS5SRVNQT05TRSxcbiAgICAgIH0pO1xuXG4gICAgICBleHBlY3QocmVzcG9uc2UpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3QocmVzcG9uc2UuZXJyb3IpLnRvQmVVbmRlZmluZWQoKTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5ldmFsdWF0aW9uUmVzdWx0ID8/IFwie31cIik7XG4gICAgICBleHBlY3QocmVzdWx0KS50b0VxdWFsKHtcbiAgICAgICAgcGFydElkOiBudWxsLFxuICAgICAgICBwYXJ0TmFtZTogbnVsbCxcbiAgICAgICAgcGFydENhdGVnb3J5OiBudWxsLFxuICAgICAgICB1bml0UHJpY2U6IG51bGwsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==