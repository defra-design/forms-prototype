/**
 * Seeded static data for the editor “Copy page” handover journey.
 * These pages do not depend on session formPages.
 */

const FORM_NAME = "Apply for a county parish holding number";

const SOURCE_PAGE = {
  pageId: "static-copy-page-source",
  pageNumber: 1,
  pageHeading: "Business address",
  questionCount: 3,
  questions: [
    {
      questionId: "static-q-1",
      label: "What is the building name or number?",
    },
    {
      questionId: "static-q-2",
      label: "What is the street name?",
    },
    {
      questionId: "static-q-3",
      label: "What is the postcode?",
    },
  ],
};

const COPIED_PAGE = {
  pageId: "static-copy-page-copied",
  pageNumber: 2,
  pageHeading: "Business address (copy)",
  questionCount: 3,
  questions: SOURCE_PAGE.questions.map(function (question, index) {
    return {
      questionId: "static-copy-q-" + (index + 1),
      label: question.label,
    };
  }),
};

const JOURNEY_STEPS = [
  {
    id: "overview",
    title: "1. Page overview — start copy",
    description:
      "Editor page overview with Content heading and Copy page action.",
    href: "/titan-mvp-1.2/form-editor/copy/static/overview",
  },
  {
    id: "confirmation",
    title: "2. Confirmation",
    description:
      "Are you sure you want to copy…? Explains rename, question count, and that conditions are not copied.",
    href: "/titan-mvp-1.2/form-editor/copy/static/confirmation",
  },
  {
    id: "success",
    title: "3. Success — new page",
    description:
      "Lands on the copied page overview with success banner and (copy) heading.",
    href: "/titan-mvp-1.2/form-editor/copy/static/success",
  },
];

function buildCopyPageStaticIndexContext() {
  return {
    form: { name: FORM_NAME },
    staticPages: JOURNEY_STEPS,
    liveOverviewUrl: "/titan-mvp-1.2/page-overview",
    seedSessionUrl: "/titan-mvp-1.2/form-editor/copy/static/seed",
  };
}

function buildCopyPageStaticOverviewContext() {
  return {
    form: { name: FORM_NAME },
    pageNumber: SOURCE_PAGE.pageNumber,
    pageHeading: SOURCE_PAGE.pageHeading,
    currentPage: SOURCE_PAGE,
    copied: null,
    copyPageHref: "/titan-mvp-1.2/form-editor/copy/static/confirmation",
    staticMode: true,
  };
}

function buildCopyPageStaticConfirmationContext() {
  return {
    form: { name: FORM_NAME },
    pageId: SOURCE_PAGE.pageId,
    pageNumber: SOURCE_PAGE.pageNumber,
    pageHeading: SOURCE_PAGE.pageHeading,
    copiedLabel: COPIED_PAGE.pageHeading,
    questionCount: SOURCE_PAGE.questionCount,
    confirmHref: "/titan-mvp-1.2/form-editor/copy/static/success",
    cancelHref: "/titan-mvp-1.2/form-editor/copy/static/overview",
    staticMode: true,
  };
}

function buildCopyPageStaticSuccessContext() {
  return {
    form: { name: FORM_NAME },
    pageNumber: COPIED_PAGE.pageNumber,
    pageHeading: COPIED_PAGE.pageHeading,
    currentPage: COPIED_PAGE,
    copied: "page",
    copyPageHref: "/titan-mvp-1.2/form-editor/copy/static/confirmation",
    staticMode: true,
  };
}

function seedCopyPageSession(sessionData) {
  const data = sessionData || {};
  data.formName = FORM_NAME;
  data.formPages = [
    {
      pageId: SOURCE_PAGE.pageId,
      pageType: "question",
      pageHeading: SOURCE_PAGE.pageHeading,
      questions: SOURCE_PAGE.questions.map(function (question) {
        return {
          questionId: question.questionId,
          label: question.label,
          type: "text",
          subType: "shorttext",
        };
      }),
      hasGuidance: false,
      guidanceTextarea: "",
      allowMultipleResponses: false,
      conditions: [
        {
          id: "static-page-condition",
          name: "Example page condition",
          rules: [{ questionText: "Organisation type", value: "Business" }],
        },
      ],
    },
    {
      pageId: "static-copy-page-other",
      pageType: "question",
      pageHeading: "Contact details",
      questions: [
        {
          questionId: "static-other-q-1",
          label: "What is your email address?",
          type: "email",
        },
      ],
      hasGuidance: false,
      allowMultipleResponses: false,
    },
  ];
  data.currentPageIndex = 0;
  data.currentQuestionIndex = 0;
  data.copyPocViewStatus = "Draft";
  return data;
}

module.exports = {
  FORM_NAME,
  SOURCE_PAGE,
  COPIED_PAGE,
  JOURNEY_STEPS,
  buildCopyPageStaticIndexContext,
  buildCopyPageStaticOverviewContext,
  buildCopyPageStaticConfirmationContext,
  buildCopyPageStaticSuccessContext,
  seedCopyPageSession,
};
