const { resolve } = require("path");
const { cwd } = require("process");

//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require("govuk-prototype-kit");
const { addFilter, addFunction } = govukPrototypeKit.views;
const { buildLibraryQuery } = require("./lib/build-library-query");

// Add your filters here

// Import the marked package for Markdown parsing
const marked = require("marked");

// Configure marked options
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: true,
  pedantic: false,
});

// Custom renderer for images
const renderer = new marked.Renderer();
renderer.image = (href, title, text) => {
  // Clean up the title by removing newlines and extra spaces
  const cleanTitle = title ? title.replace(/\s+/g, " ").trim() : text;
  return `<figure class="govuk-image">
    <img src="${href}" alt="${text}" class="govuk-!-width-full">
    <figcaption class="govuk-body-s">${cleanTitle}</figcaption>
  </figure>`;
};

// Override paragraph renderer to not wrap images
renderer.paragraph = (text) => {
  if (text.trim().startsWith("<figure")) {
    return text;
  }
  return `<p class="govuk-body">${text}</p>`;
};

// Define filters
module.exports = function (env) {
  // Define a Markdown filter
  env.addFilter("markdown", (text) => {
    if (text && typeof text === "string") {
      return marked(text, { renderer });
    }
    return text;
  });
};

addFunction("require", (path) => {
  try {
    return require(resolve(cwd(), "app", path));
  } catch {
    return {};
  }
});

addFilter(
  "search",

  /**
   * @param {FormLibrary['items']} items
   * @param {Partial<Record<string, string | string[]>>} [data]
   */
  function (items, data = {}) {
    const { author, name, organisation, status, favouritesOnly, favouriteForms } =
      data;

    // Form name keyword search
    if (name && typeof name === "string") {
      const keywords = name.toLowerCase().split(/[\s+]+/);

      items = items.filter((item) =>
        keywords.every((keyword) => item.name.toLowerCase().includes(keyword))
      );
    }

    // Created or updated by author search
    if (Array.isArray(author) && author[0]) {
      items = items.filter(
        (item) =>
          author.includes(item.created.name) ||
          author.includes(item.updated.name)
      );
    }

    // Organisation filter
    if (Array.isArray(organisation) && organisation[0]) {
      items = items.filter((item) => organisation.includes(item.organisation));
    }

    // Status filter
    if (Array.isArray(status) && status[0]) {
      items =
        status.length === 1
          ? items.filter((item) => status.includes(item.status))
          : items.filter((item) => item.status === status.join("-"));
    }

    // Favourites only filter
    const favouritesOnlyOn =
      favouritesOnly === "yes" ||
      (Array.isArray(favouritesOnly) && favouritesOnly.includes("yes"));
    if (favouritesOnlyOn) {
      const favourites = Array.isArray(favouriteForms) ? favouriteForms : [];
      items = items.filter((item) => favourites.includes(item.name));
    }

    return items;
  }
);

addFilter("libraryQuery", function (data, overrides = {}) {
  return buildLibraryQuery(data || {}, overrides || {});
});

// Positional page arg – Nunjucks object literals in filters are unreliable
addFilter("libraryPageHref", function (data, page) {
  return buildLibraryQuery(data || {}, { page: page });
});

/**
 * @typedef {typeof import('./data/form-library.json')} FormLibrary
 */
