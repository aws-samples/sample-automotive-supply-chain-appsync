export default {
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.js$": "babel-jest", // Add Babel for handling JavaScript files
  },
  transformIgnorePatterns: [
    "node_modules/(?!(module-to-transform|@aws-appsync/utils|@aws-appsync/utils/dynamodb)/)",
  ],
  extensionsToTreatAsEsm: [".ts"], // Treat TypeScript files as ESM
  testMatch: ["**/?(*.)+(spec|test).[t]s?(x)"],
};
