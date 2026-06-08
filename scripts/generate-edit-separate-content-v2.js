const fs = require('fs');
const path = require('path');
const configs = require('./edit-separate-content-config');
const { getDescriptionPlaceholder, buildPreviewListItem } = require('./edit-separate-content-preview-helpers');

const baseDir = path.join(__dirname, '../app/views/titan-mvp-1.2/form-editor/question-type');
const templatePath = path.join(baseDir, 'phone/edit-separate-content-v2.html');
const template = fs.readFileSync(templatePath, 'utf8');

function extractAnswerLimits(dir, sourceFile) {
  const filePath = path.join(baseDir, dir, sourceFile || 'edit-nf.html');
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(
    /(?:<!-- Answer limits -->|<!-- Answer Limits -->|answer_limits\.title|Set answer limits)[\s\S]*?<div class="govuk-details__text">([\s\S]*?)<\/div>\s*<\/details>/i
  );
  if (!match) return null;
  let inner = match[1]
    .trim()
    .replace(/\{%\s*include\s+"[^"]+"\s*%}/g, '')
    .trim();

  if (!inner.endsWith('</div>')) {
    inner += '\n                              </div>';
  }

  return inner;
}

function buildAnswerLimitsSection(limitsHtml) {
  return `                          <!-- Answer limits -->
                          <details class="govuk-details" data-module="govuk-details">
                            <summary class="govuk-details__summary">
                              <span class="govuk-details__summary-text">
                                {{ commonTerms.form_editor.question_settings.answer_limits.title }}
                              </span>
                            </summary>
                            <div class="govuk-details__text">
${limitsHtml}
                              </div>
                          </details>`;
}

function replaceOrInsertAnswerLimitsSection(content, sectionHtml) {
  if (content.includes('<!-- Answer limits section -->')) {
    return content.replace(
      /<!-- Answer limits section -->[\s\S]*?<!-- End answer limits section -->/,
      sectionHtml.trim()
    );
  }

  if (content.includes('<!-- Answer limits -->')) {
    return content.replace(/<!-- Answer limits -->[\s\S]*?<\/details>/, sectionHtml.trim());
  }

  return content.replace(
    /(\n\n)(\s*<!-- Section Break -->)/,
    `$1${sectionHtml}\n\n$2`
  );
}

function removeAnswerLimits(content) {
  if (content.includes('<!-- Answer limits section -->')) {
    return content.replace(
      /\s*<!-- Answer limits section -->[\s\S]*?<!-- End answer limits section -->\s*\n\n/,
      '\n\n                          '
    );
  }

  return content.replace(/\s*<!-- Answer limits -->[\s\S]*?<\/details>\s*\n\n/, '\n\n                          ');
}

function toPascal(slug) {
  return slug.split(/[-_]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function njkEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildLimitPlaceholdersJson(config) {
  const placeholders = config.limitPlaceholders || [];
  return JSON.stringify(placeholders);
}

function buildErrorScript(config) {
  const applyUsesShort = config.applyUsesShortDescription !== false;
  const limitPlaceholdersJson = buildLimitPlaceholdersJson(config);

  const previewLines = config.errors
    .map((error) => {
      const template = JSON.stringify(error.defaultValue);
      const descPlaceholder = getDescriptionPlaceholder(error.defaultValue);
      if (config.fileDescriptionPreview && error.id === 'no-file') {
        return `            { descriptionPreview: document.getElementById('file-type-description'), template: ${template}, descriptionPlaceholder: "[short description]" }`;
      }
      const descPh = descPlaceholder ? JSON.stringify(descPlaceholder) : 'null';
      return `            { preview: document.getElementById('error-${error.id}-preview'), descriptionPreview: document.getElementById('error-${error.id}-description-preview'), template: ${template}, descriptionPlaceholder: ${descPh} }`;
    })
    .join(',\n');

  return `
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const shortDescriptionInput = document.getElementById('short-description-input-${config.slug}');
          const errorDescriptionInput = document.getElementById('error-description-input-${config.slug}');
          const cyaShortDescriptionPreview = document.getElementById('cya-short-description-preview');
          const placeholderShortDescriptionDisplay = '[Short description]';
          const limitPlaceholders = ${limitPlaceholdersJson};
          const applyUsesShort = ${applyUsesShort};

          const errorPreviews = [
${previewLines}
          ];

          function capitalizeFirstLetter(text) {
            if (!text) return text;
            return text.charAt(0).toUpperCase() + text.slice(1);
          }

          function getShortDescriptionValue() {
            return shortDescriptionInput?.value.trim() || '';
          }

          function getErrorDescriptionValue() {
            return errorDescriptionInput?.value.trim() || '';
          }

          function getDescriptionForErrors() {
            const errorDescription = getErrorDescriptionValue();
            if (errorDescription) return errorDescription;
            return getShortDescriptionValue() || 'short description';
          }

          function applyTemplate(template, description) {
            if (!template) return '';
            const lower = (description || 'short description').toLowerCase();
            const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
            return template
              .replace(/\\[Short description\\]/g, cap)
              .replace(/\\[short description\\]/g, lower)
              .replace(/\\[short description is true\\]/g, lower);
          }

          function substituteLimitPlaceholders(text) {
            if (!text || !limitPlaceholders.length) return text;
            let result = text;
            limitPlaceholders.forEach(function (limit) {
              const input = document.getElementById(limit.inputId);
              const value = input?.value.trim() || limit.placeholder;
              result = result.split(limit.placeholder).join(value);
            });
            return result;
          }

          function updateShortDescriptionPreview() {
            if (!cyaShortDescriptionPreview) return;
            const value = getShortDescriptionValue();
            cyaShortDescriptionPreview.textContent = value
              ? capitalizeFirstLetter(value)
              : placeholderShortDescriptionDisplay;
          }

          function formatDescriptionText(placeholder, description) {
            const lower = (description || 'short description').toLowerCase();
            const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
            if (placeholder === '[Short description]') return cap;
            if (placeholder === '[short description is true]') return lower;
            return lower;
          }

          function updateLimitSpans(container) {
            if (!container) return;
            container.querySelectorAll('[data-limit-placeholder]').forEach(function (el) {
              const placeholder = el.getAttribute('data-limit-placeholder');
              const limit = limitPlaceholders.find(function (l) { return l.placeholder === placeholder; });
              if (!limit) return;
              const input = document.getElementById(limit.inputId);
              el.textContent = input?.value.trim() || placeholder;
            });
          }

          function updateErrorPreviews() {
            const description = getDescriptionForErrors();
            errorPreviews.forEach(function (field) {
              if (field.descriptionPreview && field.descriptionPlaceholder) {
                field.descriptionPreview.textContent = applyUsesShort
                  ? formatDescriptionText(field.descriptionPlaceholder, description)
                  : field.descriptionPlaceholder;
              } else if (field.preview && !field.descriptionPlaceholder) {
                field.preview.textContent = substituteLimitPlaceholders(field.template);
              }
              updateLimitSpans(field.preview);
            });
          }

          function showPreviewTab(panelId) {
            const tabLink = document.querySelector('#question-preview-tabs .govuk-tabs__tab[href="#' + panelId + '"]');
            if (tabLink) {
              tabLink.click();
            }
          }

          function applyHighlightOnFocus(inputElement, targetElements, tabPanelId) {
            if (!inputElement || !targetElements) return;
            const targets = targetElements.length !== undefined
              ? Array.from(targetElements)
              : [targetElements];

            inputElement.addEventListener('focus', function () {
              if (tabPanelId) showPreviewTab(tabPanelId);
              targets.forEach(function (target) {
                if (target) target.classList.add('highlight');
              });
            });
            inputElement.addEventListener('blur', function () {
              targets.forEach(function (target) {
                if (target) target.classList.remove('highlight');
              });
            });

            if (document.activeElement === inputElement) {
              if (tabPanelId) showPreviewTab(tabPanelId);
              targets.forEach(function (target) {
                if (target) target.classList.add('highlight');
              });
            }
          }

          function wireLimitInputs() {
            limitPlaceholders.forEach(function (limit) {
              const input = document.getElementById(limit.inputId);
              if (!input) return;

              input.addEventListener('input', updateErrorPreviews);

              const relatedPreview = errorPreviews.find(function (field) {
                return field.template.includes(limit.placeholder);
              });

              if (relatedPreview?.preview) {
                const limitSpan = relatedPreview.preview.querySelector('[data-limit-placeholder="' + limit.placeholder + '"]');
                applyHighlightOnFocus(input, limitSpan || relatedPreview.preview, 'error-messages');
              }
            });
          }

          const errorDescriptionHighlightTargets = errorPreviews
            .map(function (field) { return field.descriptionPreview; })
            .filter(Boolean);

          if (shortDescriptionInput) {
            shortDescriptionInput.addEventListener('input', function () {
              updateShortDescriptionPreview();
              updateErrorPreviews();
            });
            applyHighlightOnFocus(shortDescriptionInput, cyaShortDescriptionPreview, 'check-your-answers');
          }

          if (errorDescriptionInput) {
            errorDescriptionInput.addEventListener('input', updateErrorPreviews);
            applyHighlightOnFocus(errorDescriptionInput, errorDescriptionHighlightTargets, 'error-messages');
          }

          wireLimitInputs();
          updateShortDescriptionPreview();
          updateErrorPreviews();
        });
      </script>`;
}

function buildErrorPreviewList(config) {
  const anchor = config.previewAnchor;
  const sections = config.previewSections || [{ errors: config.errors }];
  const parts = [];

  for (const section of sections) {
    if (section.heading) {
      parts.push(`                    <h3 class="govuk-heading-s">${section.heading}</h3>`);
    }
    for (const error of section.errors) {
      parts.push(buildPreviewListItem(error, anchor, config));
    }
  }

  return parts.join('\n');
}

function buildTextareaCharacterCountScript(config) {
  if (!config.textareaCharacterCount) return '';

  return `
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const maxCharactersInput = document.getElementById('max-characters');
          const previewTextarea = document.getElementById('text-input-field');

          if (!maxCharactersInput || !previewTextarea) return;

          function updatePreviewCharacterCount() {
            const maxCharacters = maxCharactersInput.value.trim();
            const formGroup = previewTextarea.closest('.govuk-form-group');
            if (!formGroup) return;

            if (maxCharacters && maxCharacters !== '[max length]' && !Number.isNaN(Number(maxCharacters))) {
              formGroup.classList.add('govuk-character-count');
              formGroup.setAttribute('data-module', 'govuk-character-count');
              formGroup.setAttribute('data-maxlength', maxCharacters);

              let countEl = formGroup.querySelector('.govuk-character-count__message');
              if (!countEl) {
                countEl = document.createElement('div');
                countEl.className = 'govuk-hint govuk-character-count__message';
                countEl.setAttribute('aria-live', 'polite');
                formGroup.appendChild(countEl);
              }
              const currentLength = previewTextarea.value.length;
              countEl.textContent = 'You can enter up to ' + maxCharacters + ' characters';
              countEl.id = 'text-input-field-info';
              previewTextarea.setAttribute('aria-describedby', 'text-input-field-info');
            } else {
              formGroup.classList.remove('govuk-character-count');
              formGroup.removeAttribute('data-module');
              formGroup.removeAttribute('data-maxlength');
              const countEl = formGroup.querySelector('.govuk-character-count__message');
              if (countEl) countEl.remove();
            }
          }

          maxCharactersInput.addEventListener('input', updatePreviewCharacterCount);
          updatePreviewCharacterCount();
        });
      </script>`;
}

function buildForType(config) {
  const slug = config.slug;
  const pascal = toPascal(slug);
  let content = template;

  content = content.replace(/commonTerms\.form_editor\.information_type\.phone\.title/g, config.infoType);
  content = content.replace(
    /\/titan-mvp-1\.2\/form-editor\/question-type\/phone\//g,
    `/titan-mvp-1.2/form-editor/question-type/${config.dir}/`
  );
  content = content.replace(/question-label-input-phone/g, `question-label-input-${slug}`);
  content = content.replace(/questionLabelInputPhone/g, config.labelName);
  content = content.replace(/hint-text-input-phone/g, `hint-text-input-${slug}`);
  content = content.replace(/hintTextInputPhone/g, `hintTextInput${pascal}`);
  content = content.replace(/value: data\['hint-text-input-phone'\]/g, `value: ${config.hintData}`);
  content = content.replace(/short-description-input-phone/g, `short-description-input-${slug}`);
  content = content.replace(/error-description-input-phone/g, `error-description-input-${slug}`);
  content = content.replace(
    /commonTerms\.form_editor\.question_settings\.separate_content_v2\.short_description\.hints\.phone/g,
    `commonTerms.form_editor.question_settings.separate_content_v2.short_description.hints.${slug}`
  );
  content = content.replace(/#phone-number-input/g, `#${config.previewAnchor}`);
  content = content.replace(/01632 960 211/g, config.cyaSample);
  content = content.replace(/visuallyHiddenText: " phone number"/g, `visuallyHiddenText: " ${config.cyaHidden}"`);
  content = content.replace(
    /<span class="govuk-visually-hidden"> phone number<\/span>/g,
    `<span class="govuk-visually-hidden"> ${config.cyaHidden}</span>`
  );

  const previewRegex = /(<ul class="govuk-list govuk-error-summary__list">)\s*[\s\S]*?(\s*<\/ul>)/;
  content = content.replace(previewRegex, `$1\n${buildErrorPreviewList(config)}\n                  $2`);

  const secondScriptStart = content.indexOf(
    "<script>\n        document.addEventListener('DOMContentLoaded', function () {\n          const shortDescriptionInput"
  );
  const scrollScriptStart = content.indexOf(
    "<script>\n        document.addEventListener('DOMContentLoaded', function () {\n          window.scrollTo"
  );
  if (secondScriptStart !== -1 && scrollScriptStart !== -1) {
    content =
      content.slice(0, secondScriptStart) +
      buildErrorScript(config) +
      buildTextareaCharacterCountScript(config) +
      '\n\n      ' +
      content.slice(scrollScriptStart);
  }

  let answerLimitsHtml = extractAnswerLimits(config.dir, config.answerLimitsSource);
  if (answerLimitsHtml && config.answerLimitsSource) {
    const editNfLimits = extractAnswerLimits(config.dir, 'edit-nf.html');
    const limitsAlreadyComplete = /id:\s*"classes(-number)?"/.test(answerLimitsHtml);
    if (editNfLimits && !limitsAlreadyComplete) {
      answerLimitsHtml = `${answerLimitsHtml.trim()}\n\n${editNfLimits}`;
    }
  }
  if (answerLimitsHtml) {
    const sectionHtml = buildAnswerLimitsSection(answerLimitsHtml);
    content = replaceOrInsertAnswerLimitsSection(content, sectionHtml);
  } else {
    content = removeAnswerLimits(content);
  }

  content = content.replace(
    /\n        \.answer-limits-group__panel[\s\S]*?\.answer-limits-group__panel \.govuk-details \+ \.govuk-details \{[\s\S]*?\}\n/,
    '\n'
  );

  return content;
}

for (const config of configs) {
  const previewPath = path.join(baseDir, config.dir, 'previews/edit.html');
  if (!config.skipPreviewCheck && !fs.existsSync(previewPath)) {
    console.warn(`Skip ${config.dir}: no previews/edit.html`);
    continue;
  }
  const outPath = path.join(baseDir, config.dir, 'edit-separate-content-v2.html');
  fs.writeFileSync(outPath, buildForType(config));
  const limitsNote = config.limitPlaceholders?.length
    ? `, ${config.limitPlaceholders.length} limit fields`
    : '';
  console.log(`Wrote ${outPath} (${config.errors.length} error fields${limitsNote})`);
}
