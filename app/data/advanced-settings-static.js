const STATIC_BASE = "/titan-mvp-1.2/form-editor/advanced-settings/static";

const FORM_NAME = "Apply for a county parish holding (CPH) number";

const CHECK_BEFORE_SUBMISSION_SETTING = {
  key: "checkBeforeSubmission",
  slug: "check-before-submission",
  summaryLabel: "Check before submission",
  summaryValueYes: "Someone else reviews answers before submission",
  summaryValueNo: "Submitted without anyone else reviewing answers",
  label: "Does the person completing the form have to get their answers checked before submitting it?",
  hint:
    "Use when someone other than the person filling in the form should review their answers first.",
  yesDescription:
    "The person filling in the form asks someone else to review their answers. They cannot submit until that review is finished.",
  noDescription:
    "The person filling in the form can submit when they are ready. No one else needs to review their answers.",
  changeHiddenText: "whether someone must check the form before it is submitted",
  whoCanCheckLabel: "Who should check the form",
  whoCanCheckHint:
    "Tell people who they should ask to review their answers. For example, their manager or a colleague in the same team.",
  optionalLabel: "Is the check optional?",
  optionalHint:
    "If it's optional, people can choose whether to ask someone to check their answers before submitting.",
  optionalSummaryLabel: "Check before submission is optional",
  optionalSummaryValueYes: "Yes",
  optionalSummaryValueNo: "No",
  autoEnableWarning:
    "If someone must check the form before it is submitted, the confirmation email and reference number will be switched on automatically.",
};

const REUSE_PREVIOUS_ANSWERS_SETTING = {
  key: "reusePreviousAnswers",
  slug: "reuse-previous-answers",
  summaryLabel: "Reuse previous answers",
  summaryValueYes: "Reuse answers from a previous submission",
  summaryValueNo: "Start each new form with blank answers",
  label: "Can people reuse answers from a previous submission?",
  hint:
    "Use when people often submit this form more than once with similar answers.",
  yesDescription:
    "After submitting, they can start again with answers from their last submission already filled in. They can change anything before sending the new form.",
  noDescription:
    "Each time they use the form, they enter all answers from scratch.",
  changeHiddenText:
    "whether people can reuse answers from a previous submission",
  autoEnableWarning:
    "If people can reuse answers from a previous submission, the confirmation email and reference number will be switched on automatically.",
};

const ALLOW_EDIT_SUBMITTED_FORM_SETTING = {
  key: "allowEditSubmissions",
  slug: "edit-submitted-form",
  summaryLabel: "Edit a submitted form",
  summaryValueYes: "People can edit a form they've already submitted",
  summaryValueNo: "People cannot edit a submitted form",
  label: "Can people edit a form after they've submitted it?",
  hint:
    "Use when people may need to correct or update answers after sending. This replaces the previous submission. It does not start a new form.",
  yesDescription:
    "After submitting, they can sign in, change their answers and submit again. The new answers replace the previous submission. The reference number stays the same.",
  noDescription:
    "Once submitted, they cannot change that form. They can still copy answers into a new form if that setting is on.",
  changeHiddenText: "whether people can edit a submitted form",
  autoEnableWarning:
    "If people can edit a submitted form, the confirmation email and reference number will be switched on automatically.",
};

const MANAGE_FORM_GUIDANCE_SETTING = {
  key: "manageFormGuidance",
  slug: "manage-form-guidance",
  summaryLabel: "Manage form guidance",
  summaryValueYes: "Guidance text shown on the Manage form page",
  summaryValueNo: "No guidance text",
  label: "Do you want to add guidance text to the Manage form page?",
  hint:
    "Use guidance text to help people manage their form. For example, you can explain when to continue an existing form, start a new one, or delete a draft.",
  yesDescription:
    "People will see your guidance text when they manage this form.",
  noDescription:
    "People will only see the standard status table and actions.",
  changeHiddenText: "whether to add guidance text to the Manage form page",
  guidanceLabel: "Guidance text",
  guidanceHint: "This appears at the top of the Manage form page and you can use Markdown to format it.",
};

const OVERVIEW_VARIANTS = [
  {
    slug: "default",
    title: "Default overview",
    description: "All settings off. Default email address only.",
  },
  {
    slug: "saved",
    title: "Success after save",
    description: "Success banner shown after saving a setting.",
  },
  {
    slug: "check-before-submission-enabled",
    title: "Check before submission enabled",
    description: "Checker review required. Who should check the form is set.",
  },
  {
    slug: "reuse-previous-answers-off",
    title: "Reuse previous answers off",
    description: "Start each new form with blank answers.",
  },
  {
    slug: "reuse-previous-answers-on",
    title: "Reuse previous answers on",
    description: "Reuse answers from a previous submission.",
  },
  {
    slug: "edit-submitted-form-off",
    title: "Edit a submitted form off",
    description: "People cannot edit a submitted form.",
  },
  {
    slug: "edit-submitted-form-on",
    title: "Edit a submitted form on",
    description: "People can edit a form they've already submitted.",
  },
  {
    slug: "manage-form-guidance-on",
    title: "Manage form guidance on",
    description: "Guidance text shown on the Manage form page.",
  },
  {
    // Keep the older slug so existing handover links still work.
    slug: "reuse-previous-answers-enabled",
    title: "Reuse previous answers on (alias)",
    description: "Same as ‘Reuse previous answers on’.",
  },
  {
    slug: "with-email-actions",
    title: "With additional email addresses",
    description: "Two additional email addresses configured.",
  },
  {
    slug: "fully-configured",
    title: "Fully configured",
    description: "All settings enabled with example data.",
  },
];

const CHECK_BEFORE_SUBMISSION_VARIANTS = [
  {
    slug: "no-selected",
    title: "No selected",
    description: "Form can be submitted without someone else reviewing answers.",
  },
  {
    slug: "yes-with-description",
    title: "Yes selected with description",
    description:
      "Checker review required. Who should check the form is filled in. Optional set to no.",
  },
  {
    slug: "yes-optional",
    title: "Yes selected and optional",
    description:
      "Checker review available. Who should check the form is filled in. Optional set to yes.",
  },
  {
    slug: "validation-error",
    title: "Validation error",
    description:
      "Yes selected but who should check the form and whether it is optional are missing.",
  },
];

const REUSE_PREVIOUS_ANSWERS_VARIANTS = [
  {
    slug: "no-selected",
    title: "No selected",
    description: "Start each new form with blank answers.",
  },
  {
    slug: "yes-selected",
    title: "Yes selected",
    description: "Reuse answers from a previous submission.",
  },
];

const ALLOW_EDIT_SUBMITTED_FORM_VARIANTS = [
  {
    slug: "no-selected",
    title: "No selected",
    description: "People cannot edit a submitted form.",
  },
  {
    slug: "yes-selected",
    title: "Yes selected",
    description: "People can edit a form they've already submitted.",
  },
];

const MANAGE_FORM_GUIDANCE_VARIANTS = [
  {
    slug: "no-selected",
    title: "No selected",
    description: "No guidance text on the Manage form page.",
  },
  {
    slug: "yes-with-text",
    title: "Yes selected with guidance text",
    description: "Guidance text filled in for the Manage form page.",
  },
  {
    slug: "validation-error",
    title: "Validation error",
    description: "Yes selected but guidance text is missing.",
  },
];

function truncateSummaryText(text, maxLength = 80) {
  const normalised = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalised) return "Not added yet";
  if (normalised.length <= maxLength) return normalised;
  return `${normalised.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildSummaryRows(settings) {
  const {
    checkBeforeSubmission = "no",
    whoCanCheckDescription = "",
    checkBeforeSubmissionOptional = "no",
    reusePreviousAnswers = "no",
    allowEditSubmissions = "no",
    manageFormGuidance = "no",
    manageFormGuidanceText = "",
    additionalEmailCount = 0,
    staticPageBase = STATIC_BASE,
  } = settings;

  const checkBeforeChangeHref =
    checkBeforeSubmission === "yes"
      ? checkBeforeSubmissionOptional === "yes"
        ? `${staticPageBase}/check-before-submission/yes-optional`
        : `${staticPageBase}/check-before-submission/yes-with-description`
      : `${staticPageBase}/check-before-submission/no-selected`;
  const reusePreviousAnswersChangeHref =
    reusePreviousAnswers === "yes"
      ? `${staticPageBase}/reuse-previous-answers/yes-selected`
      : `${staticPageBase}/reuse-previous-answers/no-selected`;
  const allowEditSubmissionsChangeHref =
    allowEditSubmissions === "yes"
      ? `${staticPageBase}/edit-submitted-form/yes-selected`
      : `${staticPageBase}/edit-submitted-form/no-selected`;
  const manageFormGuidanceChangeHref =
    manageFormGuidance === "yes"
      ? `${staticPageBase}/manage-form-guidance/yes-with-text`
      : `${staticPageBase}/manage-form-guidance/no-selected`;

  const rows = [
    {
      key: { text: CHECK_BEFORE_SUBMISSION_SETTING.summaryLabel },
      value: {
        text:
          checkBeforeSubmission === "yes"
            ? CHECK_BEFORE_SUBMISSION_SETTING.summaryValueYes
            : CHECK_BEFORE_SUBMISSION_SETTING.summaryValueNo,
      },
      actions: {
        items: [
          {
            href: checkBeforeChangeHref,
            text: "Change",
            visuallyHiddenText: CHECK_BEFORE_SUBMISSION_SETTING.changeHiddenText,
          },
        ],
      },
    },
    {
      key: { text: REUSE_PREVIOUS_ANSWERS_SETTING.summaryLabel },
      value: {
        text:
          reusePreviousAnswers === "yes"
            ? REUSE_PREVIOUS_ANSWERS_SETTING.summaryValueYes
            : REUSE_PREVIOUS_ANSWERS_SETTING.summaryValueNo,
      },
      actions: {
        items: [
          {
            href: reusePreviousAnswersChangeHref,
            text: "Change",
            visuallyHiddenText: REUSE_PREVIOUS_ANSWERS_SETTING.changeHiddenText,
          },
        ],
      },
    },
    {
      key: { text: ALLOW_EDIT_SUBMITTED_FORM_SETTING.summaryLabel },
      value: {
        text:
          allowEditSubmissions === "yes"
            ? ALLOW_EDIT_SUBMITTED_FORM_SETTING.summaryValueYes
            : ALLOW_EDIT_SUBMITTED_FORM_SETTING.summaryValueNo,
      },
      actions: {
        items: [
          {
            href: allowEditSubmissionsChangeHref,
            text: "Change",
            visuallyHiddenText: ALLOW_EDIT_SUBMITTED_FORM_SETTING.changeHiddenText,
          },
        ],
      },
    },
    {
      key: { text: MANAGE_FORM_GUIDANCE_SETTING.summaryLabel },
      value: {
        text:
          manageFormGuidance === "yes"
            ? truncateSummaryText(manageFormGuidanceText || "Not added yet")
            : MANAGE_FORM_GUIDANCE_SETTING.summaryValueNo,
      },
      actions: {
        items: [
          {
            href: manageFormGuidanceChangeHref,
            text: "Change",
            visuallyHiddenText: MANAGE_FORM_GUIDANCE_SETTING.changeHiddenText,
          },
        ],
      },
    },
  ];

  if (checkBeforeSubmission === "yes") {
    const checkBeforeChangeHrefOptional =
      checkBeforeSubmissionOptional === "yes"
        ? `${staticPageBase}/check-before-submission/yes-optional`
        : `${staticPageBase}/check-before-submission/yes-with-description`;

    rows.splice(
      1,
      0,
      {
        key: { text: CHECK_BEFORE_SUBMISSION_SETTING.whoCanCheckLabel },
        value: {
          text: whoCanCheckDescription || "Not added yet",
        },
        actions: {
          items: [
            {
              href: checkBeforeChangeHrefOptional,
              text: "Change",
              visuallyHiddenText:
                CHECK_BEFORE_SUBMISSION_SETTING.whoCanCheckLabel.toLowerCase(),
            },
          ],
        },
      },
      {
        key: { text: CHECK_BEFORE_SUBMISSION_SETTING.optionalSummaryLabel },
        value: {
          text:
            checkBeforeSubmissionOptional === "yes"
              ? CHECK_BEFORE_SUBMISSION_SETTING.optionalSummaryValueYes
              : CHECK_BEFORE_SUBMISSION_SETTING.optionalSummaryValueNo,
        },
        actions: {
          items: [
            {
              href: checkBeforeChangeHrefOptional,
              text: "Change",
              visuallyHiddenText:
                CHECK_BEFORE_SUBMISSION_SETTING.optionalLabel.toLowerCase(),
            },
          ],
        },
      }
    );
  }

  rows.push({
    key: { text: "Email actions" },
    value: {
      text:
        additionalEmailCount > 0
          ? `${additionalEmailCount} additional email address${additionalEmailCount === 1 ? "" : "es"}`
          : "Default email address only",
    },
    actions: {
      items: [
        {
          href: "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static/with-outputs",
          text: "Change",
          visuallyHiddenText: "email actions",
        },
      ],
    },
  });

  return rows;
}

function buildStaticAdvancedSettingsOverviewContext(variant) {
  const page = OVERVIEW_VARIANTS.find((item) => item.slug === variant);
  if (!page) {
    return null;
  }

  let checkBeforeSubmission = "no";
  let whoCanCheckDescription = "";
  let checkBeforeSubmissionOptional = "no";
  let reusePreviousAnswers = "no";
  let allowEditSubmissions = "no";
  let manageFormGuidance = "no";
  let manageFormGuidanceText = "";
  let additionalEmailCount = 0;
  let saved = false;

  if (variant === "saved") {
    saved = true;
  }

  if (
    variant === "check-before-submission-enabled" ||
    variant === "fully-configured"
  ) {
    checkBeforeSubmission = "yes";
    whoCanCheckDescription =
      "Their line manager or a colleague in the same team who is authorised to approve submissions.";
    checkBeforeSubmissionOptional = "no";
  }

  if (
    variant === "reuse-previous-answers-on" ||
    variant === "reuse-previous-answers-enabled" ||
    variant === "fully-configured"
  ) {
    reusePreviousAnswers = "yes";
  }

  if (variant === "reuse-previous-answers-off" || variant === "default") {
    reusePreviousAnswers = "no";
  }

  if (variant === "edit-submitted-form-on" || variant === "fully-configured") {
    allowEditSubmissions = "yes";
  }

  if (variant === "edit-submitted-form-off" || variant === "default") {
    allowEditSubmissions = "no";
  }

  if (variant === "manage-form-guidance-on" || variant === "fully-configured") {
    manageFormGuidance = "yes";
    manageFormGuidanceText =
      "You can continue a draft, delete one you no longer need, or start a new form.";
  }

  if (variant === "with-email-actions" || variant === "fully-configured") {
    additionalEmailCount = 2;
  }

  return {
    summaryRows: buildSummaryRows({
      checkBeforeSubmission,
      whoCanCheckDescription,
      checkBeforeSubmissionOptional,
      reusePreviousAnswers,
      allowEditSubmissions,
      manageFormGuidance,
      manageFormGuidanceText,
      additionalEmailCount,
    }),
    form: { name: FORM_NAME },
    saved,
    staticPage: true,
    staticPageTitle: page.title,
    staticPageDescription: page.description,
    staticPageSlug: page.slug,
    staticPageBase: STATIC_BASE,
    staticIndexUrl: STATIC_BASE,
    livePageUrl: "/titan-mvp-1.2/form-editor/advanced-settings",
  };
}

function buildStaticAdvancedSettingsChangeContext(settingSlug, variant) {
  const variants =
    settingSlug === "check-before-submission"
      ? CHECK_BEFORE_SUBMISSION_VARIANTS
      : settingSlug === "reuse-previous-answers"
        ? REUSE_PREVIOUS_ANSWERS_VARIANTS
        : settingSlug === "edit-submitted-form"
          ? ALLOW_EDIT_SUBMITTED_FORM_VARIANTS
          : settingSlug === "manage-form-guidance"
            ? MANAGE_FORM_GUIDANCE_VARIANTS
            : [];

  const page = variants.find((item) => item.slug === variant);
  if (!page) {
    return null;
  }

  const setting =
    settingSlug === "check-before-submission"
      ? CHECK_BEFORE_SUBMISSION_SETTING
      : settingSlug === "edit-submitted-form"
        ? ALLOW_EDIT_SUBMITTED_FORM_SETTING
        : settingSlug === "manage-form-guidance"
          ? MANAGE_FORM_GUIDANCE_SETTING
          : REUSE_PREVIOUS_ANSWERS_SETTING;

  let data = {
    checkBeforeSubmission: "no",
    whoCanCheckDescription: "",
    checkBeforeSubmissionOptional: "",
    reusePreviousAnswers: "no",
    allowEditSubmissions: "no",
    manageFormGuidance: "no",
    manageFormGuidanceText: "",
  };
  let errors = {};

  if (settingSlug === "check-before-submission") {
    if (variant === "yes-with-description") {
      data.checkBeforeSubmission = "yes";
      data.whoCanCheckDescription =
        "Their line manager or a colleague in the same team who is authorised to approve submissions.";
      data.checkBeforeSubmissionOptional = "no";
    }

    if (variant === "yes-optional") {
      data.checkBeforeSubmission = "yes";
      data.whoCanCheckDescription =
        "Their line manager or a colleague in the same team who is authorised to approve submissions.";
      data.checkBeforeSubmissionOptional = "yes";
    }

    if (variant === "validation-error") {
      data.checkBeforeSubmission = "yes";
      data.whoCanCheckDescription = "";
      data.checkBeforeSubmissionOptional = "";
      errors = {
        whoCanCheckDescription: "Enter who should check the form",
        checkBeforeSubmissionOptional:
          "Select yes if this is optional, or no if it is not",
      };
    }
  }

  if (settingSlug === "reuse-previous-answers" && variant === "yes-selected") {
    data.reusePreviousAnswers = "yes";
  }

  if (settingSlug === "edit-submitted-form" && variant === "yes-selected") {
    data.allowEditSubmissions = "yes";
  }

  if (settingSlug === "manage-form-guidance") {
    if (variant === "yes-with-text") {
      data.manageFormGuidance = "yes";
      data.manageFormGuidanceText =
        "You can continue a draft, delete one you no longer need, or start a new form.";
    }

    if (variant === "validation-error") {
      data.manageFormGuidance = "yes";
      data.manageFormGuidanceText = "";
      errors = {
        manageFormGuidanceText: "Enter guidance text",
      };
    }
  }

  const overviewStaticUrl =
    settingSlug === "reuse-previous-answers"
      ? `${STATIC_BASE}/${variant === "yes-selected" ? "reuse-previous-answers-on" : "reuse-previous-answers-off"}`
      : settingSlug === "edit-submitted-form"
        ? `${STATIC_BASE}/${variant === "yes-selected" ? "edit-submitted-form-on" : "edit-submitted-form-off"}`
        : settingSlug === "manage-form-guidance"
          ? `${STATIC_BASE}/${variant === "yes-with-text" || variant === "validation-error" ? "manage-form-guidance-on" : "default"}`
          : `${STATIC_BASE}/default`;

  return {
    data,
    setting,
    form: { name: FORM_NAME },
    errors,
    staticPage: true,
    staticPageTitle: page.title,
    staticPageDescription: page.description,
    staticPageSlug: page.slug,
    staticPageBase: STATIC_BASE,
    staticIndexUrl: STATIC_BASE,
    livePageUrl: `/titan-mvp-1.2/form-editor/advanced-settings/${settingSlug}`,
    overviewStaticUrl,
  };
}

function buildStaticAdvancedSettingsIndexContext() {
  const overviewPages = OVERVIEW_VARIANTS
    // Hide the alias from the index; keep the slug routable for older links.
    .filter((page) => page.slug !== "reuse-previous-answers-enabled")
    .map((page) => ({
      ...page,
      href: `${STATIC_BASE}/${page.slug}`,
    }));

  return {
    form: { name: FORM_NAME },
    overviewPages,
    checkBeforeSubmissionPages: CHECK_BEFORE_SUBMISSION_VARIANTS.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/check-before-submission/${page.slug}`,
    })),
    reusePreviousAnswersPages: REUSE_PREVIOUS_ANSWERS_VARIANTS.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/reuse-previous-answers/${page.slug}`,
    })),
    allowEditSubmittedFormPages: ALLOW_EDIT_SUBMITTED_FORM_VARIANTS.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/edit-submitted-form/${page.slug}`,
    })),
    manageFormGuidancePages: MANAGE_FORM_GUIDANCE_VARIANTS.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/manage-form-guidance/${page.slug}`,
    })),
    emailActionsStaticUrl:
      "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static",
    conditionsManagerStaticUrl:
      "/titan-mvp-1.2/form-editor/conditions/manager/static",
    livePageUrl: "/titan-mvp-1.2/form-editor/advanced-settings",
    staticPageBase: STATIC_BASE,
  };
}

module.exports = {
  STATIC_BASE,
  buildStaticAdvancedSettingsOverviewContext,
  buildStaticAdvancedSettingsChangeContext,
  buildStaticAdvancedSettingsIndexContext,
};
