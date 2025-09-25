import {
  evaluateResolverCode,
  RESOLVER_FUNCTIONS_TYPE,
} from "../utils/evaluateResolverCode";
import { ErrorMessages } from "../utils/AppSyncErrors";

const file = "./lib/api/resolvers/build/createShipment.js";

describe("CreateShipment Resolver Tests", () => {
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
      shipmentId: "ship-123",
      partId: "part-456",
      shipmentDate: "2023-05-15",
      quantityShipped: 5,
    };

    it("should create a valid PostgreSQL insert statement", async () => {
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
      expect(result.statements[0]).toContain('INSERT INTO "shipments"');
      expect(result.statements[0]).toContain("shipment_id");
      expect(result.statements[0]).toContain("part_id");
      expect(result.statements[0]).toContain("shipment_date");
      expect(result.statements[0]).toContain("quantity_shipped");
      expect(result.statements[0]).toContain("RETURNING");
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

    it("should handle missing shipmentId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            shipmentId: null,
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

    it("should handle missing partId", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            partId: null,
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

    it("should handle missing shipmentDate", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            shipmentDate: null,
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

    it("should handle undefined quantityShipped", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            quantityShipped: undefined,
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

    it("should handle zero as a valid quantityShipped", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            quantityShipped: 0,
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

    it("should handle negative quantityShipped", async () => {
      const context = {
        identity: validIdentity,
        arguments: {
          input: {
            ...validInput,
            quantityShipped: -5,
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
      // The resolver doesn't enforce positive quantities
    });
  });

  describe("Response Function Tests", () => {
    const mockRdsResult = JSON.stringify({
      sqlStatementResults: [
        {
          records: [
            [
              { stringValue: "ship-123" },
              { stringValue: "part-456" },
              { stringValue: "2023-05-15" },
              { longValue: 5 },
            ],
          ],
          columnMetadata: [
            { name: "shipment_id" },
            { name: "part_id" },
            { name: "shipment_date" },
            { name: "quantity_shipped" },
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
        shipmentId: "ship-123",
        partId: "part-456",
        shipmentDate: "2023-05-15",
        quantityShipped: 5,
      });
    });

    it("should handle empty result set", async () => {
      const context = {
        result: JSON.stringify({
          sqlStatementResults: [
            {
              records: [],
              columnMetadata: [
                { name: "shipment_id" },
                { name: "part_id" },
                { name: "shipment_date" },
                { name: "quantity_shipped" },
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

    it("should handle database constraint violation error", async () => {
      const context = {
        error: {
          message: "duplicate key value violates unique constraint",
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
        "duplicate key value violates unique constraint"
      );
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
                ],
              ],
              columnMetadata: [
                { name: "shipment_id" },
                { name: "part_id" },
                { name: "shipment_date" },
                { name: "quantity_shipped" },
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
        shipmentId: null,
        partId: null,
        shipmentDate: null,
        quantityShipped: null,
      });
    });
  });
});
