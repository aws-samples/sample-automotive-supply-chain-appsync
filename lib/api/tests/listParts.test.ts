import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/listParts.js";

describe("ListParts Resolver Tests", () => {
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

    it("should create a valid PostgreSQL select statement for all parts", async () => {
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
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result.statements).toBeDefined();
      expect(result.statements[0]).toContain('SELECT * FROM "parts"');
      // No WHERE clause should be present as we're getting all parts
    });

    it("should handle missing identity", async () => {
      const context = {
        identity: {},
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
      expect(response.error?.message).toBe(ErrorMessages.USER_NOT_FOUND);
    });
  });

  describe("Response Function Tests", () => {
    const mockRdsResult = JSON.stringify({
      sqlStatementResults: [
        {
          records: [
            [
              { stringValue: "12345" },
              { stringValue: "CPU Fan" },
              { stringValue: "Cooling" },
              { doubleValue: 19.99 },
            ],
            [
              { stringValue: "12346" },
              { stringValue: "SSD 1TB" },
              { stringValue: "Storage" },
              { doubleValue: 89.99 },
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

      const result = JSON.parse(response.evaluationResult ?? "[]");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        partId: "12345",
        partName: "CPU Fan",
        partCategory: "Cooling",
        unitPrice: 19.99,
      });
      expect(result[1]).toEqual({
        partId: "12346",
        partName: "SSD 1TB",
        partCategory: "Storage",
        unitPrice: 89.99,
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

      const result = JSON.parse(response.evaluationResult ?? "[]");
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        partId: null,
        partName: null,
        partCategory: null,
        unitPrice: null,
      });
    });
  });
});
