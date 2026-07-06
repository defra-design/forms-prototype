const {
  enrichConditionsWithUsedInLabels,
  getEmailAddressesForCondition,
} = require("../lib/titan-mvp-1.2/condition-usage");

const STATIC_BASE = "/titan-mvp-1.2/form-editor/conditions/manager/static";
const DELETE_STATIC_BASE = "/titan-mvp-1.2/form-editor/conditions/delete/static";

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

function getPagesWithCondition(formPages, conditionId) {
  const pagesWithCondition = [];

  (formPages || []).forEach((page, index) => {
    if (page.conditions) {
      const usesCondition = page.conditions.some(
        (condition) => String(condition.id) === String(conditionId)
      );
      if (usesCondition) {
        pagesWithCondition.push({
          pageNumber: index + 1,
        });
      }
    }
  });

  return pagesWithCondition;
}

function conditionHasEmailActions(emailOutputs, conditionId) {
  return getEmailAddressesForCondition(emailOutputs, conditionId).length > 0;
}

const DELETE_STATIC_PAGES = [
  {
    slug: "not-used",
    title: "Not used",
    description:
      "Condition is not linked to any pages or email actions.",
    managerSlug: "mixed-usage",
    conditionId: 1004,
    formPages: [],
    emailOutputs: [],
  },
  {
    slug: "pages-only",
    title: "Used on pages only",
    description:
      "Deleting will affect the pages that use this condition.",
    managerSlug: "pages-only",
    conditionId: 1002,
    formPages: buildDemoFormPages({ 26: 1002 }),
    emailOutputs: [],
  },
  {
    slug: "email-action-only",
    title: "Used by email action only",
    description:
      "Deleting will affect email actions that use this condition.",
    managerSlug: "email-action-only",
    conditionId: 1001,
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
    title: "Used on a page and by email action",
    description:
      "Deleting will affect both pages and email actions that use this condition.",
    managerSlug: "page-and-email-action",
    conditionId: 1001,
    formPages: buildDemoFormPages({ 23: 1001 }),
    emailOutputs: [
      {
        id: 2001,
        conditionId: 1001,
        emailAddress: "farmers@defra.gov.uk",
      },
    ],
  },
];

function getStaticDeleteSlugForCondition(condition) {
  const usedPages = condition.usedInPages || [];
  const hasEmailActions = condition.hasEmailActions;

  if (hasEmailActions && usedPages.length > 0) {
    return "page-and-email-action";
  }
  if (hasEmailActions) {
    return "email-action-only";
  }
  if (usedPages.length > 0) {
    return "pages-only";
  }
  return "not-used";
}

function buildStaticConditionDeleteContext(variant) {
  const page = DELETE_STATIC_PAGES.find((item) => item.slug === variant);
  if (!page) {
    return null;
  }

  const condition = DEMO_CONDITIONS.find(
    (item) => String(item.id) === String(page.conditionId)
  );
  if (!condition) {
    return null;
  }

  return {
    form: { name: FORM_NAME },
    formName: FORM_NAME,
    conditionName: condition.conditionName,
    conditionId: condition.id,
    pagesWithCondition: getPagesWithCondition(page.formPages, condition.id),
    affectedEmailAddresses: getEmailAddressesForCondition(
      page.emailOutputs,
      condition.id
    ),
    hasEmailActions: conditionHasEmailActions(
      page.emailOutputs,
      condition.id
    ),
    staticPage: true,
    staticPageTitle: page.title,
    staticPageDescription: page.description,
    staticPageSlug: page.slug,
    staticIndexUrl: DELETE_STATIC_BASE,
    managerStaticUrl: `${STATIC_BASE}/${page.managerSlug}`,
    livePageUrl: `/titan-mvp-1.2/form-editor/conditions/delete/${condition.id}`,
    cancelUrl: `${STATIC_BASE}/${page.managerSlug}`,
  };
}

function buildStaticConditionDeleteIndexContext() {
  return {
    form: { name: FORM_NAME },
    staticPages: DELETE_STATIC_PAGES.map((page) => ({
      ...page,
      href: `${DELETE_STATIC_BASE}/${page.slug}`,
      managerHref: `${STATIC_BASE}/${page.managerSlug}`,
    })),
    livePageUrl: "/titan-mvp-1.2/form-editor/conditions/manager",
    managerStaticUrl: STATIC_BASE,
  };
}

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
    deleteStaticBase: DELETE_STATIC_BASE,
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
    deleteStaticUrl: DELETE_STATIC_BASE,
  };
}

module.exports = {
  STATIC_BASE,
  DELETE_STATIC_BASE,
  buildStaticConditionsManagerContext,
  buildStaticConditionsManagerIndexContext,
  buildStaticConditionDeleteContext,
  buildStaticConditionDeleteIndexContext,
  getStaticDeleteSlugForCondition,
};
