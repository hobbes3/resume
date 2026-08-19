import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// Run html-validate
const result = spawnSync(
  "npx",
  [
    "--no-install",
    "html-validate",
    "-f",
    "checkstyle",
    "index.html",
    "src/**/*.html",
  ],
  { encoding: "utf8" },
);

// Write stdout to the report XML
writeFileSync("html-validate-report.xml", result.stdout || "");

// Exit code > 1 means the linter process crashed or threw a config error
if (result.status !== null && result.status > 1) {
  console.error(result.stderr);
  console.error(`html-validate failed to run with exit code ${result.status}`);
  process.exit(result.status);
}

// Exit 0 for success or 1 (lint findings captured in report)
process.exit(0);
