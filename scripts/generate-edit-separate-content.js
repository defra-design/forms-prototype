const fs = require('fs');
const path = require('path');
const configs = require('./edit-separate-content-config');

const baseDir = path.join(__dirname, '../app/views/titan-mvp-1.2/form-editor/question-type');
const templatePath = path.join(baseDir, 'phone/edit-separate-content.html');
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

function buildAnswerLimitsSection(limitsHtml, limitHtml, hasLimitErrors) {
  let section = `                          <!-- Answer limits section -->
                          <div class="answer-limits-group govuk-!-margin-top-6">
                            <h2 class="govuk-heading-m govuk-!-margin-bottom-3">
                              {{ commonTerms.form_editor.question_settings.separate_content.answer_limits_section.heading }}
                            </h2>
                            <p class="govuk-body govuk-!-margin-bottom-4">
                              {{ commonTerms.form_editor.question_settings.separate_content.answer_limits_section.intro }}
                            </p>
                            <details class="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                              <summary class="govuk-details__summary">
                                <span class="govuk-details__summary-text">
                                  {{ commonTerms.form_editor.question_settings.answer_limits.title }}
                                </span>
                              </summary>
                              <div class="govuk-details__text">
${limitsHtml}
                              </div>
                            </details>`;

  if (hasLimitErrors) {
    section += `
                            <details class="govuk-details govuk-!-margin-top-4 govuk-!-margin-bottom-0 limit-dependent-errors" data-module="govuk-details">
                              <summary class="govuk-details__summary">
                                <span class="govuk-details__summary-text">
                                  {{ commonTerms.form_editor.question_settings.separate_content.error_messages.when_limits_set.legend }}
                                </span>
                              </summary>
                              <div class="govuk-details__text">
                                <p class="govuk-hint govuk-!-margin-bottom-4">
                                  {{ commonTerms.form_editor.question_settings.separate_content.error_messages.when_limits_set.hint }}
                                </p>
${limitHtml}
                              </div>
                            </details>`;
  }

  section += `
                          </div>
                          <!-- End answer limits section -->`;
  return section;
}

function replaceOrInsertAnswerLimitsSection(content, sectionHtml) {
  if (content.includes('<!-- Answer limits section -->')) {
    return content.replace(
      /<!-- Answer limits section -->[\s\S]*?<!-- End answer limits section -->/,
      sectionHtml.trim()
    );
  }

  content = content.replace(
    /\s*<!-- Answer limits -->[\s\S]*?(?:<div class="govuk-!-margin-top-6[\s\S]*?limit-dependent-errors[\s\S]*?<\/div>\s*\n\n)?(?=\s*<!-- Section Break -->)/,
    '\n\n                          '
  );

  return content.replace(
    /(\s*<\/fieldset>\s*\n\n)(\s*<!-- Section Break -->)/,
    `$1\n${sectionHtml}\n\n$2`
  );
}

function removeAnswerLimits(content) {
  if (content.includes('<!-- Answer limits section -->')) {
    return content.replace(
      /\s*<!-- Answer limits section -->[\s\S]*?<!-- End answer limits section -->\s*\n\n/,
      '\n\n                          '
    );
  }

  return content.replace(
    /\s*<!-- Answer limits -->[\s\S]*?(?:<div class="govuk-!-margin-top-6[\s\S]*?limit-dependent-errors[\s\S]*?<\/div>\s*\n\n)?(?=\s*<!-- Section Break -->)/,
    '\n\n                          '
  );
}

function toPascal(slug) {
  return slug.split(/[-_]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function njkEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildErrorInput(error, slug, pascal) {
  const id = `error-${error.id}-input-${slug}`;
  const name = `error${toPascal(error.id)}Input${pascal}`;
  const templateAttr = njkEscape(error.defaultValue);
  const label = njkEscape(error.label);
  const value = njkEscape(error.defaultValue);

  return `
                            {{ govukInput({
                            label: {
                            text: "${label}",
                            classes: "govuk-label--s"
                            },
                            id: "${id}",
                            name: "${name}",
                            value: "${value}",
                            classes: "govuk-!-width-full",
                            attributes: {
                              "data-apply-template": "${templateAttr}"
                            }
                            }) }}`;
}

function getLimitDependentErrorIds(config) {
  const ids = new Set();
  (config.previewSections || []).forEach((section) => {
    if (section.heading && /answer limits/i.test(section.heading)) {
      section.errors.forEach((error) => ids.add(error.id));
    }
  });
  return ids;
}

function buildErrorFieldsetParts(config) {
  const pascal = toPascal(config.slug);
  const limitIds = getLimitDependentErrorIds(config);
  const alwaysErrors = config.errors.filter((error) => !limitIds.has(error.id));
  const limitErrors = config.errors.filter((error) => limitIds.has(error.id));

  return {
    alwaysHtml: alwaysErrors.map((error) => buildErrorInput(error, config.slug, pascal)).join('\n'),
    limitHtml: limitErrors.map((error) => buildErrorInput(error, config.slug, pascal)).join('\n'),
    hasLimitErrors: limitErrors.length > 0,
  };
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
  return `                    <li>
                      <a href="#${anchor}">
                        <span id="${previewId}">${error.defaultValue}</span>
                      </a>
                    </li>`;
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

function buildLimitPlaceholdersJson(config) {
  const placeholders = config.limitPlaceholders || [];
  return JSON.stringify(placeholders);
}

function buildErrorScript(config) {
  const slug = config.slug;
  const applyUsesShort = config.applyUsesShortDescription !== false;
  const limitPlaceholdersJson = buildLimitPlaceholdersJson(config);
  const fileDescriptionPreview = Boolean(config.fileDescriptionPreview);

  const fieldLines = config.errors
    .map((error) => {
      if (fileDescriptionPreview && error.id === 'no-file') {
        return `            { input: document.getElementById('error-${error.id}-input-${slug}'), preview: document.getElementById('file-type-description'), previewLink: document.querySelector('#error-messages a[href="#${config.previewAnchor}"]') }`;
      }
      return `            { input: document.getElementById('error-${error.id}-input-${slug}'), preview: document.getElementById('error-${error.id}-preview') }`;
    })
    .join(',\n');

  return `
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const shortDescriptionInput = document.getElementById('short-description-input-${slug}');
          const applyToErrorsButton = document.getElementById('apply-short-description-to-errors');
          const cyaShortDescriptionPreview = document.getElementById('cya-short-description-preview');
          const placeholderShortDescriptionDisplay = '[Short description]';
          const limitPlaceholders = ${limitPlaceholdersJson};

          const errorFields = [
${fieldLines}
          ];

          function capitalizeFirstLetter(text) {
            if (!text) return text;
            return text.charAt(0).toUpperCase() + text.slice(1);
          }

          function getShortDescriptionValue() {
            return shortDescriptionInput?.value.trim() || '';
          }

          function getShortDescriptionForApply() {
            return getShortDescriptionValue() || 'short description';
          }

          function applyTemplate(template, shortDescription) {
            if (!template) return '';
            const lower = (shortDescription || 'short description').toLowerCase();
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

          function applyErrorsFromShortDescription() {
            errorFields.forEach(function (field) {
              if (!field.input) return;
              const template = field.input.getAttribute('data-apply-template') || field.input.value;
              ${
                applyUsesShort
                  ? 'field.input.value = applyTemplate(template, getShortDescriptionForApply());'
                  : 'field.input.value = template;'
              }
            });
            updateErrorPreviews();
          }

          function updateShortDescriptionPreview() {
            if (!cyaShortDescriptionPreview) return;
            const value = getShortDescriptionValue();
            cyaShortDescriptionPreview.textContent = value
              ? capitalizeFirstLetter(value)
              : placeholderShortDescriptionDisplay;
          }

          function updateErrorPreviews() {
            errorFields.forEach(function (field) {
              if (!field.preview || !field.input) return;
              const template = field.input.getAttribute('data-apply-template') || '';
              const value = field.input.value.trim();
              const message = substituteLimitPlaceholders(value || template);
              field.preview.textContent = message;
            });
            ${fileDescriptionPreview ? 'updateFileTypeDescriptionPreview();' : ''}
          }

          ${
            fileDescriptionPreview
              ? `
          function updateFileTypeDescriptionPreview() {
            const fileTypeDescription = document.getElementById('file-type-description');
            if (!fileTypeDescription) return;
            const value = getShortDescriptionValue();
            fileTypeDescription.textContent = value ? value.toLowerCase() : '[short description]';
          }
`
              : ''
          }

          function applyHighlightOnFocus(inputElement, targetElement) {
            if (!inputElement || !targetElement) return;

            inputElement.addEventListener('focus', function () {
              targetElement.classList.add('highlight');
            });
            inputElement.addEventListener('blur', function () {
              targetElement.classList.remove('highlight');
            });

            if (document.activeElement === inputElement) {
              targetElement.classList.add('highlight');
            }
          }

          function wireLimitInputs() {
            limitPlaceholders.forEach(function (limit) {
              const input = document.getElementById(limit.inputId);
              if (!input) return;

              input.addEventListener('input', function () {
                updateErrorPreviews();
              });

              const relatedPreview = errorFields.find(function (field) {
                const template = field.input?.getAttribute('data-apply-template') || '';
                return template.includes(limit.placeholder);
              });

              if (relatedPreview?.preview) {
                applyHighlightOnFocus(input, relatedPreview.preview);
              }
            });
          }

          if (shortDescriptionInput) {
            shortDescriptionInput.addEventListener('focus', function () {
              shortDescriptionInput.removeAttribute('readonly');
            }, { once: true });

            shortDescriptionInput.addEventListener('input', function () {
              updateShortDescriptionPreview();
              ${fileDescriptionPreview ? 'updateFileTypeDescriptionPreview();' : ''}
            });
            applyHighlightOnFocus(shortDescriptionInput, cyaShortDescriptionPreview);
          }

          if (applyToErrorsButton) {
            applyToErrorsButton.addEventListener('click', applyErrorsFromShortDescription);
          }

          errorFields.forEach(function (field) {
            if (field.input) {
              field.input.addEventListener('input', updateErrorPreviews);
              if (field.preview) {
                applyHighlightOnFocus(field.input, field.preview);
              }
            }
          });

          wireLimitInputs();
          updateShortDescriptionPreview();
          updateErrorPreviews();
        });
      </script>`;
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
  content = content.replace(
    /commonTerms\.form_editor\.question_settings\.separate_content\.short_description\.hint/g,
    `commonTerms.form_editor.question_settings.separate_content.short_description.hints.${slug}`
  );
  content = content.replace(/#phone-number-input/g, `#${config.previewAnchor}`);
  content = content.replace(/01632 960 211/g, config.cyaSample);
  content = content.replace(/visuallyHiddenText: " phone number"/g, `visuallyHiddenText: " ${config.cyaHidden}"`);
  content = content.replace(
    /<span class="govuk-visually-hidden"> phone number<\/span>/g,
    `<span class="govuk-visually-hidden"> ${config.cyaHidden}</span>`
  );

  const { alwaysHtml, limitHtml, hasLimitErrors } = buildErrorFieldsetParts(config);
  const fieldsetRegex =
    /(<fieldset class="govuk-fieldset govuk-!-margin-top-6">[\s\S]*?<div class="govuk-hint">[\s\S]*?<\/div>\s*)([\s\S]*?)(\s*<\/fieldset>)/;
  content = content.replace(fieldsetRegex, `$1${alwaysHtml}$3`);

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
    const sectionHtml = buildAnswerLimitsSection(answerLimitsHtml, limitHtml, hasLimitErrors);
    content = replaceOrInsertAnswerLimitsSection(content, sectionHtml);
  } else {
    content = removeAnswerLimits(content);
  }

  content = removeAnswerLimitsPanelStyles(content);

  return content;
}

function removeAnswerLimitsPanelStyles(content) {
  return content.replace(
    /\n        \.answer-limits-group__panel[\s\S]*?\.answer-limits-group__panel \.govuk-details \+ \.govuk-details \{[\s\S]*?\}\n/,
    '\n'
  );
}

for (const config of configs) {
  const previewPath = path.join(baseDir, config.dir, 'previews/edit.html');
  if (!config.skipPreviewCheck && !fs.existsSync(previewPath)) {
    console.warn(`Skip ${config.dir}: no previews/edit.html`);
    continue;
  }
  const outPath = path.join(baseDir, config.dir, 'edit-separate-content.html');
  fs.writeFileSync(outPath, buildForType(config));
  const limitsNote = config.limitPlaceholders?.length
    ? `, ${config.limitPlaceholders.length} limit fields`
    : '';
  console.log(`Wrote ${outPath} (${config.errors.length} error fields${limitsNote})`);
}
