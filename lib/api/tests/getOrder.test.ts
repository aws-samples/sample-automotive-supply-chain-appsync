import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/getOrder.js";

describe("GetOrder Resolver Tests", () => {
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

    const validOrderId = 12345;

    it("should create a valid PostgreSQL select statement", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          orderId: validOrderId,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result.statements).toBeDefined();
      expect(result.statements[0]).toContain('SELECT * FROM "orders"');
      expect(result.statements[0]).toContain("WHERE");
      expect(result.statements[0]).toContain("order_id");
    });

    it("should handle missing identity", async () => {
      const context = {
        identity: {},
        arguments: {
          orderId: validOrderId,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.USER_NOT_FOUND);
    });

    it("should handle missing orderId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          orderId: null,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
    });

    it("should handle undefined orderId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {},
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
    });

    it("should handle zero as an orderId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          orderId: 0,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toEqual({
        orderId: "12345",
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
    });

    it("should handle database errors", async () => {
      const context = {
        error: {
          message: "Database connection error",
          type: "RDSError",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe("Database connection error");
    });

    it("should handle null result", async () => {
      const context = {
        result: null,
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
    });

    it("should handle undefined result", async () => {
      const context = {
        result: undefined,
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
    });

    it("should handle SQL syntax errors", async () => {
      const context = {
        error: {
          message: 'syntax error at or near "orders"',
          type: "SQLSyntaxError",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe('syntax error at or near "orders"');
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
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
