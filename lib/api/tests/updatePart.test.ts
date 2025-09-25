import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
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

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
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
          input: {
            partName: "Updated Part Name",
            partCategory: "Updated Category",
            unitPrice: 29.99,
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
            partId: "part-123",
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
            partId: "part-123",
            partName: null,
          },
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      // The resolver rejects null values for fields, aligning with the behavior
      // we saw in UpdateOrder resolver
      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
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
          message: 'syntax error at or near "parts"',
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
