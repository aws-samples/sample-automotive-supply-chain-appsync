import {
  AppSyncClient,
  EvaluateCodeCommand,
  EvaluateCodeCommandInput,
} from "@aws-sdk/client-appsync";
import { readFile } from "fs/promises";
import * as path from "path";

const appsync = new AppSyncClient({ region: "eu-west-1" });

export enum RESOLVER_FUNCTIONS_TYPE {
  REQUEST = "request",
  RESPONSE = "response",
}

export interface evaluateResolverCodeInput {
  filePath: string;
  context: object;
  functionToEvaluate: RESOLVER_FUNCTIONS_TYPE;
}

function validateFilePath(filePath: string): string {
  // Remove any directory traversal patterns
  const sanitizedPath = filePath.replace(/\.\./g, "");

  // Only allow alphanumeric, dash, underscore, dot, and forward slash
  if (!/^[a-zA-Z0-9._/-]+$/.test(sanitizedPath)) {
    throw new Error("Invalid file path: contains illegal characters");
  }

  // Ensure path is within allowed directory
  const basePath = process.cwd();
  const fullPath = path.join(basePath, sanitizedPath);

  if (!fullPath.startsWith(basePath)) {
    throw new Error("Invalid file path: directory traversal detected");
  }

  return fullPath;
}

export async function evaluateResolverCode(param: evaluateResolverCodeInput) {
  const validatedPath = validateFilePath(param.filePath);

  const input: EvaluateCodeCommandInput = {
    runtime: { name: "APPSYNC_JS", runtimeVersion: "1.0.0" },
    code: await readFile(validatedPath, { encoding: "utf8" }),
    context: JSON.stringify(param.context),
    function: param.functionToEvaluate,
  };

  const evaluateCodeCommand = new EvaluateCodeCommand(input);

  return await appsync.send(evaluateCodeCommand);
}
