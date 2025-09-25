import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/getTemplate.js";

describe("GetTemplateForAssessment Resolver Tests", () => {
  describe("Request Function Tests", () => {
    const validTemplateId = "test-template-123";
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
          templateId: validTemplateId,
          name: "Test Assessment", // Additional arg included in MutationCreateAssessmentArgs
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
        templateId: validTemplateId,
        ownerId: validUsername,
      });
    }, 10000); // 10 second timeout

    it("should fail when templateId is missing", async () => {
      const context = {
        arguments: {
          name: "Test Assessment",
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

    it("should handle missing identity", async () => {
      const context = {
        arguments: {
          templateId: validTemplateId,
          name: "Test Assessment",
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

    it("should handle null templateId", async () => {
      const context = {
        arguments: {
          templateId: null,
          name: "Test Assessment",
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
    const mockTemplate = {
      templateId: "test-template-123",
      ownerId: "test-user",
      name: "Sample Template",
      sections: [
        {
          id: "section-1",
          title: "First Section",
          questions: [
            {
              id: "q-1",
              text: "Sample question?",
              type: "MULTIPLE_CHOICE",
              options: ["Option 1", "Option 2"],
            },
          ],
        },
      ],
    };

    it("should return the result when successful", async () => {
      const context = {
        result: mockTemplate,
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.RESPONSE,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      const result = JSON.parse(response.evaluationResult ?? "{}");
      expect(result).toEqual(mockTemplate);
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
