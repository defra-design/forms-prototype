const {
  enrichConditionsWithUsedInLabels,
} = require("../lib/titan-mvp-1.2/condition-usage");

const STATIC_BASE = "/titan-mvp-1.2/form-editor/conditions/manager/static";

const FORM_NAME = "Apply for a county parish holding (CPH) number";

const DEMO_CONDITIONS = [
  {
    id: 1001,
    conditionName: "Applicant is a farmer",
    rules: [
      {
        questionText: "Are you a farmer?",
        operator: "is",
        value: "Yes",
      },
    ],
    text: "Are you a farmer? is 'Yes'",
  },
  {
    id: 1002,
    conditionName: "Livestock type is cattle",
    rules: [
      {
        questionText: "What type of livestock are you registering?",
        operator: "is",
        value: "Cattle",
      },
    ],
    text: "What type of livestock are you registering? is 'Cattle'",
  },
  {
    id: 1003,
    conditionName: "Application is urgent",
    rules: [
      {
        questionText: "Is this application urgent?",
        operator: "is",
        value: "Yes",
      },
    ],
    text: "Is this application urgent? is 'Yes'",
  },
  {
    id: 1004,
    conditionName: "Applicant lives in England",
    rules: [
      {
        questionText: "Which country do you live in?",
        operator: "is",
        value: "England",
      },
    ],
    text: "Which country do you live in? is 'England'",
  },
];

function buildDemoFormPages(conditionByPageNumber) {
  const maxPage = Math.max(...Object.keys(conditionByPageNumber).map(Number), 0);
  const pages = Array.from({ length: maxPage }, () => ({}));

  Object.entries(conditionByPageNumber).forEach(([pageNumber, conditionId]) => {
    pages[Number(pageNumber) - 1] = {
      conditions: [{ id: conditionId }],
    };
  });

  return pages;
}

const DEMO_FORM_PAGES = buildDemoFormPages({
  23: 1001,
  26: 1002,
});

const STATIC_PAGES = [
  {
    slug: "pages-only",
    title: "Used on pages only",
    description: "Conditions appear on form pages. None are linked to email actions.",
    formPages: DEMO_FORM_PAGES,
    emailOutputs: [],
  },
  {
    slug: "email-action-only",
    title: "Used by email action only",
    description: "One condition sends submissions to an additional email address. It is not used on any page.",
    formPages: [],
    emailOutputs: [
      {
        id: 2001,
        conditionId: 1001,
        emailAddress: "farmers@defra.gov.uk",
      },
    ],
  },
  {
    slug: "page-and-email-action",
    title: "Used on a page and by an email action",
    description: "The same condition controls a page and sends submissions to an additional email address.",
    formPages: buildDemoFormPages({ 23: 1001 }),
    emailOutputs: [
      {
        id: 2001,
        conditionId: 1001,
        emailAddress: "farmers@defra.gov.uk",
      },
    ],
  },
  {
    slug: "multiple-email-actions",
    title: "Multiple email actions",
    description: "Different conditions are linked to different additional email addresses.",
    formPages: [],
    emailOutputs: [
      {
        id: 2001,
        conditionId: 1001,
        emailAddress: "farmers@defra.gov.uk",
      },
      {
        id: 2002,
        conditionId: 1002,
        emailAddress: "cattle@defra.gov.uk",
      },
      {
        id: 2003,
        conditionId: 1003,
        emailAddress: "urgent@defra.gov.uk",
      },
    ],
  },
  {
    slug: "mixed-usage",
    title: "Mixed usage",
    description: "Conditions used on pages, by email actions, both, or not at all.",
    formPages: buildDemoFormPages({
      23: 1001,
      26: 1002,
      40: 1004,
    }),
    emailOutputs: [
      {
        id: 2001,
        conditionId: 1001,
        emailAddress: "farmers@defra.gov.uk",
      },
      {
        id: 2002,
        conditionId: 1003,
        emailAddress: "urgent@defra.gov.uk",
      },
    ],
  },
];

function buildStaticConditionsManagerContext(variant) {
  const page = STATIC_PAGES.find((item) => item.slug === variant);
  if (!page) {
    return null;
  }

  const conditions = enrichConditionsWithUsedInLabels(
    DEMO_CONDITIONS,
    page.formPages,
    page.emailOutputs
  );

  return {
    form: { name: FORM_NAME },
    conditions,
    formPages: page.formPages,
    availableQuestions: [],
    conditionSaved: false,
    query: {},
    staticPage: true,
    staticPageTitle: page.title,
    staticPageDescription: page.description,
    staticPageSlug: page.slug,
    staticIndexUrl: STATIC_BASE,
    livePageUrl: "/titan-mvp-1.2/form-editor/conditions/manager",
    emailActionsStaticUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static/with-outputs",
  };
}

function buildStaticConditionsManagerIndexContext() {
  return {
    form: { name: FORM_NAME },
    staticPages: STATIC_PAGES.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/${page.slug}`,
    })),
    livePageUrl: "/titan-mvp-1.2/form-editor/conditions/manager",
    emailActionsStaticUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static",
    advancedSettingsStaticUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/static",
  };
}

module.exports = {
  STATIC_BASE,
  buildStaticConditionsManagerContext,
  buildStaticConditionsManagerIndexContext,
};
