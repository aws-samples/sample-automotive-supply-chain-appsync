import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
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
          input: {
            partId: "part-456",
            orderDate: "2023-05-15",
            quantityOrdered: 15,
            fulfilled: true,
          },
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

    it("should handle no fields to update", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            orderId: "order-123",
          },
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      // The resolver rejects null values for fields
      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
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
