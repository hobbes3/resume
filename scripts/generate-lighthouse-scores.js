import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const htmlPath = path.join(projectRoot, ".lighthouseci", "lhr-latest.html");
const reportHtmlPath = path.join(
  projectRoot,
  "public",
  "reports",
  "lhr-latest.html",
);
const outputDir = path.join(projectRoot, ".lighthouseci");
const scoreOutputPath = path.join(outputDir, "lhr-scores.json");
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

try {
  const page = await browser.newPage();
  await page.goto(`file://${reportHtmlPath}`, { waitUntil: "networkidle0" });

  const metricValues = await page.evaluate(() =>
    Array.from(document.querySelectorAll("text.metric__value")).map((el) =>
      el.textContent.trim(),
    ),
  );

  const rawMetricValues = {
    FCP: Number(metricValues[0]),
    LCP: Number(metricValues[1]),
    TBT: Number(metricValues[2]),
    CLS: Number(metricValues[3]),
    SI: Number(metricValues[4]),
  };

  const scores = new Map([
    ["FCP", { score: rawMetricValues.FCP, value: 0 }],
    ["LCP", { score: rawMetricValues.LCP, value: 0 }],
    ["TBT", { score: rawMetricValues.TBT, value: 0 }],
    ["CLS", { score: rawMetricValues.CLS, value: 0 }],
    ["SI", { score: rawMetricValues.SI, value: 0 }],
  ]);

  const scorecalcHref = await page.evaluate(() => {
    const link = document.querySelector('a[href*="scorecalc"]');
    return link ? link.href : null;
  });

  if (scorecalcHref) {
    const hashParams = new URL(scorecalcHref).hash.slice(1).split("&");
    for (const entry of hashParams) {
      const [key, rawValue] = entry.split("=");
      if (!rawValue || !scores.has(key)) continue;
      const metric = scores.get(key);
      if (metric) {
        metric.value = Number(rawValue);
      }
    }
  }

  const datetime = await page.evaluate(() => {
    const item = document.querySelector(".lh-report-icon--date");
    return item ? item.textContent.trim() : "";
  });

  const scoreObject = Object.fromEntries(scores);
  scoreObject.datetime = datetime;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    scoreOutputPath,
    `${JSON.stringify(scoreObject, null, 2)}\n`,
    "utf8",
  );

  console.log(`Saved Lighthouse metric scores to ${scoreOutputPath}`);

  const imagePage = await browser.newPage();
  await imagePage.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "dark" },
  ]);

  // 3.125 scale factor increases pixel density to ~300 DPI (96 DPI * 3.125)
  await imagePage.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 3.125,
  });

  await imagePage.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  const svgElement = await imagePage.waitForSelector("#performance svg");
  if (!svgElement) {
    throw new Error("Could not find <svg> inside #performance");
  }

  // Ensure the body, HTML, and container elements are completely transparent
  await imagePage.addStyleTag({
    content: `
      .lh-root {
        background: transparent !important;
      }
    `,
  });

  // Hover over the center of the SVG
  await svgElement.hover();

  // Wait 1 second for hover animation to finish
  await imagePage.evaluate(
    () => new Promise((resolve) => setTimeout(resolve, 1000)),
  );

  // Capture screenshot with transparent background
  await svgElement.screenshot({
    path: outputPath,
    type: "webp",
    quality: 80,
    omitBackground: true,
  });

  console.log(`Saved Lighthouse score ring image to ${outputPath}`);
} finally {
  await browser.close();
}
