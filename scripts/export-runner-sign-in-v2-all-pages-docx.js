/**
 * Exports every page linked from /runner-sign-in-v2/all-pages into one Word document.
 *
 * Prerequisites: prototype server running (npm run serve).
 *
 * Usage:
 *   npm run export:runner-sign-in-v2-docx
 *   node scripts/export-runner-sign-in-v2-all-pages-docx.js
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const HTMLtoDOCX = require("html-to-docx");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ALL_PAGES_URL = `${BASE_URL}/runner-sign-in-v2/all-pages`;
const OUT_DIR = path.join(__dirname, "..", "exports");
const OUT_FILE = path.join(OUT_DIR, "runner-sign-in-v2-all-pages.docx");
const VIEWPORT = { width: 1200, height: 900 };
const IMAGE_WIDTH_PX = 680;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageBreak() {
  return '<div style="page-break-after: always;"></div>';
}

async function scrapeAllPagesIndex(page) {
  await page.goto(ALL_PAGES_URL, { waitUntil: "networkidle0", timeout: 30000 });

  return page.evaluate(() => {
    const sections = [];
    const sectionHeadings = Array.from(
      document.querySelectorAll(".govuk-grid-row .govuk-heading-m")
    );

    for (const headingEl of sectionHeadings) {
      const list = headingEl.nextElementSibling;
      if (!list || list.tagName !== "UL") continue;

      const links = Array.from(list.querySelectorAll("a")).map((anchor) => ({
        text: anchor.textContent.trim(),
        href: anchor.getAttribute("href"),
      }));

      sections.push({
        heading: headingEl.textContent.trim(),
        links,
      });
    }

    return sections;
  });
}

async function capturePageScreenshot(page, href) {
  const url = href.startsWith("http") ? href : `${BASE_URL}${href}`;

  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));

  const title = await page.title();
  const screenshot = await page.screenshot({
    type: "png",
    fullPage: true,
    encoding: "base64",
  });

  return { url, title, screenshot };
}

function buildDocumentHtml(sections, captures) {
  const generatedAt = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const parts = [
    "<!DOCTYPE html>",
    "<html><head><meta charset=\"utf-8\"></head><body>",
    "<h1>Runner sign-in v2 – all pages</h1>",
    `<p>Exported from the prototype on ${escapeHtml(generatedAt)}.</p>`,
    `<p>Source index: <a href="${escapeHtml(ALL_PAGES_URL)}">${escapeHtml(ALL_PAGES_URL)}</a></p>`,
    pageBreak(),
  ];

  let pageNumber = 0;

  for (const section of sections) {
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);

    for (const link of section.links) {
      if (!link.href || link.href === "/runner-sign-in-v2/all-pages") continue;

      const capture = captures.get(link.href);
      if (!capture) continue;

      pageNumber += 1;
      parts.push(`<h3>${pageNumber}. ${escapeHtml(link.text)}</h3>`);
      parts.push(`<p><strong>URL:</strong> <a href="${escapeHtml(capture.url)}">${escapeHtml(capture.url)}</a></p>`);
      if (capture.title) {
        parts.push(`<p><strong>Page title:</strong> ${escapeHtml(capture.title)}</p>`);
      }
      if (capture.screenshot) {
        parts.push(
          `<p><img src="data:image/png;base64,${capture.screenshot}" width="${IMAGE_WIDTH_PX}" alt="${escapeHtml(link.text)}" /></p>`
        );
      } else {
        parts.push("<p><em>Screenshot could not be captured for this page.</em></p>");
      }
      parts.push(pageBreak());
    }
  }

  parts.push("</body></html>");
  return parts.join("\n");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    console.log(`Reading page index from ${ALL_PAGES_URL}`);
    const sections = await scrapeAllPagesIndex(page);

    const links = [];
    const seen = new Set();

    for (const section of sections) {
      for (const link of section.links) {
        if (!link.href || link.href === "/runner-sign-in-v2/all-pages") continue;
        if (seen.has(link.href)) continue;
        seen.add(link.href);
        links.push({ ...link, section: section.heading });
      }
    }

    console.log(`Found ${links.length} unique pages to export`);

    const captures = new Map();

    for (const [index, link] of links.entries()) {
      const label = `[${index + 1}/${links.length}] ${link.section} – ${link.text}`;
      console.log(`Capturing: ${label}`);
      try {
        const capture = await capturePageScreenshot(page, link.href);
        captures.set(link.href, capture);
      } catch (error) {
        console.error(`  Failed: ${link.href}`);
        console.error(`  ${error.message}`);
        captures.set(link.href, {
          url: link.href.startsWith("http") ? link.href : `${BASE_URL}${link.href}`,
          title: "Capture failed",
          screenshot: null,
        });
      }
    }

    const html = buildDocumentHtml(sections, captures);
    const missingScreenshots = [...captures.values()].filter((item) => !item.screenshot).length;

    console.log("Building Word document…");
    const docxBuffer = await HTMLtoDOCX(html, null, {
      title: "Runner sign-in v2 – all pages",
      creator: "forms-prototype export script",
      margins: {
        top: 720,
        right: 720,
        bottom: 720,
        left: 720,
      },
      font: "Arial",
      fontSize: 22,
    });

    fs.writeFileSync(OUT_FILE, docxBuffer);
    console.log(`\nExported ${links.length} pages (${missingScreenshots} failed captures).`);
    console.log(`Word document: ${OUT_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
