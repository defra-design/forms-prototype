const STATIC_BASE =
  "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static";

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
];

const STATIC_PAGES = [
  {
    slug: "empty",
    title: "Empty state",
    description: "Default email only. Add form visible with no additional addresses.",
  },
  {
    slug: "with-outputs",
    title: "With additional addresses",
    description: "Two additional addresses — one conditional, one on every submission.",
  },
  {
    slug: "saved",
    title: "Success after save",
    description: "Success banner shown after saving an additional address.",
  },
  {
    slug: "edit-output",
    title: "Change an additional address",
    description: "Edit form shown for an existing additional address.",
  },
  {
    slug: "validation-error",
    title: "Validation error",
    description: "Email address validation error when adding a new address.",
  },
  {
    slug: "max-outputs",
    title: "Maximum addresses reached",
    description: "Twenty additional addresses configured. Add form hidden.",
  },
];

function formatSubmissionTypeLabel(submissionType, submissionVersion) {
  if (submissionType === "machine-readable") {
    return `Machine readable format (v${submissionVersion || "3"})`;
  }
  return "Human readable format";
}

function formatConditionRulesSummary(rules) {
  if (!rules || !rules.length) {
    return "";
  }

  return rules
    .map((rule, index) => {
      const valueText = Array.isArray(rule.value)
        ? rule.value.map((value) => `'${value}'`).join(" or ")
        : `'${rule.value}'`;
      const operator = String(rule.operator || "is").replace(/-/g, " ");
      const prefix = index > 0 ? `${rule.logicalOperator || "AND"} ` : "";
      return `${prefix}'${rule.questionText}' ${operator} ${valueText}`;
    })
    .join(" ");
}

function getConditionById(conditionId) {
  return DEMO_CONDITIONS.find(
    (condition) => String(condition.id) === String(conditionId)
  );
}

function enrichOutput(output) {
  const condition = getConditionById(output.conditionId);
  return {
    ...output,
    conditionName: condition
      ? condition.conditionName
      : "Every submission (no condition)",
    conditionText: condition ? condition.text : "",
    ruleSummary: condition
      ? formatConditionRulesSummary(condition.rules)
      : "",
    formatLabel: formatSubmissionTypeLabel(
      output.submissionType,
      output.submissionVersion
    ),
  };
}

function buildMailboxConditionSelectItems(selectedConditionId) {
  const hasSelectedCondition =
    selectedConditionId !== null &&
    selectedConditionId !== undefined &&
    String(selectedConditionId) !== "";

  return [
    {
      value: "",
      text: "Every submission (no condition)",
      selected: !hasSelectedCondition,
    },
    ...DEMO_CONDITIONS.map((condition) => ({
      value: String(condition.id),
      text: condition.conditionName,
      hint: {
        text: formatConditionRulesSummary(condition.rules),
      },
      selected: String(condition.id) === String(selectedConditionId),
    })),
  ];
}

const SAMPLE_OUTPUTS = [
  {
    id: 2001,
    conditionId: 1001,
    emailAddress: "farmers@defra.gov.uk",
    submissionType: "human-only",
    submissionVersion: "3",
  },
  {
    id: 2002,
    conditionId: null,
    emailAddress: "records@defra.gov.uk",
    submissionType: "machine-readable",
    submissionVersion: "3",
  },
];

const MAX_ADDITIONAL_EMAIL_ADDRESSES = 20;

const MAX_OUTPUT_SAMPLES = Array.from(
  { length: MAX_ADDITIONAL_EMAIL_ADDRESSES },
  (_, index) => ({
    id: 2001 + index,
    conditionId:
      index < DEMO_CONDITIONS.length ? DEMO_CONDITIONS[index].id : null,
    emailAddress: `team${index + 1}@defra.gov.uk`,
    submissionType: index % 4 === 0 ? "machine-readable" : "human-only",
    submissionVersion: "3",
  })
);

function buildStaticConditionalMailboxContext(variant) {
  const page = STATIC_PAGES.find((item) => item.slug === variant);
  if (!page) {
    return null;
  }

  const routingConditions = DEMO_CONDITIONS.map((condition) => ({
    ...condition,
    ruleSummary: formatConditionRulesSummary(condition.rules),
  }));

  let rawOutputs = [];
  let saved = false;
  let errors = {};
  let editOutput = false;
  let addOutputForm = {
    conditionId: "",
    emailAddress: "",
    submissionType: "human-only",
    submissionVersion: "3",
  };

  if (variant === "with-outputs" || variant === "saved" || variant === "edit-output") {
    rawOutputs = SAMPLE_OUTPUTS;
  }

  if (variant === "saved") {
    saved = true;
  }

  if (variant === "max-outputs") {
    rawOutputs = MAX_OUTPUT_SAMPLES;
  }

  if (variant === "validation-error") {
    errors = {
      outputErrors: {
        emailAddress: "Enter an email address in the correct format, like name@example.com",
      },
    };
    addOutputForm = {
      conditionId: 1001,
      emailAddress: "not-a-valid-email",
      submissionType: "human-only",
      submissionVersion: "3",
    };
  }

  const outputs = rawOutputs.map(enrichOutput);

  if (variant === "edit-output") {
    const editing = outputs[0];
    editOutput = editing;
    addOutputForm = {
      outputId: editing.id,
      conditionId: editing.conditionId,
      emailAddress: editing.emailAddress,
      submissionType: editing.submissionType,
      submissionVersion: editing.submissionVersion,
    };
  }

  const mailboxConditionSelectItems = buildMailboxConditionSelectItems(
    addOutputForm.conditionId
  );

  return {
    data: {
      formName: "Apply for a county parish holding (CPH) number",
      notificationEmail: "notify@defra.gov.uk",
      draftSettings: {
        notificationEmail: "notify@defra.gov.uk",
        submissionType: "human-only",
        submissionVersion: "3",
      },
      conditionalOutputs: {
        defaultMailbox: {
          emailAddress: "notify@defra.gov.uk",
          submissionType: "human-only",
          submissionVersion: "3",
        },
        outputs: rawOutputs,
      },
    },
    outputs,
    routingConditions,
    mailboxConditionSelectItems,
    addOutputForm,
    editOutput,
    maxOutputs: MAX_ADDITIONAL_EMAIL_ADDRESSES,
    formatSubmissionTypeLabel,
    form: {
      name: "Apply for a county parish holding (CPH) number",
    },
    saved,
    errors,
    staticPage: true,
    staticPageTitle: page.title,
    staticPageDescription: page.description,
    staticPageSlug: page.slug,
    staticPageBase: STATIC_BASE,
    staticIndexUrl: STATIC_BASE,
  };
}

function buildStaticConditionalMailboxIndexContext() {
  return {
    form: {
      name: "Apply for a county parish holding (CPH) number",
    },
    staticPages: STATIC_PAGES.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/${page.slug}`,
    })),
    livePageUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing",
    advancedSettingsStaticUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/static",
    conditionsManagerStaticUrl:
      "/titan-mvp-1.2/form-editor/conditions/manager/static",
    staticPageBase: STATIC_BASE,
  };
}

module.exports = {
  STATIC_BASE,
  STATIC_PAGES,
  buildStaticConditionalMailboxContext,
  buildStaticConditionalMailboxIndexContext,
};
