const STATIC_BASE =
  "/titan-mvp-1.2/form-editor/question-type/none-of-the-above/static";

const FORM_NAME = "Apply for a small grant";

const VARIANTS = [
  {
    slug: "checkboxes-none-with-related",
    title: "Checkboxes – None of the above with related question",
    description:
      "Someone selected None of the above. The related follow-up question and answer appear as their own row.",
    questionType: "checkboxes",
    rows: [
      {
        key: "Organisation name",
        value: "Riverside Community Garden",
      },
      {
        key: "Which improvements will you make?",
        value: "None of the above",
      },
      {
        key: "Describe the improvements you will make",
        value: "Planting a community orchard and installing accessible paths",
        optional: false,
      },
      {
        key: "Amount requested",
        value: "£1,500",
      },
    ],
  },
  {
    slug: "checkboxes-options-selected",
    title: "Checkboxes – Listed options selected",
    description:
      "Someone selected one or more listed options. No related question row is shown.",
    questionType: "checkboxes",
    rows: [
      {
        key: "Organisation name",
        value: "Riverside Community Garden",
      },
      {
        key: "Which improvements will you make?",
        value: "Tree planting\nPublic access improvements",
      },
      {
        key: "Amount requested",
        value: "£1,500",
      },
    ],
  },
  {
    slug: "radios-none-with-related",
    title: "Radios – None of the above with related question",
    description:
      "Someone selected None of the above. The related follow-up question and answer appear as their own row.",
    questionType: "radios",
    rows: [
      {
        key: "Organisation name",
        value: "Riverside Community Garden",
      },
      {
        key: "How will volunteers be supervised?",
        value: "None of the above",
      },
      {
        key: "Tell us how volunteers will be supervised",
        value: "A trained site lead will be on site during every session",
        optional: false,
      },
      {
        key: "Amount requested",
        value: "£1,500",
      },
    ],
  },
  {
    slug: "radios-option-selected",
    title: "Radios – Listed option selected",
    description:
      "Someone selected a listed option. No related question row is shown.",
    questionType: "radios",
    rows: [
      {
        key: "Organisation name",
        value: "Riverside Community Garden",
      },
      {
        key: "How will volunteers be supervised?",
        value: "By a named volunteer coordinator",
      },
      {
        key: "Amount requested",
        value: "£1,500",
      },
    ],
  },
  {
    slug: "checkboxes-none-with-optional-related",
    title: "Checkboxes – None of the above with optional related question",
    description:
      "Someone selected None of the above and answered an optional related question. The related row is labelled as optional.",
    questionType: "checkboxes",
    rows: [
      {
        key: "Organisation name",
        value: "Riverside Community Garden",
      },
      {
        key: "Which improvements will you make?",
        value: "None of the above",
      },
      {
        key: "Is there anything else we should know about the improvements?",
        value: "We will also restore a wildlife pond next to the orchard",
        optional: true,
      },
      {
        key: "Amount requested",
        value: "£1,500",
      },
    ],
  },
];

function buildSummaryRows(variant) {
  return (variant.rows || []).map((row) => {
    const keyText = row.optional ? `${row.key} (optional)` : row.key;
    const valueHtml = String(row.value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("<br>");

    return {
      key: { text: keyText },
      value: { html: valueHtml },
      actions: {
        items: [
          {
            href: "#",
            text: "Change",
            visuallyHiddenText: keyText.toLowerCase(),
          },
        ],
      },
    };
  });
}

function buildStaticIndexContext() {
  return {
    form: { name: FORM_NAME },
    staticPages: VARIANTS.map((page) => ({
      ...page,
      href: `${STATIC_BASE}/${page.slug}`,
    })),
    liveCheckboxesUrl:
      "/titan-mvp-1.2/form-editor/question-type/checkboxes-nf/edit-none-of-the-above",
    liveRadiosUrl:
      "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit-none-of-the-above",
    staticPageBase: STATIC_BASE,
  };
}

function buildStaticVariantContext(slug) {
  const variant = VARIANTS.find((item) => item.slug === slug);
  if (!variant) return null;

  return {
    form: { name: FORM_NAME },
    variant,
    summaryRows: buildSummaryRows(variant),
    staticPage: true,
    staticPageTitle: variant.title,
    staticPageDescription: variant.description,
    staticIndexUrl: STATIC_BASE,
    liveEditorUrl:
      variant.questionType === "radios"
        ? "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit-none-of-the-above"
        : "/titan-mvp-1.2/form-editor/question-type/checkboxes-nf/edit-none-of-the-above",
  };
}

module.exports = {
  STATIC_BASE,
  VARIANTS,
  buildStaticIndexContext,
  buildStaticVariantContext,
};
