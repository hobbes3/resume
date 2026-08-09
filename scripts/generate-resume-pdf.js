import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "src", "resumes");

(async () => {
  // Ensure target output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const chromePath =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome";

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load local HTML file
  const filePath = `file://${path.join(projectRoot, "src", "index.html")}`;
  await page.goto(filePath, { waitUntil: "networkidle0" });

  // Read local main.css content and modify the base font-size
  const cssPath = path.join(projectRoot, "src", "css", "main.css");
  let mainCssContent = await fs.readFile(cssPath, "utf-8");

  // Modify font-size before applying
  mainCssContent = mainCssContent.replace(
    "font-size: 13pt;",
    "font-size: 12.7pt;",
  );

  // Isolate #resume and inject modified main.css directly into <head>
  await page.evaluate((css) => {
    const resume = document.querySelector("#resume");
    if (resume) {
      document.body.innerHTML = "";
      document.body.appendChild(resume);

      // Reset body container for full A4 coverage
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.background = "#fff";

      // Snap #resume container to (0,0)
      resume.style.margin = "0";
      resume.style.position = "absolute";
      resume.style.left = "0";
      resume.style.top = "0";

      // Inject modified main.css inline into <head>
      const styleTag = document.createElement("style");
      styleTag.textContent = css;
      document.head.appendChild(styleTag);
    }
  }, mainCssContent);

  // Save single-page A4 PDF to src/resumes/
  const pdfOutputPath = path.join(outputDir, "hobbes3_resume_latest.pdf");
  await page.pdf({
    path: pdfOutputPath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log(`PDF successfully generated: ${pdfOutputPath}`);
  await browser.close();
})();
