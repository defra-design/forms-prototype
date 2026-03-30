/**
 * Takes static screenshots of the pages used for updating the saved answers config.
 * Run with the prototype server up: npm run serve (then in another terminal: node scripts/screenshot-saved-answers-pages.js)
 * Or: npm run screenshots:saved-answers
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const OUT_DIR = path.join(
  __dirname,
  "..",
  "assets",
  "screenshots",
  "saved-answers-config"
);

const PAGES = [
  {
    name: "page-overview",
    url: `${BASE_URL}/titan-mvp-1.2/form-editor/check-answers/settings-modular`,
    description: "Check answers page overview (summary list, link to saved answers)",
  },
  {
    name: "saved-answers-tab",
    url: `${BASE_URL}/titan-mvp-1.2/form-editor/check-answers/settings-modular?tab=saved-answers`,
    description: "Saved answers config tab (checkbox, copy, warning)",
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    for (const { name, url, description } of PAGES) {
      console.log(`Capturing: ${description}`);
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 15000,
      });
      const filePath = path.join(OUT_DIR, `${name}.png`);
      await page.screenshot({
        path: filePath,
        fullPage: true,
      });
      console.log(`  Saved: ${filePath}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nScreenshots written to: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
