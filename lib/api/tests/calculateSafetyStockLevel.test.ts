import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/calculateSafetyStockLevel.js";

describe("CalculateSafetyStockLevel Resolver Tests", () => {
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

    it("should create a valid PostgreSQL statement", async () => {
      const context = {
        identity: validIdentity,
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
      expect(result.statements[0]).toContain("SELECT");
      expect(result.statements[0]).toContain("safety_stock_level");
      expect(result.statements[0]).toContain("FROM DemandVariability");
      expect(result.statements[0]).toContain("JOIN LeadTimeStats");
      expect(result.statements[0]).toContain("JOIN Parts");
    });

    it("should handle missing identity", async () => {
      const context = {
        identity: {},
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
              { stringValue: "Part A" },
              { stringValue: "15.32" },
              { longValue: 5 },
              { stringValue: "34.26" },
            ],
            [
              { stringValue: "Part B" },
              { stringValue: "8.75" },
              { longValue: 3 },
              { stringValue: "15.16" },
            ],
          ],
          columnMetadata: [
            { name: "part_name" },
            { name: "demand_stddev" },
            { name: "avg_lead_time" },
            { name: "safety_stock_level" },
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
        partName: "Part A",
        demandStddev: "15.32",
        avgLeadTime: 5,
        safetyStockLevel: "34.26",
      });
      expect(result[1]).toEqual({
        partName: "Part B",
        demandStddev: "8.75",
        avgLeadTime: 3,
        safetyStockLevel: "15.16",
      });
    });

    it("should handle empty result set", async () => {
      const context = {
        result: JSON.stringify({
          sqlStatementResults: [
            {
              records: [],
              columnMetadata: [
                { name: "part_name" },
                { name: "demand_stddev" },
                { name: "avg_lead_time" },
                { name: "safety_stock_level" },
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

    it("should handle malformed result data", async () => {
      const context = {
        result: JSON.stringify({
          sqlStatementResults: [
            {
              records: [
                [
                  { stringValue: null },
                  { stringValue: null },
                  { longValue: null },
                  { stringValue: null },
                ],
              ],
              columnMetadata: [
                { name: "part_name" },
                { name: "demand_stddev" },
                { name: "avg_lead_time" },
                { name: "safety_stock_level" },
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
      expect(result[0]).toEqual({
        partName: null,
        demandStddev: null,
        avgLeadTime: null,
        safetyStockLevel: null,
      });
    });

    it("should handle malformed JSON", async () => {
      const context = {
        result: '{"bad json":',
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
    });

    it("should handle invalid data types", async () => {
      const context = {
        result: JSON.stringify({
          sqlStatementResults: [
            {
              records: [
                [
                  { stringValue: "123" },
                  { stringValue: "invalid-std" },
                  { stringValue: "invalid-lead" },
                  { stringValue: "invalid-safety" },
                ],
              ],
              columnMetadata: [
                { name: "part_name" },
                { name: "demand_stddev" },
                { name: "avg_lead_time" },
                { name: "safety_stock_level" },
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
      expect(result[0]).toEqual({
        partName: "123",
        demandStddev: "invalid-std",
        avgLeadTime: "invalid-lead",
        safetyStockLevel: "invalid-safety",
      });
    });
  });
});
