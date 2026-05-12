/**
 * Welsh translation prototype: showcase form data and POST/session helpers.
 */

const WELSH_SHOWCASE_DATA_VERSION = 2;

function optionText(opt) {
  return opt.label != null ? opt.label : opt.text;
}

/**
 * Session patch for GET /form-editor/welsh-translation/load-showcase
 */
function getWelshShowcaseSessionPatch() {
  const formName = "Annual livestock return (translation demo)";
  const formDetails = {
    organisation: "Department for Environment, Food and Rural Affairs",
    teamName: "Rural Payments service",
    email: "ruralpayments@defra.gov.uk",
    support: {
      phone:
        "Rural Services helpline 03000 200 301 (Monday to Friday, 8:30am to 5pm, excluding bank holidays)",
      email: "ruralpayments@defra.gov.uk",
      link: "https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs",
    },
    nextSteps:
      "We will check your return against our records. If we need anything else we will email you within **15 working days**. Keep your reference number safe — you will need it if you contact us.",
    privacyNotice: "https://www.gov.uk/government/publications/rural-payments-agency-privacy-notice",
    notificationEmail: "livestock-return-notifications@defra.gov.uk",
    payUrl: "https://www.payments.service.gov.uk/public/livestock-return-registration-fee",
  };

  const formPages = [
    {
      pageId: "p-intro-guidance",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "Before you start",
      guidanceOnlyGuidanceTextInput:
        "Use this return to tell us about **livestock numbers and movements** on your registered holding for the past 12 months.\n\nYou will need:\n\n- your County Parish Holding (CPH) number\n- the reference from your invitation email\n- approximate grazing and housing dates if you moved stock\n\nThis demonstration form includes every editor question type, **several pages with two or more questions**, and one page with optional heading and guidance so you can test **Welsh translations** end to end.",
      conditions: [],
      order: 1,
    },
    {
      pageId: "p-with-page-guidance",
      pageType: "question",
      pageHeading: "Invitation details",
      guidanceTextarea:
        "Find the reference in the email we sent when we opened the return window. It links your answers to your Rural Payments record.",
      questions: [
        {
          questionId: "q-ref",
          label: "What is your invitation reference?",
          type: "text",
          subType: "short-answer-nf",
          hint: "It looks like LR-2025- followed by six digits, for example LR-2025-004812.",
          shortDescription: "invitation reference",
        },
        {
          questionId: "q-ref-window",
          label: "Which return window does this invitation refer to?",
          type: "text",
          subType: "short-answer-nf",
          hint: "Use the wording from your invitation email, for example “Autumn 2025” or “Spring 2026”.",
          shortDescription: "return window label",
        },
      ],
      conditions: [],
      order: 2,
    },
    {
      pageId: "p-shorttext",
      pageType: "question",
      questions: [
        {
          questionId: "q-short",
          label: "What is the County Parish Holding (CPH) number for this return?",
          type: "text",
          subType: "short-answer-nf",
          hint: "UK holdings use 9 or 13 characters, for example 12/345/6789 or XX12345678901.",
          shortDescription: "CPH number",
        },
        {
          questionId: "q-short-holding-name",
          label: "What holding name appears on your Rural Payments maps and letters?",
          type: "text",
          subType: "short-answer-nf",
          hint: "Use the same spelling as on your Single Business Identifier record, even if it differs from the trading name.",
          shortDescription: "holding display name",
        },
      ],
      conditions: [],
      order: 3,
    },
    {
      pageId: "p-default-text",
      pageType: "question",
      questions: [
        {
          questionId: "q-default-text",
          label: "What is the trading name on your Rural Payments account?",
          type: "text",
          hint: "Use the same spelling as on your Single Business Identifier record. If you trade under your own name, enter that.",
          shortDescription: "trading name",
        },
      ],
      conditions: [],
      order: 4,
    },
    {
      pageId: "p-longanswer",
      pageType: "question",
      questions: [
        {
          questionId: "q-long",
          label: "Describe how you store and spread manure or slurry from this holding",
          type: "text",
          subType: "long-answer",
          hint: "Include approximate storage capacity, distance to watercourses, and any contractor who applies material on your behalf.",
          shortDescription: "manure and slurry management",
        },
      ],
      conditions: [],
      order: 5,
    },
    {
      pageId: "p-numbers",
      pageType: "question",
      questions: [
        {
          questionId: "q-num",
          label: "How many breeding ewes were on the holding on the census date?",
          type: "text",
          subType: "numbers",
          hint: "Count only ewes kept for breeding, not store lambs. Enter 0 if none.",
          shortDescription: "breeding ewe count",
        },
        {
          questionId: "q-num-lambs",
          label: "How many store lambs were on the holding on the census date?",
          type: "text",
          subType: "numbers",
          hint: "Store lambs are lambs kept for finishing, not breeding. Enter 0 if none.",
          shortDescription: "store lamb count",
        },
        {
          questionId: "q-num-cattle",
          label: "How many beef cattle over 30 months were on the holding on the census date?",
          type: "text",
          subType: "numbers",
          hint: "Include animals kept for breeding or finishing. Enter 0 if none.",
          shortDescription: "beef cattle over 30 months",
        },
      ],
      conditions: [],
      order: 6,
    },
    {
      pageId: "p-email",
      pageType: "question",
      questions: [
        {
          questionId: "q-email",
          label: "Who should we email about this return?",
          type: "email",
          hint: "Use an address you check regularly. We may send a request for evidence or a correction notice.",
          shortDescription: "contact email",
        },
      ],
      conditions: [],
      order: 7,
    },
    {
      pageId: "p-phone",
      pageType: "question",
      questions: [
        {
          questionId: "q-phone",
          label: "Best daytime phone number for an inspector to call",
          type: "phone",
          hint: "Include the country code if you use a non-UK mobile. We will only call about this return.",
          shortDescription: "daytime phone number",
        },
      ],
      conditions: [],
      order: 8,
    },
    {
      pageId: "p-address",
      pageType: "question",
      questions: [
        {
          questionId: "q-address",
          label: "Where should we send paper correspondence about this return?",
          type: "address",
          hint: "If this is the same as your main holding address, you can still enter it here for clarity.",
          shortDescription: "correspondence address",
        },
      ],
      conditions: [],
      order: 9,
    },
    {
      pageId: "p-file",
      pageType: "question",
      questions: [
        {
          questionId: "q-file",
          label: "Upload a single map or plan showing field boundaries for this holding",
          type: "file",
          hint: "Accepted types: PDF, PNG or JPG. Maximum file size 10MB. If the file is larger, post a paper copy using the address in your invitation.",
          shortDescription: "field boundary map",
        },
      ],
      conditions: [],
      order: 10,
    },
    {
      pageId: "p-date-dmy",
      pageType: "question",
      questions: [
        {
          questionId: "q-date-dmy",
          label: "When did the last cattle movement onto this holding take place?",
          type: "date",
          subType: "day-month-year",
          hint: "If there were no cattle movements in the return period, enter the date you last confirmed zero movements.",
          shortDescription: "last cattle movement date",
        },
      ],
      conditions: [],
      order: 11,
    },
    {
      pageId: "p-date-my",
      pageType: "question",
      questions: [
        {
          questionId: "q-date-my",
          label: "In which month and year did you first register this holding for cattle?",
          type: "date",
          subType: "month-year",
          hint: "Approximate month is fine if you took over from a previous keeper.",
          shortDescription: "first cattle registration",
        },
      ],
      conditions: [],
      order: 12,
    },
    {
      pageId: "p-yesno",
      pageType: "question",
      questions: [
        {
          questionId: "q-yesno",
          label: "Has an Official Veterinarian visited this holding in the last 12 months for a TB test?",
          type: "list",
          subType: "yes-no",
          hint: "Include follow-up visits linked to the same testing round.",
          shortDescription: "OV TB visit in last 12 months",
          options: [
            { value: "yes", text: "Yes", label: "Yes" },
            { value: "no", text: "No", label: "No" },
          ],
        },
      ],
      conditions: [],
      order: 13,
    },
    {
      pageId: "p-radios",
      pageType: "question",
      questions: [
        {
          questionId: "q-radios",
          label: "Which funding route best describes this return?",
          type: "list",
          subType: "radios",
          hint: "Choose the route that matches the agreement or claim letter you already hold.",
          shortDescription: "funding route",
          options: [
            {
              value: "s1",
              text: "Environmental Land Management (ELM) agreement",
              label: "Environmental Land Management (ELM) agreement",
              hint: "Includes Landscape Recovery and locally tailored options",
            },
            {
              value: "s2",
              text: "Basic Payment Scheme / legacy rural grant",
              label: "Basic Payment Scheme / legacy rural grant",
              hint: "Use if you are still within an existing claim year or bridging arrangement",
            },
            {
              value: "s3",
              text: "No current scheme — statutory return only",
              label: "No current scheme — statutory return only",
              hint: "Select if you are not in an agri-environment scheme but must still submit livestock data",
            },
          ],
        },
      ],
      conditions: [],
      order: 14,
    },
    {
      pageId: "p-select",
      pageType: "question",
      questions: [
        {
          questionId: "q-select",
          label: "In which county is the main holding?",
          type: "list",
          subType: "select",
          hint: "Choose the county that contains the largest share of your grazing land.",
          shortDescription: "holding county",
          options: [
            { value: "cumbria", text: "Cumbria", label: "Cumbria" },
            { value: "devon", text: "Devon", label: "Devon" },
            { value: "herefordshire", text: "Herefordshire", label: "Herefordshire" },
            { value: "shropshire", text: "Shropshire", label: "Shropshire" },
            { value: "somerset", text: "Somerset", label: "Somerset" },
            { value: "worcestershire", text: "Worcestershire", label: "Worcestershire" },
          ],
        },
      ],
      conditions: [],
      order: 15,
    },
    {
      pageId: "p-checkboxes",
      pageType: "question",
      questions: [
        {
          questionId: "q-check",
          label: "Which of the following did you carry out on this holding in the last year? (select all that apply)",
          type: "list",
          subType: "checkboxes",
          hint: "Select every option that applies for any part of the holding. You can upload extra evidence later if we ask.",
          shortDescription: "management activities",
          options: [
            {
              value: "rough-grazing",
              text: "Maintained or restored species-rich grassland or rough grazing",
              label: "Maintained or restored species-rich grassland or rough grazing",
              hint: "Includes managed hay meadows or low-input pasture",
            },
            {
              value: "buffer",
              text: "Maintained buffer strips alongside watercourses or ponds",
              label: "Maintained buffer strips alongside watercourses or ponds",
              hint: "At least 4m width unless a scheme specifies more",
            },
            {
              value: "winter-feed",
              text: "Moved winter feeding areas to reduce poaching and run-off",
              label: "Moved winter feeding areas to reduce poaching and run-off",
            },
            {
              value: "hedge",
              text: "Laid or coppiced hedgerows as part of a management plan",
              label: "Laid or coppiced hedgerows as part of a management plan",
            },
            {
              value: "none",
              text: "None of the above",
              label: "None of the above",
              hint: "Only tick this if no other options apply",
            },
          ],
        },
      ],
      conditions: [],
      order: 16,
    },
    {
      pageId: "p-declaration",
      pageType: "question",
      questions: [
        {
          questionId: "q-decl",
          label: "Confirm this return is accurate",
          type: "declaration",
          shortDescription: "accuracy declaration",
          declarationText:
            "## Declaration\n\nBy submitting this livestock return you confirm that:\n\n- the numbers, dates and addresses you have given are **complete and accurate** to the best of your knowledge\n- you will tell us without delay if you discover an error after submission\n- you understand that **knowingly or recklessly** giving false information may affect payments you receive and could be an offence\n\nIf you are completing this on behalf of someone else, you confirm you have their authority to do so.",
        },
      ],
      conditions: [],
      order: 17,
    },
    {
      pageId: "p-payment",
      pageType: "question",
      questions: [
        {
          questionId: "q-pay",
          label: "Pay the livestock return registration fee",
          type: "payment",
          paymentDescription:
            "This fee covers processing and fraud checks for this return window. You must complete payment before you can submit; you will receive a GOV.UK Pay receipt by email.",
          paymentAmount: "42.50",
        },
      ],
      conditions: [],
      order: 18,
    },
    {
      pageId: "p-exit-guidance",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "You need to use a different service",
      guidanceOnlyGuidanceTextInput:
        "From your answers it looks as if this holding is **registered outside England** or is part of a **cross-border agreement** we cannot process in this beta form.\n\nPlease call the Rural Services helpline on **03000 200 301** and quote your CPH number. Do not continue this online return — an adviser will tell you which form to use.",
      conditions: [],
      order: 19,
      isExitPage: true,
    },
  ];

  return { formName, formDetails, formPages, showcaseDataVersion: WELSH_SHOWCASE_DATA_VERSION };
}

/**
 * Write the showcase form into session data. Use { force: true } after "Load showcase"
 * so the fixture always replaces the session. Without force, only updates when
 * {@link WELSH_SHOWCASE_DATA_VERSION} changes — so visiting ?showcase=1 picks up new
 * showcase pages without requiring a separate load-showcase click.
 */
function applyWelshShowcaseSession(sessionData, options = {}) {
  const patch = getWelshShowcaseSessionPatch();
  const force = options.force === true;
  if (!force && sessionData.welshShowcaseDataVersion === patch.showcaseDataVersion) {
    return;
  }
  sessionData.formName = patch.formName;
  sessionData.formDetails = {
    ...(sessionData.formDetails || {}),
    ...patch.formDetails,
  };
  sessionData.formPages = patch.formPages;
  sessionData.welshShowcaseDataVersion = patch.showcaseDataVersion;
  delete sessionData.welshTranslations;
}

function field(body, key) {
  const v = body[key];
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v : String(v);
}

/**
 * Build welshTranslations from POST body using stable field names (pageId + questionId).
 */
function collectWelshTranslationsFromBody(body, formPages) {
  const overview = {
    formName: field(body, "welsh_overview_formName"),
    supportPhone: field(body, "welsh_overview_supportPhone"),
    supportEmail: field(body, "welsh_overview_supportEmail"),
    supportLink: field(body, "welsh_overview_supportLink"),
    nextSteps: field(body, "welsh_overview_nextSteps"),
    privacyNotice: field(body, "welsh_overview_privacyNotice"),
    payUrl: field(body, "welsh_overview_payUrl"),
  };

  const pages = (formPages || []).map((page) => {
    const pid = page.pageId;
    const row = {
      pageId: pid,
      pageHeading: field(body, `welsh_${pid}_pageHeading`),
      guidanceTextarea: field(body, `welsh_${pid}_guidanceTextarea`),
      guidanceOnlyHeadingInput: field(body, `welsh_${pid}_guidanceOnlyHeading`),
      guidanceOnlyGuidanceTextInput: field(body, `welsh_${pid}_guidanceOnlyBody`),
      questions: [],
    };

    (page.questions || []).forEach((q) => {
      const qid = q.questionId;
      const prefix = `welsh_${pid}_q_${qid}_`;
      const qRow = {
        questionId: qid,
        label: field(body, `${prefix}label`),
        hint: field(body, `${prefix}hint`),
        shortDescription: field(body, `${prefix}shortDescription`),
        declarationText: field(body, `${prefix}declarationText`),
        declarationAgreement: field(body, `${prefix}declarationAgreement`),
        paymentDescription: field(body, `${prefix}paymentDescription`),
        options: [],
      };

      (q.options || []).forEach((opt, oi) => {
        qRow.options.push({
          index: oi,
          text: field(body, `${prefix}opt_${oi}_text`),
          hint: opt.hint ? field(body, `${prefix}opt_${oi}_hint`) : "",
        });
      });

      row.questions.push(qRow);
    });

    return row;
  });

  return {
    overview,
    pages,
    finishedAddingWelsh: field(body, "welsh_finished") || "no",
  };
}

function buildOverviewFormForSession(formData) {
  const statusColorMap = {
    Draft: "orange",
    Live: "green",
    Closed: "red",
  };
  const status = formData.formDetails?.status || "Draft";
  const statusColor = statusColorMap[status] || "grey";
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;

  return {
    name: formData.formName || "Form name",
    status: {
      text: status,
      color: statusColor,
    },
    previewUrl,
    createdAt: formData.formDetails?.createdAt || new Date().toISOString(),
    updatedAt: formData.formDetails?.lastUpdated || new Date().toISOString(),
    organisation: {
      name: formData.formDetails?.organisation || "Not set",
    },
    team: {
      name: formData.formDetails?.teamName || "Not set",
      email: formData.formDetails?.email || "Not set",
    },
    support: {
      phone: formData.formDetails?.support?.phone,
      email: formData.formDetails?.support?.email,
      link: formData.formDetails?.support?.link,
    },
    nextSteps: formData.formDetails?.nextSteps,
    privacyNotice: formData.formDetails?.privacyNotice,
    notificationEmail: formData.formDetails?.notificationEmail,
    payUrl: formData.formDetails?.payUrl,
  };
}

/**
 * Normalise saved welshTranslations for template lookups (by pageId / questionId).
 */
function indexWelshTranslations(wt) {
  const overview = wt && wt.overview ? wt.overview : {};
  const byPage = {};
  (wt && wt.pages ? wt.pages : []).forEach((p) => {
    const questionsById = {};
    (p.questions || []).forEach((q) => {
      questionsById[q.questionId] = q;
    });
    byPage[p.pageId] = { ...p, questionsById };
  });
  return { overview, byPage };
}

/**
 * Shallow clone of form pages with `globalQuestionNumber` on each question (for captions).
 */
function cloneFormPagesWithGlobalQuestionNumbers(formPages) {
  const pages = (formPages || []).map((page) => ({
    ...page,
    questions: (page.questions || []).map((q) => ({ ...q })),
  }));
  let n = 0;
  pages.forEach((page) => {
    if (page.pageType !== "guidance" && page.questions) {
      page.questions.forEach((q) => {
        q.globalQuestionNumber = ++n;
      });
    }
  });
  return pages;
}

module.exports = {
  getWelshShowcaseSessionPatch,
  applyWelshShowcaseSession,
  collectWelshTranslationsFromBody,
  buildOverviewFormForSession,
  indexWelshTranslations,
  optionText,
  cloneFormPagesWithGlobalQuestionNumbers,
};
