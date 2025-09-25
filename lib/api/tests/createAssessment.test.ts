import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/createAssessment.js";

describe("CreateAssessment Resolver Tests", () => {
  describe("Request Function Tests", () => {
    const validUsername = "test-user";
    const validName = "Test Assessment";
    const mockTemplateResult = {
      id: "template-123",
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

    const validIdentity = {
      sourceIp: ["127.0.0.1"],
      username: validUsername,
      groups: null,
      sub: "test-sub",
      issuer: "test-issuer",
      claims: {},
      defaultAuthStrategy: "ALLOW",
    };

    it("should create a valid DynamoDB put request with correct parameters", async () => {
      const context = {
        arguments: {
          name: validName,
        },
        identity: validIdentity,
        prev: {
          result: mockTemplateResult,
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
      expect(result.operation).toBe("PutItem");

      // Extract the key fields directly since they should be at top level
      const keys = unmarshall(result.key);
      expect(keys.assessmentId).toBeDefined(); // Auto-generated ID
      expect(keys.ownerId).toBe(validUsername);

      // Check the attributes that would go into the item
      const attributeValues = unmarshall(result.attributeValues);
      expect(attributeValues.name).toBe(validName);
      expect(attributeValues.template).toEqual(mockTemplateResult);
      expect(attributeValues.progress).toBeDefined();
      expect(attributeValues.progress.completedQuestions).toEqual([]);
      expect(typeof attributeValues.progress.lastUpdated).toBe("string"); // ISO timestamp
    }, 10000);

    it("should fail when user identity is missing", async () => {
      const context = {
        arguments: {
          name: validName,
        },
        identity: {},
        prev: {
          result: mockTemplateResult,
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

    it("should fail when template sections are missing", async () => {
      const context = {
        arguments: {
          name: validName,
        },
        identity: validIdentity,
        prev: {
          result: null,
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
      expect(response.error?.message).toBe(ErrorMessages.RESOURCE_NOT_FOUND);
    });

    it("should handle missing name argument", async () => {
      const context = {
        arguments: {},
        identity: validIdentity,
        prev: {
          result: mockTemplateResult,
        },
      };

      const response = await evaluateResolverCode({
        filePath: file,
        context,
        functionToEvaluate: RESOLVER_FUNCTIONS_TYPE.REQUEST,
      });

      expect(response).toBeDefined();
      expect(response.error).toBeUndefined();

      // Since the handler doesn't explicitly check for name, it will create
      // an assessment with a null name when not provided
      const result = JSON.parse(response.evaluationResult ?? "{}");
      const attributeValues = unmarshall(result.attributeValues);
      expect(attributeValues.name).toBeNull();
    });
  });

  describe("Response Function Tests", () => {
    const mockAssessment = {
      assessmentId: "test-assessment-123",
      ownerId: "test-user",
      name: "Test Assessment",
      template: {
        id: "template-123",
        name: "Sample Template",
        sections: [],
      },
      progress: {
        completedQuestions: [],
        lastUpdated: "2023-01-01T00:00:00Z",
      },
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
  });
});
