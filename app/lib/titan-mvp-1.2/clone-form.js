/**
 * Prototype helpers for copying form / page / question.
 * Deep-clones session-shaped data and stamps new ids — not production forms-model.
 */

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createIdFactory() {
  let sequence = 0;
  return function nextId() {
    sequence += 1;
    return `${Date.now()}-${sequence}`;
  };
}

const COPY_SUFFIX = /\s*\(copy(?:\s+(\d+))?\)$/i;

function copyStem(text, fallback) {
  let source = String(text || "").trim();
  source = source.replace(/^copy of\s+/i, "");
  source = source.replace(COPY_SUFFIX, "").trim();
  return source || fallback || "Untitled";
}

function formatCopyLabel(stem, copyNumber) {
  if (copyNumber <= 1) {
    return `${stem} (copy)`;
  }
  return `${stem} (copy ${copyNumber})`;
}

function uniqueCopyLabel(text, existingLabels, fallback) {
  const stem = copyStem(text, fallback);
  const taken = new Set(
    (existingLabels || []).map((label) =>
      String(label || "")
        .trim()
        .toLowerCase()
    )
  );

  let copyNumber = 1;
  let candidate = formatCopyLabel(stem, copyNumber);
  while (taken.has(candidate.toLowerCase())) {
    copyNumber += 1;
    candidate = formatCopyLabel(stem, copyNumber);
  }
  return candidate;
}

function cloneQuestion(question, nextId, options) {
  const copy = deepClone(question);
  copy.questionId = nextId();
  if (options && options.identifyCopy) {
    copy.label = uniqueCopyLabel(
      copy.label,
      options.existingLabels,
      "Untitled question"
    );
  }
  return copy;
}

function clonePage(page, nextId, options) {
  const copy = deepClone(page);
  copy.pageId = nextId();

  if (Array.isArray(copy.questions)) {
    copy.questions = copy.questions.map((question) =>
      cloneQuestion(question, nextId)
    );
  }

  if (options && options.identifyCopy) {
    const existingLabels = options.existingLabels || [];
    if (copy.pageType === "guidance") {
      copy.guidanceOnlyHeadingInput = uniqueCopyLabel(
        copy.guidanceOnlyHeadingInput,
        existingLabels,
        "Untitled page"
      );
    } else if (copy.pageHeading) {
      copy.pageHeading = uniqueCopyLabel(
        copy.pageHeading,
        existingLabels,
        "Untitled page"
      );
    } else if (
      copy.questions &&
      copy.questions.length === 1 &&
      copy.questions[0]
    ) {
      copy.questions[0].label = uniqueCopyLabel(
        copy.questions[0].label,
        existingLabels,
        "Untitled question"
      );
    } else {
      copy.pageHeading = uniqueCopyLabel("page", existingLabels, "page");
    }
  }

  // Keep page condition objects as-is (same upstream refs in this form).
  // Give them distinct object identity only — do not invent new form-level conditions.
  if (Array.isArray(copy.conditions)) {
    copy.conditions = deepClone(copy.conditions);
  }

  return copy;
}

function cloneFormSessionSlice(sessionData, nextId, newFormName) {
  const source = sessionData || {};
  const formPages = Array.isArray(source.formPages)
    ? source.formPages.map((page) => clonePage(page, nextId))
    : [];

  return {
    formPages,
    conditions: deepClone(source.conditions || []),
    sections: deepClone(source.sections || []),
    checkAnswersItems: deepClone(source.checkAnswersItems || []),
    formName: newFormName,
    formId: `FORM-${nextId()}`,
    formDetails: {
      ...(source.formDetails || {}),
      name: newFormName,
      id: `FORM-${nextId()}`,
      status: "Draft",
      lastUpdated: new Date().toISOString(),
    },
    organisationName: source.organisationName,
    teamName: source.teamName,
    email: source.email,
    currentPageIndex: 0,
    currentQuestionIndex: 0,
  };
}

module.exports = {
  deepClone,
  createIdFactory,
  copyStem,
  formatCopyLabel,
  uniqueCopyLabel,
  cloneQuestion,
  clonePage,
  cloneFormSessionSlice,
};
