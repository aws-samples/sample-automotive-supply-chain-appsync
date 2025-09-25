import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/getAssessment.js";

describe("GetAssessment Resolver Tests", () => {
  describe("Request Function Tests", () => {
    const validAssessmentId = "test-assessment-123";
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

    it("should create a valid DynamoDB get request with correct parameters", async () => {
      const context = {
        arguments: {
          assessmentId: validAssessmentId,
        },
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
      expect(result.operation).toBe("GetItem");

      const key = unmarshall(result.key);
      expect(key).toEqual({
        assessmentId: validAssessmentId,
        ownerId: validUsername,
      });
    }, 10000); // 10 second timeout

    it("should fail when assessmentId is missing", async () => {
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
      expect(response.error).toBeDefined();
      expect(response.evaluationResult).toBeUndefined();
      expect(response.error?.message).toBe(ErrorMessages.INVALID_INPUT);
    });

    it("should handle missing identity", async () => {
      const context = {
        arguments: {
          assessmentId: validAssessmentId,
        },
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

    it("should handle null assessmentId", async () => {
      const context = {
        arguments: {
          assessmentId: null,
        },
        identity: validIdentity,
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
  });

  describe("Response Function Tests", () => {
    const mockAssessment = {
      assessmentId: "test-assessment-123",
      ownerId: "test-user",
      title: "Test Assessment",
      createdAt: "2023-01-01T00:00:00Z",
    };

    it("should return the result when successful", async () => {
      const context = {
        result: mockAssessment,
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toEqual(mockAssessment);
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

    it("should handle conditional check failed errors", async () => {
      const context = {
        error: {
          message: "The conditional request failed",
          type: "ConditionalCheckFailedException",
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeDefined();
      expect(response.error?.message).toBe("The conditional request failed");
    });

    it("should handle malformed result data", async () => {
      const context = {
        result: {
          invalidField: "invalid",
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
      expect(result).toEqual({ invalidField: "invalid" });
    });
  });
});
