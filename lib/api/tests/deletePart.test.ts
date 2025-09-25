import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/deletePart.js";

describe("DeletePart Resolver Tests", () => {
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

    it("should create a valid PostgreSQL delete statement", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          partId: validPartId,
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
      expect(result.statements[0]).toContain('DELETE FROM "parts"');
      expect(result.statements[0]).toContain("WHERE");
      expect(result.statements[0]).toContain("part_id");
      expect(result.statements[0]).toContain("RETURNING");
    });

    it("should handle missing identity", async () => {
      const context = {
        identity: {},
        arguments: {
          partId: validPartId,
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

    it("should handle missing partId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          partId: null,
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

    it("should handle undefined partId", async () => {
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

    it("should handle zero as a valid partId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          partId: 0,
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
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

    it("should handle foreign key constraint errors", async () => {
      const context = {
        error: {
          message: "update or delete on table violates foreign key constraint",
          type: "SQLExecutionError",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(
        "update or delete on table violates foreign key constraint"
      );
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
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
