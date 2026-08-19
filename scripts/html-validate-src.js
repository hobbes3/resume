import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

console.log("Running html-validate on source HTML files...");

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

// Always write checkstyle formatted XML for Reviewdog
writeFileSync("html-validate-report.xml", result.stdout || "");

// Print standard error/output logs to the terminal if any exist
if (result.stdout && result.stdout.trim()) {
  console.log("\n--- html-validate Output ---");
  console.log(result.stdout);
}

if (result.stderr && result.stderr.trim()) {
  console.error("\n--- html-validate Errors ---");
  console.error(result.stderr);
}

// Exit code > 1 means a runtime crash or configuration error
if (result.status !== null && result.status > 1) {
  console.error(
    `❌ html-validate execution failed with exit code ${result.status}`,
  );
  process.exit(result.status);
}

if (result.status === 0) {
  console.log("✅ html-validate completed: No linting issues found.");
} else if (result.status === 1) {
  console.log(
    "⚠️ html-validate completed: Findings detected and saved to html-validate-report.xml",
  );
}

process.exit(0);
