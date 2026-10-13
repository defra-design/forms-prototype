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

function cloneQuestion(question, nextId) {
  const copy = deepClone(question);
  copy.questionId = nextId();
  return copy;
}

function clonePage(page, nextId) {
  const copy = deepClone(page);
  copy.pageId = nextId();

  if (Array.isArray(copy.questions)) {
    copy.questions = copy.questions.map((question) =>
      cloneQuestion(question, nextId)
    );
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
  cloneQuestion,
  clonePage,
  cloneFormSessionSlice,
};
