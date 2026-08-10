import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "src", "resumes");
const fontsDir = path.join(projectRoot, "src", "fonts");

(async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const fontRegular = await fs.readFile(
    path.join(fontsDir, "carlito-v4-latin-regular.woff2"),
  );
  const fontBold = await fs.readFile(
    path.join(fontsDir, "carlito-v4-latin-700.woff2"),
  );
  const fontItalic = await fs.readFile(
    path.join(fontsDir, "carlito-v4-latin-italic.woff2"),
  );

  const fontFontFaceCss = `
    @font-face {
      font-family: 'Carlito';
      font-style: normal;
      font-weight: 400;
      src: url("data:font/woff2;base64,${fontRegular.toString("base64")}") format("woff2");
    }
    @font-face {
      font-family: 'Carlito';
      font-style: normal;
      font-weight: 700;
      src: url("data:font/woff2;base64,${fontBold.toString("base64")}") format("woff2");
    }
    @font-face {
      font-family: 'Carlito';
      font-style: italic;
      font-weight: 400;
      src: url("data:font/woff2;base64,${fontItalic.toString("base64")}") format("woff2");
    }
  `;

  const chromePath =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome";

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load local HTML
  const filePath = `file://${path.join(projectRoot, "src", "index.html")}`;
  await page.goto(filePath, { waitUntil: "networkidle0" });

  // Read local CSS files
  const picoCssPath = path.join(projectRoot, "src", "css", "pico.min.css");
  const mainCssPath = path.join(projectRoot, "src", "css", "main.css");

  const picoCssContent = await fs.readFile(picoCssPath, "utf-8");
  let mainCssContent = await fs.readFile(mainCssPath, "utf-8");

  mainCssContent = mainCssContent.replace(
    "font-size: 2.1cqw;",
    "font-size: 2.6cqw;",
  );

  // Isolate #resume and inject base64 fonts & stylesheets cleanly
  await page.evaluate(
    ({ fontCss, picoCss, mainCss }) => {
      const resume = document.querySelector("#resume");
      if (resume) {
        document.body.innerHTML = "";
        document.body.appendChild(resume);

        const styleTag = document.createElement("style");
        styleTag.textContent = `${fontCss}\n${picoCss}\n${mainCss}`;
        document.head.appendChild(styleTag);
      }
    },
    {
      fontCss: fontFontFaceCss,
      picoCss: picoCssContent,
      mainCss: mainCssContent,
    },
  );

  // Generate A4 PDF using the @page declaration in main.css
  const pdfOutputPath = path.join(outputDir, "hobbes3_resume_latest.pdf");
  await page.pdf({
    path: pdfOutputPath,
    printBackground: true,
    preferCSSPageSize: true, // Tells Chrome to respect @page size and margins
    margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
  });

  // Save transformed HTML
  const transformedHtml = await page.content();
  const htmlOutputPath = path.join(outputDir, "hobbes3_resume_latest.html");
  await fs.writeFile(htmlOutputPath, transformedHtml, "utf-8");

  console.log(`Successfully generated HTML and PDF in ${outputDir}`);
  await browser.close();
})();
