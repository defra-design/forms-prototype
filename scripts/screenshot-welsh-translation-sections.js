/**
 * Captures each Welsh translation screenshot-section page without the masthead
 * (?noMasthead=1). Uses the same showcase form structure as load-showcase.
 *
 * The prototype must already be running (this script does not start it).
 *   Terminal A:  npm run serve
 *   Terminal B:  npm run screenshots:welsh-translation-sections
 *
 * If you see ECONNREFUSED, the kit is not listening on BASE_URL (default http://localhost:3000).
 */

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const welshLib = require("../app/lib/titan-mvp-1.2/welsh-translation.js");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const OUT_DIR = path.join(
  __dirname,
  "..",
  "assets",
  "screenshots",
  "welsh-translation-sections"
);

const patch = welshLib.getWelshShowcaseSessionPatch();
const formPages = welshLib.cloneFormPagesWithGlobalQuestionNumbers(
  patch.formPages || []
);
const screenshotSectionPath =
  "/titan-mvp-1.2/form-editor/welsh-translation/screenshot-section.html";
const links = welshLib.buildWelshTranslationScreenshotLinks(
  screenshotSectionPath,
  formPages
);

function withNoMasthead(absoluteUrl) {
  const u = new URL(absoluteUrl);
  u.searchParams.set("noMasthead", "1");
  return u.toString();
}

function fileSlugFromUrl(absoluteUrl) {
  const u = new URL(absoluteUrl);
  const parts = ["welsh-section"];
  parts.push(u.searchParams.get("kind") || "unknown");
  const pageId = u.searchParams.get("pageId");
  const questionId = u.searchParams.get("questionId");
  if (pageId) parts.push(pageId);
  if (questionId) parts.push(questionId);
  return parts
    .join("-")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 750));
}

async function ensurePrototypeIsRunning() {
  const url = new URL("/", BASE_URL).toString();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    await res.text();
  } catch (err) {
    console.error(`\nCannot reach prototype at ${BASE_URL}`);
    if (err.name === "AbortError") {
      console.error("  Request timed out after 5 seconds.");
    } else {
      console.error(`  ${err.message}`);
    }
    console.error(
      "\nStart the kit in another terminal and wait until it prints the local URL, for example:\n" +
        "  npm run serve\n\n" +
        "Then run this script again. If your URL or port differs, set BASE_URL, for example:\n" +
        "  BASE_URL=http://127.0.0.1:3000 npm run screenshots:welsh-translation-sections\n"
    );
    process.exit(1);
  }
}

async function main() {
  await ensurePrototypeIsRunning();

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
    });

    const loadUrl = `${BASE_URL}/titan-mvp-1.2/form-editor/welsh-translation/load-showcase`;
    console.log(`Seeding session: ${loadUrl}`);
    await page.goto(loadUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await settle();

    let n = 0;
    for (const { href, title } of links) {
      const absolute = new URL(href, BASE_URL).toString();
      const url = withNoMasthead(absolute);
      const slug = fileSlugFromUrl(url);
      n += 1;
      console.log(`[${n}/${links.length}] ${title}`);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await settle();

      const filePath = path.join(OUT_DIR, `${slug}.png`);
      await page.screenshot({
        path: filePath,
        fullPage: true,
      });
      console.log(`  Saved: ${filePath}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nScreenshots written to: ${OUT_DIR} (${links.length} files)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
