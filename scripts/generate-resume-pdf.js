import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const srcDir = path.join(projectRoot, "src");
const outputDir = path.join(srcDir, "resumes");

(async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const chromePath =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome-stable";

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load index.html to extract the #resume element
  const indexFilePath = `file://${path.join(srcDir, "index.html")}`;
  await page.goto(indexFilePath, { waitUntil: "networkidle0" });

  const resumeHtml = await page.evaluate(() => {
    const resume = document.querySelector("#resume");
    return resume ? resume.outerHTML : "";
  });

  // Construct minimal blank HTML document
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <link rel="stylesheet" href="css/pico.min.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  ${resumeHtml}
</body>
</html>`;

  // Write resume.html to src/ first
  const htmlOutputPath = path.join(srcDir, "hobbes3_resume_latest.html");
  await fs.writeFile(htmlOutputPath, htmlContent, "utf-8");
  console.log(`Successfully generated ${htmlOutputPath}`);

  // Navigate directly to the generated file so relative paths (css/, fonts/) resolve naturally
  const resumeFilePath = `file://${htmlOutputPath}`;
  await page.goto(resumeFilePath, { waitUntil: "networkidle0" });

  // Generate A4 PDF in src/resumes/
  const pdfOutputPath = path.join(outputDir, "hobbes3_resume_latest.pdf");
  await page.pdf({
    path: pdfOutputPath,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
  });
  console.log(`Successfully generated ${pdfOutputPath}`);

  await browser.close();
})();
