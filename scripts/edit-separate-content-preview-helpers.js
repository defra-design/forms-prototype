function getDescriptionPlaceholder(template) {
  const match = template.match(/\[Short description\]|\[short description is true\]|\[short description\]/);
  return match ? match[0] : null;
}

function buildPreviewInnerHtml(template, errorId, limitPlaceholders = []) {
  let html = template;
  const descPlaceholder = getDescriptionPlaceholder(template);

  if (descPlaceholder) {
    html = html.replace(
      descPlaceholder,
      `<span id="error-${errorId}-description-preview">${descPlaceholder}</span>`
    );
  }

  limitPlaceholders.forEach((limit) => {
    html = html.split(limit.placeholder).join(
      `<span data-limit-placeholder=${JSON.stringify(limit.placeholder)}>${limit.placeholder}</span>`
    );
  });

  return html;
}

function buildPreviewListItem(error, anchor, config) {
  if (config.fileDescriptionPreview && error.id === 'no-file') {
    return `                    <li>
                      <a href="#${anchor}">
                        Select a <span id="file-type-description">[short description]</span>
                      </a>
                    </li>`;
  }

  const previewId = `error-${error.id}-preview`;
  const innerHtml = buildPreviewInnerHtml(
    error.defaultValue,
    error.id,
    config.limitPlaceholders || []
  );

  return `                    <li>
                      <a href="#${anchor}">
                        <span id="${previewId}">${innerHtml}</span>
                      </a>
                    </li>`;
}

module.exports = {
  getDescriptionPlaceholder,
  buildPreviewInnerHtml,
  buildPreviewListItem,
};
