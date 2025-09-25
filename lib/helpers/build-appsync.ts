// helpers/build-appsync.ts
import { execSync } from "child_process";
import { glob } from "glob";

const runCommand = (command: string) => {
  return execSync(command, {
    stdio: [process.stdin, process.stdout, process.stderr],
  });
};

const build = async () => {
  try {
    const files = await glob("lib/api/resolvers/*.ts");
    files.forEach((f) => {
      runCommand(
        `esbuild ${f} --bundle --sourcemap=inline --sources-content=false --platform=node --target=esnext --format=esm --external:@aws-appsync/utils --outdir=lib/api/resolvers/build`
      );
    });
  } catch (err) {
    console.error("Error while expanding glob:", err);
  }
};

build();
