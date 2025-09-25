// codegen.ts
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    "lib/api/schema/schema.graphql",
    `
scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress
scalar ID
`,
  ],
  config: {
    scalars: {
      AWSJSON: "string",
      AWSDate: "string",
      AWSTime: "string",
      AWSDateTime: "string",
      AWSTimestamp: "number",
      AWSEmail: "string",
      AWSURL: "string",
      AWSPhone: "string",
      AWSIPAddress: "string",
      ID: "string",
    },
  },
  generates: {
    "lib/api/resolvers/types/AppSync.ts": {
      plugins: ["typescript"],
    },
  },
};

export default config;
