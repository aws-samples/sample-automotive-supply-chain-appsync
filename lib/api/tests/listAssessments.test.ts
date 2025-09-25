import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/listAssessments.js";

describe("ListAssessments Resolver Tests", () => {
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

    it("should create a valid DynamoDB query request with correct parameters", async () => {
      const context = {
        arguments: {},
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
      expect(result.operation).toBe("Query");
      expect(result.index).toBe("byAssessmentOwnerId");

      // The serialized result might have a different structure
      // Check that the query contains the username somewhere
      const resultString = JSON.stringify(result);
      expect(resultString).toContain(validUsername);

      // If the structure has expressionValues, check those specifically
      if (result.expressionValues) {
        const values = Object.values(result.expressionValues);
        const containsUsername = values.some((value) =>
          JSON.stringify(value).includes(validUsername)
        );
        expect(containsUsername).toBe(true);
      }
    }, 10000); // 10 second timeout

    it("should handle missing identity", async () => {
      const context = {
        arguments: {},
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

    it("should handle null username", async () => {
      const context = {
        arguments: {},
        identity: {
          ...validIdentity,
          username: null,
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
  });

  describe("Response Function Tests", () => {
    const mockAssessments = [
      {
        assessmentId: "test-assessment-1",
        ownerId: "test-user",
        name: "Assessment 1",
        progress: {
          completedQuestions: ["q1", "q2"],
          lastUpdated: "2023-01-01T00:00:00Z",
        },
      },
      {
        assessmentId: "test-assessment-2",
        ownerId: "test-user",
        name: "Assessment 2",
        progress: {
          completedQuestions: ["q1"],
          lastUpdated: "2023-01-02T00:00:00Z",
        },
      },
    ];

    it("should return the items when successful", async () => {
      const context = {
        result: {
          items: mockAssessments,
          scannedCount: 2,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toEqual(mockAssessments);
    });

    it("should handle empty items array", async () => {
      const context = {
        result: {
          items: [],
          scannedCount: 0,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toEqual([]);
    });

    it("should handle missing items field", async () => {
      const context = {
        result: {
          scannedCount: 0,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
    });

    it("should handle DynamoDB errors", async () => {
      const context = {
        error: {
          message: "DynamoDB Error",
          type: "DynamoDBError",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe("DynamoDB Error");
    });

    it("should handle malformed result data", async () => {
      const context = {
        result: {
          items: "not an array",
          scannedCount: "invalid",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toBe("not an array");
    });
  });
});
