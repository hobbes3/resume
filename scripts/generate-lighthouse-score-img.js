import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const htmlPath = path.join(projectRoot, "dist", "reports", "lhr-latest.html");
const outputDir = path.join(projectRoot, ".lighthouseci");
const outputPath = path.join(outputDir, "lhr-score.webp");

await fs.mkdir(outputDir, { recursive: true });

const chromePath =
  process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "/usr/bin/google-chrome-stable";

const browser = await puppeteer.launch({
  executablePath: chromePath,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--allow-file-access-from-files",
  ],
});

const page = await browser.newPage();

await page.emulateMediaFeatures([
  { name: "prefers-color-scheme", value: "dark" },
]);

// 3.125 scale factor increases pixel density to ~300 DPI (96 DPI * 3.125)
await page.setViewport({
  width: 1280,
  height: 800,
  deviceScaleFactor: 3.125,
});

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

const svgElement = await page.waitForSelector("#performance svg");
if (!svgElement) {
  throw new Error("Could not find <svg> inside #performance");
}

// Ensure the body, HTML, and container elements are completely transparent
await page.addStyleTag({
  content: `
    .lh-root {
      background: transparent !important;
    }
  `,
});

// Hover over the center of the SVG
await svgElement.hover();

// Wait 1 second for hover animation to finish
await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1000)));

// Capture screenshot with transparent background
await svgElement.screenshot({
  path: outputPath,
  type: "webp",
  quality: 100,
  omitBackground: true, // Native transparency for WebP
});

await browser.close();
console.log(`Saved Lighthouse score ring image to ${outputPath}`);
