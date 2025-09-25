"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// helpers/build-appsync.ts
const child_process_1 = require("child_process");
const glob_1 = require("glob");
const runCommand = (command) => {
    return (0, child_process_1.execSync)(command, {
        stdio: [process.stdin, process.stdout, process.stderr],
    });
};
const build = async () => {
    try {
        const files = await (0, glob_1.glob)("lib/api/resolvers/*.ts");
        files.forEach((f) => {
            runCommand(`esbuild ${f} --bundle --sourcemap=inline --sources-content=false --platform=node --target=esnext --format=esm --external:@aws-appsync/utils --outdir=lib/api/resolvers/build`);
        });
    }
    catch (err) {
        console.error("Error while expanding glob:", err);
    }
};
build();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtYXBwc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkLWFwcHN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBMkI7QUFDM0IsaURBQXlDO0FBQ3pDLCtCQUE0QjtBQUU1QixNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFO0lBQ3JDLE9BQU8sSUFBQSx3QkFBUSxFQUFDLE9BQU8sRUFBRTtRQUN2QixLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUN2RCxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRixNQUFNLEtBQUssR0FBRyxLQUFLLElBQUksRUFBRTtJQUN2QixJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsV0FBSSxFQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2xCLFVBQVUsQ0FDUixXQUFXLENBQUMsa0tBQWtLLENBQy9LLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBoZWxwZXJzL2J1aWxkLWFwcHN5bmMudHNcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IGdsb2IgfSBmcm9tIFwiZ2xvYlwiO1xuXG5jb25zdCBydW5Db21tYW5kID0gKGNvbW1hbmQ6IHN0cmluZykgPT4ge1xuICByZXR1cm4gZXhlY1N5bmMoY29tbWFuZCwge1xuICAgIHN0ZGlvOiBbcHJvY2Vzcy5zdGRpbiwgcHJvY2Vzcy5zdGRvdXQsIHByb2Nlc3Muc3RkZXJyXSxcbiAgfSk7XG59O1xuXG5jb25zdCBidWlsZCA9IGFzeW5jICgpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlcyA9IGF3YWl0IGdsb2IoXCJsaWIvYXBpL3Jlc29sdmVycy8qLnRzXCIpO1xuICAgIGZpbGVzLmZvckVhY2goKGYpID0+IHtcbiAgICAgIHJ1bkNvbW1hbmQoXG4gICAgICAgIGBlc2J1aWxkICR7Zn0gLS1idW5kbGUgLS1zb3VyY2VtYXA9aW5saW5lIC0tc291cmNlcy1jb250ZW50PWZhbHNlIC0tcGxhdGZvcm09bm9kZSAtLXRhcmdldD1lc25leHQgLS1mb3JtYXQ9ZXNtIC0tZXh0ZXJuYWw6QGF3cy1hcHBzeW5jL3V0aWxzIC0tb3V0ZGlyPWxpYi9hcGkvcmVzb2x2ZXJzL2J1aWxkYFxuICAgICAgKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIGV4cGFuZGluZyBnbG9iOlwiLCBlcnIpO1xuICB9XG59O1xuXG5idWlsZCgpO1xuIl19