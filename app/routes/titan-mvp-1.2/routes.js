const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();
const fs = require("fs");
const path = require("path");
const lists = require("../../routes/lists");
const sections = require("../../routes/sections");
const terms = require("../../data/dictionary.json");
const express = require("express");

// Public base URL for links you share externally (e.g. review links in emails).
const PUBLIC_BASE_URL = "https://forms-prototype-d9d9fb55cd01.herokuapp.com";

// Deterministic tokens for user research (avoids broken deep links).
// Use two stable states so journeys don't depend on hidden/session state.
const RUNNER_V4_REVIEW_TOKEN_INPROGRESS = "UR-V4-INPROGRESS";
const RUNNER_V4_REVIEW_TOKEN_CHECKED = "UR-V4-CHECKED";
const RUNNER_V3_REVIEW_TOKEN = "UR-V3-DEMO";

// Add middleware to make terms available to all templates
router.use((req, res, next) => {
  res.locals.commonTerms = terms;
  res.locals.publicBaseUrl = PUBLIC_BASE_URL;
  next();
});

// Add middleware to make runner start URL available to templates
router.use((req, res, next) => {
  const p = String((req && req.path) || "");
  if (p.startsWith("/runner-v3")) {
    res.locals.runnerStartUrl = "/runner-v3/start";
  } else if (p.startsWith("/runner-v4")) {
    res.locals.runnerStartUrl = "/runner-v4/start";
  } else if (p.startsWith("/runner-v5")) {
    res.locals.runnerStartUrl = "/runner-v5/start";
  } else {
    res.locals.runnerStartUrl = "/titan-mvp-1.2/runner/questions/start.html";
  }
  next();
});

// Add middleware to initialize form name in session data
router.use((req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.formName) {
    req.session.data.formName = "Form name";
  }

  // Backwards-compat: older research sessions used UR-V4-DEMO.
  // Normalise to the new stable "in progress" token so participants don't
  // unexpectedly land in the "checked" state.
  if (req.session.data.reviewTokenV4 === "UR-V4-DEMO") {
    req.session.data.reviewTokenV4 = RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
  }

  next();
});

// Add middleware to initialize users in session data
router.use((req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.users) {
    req.session.data.users = [
      {
        email: "chris.smith@defra.gov.uk",
        role: "Admin",
      },
      {
        email: "laura.parker@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "maria.garcia@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "james.wilson@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "sarah.johnson@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "michael.brown@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "emma.davis@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "david.miller@defra.gov.uk",
        role: "Admin",
      },
    ];
  }
  next();
});

// Add middleware to initialize checkAnswersItems and sections for check answers flows
router.use((req, res, next) => {
  if (!req.session.data.checkAnswersItems) {
    req.session.data.checkAnswersItems = [
      {
        id: 1,
        type: "page",
        key: "Business details",
        value: "Page with multiple questions",
        section: null,
        questions: [
          { label: "Business registered with RPA", value: "Answer goes here" },
          { label: "Business name", value: "Answer goes here" },
          { label: "Business address", value: "Answer goes here" },
        ],
      },
      {
        id: 2,
        type: "question",
        key: "Country for livestock",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 3,
        type: "question",
        key: "Arrival date of livestock",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 4,
        type: "page",
        key: "Livestock information",
        value: "Page with multiple questions",
        section: null,
        questions: [
          { label: "Type of livestock", value: "Answer goes here" },
          { label: "Number of animals", value: "Answer goes here" },
          { label: "Breed", value: "Answer goes here" },
        ],
      },
      {
        id: 5,
        type: "question",
        key: "Applicant's name",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 6,
        type: "page",
        key: "Contact details",
        value: "Page with multiple questions",
        section: null,
        questions: [
          { label: "Main phone number", value: "Answer goes here" },
          { label: "Email address", value: "Answer goes here" },
          { label: "Alternative contact", value: "Answer goes here" },
        ],
      },
      {
        id: 7,
        type: "question",
        key: "Business purpose",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 8,
        type: "question",
        key: "National Grid field number",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 9,
        type: "question",
        key: "Methodology statement",
        value: "Answer goes here",
        section: null,
      },
      {
        id: 10,
        type: "guidance",
        key: "Important information",
        value: "Guidance page",
        section: null,
        guidanceText:
          "Please ensure all information provided is accurate and up to date. This helps us process your application more efficiently.",
      },
      {
        id: 11,
        type: "guidance",
        key: "Data protection notice",
        value: "Guidance page",
        section: null,
        guidanceText:
          "Your personal information will be processed in accordance with the Data Protection Act 2018. We will only use your data for the purposes stated in this application.",
      },
      {
        id: 12,
        type: "guidance",
        key: "Application process",
        value: "Guidance page",
        section: null,
        guidanceText:
          "After submitting your application, we will review the information provided and may contact you for additional details. Processing typically takes 10-15 working days.",
      },
    ];
  }
  if (!req.session.data.sections) {
    req.session.data.sections = [
      { id: "section1", name: "Business details", title: "Business details" },
      {
        id: "section2",
        name: "Livestock information",
        title: "Livestock information",
      },
      { id: "section3", name: "Contact details", title: "Contact details" },
    ];
  }
  next();
});

// ── LISTS ROUTES ───────────────────────────────────────────────────────────────

// Non-prefixed URLs
router.get("/form-editor/new-list", (req, res) =>
  res.render("titan-mvp-1.2/form-editor/lists/new")
);
router.post("/form-editor/new-list", lists.post);
router.get("/form-editor/list-manager", lists.get);
router.get("/form-editor/edit-list/:name", lists.editGet);
router.post("/form-editor/update-list/:name", lists.editPost);
router.post("/form-editor/delete-list/:name", lists.delete);
router.get("/form-editor/api/lists", lists.getListsAPI);
router.get("/form-editor/api/list/:name", lists.getListAPI);
router.get("/form-editor/view-list/:name", lists.viewGet);

// Prefixed URLs
router.get("/titan-mvp-1.2/form-editor/new-list", (req, res) =>
  res.render("titan-mvp-1.2/form-editor/lists/new")
);
router.post("/titan-mvp-1.2/form-editor/new-list", lists.post);
router.get("/titan-mvp-1.2/form-editor/list-manager", lists.get);
router.get("/titan-mvp-1.2/form-editor/edit-list/:name", lists.editGet);
router.post("/titan-mvp-1.2/form-editor/update-list/:name", lists.editPost);
router.post("/titan-mvp-1.2/form-editor/delete-list/:name", lists.delete);
router.get("/titan-mvp-1.2/form-editor/api/lists", lists.getListsAPI);
router.get("/titan-mvp-1.2/form-editor/api/list/:name", lists.getListAPI);
router.get("/titan-mvp-1.2/form-editor/view-list/:name", lists.viewGet);

// ── CSAT ROUTES ────────────────────────────────────────────────────────────────

// CSAT form submission
router.post("/titan-mvp-1.2/form-editor/CSAT/form-submitted", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/CSAT/form-submitted");
});

// CSAT form page
router.get("/titan-mvp-1.2/form-editor/CSAT/form", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/CSAT/form");
});

// ── SECTIONS ROUTES ────────────────────────────────────────────────────────────

// Mount shared sections router
router.use("/form-editor", sections);
router.use("/titan-mvp-1.2/form-editor", sections);

// One-off sections management page (non-prefixed)
router.get("/form-editor/sections", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];

  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// One-off sections management page (prefixed)
router.get("/titan-mvp-1.2/form-editor/sections", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];

  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// Add non-.html route for sections
router.get("/titan-mvp-1.2/form-editor/sections.html", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];
  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// Add non-.html route for conditions/page-level
router.get(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formPages.findIndex(
      (page) => String(page.pageId) === req.params.pageId
    );
    const currentPage = formPages[pageIndex] || {};
    const pageNumber = pageIndex + 1;
    const conditions = currentPage.conditions || [];

    // Get available questions for conditions
    const availableQuestions = formPages
      .flatMap((page) => page.questions)
      .filter((question) => {
        const type = question.subType || question.type;
        return ["radios", "checkboxes", "yes-no", "autocomplete"].includes(
          type
        );
      })
      .map((question) => ({
        value: question.questionId,
        text: question.label,
        type: question.subType || question.type,
        options: question.options,
      }));

    // Populate existingConditions (form-level and other page-level)
    const existingConditions = [];
    // Add form-level conditions first
    if (formData.conditions) {
      existingConditions.push(
        ...formData.conditions.map((condition) => ({
          value: condition.id.toString(),
          text: condition.conditionName,
          hint: {
            text: condition.rules
              .map(
                (rule) =>
                  `${rule.questionText} ${rule.operator} ${
                    Array.isArray(rule.value)
                      ? rule.value.join(" or ")
                      : rule.value
                  }`
              )
              .join(" AND "),
          },
        }))
      );
    }
    // Add page-level conditions from other pages
    formPages
      .filter((page) => String(page.pageId) !== req.params.pageId)
      .forEach((page) => {
        if (page.conditions) {
          existingConditions.push(
            ...page.conditions.map((condition) => ({
              value: condition.id.toString(),
              text: condition.conditionName,
              hint: {
                text: condition.rules
                  .map(
                    (rule) =>
                      `${rule.questionText} ${rule.operator} ${
                        Array.isArray(rule.value)
                          ? rule.value.join(" or ")
                          : rule.value
                      }`
                  )
                  .join(" AND "),
              },
            }))
          );
        }
      });

    // Combine default option and existingConditions for the select
    const selectItems = [
      { value: "", text: "Select existing condition" },
      ...existingConditions,
    ];

    res.render("titan-mvp-1.2/form-editor/conditions/page-level.html", {
      form: { name: formData.formName || "Form name" },
      currentPage,
      pageNumber,
      conditions,
      question: currentPage.questions ? currentPage.questions[0] : {},
      existingConditions: existingConditions,
      selectItems: selectItems,
      availableQuestions: availableQuestions, // Add available questions to the template context
    });
  }
);

// Form-level conditions management (manager)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/manager",
  function (req, res) {
    const formData = req.session.data || {};
    let formPages = req.session.data["formPages"] || [];
    const conditions = formData.conditions || [];
    const conditionSaved = req.query.conditionSaved === "true";

    if (!formPages || formPages.length === 0) {
      // Try to reconstruct from other session data if possible
      if (Array.isArray(formData.pages) && formData.pages.length > 0) {
        formPages = formData.pages;
        console.log(
          "DEBUG: Fallback to formData.pages",
          JSON.stringify(formPages)
        );
      }
    }

    // Get all available questions for conditions
    const availableQuestions = formPages
      .flatMap((page) => page.questions)
      .filter((question) => {
        const type = question.subType || question.type;
        return ["radios", "checkboxes", "yes-no", "autocomplete"].includes(
          type
        );
      })
      .map((question) => ({
        value: question.questionId,
        text: question.label,
        type: question.subType || question.type,
        options: question.options,
      }));

    res.render("titan-mvp-1.2/form-editor/conditions/manager", {
      form: {
        name: formData.formName || "Form name",
      },
      availableQuestions: availableQuestions,
      conditions: conditions,
      formPages: formPages,
      conditionSaved: conditionSaved,
      query: req.query, // Pass query params for context banner
    });
  }
);

// Add route to handle creating conditions at the page level
router.post(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/add",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const pageId = req.params.pageId;

    // Find the current page
    const currentPage = formPages.find(
      (page) => String(page.pageId) === pageId
    );

    if (!currentPage) {
      console.error("Page not found:", pageId);
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    // Initialize conditions array if it doesn't exist
    currentPage.conditions = currentPage.conditions || [];

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
        rules =
          typeof req.body.rules === "string"
            ? JSON.parse(req.body.rules)
            : req.body.rules;
        if (!Array.isArray(rules)) {
          rules = [rules];
        }
      } else {
        console.error("No rules provided in request");
        rules = [];
      }
    } catch (e) {
      console.error("Error handling rules:", e);
      rules = [];
    }

    // Create the new condition
    const newCondition = {
      id: Date.now(),
      conditionName: req.body.conditionName,
      rules: rules.map((rule) => ({
        questionText: rule.questionText,
        operator: rule.operator,
        value: rule.value,
        logicalOperator: rule.logicalOperator,
      })),
      text: rules
        .map((rule) => {
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return `${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" "),
    };

    // Add the condition to the page
    currentPage.conditions.push(newCondition);

    // Also add to form-level (manager) conditions if not already present
    req.session.data.conditions = req.session.data.conditions || [];
    const alreadyExists = req.session.data.conditions.some(
      (c) => String(c.id) === String(newCondition.id)
    );
    if (!alreadyExists) {
      req.session.data.conditions.push(newCondition);
    }

    // Save back to session
    req.session.data.formPages = formPages;

    // Redirect back to the page-level conditions view
    res.redirect(`/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`);
  }
);

// Add/Edit form-level condition (manager)
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/add",
  function (req, res) {
    const formData = req.session.data || {};
    if (!formData.conditions) {
      formData.conditions = [];
    }

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
        rules =
          typeof req.body.rules === "string"
            ? JSON.parse(req.body.rules)
            : req.body.rules;
        if (!Array.isArray(rules)) {
          rules = [rules];
        }
      } else {
        console.error("No rules provided in request");
        rules = [];
      }
    } catch (e) {
      console.error("Error handling rules:", e);
      rules = [];
    }

    // Create the new condition
    const newCondition = {
      id: Date.now(),
      conditionName: req.body.conditionName,
      rules: rules.map((rule) => ({
        questionText: rule.questionText,
        operator: rule.operator,
        value: rule.value,
        logicalOperator: rule.logicalOperator,
      })),
      text: rules
        .map((rule) => {
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return `${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" "),
    };

    // Add the condition to the global conditions list only
    formData.conditions.push(newCondition);

    // --- NEW: Apply to selected pages if any were checked ---
    const formPages = req.session.data.formPages || [];
    let selectedPages = [];
    try {
      selectedPages = (
        Array.isArray(req.body.pages)
          ? req.body.pages
          : req.body.pages
          ? JSON.parse(req.body.pages)
          : []
      )
        .filter(
          (pageId) =>
            pageId !== "_unchecked" &&
            pageId !== "none" &&
            !pageId.startsWith("[")
        )
        .map((pageId) => String(pageId));
    } catch (e) {
      selectedPages = [];
    }
    if (selectedPages.length > 0) {
      selectedPages.forEach((pageId) => {
        const page = formPages.find((p) => String(p.pageId) === pageId);
        if (page) {
          page.conditions = page.conditions || [];
          const alreadyExists = page.conditions.some(
            (c) => String(c.id) === String(newCondition.id)
          );
          if (!alreadyExists) {
            page.conditions.push(JSON.parse(JSON.stringify(newCondition)));
          }
        }
      });
    }
    req.session.data.formPages = formPages;
    // --- END NEW ---

    // Save back to session
    req.session.data = formData;

    // Redirect with the new condition ID
    res.redirect(
      `/titan-mvp-1.2/form-editor/conditions/manager?conditionSaved=true&newConditionId=${newCondition.id}`
    );
  }
);

// Add existing condition to a page (for page-level conditions UI)
router.post("/conditions-add", function (req, res) {
  const formData = req.session.data || {};
  const formPages = req.session.data.formPages || [];
  const currentPageId = req.body.currentPageId;

  // Find the current page by pageId
  const currentPage = formPages.find(
    (page) => String(page.pageId) === String(currentPageId)
  );

  if (!currentPage) {
    console.error("Page not found:", currentPageId);
    return res.redirect("/titan-mvp-1.2/form-editor/listing");
  }

  // Initialize conditions array if it doesn't exist
  currentPage.conditions = currentPage.conditions || [];

  if (req.body.conditionType === "existing") {
    const existingConditionId = req.body.existingConditionId;

    // Find the existing condition from form-level conditions first
    let existingCondition = null;
    if (formData.conditions) {
      existingCondition = formData.conditions.find(
        (c) => String(c.id) === String(existingConditionId)
      );
    }

    // If not found in form-level, look in page-level conditions
    if (!existingCondition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === String(existingConditionId)
          );
          if (found) {
            existingCondition = found;
            break;
          }
        }
      }
    }

    if (existingCondition) {
      // Check if condition already exists in current page
      const alreadyExists = currentPage.conditions.some(
        (c) => String(c.id) === String(existingConditionId)
      );

      if (!alreadyExists) {
        // Add a deep copy of the condition to avoid reference issues
        currentPage.conditions.push(
          JSON.parse(JSON.stringify(existingCondition))
        );
      }
    } else {
      console.error(
        "Could not find existing condition with ID:",
        existingConditionId
      );
    }

    // Save back to session
    req.session.data.formPages = formPages;

    // Debug log for redirect
    console.log(
      "POST /conditions-add hit, redirecting to:",
      `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
    );

    // Redirect back to the page-level conditions view
    return res.redirect(
      `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
    );
  }

  // If not an existing condition, just redirect
  res.redirect(
    `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
  );
});

// Add this route to handle the delete condition page
router.get(
  "/titan-mvp-1.2/form-editor/conditions/delete/:conditionId",
  (req, res) => {
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];

    // Find the condition details
    const condition =
      formData.conditions?.find(
        (c) => c.id.toString() === conditionId.toString()
      ) ||
      formPages
        .flatMap((page) => page.conditions || [])
        .find((c) => c.id.toString() === conditionId.toString());

    if (!condition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Find all pages that use this condition
    const pagesWithCondition = [];
    formPages.forEach((page, index) => {
      if (page.conditions) {
        const usesCondition = page.conditions.some(
          (c) => c.id.toString() === conditionId.toString()
        );
        if (usesCondition) {
          pagesWithCondition.push({
            pageNumber: index + 1,
            pageHeading: page.pageHeading || `Page ${page.pageId}`,
          });
        }
      }
    });

    res.render("titan-mvp-1.2/form-editor/conditions/delete", {
      form: formData,
      conditionName: condition.conditionName,
      conditionId: conditionId,
      pagesWithCondition: pagesWithCondition,
      formName: formData.name || "Untitled form",
    });
  }
);

// POST route to actually delete the condition
router.post(
  "/titan-mvp-1.2/form-editor/conditions/delete/:conditionId",
  (req, res) => {
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];

    // Remove from form-level conditions if they exist
    if (formData.conditions) {
      formData.conditions = formData.conditions.filter(
        (c) => c.id.toString() !== conditionId.toString()
      );
    }

    // Remove from any pages that use this condition
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions = page.conditions.filter(
          (c) => c.id.toString() !== conditionId.toString()
        );
      }
      // Also check if this condition is used in any page's conditional routing
      if (page.conditionalRouting) {
        page.conditionalRouting = page.conditionalRouting.filter(
          (route) => route.conditionId.toString() !== conditionId.toString()
        );
      }
    });

    req.session.data.formPages = formPages;
    req.session.data.conditions = formData.conditions;

    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// ── FORM EDITOR ROUTES ─────────────────────────────────────────────────────────

// Location pages routes
router.get("/titan-mvp-1.2/form-editor/location/precise", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location/precise", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

router.get("/titan-mvp-1.2/form-editor/location/wreck", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location/wreck", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

// Map Component Proof of Concept
router.get("/titan-mvp-1.2/form-editor/location/map-component-poc", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location/map-component-poc", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

// Separate Components Example
router.get("/titan-mvp-1.2/form-editor/location/separate-components-example", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location/separate-components-example", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

// Unified Component Example
router.get("/titan-mvp-1.2/form-editor/location/unified-component-example", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location/unified-component-example", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

// Wreck OTP demo page
router.get(
  "/titan-mvp-1.2/form-editor/location/wreck-otp",
  function (req, res) {
    res.render("titan-mvp-1.2/form-editor/location/wreck-otp", {
      serviceName: "Form Editor",
      errorSummary: [],
      errors: {},
      data: req.session.data || {},
    });
  }
);

// OTP Input Demo Route
router.get("/titan-mvp-1.2/govuk-otp-input-demo", function (req, res) {
  res.render("titan-mvp-1.2/govuk-otp-input-demo", {
    serviceName: "Form Editor",
    errorSummary: [],
    errors: {},
    data: req.session.data || {},
  });
});

router.post("/titan-mvp-1.2/govuk-otp-input-demo", function (req, res) {
  // Handle form submission - redirect back to demo page
  res.redirect("/titan-mvp-1.2/govuk-otp-input-demo");
});

// Error scenarios page for location form
router.get(
  "/titan-mvp-1.2/form-editor/location/wreck-errors",
  function (req, res) {
    res.render("titan-mvp-1.2/form-editor/location/wreck-errors", {
      serviceName: "Form Editor",
    });
  }
);

// Wreck OTP demo page POST
router.post(
  "/titan-mvp-1.2/form-editor/location/wreck-otp",
  function (req, res) {
    const errors = {};
    const errorSummary = [];
    const data = req.body;

    // Store the form data in session
    if (!req.session.data) {
      req.session.data = {};
    }
    if (!req.session.data.location) {
      req.session.data.location = {};
    }

    // Store all form data
    Object.keys(data).forEach((key) => {
      req.session.data.location[key] = data[key];
    });

    // Validation functions
    function isValidNumber(value) {
      return value && !isNaN(parseFloat(value)) && isFinite(value);
    }

    function isInRange(value, min, max) {
      const num = parseFloat(value);
      return num >= min && num <= max;
    }

    // Decimal Degrees Validation
    if (data["latitude_decimal_otp"]) {
      if (!isValidNumber(data["latitude_decimal_otp"])) {
        errors["latitude-decimal-otp"] = "Latitude must be a valid number";
        errorSummary.push({
          text: "Latitude must be a valid number",
          href: "#latitude-decimal-otp",
        });
      } else if (!isInRange(data["latitude_decimal_otp"], -90, 90)) {
        errors["latitude-decimal-otp"] =
          "Latitude must be between -90 and 90 degrees";
        errorSummary.push({
          text: "Latitude must be between -90 and 90 degrees",
          href: "#latitude-decimal-otp",
        });
      }
    }

    if (data["longitude_decimal_otp"]) {
      if (!isValidNumber(data["longitude_decimal_otp"])) {
        errors["longitude-decimal-otp"] = "Longitude must be a valid number";
        errorSummary.push({
          text: "Longitude must be a valid number",
          href: "#longitude-decimal-otp",
        });
      } else if (!isInRange(data["longitude_decimal_otp"], -180, 180)) {
        errors["longitude-decimal-otp"] =
          "Longitude must be between -180 and 180 degrees";
        errorSummary.push({
          text: "Longitude must be between -180 and 180 degrees",
          href: "#longitude-decimal-otp",
        });
      }
    }

    // Degrees and Decimal Minutes Validation
    if (data["latitude_dm_degree"] || data["latitude_dm_minute"]) {
      if (!data["latitude_dm_degree"]) {
        errors["latitude-decimal-minutes-otp"] = "Enter latitude degree";
        errorSummary.push({
          text: "Enter latitude degree",
          href: "#latitude-dm-degree",
        });
      } else if (!isInRange(data["latitude_dm_degree"], 0, 90)) {
        errors["latitude-decimal-minutes-otp"] =
          "Latitude degree must be between 0 and 90";
        errorSummary.push({
          text: "Latitude degree must be between 0 and 90",
          href: "#latitude-dm-degree",
        });
      }

      if (
        data["latitude_dm_minute"] &&
        !isInRange(data["latitude_dm_minute"], 0, 59.999)
      ) {
        errors["latitude-decimal-minutes-otp"] =
          "Latitude minutes must be between 0 and 59.999";
        errorSummary.push({
          text: "Latitude minutes must be between 0 and 59.999",
          href: "#latitude-dm-minute",
        });
      }

      if (!data["latitude_dm_direction"]) {
        errors["latitude-decimal-minutes-otp"] = "Select latitude direction";
        errorSummary.push({
          text: "Select latitude direction",
          href: "#latitude-dm-direction",
        });
      }
    }

    if (data["longitude_dm_degree"] || data["longitude_dm_minute"]) {
      if (!data["longitude_dm_degree"]) {
        errors["longitude-decimal-minutes-otp"] = "Enter longitude degree";
        errorSummary.push({
          text: "Enter longitude degree",
          href: "#longitude-dm-degree",
        });
      } else if (!isInRange(data["longitude_dm_degree"], 0, 180)) {
        errors["longitude-decimal-minutes-otp"] =
          "Longitude degree must be between 0 and 180";
        errorSummary.push({
          text: "Longitude degree must be between 0 and 180",
          href: "#longitude-dm-degree",
        });
      }

      if (
        data["longitude_dm_minute"] &&
        !isInRange(data["longitude_dm_minute"], 0, 59.999)
      ) {
        errors["longitude-decimal-minutes-otp"] =
          "Longitude minutes must be between 0 and 59.999";
        errorSummary.push({
          text: "Longitude minutes must be between 0 and 59.999",
          href: "#longitude-dm-minute",
        });
      }

      if (!data["longitude_dm_direction"]) {
        errors["longitude-decimal-minutes-otp"] = "Select longitude direction";
        errorSummary.push({
          text: "Select longitude direction",
          href: "#longitude-dm-direction",
        });
      }
    }

    // Degrees, Minutes, Seconds Validation
    if (
      data["latitude_dms_degree"] ||
      data["latitude_dms_minute"] ||
      data["latitude_dms_second"]
    ) {
      if (!data["latitude_dms_degree"]) {
        errors["latitude-dms-otp"] = "Enter latitude degree";
        errorSummary.push({
          text: "Enter latitude degree",
          href: "#latitude-dms-degree",
        });
      } else if (!isInRange(data["latitude_dms_degree"], 0, 90)) {
        errors["latitude-dms-otp"] = "Latitude degree must be between 0 and 90";
        errorSummary.push({
          text: "Latitude degree must be between 0 and 90",
          href: "#latitude-dms-degree",
        });
      }

      if (
        data["latitude_dms_minute"] &&
        !isInRange(data["latitude_dms_minute"], 0, 59)
      ) {
        errors["latitude-dms-otp"] =
          "Latitude minutes must be between 0 and 59";
        errorSummary.push({
          text: "Latitude minutes must be between 0 and 59",
          href: "#latitude-dms-minute",
        });
      }

      if (
        data["latitude_dms_second"] &&
        !isInRange(data["latitude_dms_second"], 0, 59.999)
      ) {
        errors["latitude-dms-otp"] =
          "Latitude seconds must be between 0 and 59.999";
        errorSummary.push({
          text: "Latitude seconds must be between 0 and 59.999",
          href: "#latitude-dms-second",
        });
      }

      if (!data["latitude_dms_direction"]) {
        errors["latitude-dms-otp"] = "Select latitude direction";
        errorSummary.push({
          text: "Select latitude direction",
          href: "#latitude-dms-direction",
        });
      }
    }

    if (
      data["longitude_dms_degree"] ||
      data["longitude_dms_minute"] ||
      data["longitude_dms_second"]
    ) {
      if (!data["longitude_dms_degree"]) {
        errors["longitude-dms-otp"] = "Enter longitude degree";
        errorSummary.push({
          text: "Enter longitude degree",
          href: "#longitude-dms-degree",
        });
      } else if (!isInRange(data["longitude_dms_degree"], 0, 180)) {
        errors["longitude-dms-otp"] =
          "Longitude degree must be between 0 and 180";
        errorSummary.push({
          text: "Longitude degree must be between 0 and 180",
          href: "#longitude-dms-degree",
        });
      }

      if (
        data["longitude_dms_minute"] &&
        !isInRange(data["longitude_dms_minute"], 0, 59)
      ) {
        errors["longitude-dms-otp"] =
          "Longitude minutes must be between 0 and 59";
        errorSummary.push({
          text: "Longitude minutes must be between 0 and 59",
          href: "#longitude-dms-minute",
        });
      }

      if (
        data["longitude_dms_second"] &&
        !isInRange(data["longitude_dms_second"], 0, 59.999)
      ) {
        errors["longitude-dms-otp"] =
          "Longitude seconds must be between 0 and 59.999";
        errorSummary.push({
          text: "Longitude seconds must be between 0 and 59.999",
          href: "#longitude-dms-second",
        });
      }

      if (!data["longitude_dms_direction"]) {
        errors["longitude-dms-otp"] = "Select longitude direction";
        errorSummary.push({
          text: "Select longitude direction",
          href: "#longitude-dms-direction",
        });
      }
    }

    // UK Grid Reference Validation
    if (data["grid_square"] || data["grid_easting"] || data["grid_northing"]) {
      if (!data["grid_square"]) {
        errors["uk-grid-otp"] = "Enter grid square";
        errorSummary.push({
          text: "Enter grid square",
          href: "#grid-square",
        });
      } else if (!/^[A-Za-z]{2}$/.test(data["grid_square"])) {
        errors["uk-grid-otp"] =
          "Grid square must be two letters (e.g., TQ, SW)";
        errorSummary.push({
          text: "Grid square must be two letters (e.g., TQ, SW)",
          href: "#grid-square",
        });
      }

      if (!data["grid_easting"]) {
        errors["uk-grid-otp"] = "Enter easting";
        errorSummary.push({
          text: "Enter easting",
          href: "#grid-easting",
        });
      } else if (!isInRange(data["grid_easting"], 0, 99999)) {
        errors["uk-grid-otp"] = "Easting must be between 0 and 99999";
        errorSummary.push({
          text: "Easting must be between 0 and 99999",
          href: "#grid-easting",
        });
      }

      if (!data["grid_northing"]) {
        errors["uk-grid-otp"] = "Enter northing";
        errorSummary.push({
          text: "Enter northing",
          href: "#grid-northing",
        });
      } else if (!isInRange(data["grid_northing"], 0, 99999)) {
        errors["uk-grid-otp"] = "Northing must be between 0 and 99999";
        errorSummary.push({
          text: "Northing must be between 0 and 99999",
          href: "#grid-northing",
        });
      }
    }

    // Check if at least one coordinate method is provided
    const hasAnyCoordinateData = Object.keys(data).some(
      (key) =>
        key.includes("_otp") ||
        key.includes("_degree") ||
        key.includes("_minute") ||
        key.includes("_second") ||
        key.includes("_direction") ||
        key.includes("grid_")
    );

    if (!hasAnyCoordinateData) {
      errors["no-coordinates"] =
        "Please enter at least one coordinate using the OTP inputs";
      errorSummary.push({
        text: "Please enter at least one coordinate using the OTP inputs",
        href: "#latitude-decimal-otp",
      });
    }

    // If there are errors, re-render the form with errors
    if (Object.keys(errors).length > 0) {
      res.render("titan-mvp-1.2/form-editor/location/wreck-otp", {
        serviceName: "Form Editor",
        errorSummary: errorSummary,
        errors: errors,
        data: req.session.data || {},
      });
    } else {
      // Success - redirect to a success page or back to the form
      res.redirect(
        "/titan-mvp-1.2/form-editor/location/wreck-otp?success=true"
      );
    }
  }
);

router.post("/titan-mvp-1.2/form-editor/location/wreck", function (req, res) {
  const errors = {};
  const errorSummary = [];
  const data = req.body;

  // Check if at least one location method is provided
  const hasDecimalDegrees =
    data["location-latitude-decimal"] && data["location-longitude-decimal"];
  const hasDecimalMinutes =
    data["location-latitude-decimal-minutes-degree"] &&
    data["location-longitude-decimal-minutes-degree"];
  const hasDegreesMinutesSeconds =
    data["location-latitude-degrees-degree"] &&
    data["location-longitude-degrees-degree"];
  const hasOSGrid =
    data["location-osgrid-square"] &&
    data["location-osgrid-easting"] &&
    data["location-osgrid-northing"];
  const hasMap =
    data["map-latitude-input"] &&
    data["map-longitude-input"] &&
    data["map-radius-input"];
  const hasTextLocation =
    data["text-location"] && data["text-location"].trim().length > 0;
  const hasOSGridRefNumber =
    data["os-grid-reference-number"] &&
    data["os-grid-reference-number"].trim().length > 0;
  const hasEastingNorthingAlt =
    data["location-osgrid-easting-alt"] && data["location-osgrid-northing-alt"];
  const hasNationalGridFieldNumber =
    data["national-grid-field-number"] &&
    data["national-grid-field-number"].trim().length > 0;

  const hasAnyLocation =
    hasDecimalDegrees ||
    hasDecimalMinutes ||
    hasDegreesMinutesSeconds ||
    hasOSGrid ||
    hasOSGridRefNumber ||
    hasEastingNorthingAlt ||
    hasNationalGridFieldNumber ||
    hasMap ||
    hasTextLocation;

  if (!hasAnyLocation) {
    errorSummary.push({
      text: "Please provide at least one location method",
      href: "#location-latitude-decimal",
    });
  }

  // Validate each provided location method
  if (hasDecimalDegrees) {
    validateDecimalDegrees(data, errors, errorSummary);
  }

  if (hasDecimalMinutes) {
    validateDegreesDecimalMinutes(data, errors, errorSummary);
  }

  if (hasDegreesMinutesSeconds) {
    validateDegreesMinutesSeconds(data, errors, errorSummary);
  }

  if (hasOSGrid) {
    validateOSGridRef(data, errors, errorSummary);
  }

  if (hasMap) {
    validateMapInput(data, errors, errorSummary);
  }

  if (hasTextLocation) {
    validateTextLocation(data, errors, errorSummary);
  }

  if (hasOSGridRefNumber) {
    validateOSGridRefNumber(data, errors, errorSummary);
  }

  if (hasEastingNorthingAlt) {
    validateEastingNorthingAlt(data, errors, errorSummary);
  }

  if (hasNationalGridFieldNumber) {
    validateNationalGridFieldNumber(data, errors, errorSummary);
  }

  // Store form data in session
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.location) {
    req.session.data.location = {};
  }

  // Store all form data
  Object.keys(data).forEach((key) => {
    req.session.data.location[key] = data[key];
  });

  // If there are errors, re-render the form with errors
  if (Object.keys(errors).length > 0) {
    res.render("titan-mvp-1.2/form-editor/location/wreck", {
      serviceName: "Form Editor",
      errorSummary: errorSummary,
      errors: errors,
      data: req.session.data || {},
    });
  } else {
    // Form is valid, redirect to next step
    res.redirect("/titan-mvp-1.2/form-editor/location-answer");
  }
});

// Precise location page POST
router.post("/titan-mvp-1.2/form-editor/location/precise", function (req, res) {
  const errors = {};
  const errorSummary = [];
  const data = req.body;

  // Check if at least one location method is provided
  const hasDecimalDegrees =
    data["location-latitude-decimal"] && data["location-longitude-decimal"];
  const hasDecimalMinutes =
    data["location-latitude-decimal-minutes-degree"] &&
    data["location-longitude-decimal-minutes-degree"];
  const hasDegreesMinutesSeconds =
    data["location-latitude-degrees-degree"] &&
    data["location-longitude-degrees-degree"];
  const hasOSGrid =
    data["location-osgrid-square"] &&
    data["location-osgrid-easting"] &&
    data["location-osgrid-northing"];
  const hasOSGridRefNumber =
    data["os-grid-reference-number"] &&
    data["os-grid-reference-number"].trim().length > 0;
  const hasEastingNorthingAlt =
    data["location-osgrid-easting-alt"] && data["location-osgrid-northing-alt"];
  const hasNationalGridFieldNumber =
    data["national-grid-field-number"] &&
    data["national-grid-field-number"].trim().length > 0;
  const hasMap =
    data["map-latitude-input"] &&
    data["map-longitude-input"] &&
    data["map-radius-input"];
  const hasTextLocation =
    data["text-location"] && data["text-location"].trim().length > 0;

  const hasAnyLocation =
    hasDecimalDegrees ||
    hasDecimalMinutes ||
    hasDegreesMinutesSeconds ||
    hasOSGrid ||
    hasOSGridRefNumber ||
    hasEastingNorthingAlt ||
    hasNationalGridFieldNumber ||
    hasMap ||
    hasTextLocation;

  if (!hasAnyLocation) {
    errorSummary.push({
      text: "Please provide at least one location method",
      href: "#location-latitude-decimal",
    });
  }

  // Validate each provided location method
  if (hasDecimalDegrees) {
    validateDecimalDegrees(data, errors, errorSummary);
  }

  if (hasDecimalMinutes) {
    validateDegreesDecimalMinutes(data, errors, errorSummary);
  }

  if (hasDegreesMinutesSeconds) {
    validateDegreesMinutesSeconds(data, errors, errorSummary);
  }

  if (hasOSGrid) {
    validateOSGridRef(data, errors, errorSummary);
  }

  if (hasMap) {
    validateMapInput(data, errors, errorSummary);
  }

  if (hasTextLocation) {
    validateTextLocation(data, errors, errorSummary);
  }

  if (hasOSGridRefNumber) {
    validateOSGridRefNumber(data, errors, errorSummary);
  }

  if (hasEastingNorthingAlt) {
    validateEastingNorthingAlt(data, errors, errorSummary);
  }

  if (hasNationalGridFieldNumber) {
    validateNationalGridFieldNumber(data, errors, errorSummary);
  }

  // Store form data in session
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.location) {
    req.session.data.location = {};
  }

  // Store all form data
  Object.keys(data).forEach((key) => {
    req.session.data.location[key] = data[key];
  });

  // If there are errors, re-render the form with errors
  if (Object.keys(errors).length > 0) {
    res.render("titan-mvp-1.2/form-editor/location/precise", {
      serviceName: "Form Editor",
      errorSummary: errorSummary,
      errors: errors,
      data: req.session.data || {},
    });
  } else {
    // Form is valid, redirect to next step
    res.redirect("/titan-mvp-1.2/form-editor/location-answer");
  }
});

// Validation helper functions
function validateDecimalDegrees(data, errors, errorSummary) {
  const lat = data["location-latitude-decimal"];
  const lon = data["location-longitude-decimal"];

  if (!lat || !lon) {
    errors["location-latitude-decimal"] = {
      text: "Both latitude and longitude are required",
    };
    errors["location-longitude-decimal"] = {
      text: "Both latitude and longitude are required",
    };
    errorSummary.push({
      text: "Both latitude and longitude are required",
      href: "#location-latitude-decimal",
    });
    return;
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    errors["location-latitude-decimal"] = {
      text: "Latitude and longitude must be valid numbers",
    };
    errors["location-longitude-decimal"] = {
      text: "Latitude and longitude must be valid numbers",
    };
    errorSummary.push({
      text: "Latitude and longitude must be valid numbers",
      href: "#location-latitude-decimal",
    });
    return;
  }

  if (latNum < -90 || latNum > 90) {
    errors["location-latitude-decimal"] = {
      text: "Latitude must be between -90 and 90 degrees",
    };
    errorSummary.push({
      text: "Latitude must be between -90 and 90 degrees",
      href: "#location-latitude-decimal",
    });
  }

  if (lonNum < -180 || lonNum > 180) {
    errors["location-longitude-decimal"] = {
      text: "Longitude must be between -180 and 180 degrees",
    };
    errorSummary.push({
      text: "Longitude must be between -180 and 180 degrees",
      href: "#location-longitude-decimal",
    });
  }

  // Check if coordinates are within Great Britain (simplified check)
  if (latNum < 49 || latNum > 62 || lonNum < -9.5 || lonNum > 2.3) {
    errors["location-latitude-decimal"] = {
      text: "Coordinates must be within Great Britain",
    };
    errors["location-longitude-decimal"] = {
      text: "Coordinates must be within Great Britain",
    };
    errorSummary.push({
      text: "Coordinates must be within Great Britain",
      href: "#location-latitude-decimal",
    });
  }
}

function validateDegreesDecimalMinutes(data, errors, errorSummary) {
  const latDeg = data["location-latitude-decimal-minutes-degree"];
  const latMin = data["location-latitude-decimal-minutes-minute"];
  const latDir = data["location-latitude-decimal-minutes-direction"];
  const lonDeg = data["location-longitude-decimal-minutes-degree"];
  const lonMin = data["location-longitude-decimal-minutes-minute"];
  const lonDir = data["location-longitude-decimal-minutes-direction"];

  if (!latDeg || !latMin || !latDir || !lonDeg || !lonMin || !lonDir) {
    errorSummary.push({
      text: "All coordinate fields are required",
      href: "#location-latitude-decimal-minutes-degree",
    });
    return;
  }

  const latDegNum = parseInt(latDeg);
  const latMinNum = parseFloat(latMin);
  const lonDegNum = parseInt(lonDeg);
  const lonMinNum = parseFloat(lonMin);

  if (
    isNaN(latDegNum) ||
    isNaN(latMinNum) ||
    isNaN(lonDegNum) ||
    isNaN(lonMinNum)
  ) {
    errorSummary.push({
      text: "All coordinate values must be valid numbers",
      href: "#location-latitude-decimal-minutes-degree",
    });
    return;
  }

  if (latDegNum < 0 || latDegNum > 90) {
    errors["location-latitude-decimal-minutes-degree"] = {
      text: "Latitude degrees must be between 0 and 90",
    };
    errorSummary.push({
      text: "Latitude degrees must be between 0 and 90",
      href: "#location-latitude-decimal-minutes-degree",
    });
  }

  if (latMinNum < 0 || latMinNum >= 60) {
    errors["location-latitude-decimal-minutes-minute"] = {
      text: "Latitude minutes must be between 0 and 59.999",
    };
    errorSummary.push({
      text: "Latitude minutes must be between 0 and 59.999",
      href: "#location-latitude-decimal-minutes-minute",
    });
  }

  if (lonDegNum < 0 || lonDegNum > 180) {
    errors["location-longitude-decimal-minutes-degree"] = {
      text: "Longitude degrees must be between 0 and 180",
    };
    errorSummary.push({
      text: "Longitude degrees must be between 0 and 180",
      href: "#location-longitude-decimal-minutes-degree",
    });
  }

  if (lonMinNum < 0 || lonMinNum >= 60) {
    errors["location-longitude-decimal-minutes-minute"] = {
      text: "Longitude minutes must be between 0 and 59.999",
    };
    errorSummary.push({
      text: "Longitude minutes must be between 0 and 59.999",
      href: "#location-longitude-decimal-minutes-minute",
    });
  }
}

function validateDegreesMinutesSeconds(data, errors, errorSummary) {
  const latDeg = data["location-latitude-degrees-degree"];
  const latMin = data["location-latitude-degrees-minute"];
  const latSec = data["location-latitude-degrees-second"];
  const latDir = data["location-latitude-degrees-direction"];
  const lonDeg = data["location-longitude-degrees-degree"];
  const lonMin = data["location-longitude-degrees-minute"];
  const lonSec = data["location-longitude-degrees-second"];
  const lonDir = data["location-longitude-degrees-direction"];

  if (
    !latDeg ||
    !latMin ||
    !latSec ||
    !latDir ||
    !lonDeg ||
    !lonMin ||
    !lonSec ||
    !lonDir
  ) {
    errorSummary.push({
      text: "All coordinate fields are required",
      href: "#location-latitude-degrees-degree",
    });
    return;
  }

  const latDegNum = parseInt(latDeg);
  const latMinNum = parseInt(latMin);
  const latSecNum = parseFloat(latSec);
  const lonDegNum = parseInt(lonDeg);
  const lonMinNum = parseInt(lonMin);
  const lonSecNum = parseFloat(lonSec);

  if (
    isNaN(latDegNum) ||
    isNaN(latMinNum) ||
    isNaN(latSecNum) ||
    isNaN(lonDegNum) ||
    isNaN(lonMinNum) ||
    isNaN(lonSecNum)
  ) {
    errorSummary.push({
      text: "All coordinate values must be valid numbers",
      href: "#location-latitude-degrees-degree",
    });
    return;
  }

  if (latDegNum < 0 || latDegNum > 90) {
    errors["location-latitude-degrees-degree"] = {
      text: "Latitude degrees must be between 0 and 90",
    };
    errorSummary.push({
      text: "Latitude degrees must be between 0 and 90",
      href: "#location-latitude-degrees-degree",
    });
  }

  if (latMinNum < 0 || latMinNum >= 60) {
    errors["location-latitude-degrees-minute"] = {
      text: "Latitude minutes must be between 0 and 59",
    };
    errorSummary.push({
      text: "Latitude minutes must be between 0 and 59",
      href: "#location-latitude-degrees-minute",
    });
  }

  if (latSecNum < 0 || latSecNum >= 60) {
    errors["location-latitude-degrees-second"] = {
      text: "Latitude seconds must be between 0 and 59.999",
    };
    errorSummary.push({
      text: "Latitude seconds must be between 0 and 59.999",
      href: "#location-latitude-degrees-second",
    });
  }

  if (lonDegNum < 0 || lonDegNum > 180) {
    errors["location-longitude-degrees-degree"] = {
      text: "Longitude degrees must be between 0 and 180",
    };
    errorSummary.push({
      text: "Longitude degrees must be between 0 and 180",
      href: "#location-longitude-degrees-degree",
    });
  }

  if (lonMinNum < 0 || lonMinNum >= 60) {
    errors["location-longitude-degrees-minute"] = {
      text: "Longitude minutes must be between 0 and 59",
    };
    errorSummary.push({
      text: "Longitude minutes must be between 0 and 59",
      href: "#location-longitude-degrees-minute",
    });
  }

  if (lonSecNum < 0 || lonSecNum >= 60) {
    errors["location-longitude-degrees-second"] = {
      text: "Longitude seconds must be between 0 and 59.999",
    };
    errorSummary.push({
      text: "Longitude seconds must be between 0 and 59.999",
      href: "#location-longitude-degrees-second",
    });
  }
}

function validateOSGridRef(data, errors, errorSummary) {
  const square = data["location-osgrid-square"];
  const easting = data["location-osgrid-easting"];
  const northing = data["location-osgrid-northing"];

  if (!square || !easting || !northing) {
    errorSummary.push({
      text: "All grid reference fields are required",
      href: "#location-osgrid-square",
    });
    return;
  }

  const eastingNum = parseInt(easting);
  const northingNum = parseInt(northing);

  if (isNaN(eastingNum) || isNaN(northingNum)) {
    errors["location-osgrid-easting"] = {
      text: "Easting and northing must be valid numbers",
    };
    errors["location-osgrid-northing"] = {
      text: "Easting and northing must be valid numbers",
    };
    errorSummary.push({
      text: "Easting and northing must be valid numbers",
      href: "#location-osgrid-easting",
    });
    return;
  }

  if (eastingNum < 0 || eastingNum > 99999) {
    errors["location-osgrid-easting"] = {
      text: "Easting must be between 0 and 99999",
    };
    errorSummary.push({
      text: "Easting must be between 0 and 99999",
      href: "#location-osgrid-easting",
    });
  }

  if (northingNum < 0 || northingNum > 99999) {
    errors["location-osgrid-northing"] = {
      text: "Northing must be between 0 and 99999",
    };
    errorSummary.push({
      text: "Northing must be between 0 and 99999",
      href: "#location-osgrid-northing",
    });
  }

  if (!/^[A-Z]{2}$/i.test(square)) {
    errors["location-osgrid-square"] = {
      text: "Grid square must be two letters (e.g., TQ, SW)",
    };
    errorSummary.push({
      text: "Grid square must be two letters (e.g., TQ, SW)",
      href: "#location-osgrid-square",
    });
  }
}

function validateMapInput(data, errors, errorSummary) {
  const mapLat = data["map-latitude-input"];
  const mapLon = data["map-longitude-input"];
  const mapRadius = data["map-radius-input"];

  if (!mapLat || !mapLon || !mapRadius) {
    errors["map-radius-input"] = {
      text: "Please draw an area on the map",
    };
    errorSummary.push({
      text: "Please draw an area on the map",
      href: "#location-map-input",
    });
  }
}

function validateTextLocation(data, errors, errorSummary) {
  const textLocation = data["text-location"];

  if (!textLocation || textLocation.trim().length < 10) {
    errors["text-location"] = {
      text: "Please provide a detailed location description (at least 10 characters)",
    };
    errorSummary.push({
      text: "Please provide a detailed location description (at least 10 characters)",
      href: "#text-location",
    });
  }
}

function validateOSGridRefNumber(data, errors, errorSummary) {
  const gridRef = data["os-grid-reference-number"];

  if (!gridRef || gridRef.trim().length === 0) {
    errors["os-grid-reference-number"] = {
      text: "Enter an OS grid reference",
    };
    errorSummary.push({
      text: "Enter an OS grid reference",
      href: "#os-grid-reference-number",
    });
  } else {
    // Basic format validation - should be 2 letters followed by numbers
    const cleaned = gridRef.trim().replace(/\s+/g, " ");
    if (!/^[A-Z]{2}\s*\d+\s*\d+$/i.test(cleaned)) {
      errors["os-grid-reference-number"] = {
        text: "Enter a valid OS grid reference (for example, TQ 3003 8038)",
      };
      errorSummary.push({
        text: "Enter a valid OS grid reference (for example, TQ 3003 8038)",
        href: "#os-grid-reference-number",
      });
    }
  }
}

function validateEastingNorthingAlt(data, errors, errorSummary) {
  const easting = data["location-osgrid-easting-alt"];
  const northing = data["location-osgrid-northing-alt"];

  if (!easting || !northing) {
    errors["location-osgrid-easting-alt"] = {
      text: "Enter easting and northing",
    };
    errorSummary.push({
      text: "Enter easting and northing",
      href: "#location-osgrid-easting-alt",
    });
  } else {
    const eastingNum = parseInt(easting, 10);
    const northingNum = parseInt(northing, 10);

    if (isNaN(eastingNum) || isNaN(northingNum)) {
      errors["location-osgrid-easting-alt"] = {
        text: "Easting and northing must be valid numbers",
      };
      errorSummary.push({
        text: "Easting and northing must be valid numbers",
        href: "#location-osgrid-easting-alt",
      });
    } else if (eastingNum < 0 || eastingNum > 99999) {
      errors["location-osgrid-easting-alt"] = {
        text: "Easting must be between 0 and 99999",
      };
      errorSummary.push({
        text: "Easting must be between 0 and 99999",
        href: "#location-osgrid-easting-alt",
      });
    } else if (northingNum < 0 || northingNum > 99999) {
      errors["location-osgrid-northing-alt"] = {
        text: "Northing must be between 0 and 99999",
      };
      errorSummary.push({
        text: "Northing must be between 0 and 99999",
        href: "#location-osgrid-northing-alt",
      });
    }
  }
}

function validateNationalGridFieldNumber(data, errors, errorSummary) {
  const fieldNumber = data["national-grid-field-number"];

  if (!fieldNumber || fieldNumber.trim().length === 0) {
    errors["national-grid-field-number"] = {
      text: "Enter the National Grid field number",
    };
    errorSummary.push({
      text: "Enter the National Grid field number",
      href: "#national-grid-field-number",
    });
  }
}

// Location answer page
router.get("/titan-mvp-1.2/form-editor/location-answer", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/location-answer", {
    serviceName: "Form Editor",
    data: req.session.data || {},
  });
});

// Listing and setup routes
router.get("/titan-mvp-1.2/form-editor/listing", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};

  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((question) => {
        if (
          question.subType === "radios" ||
          question.subType === "checkboxes"
        ) {
          question.options = question.options || [];
        }
      });
    }
  });

  // Sort pages so payment pages appear after "Check your answers" page
  formPages.sort((a, b) => {
    const aHasPayment = a.questions && a.questions.some(q => q.type === "payment");
    const bHasPayment = b.questions && b.questions.some(q => q.type === "payment");
    const aIsCheckAnswers = a.pageHeading && a.pageHeading.toLowerCase().includes("check your answers");
    const bIsCheckAnswers = b.pageHeading && b.pageHeading.toLowerCase().includes("check your answers");

    // Assign sort values: check answers = 1, payment = 3, others = 2
    const aSortValue = aIsCheckAnswers ? 1 : (aHasPayment ? 3 : 2);
    const bSortValue = bIsCheckAnswers ? 1 : (bHasPayment ? 3 : 2);

    // If different categories, sort by category
    if (aSortValue !== bSortValue) {
      return aSortValue - bSortValue;
    }

    // Otherwise maintain original order
    return 0;
  });

  // Get all sections
  const sections = formData.sections || [];

  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }

  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Form name",
    },
    request: req,
  });
});
// Add non-.html route for listing
router.get("/titan-mvp-1.2/form-editor/listing.html", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((question) => {
        if (
          question.subType === "radios" ||
          question.subType === "checkboxes"
        ) {
          question.options = question.options || [];
        }
      });
    }
  });

  // Sort pages so payment pages appear after "Check your answers" page
  formPages.sort((a, b) => {
    const aHasPayment = a.questions && a.questions.some(q => q.type === "payment");
    const bHasPayment = b.questions && b.questions.some(q => q.type === "payment");
    const aIsCheckAnswers = a.pageHeading && a.pageHeading.toLowerCase().includes("check your answers");
    const bIsCheckAnswers = b.pageHeading && b.pageHeading.toLowerCase().includes("check your answers");

    // Assign sort values: check answers = 1, payment = 3, others = 2
    const aSortValue = aIsCheckAnswers ? 1 : (aHasPayment ? 3 : 2);
    const bSortValue = bIsCheckAnswers ? 1 : (bHasPayment ? 3 : 2);

    // If different categories, sort by category
    if (aSortValue !== bSortValue) {
      return aSortValue - bSortValue;
    }

    // Otherwise maintain original order
    return 0;
  });
  // Get all sections
  const sections = formData.sections || [];
  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }
  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Form name",
    },
    request: req,
  });
});

// Add route for listing-v2
router.get("/titan-mvp-1.2/form-editor/listing-v2", function (req, res) {
  let formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};

  // Start with empty form - no automatic dummy pages
  // Users can add pages manually or select a template

  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((question) => {
        if (
          question.subType === "radios" ||
          question.subType === "checkboxes"
        ) {
          question.options = question.options || [];
        }
      });
    }
  });

  // Sort pages so payment pages appear after "Check your answers" page
  formPages.sort((a, b) => {
    const aHasPayment = a.questions && a.questions.some(q => q.type === "payment");
    const bHasPayment = b.questions && b.questions.some(q => q.type === "payment");
    const aIsCheckAnswers = a.pageHeading && a.pageHeading.toLowerCase().includes("check your answers");
    const bIsCheckAnswers = b.pageHeading && b.pageHeading.toLowerCase().includes("check your answers");

    // Assign sort values: check answers = 1, payment = 3, others = 2
    const aSortValue = aIsCheckAnswers ? 1 : (aHasPayment ? 3 : 2);
    const bSortValue = bIsCheckAnswers ? 1 : (bHasPayment ? 3 : 2);

    // If different categories, sort by category
    if (aSortValue !== bSortValue) {
      return aSortValue - bSortValue;
    }

    // Otherwise maintain original order
    return 0;
  });

  // Get all sections
  const sections = formData.sections || [];
  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }

  res.render("titan-mvp-1.2/form-editor/listing-v2", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Employee Onboarding",
    },
    data: formData,
    request: req,
  });
});

// Add .html route for listing-v2
router.get("/titan-mvp-1.2/form-editor/listing-v2.html", function (req, res) {
  let formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};

  // Start with empty form - no automatic dummy pages
  // Users can add pages manually or select a template

  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((question) => {
        if (
          question.subType === "radios" ||
          question.subType === "checkboxes"
        ) {
          question.options = question.options || [];
        }
      });
    }
  });

  // Sort pages so payment pages appear after "Check your answers" page
  formPages.sort((a, b) => {
    const aHasPayment = a.questions && a.questions.some(q => q.type === "payment");
    const bHasPayment = b.questions && b.questions.some(q => q.type === "payment");
    const aIsCheckAnswers = a.pageHeading && a.pageHeading.toLowerCase().includes("check your answers");
    const bIsCheckAnswers = b.pageHeading && b.pageHeading.toLowerCase().includes("check your answers");

    // Assign sort values: check answers = 1, payment = 3, others = 2
    const aSortValue = aIsCheckAnswers ? 1 : (aHasPayment ? 3 : 2);
    const bSortValue = bIsCheckAnswers ? 1 : (bHasPayment ? 3 : 2);

    // If different categories, sort by category
    if (aSortValue !== bSortValue) {
      return aSortValue - bSortValue;
    }

    // Otherwise maintain original order
    return 0;
  });

  // Get all sections
  const sections = formData.sections || [];
  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }

  res.render("titan-mvp-1.2/form-editor/listing-v2", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Employee Onboarding",
    },
    data: formData,
    request: req,
  });
});

// Add route for what-happens-next-settings
router.get(
  "/titan-mvp-1.2/form-editor/what-happens-next-settings",
  function (req, res) {
    const formData = req.session.data || {};

    // If this is a draft form, populate with draft settings
    if (formData.formDetails?.hasDraft) {
      // Set draft form settings
      if (!formData.draftSettings) {
        formData.draftSettings = {
          nextSteps:
            "We will call you within 5 working days to discuss your application.",
          submissionType: "human-only",
          submissionVersion: "3",
          notificationEmail: "notify@defra.gov.uk",
        };
        req.session.data = formData;
      }
    }

    res.render("titan-mvp-1.2/form-editor/what-happens-next-settings", {
      data: formData.draftSettings || formData,
      form: {
        name: formData.formName || "Employee Onboarding",
      },
      request: req,
    });
  }
);

// Add .html route for what-happens-next-settings
router.get(
  "/titan-mvp-1.2/form-editor/what-happens-next-settings.html",
  function (req, res) {
    const formData = req.session.data || {};

    // If this is a draft form, populate with draft settings
    if (formData.formDetails?.hasDraft) {
      // Set draft form settings
      if (!formData.draftSettings) {
        formData.draftSettings = {
          nextSteps:
            "We will call you within 5 working days to discuss your application.",
          submissionType: "human-only",
          submissionVersion: "3",
          notificationEmail: "notify@defra.gov.uk",
        };
        req.session.data = formData;
      }
    }

    res.render("titan-mvp-1.2/form-editor/what-happens-next-settings", {
      data: formData.draftSettings || formData,
      request: req,
    });
  }
);

// Add POST route for what-happens-next-settings
router.post(
  "/titan-mvp-1.2/form-editor/what-happens-next-settings",
  function (req, res) {
    const formData = req.session.data || {};

    // Initialize draftSettings if it doesn't exist
    if (!formData.draftSettings) {
      formData.draftSettings = {};
    }

    // Update draft settings based on what was submitted
    if (req.body.nextSteps !== undefined) {
      formData.draftSettings.nextSteps = req.body.nextSteps;
    }

    if (req.body.submissionType !== undefined) {
      formData.draftSettings.submissionType = req.body.submissionType;
    }

    if (req.body.submissionVersion !== undefined) {
      formData.draftSettings.submissionVersion = req.body.submissionVersion;
    }

    if (req.body.notificationEmail !== undefined) {
      formData.draftSettings.notificationEmail = req.body.notificationEmail;
    }

    // Save to session
    req.session.data = formData;

    // Redirect back to the same page to show updated values
    res.redirect("/titan-mvp-1.2/form-editor/what-happens-next-settings");
  }
);

// Page type selection
router.get("/titan-mvp-1.2/form-editor/page-type.html", function (req, res) {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/page-type.html", {
    commonTerms: terms,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Add non-.html route for page-type
router.get("/titan-mvp-1.2/form-editor/page-type", function (req, res) {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/page-type.html", {
    commonTerms: terms,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Question number handling
router.post("/titan-mvp-1.2/question-number", function (req, res) {
  const pageType = req.session.data["questionnumber"];

  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  const newPage = {
    pageId: Date.now(),
    pageType: pageType === "guidance" ? "guidance" : "question",
    pageHeading: "",
    questions: [],
    hasGuidance: false,
    guidanceTextarea: "",
    allowMultipleResponses: false,
    setName: "",
    minResponseCount: "",
    maxResponseCount: "",
  };

  const formPages = req.session.data["formPages"];
  formPages.push(newPage);
  req.session.data["currentPageIndex"] = formPages.length - 1;

  if (pageType === "oncenf") {
    return res.redirect("/titan-mvp-1.2/form-editor/information-type-nf.html");
  } else if (pageType === "guidance") {
    return res.redirect(
      "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
    );
  } else {
    return res.redirect("/titan-mvp-1.2/form-editor/page-type.html");
  }
});

// Information type handling
router.post("/titan-mvp-1.2/information-type-answer-nf", function (req, res) {
  const mainType = req.body["informationQuestion1"];
  const writtenSubType = req.body["written"];
  const dateSubType = req.body["dateType"];
  const listSubType = req.body["listType"];
  const locationSubType = req.body["locationType"];

  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"];

  if (pageIndex === undefined || !formPages[pageIndex]) {
    console.error("❌ Current page not found in session");
    return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }

  const currentPage = formPages[pageIndex];
  const questionIndex = req.session.data["currentQuestionIndex"] || 0;

  req.session.data["currentQuestionType"] = mainType;
  req.session.data["writtenSubType"] = writtenSubType;
  req.session.data["dateSubType"] = dateSubType;
  req.session.data["listSubType"] = listSubType;
  req.session.data["locationSubType"] = locationSubType;

  const newQuestion = {
    questionId: Date.now(),
    type: mainType,
    subType: listSubType || dateSubType || writtenSubType || locationSubType,
    label: "New question",
    options: [],
  };

  if (mainType === "list" && listSubType === "checkboxes") {
    newQuestion.type = "list";
    newQuestion.subType = "checkboxes";
    newQuestion.options = [];
    if (!currentPage.checkboxList) {
      currentPage.checkboxList = [];
    }
  } else if (mainType === "list" && listSubType === "select") {
    newQuestion.type = "autocomplete";
    newQuestion.subType = "autocomplete";
    newQuestion.options = [];

    // Clear any existing autocomplete session data to prevent old data from appearing
    delete req.session.data["question-label-input-autocomplete"];
    delete req.session.data["hint-text-input-autocomplete"];
    delete req.session.data["autocompleteOptionsData"];
  }

  currentPage.questions.push(newQuestion);
  req.session.data["currentQuestionIndex"] = currentPage.questions.length - 1;
  req.session.data["formPages"] = formPages;

  if (mainType === "list") {
    if (listSubType === "radios") {
      return res.redirect(
        "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit"
      );
    } else if (listSubType === "checkboxes") {
      return res.redirect(
        "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit"
      );
    }
  } else if (mainType === "location") {
    if (locationSubType === "address") {
      return res.redirect("/titan-mvp-1.2/question-configuration");
    } else if (["easting_northing", "os_grid_number", "field_number", "longitude_latitude"].includes(locationSubType)) {
      return res.redirect("/titan-mvp-1.2/question-configuration");
    } else if (locationSubType === "user-choice") {
      return res.redirect("/titan-mvp-1.2/question-configuration");
    }
  }

  res.redirect("/titan-mvp-1.2/question-configuration");
});

// Question configuration
router.get("/titan-mvp-1.2/question-configuration", function (req, res) {
  const formData = req.session.data || {};
  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const pageNumber = pageIndex + 1;
  const questionIndex = req.session.data["currentQuestionIndex"] || 0;
  const questionNumber = questionIndex + 1;

  const mainType = req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];
  const locationSubType = req.session.data["locationSubType"];

  let templateToRender =
    "/titan-mvp-1.2/form-editor/question-type/default.html";

  if (mainType === "text") {
    if (writtenSubType === "short-answer-nf") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/shorttext/edit-nf.html";
    } else if (writtenSubType === "long-answer") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/textarea/edit-nf.html";
    } else if (writtenSubType === "numbers") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/numbers/edit-nf.html";
    }
  } else if (mainType === "date") {
    if (dateSubType === "day-month-year") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/date/edit-nf.html";
    } else if (dateSubType === "month-year") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/date-mmyy/edit-nf.html";
    }
  } else if (mainType === "location") {
    if (locationSubType === "address") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/address/edit-nf.html";
    } else if (["easting_northing", "os_grid_number", "field_number", "longitude_latitude"].includes(locationSubType)) {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/precise-location/edit-nf.html";
    } else if (locationSubType === "user-choice") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/location-user-choice/edit-nf.html";
    }
  } else if (mainType === "address") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/address/edit-nf.html";
  } else if (mainType === "phone") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/phone/edit-nf.html";
  } else if (mainType === "file") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/fileupload/edit-nf.html";
  } else if (mainType === "email") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/email/edit-nf.html";
  } else if (mainType === "declaration") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/declaration/edit-nf.html";
  } else if (mainType === "payment") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/payment/edit-nf-v3.html";
  } else if (
    (mainType === "list" && listSubType === "select") ||
    mainType === "autocomplete" ||
    listSubType === "autocomplete"
  ) {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/autocomplete-nf/edit.html";
  } else if (mainType === "list") {
    if (listSubType === "yes-no") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/yesno/edit-nf.html";
    } else if (listSubType === "checkboxes") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit.html";
    } else if (listSubType === "radios") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit.html";
    }
  }

  // Get current page data
  const formPages = formData.formPages || [];
  const currentPage = formPages[pageIndex] || {};

  // Get available questions for conditions (needed for payment amounts with conditions)
  const availableQuestions = formPages
    .flatMap((page) => page.questions)
    .filter((question) => {
      const type = question.subType || question.type;
      return ["radios", "checkboxes", "yes-no", "autocomplete"].includes(type);
    })
    .map((question) => ({
      value: question.questionId,
      text: question.label,
      type: question.subType || question.type,
      options: question.options,
    }));

  // Get existing conditions for payment amounts (form-level and page-level)
  const existingConditions = [];
  // Add form-level conditions first
  if (formData.conditions) {
    existingConditions.push(
      ...formData.conditions.map((condition) => ({
        value: condition.id.toString(),
        text: condition.conditionName,
        hint: {
          text: condition.rules
            .map(
              (rule) =>
                `${rule.questionText} ${rule.operator} ${
                  Array.isArray(rule.value)
                    ? rule.value.join(" or ")
                    : rule.value
                }`
            )
            .join(" AND "),
        },
      }))
    );
  }
  // Add page-level conditions from all pages
  formPages.forEach((page) => {
    if (page.conditions) {
      existingConditions.push(
        ...page.conditions.map((condition) => ({
          value: condition.id.toString(),
          text: condition.conditionName,
          hint: {
            text: condition.rules
              .map(
                (rule) =>
                  `${rule.questionText} ${rule.operator} ${
                    Array.isArray(rule.value)
                      ? rule.value.join(" or ")
                      : rule.value
                  }`
              )
              .join(" AND "),
          },
        }))
      );
    }
  });

  // Combine default option and existingConditions for the select
  const selectItems = [
    { value: "", text: "Select existing condition" },
    ...existingConditions,
  ];

  res.render(templateToRender, {
    form: {
      name: formData.formName || "Form name",
    },
    pageNumber: pageNumber,
    questionNumber: questionNumber,
    data: req.session.data,
    currentPage: currentPage,
    availableQuestions: availableQuestions,
    existingConditions: existingConditions,
    selectItems: selectItems,
  });
});

// Question configuration save
router.post("/titan-mvp-1.2/question-configuration-save", function (req, res) {
  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"];
  const currentPage = formPages[pageIndex] || { questions: [] };

  if (!currentPage.questions) {
    currentPage.questions = [];
  }

  // Prefer explicit body field (when provided) otherwise session
  const questionType = req.body["questionType"] || req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];
  const locationSubType = req.session.data["locationSubType"];

  let finalSubType = null;
  if (questionType === "text") {
    finalSubType = writtenSubType;
  } else if (questionType === "date") {
    finalSubType = dateSubType;
  } else if (questionType === "list") {
    if (listSubType === "select") {
      finalSubType = "autocomplete";
    } else {
      finalSubType = listSubType;
    }
  } else if (questionType === "location") {
    if (locationSubType === "address") {
      finalSubType = "address";
    } else if (["easting_northing", "os_grid_number", "field_number", "longitude_latitude"].includes(locationSubType)) {
      finalSubType = "precise-location";
    } else if (locationSubType === "user-choice") {
      finalSubType = "location-user-choice";
    }
  } else if (questionType === "address") {
    finalSubType = "address";
  } else if (questionType === "autocomplete") {
    finalSubType = "autocomplete";
  } else if (questionType === "payment") {
    finalSubType = "payment";
  }

  let questionLabel = "";
  switch (questionType) {
    case "phone":
      questionLabel = req.body["questionLabelInputPhone"] || "Phone number";
      break;
    case "text":
      if (writtenSubType === "short-answer-nf") {
        questionLabel =
          req.body["questionLabelInputShortText"] || "Short answer";
      } else if (writtenSubType === "long-answer") {
        questionLabel = req.body["questionLabelInputTextArea"] || "Long answer";
      } else if (writtenSubType === "numbers") {
        questionLabel = req.body["questionLabelInputNumbers"] || "Numbers only";
      } else {
        questionLabel = req.body["questionLabelInputText"] || "Text question";
      }
      break;
    case "email":
      questionLabel = req.body["questionLabelInputEmail"] || "Email address";
      break;
    case "date":
      questionLabel = req.body["questionLabelInputDate"] || "Date question";
      break;
    case "location":
      // Precise location label input
      questionLabel = req.body["questionLabelInputPreciseLocation"] || req.body["questionLabelInputLocationUserChoice"] || "Location";
      break;
    case "address":
      questionLabel = req.body["questionLabelInputAddress"] || "Address";
      break;
    case "file":
      questionLabel = req.body["multiQuestionLabelInputFile"] || "File upload";
      break;
    case "declaration":
      questionLabel =
        req.body["questionLabelInputDeclaration"] || "Declaration";
      break;
    case "payment":
      questionLabel =
        req.body["questionLabelInputPayment"] || "Payment";
      break;
    case "list":
      if (listSubType === "yes-no") {
        questionLabel =
          req.body["questionLabelInputYesno"] || "Yes/No question";
      } else if (listSubType === "checkboxes") {
        questionLabel =
          req.body["multiQuestionLabelInputCheckboxes"] ||
          "Checkboxes question";
      } else if (listSubType === "radios") {
        questionLabel =
          req.body["multiQuestionLabelInputRadios"] || "Radios question";
      } else if (listSubType === "select" || listSubType === "autocomplete") {
        questionLabel =
          req.body["questionLabelInputAutocomplete"] ||
          req.body["question-label-input-autocomplete"] ||
          "Select an option";
      } else {
        questionLabel = req.body["questionLabelInputList"] || "List question";
      }
      break;
    case "autocomplete":
      questionLabel =
        req.body["questionLabelInputAutocomplete"] ||
        req.body["question-label-input-autocomplete"] ||
        "Select an option";
      break;
    default:
      questionLabel =
        req.body["questionLabelInputAutocomplete"] ||
        req.body["question-label-input-autocomplete"] ||
        "Test question";
      break;
  }

  let questionHint = "";
  if (questionType === "address") {
    questionHint = req.body["hintTextInputAddress"] || "";
  } else if (questionType === "location") {
    questionHint = req.body["hintTextInputPreciseLocation"] || req.body["hintTextInputLocationUserChoice"] || "";
  } else if (
    (questionType === "list" &&
      (listSubType === "select" || listSubType === "autocomplete")) ||
    questionType === "autocomplete"
  ) {
    questionHint =
      req.body["hintTextInputAutocomplete"] ||
      req.body["hint-text-input-autocomplete"] ||
      "";
  } else {
    questionHint = req.body["questionHintInput"] || "";
  }

  let questionOptions = [];

  if (questionType === "list" && listSubType === "radios") {
    questionOptions = [...(currentPage.radioList || [])];
  } else if (questionType === "list" && listSubType === "checkboxes") {
    const existingQuestionIndex = req.session.data["currentQuestionIndex"];
    const existingQuestion =
      currentPage.questions &&
      Array.isArray(currentPage.questions) &&
      currentPage.questions[existingQuestionIndex]
        ? currentPage.questions[existingQuestionIndex]
        : {};
    questionOptions = existingQuestion.options || [];
  } else if (questionType === "list" && listSubType === "select") {
    try {
      questionOptions = JSON.parse(req.body.autocompleteOptionsData || "[]");
    } catch (e) {
      questionOptions = [];
    }
  } else if (questionType === "autocomplete") {
    try {
      questionOptions = JSON.parse(req.body.autocompleteOptionsData || "[]");
    } catch (e) {
      questionOptions = [];
    }
  }

  // If questionOptions is still empty for autocomplete/list questions, try to get from existing question or session
  if (
    questionOptions.length === 0 &&
    ((questionType === "list" && listSubType === "select") ||
      questionType === "autocomplete")
  ) {
    // First try existing question
    const existingQuestionIndex = req.session.data["currentQuestionIndex"];
    const existingQuestion =
      currentPage.questions &&
      Array.isArray(currentPage.questions) &&
      currentPage.questions[existingQuestionIndex]
        ? currentPage.questions[existingQuestionIndex]
        : {};
    if (existingQuestion && existingQuestion.options) {
      questionOptions = existingQuestion.options;
    } else {
      // Try to get from session autocompleteOptionsData
      const sessionOptionsData = req.session.data["autocompleteOptionsData"];
      if (sessionOptionsData) {
        try {
          questionOptions = JSON.parse(sessionOptionsData);
        } catch (e) {
          // Silently handle parsing errors
        }
      }
    }
  }

  // Normalize autocomplete options to always be objects with label and value
  if (
    (questionType === "list" && listSubType === "select") ||
    questionType === "autocomplete"
  ) {
    questionOptions = questionOptions.map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      } else if (typeof opt === "object" && opt !== null) {
        return {
          label: opt.label || opt.value || "",
          value: opt.value || opt.label || "",
        };
      } else {
        return { label: String(opt), value: String(opt) };
      }
    });
  }

  // --- AUTOCOMPLETE CONFLICT DETECTION LOGIC ---
  if (
    (questionType === "list" && listSubType === "select") ||
    questionType === "autocomplete"
  ) {
    // Build newItems from the new question options first
    const newItems = questionOptions.map((opt) =>
      typeof opt === "string" ? opt : opt.value || opt.label
    );

    // Find the old options for this question
    const existingQuestionIndex = req.session.data["currentQuestionIndex"];
    const existingQuestion =
      currentPage.questions &&
      Array.isArray(currentPage.questions) &&
      currentPage.questions[existingQuestionIndex]
        ? currentPage.questions[existingQuestionIndex]
        : {};
    const oldOptions =
      existingQuestion && existingQuestion.options
        ? existingQuestion.options
        : [];
    const oldValues = oldOptions.map((opt) =>
      typeof opt === "string" ? opt : opt.value || opt.label
    );
    const newValues = questionOptions.map((opt) =>
      typeof opt === "string" ? opt : opt.value || opt.label
    );
    const removedItems = oldValues.filter((val) => !newValues.includes(val));

    // Check form-level conditions for references to removed items
    const formData = req.session.data || {};
    const conditions = formData.conditions || [];
    const conflicts = [];

    for (const condition of conditions) {
      const referencedItems = [];
      for (const rule of condition.rules || []) {
        // Only check rules for this question (by label or questionId)
        if (
          rule.questionText === questionLabel ||
          rule.questionId === (existingQuestion && existingQuestion.questionId)
        ) {
          if (Array.isArray(rule.value)) {
            referencedItems.push(
              ...rule.value.filter((val) => removedItems.includes(val))
            );
          } else if (removedItems.includes(rule.value)) {
            referencedItems.push(rule.value);
          }
        }
      }
      if (referencedItems.length > 0) {
        // Create a separate conflict entry for each referenced item
        referencedItems.forEach((item) => {
          // Try to find a similar item in the new options for suggestion
          const suggestedNewItem =
            newItems.find(
              (newItem) =>
                newItem.toLowerCase().includes(item.toLowerCase()) ||
                item.toLowerCase().includes(newItem.toLowerCase())
            ) ||
            newItems[0] ||
            "";

          conflicts.push({
            originalItem: item,
            suggestedNewItem,
            conditionName: condition.conditionName,
            editUrl: `/titan-mvp-1.2/form-editor/conditions/edit/${condition.id}`,
            removeUrl: `/titan-mvp-1.2/form-editor/conditions/delete/${condition.id}`,
          });
        });
      }
    }
    if (conflicts.length > 0) {
      // Store conflicts in session for the GET route
      req.session.data.conflicts = conflicts;
      req.session.data.pendingNewItems = newItems;
      req.session.data.pendingQuestionOptions = questionOptions;

      return res.render(
        "titan-mvp-1.2/form-editor/question-type/autocomplete-nf/resolve-list-conflicts",
        {
          conflicts,
          newItems,
          question: {
            label: questionLabel,
            options: questionOptions,
          },
          form: { name: formData.formName || "Form name" },
        }
      );
    }
  }
  // --- END AUTOCOMPLETE CONFLICT DETECTION LOGIC ---

  let existingQuestionIndex = req.session.data["currentQuestionIndex"];
  if (
    existingQuestionIndex !== undefined &&
    currentPage.questions &&
    Array.isArray(currentPage.questions) &&
    currentPage.questions[existingQuestionIndex]
  ) {
    currentPage.questions[existingQuestionIndex].label = questionLabel;
    currentPage.questions[existingQuestionIndex].hint = questionHint;
    currentPage.questions[existingQuestionIndex].options = questionOptions;

    // Update subType if finalSubType is set
    if (finalSubType) {
      currentPage.questions[existingQuestionIndex].subType = finalSubType;
    }

    // Update declaration-specific fields for existing questions
    if (questionType === "declaration") {
      currentPage.questions[existingQuestionIndex].declarationText =
        req.body["declarationTextInput"] ||
        "I declare that the information I have provided is true and accurate to the best of my knowledge.";
      currentPage.questions[existingQuestionIndex].errorMessage =
        req.body["errorMessageInputDeclaration"] ||
        "You must confirm this declaration to continue";
      currentPage.questions[existingQuestionIndex].isOptional =
        req.body["makeOptionalDeclaration"] === "true";
    }

    // Update payment-specific fields for existing questions
    if (questionType === "payment") {
      // Handle multiple payment amounts
      const paymentAmountsData = req.body["paymentAmounts"];
      if (paymentAmountsData) {
        try {
          const amounts = JSON.parse(paymentAmountsData);

          // Save any new conditions to the conditions manager
          req.session.data.conditions = req.session.data.conditions || [];
          const updatedAmounts = amounts.map((amountItem, index) => {
            const updatedAmount = { ...amountItem };
            if (amountItem.condition && amountItem.condition.rules && !amountItem.condition.isExisting && !amountItem.condition.id) {
              // This is a new condition, save it to the manager
              const newCondition = {
                id: Date.now() + index, // Generate unique ID
                conditionName: amountItem.condition.conditionName,
                rules: amountItem.condition.rules.map((rule) => ({
                  questionText: rule.questionText,
                  operator: rule.operator,
                  value: rule.value,
                  logicalOperator: rule.logicalOperator,
                })),
                text: amountItem.condition.rules
                  .map((rule) => {
                    const valueText = Array.isArray(rule.value)
                      ? rule.value.map((v) => `'${v}'`).join(" or ")
                      : `'${rule.value}'`;
                    return `${rule.questionText} ${rule.operator} ${valueText}`;
                  })
                  .join(" "),
              };

              // Check if condition already exists (by name)
              const alreadyExists = req.session.data.conditions.some(
                (c) => c.conditionName === newCondition.conditionName
              );
              if (!alreadyExists) {
                req.session.data.conditions.push(newCondition);
                // Update the condition in the amount to reference the saved condition
                updatedAmount.condition = {
                  ...amountItem.condition,
                  id: newCondition.id,
                  isExisting: true
                };
              } else {
                // Use existing condition ID
                const existingCondition = req.session.data.conditions.find(
                  (c) => c.conditionName === newCondition.conditionName
                );
                if (existingCondition) {
                  updatedAmount.condition = {
                    ...amountItem.condition,
                    id: existingCondition.id,
                    isExisting: true
                  };
                }
              }
            }
            return updatedAmount;
          });

          currentPage.questions[existingQuestionIndex].paymentAmounts = updatedAmounts;
          // Set default paymentAmount to first amount for backward compatibility
          currentPage.questions[existingQuestionIndex].paymentAmount =
            amounts.length > 0 ? amounts[0].amount : "0.00";
        } catch (e) {
          console.error("Error parsing payment amounts:", e);
          // Fallback to single amount if parsing fails
          currentPage.questions[existingQuestionIndex].paymentAmount =
            req.body["paymentAmountInput"] || "0.00";
        }
      } else {
        // Fallback to single amount for backward compatibility
        currentPage.questions[existingQuestionIndex].paymentAmount =
          req.body["paymentAmountInput"] || "0.00";
      }

      currentPage.questions[existingQuestionIndex].paymentDescription =
        req.body["paymentDescriptionInput"] || "Payment description";
      currentPage.questions[existingQuestionIndex].errorMessage =
        req.body["errorMessageInputPayment"] || "payment";

      // Handle API keys - only update if they're not masked values
      const testApiKeyValue = req.body["testApiKey"];
      const liveApiKeyValue = req.body["liveApiKey"];

      // If the value is the masked string, keep the existing value; otherwise update it
      if (testApiKeyValue && testApiKeyValue !== "••••••••••••••••••••••••••••••••") {
        currentPage.questions[existingQuestionIndex].testApiKey = testApiKeyValue;
      } else if (testApiKeyValue === "") {
        // If empty string, clear the API key
        currentPage.questions[existingQuestionIndex].testApiKey = "";
      }
      // If masked value, keep existing value unchanged

      if (liveApiKeyValue && liveApiKeyValue !== "••••••••••••••••••••••••••••••••") {
        currentPage.questions[existingQuestionIndex].liveApiKey = liveApiKeyValue;
      } else if (liveApiKeyValue === "") {
        // If empty string, clear the API key
        currentPage.questions[existingQuestionIndex].liveApiKey = "";
      }
      // If masked value, keep existing value unchanged
    }

    // Update address-specific fields for existing questions (covers address and location/address)
    {
      const postcodeLookupRaw =
        req.body["postcodeLookup"] ?? req.body["postcode-lookup"] ?? req.body["postcodeLookup[]"];
      const postcodeLookup = Array.isArray(postcodeLookupRaw)
        ? postcodeLookupRaw.includes("postcodeLookup") || postcodeLookupRaw.includes("true") || postcodeLookupRaw.includes("on")
        : Boolean(postcodeLookupRaw && (postcodeLookupRaw === "postcodeLookup" || postcodeLookupRaw === "true" || postcodeLookupRaw === "on"));

      const isAddressQuestion =
        questionType === "address" || (questionType === "location" && locationSubType === "address");

      if (isAddressQuestion) {
        currentPage.questions[existingQuestionIndex].postcodeLookup = postcodeLookup;
        currentPage.questions[existingQuestionIndex].errorMessage = req.body["errorMessageInputAddress"] || "";
        currentPage.questions[existingQuestionIndex].isOptional = req.body["makeOptional"] === "optional";
      }
    }

    // Update location-specific fields for existing questions
    if (questionType === "location") {
      const addl = req.body["additionalSettings"];
      const additional = Array.isArray(addl) ? addl : (addl ? [addl] : []);
      const showHelp = additional.includes("add-help-text");
      const makeOptional = additional.includes("make-optional");
      currentPage.questions[existingQuestionIndex].helpText = req.body["helpTextInputPreciseLocation"] || req.body["helpTextInputLocationUserChoice"] || "";
      currentPage.questions[existingQuestionIndex].showHelp = showHelp && !!currentPage.questions[existingQuestionIndex].helpText;
      currentPage.questions[existingQuestionIndex].isOptional = makeOptional;
      currentPage.questions[existingQuestionIndex].hint = req.body["hintTextInputPreciseLocation"] || req.body["hintTextInputLocationUserChoice"] || "";
      currentPage.questions[existingQuestionIndex].errorMessage = req.body["errorMessageInputPreciseLocation"] || req.body["errorMessageInputLocationUserChoice"] || "";

      // Update location methods for user-choice type
      const existingSubType = currentPage.questions[existingQuestionIndex].subType;
      if (locationSubType === "user-choice" || finalSubType === "location-user-choice" || existingSubType === "location-user-choice" || existingSubType === "user-choice") {
        const locationMethodsRaw = req.body["locationMethods"];
        const locationMethods = Array.isArray(locationMethodsRaw)
          ? locationMethodsRaw
          : (locationMethodsRaw ? [locationMethodsRaw] : []);
        const acceptAll = locationMethods.includes("accept_all");
        if (acceptAll) {
          currentPage.questions[existingQuestionIndex].acceptAllLocationTypes = true;
          currentPage.questions[existingQuestionIndex].locationMethods = ["address", "easting_northing", "os_grid_number", "field_number", "longitude_latitude"];
        } else {
          currentPage.questions[existingQuestionIndex].acceptAllLocationTypes = false;
          currentPage.questions[existingQuestionIndex].locationMethods = locationMethods.filter(m => m !== "accept_all");
        }
      }
    }
  } else {
    const newQuestion = {
      questionId: Date.now(),
      label: questionLabel,
      hint: questionHint,
      type: questionType,
      subType: finalSubType,
      options: questionOptions,
    };

    // Add declaration-specific fields
    if (questionType === "declaration") {
      newQuestion.declarationText =
        req.body["declarationTextInput"] ||
        "I declare that the information I have provided is true and accurate to the best of my knowledge.";
      newQuestion.errorMessage =
        req.body["errorMessageInputDeclaration"] ||
        "You must confirm this declaration to continue";
      newQuestion.isOptional = req.body["makeOptionalDeclaration"] === "true";
    }

    // Add payment-specific fields
    if (questionType === "payment") {
      // Handle multiple payment amounts
      const paymentAmountsData = req.body["paymentAmounts"];
      if (paymentAmountsData) {
        try {
          const amounts = JSON.parse(paymentAmountsData);

          // Save any new conditions to the conditions manager
          req.session.data.conditions = req.session.data.conditions || [];
          const updatedAmounts = amounts.map((amountItem, index) => {
            const updatedAmount = { ...amountItem };
            if (amountItem.condition && amountItem.condition.rules && !amountItem.condition.isExisting && !amountItem.condition.id) {
              // This is a new condition, save it to the manager
              const newCondition = {
                id: Date.now() + index, // Generate unique ID
                conditionName: amountItem.condition.conditionName,
                rules: amountItem.condition.rules.map((rule) => ({
                  questionText: rule.questionText,
                  operator: rule.operator,
                  value: rule.value,
                  logicalOperator: rule.logicalOperator,
                })),
                text: amountItem.condition.rules
                  .map((rule) => {
                    const valueText = Array.isArray(rule.value)
                      ? rule.value.map((v) => `'${v}'`).join(" or ")
                      : `'${rule.value}'`;
                    return `${rule.questionText} ${rule.operator} ${valueText}`;
                  })
                  .join(" "),
              };

              // Check if condition already exists (by name)
              const alreadyExists = req.session.data.conditions.some(
                (c) => c.conditionName === newCondition.conditionName
              );
              if (!alreadyExists) {
                req.session.data.conditions.push(newCondition);
                // Update the condition in the amount to reference the saved condition
                updatedAmount.condition = {
                  ...amountItem.condition,
                  id: newCondition.id,
                  isExisting: true
                };
              } else {
                // Use existing condition ID
                const existingCondition = req.session.data.conditions.find(
                  (c) => c.conditionName === newCondition.conditionName
                );
                if (existingCondition) {
                  updatedAmount.condition = {
                    ...amountItem.condition,
                    id: existingCondition.id,
                    isExisting: true
                  };
                }
              }
            }
            return updatedAmount;
          });

          newQuestion.paymentAmounts = updatedAmounts;
          // Set default paymentAmount to first amount for backward compatibility
          newQuestion.paymentAmount =
            amounts.length > 0 ? amounts[0].amount : "0.00";
        } catch (e) {
          console.error("Error parsing payment amounts:", e);
          // Fallback to single amount if parsing fails
          newQuestion.paymentAmount =
            req.body["paymentAmountInput"] || "0.00";
        }
      } else {
        // Fallback to single amount for backward compatibility
        newQuestion.paymentAmount =
          req.body["paymentAmountInput"] || "0.00";
      }

      newQuestion.paymentDescription =
        req.body["paymentDescriptionInput"] || "Payment description";
      newQuestion.errorMessage =
        req.body["errorMessageInputPayment"] || "payment";
      newQuestion.testApiKey =
        req.body["testApiKey"] || "";
      newQuestion.liveApiKey =
        req.body["liveApiKey"] || "";
    }

    // Add address-specific fields (covers address and location/address)
    {
      const postcodeLookupRaw =
        req.body["postcodeLookup"] ?? req.body["postcode-lookup"] ?? req.body["postcodeLookup[]"];
      const postcodeLookup = Array.isArray(postcodeLookupRaw)
        ? postcodeLookupRaw.includes("postcodeLookup") || postcodeLookupRaw.includes("true") || postcodeLookupRaw.includes("on")
        : Boolean(postcodeLookupRaw && (postcodeLookupRaw === "postcodeLookup" || postcodeLookupRaw === "true" || postcodeLookupRaw === "on"));

      const isAddressQuestion =
        questionType === "address" || (questionType === "location" && locationSubType === "address");

      if (isAddressQuestion) {
        newQuestion.postcodeLookup = postcodeLookup;
        newQuestion.errorMessage = req.body["errorMessageInputAddress"] || "";
        newQuestion.isOptional = req.body["makeOptional"] === "optional";
      }
    }

    // Add location-specific fields
    if (questionType === "location") {
      const addl = req.body["additionalSettings"];
      const additional = Array.isArray(addl) ? addl : (addl ? [addl] : []);
      const showHelp = additional.includes("add-help-text");
      const makeOptional = additional.includes("make-optional");
      newQuestion.helpText = req.body["helpTextInputPreciseLocation"] || req.body["helpTextInputLocationUserChoice"] || "";
      newQuestion.showHelp = showHelp && !!newQuestion.helpText;
      newQuestion.isOptional = makeOptional;
      newQuestion.hint = req.body["hintTextInputPreciseLocation"] || req.body["hintTextInputLocationUserChoice"] || "";
      newQuestion.errorMessage = req.body["errorMessageInputPreciseLocation"] || req.body["errorMessageInputLocationUserChoice"] || "";

      // Save location methods for user-choice type
      if (locationSubType === "user-choice" || finalSubType === "location-user-choice") {
        const locationMethodsRaw = req.body["locationMethods"];
        const locationMethods = Array.isArray(locationMethodsRaw)
          ? locationMethodsRaw
          : (locationMethodsRaw ? [locationMethodsRaw] : []);
        const acceptAll = locationMethods.includes("accept_all");
        if (acceptAll) {
          newQuestion.acceptAllLocationTypes = true;
          newQuestion.locationMethods = ["address", "easting_northing", "os_grid_number", "field_number", "longitude_latitude"];
        } else {
          newQuestion.acceptAllLocationTypes = false;
          newQuestion.locationMethods = locationMethods.filter(m => m !== "accept_all");
        }
      }
    }

    currentPage.questions.push(newQuestion);
  }

  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  res.redirect("/titan-mvp-1.2/page-overview");
});

// Page overview
router.get("/titan-mvp-1.2/page-overview", function (req, res) {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;
  const pageNumber = pageIndex + 1;

  const currentPage = formPages[pageIndex];
  const sections = formData.sections || [];

  res.render("titan-mvp-1.2/form-editor/page-overview.html", {
    form: {
      name: formData.formName || "Form name",
    },
    pageNumber: pageNumber,
    currentPage: currentPage,
    sections: sections,
  });
});

// Edit page
router.get("/titan-mvp-1.2/edit-page/:pageId", function (req, res) {
  const pageId = req.params.pageId;
  const formPages = req.session.data["formPages"] || [];

  // Try to find the page with more flexible matching
  let pageIndex = formPages.findIndex(
    (page) => String(page.pageId) === String(pageId)
  );

  // If not found, try without string conversion (in case pageId is already a number)
  if (pageIndex === -1) {
    pageIndex = formPages.findIndex(
      (page) => page.pageId == pageId
    );
  }

  if (pageIndex === -1) {
    console.error("Page not found in session. PageId:", pageId, "Type:", typeof pageId);
    console.error("Available pages:", formPages.map(p => ({ id: p.pageId, type: typeof p.pageId })));
    return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }

  req.session.data["currentPageIndex"] = pageIndex;

  const pageToEdit = formPages[pageIndex];
  if (pageToEdit.pageType === "question") {
    res.redirect("/titan-mvp-1.2/page-overview");
  } else if (pageToEdit.pageType === "guidance") {
    res.redirect(
      "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
    );
  } else {
    res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }
});

// Edit question
router.get("/titan-mvp-1.2/edit-question", function (req, res) {
  const questionId = (req.query.questionId || "").trim();

  if (!questionId) {
    return res.redirect("/titan-mvp-1.2/page-overview");
  }

  const formPages = req.session.data["formPages"] || [];
  let foundPageIndex = -1;
  let foundQuestionIndex = -1;

  for (let i = 0; i < formPages.length; i++) {
    if (formPages[i].questions && Array.isArray(formPages[i].questions)) {
      const qIndex = formPages[i].questions.findIndex(
        (q) => String(q.questionId) === questionId
      );
      if (qIndex !== -1) {
        foundPageIndex = i;
        foundQuestionIndex = qIndex;
        break;
      }
    }
  }

  if (foundPageIndex === -1) {
    return res.redirect("/titan-mvp-1.2/page-overview");
  }

  req.session.data["currentPageIndex"] = foundPageIndex;
  req.session.data["currentQuestionIndex"] = foundQuestionIndex;

  // Additional safety check
  if (
    !formPages[foundPageIndex].questions ||
    !Array.isArray(formPages[foundPageIndex].questions)
  ) {
    return res.redirect("/titan-mvp-1.2/page-overview");
  }

  const question = formPages[foundPageIndex].questions[foundQuestionIndex];

  // Normalize autocomplete options to always be objects with label and value
  if (
    (question.type === "list" && question.subType === "select") ||
    question.type === "autocomplete"
  ) {
    question.options = (question.options || []).map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, value: opt };
      } else if (typeof opt === "object" && opt !== null) {
        return {
          label: opt.label || opt.value || "",
          value: opt.value || opt.label || "",
        };
      } else {
        return { label: String(opt), value: String(opt) };
      }
    });
  }

  // Always set the session data for the edit form from the specific question being edited
  req.session.data["question-label-input-autocomplete"] = question.label || "";
  req.session.data["hint-text-input-autocomplete"] = question.hint || "";
  req.session.data["autocompleteOptionsData"] = JSON.stringify(
    question.options || []
  );

  req.session.data["currentQuestionType"] = question.type;
  if (question.type === "text") {
    req.session.data["writtenSubType"] = question.subType;
  } else if (question.type === "date") {
    req.session.data["dateSubType"] = question.subType;
  } else if (question.type === "list") {
    req.session.data["listSubType"] = question.subType;
  } else if (question.type === "payment") {
    // Set payment-specific fields for editing
    // Handle payment amounts - support both new multiple amounts and legacy single amount
    if (question.paymentAmounts && Array.isArray(question.paymentAmounts) && question.paymentAmounts.length > 0) {
      // Enrich existing conditions with full condition data
      const formData = req.session.data || {};
      const enrichedAmounts = question.paymentAmounts.map((amountItem) => {
        if (amountItem.condition && amountItem.condition.isExisting && amountItem.condition.conditionId) {
          // Look up the full condition from form-level or page-level conditions
          const conditionId = String(amountItem.condition.conditionId);
          let fullCondition = null;

          // Check form-level conditions
          if (formData.conditions) {
            fullCondition = formData.conditions.find(c => String(c.id) === conditionId);
          }

          // Check page-level conditions if not found
          if (!fullCondition) {
            const allFormPages = formData.formPages || [];
            for (const page of allFormPages) {
              if (page.conditions) {
                fullCondition = page.conditions.find(c => String(c.id) === conditionId);
                if (fullCondition) break;
              }
            }
          }

          // If found, merge the full condition data
          if (fullCondition) {
            return {
              ...amountItem,
              condition: {
                ...amountItem.condition,
                conditionName: fullCondition.conditionName,
                text: fullCondition.text,
                rules: fullCondition.rules
              }
            };
          }
        }
        return amountItem;
      });

      req.session.data["paymentAmounts"] = enrichedAmounts;
      req.session.data["paymentAmountInput"] = enrichedAmounts[0].amount || "";
    } else {
      // Legacy single amount support
      req.session.data["paymentAmountInput"] = question.paymentAmount || "";
      req.session.data["paymentAmounts"] = [{
        amount: question.paymentAmount || "0.00",
        condition: null
      }];
    }
    req.session.data["paymentDescriptionInput"] = question.paymentDescription || "";
    req.session.data["errorMessageInputPayment"] = question.errorMessage || "";

    // Handle API keys - mask them if they exist
    const hasTestApiKey = question.testApiKey && question.testApiKey.trim() !== "";
    const hasLiveApiKey = question.liveApiKey && question.liveApiKey.trim() !== "";

    req.session.data["testApiKey"] = hasTestApiKey ? "••••••••••••••••••••••••••••••••" : "";
    req.session.data["liveApiKey"] = hasLiveApiKey ? "••••••••••••••••••••••••••••••••" : "";
    req.session.data["hasTestApiKey"] = hasTestApiKey;
    req.session.data["hasLiveApiKey"] = hasLiveApiKey;
  }

  res.redirect("/titan-mvp-1.2/question-configuration");
});

// Page overview save
router.post("/titan-mvp-1.2/page-overview", function (req, res) {
  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"] || [];
  const currentPage = formPages[pageIndex] || {
    questions: [],
    pageType: "question",
    pageHeading: "",
    hasGuidance: false,
    guidanceTextarea: "",
    allowMultipleResponses: false,
    setName: "",
    minResponseCount: "",
    maxResponseCount: "",
  };

  const pageHeading = req.body.pageHeading || "";
  const guidanceTextarea = req.body.guidance || "";

  currentPage.hasGuidance = req.body.guidance === "guidance";

  let allowMultipleResponses = req.body.allowMultipleResponses;
  const questionSetName = req.body.questionSetName || "";
  const minResponseCount = req.body.minResponseCount || "";
  const maxResponseCount = req.body.maxResponseCount || "";

  if (Array.isArray(allowMultipleResponses)) {
    allowMultipleResponses = allowMultipleResponses.includes("true")
      ? "true"
      : "false";
  }

  const sectionId = req.body.section;
  if (sectionId) {
    const sections = req.session.data.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      currentPage.section = {
        id: section.id,
        name: section.name,
      };
    }
  } else {
    currentPage.section = null;
  }

  currentPage.pageHeading = pageHeading;
  currentPage.guidanceTextarea = guidanceTextarea;
  currentPage.allowMultipleResponses = allowMultipleResponses === "true";
  currentPage.setName = currentPage.allowMultipleResponses
    ? questionSetName
    : "";
  currentPage.minResponseCount = currentPage.allowMultipleResponses
    ? minResponseCount
    : "";
  currentPage.maxResponseCount = currentPage.allowMultipleResponses
    ? maxResponseCount
    : "";

  if (!currentPage.pageType) {
    currentPage.pageType = "question";
  }

  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  res.redirect("/titan-mvp-1.2/page-overview");
});

// Form creation flow - simple routes without validation
router.get("/titan-mvp-1.2/create-new-form/form-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Generate form ID if not already exists
  if (!req.session.data.formId) {
    req.session.data.formId = `FORM-${Date.now()}`;
  }

  // Log current session data
  console.log("Current session data:", req.session.data);

  res.render("titan-mvp-1.2/create-new-form/form-name", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/form-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store form name from the request body
  const formName = req.body.formName;

  // Update session data
  req.session.data = {
    ...req.session.data,
    formId: req.session.data.formId || `FORM-${Date.now()}`,
    formName: formName,
    formDetails: {
      id: req.session.data.formId || `FORM-${Date.now()}`,
      name: formName,
      createdAt: new Date().toISOString(),
      status: "Draft",
    },
  };

  // Log the updated session data
  console.log("Updated session data after form name:", req.session.data);

  res.redirect("/titan-mvp-1.2/create-new-form/organisation-name");
});

router.get("/titan-mvp-1.2/create-new-form/organisation-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have a form name before proceeding
  if (!req.session.data.formName) {
    return res.redirect("/titan-mvp-1.2/create-new-form/form-name");
  }

  res.render("titan-mvp-1.2/create-new-form/organisation-name", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/organisation-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store organisation name from the request body
  const organisationName = req.body.organisationName;

  // Update session data
  req.session.data = {
    ...req.session.data,
    organisationName: organisationName,
    formDetails: {
      ...req.session.data.formDetails,
      organisation: organisationName,
    },
  };

  // Log the updated session data
  console.log("Updated session data after organisation:", req.session.data);

  res.redirect("/titan-mvp-1.2/create-new-form/policy-sme");
});
router.get("/titan-mvp-1.2/create-new-form/policy-sme", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have the required data before proceeding
  if (!req.session.data.formName || !req.session.data.organisationName) {
    return res.redirect("/titan-mvp-1.2/create-new-form/form-name");
  }

  res.render("titan-mvp-1.2/create-new-form/policy-sme", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/policy-sme", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store team details from the request body
  // Ensure we get the first value if it's an array, or the value itself if it's a string
  const teamName = Array.isArray(req.body.teamName)
    ? req.body.teamName[0]
    : req.body.teamName;
  const email = Array.isArray(req.body.email)
    ? req.body.email[0]
    : req.body.email;

  // Update session data
  req.session.data = {
    ...req.session.data,
    teamName: teamName,
    email: email,
    formDetails: {
      ...req.session.data.formDetails,
      teamName: teamName,
      email: email,
      lastUpdated: new Date().toISOString(),
      status: "Draft", // Set initial status to Draft
    },
  };

  // Add form to library
  try {
    const libraryPath = path.join(__dirname, "data", "form-library.json");
    const libraryData = JSON.parse(fs.readFileSync(libraryPath, "utf8"));

    // Create new form entry
    const newForm = {
      name: req.session.data.formName,
      path: "forms/form-home/report-a-dead-wild-bird-published", // Default path
      organisation: req.session.data.organisationName,
      status: "draft",
      created: {
        date: new Date().toISOString().split("T")[0],
        name: "Chris Smith", // Current user
      },
      updated: {
        date: new Date().toISOString().split("T")[0],
        name: "Chris Smith", // Current user
      },
    };

    // Add to library
    libraryData.push(newForm);

    // Write back to file
    fs.writeFileSync(libraryPath, JSON.stringify(libraryData, null, 2));
  } catch (error) {
    console.error("Error updating form library:", error);
  }

  // Log the final session data
  console.log("Final session data:", req.session.data);

  res.redirect("/titan-mvp-1.2/form-overview/index/");
});

// Overview page route
router.get("/titan-mvp-1.2/form-overview/index/", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Map status to GOV.UK Design System tag colors
  const statusColorMap = {
    Draft: "orange",
    Live: "green",
    Closed: "red",
  };

  const status = formData.formDetails?.status || "Draft";
  const statusColor = statusColorMap[status] || "grey";

  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Create the preview URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;

  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: status,
      color: statusColor,
    },
    previewUrl: previewUrl,
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
  };

  res.render("titan-mvp-1.2/form-overview/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// POC form overview route
router.get("/titan-mvp-1.2/form-overview/poc", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data for POC
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form",
    organisation: {
      name: formData.organisation?.name || "Department for Environment, Food and Rural Affairs"
    },
    team: {
      name: formData.team?.name || "Digital Services Team",
      email: formData.team?.email || "team@defra.gov.uk"
    },
    support: {
      phone: formData.support?.phone || "0300 123 4567",
      email: formData.support?.email || "support@defra.gov.uk",
      link: formData.support?.link || "https://defra.gov.uk/contact"
    },
    nextSteps: formData.nextSteps || "Review and publish your form",
    privacyNotice: formData.privacyNotice || "https://defra.gov.uk/privacy",
    notificationEmail: formData.notificationEmail || "notifications@defra.gov.uk"
  };

  res.render("titan-mvp-1.2/form-overview/poc", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // Check if there's a success message to show
  const showSuccessMessage = req.query.success === 'true';
  const showFeedbackSuccessMessage = req.query.feedbackSuccess === 'true';

  res.render("titan-mvp-1.2/form-overview/submissions/index", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showSuccessMessage: showSuccessMessage,
    showFeedbackSuccessMessage: showFeedbackSuccessMessage
  });
});

// Improved submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions/improved", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // Check if there's a success message to show
  const showSuccessMessage = req.query.success === 'true';
  const showFeedbackSuccessMessage = req.query.feedbackSuccess === 'true';

  res.render("titan-mvp-1.2/form-overview/submissions/index-improved", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showSuccessMessage: showSuccessMessage,
    showFeedbackSuccessMessage: showFeedbackSuccessMessage
  });
});

// Improved-2 submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // Check if there's a success message to show
  const showSuccessMessage = req.query.success === 'true';
  const showFeedbackSuccessMessage = req.query.feedbackSuccess === 'true';

  res.render("titan-mvp-1.2/form-overview/submissions/index-improved-2", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showSuccessMessage: showSuccessMessage,
    showFeedbackSuccessMessage: showFeedbackSuccessMessage
  });
});

// Improved-2 TABLE submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-table", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // Check if there's a success message to show
  const showSuccessMessage = req.query.success === 'true';
  const showFeedbackSuccessMessage = req.query.feedbackSuccess === 'true';
  const showErrorMessage = req.query.success === 'fail';

  res.render("titan-mvp-1.2/form-overview/submissions/index-improved-2-table", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showSuccessMessage: showSuccessMessage,
    showFeedbackSuccessMessage: showFeedbackSuccessMessage,
    showErrorMessage: showErrorMessage
  });
});

// Error version of improved-2 TABLE submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-table-error", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  res.render("titan-mvp-1.2/form-overview/submissions/index-improved-2-table-error", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showErrorMessage: true
  });
});

// Email template route
router.get("/titan-mvp-1.2/form-overview/submissions/email", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  res.render("titan-mvp-1.2/form-overview/submissions/email/index", {
    form: form,
    pageName: `Email - Form submissions data ready for download`
  });
});

// Download index page route
router.get("/titan-mvp-1.2/form-overview/submissions/download/index", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  res.render("titan-mvp-1.2/form-overview/submissions/download/index", {
    form: form,
    pageName: `Download - ${form.name}`
  });
});

// Downloading page route
router.get("/titan-mvp-1.2/form-overview/submissions/download/downloading", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  res.render("titan-mvp-1.2/form-overview/submissions/download/downloading", {
    form: form,
    pageName: `Downloading - ${form.name}`
  });
});

// Attachments download: confirm recipient email (index)
router.get("/titan-mvp-1.2/form-overview/submissions/attachments-download/index", (req, res) => {
  const formData = req.session.data || {};
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // If the link is expired, show the expired page
  if (req.query.expired === "true") {
    return res.render("titan-mvp-1.2/form-overview/submissions/attachments-download/expired", {
      form,
      pageName: `Download attached files - ${form.name}`
    });
  }

  res.render("titan-mvp-1.2/form-overview/submissions/attachments-download/index", {
    form,
    submissionId: req.query.submissionId,
    pageName: `Download attached files - ${form.name}`
  });
});

router.post("/titan-mvp-1.2/form-overview/submissions/attachments-download/index", (req, res) => {
  const formData = req.session.data || {};
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  const submissionId = req.query.submissionId || "ABC123";
  const expectedEmail = "you@example.com";
  const submittedEmail = (req.body.email || "").trim().toLowerCase();

  if (!submittedEmail || submittedEmail !== expectedEmail) {
    return res.render("titan-mvp-1.2/form-overview/submissions/attachments-download/index", {
      form,
      submissionId,
      pageName: `Download attached files - ${form.name}`,
      errorMessage: "This is not the email address the link was sent to."
    });
  }

  res.redirect(`/titan-mvp-1.2/form-overview/submissions/attachments-download/files?submissionId=${encodeURIComponent(submissionId)}`);
});

// Attachments download: files list
router.get("/titan-mvp-1.2/form-overview/submissions/attachments-download/files", (req, res) => {
  const formData = req.session.data || {};
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  const submissionId = req.query.submissionId || "ABC123";

  const base = `/titan-mvp-1.2/form-overview/submissions/attachments-download/file/${encodeURIComponent(submissionId)}`;

  // Mocked attachments (real implementation would fetch by submissionId)
  const attachments = [
    {
      id: "insurance-certificate",
      filename: "insurance-certificate.pdf",
      questionLabel: "Upload your insurance certificate",
      meta: "PDF, 1.2MB",
      sizeBytes: 1200000,
      status: "queued",
      href: `${base}/insurance-certificate?filename=${encodeURIComponent("insurance-certificate.pdf")}&bytes=${encodeURIComponent("1200000")}`,
      downloadName: `${form.name || "Example Form"}_${submissionId}_insurance-certificate.pdf`
    },
    {
      id: "methodology-statement",
      filename: "methodology-statement.docx",
      questionLabel: "Upload methodology statement",
      meta: "Word document, 340KB",
      sizeBytes: 340000,
      status: "queued",
      href: `${base}/methodology-statement?filename=${encodeURIComponent("methodology-statement.docx")}&bytes=${encodeURIComponent("340000")}`,
      downloadName: `${form.name || "Example Form"}_${submissionId}_methodology-statement.docx`
    },
    {
      id: "site-map",
      filename: "site-map.png",
      questionLabel: "Upload a map of the site",
      meta: "PNG, 560KB",
      sizeBytes: 560000,
      status: "queued",
      href: `${base}/site-map?filename=${encodeURIComponent("site-map.png")}&bytes=${encodeURIComponent("560000")}`,
      downloadName: `${form.name || "Example Form"}_${submissionId}_site-map.png`
    }
  ];

  res.render("titan-mvp-1.2/form-overview/submissions/attachments-download/files", {
    form,
    submissionId,
    attachments,
    pageName: `Download attached files - ${form.name}`
  });
});

// Attachments download: serve a stable prototype file
router.get("/titan-mvp-1.2/form-overview/submissions/attachments-download/file/:submissionId/:fileId", (req, res) => {
  const submissionId = req.params.submissionId || "ABC123";
  const fileId = req.params.fileId || "file";

  const filename = (req.query.filename || `${fileId}.txt`).toString();
  const bytes = parseInt((req.query.bytes || "0").toString(), 10);
  const safeBytes = Number.isFinite(bytes) && bytes > 0 ? bytes : 1024;

  // We return plain text content but let the filename drive the download name.
  // This avoids relying on external document services for the prototype.
  const body = [
    `Prototype download`,
    `submissionId: ${submissionId}`,
    `fileId: ${fileId}`,
    `filename: ${filename}`,
    `approxSizeBytes: ${safeBytes}`,
    ``,
    `This is placeholder content for the attachments download journey.`
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/"/g, "")}"`);
  res.send(body);
});

// Attachments download: single download to represent "download all"
router.get("/titan-mvp-1.2/form-overview/submissions/attachments-download/download-all", (req, res) => {
  const submissionId = req.query.submissionId || "ABC123";
  // Prototype: redirects to a stable local download endpoint to simulate "download all"
  res.redirect(
    `/titan-mvp-1.2/form-overview/submissions/attachments-download/file/${encodeURIComponent(submissionId)}/all?filename=${encodeURIComponent(
      `${submissionId}-all-files.txt`
    )}&bytes=1`
  );
});

// Download submissions action (GET and POST) - redirect to downloading page
router.get("/titan-mvp-1.2/form-overview/submissions/download", (req, res) => {
  // Redirect to downloading page
  res.redirect("/titan-mvp-1.2/form-overview/submissions/download/downloading");
});

router.post("/titan-mvp-1.2/form-overview/submissions/download", (req, res) => {
  // Redirect back to submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions?success=true");
});

// Download feedback action (GET and POST)
router.get("/titan-mvp-1.2/form-overview/submissions/download-feedback", (req, res) => {
  // Redirect back to submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions?feedbackSuccess=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/download-feedback", (req, res) => {
  // Redirect back to submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions?feedbackSuccess=true");
});

// Download actions for improved page (GET and POST)
router.get("/titan-mvp-1.2/form-overview/submissions/improved/download", (req, res) => {
  // Redirect back to improved submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved?success=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved/download", (req, res) => {
  // Redirect back to improved submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved?success=true");
});

router.get("/titan-mvp-1.2/form-overview/submissions/improved/download-feedback", (req, res) => {
  // Redirect back to improved submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved?feedbackSuccess=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved/download-feedback", (req, res) => {
  // Redirect back to improved submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved?feedbackSuccess=true");
});

// Download actions for improved-2 page (GET and POST)
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2/download", (req, res) => {
  // Redirect back to improved-2 submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2?success=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved-2/download", (req, res) => {
  // Redirect back to improved-2 submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2?success=true");
});

router.get("/titan-mvp-1.2/form-overview/submissions/improved-2/download-feedback", (req, res) => {
  // Redirect back to improved-2 submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2?feedbackSuccess=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved-2/download-feedback", (req, res) => {
  // Redirect back to improved-2 submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2?feedbackSuccess=true");
});

// Download actions for improved-2 TABLE page (GET and POST)
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-table/download", (req, res) => {
  // Redirect back to improved-2 table submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-table?success=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved-2-table/download", (req, res) => {
  // Redirect back to improved-2 table submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-table?success=true");
});

router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-table/download-feedback", (req, res) => {
  // Redirect back to improved-2 table submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-table?feedbackSuccess=true");
});

// Improved-2 SUMMARY submissions page route
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-summary", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Set up default form data
  const form = {
    id: formData.formId || "example-form",
    name: formData.formName || "Example Form"
  };

  // Check if there's a success message to show
  const showSuccessMessage = req.query.success === 'true';
  const showFeedbackSuccessMessage = req.query.feedbackSuccess === 'true';

  res.render("titan-mvp-1.2/form-overview/submissions/index-improved-2-summary", {
    form: form,
    pageName: `Submissions - ${form.name}`,
    showSuccessMessage: showSuccessMessage,
    showFeedbackSuccessMessage: showFeedbackSuccessMessage
  });
});

// Download actions for improved-2 SUMMARY page (GET and POST)
router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-summary/download", (req, res) => {
  // Redirect back to improved-2 summary submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-summary?success=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved-2-summary/download", (req, res) => {
  // Redirect back to improved-2 summary submissions page with success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-summary?success=true");
});

router.get("/titan-mvp-1.2/form-overview/submissions/improved-2-summary/download-feedback", (req, res) => {
  // Redirect back to improved-2 summary submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-summary?feedbackSuccess=true");
});

router.post("/titan-mvp-1.2/form-overview/submissions/improved-2-summary/download-feedback", (req, res) => {
  // Redirect back to improved-2 summary submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-summary?feedbackSuccess=true");
});
router.post("/titan-mvp-1.2/form-overview/submissions/improved-2-table/download-feedback", (req, res) => {
  // Redirect back to improved-2 table submissions page with feedback success flag
  res.redirect("/titan-mvp-1.2/form-overview/submissions/improved-2-table?feedbackSuccess=true");
});

// Route handler for Livestock registration form
router.get("/titan-mvp-1.2/form-overview/simplified/index-tabs", (req, res) => {
  // Check if this is specifically for Livestock registration
  if (req.query.form === "livestock-registration") {
    // Set up session data for Livestock registration form
    req.session.data = {
      formName: "Livestock registration",
      formDetails: {
        organisation: "Defra",
        teamName: "Livestock team",
        email: "livestock@defra.gov.uk",
        wentLiveAt: "11 August 2025, 10:30am by Chris Smith",
        nextSteps:
          "We will call you within 5 working days to discuss your application.",
        notificationEmail: "notify@defra.gov.uk",
        hasDraft: false,
      },
      // Create the livestock form pages
      formPages: [
        {
          pageId: 1,
          pageType: "question",
          pageHeading: "Business registration details",
          questions: [
            {
              questionId: 1,
              label: "Is your business registered with RPA?",
              hint: "Select yes if you have an RPA registration number",
              type: "list",
              subType: "radios",
              options: [
                { value: "yes", text: "Yes" },
                { value: "no", text: "No" },
              ],
            },
          ],
          order: 1,
        },
        {
          pageId: 2,
          pageType: "question",
          pageHeading: "Livestock information",
          questions: [
            {
              questionId: 2,
              label: "What type of livestock are you registering?",
              hint: "Select all that apply",
              type: "list",
              subType: "checkboxes",
              options: [
                { value: "cattle", text: "Cattle" },
                { value: "sheep", text: "Sheep" },
                { value: "pigs", text: "Pigs" },
                { value: "poultry", text: "Poultry" },
              ],
            },
          ],
          order: 2,
        },
        {
          pageId: 3,
          pageType: "question",
          pageHeading: "Contact details",
          questions: [
            {
              questionId: 3,
              label: "Business name",
              hint: "Enter your registered business name",
              type: "text",
              subType: "short-answer-nf",
            },
            {
              questionId: 4,
              label: "Contact email address",
              hint: "We'll use this to send confirmation",
              type: "email",
            },
            {
              questionId: 5,
              label: "Main phone number",
              hint: "Include area code",
              type: "phone",
            },
          ],
          order: 3,
        },
        {
          pageId: 4,
          pageType: "guidance",
          guidanceOnlyHeadingInput: "Important information",
          guidanceOnlyGuidanceTextInput:
            "Before proceeding, please ensure you have all necessary documentation ready including your business registration certificate and any relevant permits. This form should take approximately 10-15 minutes to complete.",
          order: 4,
        },
        {
          pageId: 5,
          pageType: "question",
          pageHeading: "Location details",
          questions: [
            {
              questionId: 6,
              label: "Business address",
              hint: "Enter your main business address",
              type: "address",
            },
            {
              questionId: 7,
              label: "National Grid reference",
              hint: "If applicable, enter the grid reference for your location",
              type: "text",
              subType: "short-answer-nf",
            },
          ],
          order: 5,
        },
        {
          pageId: 6,
          pageType: "question",
          pageHeading: "Documentation",
          questions: [
            {
              questionId: 8,
              label: "Upload methodology statement",
              hint: "PDF, Word or image files accepted. Maximum 10MB.",
              type: "file",
            },
          ],
          order: 6,
        },
      ],
    };
  }

  const formData = req.session.data || {};

  // Create the preview URL
  const urlFriendlyName = (formData.formName || "Form name")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
  const liveUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/live/${urlFriendlyName}`;

  // Check if we should show live-draft status (after creating a draft)
  const shouldShowLiveDraft = formData.formDetails?.hasDraft === true;

  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Employee Onboarding",
    status: {
      text: shouldShowLiveDraft ? "Live-Draft" : "Live",
      color: shouldShowLiveDraft ? "blue" : "green",
    },
    previewUrl: previewUrl,
    liveUrl: liveUrl,
    wentLiveAt:
      formData.formDetails?.wentLiveAt || "8 May 2024, 2:45pm by Emily Wong",
    organisation: {
      name: formData.formDetails?.organisation || "Defra",
    },
    team: {
      name: formData.formDetails?.teamName || "Dev team",
      email: formData.formDetails?.email || "eng@acme.com",
    },
    support: {
      phone: formData.formDetails?.support?.phone || "987654321",
      email: formData.formDetails?.support?.email || "support@defra.com",
      link: formData.formDetails?.support?.link,
    },
    nextSteps:
      formData.formDetails?.nextSteps ||
      "We will call you within 5 working days to discuss your application.",
    privacyNotice: formData.formDetails?.privacyNotice,
    notificationEmail:
      formData.formDetails?.notificationEmail || "notify@defra.gov.uk",
  };

  // Add draft settings if they exist
  const draftSettings = formData.draftSettings || {};

  res.render("titan-mvp-1.2/form-overview/simplified/index-tabs", {
    form: form,
    draftSettings: draftSettings,
    pageName: `Overview - ${form.name}`,
  });
});

// Add .html route for index-tabs
router.get(
  "/titan-mvp-1.2/form-overview/simplified/index-tabs.html",
  (req, res) => {
    // Check if this is specifically for Livestock registration
    if (req.query.form === "livestock-registration") {
      // Set up session data for Livestock registration form
      req.session.data = {
        formName: "Livestock registration",
        formDetails: {
          organisation: "Defra",
          teamName: "Livestock team",
          email: "livestock@defra.gov.uk",
          wentLiveAt: "11 August 2025, 10:30am by Chris Smith",
          nextSteps:
            "We will call you within 5 working days to discuss your application.",
          notificationEmail: "notify@defra.gov.uk",
          hasDraft: false,
        },
        // Create the livestock form pages
        formPages: [
          {
            pageId: 1,
            pageType: "question",
            pageHeading: "Business registration details",
            questions: [
              {
                questionId: 1,
                label: "Is your business registered with RPA?",
                hint: "Select yes if you have an RPA registration number",
                type: "list",
                subType: "radios",
                options: [
                  { value: "yes", text: "Yes" },
                  { value: "no", text: "No" },
                ],
              },
            ],
            order: 1,
          },
          {
            pageId: 2,
            pageType: "question",
            pageHeading: "Livestock information",
            questions: [
              {
                questionId: 2,
                label: "What type of livestock are you registering?",
                hint: "Select all that apply",
                type: "list",
                subType: "checkboxes",
                options: [
                  { value: "cattle", text: "Cattle" },
                  { value: "sheep", text: "Sheep" },
                  { value: "pigs", text: "Pigs" },
                  { value: "poultry", text: "Poultry" },
                ],
              },
            ],
            order: 2,
          },
          {
            pageId: 3,
            pageType: "question",
            pageHeading: "Contact details",
            questions: [
              {
                questionId: 3,
                label: "Business name",
                hint: "Enter your registered business name",
                type: "text",
                subType: "short-answer-nf",
              },
              {
                questionId: 4,
                label: "Contact email address",
                hint: "We'll use this to send confirmation",
                type: "email",
              },
              {
                questionId: 5,
                label: "Main phone number",
                hint: "Include area code",
                type: "phone",
              },
            ],
            order: 3,
          },
          {
            pageId: 4,
            pageType: "guidance",
            guidanceOnlyHeadingInput: "Important information",
            guidanceOnlyGuidanceTextInput:
              "Before proceeding, please ensure you have all necessary documentation ready including your business registration certificate and any relevant permits. This form should take approximately 10-15 minutes to complete.",
            order: 4,
          },
          {
            pageId: 5,
            pageType: "question",
            pageHeading: "Location details",
            questions: [
              {
                questionId: 6,
                label: "Business address",
                hint: "Enter your main business address",
                type: "address",
              },
              {
                questionId: 7,
                label: "National Grid reference",
                hint: "If applicable, enter the grid reference for your location",
                type: "text",
                subType: "short-answer-nf",
              },
            ],
            order: 5,
          },
          {
            pageId: 6,
            pageType: "question",
            pageHeading: "Documentation",
            questions: [
              {
                questionId: 8,
                label: "Upload methodology statement",
                hint: "PDF, Word or image files accepted. Maximum 10MB.",
                type: "file",
              },
            ],
            order: 6,
          },
        ],
      };
    }

    const formData = req.session.data || {};

    // Create the preview URL
    const urlFriendlyName = (formData.formName || "Form name")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
    const liveUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/live/${urlFriendlyName}`;

    // Check if we should show live-draft status (after creating a draft)
    const shouldShowLiveDraft = formData.formDetails?.hasDraft === true;

    // Create the form object that the templates expect
    const form = {
      name: formData.formName || "Employee Onboarding",
      status: {
        text: shouldShowLiveDraft ? "Live-Draft" : "Live",
        color: shouldShowLiveDraft ? "blue" : "green",
      },
      previewUrl: previewUrl,
      liveUrl: liveUrl,
      wentLiveAt:
        formData.formDetails?.wentLiveAt || "8 May 2024, 2:45pm by Emily Wong",
      organisation: {
        name: formData.formDetails?.organisation || "Defra",
      },
      team: {
        name: formData.formDetails?.teamName || "Dev team",
        email: formData.formDetails?.email || "eng@acme.com",
      },
      support: {
        phone: formData.formDetails?.support?.phone || "987654321",
        email: formData.formDetails?.support?.email || "support@defra.com",
        link: formData.formDetails?.support?.link,
      },
      nextSteps:
        formData.formDetails?.nextSteps ||
        "We will call you within 5 working days to discuss your application.",
      privacyNotice: formData.formDetails?.privacyNotice,
      notificationEmail:
        formData.formDetails?.notificationEmail || "notify@defra.gov.uk",
    };

    // Add draft settings if they exist
    const draftSettings = formData.draftSettings || {};

    res.render("titan-mvp-1.2/form-overview/simplified/index-tabs", {
      form: form,
      draftSettings: draftSettings,
      pageName: `Overview - ${form.name}`,
    });
  }
);

// Route handler for live-only page
router.get("/titan-mvp-1.2/form-overview/live-only", (req, res) => {
  const formData = req.session.data || {};

  // Create the preview URL
  const urlFriendlyName = (formData.formName || "Form name")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/live/${urlFriendlyName}`;
  const liveUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/live/${urlFriendlyName}`;

  // Create the form object that the templates expect for a live form
  const form = {
    name: formData.formName || "Employee Onboarding",
    status: {
      text: "Live",
      color: "green",
    },
    previewUrl: previewUrl,
    liveUrl: liveUrl,
    wentLiveAt:
      formData.formDetails?.wentLiveAt || "8 May 2024, 2:45pm by Emily Wong",
    organisation: {
      name: formData.formDetails?.organisation || "Defra",
    },
    team: {
      name: formData.formDetails?.teamName || "Dev team",
      email: formData.formDetails?.email || "eng@acme.com",
    },
    support: {
      phone: formData.formDetails?.support?.phone || "987654321",
      email: formData.formDetails?.support?.email || "support@defra.com",
      link: formData.formDetails?.support?.link,
    },
    nextSteps:
      formData.formDetails?.nextSteps ||
      "We will send a confirmation email to the email address you provided.",
    privacyNotice: formData.formDetails?.privacyNotice,
    notificationEmail:
      formData.formDetails?.notificationEmail || "notify@defra.gov.uk",
  };

  res.render("titan-mvp-1.2/form-overview/live-only", {
    form: form,
    pageName: `Live Overview - ${form.name}`,
  });
});

// Route handler for creating a draft from live form
router.get("/titan-mvp-1.2/form-overview/live-draft", (req, res) => {
  const formData = req.session.data || {};

  // Set the hasDraft flag to true to show live-draft status
  if (!formData.formDetails) {
    formData.formDetails = {};
  }
  formData.formDetails.hasDraft = true;
  req.session.data = formData;

  // Redirect back to the index-tabs page to show both draft and live tabs
  res.redirect("/titan-mvp-1.2/form-overview/simplified/index-tabs");
});

// Add POST route handler for saving page changes
router.post("/titan-mvp-1.2/form-overview/index", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  // Get the current page
  const currentPage = formPages[pageIndex];

  // Update the current page with the new values
  formPages[pageIndex] = {
    ...currentPage,
    pageHeading: req.body.pageHeading || currentPage.pageHeading,
    guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
    hasGuidance: req.body.guidance === "guidance",
    allowMultipleResponses: req.body.allowMultipleResponses === "true",
    minResponseCount: req.body.minResponseCount || currentPage.minResponseCount,
    maxResponseCount: req.body.maxResponseCount || currentPage.maxResponseCount,
    questionSetName: req.body.questionSetName || currentPage.questionSetName,
    section: req.body.section
      ? {
          id: req.body.section,
          name:
            formData.sections?.find((s) => s.id === req.body.section)?.name ||
            "",
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };

  // Update the session data
  req.session.data = {
    ...formData,
    formPages: formPages,
    formDetails: {
      ...formData.formDetails,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Redirect back to the page overview
  res.redirect("/titan-mvp-1.2/form-editor/page-overview");
});

// Support pages routes
router.get("/titan-mvp-1.2/form-overview/index/support/phone", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-telephone", {
    form: {
      name: formData.formName || "Form name",
      support: {
        phone: formData.formDetails?.support?.phone || "",
      },
    },
    pageName: "Add phone number for support",
  });
});

router.post("/titan-mvp-1.2/form-overview/index/support/phone", (req, res) => {
  const formData = req.session.data || {};
  const phoneDetails = req.body.moreDetail;

  // Update the form details with the phone number
  formData.formDetails = {
    ...formData.formDetails,
    support: {
      ...formData.formDetails?.support,
      phone: phoneDetails,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Also save to top-level data for template access
  formData.moreDetail = phoneDetails;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/support/add-telephone");
});

router.get("/titan-mvp-1.2/form-overview/index/support/email", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-email", {
    data: formData,
    form: {
      name: formData.formName || "Form name",
      support: {
        email: formData.formDetails?.support?.email || "",
      },
    },
    pageName: "Add email address for support",
  });
});

router.post("/titan-mvp-1.2/form-overview/index/support/email", (req, res) => {
  const formData = req.session.data || {};
  const emailAddress = req.body.emailAddress;
  const responseTime = req.body.responseTime;

  // Update the form details with the email and response time
  formData.formDetails = {
    ...formData.formDetails,
    support: {
      ...formData.formDetails?.support,
      email: emailAddress,
      responseTime: responseTime,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Also save to top-level data for template access
  formData.emailAddress = emailAddress;
  formData.responseTime = responseTime;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/support/add-email");
});

// Add the correct GET handler for the phone number form path
router.get("/titan-mvp-1.2/form-overview/support/add-telephone", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-telephone", {
    data: formData,
    form: {
      name: formData.formName || "Form name",
      support: {
        phone: formData.formDetails?.support?.phone || "",
      },
    },
    pageName: "Add phone number for support",
  });
});

// Add the correct POST handler for the phone number form
router.post(
  "/titan-mvp-1.2/form-overview/support/add-telephone",
  (req, res) => {
    const formData = req.session.data || {};
    const moreDetail = req.body.moreDetail;

    // Save to session data
    if (!formData.formDetails) {
      formData.formDetails = {};
    }
    if (!formData.formDetails.support) {
      formData.formDetails.support = {};
    }

    formData.formDetails.support.phone = moreDetail;

    // Also save to top-level data for template access
    formData.moreDetail = moreDetail;

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/support/add-telephone");
  }
);

// Add the correct GET handler for the privacy notice form path
router.get(
  "/titan-mvp-1.2/form-overview/support/add-privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/add-privacy-notice", {
      data: formData,
      form: {
        name: formData.formName || "Form name",
        support: {
          privacyNotice: formData.formDetails?.support?.privacyNotice || "",
        },
      },
      pageName: "Add privacy notice link",
    });
  }
);

// Add the correct POST handler for the privacy notice form
router.post(
  "/titan-mvp-1.2/form-overview/support/add-privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    const privacyNoticeLink = req.body.privacyNoticeLink;

    // Save to session data
    if (!formData.formDetails) {
      formData.formDetails = {};
    }
    if (!formData.formDetails.support) {
      formData.formDetails.support = {};
    }

    formData.formDetails.support.privacyNotice = privacyNoticeLink;

    // Also save to top-level data for template access
    formData.privacyNoticeLink = privacyNoticeLink;

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-editor/support-pages-settings");
  }
);

// POST route handler for phone support page
router.post("/titan-mvp-1.2/form-overview/support/phone", (req, res) => {
  const formData = req.session.data || {};
  const phoneNumber = req.body.phoneNumber;

  // Save to session data
  if (!formData.formDetails) {
    formData.formDetails = {};
  }
  if (!formData.formDetails.support) {
    formData.formDetails.support = {};
  }

  formData.formDetails.support.phone = phoneNumber;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/simplified/index-tabs");
});

// POST route handler for email support page
router.post("/titan-mvp-1.2/form-overview/support/email", (req, res) => {
  const formData = req.session.data || {};
  const emailAddress = req.body.emailAddress;
  const responseTime = req.body.responseTime;

  // Save to session data
  if (!formData.formDetails) {
    formData.formDetails = {};
  }
  if (!formData.formDetails.support) {
    formData.formDetails.support = {};
  }

  formData.formDetails.support.email = emailAddress;
  formData.formDetails.support.responseTime = responseTime;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/simplified/index-tabs");
});

// POST route handler for contact link support page
router.post("/titan-mvp-1.2/form-overview/support/link", (req, res) => {
  const formData = req.session.data || {};
  const contactLink = req.body.contactLink;
  const contactLinkDescription = req.body.contactLinkDescription;

  // Save to session data
  if (!formData.formDetails) {
    formData.formDetails = {};
  }
  if (!formData.formDetails.support) {
    formData.formDetails.support = {};
  }

  formData.formDetails.support.link = contactLink;
  formData.formDetails.support.linkDescription = contactLinkDescription;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/simplified/index-tabs");
});

// POST route handler for privacy notice support page
router.post(
  "/titan-mvp-1.2/form-overview/support/privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    const privacyLink = req.body.privacyLink;

    // Save to session data
    if (!formData.formDetails) {
      formData.formDetails = {};
    }
    if (!formData.formDetails.support) {
      formData.formDetails.support = {};
    }

    formData.formDetails.support.privacyNotice = privacyLink;

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/simplified/index-tabs");
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/index/support/next-steps",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/next-steps.html", {
      form: {
        name: formData.formName || "Form name",
        nextSteps: formData.formDetails?.nextSteps || "",
      },
      pageName: "Add next steps",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/next-steps",
  (req, res) => {
    const formData = req.session.data || {};
    const nextSteps = req.body.nextSteps;

    // Update the form details with the next steps
    formData.formDetails = {
      ...formData.formDetails,
      nextSteps: nextSteps,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/index/support/privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/privacy-notice", {
      form: {
        name: formData.formName || "Form name",
        privacyNotice: formData.formDetails?.privacyNotice || "",
      },
      pageName: "Add privacy notice",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    const privacyNotice = req.body.privacyLink;

    formData.formDetails = {
      ...formData.formDetails,
      privacyNotice: privacyNotice,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/index/support/notification-email",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/notification-email", {
      form: {
        name: formData.formName || "Form name",
        notificationEmail: formData.formDetails?.notificationEmail || "",
      },
      pageName: "Add notification email",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/notification-email",
  (req, res) => {
    const formData = req.session.data || {};
    const notificationEmail = req.body.notificationEmail;

    formData.formDetails = {
      ...formData.formDetails,
      notificationEmail: notificationEmail,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

// Form editor routes
router.get("/titan-mvp-1.2/form-editor/page-overview", function (req, res) {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;
  const currentPage = formPages[pageIndex] || {};
  const sections = formData.sections || [];
  res.render("titan-mvp-1.2/form-editor/page-overview.html", {
    form: { name: formData.formName || "Form name" },
    pageNumber: pageIndex + 1,
    currentPage: currentPage,
    sections: sections,
  });
});

router.post("/titan-mvp-1.2/form-editor/page-overview", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  // Get the current page
  const currentPage = formPages[pageIndex];

  // Update the current page with the new values
  formPages[pageIndex] = {
    ...currentPage,
    pageHeading: req.body.pageHeading || currentPage.pageHeading,
    guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
    hasGuidance: req.body.guidance === "guidance",
    allowMultipleResponses: req.body.allowMultipleResponses === "true",
    minResponseCount: req.body.minResponseCount || currentPage.minResponseCount,
    maxResponseCount: req.body.maxResponseCount || currentPage.maxResponseCount,
    questionSetName: req.body.questionSetName || currentPage.questionSetName,
    section: req.body.section
      ? {
          id: req.body.section,
          name:
            formData.sections?.find((s) => s.id === req.body.section)?.name ||
            "",
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };

  // Update the session data
  req.session.data = {
    ...formData,
    formPages: formPages,
    formDetails: {
      ...formData.formDetails,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Redirect back to the listing page
  res.redirect("/titan-mvp-1.2/form-editor/listing");
});

// Question configuration routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};

    res.render(
      "titan-mvp-1.2/form-editor/question-type/guidance-configuration",
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Update the current page with the guidance configuration
    formPages[pageIndex] = {
      ...currentPage,
      pageHeading: req.body.pageHeading || currentPage.pageHeading,
      guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
      hasGuidance: true,
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Question type configuration routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/:type/configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};
    const questionType = req.params.type;

    res.render(
      `titan-mvp-1.2/form-editor/question-type/${questionType}-configuration`,
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
        questionType: questionType,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/:type/configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const questionType = req.params.type;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Update the current page with the question configuration
    formPages[pageIndex] = {
      ...currentPage,
      questions: [
        {
          ...currentPage.questions[0],
          label: req.body.questionLabel,
          hint: req.body.questionHint,
          type: questionType,
          validation: {
            required: req.body.required === "true",
            pattern: req.body.pattern,
            minLength: req.body.minLength,
            maxLength: req.body.maxLength,
          },
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Question options routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/:type/options",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};
    const questionType = req.params.type;

    res.render(
      `titan-mvp-1.2/form-editor/question-type/${questionType}-options`,
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
        questionType: questionType,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/:type/options",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const questionType = req.params.type;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Get the options from the request body
    const options = req.body.options || [];

    // Update the current page with the question options
    formPages[pageIndex] = {
      ...currentPage,
      questions: [
        {
          ...currentPage.questions[0],
          options: Array.isArray(options)
            ? options.map((option) => ({
                value: option,
                label: option,
              }))
            : [{ value: options, label: options }],
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Make draft live routes
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live",
  (req, res) => {
    const formData = req.session.data || {};

    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/index",
      {
        form: {
          name: formData.formName || "Form name",
          status: {
            text: "Draft-Live",
            color: "blue",
          },
        },
      }
    );
  }
);

router.post("/titan-mvp-1.2/form-overview/make-draft-live", (req, res) => {
  // Update form status in session
  const formData = req.session.data || {};

  formData.formDetails = {
    ...formData.formDetails,
    status: "Live",
    publishedAt: new Date().toISOString(),
    publishedBy: "Chris Smith", // This would normally come from the logged-in user
    lastUpdated: new Date().toISOString(),
  };

  req.session.data = formData;

  // Redirect to passed validation page
  res.redirect(
    "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation"
  );
});

router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation",
  (req, res) => {
    const formData = req.session.data || {};

    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation",
      {
        form: {
          name: formData.formName || "Form name",
          status: {
            text: "Live",
            color: "green",
          },
        },
        actions: {
          continue: "/titan-mvp-1.2/form-overview/live/index",
        },
      }
    );
  }
);

// AI Compliance Check routes
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-loading",
  (req, res) => {
    const formData = req.session.data || {};

    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-loading",
      {
        form: {
          name: formData.formName || "Form name",
          status: {
            text: "Draft-Live",
            color: "blue",
          },
        },
      }
    );
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-check",
  async (req, res) => {
    // Import the AI compliance checker
    const AIComplianceChecker = require("../../services/ai-compliance-checker");
    const complianceChecker = new AIComplianceChecker();

    try {
      // Load the real form data from the JSON file
      const formData = AIComplianceChecker.loadDemoForm();

      // Debug: Log what we loaded
      console.log("Loaded form data:", {
        name: formData.formName,
        questionCount: formData.checkAnswersItems?.length || 0,
        pages:
          formData.checkAnswersItems?.filter((item) => item.type === "page")
            .length || 0,
        questions:
          formData.checkAnswersItems?.filter((item) => item.type === "question")
            .length || 0,
      });

      // Run the AI compliance analysis
      const compliance = await complianceChecker.analyzeForm(formData);

      // Generate additional recommendations
      compliance.recommendations =
        complianceChecker.generateRecommendations(compliance);

      res.render(
        "titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-check",
        {
          form: {
            name: formData.name,
            status: {
              text: "Draft",
              color: "orange",
            },
            team: {
              email: formData.formDetails?.team?.email || "team@defra.gov.uk",
            },
          },
          compliance: compliance,
        }
      );
    } catch (error) {
      console.error("AI compliance check error:", error);

      // Fallback to error page or redirect
      res.redirect("/titan-mvp-1.2/form-overview/manage-form/make-draft-live");
    }
  }
);

// Demo route for AI compliance check
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-demo",
  async (req, res) => {
    const AIComplianceChecker = require("../../services/ai-compliance-checker");
    const formData = AIComplianceChecker.loadDemoForm();
    const checker = new AIComplianceChecker();
    const compliance = await checker.analyzeForm(formData);
    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-demo",
      {
        form: {
          name: formData.name,
          status: {
            text: "Demo",
            color: "blue",
          },
        },
        compliance,
      }
    );
  }
);

// Knowledge check routes (end-of-journey)
router.get("/form-editor/knowledge-check/:question", function (req, res) {
  const question = req.params.question;
  res.render("titan-mvp-1.2/form-editor/knowledge-check/" + question, {
    feedback: null,
  });
});

router.post("/form-editor/knowledge-check/:question", function (req, res) {
  const question = req.params.question;
  const answer = req.body.answer;
  // Example feedback logic (expand per question)
  let feedback = {};
  if (question === "q1") {
    if (answer === "a") {
      feedback = {
        type: "success",
        message:
          "Correct! Consolidating knowledge checks at the end helps reduce fatigue and improve retention.",
        example:
          "This approach lets users focus on learning before being assessed.",
      };
    } else {
      feedback = {
        type: "error",
        message:
          "Not quite. The main benefit is reducing cognitive fatigue and improving retention.",
        example:
          "Placing questions at the end avoids interrupting the learning flow.",
      };
    }
  }
  // Add more question logic as needed
  res.render("titan-mvp-1.2/form-editor/knowledge-check/" + question, {
    feedback,
  });
});
// Live form overview route
router.get("/titan-mvp-1.2/form-overview/live/index", (req, res) => {
  const formData = req.session.data || {};
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const form = {
    name: formData.formName || "Form name",
    status: {
      text: "Live",
      color: "green",
    },
    previewUrl: `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`,
    liveUrl: `https://forms-runner.prototype.cdp-int.defra.cloud/forms/${urlFriendlyName}`,
    publishedAt: formData.formDetails?.publishedAt || new Date().toISOString(),
    publishedBy: formData.formDetails?.publishedBy || "Chris Smith",
    organisation: formData.formDetails?.organisation || { name: "Not set" },
    team: {
      name: formData.formDetails?.teamName || "Not set",
      email: formData.formDetails?.email || "Not set",
    },
    support: formData.formDetails?.support || {},
    nextSteps: formData.formDetails?.nextSteps,
    privacyNotice: formData.formDetails?.privacyNotice,
  };

  res.render("titan-mvp-1.2/form-overview/live/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Migrate confirmation route
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/migrate-confirmation",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/manage-form/migrate-confirmation", {
      form: {
        id: formData.formId || "1",
        name: formData.formName || "Form name",
      },
    });
  }
);

// Library route
router.get("/titan-mvp-1.2/library", function (req, res) {
  res.render("titan-mvp-1.2/library.html", {
    commonTerms: terms,
  });
});

// Add non-.html route for information-type-nf
router.get(
  "/titan-mvp-1.2/form-editor/information-type-nf",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/information-type-nf.html", {
      form: {
        name: formData.formName || "Form name",
      },
      pageNumber: formData.currentPageIndex + 1 || 1,
      questionNumber: formData.currentQuestionIndex + 1 || 1,
      data: formData,
    });
  }
);

// Add .html route for information-type-nf
router.get(
  "/titan-mvp-1.2/form-editor/information-type-nf.html",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/information-type-nf.html", {
      form: {
        name: formData.formName || "Form name",
      },
      pageNumber: formData.currentPageIndex + 1 || 1,
      questionNumber: formData.currentQuestionIndex + 1 || 1,
      data: formData,
    });
  }
);

// Add non-.html route for errors/shorttext-edit
router.get(
  "/titan-mvp-1.2/form-editor/errors/shorttext-edit",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/errors/shorttext-edit.html", {
      data: formData,
      form: { name: formData.formName || "Form name" },
    });
  }
);

// Add non-.html route for form-overview/index
router.get("/titan-mvp-1.2/form-overview/index", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};
  // Map status to GOV.UK Design System tag colors
  const statusColorMap = {
    Draft: "orange",
    Live: "green",
    Closed: "red",
  };
  const status = formData.formDetails?.status || "Draft";
  const statusColor = statusColorMap[status] || "grey";
  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Create the preview URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: status,
      color: statusColor,
    },
    previewUrl: previewUrl,
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
  };
  res.render("titan-mvp-1.2/form-overview/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Add non-.html route for library
router.get("/titan-mvp-1.2/library.html", function (req, res) {
  res.render("titan-mvp-1.2/library.html", {
    commonTerms: terms,
  });
});

// Upload confirmation page
router.get(
  "/titan-mvp-1.2/form-editor/upload-confirmation",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/upload-confirmation", {
      form: {
        name: formData.formName || "Form name",
      },
      pageName: "Upload confirmation",
    });
  }
);

// Live-draft overview page route
router.get("/titan-mvp-1.2/form-overview/live-draft", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "Form name")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Create the preview URL and live URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
  const liveUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/forms/${urlFriendlyName}`;

  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: "Draft-Live",
      color: "blue",
    },
    previewUrl: previewUrl,
    liveUrl: liveUrl,
    createdAt: formData.formDetails?.createdAt || new Date().toISOString(),
    updatedAt: formData.formDetails?.lastUpdated || new Date().toISOString(),
    updatedBy: formData.formDetails?.updatedBy || "Chris Smith",
    draftCreatedAt:
      formData.formDetails?.draftCreatedAt || new Date().toISOString(),
    draftCreatedBy: formData.formDetails?.draftCreatedBy || "Chris Smith",
    publishedAt: formData.formDetails?.publishedAt || new Date().toISOString(),
    publishedBy: formData.formDetails?.publishedBy || "Chris Smith",
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
  };

  res.render("titan-mvp-1.2/form-overview/live-draft/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Delete draft confirmation page
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/delete-draft",
  (req, res) => {
    const formData = req.session.data || {};

    res.render("titan-mvp-1.2/form-overview/manage-form/delete-draft/index", {
      form: {
        name: formData.formName || "Form name",
        status: formData.formDetails?.status || {
          text: "Draft",
          color: "orange",
        },
      },
      actions: {
        continue:
          "/titan-mvp-1.2/form-overview/manage-form/delete-draft/confirm",
        cancel: "/titan-mvp-1.2/form-overview/index",
      },
    });
  }
);

// Handle delete draft confirmation
router.post(
  "/titan-mvp-1.2/form-overview/manage-form/delete-draft/confirm",
  (req, res) => {
    const formData = req.session.data || {};

    // Update form status in session
    formData.formDetails = {
      ...formData.formDetails,
      status: "Live",
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;

    // Redirect back to form overview
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

// Remove form-level condition
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/remove",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.body.conditionId;
    const conditionIds = req.body.conditionIds
      ? JSON.parse(req.body.conditionIds)
      : null;

    // Function to remove condition by ID
    const removeConditionById = (id) => {
      // Remove from form-level conditions if they exist
      if (formData.conditions) {
        formData.conditions = formData.conditions.filter(
          (c) => c.id.toString() !== id.toString()
        );
      }

      // Remove from any pages that use this condition
      formPages.forEach((page) => {
        if (page.conditions) {
          page.conditions = page.conditions.filter(
            (c) => c.id.toString() !== id.toString()
          );
        }
        // Also check if this condition is used in any page's conditional routing
        if (page.conditionalRouting) {
          page.conditionalRouting = page.conditionalRouting.filter(
            (route) => route.conditionId.toString() !== id.toString()
          );
        }
      });
    };

    // Handle single condition removal
    if (conditionId) {
      removeConditionById(conditionId);
    }

    // Handle multiple conditions removal
    if (conditionIds) {
      conditionIds.forEach((id) => removeConditionById(id));
    }

    // Save back to session
    req.session.data = formData;

    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Join conditions
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/join",
  function (req, res) {
    console.log("Join route req.body:", req.body);
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    let conditionIds = [];
    try {
      if (req.body.conditionIds && req.body.conditionIds !== "undefined") {
        conditionIds = JSON.parse(req.body.conditionIds);
      }
    } catch (e) {
      conditionIds = [];
    }
    const operator = req.body.operator;
    const newConditionName = req.body.newConditionName;
    if (!Array.isArray(conditionIds) || conditionIds.length < 2) {
      // Optionally, set a flash message or query param for error
      return res.redirect(
        "/titan-mvp-1.2/form-editor/conditions/manager?joinError=Please select at least two conditions to join"
      );
    }
    // ... existing code ...
    // Create the new joined condition
    const newCondition = {
      id: Date.now(),
      conditionName: newConditionName,
      logicalOperator: operator,
      joinedConditionIds: conditionIds, // Store the original condition IDs
      rules: [],
    };

    // Find all the conditions to be joined
    const conditionsToJoin = [];
    // First check form-level conditions
    if (formData.conditions) {
      formData.conditions.forEach((condition) => {
        if (
          conditionIds.includes(condition.id.toString()) &&
          !conditionsToJoin.some((c) => c.id === condition.id)
        ) {
          conditionsToJoin.push(condition);
        }
      });
    }
    // Then check page-level conditions
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions.forEach((condition) => {
          if (
            conditionIds.includes(condition.id.toString()) &&
            !conditionsToJoin.some((c) => c.id === condition.id)
          ) {
            conditionsToJoin.push(condition);
          }
        });
      }
    });
    // Sort conditions to match the order of conditionIds
    conditionsToJoin.sort((a, b) => {
      return (
        conditionIds.indexOf(a.id.toString()) -
        conditionIds.indexOf(b.id.toString())
      );
    });
    // Add rules from all conditions, setting logicalOperator for every rule after the first
    let ruleCounter = 0;
    conditionsToJoin.forEach((condition) => {
      if (condition.rules && Array.isArray(condition.rules)) {
        condition.rules.forEach((rule) => {
          newCondition.rules.push({
            ...rule,
            logicalOperator: ruleCounter === 0 ? null : operator,
          });
          ruleCounter++;
        });
      }
    });
    // Create the text representation of the joined condition
    newCondition.text = newCondition.rules
      .map((rule, idx) => {
        const valueText = Array.isArray(rule.value)
          ? rule.value.map((v) => `'${v}'`).join(" or ")
          : `'${rule.value}'`;
        // Add the logical operator before all but the first rule
        if (idx > 0 && rule.logicalOperator) {
          return `${rule.logicalOperator} '${rule.questionText}' ${rule.operator} ${valueText}`;
        }
        return `'${rule.questionText}' ${rule.operator} ${valueText}`;
      })
      .join(" ");

    // Add the new condition to the form-level conditions
    formData.conditions.push(newCondition);

    // --- APPLY TO SELECTED PAGES IF ANY WERE CHECKED ---
    let selectedPages = [];
    try {
      selectedPages = (
        Array.isArray(req.body.pages)
          ? req.body.pages
          : req.body.pages
          ? JSON.parse(req.body.pages)
          : []
      )
        .filter(
          (pageId) =>
            pageId !== "_unchecked" &&
            pageId !== "none" &&
            !pageId.startsWith("[")
        )
        .map((pageId) => String(pageId));
    } catch (e) {
      selectedPages = [];
    }
    if (selectedPages.length > 0) {
      selectedPages.forEach((pageId) => {
        const page = formPages.find((p) => String(p.pageId) === pageId);
        if (page) {
          page.conditions = page.conditions || [];
          const alreadyExists = page.conditions.some(
            (c) => String(c.id) === String(newCondition.id)
          );
          if (!alreadyExists) {
            page.conditions.push(JSON.parse(JSON.stringify(newCondition)));
          }
        }
      });
    }
    // ... existing code ...

    // Save back to session
    req.session.data = formData;

    // Redirect to the conditions manager
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Page-level delete confirmation and action
router.get(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/delete/:conditionId",
  (req, res) => {
    const pageId = req.params.pageId;
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const currentPage = formPages.find(
      (page) => String(page.pageId) === String(pageId)
    );
    if (!currentPage) {
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }
    const condition = (currentPage.conditions || []).find(
      (c) => String(c.id) === String(conditionId)
    );
    if (!condition) {
      return res.redirect(
        `/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`
      );
    }
    const pageIndex = formPages.findIndex(
      (page) => String(page.pageId) === String(pageId)
    );
    const pageNumber = pageIndex + 1;
    res.render("titan-mvp-1.2/form-editor/conditions/page-level-delete", {
      form: formData,
      pageId: pageId,
      conditionName: condition.conditionName,
      conditionId: conditionId,
      formName: formData.name || "Untitled form",
      pageHeading: currentPage.pageHeading,
      pageNumber: pageNumber,
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/delete/:conditionId",
  (req, res) => {
    const pageId = req.params.pageId;
    const conditionId = req.params.conditionId;
    const formPages = req.session.data.formPages || [];
    const currentPage = formPages.find(
      (page) => String(page.pageId) === String(pageId)
    );
    if (currentPage && currentPage.conditions) {
      currentPage.conditions = currentPage.conditions.filter(
        (c) => String(c.id) !== String(conditionId)
      );
    }
    req.session.data.formPages = formPages;
    res.redirect(`/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`);
  }
);

// Edit page for checkbox options
router.get(
  "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit",
  (req, res) => {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"] || 0;
    const pageNumber = pageIndex + 1;
    const questionIndex = req.session.data["currentQuestionIndex"] || 0;
    const questionNumber = questionIndex + 1;
    const formData = req.session.data || {};

    let checkboxList = [];
    if (formPages[pageIndex]) {
      const currentPage = formPages[pageIndex];
      checkboxList = currentPage.checkboxList || [];
    }
    if (checkboxList.length === 0) {
      checkboxList = req.session.data?.checkboxList || [];
    }

    res.render("titan-mvp-1.2/form-editor/question-type/checkboxes/edit.html", {
      checkboxList: checkboxList,
      pageNumber: pageNumber,
      questionNumber: questionNumber,
      form: {
        name: formData.formDetails?.name || formData.formName || "Form name",
      },
    });
  }
);

// Edit page for radio options
router.get(
  "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit",
  (req, res) => {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"] || 0;
    const pageNumber = pageIndex + 1;
    const questionIndex = req.session.data["currentQuestionIndex"] || 0;
    const questionNumber = questionIndex + 1;
    const formData = req.session.data || {};

    let radioList = [];
    if (formPages[pageIndex]) {
      const currentPage = formPages[pageIndex];
      radioList = currentPage.radioList || [];
    }
    if (radioList.length === 0) {
      radioList = req.session.data?.radioList || [];
    }

    const availableQuestions = formPages
      .flatMap((page) => page.questions)
      .filter((question) => {
        const type = question.subType || question.type;
        return ["radios", "checkboxes", "yes-no"].includes(type);
      })
      .map((question) => ({
        value: question.questionId,
        text: question.label,
        type: question.subType || question.type,
        options: question.options,
      }));

    const existingConditions = formPages
      .flatMap((page) => page.conditions || [])
      .map((condition) => ({
        value: condition.id.toString(),
        text: condition.conditionName,
        hint: {
          text: condition.rules
            .map(
              (rule) =>
                `${rule.questionText} ${rule.operator} ${
                  Array.isArray(rule.value)
                    ? rule.value.join(" or ")
                    : rule.value
                }`
            )
            .join(" AND "),
        },
      }));

    res.render("titan-mvp-1.2/form-editor/question-type/radios-nf/edit.html", {
      radioList: radioList,
      pageNumber: pageNumber,
      questionNumber: questionNumber,
      form: {
        name: formData.formDetails?.name || formData.formName || "Form name",
      },
      commonTerms: terms,
      availableQuestions: availableQuestions,
      existingConditions: existingConditions,
    });
  }
);

// Guidance configuration edit route
router.get(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration-nojs.html",
  function (req, res) {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"];
    const formData = req.session.data || {};
    const pageNumber = pageIndex + 1;

    // Get the current page from the session
    const currentPage = formPages[pageIndex];

    if (!currentPage) {
      console.log("No current page found:", {
        pageIndex,
        formPagesLength: formPages.length,
      });
      return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
    }

    console.log("Rendering guidance config with page:", currentPage);

    res.render(
      "titan-mvp-1.2/form-editor/question-type/guidance-configuration-nojs.html",
      {
        currentPage: currentPage,
        data: {
          ...formData,
          showCreateSection: req.query.showCreateSection === "true",
          error: req.query.error,
        },
        form: {
          name: formData.formName || "Form name",
        },
        pageNumber: pageNumber,
        sections: formData.sections || [], // Add sections data here
      }
    );
  }
);

// Apply condition to pages
router.post("/titan-mvp-1.2/form-editor/conditions/apply", function (req, res) {
  const formData = req.session.data;
  const formPages = req.session.data["formPages"] || [];

  // Parse condition IDs - handle both string and array formats
  const conditionIds =
    typeof req.body.conditionIds === "string"
      ? JSON.parse(req.body.conditionIds)
      : Array.isArray(req.body.conditionIds)
      ? req.body.conditionIds
      : [];

  // Clean up the pages array - remove any non-page IDs and parse JSON strings
  let selectedPages = [];
  try {
    selectedPages = (
      Array.isArray(req.body.pages)
        ? req.body.pages
        : req.body.pages
        ? JSON.parse(req.body.pages)
        : []
    )
      .filter((pageId) => pageId !== "_unchecked" && !pageId.startsWith("["))
      .map((pageId) => String(pageId));
  } catch (e) {
    selectedPages = [];
  }

  if (!formData || !conditionIds.length || !selectedPages.length) {
    return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }

  // Get all selected conditions
  const conditions = conditionIds
    .map((conditionId) => {
      // First check form-level conditions
      let condition = formData.conditions?.find(
        (condition) => String(condition.id) === String(conditionId)
      );
      // If not found in form-level, check page-level conditions
      if (!condition) {
        for (const page of formPages) {
          if (page.conditions) {
            const found = page.conditions.find(
              (c) => String(c.id) === String(conditionId)
            );
            if (found) {
              condition = found;
              break;
            }
          }
        }
      }
      return condition;
    })
    .filter(Boolean);

  if (conditions.length === 0) {
    return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }

  // Apply each condition to the selected pages
  conditions.forEach((condition) => {
    selectedPages.forEach((pageId) => {
      const page = formPages.find((p) => String(p.pageId) === pageId);
      if (page) {
        // Initialize conditions array if it doesn't exist
        if (!page.conditions) {
          page.conditions = [];
        }
        // Check if condition is already applied
        const conditionExists = page.conditions.some(
          (c) => String(c.id) === String(condition.id)
        );
        if (!conditionExists) {
          // Add a deep copy of the condition to avoid reference issues
          page.conditions.push(JSON.parse(JSON.stringify(condition)));
        }
      }
    });
  });

  // Save updated pages back to session
  req.session.data["formPages"] = formPages;
  res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
});

// Remove conditions from pages
router.post(
  "/titan-mvp-1.2/form-editor/conditions/remove",
  function (req, res) {
    const formData = req.session.data;
    const formPages = req.session.data["formPages"] || [];

    // Parse the selections object from the request body
    let selections = {};
    try {
      selections =
        typeof req.body.selections === "string"
          ? JSON.parse(req.body.selections)
          : req.body.selections || {};
    } catch (e) {
      console.error("Error parsing selections data:", e);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    if (!formData || Object.keys(selections).length === 0) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Process each page's selections
    Object.entries(selections).forEach(([pageId, conditionIds]) => {
      const page = formPages.find((p) => String(p.pageId) === pageId);
      if (page) {
        // Initialize conditions array if it doesn't exist
        if (!page.conditions) {
          page.conditions = [];
        }

        // Remove the selected conditions from this page
        page.conditions = page.conditions.filter(
          (condition) => !conditionIds.includes(String(condition.id))
        );
      }
    });

    // Save updated pages back to session
    req.session.data["formPages"] = formPages;
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);
// Edit condition page (adapted from 1.0)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/edit/:id",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.params.id;

    // Check if we have any form pages
    if (!formPages || formPages.length === 0) {
      console.error("No form pages found in session");
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    // First check form-level conditions
    let condition = null;
    let foundInPage = null;

    if (formData.conditions) {
      condition = formData.conditions.find((c) => String(c.id) === conditionId);
    }

    // If not found in form-level conditions, check page-level conditions
    if (!condition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === conditionId
          );
          if (found) {
            condition = found;
            foundInPage = page;
            break;
          }
        }
      }
    }

    if (!condition) {
      console.error("Condition not found:", conditionId);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Check if this is a joined condition
    const isJoinedCondition =
      condition.logicalOperator &&
      condition.rules &&
      condition.rules.length > 1;

    // Get all available questions for conditions
    const availableQuestions = formPages
      .flatMap((page) => page.questions)
      .filter((question) => {
        const type = question.subType || question.type;
        return ["radios", "checkboxes", "yes-no"].includes(type);
      })
      .map((question) => ({
        value: question.questionId,
        text: question.label,
        type: question.subType || question.type,
        options: question.options,
      }));

    if (!availableQuestions || availableQuestions.length === 0) {
      console.error("No available questions found for condition editing");
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Calculate pagesWithCondition with pageNumber
    const pagesWithCondition = formPages
      .filter(
        (page) =>
          page.conditions &&
          page.conditions.some((c) => String(c.id) === conditionId)
      )
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    // If this is a joined condition, get all available conditions for selection
    let availableConditions = [];
    let selectedConditionIds = [];
    if (isJoinedCondition) {
      // Get all form-level conditions (exclude only the current condition)
      if (formData.conditions) {
        availableConditions.push(
          ...formData.conditions
            .filter((c) => String(c.id) !== String(conditionId))
            .map((c) => ({
              id: String(c.id),
              name: c.conditionName,
              text: c.text,
              source: "form-level",
            }))
        );
      }

      // Get all page-level conditions (exclude only the current condition)
      formPages.forEach((page) => {
        if (page.conditions) {
          availableConditions.push(
            ...page.conditions
              .filter((c) => String(c.id) !== String(conditionId))
              .map((c) => ({
                id: String(c.id),
                name: c.conditionName,
                text: c.text,
                source: "page-level",
                pageName: page.pageHeading || `Page ${page.pageId}`,
              }))
          );
        }
      });

      // Remove duplicates based on condition ID
      availableConditions = availableConditions.filter(
        (condition, index, self) =>
          index === self.findIndex((c) => String(c.id) === String(condition.id))
      );

      // Identify which conditions are currently part of this joined condition
      // Only use joinedConditionIds for preselection; do not use fallback logic
      if (
        condition.joinedConditionIds &&
        condition.joinedConditionIds.length > 0
      ) {
        // Use the stored condition IDs
        selectedConditionIds = condition.joinedConditionIds.map((id) =>
          String(id)
        );
      } else if (condition.rules && condition.rules.length > 0) {
        // Fallback: Extract unique question texts from the rules to identify the original conditions
        const questionTexts = [
          ...new Set(condition.rules.map((rule) => rule.questionText)),
        ];

        // Find conditions that have matching question texts
        const allConditions = [];
        if (formData.conditions) {
          allConditions.push(...formData.conditions);
        }
        formPages.forEach((page) => {
          if (page.conditions) {
            allConditions.push(...page.conditions);
          }
        });

        // Find conditions that match the question texts in the joined condition
        allConditions.forEach((c) => {
          if (
            c.rules &&
            c.rules.some((rule) => questionTexts.includes(rule.questionText))
          ) {
            selectedConditionIds.push(String(c.id));
          }
        });
      }
    }

    // Render the template with pagesWithCondition
    res.render("titan-mvp-1.2/form-editor/conditions/edit.html", {
      condition,
      availableQuestions,
      pageName: foundInPage ? foundInPage.pageHeading : null,
      pagesWithCondition,
      formName: formData.formName || "Default Form Name",
      formPages, // Add this line
      isJoinedCondition,
      availableConditions,
      selectedConditionIds,
      joinedConditionOperator: condition.logicalOperator || "AND",
    });
  }
);

// Add route for the review page (adapted from 1.0)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/edit-review",
  function (req, res) {
    const originalCondition = req.session.data.originalCondition;
    const updatedCondition = req.session.data.pendingConditionUpdate;
    const formPages = req.session.data.formPages || [];
    const conditionId = originalCondition?.id;
    const selectedPages = req.session.data.pendingConditionPages || [];

    if (!originalCondition || !updatedCondition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Calculate before/after page assignments
    const originalPagesWithCondition =
      req.session.data._pagesWithConditionBeforeEdit || [];
    // For after: show what the assignments WOULD be if saved
    const updatedPagesWithCondition = formPages
      .filter((page) => selectedPages.includes(String(page.pageId)))
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    res.render("titan-mvp-1.2/form-editor/conditions/edit-review", {
      originalCondition,
      updatedCondition,
      pagesWithCondition: updatedPagesWithCondition,
      originalPagesWithCondition,
      updatedPagesWithCondition,
      formPages, // Pass for full context
      formName: req.session.data.formName || "Default Form Name",
    });
  }
);

// Add route to handle saving changes (adapted from 1.0)
router.post(
  "/titan-mvp-1.2/form-editor/conditions/save-changes",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const originalCondition = req.session.data.originalCondition;
    const updatedCondition = req.session.data.pendingConditionUpdate;
    const selectedPages = req.session.data.pendingConditionPages || [];

    if (!originalCondition || !updatedCondition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    const conditionId = originalCondition.id;
    let foundInFormLevel = false;

    // Update in form-level conditions if it exists there
    if (formData.conditions) {
      const formLevelIndex = formData.conditions.findIndex(
        (c) => String(c.id) === String(conditionId)
      );
      if (formLevelIndex !== -1) {
        formData.conditions[formLevelIndex] = updatedCondition;
        foundInFormLevel = true;
      }
    }

    // Remove the condition from all pages first
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions = page.conditions.filter(
          (c) => String(c.id) !== String(conditionId)
        );
      }
    });
    // Add the condition to only the selected pages
    selectedPages.forEach((pageId) => {
      const page = formPages.find((p) => String(p.pageId) === String(pageId));
      if (page) {
        page.conditions = page.conditions || [];
        if (
          !page.conditions.some((c) => String(c.id) === String(conditionId))
        ) {
          page.conditions.push(updatedCondition);
        }
      }
    });
    req.session.data.formPages = formPages;

    // Save back to session
    req.session.data = formData;

    // Clear the temporary condition data
    delete req.session.data.originalCondition;
    delete req.session.data.pendingConditionUpdate;
    delete req.session.data.pendingConditionPages;
    delete req.session.data._pagesWithConditionBeforeEdit;

    // Redirect back to the conditions manager
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Extended demo listing route with even more comprehensive form data
router.get(
  "/titan-mvp-1.2/form-editor/listing/demo-extended",
  function (req, res) {
    // Create extended demo form data with 25+ pages
    const extendedDemoFormPages = [
      // Pages 1-15 from the basic demo (reusing the same structure)
      // Page 1: Business Registration
      {
        pageId: "page1",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q1",
            label: "Is your business registered with RPA?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [],
        order: 1,
      },
      // Page 2: Business Type (conditional)
      {
        pageId: "page2",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q2",
            label: "What type of business are you?",
            type: "list",
            subType: "radios",
            options: [
              { value: "sole-trader", text: "Sole trader" },
              { value: "partnership", text: "Partnership" },
              { value: "limited-company", text: "Limited company" },
              { value: "charity", text: "Charity" },
              { value: "other", text: "Other" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond1",
            conditionName: "Business Registered",
            rules: [
              {
                questionText: "Is your business registered with RPA?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 2,
      },
      // Page 3: Guidance Page
      {
        pageId: "page3",
        pageType: "guidance",
        guidanceOnlyHeadingInput: "Important Information",
        guidanceOnlyGuidanceTextInput:
          "Before proceeding with your application, please ensure you have all the necessary documentation ready. This includes your business registration certificate, financial records, and any relevant permits.",
        conditions: [
          {
            id: "cond2",
            conditionName: "Business Type Selected",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 3,
      },
      // Page 4: Contact Details
      {
        pageId: "page4",
        pageType: "question",
        pageHeading: "Contact Details",
        questions: [
          {
            questionId: "q3",
            label: "Full name",
            type: "text",
            subType: "short-answer-nf",
          },
          {
            questionId: "q4",
            label: "Email address",
            type: "email",
          },
          {
            questionId: "q5",
            label: "Phone number",
            type: "phone",
          },
        ],
        conditions: [],
        order: 4,
      },
      // Page 5: Business Address
      {
        pageId: "page5",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q6",
            label: "Business address",
            type: "address",
          },
        ],
        conditions: [
          {
            id: "cond3",
            conditionName: "Limited Company",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 5,
      },
      // Page 6: Financial Information
      {
        pageId: "page6",
        pageType: "question",
        pageHeading: "Financial Information",
        questions: [
          {
            questionId: "q7",
            label: "Annual turnover",
            type: "text",
            subType: "numbers",
          },
          {
            questionId: "q8",
            label: "Number of employees",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond4",
            conditionName: "Large Business",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 6,
      },
      // Page 7: Industry Sector
      {
        pageId: "page7",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q9",
            label: "What industry sector are you in?",
            type: "list",
            subType: "select",
            options: [
              { value: "agriculture", text: "Agriculture" },
              { value: "manufacturing", text: "Manufacturing" },
              { value: "retail", text: "Retail" },
              { value: "services", text: "Services" },
              { value: "construction", text: "Construction" },
              { value: "technology", text: "Technology" },
              { value: "healthcare", text: "Healthcare" },
              { value: "education", text: "Education" },
              { value: "other", text: "Other" },
            ],
          },
        ],
        conditions: [],
        order: 7,
      },
      // Page 8: Agriculture Specific (conditional)
      {
        pageId: "page8",
        pageType: "question",
        pageHeading: "Agriculture Details",
        questions: [
          {
            questionId: "q10",
            label: "What type of agriculture do you practice?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "crops", text: "Crop farming" },
              { value: "livestock", text: "Livestock farming" },
              { value: "dairy", text: "Dairy farming" },
              { value: "poultry", text: "Poultry farming" },
              { value: "mixed", text: "Mixed farming" },
            ],
          },
          {
            questionId: "q11",
            label: "Farm size (hectares)",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond5",
            conditionName: "Agriculture Sector",
            rules: [
              {
                questionText: "What industry sector are you in?",
                operator: "is",
                value: "agriculture",
              },
            ],
          },
        ],
        order: 8,
      },
      // Page 9: Livestock Specific (conditional)
      {
        pageId: "page9",
        pageType: "question",
        pageHeading: "Livestock Information",
        questions: [
          {
            questionId: "q12",
            label: "What types of livestock do you keep?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "cattle", text: "Cattle" },
              { value: "sheep", text: "Sheep" },
              { value: "pigs", text: "Pigs" },
              { value: "poultry", text: "Poultry" },
              { value: "horses", text: "Horses" },
            ],
          },
          {
            questionId: "q13",
            label: "Total number of animals",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond6",
            conditionName: "Livestock Farming",
            rules: [
              {
                questionText: "What type of agriculture do you practice?",
                operator: "is",
                value: "livestock",
              },
            ],
          },
        ],
        order: 9,
      },
      // Page 10: Manufacturing Specific (conditional)
      {
        pageId: "page10",
        pageType: "question",
        pageHeading: "Manufacturing Details",
        questions: [
          {
            questionId: "q14",
            label: "What do you manufacture?",
            type: "text",
            subType: "long-answer",
          },
          {
            questionId: "q15",
            label: "Production capacity (units per year)",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond7",
            conditionName: "Manufacturing Sector",
            rules: [
              {
                questionText: "What industry sector are you in?",
                operator: "is",
                value: "manufacturing",
              },
            ],
          },
        ],
        order: 10,
      },
      // Page 11: Compliance History
      {
        pageId: "page11",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q16",
            label: "Have you had any compliance issues in the last 5 years?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [],
        order: 11,
      },
      // Page 12: Compliance Details (conditional)
      {
        pageId: "page12",
        pageType: "question",
        pageHeading: "Compliance Details",
        questions: [
          {
            questionId: "q17",
            label: "Please describe the compliance issues",
            type: "text",
            subType: "long-answer",
          },
          {
            questionId: "q18",
            label: "When did these issues occur?",
            type: "date",
            subType: "day-month-year",
          },
          {
            questionId: "q19",
            label: "Have these issues been resolved?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond8",
            conditionName: "Compliance Issues",
            rules: [
              {
                questionText:
                  "Have you had any compliance issues in the last 5 years?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 12,
      },
      // Page 13: Documentation
      {
        pageId: "page13",
        pageType: "question",
        pageHeading: "Supporting Documentation",
        questions: [
          {
            questionId: "q20",
            label: "Please upload your business plan",
            type: "file",
          },
          {
            questionId: "q21",
            label: "Please upload financial statements",
            type: "file",
          },
        ],
        conditions: [
          {
            id: "cond9",
            conditionName: "Large Business Documentation",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 13,
      },
      // Page 14: Additional Information
      {
        pageId: "page14",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q22",
            label: "Is there anything else you would like to tell us?",
            type: "text",
            subType: "long-answer",
          },
        ],
        conditions: [],
        order: 14,
      },
      // Page 15: Declaration
      {
        pageId: "page15",
        pageType: "guidance",
        guidanceOnlyHeadingInput: "Declaration",
        guidanceOnlyGuidanceTextInput:
          "By submitting this application, you confirm that all information provided is accurate and complete to the best of your knowledge. You understand that providing false information may result in the rejection of your application or legal action.",
        conditions: [],
        order: 15,
      },
      // Additional pages for extended demo
      // Page 16: Environmental Impact Assessment
      {
        pageId: "page16",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q23",
            label: "Do you conduct environmental impact assessments?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond10",
            conditionName: "Large Business Environmental",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 16,
      },
      // Page 17: Environmental Details
      {
        pageId: "page17",
        pageType: "question",
        pageHeading: "Environmental Assessment Details",
        questions: [
          {
            questionId: "q24",
            label: "What environmental assessments do you conduct?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "air-quality", text: "Air quality monitoring" },
              { value: "water-quality", text: "Water quality testing" },
              {
                value: "waste-management",
                text: "Waste management assessment",
              },
              { value: "biodiversity", text: "Biodiversity impact assessment" },
              { value: "carbon-footprint", text: "Carbon footprint analysis" },
            ],
          },
          {
            questionId: "q25",
            label: "Frequency of assessments",
            type: "list",
            subType: "radios",
            options: [
              { value: "monthly", text: "Monthly" },
              { value: "quarterly", text: "Quarterly" },
              { value: "annually", text: "Annually" },
              { value: "as-needed", text: "As needed" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond11",
            conditionName: "Environmental Assessment Required",
            rules: [
              {
                questionText:
                  "Do you conduct environmental impact assessments?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 17,
      },
      // Page 18: Health and Safety
      {
        pageId: "page18",
        pageType: "question",
        pageHeading: "Health and Safety Information",
        questions: [
          {
            questionId: "q26",
            label: "Do you have a health and safety policy?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
          {
            questionId: "q27",
            label: "Number of health and safety incidents in last year",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [],
        order: 18,
      },
      // Page 19: Training and Development
      {
        pageId: "page19",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q28",
            label: "Do you provide training to employees?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond12",
            conditionName: "Large Business Training",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 19,
      },
      // Page 20: Training Details
      {
        pageId: "page20",
        pageType: "question",
        pageHeading: "Training Program Details",
        questions: [
          {
            questionId: "q29",
            label: "What types of training do you provide?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "safety", text: "Health and safety training" },
              { value: "technical", text: "Technical skills training" },
              { value: "management", text: "Management training" },
              { value: "compliance", text: "Compliance training" },
              { value: "customer-service", text: "Customer service training" },
            ],
          },
          {
            questionId: "q30",
            label: "Average training hours per employee per year",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond13",
            conditionName: "Training Provided",
            rules: [
              {
                questionText: "Do you provide training to employees?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 20,
      },
      // Page 21: Quality Assurance
      {
        pageId: "page21",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q31",
            label: "Do you have a quality assurance system?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond14",
            conditionName: "Manufacturing Quality",
            rules: [
              {
                questionText: "What industry sector are you in?",
                operator: "is",
                value: "manufacturing",
              },
            ],
          },
        ],
        order: 21,
      },
      // Page 22: Quality System Details
      {
        pageId: "page22",
        pageType: "question",
        pageHeading: "Quality System Details",
        questions: [
          {
            questionId: "q32",
            label: "What quality standards do you follow?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "iso9001", text: "ISO 9001" },
              { value: "iso14001", text: "ISO 14001" },
              { value: "iso45001", text: "ISO 45001" },
              { value: "bsi", text: "BSI standards" },
              { value: "custom", text: "Custom standards" },
            ],
          },
          {
            questionId: "q33",
            label: "When was your last quality audit?",
            type: "date",
            subType: "day-month-year",
          },
        ],
        conditions: [
          {
            id: "cond15",
            conditionName: "Quality System Exists",
            rules: [
              {
                questionText: "Do you have a quality assurance system?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 22,
      },
      // Page 23: Supply Chain
      {
        pageId: "page23",
        pageType: "question",
        pageHeading: "",
        questions: [
          {
            questionId: "q34",
            label: "Do you have suppliers based outside the UK?",
            type: "list",
            subType: "yes-no",
            options: [
              { value: "yes", text: "Yes" },
              { value: "no", text: "No" },
            ],
          },
        ],
        conditions: [
          {
            id: "cond16",
            conditionName: "International Supply Chain",
            rules: [
              {
                questionText: "What type of business are you?",
                operator: "is",
                value: "limited-company",
              },
            ],
          },
        ],
        order: 23,
      },
      // Page 24: Supply Chain Details
      {
        pageId: "page24",
        pageType: "question",
        pageHeading: "International Supply Chain Details",
        questions: [
          {
            questionId: "q35",
            label: "Which countries do you source from?",
            type: "list",
            subType: "checkboxes",
            options: [
              { value: "china", text: "China" },
              { value: "india", text: "India" },
              { value: "usa", text: "United States" },
              { value: "germany", text: "Germany" },
              { value: "france", text: "France" },
              { value: "other-eu", text: "Other EU countries" },
              { value: "other", text: "Other countries" },
            ],
          },
          {
            questionId: "q36",
            label: "Percentage of materials sourced internationally",
            type: "text",
            subType: "numbers",
          },
        ],
        conditions: [
          {
            id: "cond17",
            conditionName: "International Suppliers",
            rules: [
              {
                questionText: "Do you have suppliers based outside the UK?",
                operator: "is",
                value: "yes",
              },
            ],
          },
        ],
        order: 24,
      },
      // Page 25: Final Review
      {
        pageId: "page25",
        pageType: "guidance",
        guidanceOnlyHeadingInput: "Final Review",
        guidanceOnlyGuidanceTextInput:
          "Please review all the information you have provided. Ensure all details are accurate and complete. You will have the opportunity to make changes on the next page before final submission.",
        conditions: [],
        order: 25,
      },
    ];

    // Create comprehensive form-level conditions
    const extendedDemoConditions = [
      {
        id: "form-cond1",
        conditionName: "Agriculture Business",
        rules: [
          {
            questionText: "What industry sector are you in?",
            operator: "is",
            value: "agriculture",
          },
        ],
      },
      {
        id: "form-cond2",
        conditionName: "Large Business",
        rules: [
          {
            questionText: "What type of business are you?",
            operator: "is",
            value: "limited-company",
          },
        ],
      },
      {
        id: "form-cond3",
        conditionName: "Compliance Issues",
        rules: [
          {
            questionText:
              "Have you had any compliance issues in the last 5 years?",
            operator: "is",
            value: "yes",
          },
        ],
      },
      {
        id: "form-cond4",
        conditionName: "Complex Application",
        rules: [
          {
            questionText: "What type of business are you?",
            operator: "is",
            value: "limited-company",
          },
          {
            logicalOperator: "AND",
            questionText: "What industry sector are you in?",
            operator: "is",
            value: "agriculture",
          },
        ],
      },
      {
        id: "form-cond5",
        conditionName: "Manufacturing with Quality",
        rules: [
          {
            questionText: "What industry sector are you in?",
            operator: "is",
            value: "manufacturing",
          },
          {
            logicalOperator: "AND",
            questionText: "Do you have a quality assurance system?",
            operator: "is",
            value: "yes",
          },
        ],
      },
      {
        id: "form-cond6",
        conditionName: "International Business",
        rules: [
          {
            questionText: "What type of business are you?",
            operator: "is",
            value: "limited-company",
          },
          {
            logicalOperator: "AND",
            questionText: "Do you have suppliers based outside the UK?",
            operator: "is",
            value: "yes",
          },
        ],
      },
    ];

    // Create extended demo sections
    const extendedDemoSections = [
      {
        id: "section1",
        name: "Business Information",
        title: "Business Information",
      },
      { id: "section2", name: "Contact Details", title: "Contact Details" },
      { id: "section3", name: "Industry Specific", title: "Industry Specific" },
      { id: "section4", name: "Compliance", title: "Compliance" },
      { id: "section5", name: "Documentation", title: "Documentation" },
      { id: "section6", name: "Environmental", title: "Environmental" },
      { id: "section7", name: "Health and Safety", title: "Health and Safety" },
      { id: "section8", name: "Training", title: "Training" },
      { id: "section9", name: "Quality", title: "Quality" },
      { id: "section10", name: "Supply Chain", title: "Supply Chain" },
    ];

    // No sections assigned to pages for cleaner interface

    res.render("titan-mvp-1.2/form-editor/listing/index", {
      formPages: extendedDemoFormPages,
      sections: extendedDemoSections,
      form: {
        name: "Extended Business Application Form",
      },
      request: req,
      data: {
        conditions: extendedDemoConditions,
        formName: "Extended Business Application Form",
      },
    });
  }
);

// Export the router
module.exports = router;

// Add preview route
router.get("/titan-mvp-1.2/form-editor/preview", function (req, res) {
  const formData = req.session.data || {};
  const rawPages = formData["formPages"] || [];
  // Show only the pages the user has explicitly added; never inject demo runner pages
  // Whitelist question types that are supported in editor preview (exclude payment here)
  const allowedTypes = new Set([
    "text",
    "list",
    "date",
    "email",
    "phone",
    "file",
    "address",
    "declaration",
    "autocomplete",
    "location",
    "payment"
  ]);

  const formPages = rawPages.map(p => ({
    ...p,
    questions: Array.isArray(p.questions)
      ? p.questions.filter(q => q && allowedTypes.has(q.type))
      : []
  }));

  res.render("titan-mvp-1.2/form-editor/preview", {
    data: { formPages },
    form: { name: formData.formName || "Form name" },
  });
});

// Add check answers route
router.get("/titan-mvp-1.2/form-editor/check-answers", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/check-answers", {
    data: { formPages: formPages },
    form: { name: formData.formName || "Form name" },
  });
});

// Route for prototype routing page
router.get("/titan-mvp-1.2/choose", function (req, res) {
  res.render("titan-mvp-1.2/choose");
});
router.get("/titan-mvp-1.2/choose.html", function (req, res) {
  res.render("titan-mvp-1.2/choose");
});

// Product pages routes
router.get("/titan-mvp-1.2/product-pages/features-4", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/features-4");
});

router.get("/titan-mvp-1.2/product-pages/features-3", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/features-3");
});

router.get("/titan-mvp-1.2/product-pages/features", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/features");
});

router.get("/titan-mvp-1.2/product-pages/homepage", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/homepage");
});

router.get("/titan-mvp-1.2/product-pages/about", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/about");
});

router.get("/titan-mvp-1.2/product-pages/support", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/support");
});

router.get("/titan-mvp-1.2/product-pages/get-started", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/get-started");
});

router.get("/titan-mvp-1.2/product-pages/resources", function (req, res) {
  res.render("titan-mvp-1.2/product-pages/resources");
});

// Metrics dashboard routes
router.get("/titan-mvp-1.2/metrics/v1", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v1");
});

router.get("/titan-mvp-1.2/metrics/v2", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v2");
});

router.get("/titan-mvp-1.2/metrics/v3", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v3");
});

router.get("/titan-mvp-1.2/metrics/v7", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v7");
});

router.get("/titan-mvp-1.2/metrics/v8", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v8");
});

router.get("/titan-mvp-1.2/metrics/v9", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v9");
});

router.get("/titan-mvp-1.2/metrics/v10", function (req, res) {
  res.render("titan-mvp-1.2/metrics/v10");
});

// Handle prototype routing selection
router.post("/titan-mvp-1.2/choose", function (req, res) {
  const selection = req.body.prototype;

  // Map selections to their corresponding routes
  const routeMap = {
    signIn: "/titan-mvp-1.2/sign-in",
    library: "/titan-mvp-1.2/library",
    newForm: "/titan-mvp-1.2/create-new-form/form-name",
    editor: "/titan-mvp-1.2/form-editor/listing",
    overview: "/titan-mvp-1.2/form-overview/index",
    "overview-index": "/titan-mvp-1.2/form-overview/index",
    "overview-support": "/titan-mvp-1.2/form-overview/index/support/phone",
    "overview-live": "/titan-mvp-1.2/form-overview/live/index",
    "editor-listing": "/titan-mvp-1.2/form-editor/listing",
    "editor-page-overview": "/titan-mvp-1.2/form-editor/page-overview",
    "editor-preview": "/titan-mvp-1.2/form-editor/preview",
  };

  // Redirect to the selected route or default to library if invalid selection
  const redirectPath = routeMap[selection] || "/titan-mvp-1.2/library";
  res.redirect(redirectPath);
});

// Helper function to convert email to semantic name
function emailToName(email) {
  if (!email) return "";
  const localPart = email.split("@")[0];
  const parts = localPart.split(/[._]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// Single checkbox proof of concept
router.get(
  "/titan-mvp-1.2/form-editor/question-type/declaration/runner/single-checkbox-poc",
  function (req, res) {
    res.render(
      "titan-mvp-1.2/form-editor/question-type/declaration/runner/single-checkbox-poc"
    );
  }
);

// Welcome email preview (GET)
router.get("/titan-mvp-1.2/email/welcome-preview", function (req, res) {
  const data = {
    email: req.query.email || "email address",
    role: req.query.role || "Form creator",
    addedBy: "Daniel Da Silveria",
  };
  res.render("titan-mvp-1.2/email/welcome-email", {
    data: data,
  });
});

// Admin panel page (GET)
router.get("/titan-mvp-1.2/roles/admin-panel", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.users) req.session.data.users = [];
  // Add semantic name and lowercase role to each user
  const usersWithNames = req.session.data.users.map((user) => ({
    ...user,
    semanticName: emailToName(user.email),
    role: user.role ? user.role.toLowerCase() : user.role,
  }));
  // Store and clear the success message
  const successMessage = req.session.data.successMessage;
  delete req.session.data.successMessage;

  // Check if there's a success message to show from query parameter
  const showSuccessMessage = req.query.success === 'true';

  res.render("titan-mvp-1.2/roles/admin-panel.html", {
    data: {
      users: usersWithNames,
      successMessage: successMessage,
    },
    showSuccessMessage: showSuccessMessage,
  });
});

// Admin panel download route (GET and POST)
router.get("/titan-mvp-1.2/roles/admin-panel/download", (req, res) => {
  // Redirect back to admin panel with success flag
  res.redirect("/titan-mvp-1.2/roles/admin-panel?success=true");
});

router.post("/titan-mvp-1.2/roles/admin-panel/download", (req, res) => {
  // Redirect back to admin panel with success flag
  res.redirect("/titan-mvp-1.2/roles/admin-panel?success=true");
});

// Manage users page (GET)
router.get("/titan-mvp-1.2/roles/manage-users.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.users) req.session.data.users = [];
  // Add semantic name and lowercase role to each user
  const usersWithNames = req.session.data.users.map((user) => ({
    ...user,
    semanticName: emailToName(user.email),
    role: user.role ? user.role.toLowerCase() : user.role,
  }));
  // Store and clear the success message
  const successMessage = req.session.data.successMessage;
  delete req.session.data.successMessage;
  res.render("titan-mvp-1.2/roles/manage-users.html", {
    data: {
      users: usersWithNames,
      successMessage: successMessage,
    },
  });
});

// Edit user (GET)
router.get("/titan-mvp-1.2/roles/edit-user.html", function (req, res) {
  console.log("EXPLICIT ROUTE: /titan-mvp-1.2/roles/edit-user.html");
  if (!req.session.data) req.session.data = {};
  const email = req.query.email;
  const user = (req.session.data.users || []).find((u) => u.email === email);
  if (!user) {
    return res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  }
  const userWithName = {
    ...user,
    semanticName: emailToName(user.email),
  };
  res.render("titan-mvp-1.2/roles/edit-user.html", {
    data: { user: userWithName },
  });
});

// Remove user confirmation page (GET)
router.get("/titan-mvp-1.2/roles/remove-user.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = req.query.email;
  const user = (req.session.data.users || []).find((u) => u.email === email);
  if (!user) {
    return res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  }
  const userWithName = {
    ...user,
    semanticName: emailToName(user.email),
  };
  res.render("titan-mvp-1.2/roles/remove-user.html", {
    data: { user: userWithName },
  });
});

// Remove user (POST)
router.post("/titan-mvp-1.2/remove-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = req.body.email;
  req.session.data.users = (req.session.data.users || []).filter(
    (u) => u.email !== email
  );
  req.session.data.successMessage = `You removed ${emailToName(
    email
  )} from Forms Designer and we've sent them an email to let them know.`;
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});

// Add user (POST)
router.post("/titan-mvp-1.2/save-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.users) req.session.data.users = [];
  const newUser = {
    email: req.body.email,
    role: req.body.role,
  };
  req.session.data.users.push(newUser);
  req.session.data.successMessage =
    "You added " +
    emailToName(newUser.email) +
    " and we've sent them an email to let them know.";
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});

// Update user (POST)
router.post("/titan-mvp-1.2/update-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = String(req.body.email || "");
  const newRole = req.body.role;
  const userIndex = (req.session.data.users || []).findIndex(
    (u) => u.email === email
  );
  if (userIndex !== -1) {
    req.session.data.users[userIndex].role = newRole;
  }
  req.session.data.successMessage = `You updated ${emailToName(
    email
  )}'s role to ${newRole}.`;
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});

// Delete page confirmation (GET)
router.get("/titan-mvp-1.2/form-editor/delete/:pageId", function (req, res) {
  const formData = req.session.data || {};
  const pageId = req.params.pageId;
  // Find the page index for the given pageId
  const formPages = formData.formPages || [];
  const pageIndex = formPages.findIndex(
    (page) => String(page.pageId) === String(pageId)
  );
  const pageNumber = pageIndex + 1;
  let pageHeading = "";
  let questionLabel = "";
  if (pageIndex !== -1) {
    const page = formPages[pageIndex];
    pageHeading = page.pageHeading || "";
    if (page.questions && page.questions.length > 0) {
      questionLabel = page.questions[0].label || "";
    }
  }
  res.render("titan-mvp-1.2/form-editor/delete.html", {
    form: {
      name: formData.formName || "Form name",
    },
    pageNumber: pageNumber,
    pageId: pageId,
    pageHeading: pageHeading,
    questionLabel: questionLabel,
  });
});

// Delete page (POST)
router.post("/titan-mvp-1.2/delete-page", function (req, res) {
  const pageId = req.body.pageId;
  const formPages = req.session.data["formPages"] || [];

  // Find and remove the page
  const pageIndex = formPages.findIndex(
    (page) => String(page.pageId) === String(pageId)
  );
  if (pageIndex !== -1) {
    formPages.splice(pageIndex, 1);
    req.session.data["formPages"] = formPages;
  }

  // Redirect back to the listing page
  res.redirect("/titan-mvp-1.2/form-editor/listing");
});

// **** PAGE REORDERING ****************************************************

router.get("/titan-mvp-1.2/form-editor/reorder/main.html", function (req, res) {
  console.log("DEBUG reorder route session data:", req.session.data);
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/reorder/main.html", {
    formPages: formPages,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Helper: Detect page order conflicts
function detectPageOrderConflicts(formPages, originalOrder) {
  // Build a map of questionId -> page index for current order
  const questionToPageIndex = {};
  formPages.forEach((page, pageIdx) => {
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((q) => {
        if (q.questionId) {
          questionToPageIndex[q.questionId] = pageIdx;
        }
      });
    }
  });
  // Build a map for the original order if provided
  let originalQuestionToPageIndex = {};
  let originalPageIdToIndex = {};
  let originalPageIdToTitle = {};
  if (originalOrder && Array.isArray(originalOrder)) {
    originalOrder.forEach((page, pageIdx) => {
      originalPageIdToIndex[page.pageId] = pageIdx;
      // Use pageHeading, or fallback to first question's label
      originalPageIdToTitle[page.pageId] =
        page.pageHeading ||
        (page.questions && page.questions[0] && page.questions[0].label) ||
        null;
      if (page.questions && Array.isArray(page.questions)) {
        page.questions.forEach((q) => {
          if (q.questionId) {
            originalQuestionToPageIndex[q.questionId] = pageIdx;
          }
        });
      }
    });
  }
  // Find conflicts
  const conflicts = [];
  formPages.forEach((page, pageIdx) => {
    if (page.conditions) {
      page.conditions.forEach((condition) => {
        if (condition.rules) {
          condition.rules.forEach((rule) => {
            // Match rule.questionText to question.label
            const questionEntry = Object.entries(questionToPageIndex).find(
              ([qid, idx]) => {
                if (
                  !formPages[idx].questions ||
                  !Array.isArray(formPages[idx].questions)
                ) {
                  return false;
                }
                const question = formPages[idx].questions.find(
                  (q) => String(q.questionId) === String(qid)
                );
                return question && question.label === rule.questionText;
              }
            );
            if (questionEntry) {
              const [qid, questionPageIdx] = questionEntry;
              if (questionPageIdx > pageIdx) {
                // Find original page numbers and title if possible
                let originalConditionPageNumber = null;
                let originalQuestionPageNumber = null;
                let originalPageTitle = null;
                if (originalOrder && Array.isArray(originalOrder)) {
                  const origPageIdx = originalPageIdToIndex[page.pageId];
                  originalConditionPageNumber =
                    origPageIdx !== undefined ? origPageIdx + 1 : null;
                  originalPageTitle =
                    originalPageIdToTitle[page.pageId] || null;
                  const origQPageIdx = originalQuestionToPageIndex[qid];
                  originalQuestionPageNumber =
                    origQPageIdx !== undefined ? origQPageIdx + 1 : null;
                }
                // Always provide a title for the new order as well
                const newPageTitle =
                  page.pageHeading ||
                  (page.questions &&
                    page.questions[0] &&
                    page.questions[0].label) ||
                  null;
                conflicts.push({
                  pageId: page.pageId, // Add pageId for backend processing
                  pageWithCondition: newPageTitle || `Page ${pageIdx + 1}`,
                  pageNumber: pageIdx + 1,
                  conditionName:
                    condition.conditionName || `Condition ${condition.id}`,
                  conditionText:
                    condition.text ||
                    condition.conditionName ||
                    `Condition ${condition.id}`,
                  referencedQuestion: rule.questionText,
                  questionPageNumber: questionPageIdx + 1,
                  conditionId: condition.id,
                  canMoveQuestion: true,
                  canMovePage: true,
                  // New fields for before/after
                  originalConditionPageNumber,
                  originalQuestionPageNumber,
                  originalPageTitle,
                  conditionValue: rule.value,
                  // Include the full condition rules for display
                  rules: condition.rules || [],
                });
              }
            }
          });
        }
      });
    }
  });
  return conflicts;
}

// Update page order and check for conflicts
router.post("/titan-mvp-1.2/update-page-order", function (req, res) {
  const orderedIds = req.body.orderedIds;
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.json({ success: false, message: "Invalid order provided" });
  }

  // Get the existing pages from session
  const formPages = req.session.data["formPages"] || [];

  // Build a new array in the order specified by orderedIds
  const newOrder = [];
  orderedIds.forEach((id) => {
    const page = formPages.find((page) => String(page.pageId) === id);
    if (page) {
      newOrder.push(page);
    }
  });

  // If we have a valid new order, update the session and check for conflicts
  if (newOrder.length > 0) {
    // Save the original order before updating
    const originalOrder = [...formPages];
    req.session.data["formPages"] = newOrder;
    // Detect conflicts, passing the original order
    const conflicts = detectPageOrderConflicts(newOrder, originalOrder);
    if (conflicts.length > 0) {
      req.session.data.pageOrderConflicts = conflicts;
      return res.json({
        success: false,
        redirect: "/titan-mvp-1.2/form-editor/reorder/resolve-page-conflicts",
      });
    } else {
      req.session.data.pageOrderConflicts = null;
      return res.json({
        success: true,
        redirect:
          "/titan-mvp-1.2/form-editor/listing.html?pageOrderUpdated=true",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "No pages found for the new order",
    });
  }
});

// Route to resolve page order conflicts after reordering
router.get(
  "/titan-mvp-1.2/form-editor/reorder/resolve-page-conflicts",
  function (req, res) {
    const formData = req.session.data || {};
    const conflicts = formData.pageOrderConflicts || [];
    res.render(
      "titan-mvp-1.2/form-editor/reorder/resolve-page-conflicts.html",
      {
        form: { name: formData.formName || "Form name" },
        conflicts,
        warnings: [],
      }
    );
  }
);
// Handle force save with condition removal
router.post(
  "/titan-mvp-1.2/form-editor/reorder/resolve-page-conflicts",
  function (req, res) {
    const formData = req.session.data || {};
    const conflicts = formData.pageOrderConflicts || [];
    const formPages = formData.formPages || [];

    // Remove all conditions that are in the conflicts list
    conflicts.forEach((conflict) => {
      const page = formPages.find((p) => p.pageId === conflict.pageId);
      if (page && page.conditions) {
        page.conditions = page.conditions.filter(
          (c) => String(c.id) !== String(conflict.conditionId)
        );
      }
    });

    // Clear the conflicts from session
    delete req.session.data.pageOrderConflicts;

    // Save the updated pages back to session
    req.session.data.formPages = formPages;

    // Redirect to the listing page with success message
    res.redirect(
      "/titan-mvp-1.2/form-editor/listing.html?pageOrderUpdated=true"
    );
  }
);

// Update the guidance overview route
router.post("/titan-mvp-1.2/form-editor/guidance/overview", (req, res) => {
  console.log("Form submission received:", req.body);
  console.log("Current session data:", req.session.data);

  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  console.log("Page index:", pageIndex);
  console.log("Current page:", formPages[pageIndex]);

  // Get the current page
  const currentPage = formPages[pageIndex];

  // Handle section data
  const sectionId = req.body.section;
  let section = null;
  if (sectionId) {
    const sections = formData.sections || [];
    const foundSection = sections.find((s) => s.id === sectionId);
    if (foundSection) {
      section = {
        id: foundSection.id,
        name: foundSection.name,
      };
    }
  }

  // Update the current page with the guidance configuration and section data
  formPages[pageIndex] = {
    ...currentPage,
    pageType: "guidance",
    guidanceOnlyHeadingInput: req.body.guidanceOnlyHeadingInput,
    guidanceOnlyGuidanceTextInput: req.body.guidanceOnlyGuidanceTextInput,
    isExitPage: Array.isArray(req.body.exitPage)
      ? req.body.exitPage.includes("true")
      : req.body.exitPage === "true",
    lastUpdated: new Date().toISOString(),
    section: section,
  };

  console.log("Updated page:", formPages[pageIndex]);

  // Update the session data
  req.session.data = {
    ...formData,
    formPages: formPages,
    formDetails: {
      ...formData.formDetails,
      lastUpdated: new Date().toISOString(),
    },
  };

  console.log("Updated session data:", req.session.data);

  // Redirect back to the guidance configuration page
  res.redirect(
    "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
  );
});

// Add this GET route for guidance configuration
router.get(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html",
  function (req, res) {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"];
    const formData = req.session.data || {};
    const pageNumber = pageIndex + 1;

    // Get the current page from the session
    const currentPage = formPages[pageIndex];

    if (!currentPage) {
      console.log("No current page found:", {
        pageIndex,
        formPagesLength: formPages.length,
      });
      return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
    }

    console.log("Rendering guidance config with page:", currentPage);

    res.render(
      "titan-mvp-1.2/form-editor/question-type/guidance-configuration.html",
      {
        currentPage: currentPage,
        data: req.session.data,
        form: {
          name: formData.formName || "Form name",
        },
        pageNumber: pageNumber,
        sections: formData.sections || [], // Add sections data here
      }
    );
  }
);

// Custom address plugin routes to override the plugin's default behavior
// These routes use local templates instead of the plugin's templates
router.get("/dwp-find-an-address-plugin/start", (req, res) => {
  res.redirect("/dwp-find-an-address-plugin");
});

router.get("/dwp-find-an-address-plugin", (req, res) => {
  res.render("titan-mvp-1.2/dwp-find-an-address-plugin/index.njk");
});

router.post("/dwp-find-an-address-plugin", (req, res) => {
  const { searchString, postcode } = req.body;
  if (!postcode && !searchString) {
    res.render("titan-mvp-1.2/dwp-find-an-address-plugin/index.njk", {
      error: "Enter a postcode, the first line of an address, or both.",
    });
  } else {
    if (!postcode) {
      // Import the utility functions from the plugin
      const {
        getAddressesSearchString,
      } = require("find-an-address-plugin/utils/getData");
      getAddressesSearchString(searchString).then((data) => {
        if (data.length > 0) {
          if (data.length == 1) {
            req.session.data.address = data;
            res.render(
              "titan-mvp-1.2/dwp-find-an-address-plugin/confirm-address.njk",
              {
                addressData: data[0],
              }
            );
          } else {
            req.session.data.results = data;
            req.session.data.postcode = postcode;
            res.render(
              "titan-mvp-1.2/dwp-find-an-address-plugin/address-select-multi.njk",
              {
                addressData: data,
              }
            );
          }
        } else {
          res.render("titan-mvp-1.2/dwp-find-an-address-plugin/no-address.njk");
        }
      });
    }

    if (!searchString) {
      // Import the utility functions from the plugin
      const {
        getAddressesPostcode,
      } = require("find-an-address-plugin/utils/getData");
      getAddressesPostcode(postcode).then((data) => {
        if (data.length > 0) {
          if (data.length == 1) {
            req.session.data.address = data;
            res.render(
              "titan-mvp-1.2/dwp-find-an-address-plugin/confirm-address.njk",
              {
                addressData: data,
              }
            );
          } else {
            req.session.data.results = data;
            req.session.data.postcode = postcode;
            res.render(
              "titan-mvp-1.2/dwp-find-an-address-plugin/address-select-multi.njk",
              {
                addressData: data,
              }
            );
          }
        } else {
          res.render("titan-mvp-1.2/dwp-find-an-address-plugin/no-address.njk");
        }
      });
    }

    if (postcode && searchString) {
      // Import the utility functions from the plugin
      const {
        getAddressesPostcode,
      } = require("find-an-address-plugin/utils/getData");
      getAddressesPostcode(postcode).then((data) => {
        if (data.length > 0) {
          const filteredAddresses = data.filter((item) => {
            if (item.indexOf(searchString.toUpperCase()) !== -1) {
              return item;
            }
          });
          if (filteredAddresses.length > 0) {
            if (filteredAddresses.length == 1) {
              req.session.data.address = filteredAddresses[0];
              req.session.data.results = filteredAddresses;
              res.render(
                "titan-mvp-1.2/dwp-find-an-address-plugin/confirm-address.njk",
                {
                  addressData: filteredAddresses,
                }
              );
            } else {
              req.session.data.results = filteredAddresses;
              req.session.data.postcode = postcode;
              req.session.data.searchString = searchString;
              res.render(
                "titan-mvp-1.2/dwp-find-an-address-plugin/address-select-multi.njk",
                {
                  addressData: filteredAddresses,
                }
              );
            }
          } else {
            res.render(
              "titan-mvp-1.2/dwp-find-an-address-plugin/no-address.njk"
            );
          }
        } else {
          res.render("titan-mvp-1.2/dwp-find-an-address-plugin/no-address.njk");
        }
      });
    }
  }
});

router.post("/dwp-find-an-address-plugin/confirm-address", (req, res) => {
  const address = req.body["select-an-address"];
  if (address) {
    req.session.data.address = address;
    res.redirect(req.body.find_an_address_exit_url || "/");
  } else {
    res.redirect("/dwp-find-an-address-plugin/address-select-multi");
  }
});

router.post("/dwp-find-an-address-plugin/manual-entry", (req, res) => {
  const addressLine1 = req.body["address-line-1"];
  const addressLine2 = req.body["address-line-2"];
  const townCity = req.body["town-city"];
  const postcode = req.body["postcode"];

  const error = {
    addressLineError:
      addressLine1 == "" ? "Enter the first line of the address" : undefined,
    townOrCityError: townCity == "" ? "Enter the town or city" : undefined,
    postcodeError: postcode == "" ? "Enter the postcode" : undefined,
  };

  if (error.addressLineError || error.townOrCityError || error.postcodeError) {
    res.render("titan-mvp-1.2/dwp-find-an-address-plugin/manual-entry.njk", {
      error,
    });
  } else {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin/manual-confirm-address.njk",
      {
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        townCity: townCity,
        postcode: postcode,
      }
    );
  }
});

router.get("/dwp-find-an-address-plugin/manual-entry", (req, res) => {
  res.render("titan-mvp-1.2/dwp-find-an-address-plugin/manual-entry.njk");
});

router.get("/dwp-find-an-address-plugin/address-select-multi", (req, res) => {
  const addressData = req.session.data.results || [];
  const postcode = req.session.data.postcode || "";
  const searchString = req.session.data.searchString || "";

  res.render(
    "titan-mvp-1.2/dwp-find-an-address-plugin/address-select-multi.njk",
    {
      addressData: addressData,
      data: {
        postcode: postcode,
        searchString: searchString,
        results: addressData,
      },
    }
  );
});

router.post("/dwp-find-an-address-plugin/address-select-multi", (req, res) => {
  const selectedAddress = req.body["select-an-address"];

  if (selectedAddress && selectedAddress !== "") {
    // Store the selected address in session
    req.session.data.address = selectedAddress;
    // Redirect to confirm-address page to show the selected address
    res.redirect("/dwp-find-an-address-plugin/confirm-address");
  } else {
    // If no address selected, redirect back to selection page with error
    res.redirect("/dwp-find-an-address-plugin/address-select-multi");
  }
});

router.get("/dwp-find-an-address-plugin/test", (req, res) => {
  res.sendFile(
    process.cwd() +
      "/app/views/titan-mvp-1.2/dwp-find-an-address-plugin/test-address-select.html"
  );
});

// Simplified address plugin routes (without building number/name field and confirm step)
router.get("/dwp-find-an-address-plugin-simple/start", (req, res) => {
  res.redirect("/dwp-find-an-address-plugin-simple");
});

router.get("/dwp-find-an-address-plugin-simple", (req, res) => {
  res.render("titan-mvp-1.2/dwp-find-an-address-plugin-simple/index.njk");
});

router.post("/dwp-find-an-address-plugin-simple", (req, res) => {
  const { addressPostcode } = req.body;
  if (!addressPostcode) {
    res.render("titan-mvp-1.2/dwp-find-an-address-plugin-simple/index.njk", {
      error: "Enter a postcode.",
    });
  } else {
    // Import the utility functions from the plugin
    const {
      getAddressesPostcode,
    } = require("find-an-address-plugin/utils/getData");
    getAddressesPostcode(addressPostcode).then((data) => {
      if (data.length > 0) {
        if (data.length == 1) {
          req.session.data.address = data[0];
          res.redirect(req.query.find_an_address_exit_url || "/");
        } else {
          req.session.data.results = data;
          req.session.data.postcode = addressPostcode;
          res.render(
            "titan-mvp-1.2/dwp-find-an-address-plugin-simple/address-select-multi.njk",
            {
              addressData: data,
            }
          );
        }
      } else {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-simple/no-address.njk"
        );
      }
    });
  }
});

router.get(
  "/dwp-find-an-address-plugin-simple/address-select-multi",
  (req, res) => {
    const addressData = req.session.data.results || [];
    const postcode = req.session.data.postcode || "";

    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-simple/address-select-multi.njk",
      {
        addressData: addressData,
        data: {
          postcode: postcode,
          results: addressData,
        },
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-simple/address-select-multi",
  (req, res) => {
    const selectedAddress = req.body["select-an-address"];

    if (selectedAddress && selectedAddress !== "") {
      // Store the selected address in session
      req.session.data.address = selectedAddress;
      // Redirect directly to exit URL (no confirm step)
      res.redirect(req.query.find_an_address_exit_url || "/");
    } else {
      // If no address selected, redirect back to selection page with error
      res.redirect("/dwp-find-an-address-plugin-simple/address-select-multi");
    }
  }
);

router.get("/dwp-find-an-address-plugin-simple/manual-entry", (req, res) => {
  res.render(
    "titan-mvp-1.2/dwp-find-an-address-plugin-simple/manual-entry.njk"
  );
});

router.post("/dwp-find-an-address-plugin-simple/manual-entry", (req, res) => {
  const addressLine1 = req.body["address-line-1"];
  const addressLine2 = req.body["address-line-2"];
  const townCity = req.body["town-city"];
  const postcode = req.body["postcode"];

  const error = {
    addressLineError:
      addressLine1 == "" ? "Enter the first line of the address" : undefined,
    townOrCityError: townCity == "" ? "Enter the town or city" : undefined,
    postcodeError: postcode == "" ? "Enter the postcode" : undefined,
  };

  if (error.addressLineError || error.townOrCityError || error.postcodeError) {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-simple/manual-entry.njk",
      {
        error,
      }
    );
  } else {
    // Store manual address and redirect directly to exit URL (no confirm step)
    req.session.data.address = `${addressLine1}${
      addressLine2 ? ", " + addressLine2 : ""
    }, ${townCity}, ${postcode}`;
    res.redirect(req.query.find_an_address_exit_url || "/");
  }
});

// Helper function to parse address string into components
function parseAddressString(addressString) {
  if (!addressString) return {};

  // Split by comma and clean up whitespace
  const parts = addressString.split(",").map((part) => part.trim());

  // UK postcode regex pattern
  const postcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i;

  // Find the postcode (usually the last part that matches postcode pattern)
  let postcode = "";
  let postcodeIndex = -1;

  for (let i = parts.length - 1; i >= 0; i--) {
    if (postcodeRegex.test(parts[i])) {
      postcode = parts[i];
      postcodeIndex = i;
      break;
    }
  }

  // Remove postcode from parts array
  const addressParts = parts.filter((_, index) => index !== postcodeIndex);

  // Assign remaining parts
  const result = {
    addressLine1: addressParts[0] || "",
    addressLine2: addressParts[1] || "",
    townCity: addressParts[2] || "",
    addressPostcode: postcode,
  };

  return result;
}

// Integrated address plugin routes (shows pattern with other questions on same page)
router.get(
  "/dwp-find-an-address-plugin-integrated/question-one",
  (req, res) => {
    // Handle search again - clear address results when clearResults=true
    if (req.query.clearResults === "true") {
      console.log("Clearing results and redirecting..."); // Debug log
      req.session.data.addressResults = [];
      req.session.data.selectedAddress = null;
      req.session.data.addressMode = "lookup";
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;
      // Clear the postcode and building name to force a fresh search
      req.session.data.addressPostcode = "";
      req.session.data.buildingNameNumber = "";
      // Redirect to clean URL to prevent form resubmission dialog
      return res.redirect(
        "/dwp-find-an-address-plugin-integrated/question-one"
      );
    }

    // Handle switching to manual mode
    if (req.query.addressMode === "manual") {
      if (req.session.data.selectedAddress || req.query.selectedAddress) {
        // Parse selected address if available
        const addressToParse =
          req.query.selectedAddress || req.session.data.selectedAddress;
        const parsedAddress = parseAddressString(addressToParse);
        req.session.data = {
          ...req.session.data,
          addressMode: "manual",
          addressLine1: parsedAddress.addressLine1,
          addressLine2: parsedAddress.addressLine2,
          townCity: parsedAddress.townCity,
          addressPostcode:
            parsedAddress.addressPostcode || req.session.data.addressPostcode,
        };
      } else {
        // Just switch to manual mode without parsing address
        req.session.data = {
          ...req.session.data,
          addressMode: "manual",
          // Preserve building name/number if it exists
          buildingNameNumber: req.session.data.buildingNameNumber || "",
        };
      }
    }

    // Handle switching to lookup mode (without clearResults)
    if (req.query.addressMode === "lookup" && !req.query.clearResults) {
      req.session.data = {
        ...req.session.data,
        addressMode: "lookup",
        // Preserve building name/number if it exists
        buildingNameNumber: req.session.data.buildingNameNumber || "",
        // Don't clear address results - preserve them so user can see the dropdown
      };
    }

    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-integrated/question-one.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-integrated/question-one",
  (req, res) => {
    const {
      action,
      addressMode,
      name,
      email,
      addressPostcode,
      buildingNameNumber,
      selectAddress,
      addressLine1,
      addressLine2,
      townCity,
    } = req.body;

    // Store all form data in session
    req.session.data = {
      ...req.session.data,
      name,
      email,
      addressPostcode,
      buildingNameNumber,
      addressLine1,
      addressLine2,
      townCity,
      addressMode: addressMode || "lookup",
    };

    if (action === "lookup") {
      // Handle address lookup
      if (!addressPostcode) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-integrated/question-one.njk",
          {
            data: req.session.data,
            error: {
              addressError: "Enter a postcode",
            },
          }
        );
      } else {
        // Import the utility functions from the plugin
        const {
          getAddressesPostcode,
        } = require("find-an-address-plugin/utils/getData");

        getAddressesPostcode(addressPostcode)
          .then((data) => {
            console.log("Address lookup results:", data); // Debug log
            console.log("Building name/number:", buildingNameNumber); // Debug log
            if (data.length > 0) {
              let filteredData = data;

              // Filter by building name/number if provided
              if (buildingNameNumber && buildingNameNumber.trim()) {
                console.log(
                  "Filtering by building name/number:",
                  buildingNameNumber
                ); // Debug log
                filteredData = data.filter((item) => {
                  const match =
                    item
                      .toUpperCase()
                      .indexOf(buildingNameNumber.toUpperCase()) !== -1;
                  console.log(
                    "Checking item:",
                    item,
                    "against:",
                    buildingNameNumber,
                    "match:",
                    match
                  ); // Debug log
                  return match;
                });
                console.log(
                  "Filtered addresses by building name/number:",
                  filteredData
                ); // Debug log
              }

              // Store results in session
              req.session.data.addressResults = filteredData.map(
                (address, index) => ({
                  value: address,
                  text: address,
                })
              );
              req.session.data.searchPerformed = true;
              req.session.data.noResults = filteredData.length === 0;

              // Auto-select single address if only one result
              if (filteredData.length === 1) {
                req.session.data.selectedAddress = filteredData[0];
              }
              console.log(
                "Stored address results:",
                req.session.data.addressResults
              ); // Debug log

              // PRG redirect back to the same page with anchor
              res.redirect(
                "/dwp-find-an-address-plugin-integrated/question-one#address"
              );
            } else {
              // No addresses found
              req.session.data.addressResults = [];
              req.session.data.searchPerformed = true;
              req.session.data.noResults = true;
              console.log("No addresses found for postcode:", addressPostcode); // Debug log
              res.redirect(
                "/dwp-find-an-address-plugin-integrated/question-one#address"
              );
            }
          })
          .catch(() => {
            // Error in lookup
            req.session.data.addressResults = [];
            req.session.data.searchPerformed = true;
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-integrated/question-one#address"
            );
          });
      }
    } else if (action === "continue") {
      // Handle form submission
      const error = {
        nameError: !name ? "Enter your full name" : undefined,
        emailError: !email ? "Enter your email address" : undefined,
        addressError: undefined,
      };

      // Validate address based on mode
      if (addressMode === "manual") {
        if (!addressLine1 || !townCity || !addressPostcode) {
          error.addressError = "Enter all required address details";
        }
      } else {
        if (!selectAddress && !req.session.data.selectedAddress) {
          error.addressError = "Select an address or enter one manually";
        }
      }

      if (error.nameError || error.emailError || error.addressError) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-integrated/question-one.njk",
          {
            data: req.session.data,
            error,
          }
        );
      } else {
        // Store selected address if using lookup
        if (addressMode === "lookup" && selectAddress) {
          req.session.data.selectedAddress = selectAddress;
        }

        // Redirect to confirmation page
        res.redirect("/dwp-find-an-address-plugin-integrated/confirmation");
      }
    }
  }
);

router.get(
  "/dwp-find-an-address-plugin-integrated/confirmation",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-integrated/confirmation.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-integrated/confirmation",
  (req, res) => {
    // Clear session data and redirect to success page
    req.session.data = {};
    res.redirect("/dwp-find-an-address-plugin-integrated/success");
  }
);

router.get("/dwp-find-an-address-plugin-integrated/success", (req, res) => {
  res.render("titan-mvp-1.2/dwp-find-an-address-plugin-integrated/success.njk");
});

// Standalone address plugin routes (address question on its own page)
router.get(
  "/dwp-find-an-address-plugin-standalone/address-question",
  (req, res) => {
    // Handle search again - clear address results when clearResults=true
    if (req.query.clearResults === "true") {
      console.log("Clearing results and redirecting..."); // Debug log
      req.session.data.addressResults = [];
      req.session.data.selectedAddress = null;
      req.session.data.addressMode = "lookup";
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;
      req.session.data.buildingNameNumber = null;

      // Redirect to clean URL to prevent form resubmission dialog
      return res.redirect(
        "/dwp-find-an-address-plugin-standalone/address-question"
      );
    }

    // Handle switching to manual mode
    if (req.query.addressMode === "manual") {
      if (req.query.selectedAddress) {
        // Parse selected address and populate manual fields
        const selectedAddress = decodeURIComponent(req.query.selectedAddress);
        const parsedAddress = parseAddressString(selectedAddress);

        req.session.data.addressMode = "manual";
        req.session.data.selectedAddress = selectedAddress;
        req.session.data.addressLine1 = parsedAddress.addressLine1;
        req.session.data.addressLine2 = parsedAddress.addressLine2;
        req.session.data.townCity = parsedAddress.townCity;
        req.session.data.addressPostcode = parsedAddress.addressPostcode;
      } else {
        // Switch to manual mode without selected address
        req.session.data.addressMode = "manual";
        // Preserve building name/number if switching from lookup
        if (req.session.data.addressMode !== "manual") {
          // Keep existing building name/number
        }
      }
    }

    // Handle switching to lookup mode
    if (req.query.addressMode === "lookup") {
      req.session.data.addressMode = "lookup";
      // Preserve building name/number if switching from manual
      if (req.session.data.addressMode !== "lookup") {
        // Keep existing building name/number
      }
    }

    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-standalone/address-question.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-standalone/address-question",
  (req, res) => {
    const {
      action,
      addressMode,
      addressPostcode,
      buildingNameNumber,
      addressLine1,
      addressLine2,
      townCity,
      selectAddress,
    } = req.body;

    // Store form data in session
    req.session.data = {
      ...req.session.data,
      addressMode: addressMode || req.session.data.addressMode || "lookup",
      addressPostcode,
      buildingNameNumber,
      addressLine1,
      addressLine2,
      townCity,
      selectedAddress: selectAddress || req.session.data.selectedAddress,
    };

    if (action === "lookup") {
      // Handle address lookup
      if (!addressPostcode) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-standalone/address-question.njk",
          {
            data: req.session.data,
            error: {
              addressError: "Enter a postcode",
            },
          }
        );
        return;
      }

      // Perform address lookup
      const {
        getAddressesPostcode,
        getAddressesSearchString,
      } = require("find-an-address-plugin/utils/getData");

      if (buildingNameNumber) {
        // Search with building name/number
        getAddressesSearchString(addressPostcode, buildingNameNumber)
          .then((data) => {
            console.log("Search results:", data); // Debug log

            // Filter results by building name/number
            const filteredData = data.filter((address) => {
              const addressText = address.text.toLowerCase();
              const buildingSearch = buildingNameNumber.toLowerCase();
              return addressText.indexOf(buildingSearch) !== -1;
            });

            console.log("Filtered results:", filteredData); // Debug log

            if (filteredData.length > 0) {
              req.session.data.addressResults = filteredData.map(
                (address, index) => ({
                  value: address,
                  text: address,
                })
              );
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;

              // Auto-select single address if only one result
              if (filteredData.length === 1) {
                req.session.data.selectedAddress = filteredData[0];
              }

              console.log("Addresses found:", filteredData.length); // Debug log
              // PRG redirect back to the same page with anchor
              res.redirect(
                "/dwp-find-an-address-plugin-standalone/address-question#address"
              );
            } else {
              // No addresses found
              req.session.data.addressResults = [];
              req.session.data.searchPerformed = true;
              req.session.data.noResults = true;

              console.log("No addresses found for postcode:", addressPostcode); // Debug log
              res.redirect(
                "/dwp-find-an-address-plugin-standalone/address-question#address"
              );
            }
          })
          .catch(() => {
            // Error in lookup
            req.session.data.addressResults = [];
            req.session.data.searchPerformed = true;
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-standalone/address-question#address"
            );
          });
      } else {
        // Search without building name/number
        getAddressesPostcode(addressPostcode)
          .then((data) => {
            console.log("Postcode search results:", data); // Debug log

            if (data && data.length > 0) {
              req.session.data.addressResults = data.map((address, index) => ({
                value: address,
                text: address,
              }));
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;

              // Auto-select single address if only one result
              if (data.length === 1) {
                req.session.data.selectedAddress = data[0];
              }

              console.log("Addresses found:", data.length); // Debug log
              // PRG redirect back to the same page with anchor
              res.redirect(
                "/dwp-find-an-address-plugin-standalone/address-question#address"
              );
            } else {
              // No addresses found
              req.session.data.addressResults = [];
              req.session.data.searchPerformed = true;
              req.session.data.noResults = true;

              console.log("No addresses found for postcode:", addressPostcode); // Debug log
              res.redirect(
                "/dwp-find-an-address-plugin-standalone/address-question#address"
              );
            }
          })
          .catch(() => {
            // Error in lookup
            req.session.data.addressResults = [];
            req.session.data.searchPerformed = true;
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-standalone/address-question#address"
            );
          });
      }
    } else if (action === "continue") {
      // Handle form submission
      let error = {};

      // Validate address
      if (req.session.data.addressMode === "manual") {
        // Manual address validation
        if (!addressLine1) error.addressError = "Enter address line 1";
        if (!townCity) error.addressError = "Enter town or city";
        if (!addressPostcode) error.addressError = "Enter postcode";
      } else {
        // Lookup mode validation
        if (!selectAddress) error.addressError = "Select an address";
      }

      if (error.addressError) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-standalone/address-question.njk",
          {
            data: req.session.data,
            error,
          }
        );
      } else {
        // Store final address
        if (req.session.data.addressMode === "manual") {
          req.session.data.finalAddress = `${addressLine1}${
            addressLine2 ? ", " + addressLine2 : ""
          }, ${townCity}, ${addressPostcode}`;
        } else {
          req.session.data.finalAddress = selectAddress;
        }

        // Redirect to confirmation page
        res.redirect("/dwp-find-an-address-plugin-standalone/confirmation");
      }
    }
  }
);

router.get(
  "/dwp-find-an-address-plugin-standalone/confirmation",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-standalone/confirmation.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-standalone/confirmation",
  (req, res) => {
    // Clear session data and redirect to success page
    req.session.data = {};
    res.redirect("/dwp-find-an-address-plugin-standalone/success");
  }
);

router.get("/dwp-find-an-address-plugin-standalone/success", (req, res) => {
  res.render("titan-mvp-1.2/dwp-find-an-address-plugin-standalone/success.njk");
});

// Mini-journey address plugin routes (separate pages for address journey)
router.get(
  "/dwp-find-an-address-plugin-mini-journey/question-one",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/question-one.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/question-one",
  (req, res) => {
    const { action, name, email } = req.body;

    // Store form data in session
    req.session.data = {
      ...req.session.data,
      name,
      email,
    };

    if (action === "continue") {
      // Handle form submission
      let error = {};

      // Validate fields
      if (!name) error.nameError = "Enter your full name";
      if (!email) error.emailError = "Enter your email address";
      if (!req.session.data.selectedAddress && !req.session.data.finalAddress) {
        error.addressError = "Select an address";
      }

      if (error.nameError || error.emailError || error.addressError) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/question-one.njk",
          {
            data: req.session.data,
            error,
          }
        );
      } else {
        // Redirect to confirmation page
        res.redirect("/dwp-find-an-address-plugin-mini-journey/confirmation");
      }
    }
  }
);

// Postcode entry page
router.get(
  "/dwp-find-an-address-plugin-mini-journey/postcode-entry",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/postcode-entry.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-mini-journey/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/postcode-entry",
  (req, res) => {
    const { action, addressPostcode, buildingNameNumber, returnUrl } = req.body;

    // Store form data in session
    req.session.data = {
      ...req.session.data,
      addressPostcode,
      buildingNameNumber,
      returnUrl,
    };

    if (action === "lookup") {
      // Handle address lookup
      if (!addressPostcode) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/postcode-entry.njk",
          {
            data: req.session.data,
            returnUrl,
            error: {
              addressError: "Enter a postcode",
            },
          }
        );
        return;
      }

      // Perform address lookup
      const {
        getAddressesPostcode,
        getAddressesSearchString,
      } = require("find-an-address-plugin/utils/getData");

      if (buildingNameNumber) {
        // Search with building name/number
        getAddressesSearchString(addressPostcode, buildingNameNumber)
          .then((data) => {
            // Filter results by building name/number
            const filteredData = data.filter((address) => {
              const addressText = address.toLowerCase();
              const buildingSearch = buildingNameNumber.toLowerCase();
              return addressText.indexOf(buildingSearch) !== -1;
            });

            if (filteredData.length > 0) {
              req.session.data.addressResults = filteredData.map(
                (address, index) => ({
                  value: address,
                  text: address,
                })
              );
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;

              res.redirect(
                "/dwp-find-an-address-plugin-mini-journey/address-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            } else {
              // No addresses found
              req.session.data.addressResults = [];
              req.session.data.searchPerformed = true;
              req.session.data.noResults = true;

              res.redirect(
                "/dwp-find-an-address-plugin-mini-journey/no-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            }
          })
          .catch(() => {
            // Error in lookup
            req.session.data.addressResults = [];
            req.session.data.searchPerformed = true;
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-mini-journey/no-results?returnUrl=" +
                encodeURIComponent(returnUrl)
            );
          });
      } else {
        // Search without building name/number
        getAddressesPostcode(addressPostcode)
          .then((data) => {
            if (data && data.length > 0) {
              req.session.data.addressResults = data.map((address, index) => ({
                value: address,
                text: address,
              }));
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;

              res.redirect(
                "/dwp-find-an-address-plugin-mini-journey/address-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            } else {
              // No addresses found
              req.session.data.addressResults = [];
              req.session.data.searchPerformed = true;
              req.session.data.noResults = true;

              res.redirect(
                "/dwp-find-an-address-plugin-mini-journey/no-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            }
          })
          .catch(() => {
            // Error in lookup
            req.session.data.addressResults = [];
            req.session.data.searchPerformed = true;
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-mini-journey/no-results?returnUrl=" +
                encodeURIComponent(returnUrl)
            );
          });
      }
    } else if (action === "manual") {
      // Redirect to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// Address results page
router.get(
  "/dwp-find-an-address-plugin-mini-journey/address-results",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/address-results.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-mini-journey/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/address-results",
  (req, res) => {
    const { action, selectAddress, returnUrl } = req.body;

    if (action === "use-address") {
      if (!selectAddress) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/address-results.njk",
          {
            data: req.session.data,
            returnUrl,
            error: {
              addressError: "Select an address",
            },
          }
        );
        return;
      }

      // Store selected address and return to main page
      req.session.data.selectedAddress = selectAddress;
      req.session.data.finalAddress = selectAddress;

      res.redirect(returnUrl);
    } else if (action === "search-again") {
      // Clear results and go back to postcode entry
      req.session.data.addressResults = [];
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;

      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "manual") {
      // Go to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// Manual entry page
router.get(
  "/dwp-find-an-address-plugin-mini-journey/manual-entry",
  (req, res) => {
    // Handle selectedAddress parameter - parse it into individual fields
    if (req.query.selectedAddress) {
      const selectedAddress = decodeURIComponent(req.query.selectedAddress);
      const parsedAddress = parseAddressString(selectedAddress);

      // Update session data with parsed address fields
      req.session.data.addressLine1 = parsedAddress.addressLine1;
      req.session.data.addressLine2 = parsedAddress.addressLine2;
      req.session.data.townCity = parsedAddress.townCity;
      req.session.data.addressPostcode = parsedAddress.addressPostcode;
      req.session.data.selectedAddress = selectedAddress;
    }

    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/manual-entry.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-mini-journey/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/manual-entry",
  (req, res) => {
    const {
      action,
      addressLine1,
      addressLine2,
      townCity,
      addressPostcode,
      returnUrl,
    } = req.body;

    if (action === "use-manual-address") {
      // Validate manual address
      let error = {};

      if (!addressLine1) error.addressLineError = "Enter address line 1";
      if (!townCity) error.townOrCityError = "Enter town or city";
      if (!addressPostcode) error.postcodeError = "Enter postcode";

      if (
        error.addressLineError ||
        error.townOrCityError ||
        error.postcodeError
      ) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/manual-entry.njk",
          {
            data: req.session.data,
            returnUrl,
            error,
          }
        );
        return;
      }

      // Store manual address and return to main page
      const manualAddress = `${addressLine1}${
        addressLine2 ? ", " + addressLine2 : ""
      }, ${townCity}, ${addressPostcode}`;
      req.session.data.finalAddress = manualAddress;
      req.session.data.selectedAddress = manualAddress;

      res.redirect(returnUrl);
    } else if (action === "lookup") {
      // Go to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// No results page
router.get(
  "/dwp-find-an-address-plugin-mini-journey/no-results",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/no-results.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-mini-journey/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/no-results",
  (req, res) => {
    const { action, returnUrl } = req.body;

    if (action === "search-again") {
      // Clear results and go back to postcode entry
      req.session.data.addressResults = [];
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;

      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "manual") {
      // Go to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-mini-journey/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// Confirmation page
router.get(
  "/dwp-find-an-address-plugin-mini-journey/confirmation",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/confirmation.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-mini-journey/confirmation",
  (req, res) => {
    // Clear session data and redirect to success page
    req.session.data = {};
    res.redirect("/dwp-find-an-address-plugin-mini-journey/success");
  }
);

router.get("/dwp-find-an-address-plugin-mini-journey/success", (req, res) => {
  res.render(
    "titan-mvp-1.2/dwp-find-an-address-plugin-mini-journey/success.njk"
  );
});

// Single-question address plugin routes (address question only)
router.get(
  "/dwp-find-an-address-plugin-single-question/question-one",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/question-one.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/question-one",
  (req, res) => {
    const { action, returnUrl } = req.body;

    if (action === "continue") {
      // Validate that an address has been selected
      if (!req.session.data.selectedAddress && !req.session.data.finalAddress) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/question-one.njk",
          {
            data: req.session.data,
            returnUrl,
            error: {
              addressError: "Find or enter manually your business address",
            },
          }
        );
        return;
      }

      // Redirect to confirmation page
      res.redirect("/dwp-find-an-address-plugin-single-question/confirmation");
    } else if (action === "exit") {
      // Handle save and exit
      res.redirect("/dwp-find-an-address-plugin-single-question/success");
    }
  }
);

// Postcode entry page
router.get(
  "/dwp-find-an-address-plugin-single-question/postcode-entry",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/postcode-entry.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-single-question/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/postcode-entry",
  (req, res) => {
    const { action, addressPostcode, buildingNameNumber, returnUrl } = req.body;

    // Store form data in session
    req.session.data = {
      ...req.session.data,
      addressPostcode,
      buildingNameNumber,
      returnUrl,
    };

    if (action === "lookup") {
      // Handle address lookup
      if (!addressPostcode) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/postcode-entry.njk",
          {
            data: req.session.data,
            returnUrl,
            error: {
              addressError: "Enter a postcode",
            },
          }
        );
        return;
      }

      // Perform address lookup
      const {
        getAddressesPostcode,
        getAddressesSearchString,
      } = require("find-an-address-plugin/utils/getData");

      if (buildingNameNumber) {
        // Search with building name/number
        getAddressesSearchString(addressPostcode, buildingNameNumber)
          .then((data) => {
            // Filter results by building name/number
            const filteredData = data.filter((address) => {
              const addressText = address.toLowerCase();
              const buildingSearch = buildingNameNumber.toLowerCase();
              return addressText.indexOf(buildingSearch) !== -1;
            });

            if (filteredData.length > 0) {
              req.session.data.addressResults = filteredData.map(
                (address, index) => ({
                  value: address,
                  text: address,
                })
              );
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;
              res.redirect(
                "/dwp-find-an-address-plugin-single-question/address-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            } else {
              req.session.data.noResults = true;
              res.redirect(
                "/dwp-find-an-address-plugin-single-question/no-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            }
          })
          .catch((error) => {
            console.error("Address search error:", error);
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-single-question/no-results?returnUrl=" +
                encodeURIComponent(returnUrl)
            );
          });
      } else {
        // Search with postcode only
        getAddressesPostcode(addressPostcode)
          .then((data) => {
            if (data && data.length > 0) {
              req.session.data.addressResults = data.map((address, index) => ({
                value: address,
                text: address,
              }));
              req.session.data.searchPerformed = true;
              req.session.data.noResults = false;
              res.redirect(
                "/dwp-find-an-address-plugin-single-question/address-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            } else {
              req.session.data.noResults = true;
              res.redirect(
                "/dwp-find-an-address-plugin-single-question/no-results?returnUrl=" +
                  encodeURIComponent(returnUrl)
              );
            }
          })
          .catch((error) => {
            console.error("Address search error:", error);
            req.session.data.noResults = true;
            res.redirect(
              "/dwp-find-an-address-plugin-single-question/no-results?returnUrl=" +
                encodeURIComponent(returnUrl)
            );
          });
      }
    } else if (action === "manual") {
      // Go to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to main page
      res.redirect(returnUrl);
    }
  }
);

// Address results page
router.get(
  "/dwp-find-an-address-plugin-single-question/address-results",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/address-results.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-single-question/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/address-results",
  (req, res) => {
    const { action, selectAddress, returnUrl } = req.body;

    if (action === "use-address") {
      if (!selectAddress) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/address-results.njk",
          {
            data: req.session.data,
            returnUrl,
            error: {
              addressError: "Select an address",
            },
          }
        );
        return;
      }

      // Store selected address and return to main page
      req.session.data.selectedAddress = selectAddress;
      req.session.data.finalAddress = selectAddress;

      res.redirect(returnUrl);
    } else if (action === "search-again") {
      // Clear results and go back to postcode entry
      req.session.data.addressResults = [];
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;

      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "manual") {
      // Go to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// Manual entry page
router.get(
  "/dwp-find-an-address-plugin-single-question/manual-entry",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/manual-entry.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-single-question/question-one",
        selectedAddress: req.query.selectedAddress,
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/manual-entry",
  (req, res) => {
    const {
      action,
      addressLine1,
      addressLine2,
      townCity,
      addressPostcode,
      returnUrl,
    } = req.body;

    if (action === "use-manual-address") {
      // Validate manual address
      let error = {};

      if (!addressLine1) error.addressLineError = "Enter address line 1";
      if (!townCity) error.townOrCityError = "Enter town or city";
      if (!addressPostcode) error.postcodeError = "Enter postcode";

      if (
        error.addressLineError ||
        error.townOrCityError ||
        error.postcodeError
      ) {
        res.render(
          "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/manual-entry.njk",
          {
            data: req.session.data,
            returnUrl,
            error,
          }
        );
        return;
      }

      // Store manual address and return to main page
      const manualAddress = `${addressLine1}${
        addressLine2 ? ", " + addressLine2 : ""
      }, ${townCity}, ${addressPostcode}`;
      req.session.data.finalAddress = manualAddress;
      req.session.data.selectedAddress = manualAddress;

      res.redirect(returnUrl);
    } else if (action === "lookup") {
      // Go to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// No results page
router.get(
  "/dwp-find-an-address-plugin-single-question/no-results",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/no-results.njk",
      {
        data: req.session.data || {},
        returnUrl:
          req.query.returnUrl ||
          "/dwp-find-an-address-plugin-single-question/question-one",
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/no-results",
  (req, res) => {
    const { action, returnUrl } = req.body;

    if (action === "search-again") {
      // Clear results and go back to postcode entry
      req.session.data.addressResults = [];
      req.session.data.searchPerformed = false;
      req.session.data.noResults = false;

      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "manual") {
      // Go to manual entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/manual-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    } else if (action === "back") {
      // Go back to postcode entry
      res.redirect(
        "/dwp-find-an-address-plugin-single-question/postcode-entry?returnUrl=" +
          encodeURIComponent(returnUrl)
      );
    }
  }
);

// Confirmation page
router.get(
  "/dwp-find-an-address-plugin-single-question/confirmation",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/confirmation.njk",
      {
        data: req.session.data || {},
      }
    );
  }
);

router.post(
  "/dwp-find-an-address-plugin-single-question/confirmation",
  (req, res) => {
    // Clear session data and redirect to success page
    req.session.data = {};
    res.redirect("/dwp-find-an-address-plugin-single-question/success");
  }
);

router.get(
  "/dwp-find-an-address-plugin-single-question/success",
  (req, res) => {
    res.render(
      "titan-mvp-1.2/dwp-find-an-address-plugin-single-question/success.njk"
    );
  }
);

const findAddressPlugin = require("find-an-address-plugin");

findAddressPlugin(router);

//--------------------------------------
// Edit an existing guidance page
//--------------------------------------
router.get("/titan-mvp-1.2/form-editor/edit-guidance", function (req, res) {
  const pageId = (req.query.pageId || "").trim();
  console.log("Editing guidance page with ID:", pageId);

  if (!pageId) {
    console.log("No pageId provided – redirecting to listing.");
    return res.redirect("/titan-mvp-1/form-editor/listing.html");
  }

  // Retrieve formPages from session
  const formPages = req.session.data["formPages"] || [];

  // Find the guidance page
  const foundPageIndex = formPages.findIndex(
    (page) => String(page.pageId) === pageId && page.pageType === "guidance"
  );

  if (foundPageIndex === -1) {
    console.log("Guidance page not found – redirecting to listing.");
    return res.redirect("/titan-mvp-1/form-editor/listing.html");
  }

  // Set the found page as the current page for editing
  req.session.data["currentPageIndex"] = foundPageIndex;

  const guidancePage = formPages[foundPageIndex];
  console.log("Editing guidance page details:", guidancePage);

  res.redirect(
    "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
  );
});

// API endpoint for creating new sections
router.post("/titan-mvp-1.2/form-editor/api/sections", (req, res) => {
  try {
    const formData = req.session.data || {};
    const sections = formData.sections || [];
    const newSection = {
      id: Date.now().toString(), // Simple unique ID
      name: req.body.name,
      description: req.body.description || "",
      pages: [],
    };
    sections.push(newSection);
    req.session.data.sections = sections;
    console.log("Created new section:", newSection);
    console.log("Updated sections:", sections);
    res.json(newSection);
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
});

// Create new section page (no JS)
router.get("/titan-mvp-1.2/form-editor/section/create", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/section/create.html", {
    data: req.session.data,
    form: {
      name: req.session.data.formName || "Form name",
    },
  });
});

// Handle section creation (no JS)
router.post("/titan-mvp-1.2/form-editor/section/create", function (req, res) {
  const sectionName = req.body.sectionName;
  const returnUrl =
    req.body.returnUrl ||
    "/titan-mvp-1.2/form-editor/question-type/guidance-configuration-nojs.html";

  if (!sectionName) {
    // Redirect back with error
    return res.redirect(
      returnUrl + "?showCreateSection=true&error=Section name is required"
    );
  }

  // Create new section
  const sections = req.session.data.sections || [];
  const newSection = {
    id: Date.now().toString(), // Simple ID generation
    name: sectionName,
  };
  sections.push(newSection);
  req.session.data.sections = sections;

  // Redirect back to the form with the new section selected
  res.redirect(returnUrl + "?section=" + newSection.id);
});

// Handle the POST request for editing conditions (adapted from 1.0)
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/edit",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.body.conditionId;

    // Find the original condition before updating
    let originalCondition = null;
    let foundInFormLevel = false;

    // First check form-level conditions
    if (formData.conditions) {
      const formLevelIndex = formData.conditions.findIndex(
        (c) => String(c.id) === conditionId
      );
      if (formLevelIndex !== -1) {
        originalCondition = JSON.parse(
          JSON.stringify(formData.conditions[formLevelIndex])
        ); // Deep copy
        foundInFormLevel = true;
      }
    }

    // If not found in form-level, check page-level conditions
    if (!originalCondition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === conditionId
          );
          if (found) {
            originalCondition = JSON.parse(JSON.stringify(found)); // Deep copy
            break;
          }
        }
      }
    }

    if (!originalCondition) {
      console.error("Condition not found:", conditionId);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
        rules =
          typeof req.body.rules === "string"
            ? JSON.parse(req.body.rules)
            : req.body.rules;
        if (!Array.isArray(rules)) {
          rules = [rules];
        }
      } else {
        console.error("No rules provided in request");
        rules = [];
      }
    } catch (e) {
      console.error("Error handling rules:", e);
      rules = [];
    }

    // Check if this is a joined condition update
    let updatedCondition;
    if (rules.length === 1 && rules[0].type === "joined") {
      const joinedRule = rules[0];
      const conditionIds = joinedRule.conditionIds;
      const logicalOperator = joinedRule.logicalOperator;

      // Find all the conditions to be joined
      const conditionsToJoin = [];

      // First check form-level conditions
      if (formData.conditions) {
        formData.conditions.forEach((condition) => {
          if (
            conditionIds.includes(condition.id.toString()) &&
            !conditionsToJoin.some((c) => c.id === condition.id)
          ) {
            conditionsToJoin.push(condition);
          }
        });
      }

      // Then check page-level conditions
      formPages.forEach((page) => {
        if (page.conditions) {
          page.conditions.forEach((condition) => {
            if (
              conditionIds.includes(condition.id.toString()) &&
              !conditionsToJoin.some((c) => c.id === condition.id)
            ) {
              conditionsToJoin.push(condition);
            }
          });
        }
      });

      // Sort conditions to match the order of conditionIds
      conditionsToJoin.sort((a, b) => {
        return (
          conditionIds.indexOf(a.id.toString()) -
          conditionIds.indexOf(b.id.toString())
        );
      });

      // Create the updated joined condition
      updatedCondition = {
        id: conditionId,
        conditionName: req.body.conditionName,
        logicalOperator: logicalOperator,
        joinedConditionIds: conditionIds, // Store the condition IDs that were joined
        rules: [],
      };

      // Add rules from all conditions, setting logicalOperator for every rule after the first
      let ruleCounter = 0;
      conditionsToJoin.forEach((condition) => {
        if (condition.rules && Array.isArray(condition.rules)) {
          condition.rules.forEach((rule) => {
            updatedCondition.rules.push({
              ...rule,
              logicalOperator: ruleCounter === 0 ? null : logicalOperator,
            });
            ruleCounter++;
          });
        }
      });

      // Create the text representation of the joined condition
      updatedCondition.text = updatedCondition.rules
        .map((rule, idx) => {
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          // Add the logical operator before all but the first rule
          if (idx > 0 && rule.logicalOperator) {
            return `${rule.logicalOperator} '${rule.questionText}' ${rule.operator} ${valueText}`;
          }
          return `'${rule.questionText}' ${rule.operator} ${valueText}`;
        })
        .join(" ");
    } else {
      // Handle regular condition update
      updatedCondition = {
        id: conditionId,
        conditionName: req.body.conditionName,
        rules: rules.map((rule) => ({
          questionText: rule.questionText,
          operator: rule.operator,
          value: rule.value,
          logicalOperator: rule.logicalOperator,
        })),
        text: rules
          .map((rule, index) => {
            const valueText = Array.isArray(rule.value)
              ? rule.value.map((v) => `'${v}'`).join(" or ")
              : `'${rule.value}'`;
            return index === 0
              ? `${rule.questionText} ${rule.operator} ${valueText}`
              : `${rule.logicalOperator} ${rule.questionText} ${rule.operator} ${valueText}`;
          })
          .join(" "),
      };
    }

    // --- NEW: Store pending changes instead of updating formPages ---
    let selectedPages = [];
    if (Array.isArray(req.body.pages)) {
      selectedPages = req.body.pages;
    } else if (req.body.pages) {
      selectedPages = [req.body.pages];
    }

    // Store the current pagesWithCondition before updating formPages
    const beforePagesWithCondition = formPages
      .filter(
        (page) =>
          page.conditions &&
          page.conditions.some((c) => String(c.id) === String(conditionId))
      )
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    req.session.data.originalCondition = originalCondition;
    req.session.data.pendingConditionUpdate = updatedCondition;
    req.session.data.pendingConditionPages = selectedPages;
    req.session.data._pagesWithConditionBeforeEdit = beforePagesWithCondition;

    // Redirect to the review page
    res.redirect("/titan-mvp-1.2/form-editor/conditions/edit-review");
  }
);

// ── AUTOCOMPLETE LIST CONFLICTS ──
router.get(
  "/titan-mvp-1.2/form-editor/question-type/autocomplete-nf/resolve-list-conflicts",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const questionIndex = formData.currentQuestionIndex || 0;
    const currentPage = formPages[pageIndex] || { questions: [] };
    const question =
      currentPage.questions &&
      Array.isArray(currentPage.questions) &&
      currentPage.questions[questionIndex]
        ? currentPage.questions[questionIndex]
        : {};

    // Try to get newItems from stored session data first, then fall back to current question
    let newItems = formData.pendingNewItems || [];
    if (newItems.length === 0 && Array.isArray(question.options)) {
      newItems = question.options.map((opt) =>
        typeof opt === "object" ? opt.label || opt.value : opt
      );
    }

    // Use stored conflicts from session (already in correct format)
    let conflicts = formData.conflicts || [];

    res.render(
      "titan-mvp-1.2/form-editor/question-type/autocomplete-nf/resolve-list-conflicts",
      {
        conflicts,
        newItems,
        question: {
          label: question.label || "Question",
          options: question.options || [],
        },
      }
    );
  }
);

// Handle POST for resolving conflicts
router.post(
  "/titan-mvp-1.2/form-editor/question-type/autocomplete-nf/resolve-list-conflicts",
  (req, res) => {
    const formData = req.session.data || {};
    const mapping = req.body.mapping || {};
    const conditions = formData.conditions || [];
    // For each mapping, update all rules in all conditions
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      for (const condition of conditions) {
        for (const rule of condition.rules || []) {
          if (Array.isArray(rule.value)) {
            rule.value = rule.value.map((val) =>
              val === oldValue ? newValue : val
            );
          } else if (rule.value === oldValue) {
            rule.value = newValue;
          }
        }
      }
    }
    req.session.data.conditions = conditions;

    // Clear the conflict data from session
    delete req.session.data.conflicts;
    delete req.session.data.pendingNewItems;
    delete req.session.data.pendingQuestionOptions;

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/page-overview");
  }
);

// Choose section for ungrouped question (GET)
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/choose-section",
  function (req, res) {
    console.log("=== CHOOSE SECTION ROUTE HIT ===");
    console.log("Full URL:", req.url);
    console.log("Query params:", JSON.stringify(req.query, null, 2));
    console.log("Session data exists:", !!req.session.data);
    console.log("RAW session.data:", JSON.stringify(req.session.data, null, 2));

    const itemId = req.query.item;
    let item = null;
    const checkAnswersItems = req.session.data.checkAnswersItems || [];
    const sections = req.session.data.sections || [];

    // Log available IDs for debugging
    console.log("=== CHOOSE SECTION DEBUG ===");
    console.log("Requested itemId:", itemId, "Type:", typeof itemId);
    console.log(
      "Available IDs:",
      checkAnswersItems.map((i) => i.id)
    );
    console.log("Session checkAnswersItems length:", checkAnswersItems.length);
    console.log(
      "Session checkAnswersItems:",
      JSON.stringify(checkAnswersItems, null, 2)
    );
    console.log(
      "Available sections:",
      sections.map((s) => ({ id: s.id, title: s.title }))
    );

    // Try both string and number comparison
    item = checkAnswersItems.find((i) => String(i.id) === String(itemId));
    console.log("Found item:", item);

    if (!item) {
      // Show debug info in template
      return res.render(
        "titan-mvp-1.2/form-editor/check-answers/choose-section.html",
        {
          item: null,
          sections,
          debug: {
            itemId,
            availableIds: checkAnswersItems.map((i) => i.id),
            sessionData: checkAnswersItems,
            sections: sections,
          },
        }
      );
    }
    res.render("titan-mvp-1.2/form-editor/check-answers/choose-section.html", {
      item,
      sections,
      debug: null,
    });
  }
);

// Choose section for ungrouped question (POST)
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/choose-section",
  function (req, res) {
    console.log("=== CHOOSE SECTION POST ===");
    console.log("Request body:", req.body);

    const itemId = req.body.itemId;
    const sectionId = req.body.sectionId;
    let item = null;
    const checkAnswersItems = req.session.data.checkAnswersItems || [];
    const sections = req.session.data.sections || [];

    console.log("ItemId:", itemId, "SectionId:", sectionId);
    console.log(
      "Available items:",
      checkAnswersItems.map((i) => ({ id: i.id, key: i.key }))
    );
    console.log(
      "Available sections:",
      sections.map((s) => ({ id: s.id, title: s.title }))
    );

    item = checkAnswersItems.find((i) => String(i.id) === String(itemId));

    if (!item) {
      console.error("Item not found in checkAnswersItems:", itemId);
      return res.redirect("/titan-mvp-1.2/form-editor/check-answers/organize");
    }

    if (item && sectionId) {
      // Convert sectionId to number to match the frontend format
      const numericSectionId = parseInt(sectionId);
      item.section = numericSectionId;
      // Save back to session
      req.session.data.checkAnswersItems = checkAnswersItems;
      console.log("Updated item", itemId, "to section", numericSectionId);
    }

    res.redirect("/titan-mvp-1.2/form-editor/check-answers/organize");
  }
);

// Test route to check session data
router.get("/titan-mvp-1.2/test-session", function (req, res) {
  console.log("=== TEST SESSION ROUTE ===");
  console.log("Session data:", JSON.stringify(req.session.data, null, 2));

  res.json({
    checkAnswersItems: req.session.data.checkAnswersItems || [],
    sections: req.session.data.sections || [],
    hasData: !!req.session.data,
    sessionData: req.session.data,
  });
});

// Test route to simulate choose-section with item ID 1
router.get("/titan-mvp-1.2/test-choose-section-1", function (req, res) {
  const itemId = "1";
  const checkAnswersItems = req.session.data.checkAnswersItems || [];

  console.log("=== TEST CHOOSE SECTION ===");
  console.log("ItemId:", itemId);
  console.log("CheckAnswersItems:", checkAnswersItems);

  const item = checkAnswersItems.find((i) => String(i.id) === String(itemId));
  console.log("Found item:", item);

  res.json({
    itemId: itemId,
    item: item,
    checkAnswersItems: checkAnswersItems,
    found: !!item,
  });
});

// Test route to clear session data and see guidance page
router.get("/titan-mvp-1.2/clear-session", function (req, res) {
  console.log("=== CLEARING SESSION DATA ===");

  // Clear the checkAnswersItems and sections from session
  delete req.session.data.checkAnswersItems;
  delete req.session.data.sections;

  console.log("Session data cleared");
  res.json({
    message:
      "Session data cleared successfully. Refresh the page to see the default structure with pages containing multiple questions.",
    cleared: true,
  });
});

// Debug route to see current session data
router.get("/titan-mvp-1.2/debug-session", function (req, res) {
  console.log("=== DEBUGGING SESSION DATA ===");
  console.log(
    "checkAnswersItems:",
    JSON.stringify(req.session.data.checkAnswersItems, null, 2)
  );
  console.log("sections:", JSON.stringify(req.session.data.sections, null, 2));

  res.json({
    checkAnswersItems: req.session.data.checkAnswersItems || [],
    sections: req.session.data.sections || [],
    message: "Session data logged to console",
  });
});

// Test route for choose-section template
router.get("/titan-mvp-1.2/test-choose-section", function (req, res) {
  const testItem = {
    id: 1,
    key: "Test question text",
    value: "Test answer",
  };
  const testSections = [
    { id: "section1", name: "Test Section 1", title: "Test Section 1" },
    { id: "section2", name: "Test Section 2", title: "Test Section 2" },
  ];

  res.render("titan-mvp-1.2/form-editor/check-answers/choose-section.html", {
    item: testItem,
    sections: testSections,
  });
});
// Organize check answers page (GET)
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/organize",
  function (req, res) {
    if (!req.session.data.checkAnswersItems) {
      req.session.data.checkAnswersItems = [
        {
          id: 1,
          type: "page",
          key: "Business details",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Business registered with RPA", value: "Yes" },
            { label: "Business name", value: "Doe Farms Ltd" },
            { label: "Business address", value: "123 Farm Lane, Rural Town" },
          ],
        },
        {
          id: 2,
          type: "question",
          key: "Country for livestock",
          value: "England",
          section: null,
        },
        {
          id: 3,
          type: "question",
          key: "Arrival date of livestock",
          value: "20 04 2024",
          section: null,
        },
        {
          id: 4,
          type: "page",
          key: "Livestock information",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Type of livestock", value: "Cow" },
            { label: "Number of animals", value: "25" },
            { label: "Breed", value: "Holstein Friesian" },
          ],
        },
        {
          id: 5,
          type: "question",
          key: "Applicant's name",
          value: "John Doe",
          section: null,
        },
        {
          id: 6,
          type: "page",
          key: "Contact details",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Main phone number", value: "07700 900457" },
            { label: "Email address", value: "john.doe@example.com" },
            { label: "Alternative contact", value: "Jane Doe - 07700 900458" },
          ],
        },
        {
          id: 7,
          type: "question",
          key: "Business purpose",
          value: "Livestock farming",
          section: null,
        },
        {
          id: 8,
          type: "question",
          key: "National Grid field number",
          value: "NG123456",
          section: null,
        },
        {
          id: 9,
          type: "question",
          key: "Methodology statement",
          value: "1 file uploaded",
          section: null,
        },
        {
          id: 10,
          type: "guidance",
          key: "Important information",
          value: "Guidance page",
          section: null,
          guidanceText:
            "Please ensure all information provided is accurate and up to date. This helps us process your application more efficiently.",
        },
        {
          id: 11,
          type: "guidance",
          key: "Data protection notice",
          value: "Guidance page",
          section: null,
          guidanceText:
            "Your personal information will be processed in accordance with the Data Protection Act 2018. We will only use your data for the purposes stated in this application.",
        },
        {
          id: 12,
          type: "guidance",
          key: "Application process",
          value: "Guidance page",
          section: null,
          guidanceText:
            "After submitting your application, we will review the information provided and may contact you for additional details. Processing typically takes 10-15 working days.",
        },
      ];
    }

    // Initialize sections if they don't exist
    if (!req.session.data.sections) {
      req.session.data.sections = [
        {
          id: "section1",
          name: "Business details",
          title: "Business details",
        },
        {
          id: "section2",
          name: "Livestock information",
          title: "Livestock information",
        },
        {
          id: "section3",
          name: "Contact details",
          title: "Contact details",
        },
      ];
    }

    res.render("titan-mvp-1.2/form-editor/check-answers/organize.html");
  }
);

// Get session data for check answers
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/get-session-data",
  (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({
      checkAnswersItems: req.session.data.checkAnswersItems || [],
      sections: req.session.data.sections || [],
      declarationText: req.session.data.declarationText || "",
      declarationOption: req.session.data.declarationOption || "no-declaration",
      confirmationEmailEnabled: req.session.data.confirmationEmailEnabled,
      referenceNumberEnabled: req.session.data.referenceNumberEnabled,
      feedbackPageEnabled: req.session.data.feedbackPageEnabled,
      savedAnswersEnabled: req.session.data.savedAnswersEnabled,
    });
  }
);

// Sync checkAnswersItems and sections from frontend JS to session
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/sync",
  express.json(),
  (req, res) => {
    console.log("=== SYNC ENDPOINT HIT ===");
    console.log("Request body:", req.body);
    console.log(
      "Before sync - checkAnswersItems:",
      req.session.data.checkAnswersItems?.length || 0
    );
    console.log(
      "Before sync - sections:",
      req.session.data.sections?.length || 0
    );

    if (req.body.checkAnswersItems) {
      req.session.data.checkAnswersItems = req.body.checkAnswersItems;
      console.log(
        "Updated checkAnswersItems:",
        req.body.checkAnswersItems.length
      );
    }
    if (req.body.sections) {
      req.session.data.sections = req.body.sections;
      console.log("Updated sections:", req.body.sections.length);
      console.log(
        "Section details:",
        req.body.sections.map((s) => ({ id: s.id, title: s.title }))
      );
    }

    console.log(
      "After sync - checkAnswersItems:",
      req.session.data.checkAnswersItems?.length || 0
    );
    console.log(
      "After sync - sections:",
      req.session.data.sections?.length || 0
    );

    res.json({ success: true });
  }
);

// Save declaration text to session
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/save-declaration",
  express.json(),
  (req, res) => {
    console.log("=== SAVE DECLARATION ENDPOINT HIT ===");
    console.log("Request body:", req.body);

    if (req.body.declarationText !== undefined) {
      req.session.data.declarationText = req.body.declarationText;
      console.log("Saved declaration text:", req.body.declarationText);
    }

    res.json({ success: true });
  }
);

// Contact details routes - must come before support-pages-settings
// Add the correct GET handler for the new email form path
router.get("/titan-mvp-1.2/form-overview/support/add-email", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-email", {
    data: formData,
    form: {
      name: formData.formName || "Form name",
      support: {
        email: formData.formDetails?.support?.email || "",
      },
    },
    pageName: "Add email address for support",
  });
});

// Add the correct POST handler for the new form action
router.post("/titan-mvp-1.2/form-overview/support/add-email", (req, res) => {
  const formData = req.session.data || {};
  const emailAddress = req.body.emailAddress;
  const responseTime = req.body.responseTime;

  // Save to session data
  if (!formData.formDetails) {
    formData.formDetails = {};
  }
  if (!formData.formDetails.support) {
    formData.formDetails.support = {};
  }

  formData.formDetails.support.email = emailAddress;
  formData.formDetails.support.responseTime = responseTime;

  // Also save to top-level data for template access
  formData.emailAddress = emailAddress;
  formData.responseTime = responseTime;

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/support/add-email");
});

// Add the correct GET handler for the contact link form path
router.get(
  "/titan-mvp-1.2/form-overview/support/add-contact-link",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/add-contact-link", {
      data: formData,
      form: {
        name: formData.formName || "Form name",
        support: {
          link: formData.formDetails?.support?.link || "",
          linkDescription: formData.formDetails?.support?.linkDescription || "",
        },
      },
      pageName: "Add contact link for support",
    });
  }
);

// Add the correct POST handler for the contact link form
router.post(
  "/titan-mvp-1.2/form-overview/support/add-contact-link",
  (req, res) => {
    const formData = req.session.data || {};
    const contactLink = req.body.contactLink;
    const contactLinkDescription = req.body.contactLinkDescription;

    // Save to session data
    if (!formData.formDetails) {
      formData.formDetails = {};
    }
    if (!formData.formDetails.support) {
      formData.formDetails.support = {};
    }

    formData.formDetails.support.link = contactLink;
    formData.formDetails.support.linkDescription = contactLinkDescription;

    // Also save to top-level data for template access
    formData.contactLink = contactLink;
    formData.contactLinkDescription = contactLinkDescription;

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/support/add-contact-link");
  }
);

// Add the correct GET handler for the phone number form path
router.get("/titan-mvp-1.2/form-overview/support/add-telephone", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-telephone", {
    data: formData,
    form: {
      name: formData.formName || "Form name",
      support: {
        phone: formData.formDetails?.support?.phone || "",
      },
    },
    pageName: "Add phone number for support",
  });
});

// Add the correct POST handler for the phone number form
router.post(
  "/titan-mvp-1.2/form-overview/support/add-telephone",
  (req, res) => {
    const formData = req.session.data || {};
    const moreDetail = req.body.moreDetail;

    // Save to session data
    if (!formData.formDetails) {
      formData.formDetails = {};
    }
    if (!formData.formDetails.support) {
      formData.formDetails.support = {};
    }

    formData.formDetails.support.phone = moreDetail;

    // Also save to top-level data for template access
    formData.moreDetail = moreDetail;

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/support/add-telephone");
  }
);

// Support pages settings page with sub-navigation
router.get(
  "/titan-mvp-1.2/form-editor/support-pages-settings",
  function (req, res) {
    const tab = req.query.tab;
    const formData = req.session.data || {};

    // Determine which tab to show based on query params
    let currentTab = "contact-details";
    if (tab === "notifications") {
      currentTab = "notifications";
    } else if (tab === "privacy-notice") {
      currentTab = "privacy-notice";
    }

    // Add the current tab to the formData so it's accessible as data.supportCurrentTab
    formData.supportCurrentTab = currentTab;

    res.render("titan-mvp-1.2/form-editor/support-pages-settings", {
      data: formData,
    });
  }
);

// Modular settings page with reusable components
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/settings-modular",
  function (req, res) {
    const tab = req.query.tab;
    const add = req.query.add;
    const formData = req.session.data || {};

    // Initialize tab visibility flags if not present
    if (formData.showDeclarationTab === undefined)
      formData.showDeclarationTab = false;
    if (formData.showSectionsTab === undefined)
      formData.showSectionsTab = false;

    // Determine which tab to show based on query params
    let currentTab = "page-settings";
    if (add === "declaration") {
      formData.showDeclarationTab = true;
      currentTab = "declaration";
    } else if (add === "sections") {
      formData.showSectionsTab = true;
      currentTab = "sections";
    } else if (tab === "declaration") {
      formData.showDeclarationTab = true;
      currentTab = "declaration";
    } else if (tab === "confirmation-email") {
      currentTab = "confirmation-email";
    } else if (tab === "reference-number") {
      currentTab = "reference-number";
    } else if (tab === "sections") {
      formData.showSectionsTab = true;
      currentTab = "sections";
    } else if (tab === "feedback") {
      currentTab = "feedback";
    } else if (tab === "saved-answers") {
      currentTab = "saved-answers";
    }

    // Use savedAnswersEnabled from URL if present (so it works even when session doesn't persist)
    if (req.query.savedAnswersEnabled === "yes" || req.query.savedAnswersEnabled === "no") {
      formData.savedAnswersEnabled = req.query.savedAnswersEnabled;
      req.session.data = formData;
    }
    // Default so template always has a value when on saved-answers tab (avoids undefined when opening via nav)
    if (currentTab === "saved-answers" && (formData.savedAnswersEnabled !== "yes" && formData.savedAnswersEnabled !== "no")) {
      formData.savedAnswersEnabled = "no";
    }

    // If we're on a specific tab, make sure the tab is visible in the nav
    if (currentTab === "declaration") {
      formData.showDeclarationTab = true;
    } else if (currentTab === "sections") {
      formData.showSectionsTab = true;

      // Initialize checkAnswersItems and sections data if not present (like organize-poc route)
      if (!formData.checkAnswersItems) {
        formData.checkAnswersItems = [
          {
            id: 1,
            type: "page",
            key: "Business details",
            value: "Page with multiple questions",
            section: null,
            questions: [
              { label: "Business registered with RPA", value: "Yes" },
              { label: "Business name", value: "Doe Farms Ltd" },
              { label: "Business address", value: "123 Farm Lane, Rural Town" },
            ],
          },
          {
            id: 2,
            type: "question",
            key: "Country for livestock",
            value: "England",
            section: null,
          },
          {
            id: 3,
            type: "question",
            key: "Arrival date of livestock",
            value: "20 04 2024",
            section: null,
          },
          {
            id: 4,
            type: "page",
            key: "Livestock information",
            value: "Page with multiple questions",
            section: null,
            questions: [
              { label: "Type of livestock", value: "Cow" },
              { label: "Number of animals", value: "25" },
              { label: "Breed", value: "Holstein Friesian" },
            ],
          },
          {
            id: 5,
            type: "question",
            key: "Applicant's name",
            value: "John Doe",
            section: null,
          },
          {
            id: 6,
            type: "page",
            key: "Contact details",
            value: "Page with multiple questions",
            section: null,
            questions: [
              { label: "Main phone number", value: "07700 900457" },
              { label: "Email address", value: "john.doe@example.com" },
              {
                label: "Alternative contact",
                value: "Jane Doe - 07700 900458",
              },
            ],
          },
          {
            id: 7,
            type: "question",
            key: "Business purpose",
            value: "Livestock farming",
            section: null,
          },
          {
            id: 8,
            type: "question",
            key: "National Grid field number",
            value: "NG123456",
            section: null,
          },
          {
            id: 9,
            type: "question",
            key: "Methodology statement",
            value: "1 file uploaded",
            section: null,
          },
          {
            id: 10,
            type: "guidance",
            key: "Important information",
            value: "Guidance page",
            section: null,
            guidanceText:
              "Please ensure all information provided is accurate and up to date. This helps us process your application more efficiently.",
          },
          {
            id: 11,
            type: "guidance",
            key: "Data protection notice",
            value: "Guidance page",
            section: null,
            guidanceText:
              "Your personal information will be processed in accordance with the Data Protection Act 2018. We will only use your data for the purposes stated in this application.",
          },
          {
            id: 12,
            type: "guidance",
            key: "Application process",
            value: "Guidance page",
            section: null,
            guidanceText:
              "After submitting your application, we will review the information provided and may contact you for additional details. Processing typically takes 10-15 working days.",
          },
        ];
        console.log(
          "[MODULAR] Initialized checkAnswersItems with default data"
        );
      }
      if (!formData.sections) {
        formData.sections = [];
        console.log("[MODULAR] Initialized sections as empty array");
      }
    }

    req.session.data = formData;

    const renderData = {
      ...formData,
      showDeclarationTab: formData.showDeclarationTab,
      showSectionsTab: formData.showSectionsTab,
      currentTab: currentTab,
    };

    console.log("=== RENDER DATA ===");
    console.log("currentTab:", renderData.currentTab);
    console.log("savedAnswersEnabled:", renderData.savedAnswersEnabled);
    console.log("showDeclarationTab:", renderData.showDeclarationTab);
    console.log("showSectionsTab:", renderData.showSectionsTab);

    res.render("titan-mvp-1.2/form-editor/check-answers/settings-modular", {
      data: renderData,
    });
  }
);

// POST route for modular settings page to handle form submissions
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/settings-modular",
  function (req, res) {
    const formData = req.session.data || {};

    // Handle form submissions from the modular page
    // This can handle any form data submitted from the modular components

    // Update session data with form submissions
    Object.assign(formData, req.body);

    // Handle declaration form submission specifically
    if (req.body.declarationOption) {
      formData.declarationOption = req.body.declarationOption;
    }
    if (req.body.checkAnswersGuidanceTextInput) {
      formData.declarationText = req.body.checkAnswersGuidanceTextInput;
    }
    // Persist new tab options
    if (req.body.confirmationEmailEnabled) {
      formData.confirmationEmailEnabled = req.body.confirmationEmailEnabled;
    }
    if (req.body.referenceNumberEnabled) {
      formData.referenceNumberEnabled = req.body.referenceNumberEnabled;
    }
    if (req.body.feedbackPageEnabled) {
      formData.feedbackPageEnabled = req.body.feedbackPageEnabled;
    }
    if (req.body.currentTab === "saved-answers") {
      const raw = req.body.savedAnswersEnabled;
      const isYes = raw === "yes" || (Array.isArray(raw) && raw.includes("yes"));
      formData.savedAnswersEnabled = isYes ? "yes" : "no";
      if (isYes) {
        formData.confirmationEmailEnabled = "yes";
        formData.referenceNumberEnabled = "yes";
      }
      console.log("[saved-answers POST] raw:", raw, "isYes:", isYes, "formData.savedAnswersEnabled:", formData.savedAnswersEnabled);
    } else if (req.body.savedAnswersEnabled) {
      formData.savedAnswersEnabled = req.body.savedAnswersEnabled;
    }

    // Determine which tab to redirect to based on form data
    let redirectTab = "page-settings";
    if (req.body.currentTab) {
      redirectTab = req.body.currentTab;
    } else if (req.body.declarationOption) {
      redirectTab = "declaration";
    }

    req.session.data = formData;

    // Save session before redirect; pass savedAnswersEnabled in URL so next page has it even if session doesn't persist
    req.session.save(function (err) {
      if (err) return res.sendStatus(500);
      let url = `/titan-mvp-1.2/form-editor/check-answers/settings-modular?tab=${redirectTab}`;
      if (redirectTab === "saved-answers" && formData.savedAnswersEnabled) {
        url += "&savedAnswersEnabled=" + formData.savedAnswersEnabled;
      }
      res.redirect(url);
    });
  }
);

// AI-powered section-based form creation routes
router.get("/titan-mvp-1.2/ai/section-based-form-creation", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/section-based-form-creation", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/section-based-form-creation", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store all the form data
  const formData = {
    wireframeUpload: req.body.wireframeUpload,
    questionProtocol: req.body.questionProtocol,
    referenceLinks: req.body.referenceLinks,
    pageDescription: req.body.pageDescription,
    formAim: req.body.formAim,
    conditionalLogic: req.body.conditionalLogic,
    assembledPrompt: req.body.assembledPrompt,
  };

  // Update session data
  req.session.data = {
    ...req.session.data,
    aiFormData: formData,
    formDetails: {
      ...req.session.data.formDetails,
      aiGenerated: true,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Log the assembled prompt for debugging
  console.log("Assembled AI prompt:", req.body.assembledPrompt);

  // For now, redirect to a success page or back to library
  // In a real implementation, this would send the prompt to an AI service
  res.redirect("/titan-mvp-1.2/ai/form-creation-success");
});

// Debug route to check session data
router.get("/titan-mvp-1.2/ai/debug-session", (req, res) => {
  res.json({
    sessionData: req.session.data,
    sessionId: req.sessionID,
    hasFormAim: !!req.session.data?.formAim,
    hasPageDescription: !!req.session.data?.pageDescription,
    hasReferenceLinks: !!req.session.data?.referenceLinks,
    hasQuestionProtocol: !!req.session.data?.questionProtocol,
    hasWireframeUpload: !!req.session.data?.wireframeUpload,
    hasConditionalLogic: !!req.session.data?.conditionalLogic,
    formAimValue: req.session.data?.formAim,
    pageDescriptionValue: req.session.data?.pageDescription,
  });
});

// Test route to manually set session data
router.get("/titan-mvp-1.2/ai/test-set-session", (req, res) => {
  req.session.data = req.session.data || {};
  req.session.data.formAim = "Test form aim from debug route";
  req.session.data.formAimStarted = true;
  req.session.data.pageDescription = "Test page description from debug route";
  req.session.data.pageDescriptionStarted = true;

  console.log("=== TEST SET SESSION ===");
  console.log("Session data set:", JSON.stringify(req.session.data, null, 2));

  res.json({
    message: "Session data set",
    sessionData: req.session.data,
  });
});

// Test route to immediately retrieve session data
router.get("/titan-mvp-1.2/ai/test-get-session", (req, res) => {
  console.log("=== TEST GET SESSION ===");
  console.log(
    "Session data retrieved:",
    JSON.stringify(req.session.data, null, 2)
  );

  res.json({
    message: "Session data retrieved",
    sessionData: req.session.data,
    formAim: req.session.data?.formAim,
    pageDescription: req.session.data?.pageDescription,
  });
});

// AI form creation success page
router.get("/titan-mvp-1.2/ai/form-creation-success", (req, res) => {
  const formData = req.session.data?.aiFormData;

  if (!formData) {
    return res.redirect("/titan-mvp-1.2/library");
  }

  res.render("titan-mvp-1.2/ai/form-creation-success", {
    data: req.session.data,
    formData: formData,
  });
});

// Tasklist-based AI form creation routes
router.get("/titan-mvp-1.2/ai/tasklist-form-creation", (req, res) => {
  console.log("=== TASKLIST ROUTE HIT ===");
  console.log(
    "Session data before initialization:",
    JSON.stringify(req.session.data, null, 2)
  );

  // Preserve existing session data and only initialize if it doesn't exist
  if (!req.session.data) {
    req.session.data = {};
  }

  console.log(
    "Session data after initialization:",
    JSON.stringify(req.session.data, null, 2)
  );
  console.log("Session data keys:", Object.keys(req.session.data));
  console.log("Form data present:", {
    formAim: !!req.session.data.formAim,
    pageDescription: !!req.session.data.pageDescription,
    referenceLinks: !!req.session.data.referenceLinks,
    questionProtocol: !!req.session.data.questionProtocol,
    wireframeUpload: !!req.session.data.wireframeUpload,
    conditionalLogic: !!req.session.data.conditionalLogic,
  });

  console.log("AI Form data present:", {
    formAim: !!req.session.data.aiFormData?.formAim,
    pageDescription: !!req.session.data.aiFormData?.pageDescription,
    referenceLinks: !!req.session.data.aiFormData?.referenceLinks,
    questionProtocol: !!req.session.data.aiFormData?.questionProtocol,
    wireframeUpload: !!req.session.data.aiFormData?.wireframeUpload,
    conditionalLogic: !!req.session.data.aiFormData?.conditionalLogic,
  });

  console.log(
    "Task statuses:",
    req.session.data.aiFormData?.taskStatuses || {}
  );

  res.render("titan-mvp-1.2/ai/tasklist-form-creation", {
    data: req.session.data,
    // Also pass individual fields for easier access
    formAim: req.session.data.formAim,
    pageDescription: req.session.data.pageDescription,
    referenceLinks: req.session.data.referenceLinks,
    questionProtocol: req.session.data.questionProtocol,
    wireframeUpload: req.session.data.wireframeUpload,
    conditionalLogic: req.session.data.conditionalLogic,
    formAimStarted: req.session.data.formAimStarted,
    pageDescriptionStarted: req.session.data.pageDescriptionStarted,
    referenceLinksStarted: req.session.data.referenceLinksStarted,
    questionProtocolStarted: req.session.data.questionProtocolStarted,
    wireframeUploadStarted: req.session.data.wireframeUploadStarted,
    conditionalLogicStarted: req.session.data.conditionalLogicStarted,
    // Pass task statuses
    taskStatuses: req.session.data.aiFormData?.taskStatuses || {},
  });
});

// Individual task routes
router.get("/titan-mvp-1.2/ai/task/question-protocol", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/question-protocol", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/task/question-protocol", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== QUESTION PROTOCOL POST ROUTE ===");
  console.log("Question protocol saved:", req.body.questionProtocol);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);

  // Store the question protocol data
  req.session.data.questionProtocol = req.body.questionProtocol;
  req.session.data.questionProtocolStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData) {
      req.session.data.aiFormData = {};
    }
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.questionProtocol =
      req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    // Continue to next task or back to task list
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Wireframe upload task routes
router.get("/titan-mvp-1.2/ai/task/wireframe", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/wireframe", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/task/wireframe", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== WIREFRAME POST ROUTE ===");
  console.log("Wireframe upload saved:", req.body.wireframeUpload);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);

  // Store the wireframe upload data
  req.session.data.wireframeUpload = req.body.wireframeUpload;
  req.session.data.wireframeUploadStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData) {
      req.session.data.aiFormData = {};
    }
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.wireframe = req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Reference links task routes
router.get("/titan-mvp-1.2/ai/task/reference-links", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/reference-links", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/task/reference-links", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== REFERENCE LINKS POST ROUTE ===");
  console.log("Reference links saved:", req.body.referenceLinks);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);

  // Store the reference links data
  req.session.data.referenceLinks = req.body.referenceLinks;
  req.session.data.referenceLinksStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData) {
      req.session.data.aiFormData = {};
    }
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.referenceLinks =
      req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Page description task routes
router.get("/titan-mvp-1.2/ai/task/page-description", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/page-description", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/task/page-description", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== PAGE DESCRIPTION POST ROUTE ===");
  console.log("Page description saved:", req.body.pageDescription);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);

  // Store the page description data
  req.session.data.pageDescription = req.body.pageDescription;
  req.session.data.pageDescriptionStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData) {
      req.session.data.aiFormData = {};
    }
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.pageDescription =
      req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Form aim task routes
router.get("/titan-mvp-1.2/ai/task/form-aim", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/form-aim", {
    data: req.session.data,
    formAim: req.session.data.formAim,
    formAimStarted: req.session.data.formAimStarted,
  });
});
router.post("/titan-mvp-1.2/ai/task/form-aim", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== FORM AIM POST ROUTE ===");
  console.log("Form aim saved:", req.body.formAim);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);
  console.log(
    "Session data before save:",
    JSON.stringify(req.session.data, null, 2)
  );

  // Store the form aim data in a separate AI data object
  if (!req.session.data.aiFormData) {
    req.session.data.aiFormData = {};
  }
  req.session.data.aiFormData.formAim = req.body.formAim;
  req.session.data.aiFormData.formAimStarted = true;

  // Also store in the main session for backward compatibility
  req.session.data.formAim = req.body.formAim;
  req.session.data.formAimStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.formAim = req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  console.log(
    "Session data after save:",
    JSON.stringify(req.session.data, null, 2)
  );

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Conditional logic task routes
router.get("/titan-mvp-1.2/ai/task/conditional-logic", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/conditional-logic", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/ai/task/conditional-logic", (req, res) => {
  req.session.data = req.session.data || {};

  // Debug: Log the saved data
  console.log("=== CONDITIONAL LOGIC POST ROUTE ===");
  console.log("Conditional logic saved:", req.body.conditionalLogic);
  console.log("Task status:", req.body.taskStatus);
  console.log("Return to task list:", req.body.returnToTaskList);

  // Store the conditional logic data
  req.session.data.conditionalLogic = req.body.conditionalLogic;
  req.session.data.conditionalLogicStarted = true;

  // Handle task status
  if (req.body.taskStatus) {
    if (!req.session.data.aiFormData) {
      req.session.data.aiFormData = {};
    }
    if (!req.session.data.aiFormData.taskStatuses) {
      req.session.data.aiFormData.taskStatuses = {};
    }
    req.session.data.aiFormData.taskStatuses.conditionalLogic =
      req.body.taskStatus;
    console.log("Task status saved:", req.body.taskStatus);
  }

  // Check if user wants to return to task list
  if (req.body.returnToTaskList) {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  } else {
    res.redirect("/titan-mvp-1.2/ai/tasklist-form-creation");
  }
});

// Review task route
router.get("/titan-mvp-1.2/ai/task/review", (req, res) => {
  req.session.data = req.session.data || {};

  // Assemble the prompt from all completed tasks
  const sections = [
    { title: "Form Aim", key: "formAim" },
    { title: "Page descriptions", key: "pageDescription" },
    { title: "Page conditions", key: "conditionalLogic" },
    { title: "Wireframe Upload", key: "wireframeUpload" },
    { title: "Reference Links", key: "referenceLinks" },
  ];

  let assembledPrompt = "";
  sections.forEach((section) => {
    const value = req.session.data[section.key] || "";
    if (value.trim()) {
      assembledPrompt += `## ${section.title}\n\n${value}\n\n`;
    }
  });

  res.render("titan-mvp-1.2/ai/task/review", {
    data: req.session.data,
    assembledPrompt: assembledPrompt,
  });
});

router.post("/titan-mvp-1.2/ai/task/review", (req, res) => {
  req.session.data = req.session.data || {};

  // Store all the form data
  const formData = {
    wireframeUpload: req.session.data.wireframeUpload,
    questionProtocol: req.session.data.questionProtocol,
    referenceLinks: req.session.data.referenceLinks,
    pageDescription: req.session.data.pageDescription,
    formAim: req.session.data.formAim,
    conditionalLogic: req.session.data.conditionalLogic,
    assembledPrompt: req.body.assembledPrompt,
  };

  // Update session data
  req.session.data = {
    ...req.session.data,
    aiFormData: formData,
    formDetails: {
      ...req.session.data.formDetails,
      aiGenerated: true,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Log the assembled prompt for debugging
  console.log("Tasklist assembled AI prompt:", req.body.assembledPrompt);

  // Redirect to loading screen
  res.redirect("/titan-mvp-1.2/ai/task/form-creation-loading");
});

// Form creation loading screen
router.get("/titan-mvp-1.2/ai/task/form-creation-loading", (req, res) => {
  req.session.data = req.session.data || {};

  res.render("titan-mvp-1.2/ai/task/form-creation-loading", {
    data: req.session.data,
  });
});

// Form creation results page
router.get("/titan-mvp-1.2/ai/form-creation-results", (req, res) => {
  req.session.data = req.session.data || {};

  // Generate mock form statistics for demonstration
  const formStats = {
    totalPages: 5,
    totalFields: 12,
    contentPages: 3,
    textFields: 6,
    choiceFields: 3,
    dateFields: 2,
    fileFields: 1,
    conditionalLogic: 2,
  };

  const formName = req.session.data.formName || "My Form";
  const creationDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  res.render("titan-mvp-1.2/ai/form-creation-results", {
    data: req.session.data,
    formStats: formStats,
    formName: formName,
    creationDate: creationDate,
  });
});

// Catch-all route for any .html file in titan-mvp-1.2 (must be last)
router.get("/titan-mvp-1.2/*", function (req, res, next) {
  console.log("CATCH-ALL ROUTE: /titan-mvp-1.2/*", req.path);
  const path = req.path.replace(/^\/titan-mvp-1.2\//, "");
  if (!path.match(/^[a-zA-Z0-9\-_\/]+(\.html)?$/)) return next();
  const viewName = path.replace(/\.html$/, "");
  const formData = req.session.data || {};
  let users = formData.users || [];
  // Add semanticName and lowercase role
  users = users.map((user) => ({
    ...user,
    semanticName: emailToName(user.email),
    role: user.role ? user.role.toLowerCase() : user.role,
  }));
  // Clear success message after displaying
  const successMessage = formData.successMessage;
  if (formData.successMessage) {
    delete formData.successMessage;
  }
  res.render(
    `titan-mvp-1.2/${viewName}`,
    {
      data: {
        users: users,
        successMessage: successMessage,
      },
      form: {
        name: formData.formName || "Form name",
      },
    },
    function (err, html) {
      if (err) return next();
      res.send(html);
    }
  );
});

// Assign a checkAnswersItem to a section (PoC, no JS required)
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/assign-section",
  function (req, res) {
    const itemId = req.body.itemId;
    const sectionId = req.body.sectionId;
    const checkAnswersItems = req.session.data.checkAnswersItems || [];
    const sections = req.session.data.sections || [];
    // Find the item and update its section (always as string)
    const item = checkAnswersItems.find((i) => String(i.id) === String(itemId));
    const sectionExists = sections.some(
      (s) => String(s.id) === String(sectionId)
    );
    if (item && sectionId && sectionExists) {
      item.section = String(sectionId);
      req.session.data.checkAnswersItems = checkAnswersItems;
      console.log(
        `[ASSIGN-SECTION] Updated item ${itemId} to section ${sectionId}`
      );
    } else {
      console.log(
        `[ASSIGN-SECTION] Failed to update: item=${!!item}, sectionId=${sectionId}, sectionExists=${sectionExists}`
      );
    }
    // Log the updated checkAnswersItems
    console.log(
      "[ASSIGN-SECTION] checkAnswersItems:",
      JSON.stringify(req.session.data.checkAnswersItems, null, 2)
    );
    // Redirect back to the settings page with sections tab
    res.redirect(
      "/titan-mvp-1.2/form-editor/check-answers/settings-modular?tab=sections"
    );
  }
);

// Settings v2 page with persistent tabs
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/settings-v2",
  function (req, res) {
    const tab = req.query.tab;
    const add = req.query.add;
    const formData = req.session.data || {};

    // Initialize tab visibility flags if not present
    if (formData.showDeclarationTab === undefined)
      formData.showDeclarationTab = false;
    if (formData.showSectionsTab === undefined)
      formData.showSectionsTab = false;

    // Set flags based on the requested action
    if (add === "declaration") {
      formData.showDeclarationTab = true;
    }
    if (add === "sections") {
      formData.showSectionsTab = true;
    }

    // Optionally, allow direct tab navigation
    if (tab === "declaration") {
      formData.showDeclarationTab = true;
    }
    if (tab === "sections") {
      formData.showSectionsTab = true;
    }

    // Set current tab for the template
    let currentTab = "page-settings";
    if (tab === "declaration") {
      currentTab = "declaration";
    } else if (tab === "sections") {
      currentTab = "sections";
    }

    // Debug log
    console.log(
      "DEBUG route: showDeclarationTab:",
      formData.showDeclarationTab,
      "showSectionsTab:",
      formData.showSectionsTab,
      "currentTab:",
      currentTab
    );

    req.session.data = formData;

    res.render("titan-mvp-1.2/form-editor/check-answers/settings-v2", {
      data: {
        ...formData,
        showDeclarationTab: formData.showDeclarationTab,
        showSectionsTab: formData.showSectionsTab,
        currentTab: currentTab,
      },
    });
  }
);

// Example page showing modular components
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/example-modular",
  function (req, res) {
    res.render("titan-mvp-1.2/form-editor/check-answers/example-modular");
  }
);

// PoC organize page route
router.get(
  "/titan-mvp-1.2/form-editor/check-answers/organize-poc",
  function (req, res) {
    // Only initialize if truly missing
    if (!req.session.data.checkAnswersItems) {
      req.session.data.checkAnswersItems = [
        {
          id: 1,
          type: "page",
          key: "Business details",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Business registered with RPA", value: "Yes" },
            { label: "Business name", value: "Doe Farms Ltd" },
            { label: "Business address", value: "123 Farm Lane, Rural Town" },
          ],
        },
        {
          id: 2,
          type: "question",
          key: "Country for livestock",
          value: "England",
          section: null,
        },
        {
          id: 3,
          type: "question",
          key: "Arrival date of livestock",
          value: "20 04 2024",
          section: null,
        },
        {
          id: 4,
          type: "page",
          key: "Livestock information",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Type of livestock", value: "Cow" },
            { label: "Number of animals", value: "25" },
            { label: "Breed", value: "Holstein Friesian" },
          ],
        },
        {
          id: 5,
          type: "question",
          key: "Applicant's name",
          value: "John Doe",
          section: null,
        },
        {
          id: 6,
          type: "page",
          key: "Contact details",
          value: "Page with multiple questions",
          section: null,
          questions: [
            { label: "Main phone number", value: "07700 900457" },
            { label: "Email address", value: "john.doe@example.com" },
            { label: "Alternative contact", value: "Jane Doe - 07700 900458" },
          ],
        },
        {
          id: 7,
          type: "question",
          key: "Business purpose",
          value: "Livestock farming",
          section: null,
        },
        {
          id: 8,
          type: "question",
          key: "National Grid field number",
          value: "NG123456",
          section: null,
        },
        {
          id: 9,
          type: "question",
          key: "Methodology statement",
          value: "1 file uploaded",
          section: null,
        },
        {
          id: 10,
          type: "guidance",
          key: "Important information",
          value: "Guidance page",
          section: null,
          guidanceText:
            "Please ensure all information provided is accurate and up to date. This helps us process your application more efficiently.",
        },
        {
          id: 11,
          type: "guidance",
          key: "Data protection notice",
          value: "Guidance page",
          section: null,
          guidanceText:
            "Your personal information will be processed in accordance with the Data Protection Act 2018. We will only use your data for the purposes stated in this application.",
        },
        {
          id: 12,
          type: "guidance",
          key: "Application process",
          value: "Guidance page",
          section: null,
          guidanceText:
            "After submitting your application, we will review the information provided and may contact you for additional details. Processing typically takes 10-15 working days.",
        },
      ];
      console.log(
        "[ORGANIZE-POC] Initialized checkAnswersItems with default data"
      );
    }
    if (!req.session.data.sections) {
      req.session.data.sections = [];
      console.log("[ORGANIZE-POC] Initialized sections as empty array");
    }
    res.render("titan-mvp-1.2/form-editor/check-answers/organize-poc.html");
  }
);

// Handle section visibility toggle (hide from respondents)
router.post(
  "/titan-mvp-1.2/form-editor/check-answers/hide-section",
  function (req, res) {
    const sectionId = req.body.sectionId;
    // Checkbox is only present if checked, so treat missing as false
    const hide = !!req.body.hideSectionFromRespondents;
    const sections = req.session.data.sections || [];
    const section = sections.find((s) => String(s.id) === String(sectionId));
    if (section) {
      section.hideFromRespondents = hide;
      section.settingsSaved = true; // Mark that settings have been saved
      req.session.data.sections = sections;
    }
    res.redirect(
      "/titan-mvp-1.2/form-editor/check-answers/settings-modular?tab=sections"
    );
  }
);
// Demo listing route with comprehensive form data
router.get("/titan-mvp-1.2/form-editor/listing/demo", function (req, res) {
  // Create comprehensive demo form data
  const demoFormPages = [
    // Page 1: Business Registration
    {
      pageId: "page1",
      pageType: "question",
      pageHeading: "Business Registration",
      questions: [
        {
          questionId: "q1",
          label: "Is your business registered with RPA?",
          type: "list",
          subType: "yes-no",
          options: [
            { value: "yes", text: "Yes" },
            { value: "no", text: "No" },
          ],
        },
      ],
      conditions: [],
      order: 1,
    },
    // Page 2: Business Type (conditional)
    {
      pageId: "page2",
      pageType: "question",
      pageHeading: "Business Type",
      questions: [
        {
          questionId: "q2",
          label: "What type of business are you?",
          type: "list",
          subType: "radios",
          options: [
            { value: "sole-trader", text: "Sole trader" },
            { value: "partnership", text: "Partnership" },
            { value: "limited-company", text: "Limited company" },
            { value: "charity", text: "Charity" },
            { value: "other", text: "Other" },
          ],
        },
      ],
      conditions: [
        {
          id: "cond1",
          conditionName: "Business Registered",
          rules: [
            {
              questionText: "Is your business registered with RPA?",
              operator: "is",
              value: "yes",
            },
          ],
        },
      ],
      order: 2,
    },
    // Page 3: Guidance Page
    {
      pageId: "page3",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "Important Information",
      guidanceOnlyGuidanceTextInput:
        "Before proceeding with your application, please ensure you have all the necessary documentation ready. This includes your business registration certificate, financial records, and any relevant permits.",
      conditions: [
        {
          id: "cond2",
          conditionName: "Business Type Selected",
          rules: [
            {
              questionText: "What type of business are you?",
              operator: "is",
              value: "limited-company",
            },
          ],
        },
      ],
      order: 3,
    },
    // Page 4: Contact Details
    {
      pageId: "page4",
      pageType: "question",
      pageHeading: "Contact Details",
      questions: [
        {
          questionId: "q3",
          label: "Full name",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q4",
          label: "Email address",
          type: "email",
        },
        {
          questionId: "q5",
          label: "Phone number",
          type: "phone",
        },
      ],
      conditions: [],
      order: 4,
    },
    // Page 5: Business Address
    {
      pageId: "page5",
      pageType: "question",
      pageHeading: "Business Address",
      questions: [
        {
          questionId: "q6",
          label: "Business address",
          type: "address",
        },
      ],
      conditions: [
        {
          id: "cond3",
          conditionName: "Limited Company",
          rules: [
            {
              questionText: "What type of business are you?",
              operator: "is",
              value: "limited-company",
            },
          ],
        },
      ],
      order: 5,
    },
    // Page 6: Financial Information
    {
      pageId: "page6",
      pageType: "question",
      pageHeading: "Financial Information",
      questions: [
        {
          questionId: "q7",
          label: "Annual turnover",
          type: "text",
          subType: "numbers",
        },
        {
          questionId: "q8",
          label: "Number of employees",
          type: "text",
          subType: "numbers",
        },
      ],
      conditions: [
        {
          id: "cond4",
          conditionName: "Large Business",
          rules: [
            {
              questionText: "What type of business are you?",
              operator: "is",
              value: "limited-company",
            },
          ],
        },
      ],
      order: 6,
    },
    // Page 7: Industry Sector
    {
      pageId: "page7",
      pageType: "question",
      pageHeading: "Industry Sector",
      questions: [
        {
          questionId: "q9",
          label: "What industry sector are you in?",
          type: "list",
          subType: "select",
          options: [
            { value: "agriculture", text: "Agriculture" },
            { value: "manufacturing", text: "Manufacturing" },
            { value: "retail", text: "Retail" },
            { value: "services", text: "Services" },
            { value: "construction", text: "Construction" },
            { value: "technology", text: "Technology" },
            { value: "healthcare", text: "Healthcare" },
            { value: "education", text: "Education" },
            { value: "other", text: "Other" },
          ],
        },
      ],
      conditions: [],
      order: 7,
    },
    // Page 8: Agriculture Specific (conditional)
    {
      pageId: "page8",
      pageType: "question",
      pageHeading: "Agriculture Details",
      questions: [
        {
          questionId: "q10",
          label: "What type of agriculture do you practice?",
          type: "list",
          subType: "checkboxes",
          options: [
            { value: "crops", text: "Crop farming" },
            { value: "livestock", text: "Livestock farming" },
            { value: "dairy", text: "Dairy farming" },
            { value: "poultry", text: "Poultry farming" },
            { value: "mixed", text: "Mixed farming" },
          ],
        },
        {
          questionId: "q11",
          label: "Farm size (hectares)",
          type: "text",
          subType: "numbers",
        },
      ],
      conditions: [
        {
          id: "cond5",
          conditionName: "Agriculture Sector",
          rules: [
            {
              questionText: "What industry sector are you in?",
              operator: "is",
              value: "agriculture",
            },
          ],
        },
      ],
      order: 8,
    },
    // Page 9: Livestock Specific (conditional)
    {
      pageId: "page9",
      pageType: "question",
      pageHeading: "Livestock Information",
      questions: [
        {
          questionId: "q12",
          label: "What types of livestock do you keep?",
          type: "list",
          subType: "checkboxes",
          options: [
            { value: "cattle", text: "Cattle" },
            { value: "sheep", text: "Sheep" },
            { value: "pigs", text: "Pigs" },
            { value: "poultry", text: "Poultry" },
            { value: "horses", text: "Horses" },
          ],
        },
        {
          questionId: "q13",
          label: "Total number of animals",
          type: "text",
          subType: "numbers",
        },
      ],
      conditions: [
        {
          id: "cond6",
          conditionName: "Livestock Farming",
          rules: [
            {
              questionText: "What type of agriculture do you practice?",
              operator: "is",
              value: "livestock",
            },
          ],
        },
      ],
      order: 9,
    },
    // Page 10: Manufacturing Specific (conditional)
    {
      pageId: "page10",
      pageType: "question",
      pageHeading: "Manufacturing Details",
      questions: [
        {
          questionId: "q14",
          label: "What do you manufacture?",
          type: "text",
          subType: "long-answer",
        },
        {
          questionId: "q15",
          label: "Production capacity (units per year)",
          type: "text",
          subType: "numbers",
        },
      ],
      conditions: [
        {
          id: "cond7",
          conditionName: "Manufacturing Sector",
          rules: [
            {
              questionText: "What industry sector are you in?",
              operator: "is",
              value: "manufacturing",
            },
          ],
        },
      ],
      order: 10,
    },
    // Page 11: Compliance History
    {
      pageId: "page11",
      pageType: "question",
      pageHeading: "Compliance History",
      questions: [
        {
          questionId: "q16",
          label: "Have you had any compliance issues in the last 5 years?",
          type: "list",
          subType: "yes-no",
          options: [
            { value: "yes", text: "Yes" },
            { value: "no", text: "No" },
          ],
        },
      ],
      conditions: [],
      order: 11,
    },
    // Page 12: Compliance Details (conditional)
    {
      pageId: "page12",
      pageType: "question",
      pageHeading: "Compliance Details",
      questions: [
        {
          questionId: "q17",
          label: "Please describe the compliance issues",
          type: "text",
          subType: "long-answer",
        },
        {
          questionId: "q18",
          label: "When did these issues occur?",
          type: "date",
          subType: "day-month-year",
        },
        {
          questionId: "q19",
          label: "Have these issues been resolved?",
          type: "list",
          subType: "yes-no",
          options: [
            { value: "yes", text: "Yes" },
            { value: "no", text: "No" },
          ],
        },
      ],
      conditions: [
        {
          id: "cond8",
          conditionName: "Compliance Issues",
          rules: [
            {
              questionText:
                "Have you had any compliance issues in the last 5 years?",
              operator: "is",
              value: "yes",
            },
          ],
        },
      ],
      order: 12,
    },
    // Page 13: Documentation
    {
      pageId: "page13",
      pageType: "question",
      pageHeading: "Supporting Documentation",
      questions: [
        {
          questionId: "q20",
          label: "Please upload your business plan",
          type: "file",
        },
        {
          questionId: "q21",
          label: "Please upload financial statements",
          type: "file",
        },
      ],
      conditions: [
        {
          id: "cond9",
          conditionName: "Large Business Documentation",
          rules: [
            {
              questionText: "What type of business are you?",
              operator: "is",
              value: "limited-company",
            },
          ],
        },
      ],
      order: 13,
    },
    // Page 14: Additional Information
    {
      pageId: "page14",
      pageType: "question",
      pageHeading: "Additional Information",
      questions: [
        {
          questionId: "q22",
          label: "Is there anything else you would like to tell us?",
          type: "text",
          subType: "long-answer",
        },
      ],
      conditions: [],
      order: 14,
    },
    // Page 15: Declaration
    {
      pageId: "page15",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "Declaration",
      guidanceOnlyGuidanceTextInput:
        "By submitting this application, you confirm that all information provided is accurate and complete to the best of your knowledge. You understand that providing false information may result in the rejection of your application or legal action.",
      conditions: [],
      order: 15,
    },
  ];

  // Create comprehensive form-level conditions
  const demoConditions = [
    {
      id: "form-cond1",
      conditionName: "Agriculture Business",
      rules: [
        {
          questionText: "What industry sector are you in?",
          operator: "is",
          value: "agriculture",
        },
      ],
    },
    {
      id: "form-cond2",
      conditionName: "Large Business",
      rules: [
        {
          questionText: "What type of business are you?",
          operator: "is",
          value: "limited-company",
        },
      ],
    },
    {
      id: "form-cond3",
      conditionName: "Compliance Issues",
      rules: [
        {
          questionText:
            "Have you had any compliance issues in the last 5 years?",
          operator: "is",
          value: "yes",
        },
      ],
    },
    {
      id: "form-cond4",
      conditionName: "Complex Application",
      rules: [
        {
          questionText: "What type of business are you?",
          operator: "is",
          value: "limited-company",
        },
        {
          logicalOperator: "AND",
          questionText: "What industry sector are you in?",
          operator: "is",
          value: "agriculture",
        },
      ],
    },
  ];

  // Add a few extra demo conditions that are defined but not used by any page
  // These will appear in the listing filter panel under the disabled "not used" group
  demoConditions.push(
    {
      id: "form-cond5",
      conditionName: "Has Website",
      rules: [
        { questionText: "Do you have a company website?", operator: "is", value: "yes" },
      ],
    },
    {
      id: "form-cond6",
      conditionName: "Uses Subcontractors",
      rules: [
        { questionText: "Do you use subcontractors?", operator: "is", value: "yes" },
      ],
    },
    {
      id: "form-cond7",
      conditionName: "High Environmental Impact",
      rules: [
        { questionText: "Estimated environmental impact", operator: "contains", value: "high" },
      ],
    }
  );

  // Create demo sections
  const demoSections = [
    {
      id: "section1",
      name: "Business Information",
      title: "Business Information",
    },
    { id: "section2", name: "Contact Details", title: "Contact Details" },
    { id: "section3", name: "Industry Specific", title: "Industry Specific" },
    { id: "section4", name: "Compliance", title: "Compliance" },
    { id: "section5", name: "Documentation", title: "Documentation" },
  ];

  // No sections assigned to pages for cleaner interface

  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages: demoFormPages,
    sections: demoSections,
    form: {
      name: "Comprehensive Business Application Form",
    },
    request: req,
    data: {
      conditions: demoConditions,
      formName: "Comprehensive Business Application Form",
    },
  });
});
// CPH Form Demo Route
router.get("/titan-mvp-1.2/form-editor/listing/cph-demo", function (req, res) {
  // Create CPH form pages based on the JSON structure
  const cphFormPages = [
    // Page 1: Age check
    {
      pageId: "page1",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q1",
          label: "Are you 18 or older?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 1,
    },
    // Page 2: RPA Registration check
    {
      pageId: "page2",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q2",
          label:
            "Are you or your business already registered with the Rural Payments Agency?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 2,
    },
    // Page 3: Already registered (exit page)
    {
      pageId: "page3",
      pageType: "guidance",
      guidanceOnlyHeadingInput:
        "Already registered with the Rural Payments Agency",
      guidanceOnlyGuidanceTextInput:
        "You cannot use this form if you're already registered on the Rural Payments service. The Rural Payments Agency (RPA) already has much of the information it needs to process your application. You must apply by phone instead.",
      conditions: [
        {
          id: "cond1",
          conditionName: "Already Registered with RPA",
          rules: [
            {
              questionText: "Registered with the Rural Payments Agency",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 3,
      isExitPage: true,
    },
    // Page 4: Country selection
    {
      pageId: "page4",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q3",
          label: "What country will you keep livestock in?",
          type: "list",
          subType: "radios",
          options: [
            { value: "England", text: "England" },
            { value: "Northern Ireland", text: "Northern Ireland" },
            { value: "Scotland", text: "Scotland" },
            { value: "Wales", text: "Wales" },
          ],
        },
      ],
      conditions: [],
      order: 4,
    },
    // Page 5: Cannot use service (exit page)
    {
      pageId: "page5",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "You cannot use this service",
      guidanceOnlyGuidanceTextInput:
        "You cannot use this service to apply for a county parish holding (CPH) number if you live in Northern Ireland, Scotland or Wales.",
      conditions: [
        {
          id: "cond2",
          conditionName: "Non-England Location",
          rules: [
            {
              questionText: "Country where you will keep livestock",
              operator: "is",
              value: "Northern Ireland",
            },
            {
              logicalOperator: "OR",
              questionText: "Country where you will keep livestock",
              operator: "is",
              value: "Scotland",
            },
            {
              logicalOperator: "OR",
              questionText: "Country where you will keep livestock",
              operator: "is",
              value: "Wales",
            },
          ],
        },
      ],
      order: 5,
      isExitPage: true,
    },
    // Page 6: Business or hobbyist
    {
      pageId: "page6",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q4",
          label: "Are you a hobbyist keeper or a business?",
          type: "list",
          subType: "radios",
          options: [
            { value: "hobbyist", text: "I'm a hobbyist keeper" },
            {
              value: "business",
              text: "I'm registering on behalf of a business",
            },
          ],
        },
      ],
      conditions: [],
      order: 6,
    },
    // Page 7: Applicant name (hobbyist path)
    {
      pageId: "page7",
      pageType: "question",
      pageHeading: "What's your name?",
      questions: [
        {
          questionId: "q5",
          label: "Title",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q6",
          label: "First name",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q7",
          label: "Middle name",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q8",
          label: "Last name",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond3",
          conditionName: "Hobbyist Keeper",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "hobbyist",
            },
          ],
        },
      ],
      order: 7,
    },
    // Page 8: Applicant name (business path)
    {
      pageId: "page8",
      pageType: "question",
      pageHeading: "What's the name of the applicant?",
      questions: [
        {
          questionId: "q9",
          label: "Title",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q10",
          label: "First name",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q11",
          label: "Middle name",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q12",
          label: "Last name",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond4",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 8,
    },
    // Page 9: Business name
    {
      pageId: "page9",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q13",
          label: "What is the name of the business?",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond5",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 9,
    },
    // Page 10: Telephone numbers
    {
      pageId: "page10",
      pageType: "question",
      pageHeading: "Telephone numbers",
      questions: [
        {
          questionId: "q14",
          label: "What's your main phone number?",
          type: "phone",
        },
        {
          questionId: "q15",
          label: "What's your second phone number?",
          type: "phone",
        },
      ],
      conditions: [],
      order: 10,
    },
    // Page 11: Email address
    {
      pageId: "page11",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q16",
          label: "What's your email address?",
          type: "email",
        },
      ],
      conditions: [],
      order: 11,
    },
    // Page 12: Home address
    {
      pageId: "page12",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q17",
          label: "What's your home address?",
          type: "address",
        },
      ],
      conditions: [
        {
          id: "cond6",
          conditionName: "Email Address Provided",
          rules: [
            {
              questionText: "Email address",
              operator: "is not empty",
              value: "",
            },
          ],
        },
      ],
      order: 12,
    },
    // Page 13: Business address
    {
      pageId: "page13",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q18",
          label: "What's your business address?",
          type: "address",
        },
      ],
      conditions: [
        {
          id: "cond7",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 13,
    },
    // Page 14: Business address same as home
    {
      pageId: "page14",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q19",
          label: "Is your business address the same as your home address?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [
        {
          id: "cond8",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 14,
    },
    // Page 15: Legal status
    {
      pageId: "page15",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q20",
          label: "Legal status of your business",
          type: "list",
          subType: "radios",
          options: [
            { value: "sole-trader", text: "Sole trader" },
            { value: "partnership", text: "Partnership" },
            { value: "private-limited", text: "Private limited company (Ltd)" },
            { value: "limited-partnership", text: "Limited partnership (LP)" },
            { value: "charitable-trust", text: "Charitable trust" },
            { value: "something-else", text: "Something else" },
          ],
        },
      ],
      conditions: [
        {
          id: "cond9",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 15,
    },
    // Page 16: Companies House
    {
      pageId: "page16",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q21",
          label: "What's your company number?",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond10",
          conditionName: "Must Have Companies House Number",
          rules: [
            {
              questionText: "Business legal status",
              operator: "is",
              value: "private-limited",
            },
            {
              logicalOperator: "OR",
              questionText: "Business legal status",
              operator: "is",
              value: "limited-partnership",
            },
          ],
        },
      ],
      order: 16,
    },
    // Page 17: Charity number
    {
      pageId: "page17",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q22",
          label: "What's your charity number?",
          type: "text",
          subType: "numbers",
        },
      ],
      conditions: [
        {
          id: "cond11",
          conditionName: "Must Have Charity Number",
          rules: [
            {
              questionText: "Business legal status",
              operator: "is",
              value: "charitable-trust",
            },
          ],
        },
      ],
      order: 17,
    },
    // Page 18: Business purpose
    {
      pageId: "page18",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q23",
          label: "What is the main purpose of your business?",
          type: "list",
          subType: "radios",
          options: [
            { value: "farmer", text: "Farmer" },
            {
              value: "professional-livestock",
              text: "Professional livestock keeper",
            },
            { value: "meat-industry", text: "Meat industry" },
            { value: "land-manager", text: "Land manager" },
            { value: "education", text: "Education provider or trainer" },
            { value: "something-else", text: "Something else" },
          ],
        },
      ],
      conditions: [
        {
          id: "cond12",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 18,
    },
    // Page 19: Business type (something else)
    {
      pageId: "page19",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q24",
          label: "What type of business do you have?",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond13",
          conditionName: "Other Business Type",
          rules: [
            {
              questionText: "Business type",
              operator: "is",
              value: "something-else",
            },
          ],
        },
      ],
      order: 19,
    },
    // Page 20: Livestock selection
    {
      pageId: "page20",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q25",
          label: "What livestock will you keep?",
          type: "list",
          subType: "checkboxes",
          options: [
            { value: "cattle", text: "Cattle" },
            { value: "camelids", text: "Camelids" },
            { value: "deer", text: "Deer" },
            { value: "goats", text: "Goats" },
            { value: "pigs", text: "Pigs" },
            { value: "sheep", text: "Sheep" },
            { value: "poultry-50-plus", text: "More than 50 poultry" },
            {
              value: "poultry-under-50",
              text: "Less than 50 poultry or other captive birds",
            },
            { value: "racing-pigeons", text: "Racing pigeons" },
            { value: "animal-by-products", text: "Animal by-products" },
          ],
        },
      ],
      conditions: [],
      order: 20,
    },
    // Page 21: Cannot use service (exit page)
    {
      pageId: "page21",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "You must use a different service",
      guidanceOnlyGuidanceTextInput:
        "If you're a keeper of less than 50 poultry or other captive birds, you must register with the Animal and Plant Health Agency (APHA). This includes any birds you keep as pets.",
      conditions: [
        {
          id: "cond14",
          conditionName: "Less Than 50 Birds or Racing Pigeons",
          rules: [
            {
              questionText: "Livestock that you keep",
              operator: "contains",
              value: "poultry-under-50",
            },
            {
              logicalOperator: "OR",
              questionText: "Livestock that you keep",
              operator: "contains",
              value: "racing-pigeons",
            },
          ],
        },
      ],
      order: 21,
      isExitPage: true,
    },
    // Page 22: Animal by-products use
    {
      pageId: "page22",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q26",
          label: "What do you use animal by-products for?",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond15",
          conditionName: "Contains Animal By-products",
          rules: [
            {
              questionText: "Livestock that you keep",
              operator: "contains",
              value: "animal-by-products",
            },
          ],
        },
      ],
      order: 22,
    },
    // Page 23: Market/Showground/Zoo
    {
      pageId: "page23",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q27",
          label: "Is your business a market, showground or zoo?",
          type: "list",
          subType: "radios",
          options: [
            { value: "market", text: "Market" },
            { value: "showground", text: "Showground" },
            { value: "zoo", text: "Zoo" },
            { value: "none", text: "None of the above" },
          ],
        },
      ],
      conditions: [],
      order: 23,
    },
    // Page 24: Second contact
    {
      pageId: "page24",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q28",
          label: "Do you want to add a second contact?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [
        {
          id: "cond16",
          conditionName: "Business Registration",
          rules: [
            {
              questionText: "Are you a hobbyist keeper or a business?",
              operator: "is",
              value: "business",
            },
          ],
        },
      ],
      order: 24,
    },
    // Page 25: Second contact details
    {
      pageId: "page25",
      pageType: "question",
      pageHeading: "Contact details of the second contact",
      questions: [
        {
          questionId: "q29",
          label: "Title",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q30",
          label: "First name of second contact",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q31",
          label: "Middle name of second contact",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q32",
          label: "Last name of second contact",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q33",
          label: "Phone number of second contact",
          type: "phone",
        },
        {
          questionId: "q34",
          label: "Email address of second contact",
          type: "email",
        },
        {
          questionId: "q35",
          label: "Home address for the second contact",
          type: "address",
        },
      ],
      conditions: [
        {
          id: "cond17",
          conditionName: "Second Contact Required",
          rules: [
            {
              questionText: "Second contact",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 25,
    },
    // Page 26: Arrival date
    {
      pageId: "page26",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q36",
          label: "What date will the livestock or animal by-products arrive?",
          type: "date",
          subType: "day-month-year",
        },
      ],
      conditions: [],
      order: 26,
    },
    // Page 27: Must arrive within 6 weeks (exit page)
    {
      pageId: "page27",
      pageType: "guidance",
      guidanceOnlyHeadingInput: "The livestock must arrive within 6 weeks",
      guidanceOnlyGuidanceTextInput:
        "The livestock or animal by-products must arrive within 6 weeks from today's date. You cannot apply for your county parish number (CPH) number now as the date you have entered is more than 6 weeks from today's date.",
      conditions: [
        {
          id: "cond18",
          conditionName: "Livestock Not Within 6 Weeks",
          rules: [
            {
              questionText:
                "What date will the livestock or animal by-products arrive?",
              operator: "is more than",
              value: "6 weeks",
            },
          ],
        },
      ],
      order: 27,
      isExitPage: true,
    },
    // Page 28: Keep livestock at home
    {
      pageId: "page28",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q37",
          label:
            "Will you keep livestock or use animal by-products at your home address?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 28,
    },
    // Page 29: Livestock address
    {
      pageId: "page29",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q38",
          label:
            "What's the address where you'll keep livestock or use animal by-products?",
          type: "address",
        },
      ],
      conditions: [
        {
          id: "cond19",
          conditionName: "Will Keep Livestock at Home",
          rules: [
            {
              questionText:
                "Will you keep livestock or use animal by-products at your home address?",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 29,
    },
    // Page 30: National Grid field number
    {
      pageId: "page30",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q39",
          label:
            "What's the National Grid field number for the main area where you'll keep livestock or use animal by-products?",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [],
      order: 30,
    },
    // Page 31: Additional locations
    {
      pageId: "page31",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q40",
          label:
            "Will you keep livestock or use animal by-products anywhere else?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 31,
    },
    // Page 32: Additional field numbers
    {
      pageId: "page32",
      pageType: "question",
      pageHeading:
        "National Grid field numbers for other land and buildings where you'll keep livestock",
      questions: [
        {
          questionId: "q41",
          label: "National Grid field number for additional field 2",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q42",
          label: "National Grid field number for additional field 3",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q43",
          label: "National Grid field number for additional field 4",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q44",
          label: "National Grid field number for additional field 5",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q45",
          label: "National Grid field number for additional field 6",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q46",
          label: "National Grid field number for additional field 7",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q47",
          label: "National Grid field number for additional field 8",
          type: "text",
          subType: "short-answer-nf",
        },
        {
          questionId: "q48",
          label: "National Grid field number for additional field 9",
          type: "text",
          subType: "short-answer-nf",
        },
      ],
      conditions: [
        {
          id: "cond20",
          conditionName: "Will Keep Livestock Elsewhere",
          rules: [
            {
              questionText:
                "Will you keep livestock or use animal by-products anywhere else?",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 32,
    },
    // Page 33: Land ownership
    {
      pageId: "page33",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q49",
          label: "Do you own the land?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 33,
    },
    // Page 34: Tenancy agreement
    {
      pageId: "page34",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q50",
          label: "Is your tenancy agreement for more than one year?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [
        {
          id: "cond21",
          conditionName: "Does Not Own Land",
          rules: [
            {
              questionText: "Do you own the land?",
              operator: "is",
              value: "false",
            },
          ],
        },
      ],
      order: 34,
    },
    // Page 35: Landowner CPH number
    {
      pageId: "page35",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q51",
          label: "Does the landowner have a CPH number for the land?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [
        {
          id: "cond22",
          conditionName: "Long Term Tenancy",
          rules: [
            {
              questionText: "Is your tenancy agreement for more than one year?",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 35,
    },
    // Page 36: Additional information
    {
      pageId: "page36",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q52",
          label: "Do you want to tell us anything else?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 36,
    },
    // Page 37: Additional information text
    {
      pageId: "page37",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q53",
          label: "What do you want to tell us?",
          type: "text",
          subType: "long-answer",
        },
      ],
      conditions: [
        {
          id: "cond23",
          conditionName: "Wants to Provide Additional Information",
          rules: [
            {
              questionText: "Anything else to tell us",
              operator: "is",
              value: "true",
            },
          ],
        },
      ],
      order: 37,
    },
    // Page 38: Rural payments
    {
      pageId: "page38",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q54",
          label: "Do you intend to claim funding from the RPA?",
          type: "list",
          subType: "yes-no",
        },
      ],
      conditions: [],
      order: 38,
    },
    // Page 39: Proof of ownership
    {
      pageId: "page39",
      pageType: "question",
      pageHeading: "",
      questions: [
        {
          questionId: "q55",
          label: "Proof of ownership",
          type: "file",
        },
      ],
      conditions: [],
      order: 39,
    },
    // Page 40: Pizza selection (repeater)
    {
      pageId: "page40",
      pageType: "question",
      pageHeading: "What would like to eat?",
      questions: [
        {
          questionId: "q56",
          label: "Select field",
          type: "list",
          subType: "select",
          options: [
            { value: "c&t", text: "c&t" },
            { value: "pepperoni", text: "Pepperoni" },
          ],
        },
      ],
      conditions: [],
      order: 40,
      setName: "Pizza",
    },
  ];

  // Create CPH form conditions
  const cphConditions = [
    {
      id: "form-cond1",
      conditionName: "Already Registered with RPA",
      rules: [
        {
          questionText: "Registered with the Rural Payments Agency",
          operator: "is",
          value: "true",
        },
      ],
    },
    {
      id: "form-cond2",
      conditionName: "Non-England Location",
      rules: [
        {
          questionText: "Country where you will keep livestock",
          operator: "is",
          value: "Northern Ireland",
        },
        {
          logicalOperator: "OR",
          questionText: "Country where you will keep livestock",
          operator: "is",
          value: "Scotland",
        },
        {
          logicalOperator: "OR",
          questionText: "Country where you will keep livestock",
          operator: "is",
          value: "Wales",
        },
      ],
    },
    {
      id: "form-cond3",
      conditionName: "Hobbyist Keeper",
      rules: [
        {
          questionText: "Are you a hobbyist keeper or a business?",
          operator: "is",
          value: "hobbyist",
        },
      ],
    },
    {
      id: "form-cond4",
      conditionName: "Business Registration",
      rules: [
        {
          questionText: "Are you a hobbyist keeper or a business?",
          operator: "is",
          value: "business",
        },
      ],
    },
    {
      id: "form-cond5",
      conditionName: "Must Have Companies House Number",
      rules: [
        {
          questionText: "Business legal status",
          operator: "is",
          value: "private-limited",
        },
        {
          logicalOperator: "OR",
          questionText: "Business legal status",
          operator: "is",
          value: "limited-partnership",
        },
      ],
    },
    {
      id: "form-cond6",
      conditionName: "Must Have Charity Number",
      rules: [
        {
          questionText: "Business legal status",
          operator: "is",
          value: "charitable-trust",
        },
      ],
    },
    {
      id: "form-cond7",
      conditionName: "Other Business Type",
      rules: [
        {
          questionText: "Business type",
          operator: "is",
          value: "something-else",
        },
      ],
    },
    {
      id: "form-cond8",
      conditionName: "Less Than 50 Birds or Racing Pigeons",
      rules: [
        {
          questionText: "Livestock that you keep",
          operator: "contains",
          value: "poultry-under-50",
        },
        {
          logicalOperator: "OR",
          questionText: "Livestock that you keep",
          operator: "contains",
          value: "racing-pigeons",
        },
      ],
    },
    {
      id: "form-cond9",
      conditionName: "Contains Animal By-products",
      rules: [
        {
          questionText: "Livestock that you keep",
          operator: "contains",
          value: "animal-by-products",
        },
      ],
    },
    {
      id: "form-cond10",
      conditionName: "Second Contact Required",
      rules: [
        {
          questionText: "Second contact",
          operator: "is",
          value: "true",
        },
      ],
    },
    {
      id: "form-cond11",
      conditionName: "Livestock Not Within 6 Weeks",
      rules: [
        {
          questionText:
            "What date will the livestock or animal by-products arrive?",
          operator: "is more than",
          value: "6 weeks",
        },
      ],
    },
    {
      id: "form-cond12",
      conditionName: "Will Keep Livestock at Home",
      rules: [
        {
          questionText:
            "Will you keep livestock or use animal by-products at your home address?",
          operator: "is",
          value: "true",
        },
      ],
    },
    {
      id: "form-cond13",
      conditionName: "Will Keep Livestock Elsewhere",
      rules: [
        {
          questionText:
            "Will you keep livestock or use animal by-products anywhere else?",
          operator: "is",
          value: "true",
        },
      ],
    },
    {
      id: "form-cond14",
      conditionName: "Does Not Own Land",
      rules: [
        {
          questionText: "Do you own the land?",
          operator: "is",
          value: "false",
        },
      ],
    },
    {
      id: "form-cond15",
      conditionName: "Long Term Tenancy",
      rules: [
        {
          questionText: "Is your tenancy agreement for more than one year?",
          operator: "is",
          value: "true",
        },
      ],
    },
    {
      id: "form-cond16",
      conditionName: "Wants to Provide Additional Information",
      rules: [
        {
          questionText: "Anything else to tell us",
          operator: "is",
          value: "true",
        },
      ],
    },
  ];

  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages: cphFormPages,
    sections: [],
    form: {
      name: "Apply for a county parish holding (CPH) number",
    },
    request: req,
    data: {
      conditions: cphConditions,
      formName: "Apply for a county parish holding (CPH) number",
    },
  });
});

// Tutorial route
router.get("/titan-mvp-1.2/form-editor/tutorial", function (req, res) {
  res.render("titan-mvp-1.2/form-editor/tutorial", {
    form: {
      name: "Forms Designer Tutorial",
    },
    data: req.session.data || {},
  });
});

// DWP Find an Address Plugin Error Demonstration Routes
router.get("/dwp-error-demonstration", function (req, res) {
  res.render("dwp-error-demonstration/index.njk");
});

router.get("/dwp-error-demonstration/missing-input", function (req, res) {
  res.render("dwp-error-demonstration/missing-input.njk");
});

router.get(
  "/dwp-error-demonstration/manual-address-errors",
  function (req, res) {
    res.render("dwp-error-demonstration/manual-address-errors.njk");
  }
);

router.get("/dwp-error-demonstration/no-address-found", function (req, res) {
  res.render("dwp-error-demonstration/no-address-found.njk");
});

router.get("/dwp-error-demonstration/working-example", function (req, res) {
  res.render("dwp-error-demonstration/working-example.njk");
});

// Unicorn Breeder Form Routes
router.get("/declaration", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/declaration", {
    error: req.session.data.error
  });
});

router.post("/declaration", function (req, res) {
  const { declaration } = req.body;

  if (!declaration || !declaration.includes("confirmed")) {
    req.session.data.error = { declarationError: "You must accept the declaration to continue" };
    return res.redirect("/declaration");
  }

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/whats-your-name");
});

router.get("/whats-your-name", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-name", {
    error: req.session.data.error
  });
});

router.post("/whats-your-name", function (req, res) {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    req.session.data.error = { nameError: "Enter your full name" };
    return res.redirect("/whats-your-name");
  }

  // Save the data
  req.session.data.name = name;
  console.log("Name saved to session:", req.session.data.name);

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/whats-your-email-address");
});

router.get("/whats-your-email-address", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-email-address", {
    error: req.session.data.error
  });
});

router.post("/whats-your-email-address", function (req, res) {
  const { email } = req.body;

  if (!email || email.trim() === "") {
    req.session.data.error = { emailError: "Enter your email address" };
    return res.redirect("/whats-your-email-address");
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.session.data.error = { emailError: "Enter a valid email address" };
    return res.redirect("/whats-your-email-address");
  }

  // Save the data
  req.session.data.email = email;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/whats-your-phone-number");
});

router.get("/whats-your-phone-number", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-phone-number", {
    error: req.session.data.error
  });
});

router.post("/whats-your-phone-number", function (req, res) {
  const { phoneNumber } = req.body;

  if (!phoneNumber || phoneNumber.trim() === "") {
    req.session.data.error = { phoneError: "Enter your phone number" };
    return res.redirect("/whats-your-phone-number");
  }

  // Basic phone number validation (UK format)
  const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    req.session.data.error = { phoneError: "Enter a valid UK phone number" };
    return res.redirect("/whats-your-phone-number");
  }

  // Save the data
  req.session.data.phoneNumber = phoneNumber;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/whats-your-address");
});

router.get("/whats-your-address", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-address", {
    error: req.session.data.error
  });
});

router.post("/whats-your-address", function (req, res) {
  const { action } = req.body;

  if (action === "continue") {
    // Check if address is selected
    if (!req.session.data.selectedAddress && !req.session.data.finalAddress && !req.session.data['wZLWPy-address-line-1']) {
      req.session.data.error = { addressError: true };
      return res.redirect("/whats-your-address");
    }

    // Clear any errors
    delete req.session.data.error;
    res.redirect("/what-type-of-unicorns-will-you-breed");
  } else if (action === "exit") {
    // Store the current page as returnUrl for when user resumes
    req.session.data.returnUrl = "/whats-your-address";
    res.redirect("/save-progress");
  }
});


router.get("/what-address-do-you-want-the-certificate-sent-to", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/what-address-do-you-want-the-certificate-sent-to");
});

router.post("/what-address-do-you-want-the-certificate-sent-to", function (req, res) {
  res.redirect("/when-does-your-unicorn-insurance-policy-start");
});

router.get("/when-does-your-unicorn-insurance-policy-start", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/when-does-your-unicorn-insurance-policy-start", {
    error: req.session.data.error
  });
});

router.post("/when-does-your-unicorn-insurance-policy-start", function (req, res) {
  const { 'insuranceStartDate-day': day, 'insuranceStartDate-month': month, 'insuranceStartDate-year': year } = req.body;

  if (!day || !month || !year) {
    req.session.data.error = { dateError: "Enter the insurance policy start date" };
    return res.redirect("/when-does-your-unicorn-insurance-policy-start");
  }

  // Basic date validation
  const date = new Date(year, month - 1, day);
  if (date.getDate() != day || date.getMonth() != month - 1 || date.getFullYear() != year) {
    req.session.data.error = { dateError: "Enter a valid date" };
    return res.redirect("/when-does-your-unicorn-insurance-policy-start");
  }

  // Save the data
  req.session.data['insuranceStartDate-day'] = day;
  req.session.data['insuranceStartDate-month'] = month;
  req.session.data['insuranceStartDate-year'] = year;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/upload-your-insurance-certificate");
});

router.get("/upload-your-insurance-certificate", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/upload-your-insurance-certificate");
});

router.post("/upload-your-insurance-certificate", function (req, res) {
  res.redirect("/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.post("/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  const { aitzzV } = req.body;

  if (!aitzzV) {
    req.session.data.error = { numberError: "Select how many unicorns you expect to breed" };
    return res.redirect("/how-many-unicorns-do-you-expect-to-breed-each-year");
  }

  // Save the data
  req.session.data.aitzzV = aitzzV;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/where-will-you-keep-the-unicorns");
});

router.get("/what-type-of-unicorns-will-you-breed", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/what-type-of-unicorns-will-you-breed");
});

router.post("/what-type-of-unicorns-will-you-breed", function (req, res) {
  const { DyfjJC } = req.body;

  if (!DyfjJC || DyfjJC.length === 0) {
    req.session.data.error = { typeError: "Select at least one type of unicorn" };
    return res.redirect("/what-type-of-unicorns-will-you-breed");
  }

  // Save the data
  req.session.data.DyfjJC = DyfjJC;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/where-will-you-keep-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/where-will-you-keep-the-unicorns");
});

router.post("/where-will-you-keep-the-unicorns", function (req, res) {
  const { 'location-easting': easting, 'location-northing': northing } = req.body;

  if (!easting || !northing) {
    req.session.data.error = { locationError: "Enter both easting and northing coordinates" };
    return res.redirect("/where-will-you-keep-the-unicorns");
  }

  // Save the data
  req.session.data['location-easting'] = easting;
  req.session.data['location-northing'] = northing;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.post("/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  const { zhJMaM } = req.body;

  if (!zhJMaM || zhJMaM.trim() === "") {
    req.session.data.error = { staffError: "Enter the number of staff members" };
    return res.redirect("/how-many-members-of-staff-will-look-after-the-unicorns");
  }

  // Save the data
  req.session.data.zhJMaM = zhJMaM;

  // Clear any errors
  delete req.session.data.error;
  res.redirect("/payment-question");
});

// ── Runner v2: same form without payment or postcode lookup ─────────────────
function ensureReviewStore(req) {
  if (!req.app.locals.reviewStore) {
    req.app.locals.reviewStore = new Map();
  }
  return req.app.locals.reviewStore;
}

function ensureRunnerV5SubmissionStore(req) {
  // IMPORTANT: store in session, not app.locals.
  // Heroku (and multi-process dev setups) can route requests to different
  // processes/dynos, so app.locals memory cannot be relied on for lookups.
  if (!req.session.data) req.session.data = {};
  if (!Array.isArray(req.session.data.runnerV5SubmissionStore)) {
    req.session.data.runnerV5SubmissionStore = [];
  }
  return req.session.data.runnerV5SubmissionStore;
}

function normalizeRunnerV5Email(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeRunnerV5ReferenceNumber(referenceNumber) {
  return String(referenceNumber || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function findRunnerV5Submission(req, email, referenceNumber) {
  const store = ensureRunnerV5SubmissionStore(req);
  const normalizedEmail = normalizeRunnerV5Email(email);
  const normalizedRef = normalizeRunnerV5ReferenceNumber(referenceNumber);

  // Flexible path: match by normalized reference (ignore hyphens/spaces/case)
  for (const entry of store) {
    const entryEmail = normalizeRunnerV5Email(entry.email);
    const entryRef = normalizeRunnerV5ReferenceNumber(entry.referenceNumber);
    if (!entryRef || entryRef !== normalizedRef) continue;
    // If the reference matches, allow it. Email acts as a hint only (useful if
    // participants enter a different email, or the original submission had no email).
    if (!normalizedEmail) return entry;
    if (entryEmail === normalizedEmail) return entry;
    if (!entryEmail) return entry;
  }

  return null;
}

function createRunnerV5ReferenceNumber() {
  const bytes = require("crypto").randomBytes(4).toString("hex").toUpperCase();
  return `V5-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}

function getRunnerV5CurrentFormVersion(req) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.runnerV5CurrentFormVersion) {
    req.session.data.runnerV5CurrentFormVersion = 1;
  }
  return Number(req.session.data.runnerV5CurrentFormVersion) || 1;
}

function createReviewToken() {
  return require("crypto").randomBytes(24).toString("hex");
}

function reviewerAccessValues() {
  return {
    referenceNumber: "V25-AWC-M56",
    memorableWord: "chicken nuggets"
  };
}

function applyRunnerV3DemoData(data) {
  const demoData = {
    name: "Alex Example",
    email: "alex.example@gov.uk",
    phoneNumber: "07123 456789",
    selectedAddress: "10 Example Street, London, SW1A 1AA",
    aitzzV: "11 to 20",
    DyfjJC: ["Rainbow", "Forest"],
    "location-easting": "530047",
    "location-northing": "180377",
    zhJMaM: "12"
  };

  const hasDyfjJC =
    Array.isArray(data.DyfjJC) ? data.DyfjJC.length > 0 : Boolean(data.DyfjJC);
  const hasRealAnswers =
    Boolean(String(data.name || "").trim()) ||
    Boolean(String(data.email || "").trim()) ||
    Boolean(String(data.phoneNumber || "").trim()) ||
    Boolean(String(data.selectedAddress || data.finalAddress || "").trim()) ||
    Boolean(String(data.aitzzV || "").trim()) ||
    hasDyfjJC ||
    Boolean(String(data["location-easting"] || "").trim()) ||
    Boolean(String(data["location-northing"] || "").trim()) ||
    Boolean(String(data.zhJMaM || "").trim());

  if (!hasRealAnswers) {
    Object.assign(data, demoData);
  }
}

router.get("/runner-v2/start", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/start-v2");
});

router.get("/runner-v2/declaration", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/declaration", {
    error: req.session.data.error,
    basePath: "/runner-v2"
  });
});

router.post("/runner-v2/declaration", function (req, res) {
  const { declaration } = req.body;
  if (!declaration || !declaration.includes("confirmed")) {
    req.session.data.error = { declarationError: "You must accept the declaration to continue" };
    return res.redirect("/runner-v2/declaration");
  }
  delete req.session.data.error;
  res.redirect("/runner-v2/whats-your-name");
});

router.get("/runner-v2/whats-your-name", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-name", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/whats-your-name", function (req, res) {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    req.session.data.error = { nameError: "Enter your full name" };
    return res.redirect("/runner-v2/whats-your-name");
  }
  req.session.data.name = name;
  delete req.session.data.error;
  res.redirect("/runner-v2/whats-your-email-address");
});

router.get("/runner-v2/whats-your-email-address", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-email-address", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/whats-your-email-address", function (req, res) {
  const { email } = req.body;
  if (!email || email.trim() === "") {
    req.session.data.error = { emailError: "Enter your email address" };
    return res.redirect("/runner-v2/whats-your-email-address");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.session.data.error = { emailError: "Enter a valid email address" };
    return res.redirect("/runner-v2/whats-your-email-address");
  }
  req.session.data.email = email;
  delete req.session.data.error;
  res.redirect("/runner-v2/whats-your-phone-number");
});

router.get("/runner-v2/whats-your-phone-number", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-phone-number", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/whats-your-phone-number", function (req, res) {
  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.trim() === "") {
    req.session.data.error = { phoneError: "Enter your phone number" };
    return res.redirect("/runner-v2/whats-your-phone-number");
  }
  const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    req.session.data.error = { phoneError: "Enter a valid UK phone number" };
    return res.redirect("/runner-v2/whats-your-phone-number");
  }
  req.session.data.phoneNumber = phoneNumber;
  delete req.session.data.error;
  res.redirect("/runner-v2/whats-your-address");
});

router.get("/runner-v2/whats-your-address", function (req, res) {
  req.session.data.returnUrl = req.session.data.returnUrl || "/runner-v2/whats-your-address";
  res.render("titan-mvp-1.2/runner/questions/whats-your-address-no-lookup", {
    error: req.session.data.error
  });
});
router.post("/runner-v2/whats-your-address", function (req, res) {
  const { action } = req.body;
  if (action === "continue") {
    if (!req.session.data.selectedAddress && !req.session.data.finalAddress && !req.session.data['wZLWPy-address-line-1']) {
      req.session.data.error = { addressError: true };
      return res.redirect("/runner-v2/whats-your-address");
    }
    delete req.session.data.error;
    res.redirect("/runner-v2/what-type-of-unicorns-will-you-breed");
  } else if (action === "exit") {
    req.session.data.returnUrl = "/runner-v2/whats-your-address";
    res.redirect("/save-progress");
  }
});

router.get("/runner-v2/what-type-of-unicorns-will-you-breed", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/what-type-of-unicorns-will-you-breed", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/what-type-of-unicorns-will-you-breed", function (req, res) {
  const { DyfjJC } = req.body;
  if (!DyfjJC || DyfjJC.length === 0) {
    req.session.data.error = { typeError: "Select at least one type of unicorn" };
    return res.redirect("/runner-v2/what-type-of-unicorns-will-you-breed");
  }
  req.session.data.DyfjJC = DyfjJC;
  delete req.session.data.error;
  res.redirect("/runner-v2/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/runner-v2/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-unicorns-do-you-expect-to-breed-each-year", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  const { aitzzV } = req.body;
  if (!aitzzV) {
    req.session.data.error = { numberError: "Select how many unicorns you expect to breed" };
    return res.redirect("/runner-v2/how-many-unicorns-do-you-expect-to-breed-each-year");
  }
  req.session.data.aitzzV = aitzzV;
  delete req.session.data.error;
  // Skip "where you keep the unicorns" question (removed from runner-v2 flow)
  res.redirect("/runner-v2/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v2/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-members-of-staff-will-look-after-the-unicorns", { error: req.session.data.error, basePath: "/runner-v2" });
});
router.post("/runner-v2/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  const { zhJMaM } = req.body;
  if (!zhJMaM || zhJMaM.trim() === "") {
    req.session.data.error = { staffError: "Enter the number of staff members" };
    return res.redirect("/runner-v2/how-many-members-of-staff-will-look-after-the-unicorns");
  }
  req.session.data.zhJMaM = zhJMaM;
  delete req.session.data.error;
  res.redirect("/runner-v2/summary");
});

router.get("/runner-v2/summary", function (req, res) {
  if (!req.session.data) req.session.data = {};
  res.render("titan-mvp-1.2/runner/summary-no-payment", {
    data: req.session.data
  });
});
router.post("/runner-v2/summary", function (req, res) {
  res.redirect("/runner-v2/confirmation");
});

router.get("/runner-v2/confirmation", function (req, res) {
  res.render("titan-mvp-1.2/runner/confirmation-v2");
});

// ── Runner v3: runner-v2 with reviewer-gated submission ─────────────────────
router.get("/runner-v3/start", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/start-v2");
});

router.get("/runner-v3/declaration", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/declaration", {
    error: req.session.data.error,
    basePath: "/runner-v3"
  });
});

router.post("/runner-v3/declaration", function (req, res) {
  const { declaration } = req.body;
  if (!declaration || !declaration.includes("confirmed")) {
    req.session.data.error = { declarationError: "You must accept the declaration to continue" };
    return res.redirect("/runner-v3/declaration");
  }
  delete req.session.data.error;
  res.redirect("/runner-v3/whats-your-name");
});

router.get("/runner-v3/whats-your-name", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-name", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/whats-your-name", function (req, res) {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    req.session.data.error = { nameError: "Enter your full name" };
    return res.redirect("/runner-v3/whats-your-name");
  }
  req.session.data.name = name;
  delete req.session.data.error;
  res.redirect("/runner-v3/whats-your-email-address");
});

router.get("/runner-v3/whats-your-email-address", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-email-address", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/whats-your-email-address", function (req, res) {
  const { email } = req.body;
  if (!email || email.trim() === "") {
    req.session.data.error = { emailError: "Enter your email address" };
    return res.redirect("/runner-v3/whats-your-email-address");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.session.data.error = { emailError: "Enter a valid email address" };
    return res.redirect("/runner-v3/whats-your-email-address");
  }
  req.session.data.email = email;
  delete req.session.data.error;
  res.redirect("/runner-v3/whats-your-phone-number");
});

router.get("/runner-v3/whats-your-phone-number", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-phone-number", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/whats-your-phone-number", function (req, res) {
  const { phoneNumber } = req.body;
  if (!phoneNumber || phoneNumber.trim() === "") {
    req.session.data.error = { phoneError: "Enter your phone number" };
    return res.redirect("/runner-v3/whats-your-phone-number");
  }
  const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    req.session.data.error = { phoneError: "Enter a valid UK phone number" };
    return res.redirect("/runner-v3/whats-your-phone-number");
  }
  req.session.data.phoneNumber = phoneNumber;
  delete req.session.data.error;
  res.redirect("/runner-v3/whats-your-address");
});

router.get("/runner-v3/whats-your-address", function (req, res) {
  req.session.data.returnUrl = req.session.data.returnUrl || "/runner-v3/whats-your-address";
  res.render("titan-mvp-1.2/runner/questions/whats-your-address-no-lookup", {
    error: req.session.data.error
  });
});
router.post("/runner-v3/whats-your-address", function (req, res) {
  const { action } = req.body;
  if (action === "continue") {
    if (!req.session.data.selectedAddress && !req.session.data.finalAddress && !req.session.data["wZLWPy-address-line-1"]) {
      req.session.data.error = { addressError: true };
      return res.redirect("/runner-v3/whats-your-address");
    }
    delete req.session.data.error;
    res.redirect("/runner-v3/what-type-of-unicorns-will-you-breed");
  } else if (action === "exit") {
    req.session.data.returnUrl = "/runner-v3/whats-your-address";
    res.redirect("/save-progress");
  }
});

router.get("/runner-v3/what-type-of-unicorns-will-you-breed", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/what-type-of-unicorns-will-you-breed", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/what-type-of-unicorns-will-you-breed", function (req, res) {
  const { DyfjJC } = req.body;
  if (!DyfjJC || DyfjJC.length === 0) {
    req.session.data.error = { typeError: "Select at least one type of unicorn" };
    return res.redirect("/runner-v3/what-type-of-unicorns-will-you-breed");
  }
  req.session.data.DyfjJC = DyfjJC;
  delete req.session.data.error;
  res.redirect("/runner-v3/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/runner-v3/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-unicorns-do-you-expect-to-breed-each-year", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  const { aitzzV } = req.body;
  if (!aitzzV) {
    req.session.data.error = { numberError: "Select how many unicorns you expect to breed" };
    return res.redirect("/runner-v3/how-many-unicorns-do-you-expect-to-breed-each-year");
  }
  req.session.data.aitzzV = aitzzV;
  delete req.session.data.error;
  res.redirect("/runner-v3/where-will-you-keep-the-unicorns");
});

router.get("/runner-v3/where-will-you-keep-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/where-will-you-keep-the-unicorns", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/where-will-you-keep-the-unicorns", function (req, res) {
  const { "location-easting": easting, "location-northing": northing } = req.body;
  if (!easting || !northing) {
    req.session.data.error = { locationError: "Enter both easting and northing coordinates" };
    return res.redirect("/runner-v3/where-will-you-keep-the-unicorns");
  }
  req.session.data["location-easting"] = easting;
  req.session.data["location-northing"] = northing;
  delete req.session.data.error;
  res.redirect("/runner-v3/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v3/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-members-of-staff-will-look-after-the-unicorns", { error: req.session.data.error, basePath: "/runner-v3" });
});
router.post("/runner-v3/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  const { zhJMaM } = req.body;
  if (!zhJMaM || zhJMaM.trim() === "") {
    req.session.data.error = { staffError: "Enter the number of staff members" };
    return res.redirect("/runner-v3/how-many-members-of-staff-will-look-after-the-unicorns");
  }
  req.session.data.zhJMaM = zhJMaM;
  delete req.session.data.error;
  req.session.data.reviewDeclarationComplete = false;
  delete req.session.data.reviewDeclarationError;
  res.redirect("/runner-v3/summary");
});

router.get("/runner-v3/summary", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);
  const newLinkGenerated = req.query.newLink === "1";

  const reviewStore = ensureReviewStore(req);
  let reviewToken = req.session.data.reviewToken;
  if (!reviewToken) {
    reviewToken = createReviewToken();
    req.session.data.reviewToken = reviewToken;
  }

  const existingEntry = reviewStore.get(reviewToken);
  const reviewerDeclarationComplete =
    existingEntry && existingEntry.expires > Date.now()
      ? Boolean(existingEntry.reviewDeclarationComplete)
      : false;

  req.session.data.reviewDeclarationComplete = reviewerDeclarationComplete;

  reviewStore.set(reviewToken, {
    data: { ...req.session.data },
    reviewDeclarationComplete: reviewerDeclarationComplete,
    reviewerDeclaredAt:
      existingEntry && existingEntry.reviewerDeclaredAt
        ? existingEntry.reviewerDeclaredAt
        : null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  const shareReviewUrl = `/runner-v3/review-declaration?token=${encodeURIComponent(reviewToken)}`;
  const absoluteShareReviewUrl = `${PUBLIC_BASE_URL}${shareReviewUrl}`;
  const reviewStatus = reviewerDeclarationComplete
    ? "Reviewer declaration complete"
    : "Awaiting reviewer declaration";

  res.render("titan-mvp-1.2/runner-v3/summary-no-payment", {
    data: req.session.data,
    reviewStatus,
    shareReviewUrl: absoluteShareReviewUrl,
    newLinkGenerated
  });
});

router.post("/runner-v3/summary/generate-review-link", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const reviewStore = ensureReviewStore(req);
  const previousToken = req.session.data.reviewToken;

  if (previousToken) {
    reviewStore.delete(previousToken);
  }

  const newToken = RUNNER_V3_REVIEW_TOKEN;
  req.session.data.reviewToken = newToken;
  req.session.data.reviewDeclarationComplete = false;
  delete req.session.data.reviewDeclarationError;

  reviewStore.set(newToken, {
    data: { ...req.session.data },
    reviewDeclarationComplete: false,
    reviewerDeclaredAt: null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  return res.redirect("/runner-v3/summary?newLink=1");
});

router.post("/runner-v3/summary", function (req, res) {
  const reviewStore = ensureReviewStore(req);
  const reviewToken = req.session.data && req.session.data.reviewToken;
  const reviewEntry = reviewToken ? reviewStore.get(reviewToken) : null;
  const reviewerDeclarationComplete =
    reviewEntry && reviewEntry.expires > Date.now()
      ? Boolean(reviewEntry.reviewDeclarationComplete)
      : false;

  if (!reviewerDeclarationComplete) {
    req.session.data.reviewDeclarationError =
      "The reviewer must complete declaration before you can send this form";
    return res.redirect("/runner-v3/summary");
  }

  delete req.session.data.reviewDeclarationError;
  req.session.data.reviewDeclarationComplete = true;
  res.redirect("/runner-v3/confirmation");
});

router.get("/runner-v3/review-declaration", function (req, res) {
  const { token, success } = req.query;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.render("titan-mvp-1.2/runner-v3/review-declaration", {
      tokenValid: false
    });
  }

  if (!req.session.data) {
    req.session.data = {};
  }
  if (reviewEntry.data && typeof reviewEntry.data === "object") {
    // Merge form data into session without wiping reviewer access flags.
    req.session.data = { ...req.session.data, ...reviewEntry.data };
  }

  const accessMap = req.session.data.reviewAccessTokens || {};
  const hasReviewerAccess = Boolean(token && accessMap[token]);
  const reviewAccessError = req.session.data.reviewAccessError;
  const enteredReferenceNumber = req.session.data.enteredReviewerReferenceNumber || "";
  const enteredMemorableWord = req.session.data.enteredReviewerMemorableWord || "";

  if (!hasReviewerAccess) {
    return res.render("titan-mvp-1.2/runner-v3/review-declaration", {
      tokenValid: true,
      token,
      hasReviewerAccess: false,
      reviewAccessError,
      enteredReferenceNumber,
      enteredMemorableWord
    });
  }

  delete req.session.data.reviewAccessError;
  delete req.session.data.enteredReviewerReferenceNumber;
  delete req.session.data.enteredReviewerMemorableWord;
  applyRunnerV3DemoData(req.session.data);
  reviewEntry.data = { ...req.session.data };

  const error = req.session.data && req.session.data.error;

  res.render("titan-mvp-1.2/runner-v3/review-declaration", {
    tokenValid: true,
    token,
    hasReviewerAccess: true,
    data: reviewEntry.data || {},
    success: success === "1",
    error
  });
});

router.post("/runner-v3/review-declaration/access", function (req, res) {
  const { token, reviewerReferenceNumber, reviewerMemorableWord } = req.body;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v3/review-declaration");
  }

  const expected = reviewerAccessValues();
  const normalizedReference = (reviewerReferenceNumber || "").trim();
  const normalizedWord = (reviewerMemorableWord || "").trim().toLowerCase();

  if (
    normalizedReference !== expected.referenceNumber ||
    normalizedWord !== expected.memorableWord.toLowerCase()
  ) {
    req.session.data.reviewAccessError =
      "Enter the correct reviewer reference number and memorable word";
    req.session.data.enteredReviewerReferenceNumber = reviewerReferenceNumber || "";
    req.session.data.enteredReviewerMemorableWord = reviewerMemorableWord || "";
    return res.redirect(`/runner-v3/review-declaration?token=${encodeURIComponent(token)}`);
  }

  const accessMap = req.session.data.reviewAccessTokens || {};
  accessMap[token] = true;
  req.session.data.reviewAccessTokens = accessMap;
  delete req.session.data.reviewAccessError;
  delete req.session.data.enteredReviewerReferenceNumber;
  delete req.session.data.enteredReviewerMemorableWord;

  return res.redirect(`/runner-v3/review-declaration?token=${encodeURIComponent(token)}`);
});

router.post("/runner-v3/review-declaration", function (req, res) {
  const { token, declaration } = req.body;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v3/review-declaration");
  }

  if (!declaration || !declaration.includes("confirmed")) {
    req.session.data.error = {
      declarationError: "You must accept the declaration to continue"
    };
    return res.redirect(`/runner-v3/review-declaration?token=${encodeURIComponent(token)}`);
  }

  delete req.session.data.error;
  reviewStore.set(token, {
    ...reviewEntry,
    reviewDeclarationComplete: true,
    reviewerDeclaredAt: new Date().toISOString(),
    expires: Date.now() + (30 * 60 * 1000)
  });

  return res.redirect(`/runner-v3/review-declaration?token=${encodeURIComponent(token)}&success=1`);
});

router.get("/runner-v3/confirmation", function (req, res) {
  res.render("titan-mvp-1.2/runner/confirmation-v2");
});

// ── Runner sign-in (OTP-only) ────────────────────────────────────────────────

function sanitizeRunnerSignInNext(next) {
  if (!next) return null;
  const s = String(next).trim();
  if (!s.startsWith("/")) return null;
  if (s.startsWith("//")) return null;
  if (s.includes("://")) return null;
  return s;
}

function ensureRunnerSignInSession(req) {
  if (!req.session.data) req.session.data = {};
  return req.session.data;
}

function formatRunnerSignInLastUpdated(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  return `Last updated ${dateStr} at ${timeStr}`;
}

/** Prototype-only list of in-progress (not submitted) saved forms */
function getRunnerSignInSavedDraftsPrototype() {
  return [
    {
      id: "draft-unicorn-20260428",
      label: "Register as a unicorn breeder",
      iso: "2026-04-28T14:35:00+01:00",
    },
    {
      id: "draft-unicorn-20260422",
      label: "Register as a unicorn breeder",
      iso: "2026-04-22T11:08:00+01:00",
    },
  ].map((row) => ({
    id: row.id,
    label: row.label,
    hint: formatRunnerSignInLastUpdated(row.iso),
  }));
}

function getRunnerSignInFormsCatalog() {
  return {
    "change-contact-details": {
      formKey: "change-contact-details",
      formName: "Change your contact details",
      steps: [
        {
          id: "name",
          template: "titan-mvp-1.2/runner-sign-in/forms/change-contact-details/name",
          fields: ["fullName"],
        },
        {
          id: "contact",
          template: "titan-mvp-1.2/runner-sign-in/forms/change-contact-details/contact",
          fields: ["email", "phone"],
        },
        {
          id: "preference",
          template: "titan-mvp-1.2/runner-sign-in/forms/change-contact-details/preference",
          fields: ["preferredContactMethod"],
        },
      ],
    },
    "report-local-issue": {
      formKey: "report-local-issue",
      formName: "Report a local issue",
      steps: [
        {
          id: "details",
          template: "titan-mvp-1.2/runner-sign-in/forms/report-local-issue/details",
          fields: ["issueType", "whatHappened"],
        },
        {
          id: "location",
          template: "titan-mvp-1.2/runner-sign-in/forms/report-local-issue/location",
          fields: ["postcodeOrPlace"],
        },
        {
          id: "when",
          template: "titan-mvp-1.2/runner-sign-in/forms/report-local-issue/when",
          fields: ["whenHappened"],
        },
        {
          id: "urgency",
          template: "titan-mvp-1.2/runner-sign-in/forms/report-local-issue/urgency",
          fields: ["urgency"],
        },
      ],
    },
    "request-refund": {
      formKey: "request-refund",
      formName: "Request a refund",
      steps: [
        {
          id: "reference",
          template: "titan-mvp-1.2/runner-sign-in/forms/request-refund/reference",
          fields: ["paymentReference"],
        },
        {
          id: "reason",
          template: "titan-mvp-1.2/runner-sign-in/forms/request-refund/reason",
          fields: ["refundReason"],
        },
        {
          id: "bank-details",
          template: "titan-mvp-1.2/runner-sign-in/forms/request-refund/bank-details",
          fields: ["accountName", "sortCode", "accountNumber"],
        },
      ],
    },
    "apply-small-grant": {
      formKey: "apply-small-grant",
      formName: "Apply for a small grant",
      steps: [
        {
          id: "organisation",
          template: "titan-mvp-1.2/runner-sign-in/forms/apply-small-grant/organisation",
          fields: ["organisationName", "organisationType"],
        },
        {
          id: "amount",
          template: "titan-mvp-1.2/runner-sign-in/forms/apply-small-grant/amount",
          fields: ["amountRequested"],
        },
        {
          id: "summary",
          template: "titan-mvp-1.2/runner-sign-in/forms/apply-small-grant/summary",
          fields: ["projectSummary"],
        },
        {
          id: "declaration",
          template: "titan-mvp-1.2/runner-sign-in/forms/apply-small-grant/declaration",
          fields: ["declarationAccepted"],
        },
      ],
    },
  };
}

function getRunnerSignInFormDef(formKey) {
  const catalog = getRunnerSignInFormsCatalog();
  return catalog[String(formKey || "").trim()];
}

function getRunnerSignInStepDef(formDef, stepId) {
  if (!formDef || !Array.isArray(formDef.steps)) return null;
  return formDef.steps.find((s) => s.id === stepId) || null;
}

function getRunnerSignInNextStepId(formDef, stepId) {
  if (!formDef || !Array.isArray(formDef.steps)) return null;
  const idx = formDef.steps.findIndex((s) => s.id === stepId);
  if (idx < 0) return null;
  const next = formDef.steps[idx + 1];
  return next ? next.id : null;
}

function getRunnerSignInFirstStepId(formDef) {
  if (!formDef || !Array.isArray(formDef.steps) || formDef.steps.length === 0) return null;
  return formDef.steps[0].id;
}

function getRunnerSignInResumeStepId(application) {
  const formDef = getRunnerSignInFormDef(application && application.formKey);
  if (!formDef) return null;
  const first = getRunnerSignInFirstStepId(formDef);
  if (!first) return null;
  const stepId = String(application.step || "").trim();
  if (!stepId) return first;
  return getRunnerSignInStepDef(formDef, stepId) ? stepId : first;
}

function seedRunnerSignInApplicationsPrototype() {
  return [
    {
      id: "app-1721152526403",
      formKey: "change-contact-details",
      formName: "Change your contact details",
      reference: "V25-AWC-M56",
      status: "Draft",
      step: "name",
      answers: {},
      updatedIso: "2026-05-02T10:15:00+01:00",
      expiryIso: "2026-06-02T23:59:00+01:00",
    },
    {
      id: "app-1721152526404",
      formKey: "report-local-issue",
      formName: "Report a local issue",
      reference: "FL3-5H4-L8N",
      status: "Draft",
      step: "when",
      answers: {
        issueType: "Road problem",
        whatHappened: "There’s a large pothole causing cyclists to swerve into traffic.",
        postcodeOrPlace: "SW1A 2AA",
      },
      updatedIso: "2026-05-01T16:40:00+01:00",
      expiryIso: "2026-06-01T23:59:00+01:00",
    },
    {
      id: "app-1721152526405",
      formKey: "request-refund",
      formName: "Request a refund",
      reference: "Q9F-2D7-PXN",
      status: "Draft",
      step: "bank-details",
      answers: {
        paymentReference: "PAY-4839201",
        refundReason: "I paid twice by mistake.",
      },
      updatedIso: "2026-05-03T09:05:00+01:00",
      expiryIso: "2026-06-03T23:59:00+01:00",
    },
    {
      id: "app-1721152526406",
      formKey: "apply-small-grant",
      formName: "Apply for a small grant",
      reference: "K3M-7T2-H6V",
      status: "Submitted",
      answers: {
        organisationName: "Riverside Community Garden",
        organisationType: "Community group",
        amountRequested: "1500",
        projectSummary: "Buy tools and build raised beds for a volunteer-run garden.",
        declarationAccepted: "yes",
      },
      submittedIso: "2026-04-18T09:02:00+01:00",
      expiryIso: "2026-05-18T23:59:00+01:00",
    },
  ];
}

function createRunnerV4StyleReferenceNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  const group = (n) => Array.from({ length: n }, pick).join("");
  return `${group(3)}-${group(3)}-${group(3)}`;
}

function createRunnerSignInMemorableWord() {
  const adjectives = ["golden", "quiet", "brave", "swift", "bright", "gentle", "happy", "calm"];
  const nouns = ["badger", "otter", "robin", "acorn", "meadow", "river", "forest", "orchard"];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(adjectives)} ${pick(nouns)}`;
}

function createRunnerSignInReviewToken() {
  const crypto = require("crypto");
  return `RSI-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

function normalizeRunnerSignInMemorableWord(word) {
  return String(word || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function denormalizeRunnerSignInReferenceNumber(normalized) {
  // Convert e.g. ABC123DEF456 to ABC-123-DEF-456 if possible; otherwise return raw.
  const s = String(normalized || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === 9) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6, 9)}`;
  if (s.length === 12) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6, 9)}-${s.slice(9, 12)}`;
  return normalized;
}

function isRunnerSignInCheckingRequired(formKey) {
  return String(formKey || "").trim() === "apply-small-grant";
}

function ensureRunnerSignInChecking(application) {
  if (!application || typeof application !== "object") return application;
  const required = isRunnerSignInCheckingRequired(application.formKey);
  if (!application.checking || typeof application.checking !== "object") {
    application.checking = {};
  }
  application.checking.required = required;
  if (!required) return application;

  if (!application.checking.status) {
    application.checking.status = application.status === "Submitted" ? "checked" : "not_started";
  }
  return application;
}

function ensureRunnerSignInApplications(req) {
  const data = ensureRunnerSignInSession(req);
  if (!Array.isArray(data.runnerSignInApplications)) {
    data.runnerSignInApplications = seedRunnerSignInApplicationsPrototype();
  }
  for (const app of data.runnerSignInApplications) {
    ensureRunnerSignInChecking(app);
  }
  return data.runnerSignInApplications;
}

function createRunnerSignInExpiryIsoFromNow(days = 28) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 0));
  // 23:59 local-ish isn't necessary for prototype; a date-only ISO is fine
  return d.toISOString();
}

function formatRunnerSignInDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

router.get("/runner-sign-in", function (req, res) {
  const next = sanitizeRunnerSignInNext(req.query.next) || "/runner-v4/declaration";
  return res.redirect(`/runner-sign-in/start-page?next=${encodeURIComponent(next)}`);
});

router.get("/runner-sign-in/start-page", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  data.runnerSignInAuthed = false;
  return res.render("titan-mvp-1.2/runner-sign-in/start-page", {
    next
  });
});

router.get("/runner-sign-in/why-sign-in", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  return res.render("titan-mvp-1.2/runner-sign-in/why-sign-in", {
    next
  });
});

router.get("/runner-sign-in/terms", function (req, res) {
  return res.render("titan-mvp-1.2/runner-sign-in/terms");
});

router.get("/runner-sign-in/privacy", function (req, res) {
  return res.render("titan-mvp-1.2/runner-sign-in/privacy");
});

router.get("/runner-sign-in/security", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  return res.render("titan-mvp-1.2/runner-sign-in/security", { data });
});

router.get("/runner-sign-in/what-do-you-want-to-do", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) {
    const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
    data.runnerSignInNext = next;
    return res.redirect(`/runner-sign-in/start?next=${encodeURIComponent(next)}`);
  }
  // This journey now lands on applications management
  return res.redirect("/runner-sign-in/applications");
  const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  const savedDrafts = getRunnerSignInSavedDraftsPrototype();
  const savedDraftRadioItems = savedDrafts.map((d) => ({
    value: d.id,
    text: d.label,
    hint: { text: d.hint },
    checked: data.runnerSignInSavedDraftId === d.id,
  }));
  const err = data.runnerSignInError;
  const errorSummaryList = [];
  if (err && err.runnerSignInIntent) {
    errorSummaryList.push({ text: err.runnerSignInIntent, href: "#runner-sign-in-intent" });
  }
  if (err && err.runnerSignInSavedDraftId) {
    errorSummaryList.push({ text: err.runnerSignInSavedDraftId, href: "#runner-sign-in-saved-draft" });
  }
  return res.render("titan-mvp-1.2/runner-sign-in/what-do-you-want-to-do", {
    data,
    error: data.runnerSignInError,
    errorSummaryList,
    savedDraftRadioItems,
    next
  });
});

router.post("/runner-sign-in/what-do-you-want-to-do", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) {
    const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
    return res.redirect(`/runner-sign-in/start?next=${encodeURIComponent(next)}`);
  }
  const choice = String(req.body.runnerSignInIntent || "").trim();

  if (choice !== "new" && choice !== "resume") {
    data.runnerSignInError = {
      runnerSignInIntent: "Select what you want to do"
    };
    return res.redirect("/runner-sign-in/what-do-you-want-to-do");
  }

  data.runnerSignInIntent = choice;

  if (choice === "resume") {
    const validIds = new Set(getRunnerSignInSavedDraftsPrototype().map((d) => d.id));
    const draftId = String(req.body.runnerSignInSavedDraftId || "").trim();
    if (!validIds.has(draftId)) {
      data.runnerSignInError = {
        runnerSignInSavedDraftId: "Select a saved form"
      };
      return res.redirect("/runner-sign-in/what-do-you-want-to-do");
    }
    delete data.runnerSignInError;
    data.runnerSignInSavedDraftId = draftId;
  } else {
    delete data.runnerSignInSavedDraftId;
    delete data.runnerSignInError;
  }

  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  return res.redirect(next);
});

router.get("/runner-sign-in/start", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  data.runnerSignInAuthed = false;
  return res.redirect(`/runner-sign-in/choose-method?next=${encodeURIComponent(next)}`);
});

router.post("/runner-sign-in/start", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(req.body.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  data.runnerSignInAuthed = false;
  return res.redirect(`/runner-sign-in/choose-method?next=${encodeURIComponent(next)}`);
});

router.get("/runner-sign-in/choose-method", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(req.query.next) || data.runnerSignInNext || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  return res.render("titan-mvp-1.2/runner-sign-in/choose-method", {
    data,
    error: data.runnerSignInError
  });
});

router.post("/runner-sign-in/choose-method", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const email = String(req.body.runnerSignInEmail || "").trim();
  const confirmEmail = String(req.body.runnerSignInConfirmEmail || "").trim();

  if (!email) {
    data.runnerSignInError = { runnerSignInEmail: "Enter your email address" };
    return res.redirect("/runner-sign-in/choose-method");
  }

  if (!confirmEmail) {
    data.runnerSignInError = { runnerSignInConfirmEmail: "Confirm your email address" };
    return res.redirect("/runner-sign-in/choose-method");
  }

  if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
    data.runnerSignInError = { runnerSignInConfirmEmail: "Email addresses must match" };
    return res.redirect("/runner-sign-in/choose-method");
  }

  delete data.runnerSignInError;
  data.runnerSignInEmail = email;
  data.runnerSignInAuthed = false;
  return res.redirect("/runner-sign-in/security-code-method");
});

router.get("/runner-sign-in/security-code-method", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  if (!data.runnerSignInEmail) return res.redirect("/runner-sign-in/choose-method");
  return res.render("titan-mvp-1.2/runner-sign-in/security-code-method", {
    data,
    error: data.runnerSignInError,
  });
});

router.post("/runner-sign-in/security-code-method", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInEmail) return res.redirect("/runner-sign-in/choose-method");

  const choice = String(req.body.runnerSignInSecurityCodeMethod || "").trim();
  if (choice !== "sms" && choice !== "email") {
    data.runnerSignInError = { runnerSignInSecurityCodeMethod: "Select how you want to get a security code" };
    return res.redirect("/runner-sign-in/security-code-method");
  }

  delete data.runnerSignInError;
  data.runnerSignInMethod = choice;
  data.runnerSignInAuthed = false;
  return res.redirect(choice === "sms" ? "/runner-sign-in/phone" : "/runner-sign-in/check");
});

router.get("/runner-sign-in/not-sure", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  return res.render("titan-mvp-1.2/runner-sign-in/not-sure", { data });
});

router.get("/runner-sign-in/email", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  return res.render("titan-mvp-1.2/runner-sign-in/enter-email", {
    data,
    error: data.runnerSignInError
  });
});

router.post("/runner-sign-in/email", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const email = String(req.body.runnerSignInEmail || "").trim();

  if (!email) {
    data.runnerSignInError = { runnerSignInEmail: "Enter your email address" };
    return res.redirect("/runner-sign-in/email");
  }

  delete data.runnerSignInError;
  data.runnerSignInMethod = "email";
  data.runnerSignInEmail = email;
  data.runnerSignInAuthed = false;
  return res.redirect("/runner-sign-in/check");
});

router.get("/runner-sign-in/phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  return res.render("titan-mvp-1.2/runner-sign-in/enter-phone", {
    data,
    error: data.runnerSignInError
  });
});

router.post("/runner-sign-in/phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const phone = String(req.body.runnerSignInPhone || "").trim();

  if (!phone) {
    data.runnerSignInError = { runnerSignInPhone: "Enter your mobile phone number" };
    return res.redirect("/runner-sign-in/phone");
  }

  delete data.runnerSignInError;
  data.runnerSignInMethod = "sms";
  data.runnerSignInPhone = phone;
  data.runnerSignInAuthed = false;
  return res.redirect("/runner-sign-in/check");
});

router.get("/runner-sign-in/check", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const method = data.runnerSignInMethod;
  if (method !== "email" && method !== "sms") {
    return res.redirect("/runner-sign-in/choose-method");
  }

  const resend = req.query.resend === "1" || req.query.resend === "true";
  let phoneEnding = null;
  if (method === "sms") {
    const raw = String(data.runnerSignInPhone || "");
    const digitsOnly = raw.replace(/\D+/g, "");
    phoneEnding = digitsOnly.slice(-4) || null;
  }
  return res.render("titan-mvp-1.2/runner-sign-in/check", {
    data,
    resend,
    phoneEnding
  });
});

router.post("/runner-sign-in/check", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const method = data.runnerSignInMethod;
  if (method !== "email" && method !== "sms") {
    return res.redirect("/runner-sign-in/choose-method");
  }

  const code = String(req.body.runnerSignInCode || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) {
    data.runnerSignInError = { runnerSignInCode: "Enter the 6 digit security code" };
    return res.redirect("/runner-sign-in/check");
  }

  delete data.runnerSignInError;
  data.runnerSignInCode = code;
  data.runnerSignInAuthed = true;

  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  if (method === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }
  data.runnerSignInNext = next;
  return res.redirect("/runner-sign-in/applications");
});

router.get("/runner-sign-in/enter-code", function (req, res) {
  // Backwards compatibility: old URL now handled by /runner-sign-in/check
  return res.redirect("/runner-sign-in/check");
});

router.post("/runner-sign-in/enter-code", function (req, res) {
  return res.redirect("/runner-sign-in/check");
});

router.get("/runner-sign-in/confirm-phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  if (data.runnerSignInPhoneConfirmed) {
    const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
    return res.redirect(`/runner-sign-in/what-do-you-want-to-do?next=${encodeURIComponent(next)}`);
  }
  return res.render("titan-mvp-1.2/runner-sign-in/confirm-phone", {
    data,
    error: data.runnerSignInError,
  });
});

router.post("/runner-sign-in/confirm-phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  const phone = String(req.body.runnerSignInConfirmPhoneNumber || "").trim();

  if (!phone) {
    data.runnerSignInError = { runnerSignInConfirmPhoneNumber: "Enter your mobile phone number" };
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  delete data.runnerSignInError;
  data.runnerSignInConfirmPhoneNumber = phone;
  data.runnerSignInPhoneConfirmed = false;
  return res.redirect("/runner-sign-in/check-phone");
});

router.get("/runner-sign-in/check-phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  if (!data.runnerSignInConfirmPhoneNumber) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }
  const resend = req.query.resend === "1" || req.query.resend === "true";
  return res.render("titan-mvp-1.2/runner-sign-in/check-phone", {
    data,
    resend,
    error: data.runnerSignInError,
  });
});

router.post("/runner-sign-in/check-phone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  if (!data.runnerSignInConfirmPhoneNumber) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const raw = String(req.body.runnerSignInPhoneSecurityCode || "");
  const cleaned = raw.replace(/[\s\-–—]+/g, "");

  if (/[^0-9]/.test(cleaned)) {
    data.runnerSignInError = { runnerSignInPhoneSecurityCode: "The code must be 5 numbers" };
    return res.redirect("/runner-sign-in/check-phone");
  }
  if (cleaned.length < 5) {
    data.runnerSignInError = {
      runnerSignInPhoneSecurityCode: "You’ve not entered enough numbers, the code must be 5 numbers",
    };
    return res.redirect("/runner-sign-in/check-phone");
  }
  if (cleaned.length > 5) {
    data.runnerSignInError = {
      runnerSignInPhoneSecurityCode: "You’ve entered too many numbers, the code must be 5 numbers",
    };
    return res.redirect("/runner-sign-in/check-phone");
  }

  delete data.runnerSignInError;
  data.runnerSignInPhoneSecurityCode = cleaned;
  data.runnerSignInPhoneConfirmed = true;

  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  data.runnerSignInNext = next;
  return res.redirect("/runner-sign-in/applications");
});

router.get("/runner-sign-in/request-new-phone-code", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  return res.render("titan-mvp-1.2/runner-sign-in/request-new-phone-code", {
    data,
  });
});

router.post("/runner-sign-in/request-new-phone-code", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed || data.runnerSignInMethod !== "email") {
    return res.redirect("/runner-sign-in/choose-method");
  }
  return res.redirect("/runner-sign-in/check-phone?resend=1");
});

router.get("/runner-sign-in/applications", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  // Email journeys require phone confirmation
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const cloned = req.query.cloned === "1" || req.query.cloned === "true";
  const submitted = req.query.submitted === "1" || req.query.submitted === "true";
  const deleted = req.query.deleted === "1" || req.query.deleted === "true";

  const applicationsForView = applications.map((a) => {
    if (a.status === "Submitted") return { ...a, displayStatus: "Submitted" };
    if (a.checking && a.checking.required) {
      const checkingStatus = String(a.checking.status || "not_started");
      if (checkingStatus === "awaiting_check") return { ...a, displayStatus: "Awaiting check" };
      if (checkingStatus === "checked") return { ...a, displayStatus: "Checked" };
    }
    const hasAnswers = a.answers && typeof a.answers === "object" && Object.keys(a.answers).length > 0;
    return { ...a, displayStatus: hasAnswers ? "In progress" : "Not yet started" };
  });

  return res.render("titan-mvp-1.2/runner-sign-in/applications", {
    data,
    applications: applicationsForView,
    cloned,
    submitted,
    deleted,
    formatDate: formatRunnerSignInDate,
  });
});

router.get("/runner-sign-in/choose-form", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) {
    return res.redirect(`/runner-sign-in/choose-method?next=${encodeURIComponent("/runner-sign-in/choose-form")}`);
  }
  // Email journeys require phone confirmation
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect(`/runner-sign-in/confirm-phone?next=${encodeURIComponent("/runner-sign-in/choose-form")}`);
  }

  return res.render("titan-mvp-1.2/runner-sign-in/start", {
    data,
  });
});

router.post("/runner-sign-in/applications/new", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) {
    return res.redirect(`/runner-sign-in/choose-method?next=${encodeURIComponent("/runner-sign-in/choose-form")}`);
  }
  // Email journeys require phone confirmation
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect(`/runner-sign-in/confirm-phone?next=${encodeURIComponent("/runner-sign-in/choose-form")}`);
  }

  const formKey = String(req.body.formKey || "").trim();
  const formDef = getRunnerSignInFormDef(formKey);
  if (!formDef) return res.redirect("/runner-sign-in/choose-form");

  const applications = ensureRunnerSignInApplications(req);
  const ts = Date.now();
  const firstStepId = getRunnerSignInFirstStepId(formDef);
  if (!firstStepId) return res.redirect("/runner-sign-in/choose-form");

  const application = {
    id: `app-${ts}`,
    formKey: formDef.formKey,
    formName: formDef.formName,
    reference: createRunnerV4StyleReferenceNumber(),
    status: "Draft",
    step: firstStepId,
    answers: {},
    updatedIso: new Date().toISOString(),
    expiryIso: createRunnerSignInExpiryIsoFromNow(28),
  };

  ensureRunnerSignInChecking(application);

  applications.unshift(application);
  data.runnerSignInApplications = applications;

  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(formDef.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(firstStepId)}`);
});

router.get("/runner-sign-in/applications/:id", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  if (application.status !== "Submitted") {
    ensureRunnerSignInChecking(application);
    if (application.checking && application.checking.required && application.checking.status === "awaiting_check") {
      return res.redirect(
        `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking`
      );
    }
    const resumeStepId = getRunnerSignInResumeStepId(application);
    if (!resumeStepId) return res.redirect("/runner-sign-in/applications");
    return res.redirect(
      `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(resumeStepId)}`
    );
  }

  return res.render("titan-mvp-1.2/runner-sign-in/application", {
    data,
    application,
    formatDate: formatRunnerSignInDate,
  });
});

router.get("/runner-sign-in/forms/:formKey/:id/check-answers", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required && application.checking.reviewToken) {
    const reviewStore = ensureReviewStore(req);
    const entry = reviewStore.get(application.checking.reviewToken);
    if (entry && entry.expires > Date.now() && entry.reviewDeclarationComplete) {
      application.checking.status = "checked";
      application.checking.checkedAtIso = entry.reviewedAtIso || new Date().toISOString();
      application.checking.checkedBy = entry.checkedBy || "Checker";
    }
  }

  return res.render("titan-mvp-1.2/runner-sign-in/forms/check-answers", {
    data,
    application,
    formDef,
  });
});

router.post("/runner-sign-in/forms/:formKey/:id/submit", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required) {
    const status = String(application.checking.status || "not_started");
    if (status !== "checked") {
      return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking`);
    }
  }

  application.status = "Submitted";
  application.submittedIso = new Date().toISOString();
  application.updatedIso = new Date().toISOString();
  application.step = undefined;

  return res.redirect("/runner-sign-in/applications?submitted=1");
});

router.post("/runner-sign-in/forms/:formKey/:id/send-for-checking", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (!application.checking || !application.checking.required) {
    return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/check-answers`);
  }

  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking`);
});

router.get("/runner-sign-in/forms/:formKey/:id/send-for-checking", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (!application.checking || !application.checking.required) {
    return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/check-answers`);
  }

  // Ensure token + details exist once checking is started
  if (!application.checking.reviewToken) {
    application.checking.reviewToken = createRunnerSignInReviewToken();
  }
  if (!application.checking.referenceNumber) {
    application.checking.referenceNumber = createRunnerV4StyleReferenceNumber();
  }
  if (!application.checking.memorableWord) {
    application.checking.memorableWord = createRunnerSignInMemorableWord();
  }

  const reviewStore = ensureReviewStore(req);
  const existingEntry = reviewStore.get(application.checking.reviewToken);
  if (existingEntry && existingEntry.expires > Date.now() && existingEntry.reviewDeclarationComplete) {
    application.checking.status = "checked";
    application.checking.checkedAtIso = existingEntry.reviewedAtIso || new Date().toISOString();
    application.checking.checkedBy = existingEntry.checkedBy || "Checker";
  }

  const inviteAlreadySent =
    application.checking &&
    application.checking.status === "awaiting_check" &&
    Boolean(application.checking.inviteEmail || application.checking.invitePhone);

  const inviteSent = inviteAlreadySent || (req.query.inviteSent === "1");
  const inviteChanged = req.query.inviteChanged === "1";
  const inviteResent = req.query.inviteResent === "1";
  const inviteThrottled = req.query.inviteThrottled === "1";

  const RESEND_COOLDOWN_SECONDS = 30;
  const inviteSentAtIso = application.checking.invitedAtIso || null;
  let inviteSentAtText = null;
  let inviteCooldownRemainingSeconds = 0;
  if (inviteSentAtIso) {
    const d = new Date(inviteSentAtIso);
    if (!Number.isNaN(d.getTime())) {
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const rawHours = d.getHours();
      const ampm = rawHours >= 12 ? "pm" : "am";
      const hours12 = rawHours % 12 || 12;
      const time = `${hours12}:${minutes}${ampm}`;
      const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      inviteSentAtText = `Sent at ${time} on ${date}`;

      const remainingMs =
        (RESEND_COOLDOWN_SECONDS * 1000) - (Date.now() - d.getTime());
      if (remainingMs > 0) {
        inviteCooldownRemainingSeconds = Math.ceil(remainingMs / 1000);
      }
    }
  }

  const shareCheckPath = `/runner-sign-in/check/${encodeURIComponent(application.checking.reviewToken)}`;
  const shareCheckUrl = `${PUBLIC_BASE_URL}${shareCheckPath}`;

  return res.render("titan-mvp-1.2/runner-sign-in/forms/send-for-checking", {
    data,
    application,
    formDef,
    shareCheckUrl,
    inviteSent,
    inviteChanged,
    inviteResent,
    inviteThrottled,
    inviteSentAtText,
    inviteCooldownRemainingSeconds,
    inviteCooldownSeconds: RESEND_COOLDOWN_SECONDS,
  });
});

router.post("/runner-sign-in/forms/:formKey/:id/send-for-checking/contact-details", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (!application.checking || !application.checking.required) {
    return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/check-answers`);
  }

  if (!application.checking.reviewToken) application.checking.reviewToken = createRunnerSignInReviewToken();
  if (!application.checking.referenceNumber) application.checking.referenceNumber = createRunnerV4StyleReferenceNumber();
  if (!application.checking.memorableWord) application.checking.memorableWord = createRunnerSignInMemorableWord();

  const contactMethod = String((req.body && req.body.contact) || "email").trim();
  const email = String((req.body && req.body.contactByEmail) || "").trim();
  const emailConfirm = String((req.body && req.body.contactByEmailConfirm) || "").trim();
  const phone = String((req.body && req.body.contactByPhone) || "").trim();

  if (contactMethod === "text-message" || contactMethod === "text" || contactMethod === "phone") {
    application.checking.inviteContactMethod = "text-message";
    application.checking.invitePhone = phone;
    delete application.checking.inviteEmail;
  } else {
    if (!email || !emailConfirm || email.toLowerCase() !== emailConfirm.toLowerCase()) {
      return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking?inviteChanged=1`);
    }
    application.checking.inviteContactMethod = "email";
    application.checking.inviteEmail = email;
    delete application.checking.invitePhone;
  }

  application.checking.invitedAtIso = new Date().toISOString();
  application.checking.status = "awaiting_check";

  const reviewStore = ensureReviewStore(req);
  reviewStore.set(application.checking.reviewToken, {
    applicationId: application.id,
    referenceNumber: normalizeRunnerV5ReferenceNumber(application.checking.referenceNumber),
    memorableWord: normalizeRunnerSignInMemorableWord(application.checking.memorableWord),
    formKey: application.formKey,
    formName: application.formName,
    dataSnapshot: { ...application.answers },
    reviewDeclarationComplete: false,
    reviewedAtIso: null,
    expires: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  });

  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking?inviteSent=1`);
});

router.post("/runner-sign-in/forms/:formKey/:id/send-for-checking/resend", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (!application.checking || !application.checking.required) {
    return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/check-answers`);
  }

  const RESEND_COOLDOWN_SECONDS = 30;
  const lastSentIso = application.checking.invitedAtIso;
  if (lastSentIso) {
    const d = new Date(lastSentIso);
    if (!Number.isNaN(d.getTime())) {
      const remainingMs =
        (RESEND_COOLDOWN_SECONDS * 1000) - (Date.now() - d.getTime());
      if (remainingMs > 0) {
        return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking?inviteSent=1&inviteThrottled=1`);
      }
    }
  }

  application.checking.invitedAtIso = new Date().toISOString();
  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking?inviteSent=1&inviteResent=1`);
});

router.post("/runner-sign-in/forms/:formKey/:id/send-for-checking/change", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (application.checking) {
    delete application.checking.inviteEmail;
    delete application.checking.invitePhone;
    delete application.checking.inviteContactMethod;
  }
  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking?inviteChanged=1`);
});

router.post("/runner-sign-in/forms/:formKey/:id/send-for-checking/return-for-changes", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required) {
    application.checking.status = "not_started";
    delete application.checking.checkedAtIso;
    delete application.checking.checkedBy;
  }

  const resumeStepId = getRunnerSignInResumeStepId(application);
  if (!resumeStepId) return res.redirect("/runner-sign-in/applications");
  return res.redirect(
    `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(resumeStepId)}`
  );
});

router.get("/runner-sign-in/check/:token", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  // If the applicant is signed in, they should not be able to act as the checker
  // in the same browser session.
  if (data.runnerSignInAuthed) {
    return res.render("titan-mvp-1.2/runner-sign-in/check/applicant-blocked", {
      data,
      signOutLink: "/titan-mvp-1.2/roles/sign-out",
    });
  }
  const token = String(req.params.token || "").trim();
  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(entry && entry.expires > Date.now());

  const grantedMap = (data.runnerSignInCheckerGrantedTokens && typeof data.runnerSignInCheckerGrantedTokens === "object")
    ? data.runnerSignInCheckerGrantedTokens
    : {};
  const hasAccess = Boolean(token && grantedMap[token]);

  return res.render("titan-mvp-1.2/runner-sign-in/check/access", {
    data,
    token,
    tokenValid,
    hasAccess,
    entry,
  });
});

router.post("/runner-sign-in/check/:token/access", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (data.runnerSignInAuthed) {
    return res.render("titan-mvp-1.2/runner-sign-in/check/applicant-blocked", {
      data,
      signOutLink: "/titan-mvp-1.2/roles/sign-out",
    });
  }
  const token = String(req.params.token || "").trim();
  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(entry && entry.expires > Date.now());

  if (!tokenValid) {
    return res.render("titan-mvp-1.2/runner-sign-in/check/access", {
      data,
      token,
      tokenValid: false,
      hasAccess: false,
      entry: null,
    });
  }

  const enteredRef = String((req.body && req.body.reviewerReferenceNumber) || "");
  const enteredWord = String((req.body && req.body.reviewerMemorableWord) || "");
  const normalizedRef = normalizeRunnerV5ReferenceNumber(enteredRef);
  const normalizedWord = normalizeRunnerSignInMemorableWord(enteredWord);

  const ok =
    normalizedRef &&
    normalizedWord &&
    normalizedRef === entry.referenceNumber &&
    normalizedWord === entry.memorableWord;

  if (!ok) {
    return res.render("titan-mvp-1.2/runner-sign-in/check/access", {
      data,
      token,
      tokenValid: true,
      hasAccess: false,
      entry,
      reviewAccessError: "Check the reference number and memorable word",
      enteredReferenceNumber: enteredRef,
      enteredMemorableWord: enteredWord,
    });
  }

  if (!data.runnerSignInCheckerGrantedTokens || typeof data.runnerSignInCheckerGrantedTokens !== "object") {
    data.runnerSignInCheckerGrantedTokens = {};
  }
  data.runnerSignInCheckerGrantedTokens[token] = true;

  return res.redirect(`/runner-sign-in/check/${encodeURIComponent(token)}`);
});

router.post("/runner-sign-in/check/:token/confirm", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (data.runnerSignInAuthed) {
    return res.render("titan-mvp-1.2/runner-sign-in/check/applicant-blocked", {
      data,
      signOutLink: "/titan-mvp-1.2/roles/sign-out",
    });
  }
  const token = String(req.params.token || "").trim();
  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(entry && entry.expires > Date.now());
  const granted = Boolean(
    data.runnerSignInCheckerGrantedTokens &&
      typeof data.runnerSignInCheckerGrantedTokens === "object" &&
      data.runnerSignInCheckerGrantedTokens[token]
  );

  if (!tokenValid || !granted) {
    return res.redirect(`/runner-sign-in/check/${encodeURIComponent(token)}`);
  }

  const declaration = req.body && req.body.declaration;
  if (!declaration || String(declaration).trim() !== "confirmed") {
    return res.render("titan-mvp-1.2/runner-sign-in/check/access", {
      data,
      token,
      tokenValid: true,
      hasAccess: true,
      entry,
      error: { declarationError: "You must confirm the declaration to complete the check" },
    });
  }

  entry.reviewDeclarationComplete = true;
  entry.reviewedAtIso = new Date().toISOString();
  entry.checkedBy = "Checker";
  reviewStore.set(token, entry);

  return res.redirect(`/runner-sign-in/check/${encodeURIComponent(token)}/complete`);
});

router.get("/runner-sign-in/check/:token/complete", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  const token = String(req.params.token || "").trim();
  return res.render("titan-mvp-1.2/runner-sign-in/check/complete", {
    data,
    token,
  });
});

router.get("/runner-sign-in/checker-invite-notification", function (req, res) {
  const token = String((req.query && req.query.token) || "").trim();
  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(entry && entry.expires > Date.now());

  const checkUrl = tokenValid ? `${PUBLIC_BASE_URL}/runner-sign-in/check/${encodeURIComponent(token)}` : "";

  return res.render("titan-mvp-1.2/runner-sign-in/emails/checker-invite", {
    tokenValid,
    checkUrl,
    formName: (entry && entry.formName) || "Apply for a small grant",
    referenceNumber: tokenValid ? denormalizeRunnerSignInReferenceNumber(entry.referenceNumber) : "",
    memorableWord: tokenValid ? entry.memorableWord : "",
  });
});

router.get("/runner-sign-in/applicant-ready-to-submit-notification", function (req, res) {
  const token = String((req.query && req.query.token) || "").trim();
  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(entry && entry.expires > Date.now());

  return res.render("titan-mvp-1.2/runner-sign-in/emails/applicant-ready-to-submit", {
    tokenValid,
    formName: (entry && entry.formName) || "Apply for a small grant",
    checkedOnText: (entry && entry.reviewedAtIso) ? formatRunnerSignInDate(entry.reviewedAtIso) : "",
  });
});

router.get("/runner-sign-in/forms/:formKey/:id/:step", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required && application.checking.status === "awaiting_check") {
    return res.redirect(
      `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking`
    );
  }

  const stepDef = getRunnerSignInStepDef(formDef, req.params.step);
  if (!stepDef) {
    const resumeStepId = getRunnerSignInResumeStepId(application);
    return res.redirect(
      `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(resumeStepId)}`
    );
  }

  application.step = stepDef.id;

  return res.render(stepDef.template, {
    data,
    application,
    formDef,
    stepDef,
    backHref: "/runner-sign-in/applications",
  });
});

router.post("/runner-sign-in/forms/:formKey/:id/:step", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect(`/runner-sign-in/applications/${encodeURIComponent(application.id)}`);

  const formDef = getRunnerSignInFormDef(req.params.formKey);
  if (!formDef || formDef.formKey !== application.formKey) return res.redirect("/runner-sign-in/applications");

  const stepDef = getRunnerSignInStepDef(formDef, req.params.step);
  if (!stepDef) return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(getRunnerSignInResumeStepId(application))}`);

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required && application.checking.status === "awaiting_check") {
    return res.redirect(
      `/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/send-for-checking`
    );
  }

  if (!application.answers || typeof application.answers !== "object") application.answers = {};
  for (const field of stepDef.fields || []) {
    application.answers[field] = String(req.body[field] ?? "").trim();
  }

  ensureRunnerSignInChecking(application);
  if (application.checking && application.checking.required) {
    const status = String(application.checking.status || "not_started");
    if (status === "awaiting_check" || status === "checked") {
      application.checking.status = "not_started";
      delete application.checking.checkedAtIso;
      delete application.checking.checkedBy;
      // Keep the existing token/details so the user can resend quickly, but any previous check is no longer valid.
      if (application.checking.reviewToken) {
        const reviewStore = ensureReviewStore(req);
        const entry = reviewStore.get(application.checking.reviewToken);
        if (entry && entry.expires > Date.now()) {
          entry.reviewDeclarationComplete = false;
          entry.reviewedAtIso = null;
          entry.checkedBy = null;
          entry.dataSnapshot = { ...application.answers };
          reviewStore.set(application.checking.reviewToken, entry);
        }
      }
    }
  }

  application.updatedIso = new Date().toISOString();
  application.step = stepDef.id;

  const action = String(req.body.action || "").trim();
  if (action === "save") {
    return res.redirect("/runner-sign-in/applications");
  }

  const nextStepId = getRunnerSignInNextStepId(formDef, stepDef.id);
  if (!nextStepId) {
    return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/check-answers`);
  }

  application.step = nextStepId;
  return res.redirect(`/runner-sign-in/forms/${encodeURIComponent(application.formKey)}/${encodeURIComponent(application.id)}/${encodeURIComponent(nextStepId)}`);
});

router.get("/runner-sign-in/applications/:id/clone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");

  return res.render("titan-mvp-1.2/runner-sign-in/clone-application", {
    data,
    application,
    formatDate: formatRunnerSignInDate,
  });
});

router.get("/runner-sign-in/applications/:id/delete", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const applications = ensureRunnerSignInApplications(req);
  const application = applications.find((a) => a.id === req.params.id);
  if (!application) return res.redirect("/runner-sign-in/applications");
  if (application.status === "Submitted") return res.redirect("/runner-sign-in/applications");

  return res.render("titan-mvp-1.2/runner-sign-in/delete-application", {
    data,
    application,
  });
});

router.post("/runner-sign-in/applications/:id/delete", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const choice = String(req.body.deleteApplication || "").trim();
  if (choice !== "yes") return res.redirect("/runner-sign-in/applications");

  const applications = ensureRunnerSignInApplications(req);
  const idx = applications.findIndex((a) => a.id === req.params.id);
  if (idx < 0) return res.redirect("/runner-sign-in/applications");
  if (applications[idx].status === "Submitted") return res.redirect("/runner-sign-in/applications");

  applications.splice(idx, 1);
  data.runnerSignInApplications = applications;

  return res.redirect("/runner-sign-in/applications?deleted=1");
});

router.post("/runner-sign-in/applications/:id/clone", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  const choice = String(req.body.cloneApplication || "").trim();
  if (choice !== "yes") {
    return res.redirect("/runner-sign-in/applications");
  }

  const applications = ensureRunnerSignInApplications(req);
  const source = applications.find((a) => a.id === req.params.id);
  if (!source) return res.redirect("/runner-sign-in/applications");

  const ts = Date.now();
  const formDef = getRunnerSignInFormDef(source.formKey);
  const firstStepId = getRunnerSignInFirstStepId(formDef);
  const answersCopy =
    source.answers && typeof source.answers === "object" ? JSON.parse(JSON.stringify(source.answers)) : {};
  const cloned = {
    ...source,
    id: `app-${ts}`,
    reference: createRunnerV4StyleReferenceNumber(),
    status: "Draft",
    step: firstStepId || undefined,
    answers: answersCopy,
    updatedIso: new Date().toISOString(),
    submittedIso: undefined,
    expiryIso: createRunnerSignInExpiryIsoFromNow(28),
  };

  applications.unshift(cloned);
  data.runnerSignInApplications = applications;

  if (cloned.formKey && cloned.step) {
    return res.redirect(
      `/runner-sign-in/forms/${encodeURIComponent(cloned.formKey)}/${encodeURIComponent(cloned.id)}/${encodeURIComponent(cloned.step)}?copied=1`
    );
  }

  return res.redirect("/runner-sign-in/applications?cloned=1");
});

router.get("/runner-sign-in/complete", function (req, res) {
  // Backwards compatibility: this page is no longer used
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  return res.redirect(`/runner-sign-in/what-do-you-want-to-do?next=${encodeURIComponent(next)}`);
});

router.get("/runner-sign-in/check-answers-copied", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  // Email journeys require phone confirmation
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }

  return res.render("titan-mvp-1.2/runner-sign-in/check-answers-copied", { data });
});

router.post("/runner-sign-in/check-answers-copied", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }
  return res.redirect("/runner-sign-in/intervention-copied");
});

router.get("/runner-sign-in/intervention-copied", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }
  return res.render("titan-mvp-1.2/runner-sign-in/intervention-copied", { data });
});

router.post("/runner-sign-in/intervention-copied", function (req, res) {
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  if (data.runnerSignInMethod === "email" && !data.runnerSignInPhoneConfirmed) {
    return res.redirect("/runner-sign-in/confirm-phone");
  }
  // Prototype placeholder: continue to the main "Your forms" list.
  return res.redirect("/runner-sign-in/applications");
});

router.post("/runner-sign-in/complete", function (req, res) {
  // Backwards compatibility: this page is no longer used
  const data = ensureRunnerSignInSession(req);
  if (!data.runnerSignInAuthed) return res.redirect("/runner-sign-in/choose-method");
  const next = sanitizeRunnerSignInNext(data.runnerSignInNext) || "/runner-v4/declaration";
  return res.redirect(`/runner-sign-in/what-do-you-want-to-do?next=${encodeURIComponent(next)}`);
});

// ── Runner v4 ───────────────────────────────────────────────────────────────

router.get("/runner-v4", function (req, res) {
  return res.redirect("/runner-v4/start");
});

router.get("/runner-v4/", function (req, res) {
  return res.redirect("/runner-v4/start");
});

router.get("/runner-v4/start", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/start-v4");
});

// ── Runner v5: save and resubmit (reuse previous answers) ────────────────────
router.get("/runner-v5", function (req, res) {
  return res.redirect("/runner-v5/start");
});

router.get("/runner-v5/", function (req, res) {
  return res.redirect("/runner-v5/start");
});

router.get("/runner-v5/start", function (req, res) {
  return res.render("titan-mvp-1.2/runner-v5/start-v5");
});

router.get("/runner-v5/admin/set-form-version", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const v = Number(req.query.version);
  if (v && Number.isFinite(v)) {
    req.session.data.runnerV5CurrentFormVersion = v;
  }
  return res.redirect("/runner-v5/start");
});

router.get("/runner-v5/admin/clear-submissions", function (req, res) {
  const store = ensureRunnerV5SubmissionStore(req);
  store.length = 0;
  if (req.session.data) {
    delete req.session.data.runnerV5LastSubmittedReferenceNumber;
    delete req.session.data.runnerV5LastSubmittedEmail;
    delete req.session.data.runnerV5LastSubmittedOn;
  }
  return res.redirect("/runner-v5/start");
});

router.get("/runner-v5/start-choice", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/start", {
    data: req.session.data,
    error: req.session.data.runnerV5Error
  });
});

router.post("/runner-v5/start-choice", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { usePreviousSubmission } = req.body;

  if (!usePreviousSubmission) {
    req.session.data.runnerV5Error = {
      usePreviousSubmission: "Select whether you want to use answers from a previous submission"
    };
    return res.redirect("/runner-v5/start-choice");
  }

  delete req.session.data.runnerV5Error;
  req.session.data.runnerV5UsePreviousSubmission = usePreviousSubmission === "yes";

  if (req.session.data.runnerV5UsePreviousSubmission) {
    return res.redirect("/runner-v5/authenticate");
  }

  return res.redirect("/runner-v5/declaration");
});

router.get("/runner-v5/declaration", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/declaration", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/declaration", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { declaration } = req.body;
  // For research convenience, allow all v5 questions to be skipped.
  req.session.data.declaration = declaration;
  delete req.session.data.error;
  return res.redirect("/runner-v5/whats-your-name");
});

router.get("/runner-v5/authenticate", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/authenticate", {
    data: req.session.data,
    error: req.session.data.runnerV5Error
  });
});

router.post("/runner-v5/authenticate", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { previousSubmissionEmail, previousSubmissionReferenceNumber } = req.body;

  const nextError = {};
  if (
    !previousSubmissionReferenceNumber ||
    previousSubmissionReferenceNumber.trim() === ""
  ) {
    nextError.previousSubmissionReferenceNumber =
      "Enter your reference number";
  }

  if (Object.keys(nextError).length > 0) {
    req.session.data.runnerV5Error = nextError;
    return res.redirect("/runner-v5/authenticate");
  }

  delete req.session.data.runnerV5Error;

  const saved = findRunnerV5Submission(
    req,
    previousSubmissionEmail,
    previousSubmissionReferenceNumber
  );

  if (!saved) {
    req.session.data.runnerV5Error = {
      previousSubmissionReferenceNumber: "Enter a valid reference number"
    };
    req.session.data.runnerV5PreviousSubmissionEmail = previousSubmissionEmail;
    req.session.data.runnerV5PreviousSubmissionReferenceNumber = previousSubmissionReferenceNumber;
    return res.redirect("/runner-v5/authenticate");
  }

  req.session.data.runnerV5UsePreviousSubmission = true;
  req.session.data.runnerV5AuthedPreviousSubmission = true;
  req.session.data.runnerV5PreviousSubmissionEmail = previousSubmissionEmail;
  req.session.data.runnerV5PreviousSubmissionReferenceNumber = previousSubmissionReferenceNumber;
  req.session.data.runnerV5PreviousFormName = saved.formName;
  req.session.data.runnerV5PreviousSubmittedOn = saved.submittedOn;

  // Load previous answers into the new form (earlier submission unchanged).
  const a = saved.answers || {};
  req.session.data.name = a.name;
  req.session.data.email = a.email;
  req.session.data.phoneNumber = a.phoneNumber;
  req.session.data.selectedAddress = a.selectedAddress;
  req.session.data.finalAddress = a.finalAddress;
  req.session.data.DyfjJC = a.DyfjJC;
  req.session.data.aitzzV = a.aitzzV;
  req.session.data.zhJMaM = a.zhJMaM;

  const currentVersion = getRunnerV5CurrentFormVersion(req);
  const previousVersion = Number(saved.formVersion) || 1;
  const hasNewOrInvalidQuestions = previousVersion < currentVersion;
  req.session.data.runnerV5HasNewOrInvalidQuestions = hasNewOrInvalidQuestions;

  if (hasNewOrInvalidQuestions) {
    req.session.data.runnerV5NewQuestionsCompleted = false;
    return res.redirect("/runner-v5/intervention");
  }

  return res.redirect("/runner-v5/check-answers");
});

router.get("/runner-v5/check-answers", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (
    req.session.data.runnerV5UsePreviousSubmission &&
    req.session.data.runnerV5HasNewOrInvalidQuestions &&
    !req.session.data.runnerV5NewQuestionsCompleted
  ) {
    return res.redirect("/runner-v5/intervention");
  }
  return res.render("titan-mvp-1.2/runner-v5/check-answers", {
    data: req.session.data
  });
});

router.post("/runner-v5/check-answers", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (req.body.email && String(req.body.email).trim() !== "") {
    req.session.data.email = String(req.body.email).trim();
  }

  const store = ensureRunnerV5SubmissionStore(req);
  const formVersionAtSubmission = getRunnerV5CurrentFormVersion(req);
  const referenceNumber = createRunnerV5ReferenceNumber();
  const submittedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const email = String(req.session.data.email || "").trim();
  const key = `${normalizeRunnerV5Email(email)}::${String(referenceNumber).trim().toUpperCase()}`;
  store.push({
    key,
    referenceNumber,
    email,
    submittedOn,
    formName: "Register as a unicorn breeder",
    formVersion: formVersionAtSubmission,
    answers: {
      name: req.session.data.name,
      email: req.session.data.email,
      phoneNumber: req.session.data.phoneNumber,
      selectedAddress: req.session.data.selectedAddress,
      finalAddress: req.session.data.finalAddress,
      DyfjJC: req.session.data.DyfjJC,
      aitzzV: req.session.data.aitzzV,
      "location-easting": req.session.data["location-easting"],
      "location-northing": req.session.data["location-northing"],
      zhJMaM: req.session.data.zhJMaM
    }
  });

  req.session.data.runnerV5LastSubmittedReferenceNumber = referenceNumber;
  req.session.data.runnerV5LastSubmittedEmail = email;
  req.session.data.runnerV5LastSubmittedOn = submittedOn;
  req.session.data.runnerV5CurrentFormVersion = formVersionAtSubmission + 1;

  return res.redirect("/runner-v5/confirmation");
});

router.get("/runner-v5/confirmation", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/confirmation", {
    data: req.session.data
  });
});

// Use this route for the "Go to email" link so we can reliably pass the
// reference number even when the email template is otherwise auto-rendered.
router.get("/runner-v5/confirmation-email", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const runnerV5ReferenceNumber =
    (req.query && req.query.ref) ||
    req.session.data.runnerV5LastSubmittedReferenceNumber ||
    "V5-1A2B-3C4D";
  return res.render("titan-mvp-1.2/runner/confirmation-email-v2", {
    data: req.session.data,
    runnerV5ReferenceNumber
  });
});

router.get("/runner-v5/previous-submission", function (req, res) {
  return res.redirect("/runner-v5/intervention");
});

router.post("/runner-v5/previous-submission", function (req, res) {
  return res.redirect("/runner-v5/intervention");
});

router.get("/runner-v5/intervention", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/intervention", {
    data: req.session.data
  });
});

router.post("/runner-v5/intervention", function (req, res) {
  return res.redirect("/runner-v5/new-questions/declaration");
});

router.get("/runner-v5/new-questions", function (req, res) {
  return res.redirect("/runner-v5/new-questions/declaration");
});

router.post("/runner-v5/new-questions", function (req, res) {
  return res.redirect("/runner-v5/new-questions/declaration");
});

router.get("/runner-v5/new-questions/declaration", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/new-questions-declaration", {
    data: req.session.data,
    error: req.session.data.runnerV5NewQuestionsError
  });
});

router.post("/runner-v5/new-questions/declaration", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { declaration } = req.body;
  delete req.session.data.runnerV5NewQuestionsError;
  req.session.data.declaration = declaration;
  req.session.data.runnerV5NewQuestionsDeclarationConfirmed = true;
  return res.redirect("/runner-v5/new-questions/unicorn-weight");
});

router.get("/runner-v5/new-questions/unicorn-weight", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner-v5/new-questions-unicorn-weight", {
    data: req.session.data,
    error: req.session.data.runnerV5NewQuestionsError
  });
});

router.post("/runner-v5/new-questions/unicorn-weight", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { runnerV5UnicornWeightKg } = req.body;
  delete req.session.data.runnerV5NewQuestionsError;
  req.session.data.runnerV5UnicornWeightKg = String(runnerV5UnicornWeightKg || "").trim();
  req.session.data.runnerV5NewQuestionsCompleted = true;
  return res.redirect("/runner-v5/check-answers");
});

router.get("/runner-v5/whats-your-name", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/whats-your-name", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/whats-your-name", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { name } = req.body;
  req.session.data.name = name;
  delete req.session.data.error;
  return res.redirect("/runner-v5/whats-your-email-address");
});

router.get("/runner-v5/whats-your-email-address", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/whats-your-email-address", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/whats-your-email-address", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { email } = req.body;
  req.session.data.email = email;
  delete req.session.data.error;
  return res.redirect("/runner-v5/whats-your-phone-number");
});

router.get("/runner-v5/whats-your-phone-number", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/whats-your-phone-number", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/whats-your-phone-number", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { phoneNumber } = req.body;
  req.session.data.phoneNumber = phoneNumber;
  delete req.session.data.error;
  return res.redirect("/runner-v5/what-type-of-unicorns-will-you-breed");
});

router.get("/runner-v5/what-type-of-unicorns-will-you-breed", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/what-type-of-unicorns-will-you-breed", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/what-type-of-unicorns-will-you-breed", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { DyfjJC } = req.body;
  req.session.data.DyfjJC = DyfjJC;
  delete req.session.data.error;
  return res.redirect("/runner-v5/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/runner-v5/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/how-many-unicorns-do-you-expect-to-breed-each-year", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { aitzzV } = req.body;
  req.session.data.aitzzV = aitzzV;
  delete req.session.data.error;
  // Runner v5 no longer asks for easting/northing coordinates.
  return res.redirect("/runner-v5/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v5/where-will-you-keep-the-unicorns", function (req, res) {
  if (!req.session.data) req.session.data = {};
  // Legacy URL kept for users returning to old bookmarks.
  return res.redirect("/runner-v5/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.post("/runner-v5/where-will-you-keep-the-unicorns", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.redirect("/runner-v5/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v5/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  if (!req.session.data) req.session.data = {};
  return res.render("titan-mvp-1.2/runner/questions/how-many-members-of-staff-will-look-after-the-unicorns", {
    error: req.session.data.error,
    basePath: "/runner-v5"
  });
});

router.post("/runner-v5/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const { zhJMaM } = req.body;
  req.session.data.zhJMaM = zhJMaM;
  delete req.session.data.error;
  return res.redirect("/runner-v5/check-answers");
});

router.get("/runner-v4/declaration", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/declaration", {
    error: req.session.data.error,
    basePath: "/runner-v4"
  });
});

router.post("/runner-v4/declaration", function (req, res) {
  const { declaration } = req.body;
  // Persist declaration so it can be shown on the summary page.
  req.session.data.declaration = declaration;
  delete req.session.data.error;
  res.redirect("/runner-v4/whats-your-name");
});

router.get("/runner-v4/whats-your-name", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-name", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/whats-your-name", function (req, res) {
  const { name } = req.body;
  req.session.data.name = name;
  delete req.session.data.error;
  res.redirect("/runner-v4/whats-your-email-address");
});

router.get("/runner-v4/whats-your-email-address", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-email-address", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/whats-your-email-address", function (req, res) {
  const { email } = req.body;
  req.session.data.email = email;
  delete req.session.data.error;
  res.redirect("/runner-v4/whats-your-phone-number");
});

router.get("/runner-v4/whats-your-phone-number", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/whats-your-phone-number", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/whats-your-phone-number", function (req, res) {
  const { phoneNumber } = req.body;
  req.session.data.phoneNumber = phoneNumber;
  delete req.session.data.error;
  res.redirect("/runner-v4/what-type-of-unicorns-will-you-breed");
});

router.get("/runner-v4/whats-your-address", function (req, res) {
  // v4 journey no longer captures address
  delete req.session.data.error;
  return res.redirect("/runner-v4/what-type-of-unicorns-will-you-breed");
});
router.post("/runner-v4/whats-your-address", function (req, res) {
  // v4 journey no longer captures address
  delete req.session.data.error;
  return res.redirect("/runner-v4/what-type-of-unicorns-will-you-breed");
});

router.get("/runner-v4/what-type-of-unicorns-will-you-breed", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/what-type-of-unicorns-will-you-breed", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/what-type-of-unicorns-will-you-breed", function (req, res) {
  const { DyfjJC } = req.body;
  req.session.data.DyfjJC = DyfjJC;
  delete req.session.data.error;
  res.redirect("/runner-v4/how-many-unicorns-do-you-expect-to-breed-each-year");
});

router.get("/runner-v4/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-unicorns-do-you-expect-to-breed-each-year", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/how-many-unicorns-do-you-expect-to-breed-each-year", function (req, res) {
  const { aitzzV } = req.body;
  req.session.data.aitzzV = aitzzV;
  delete req.session.data.error;
  res.redirect("/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v4/where-will-you-keep-the-unicorns", function (req, res) {
  // v4 journey no longer captures coordinates
  delete req.session.data.error;
  return res.redirect("/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns");
});
router.post("/runner-v4/where-will-you-keep-the-unicorns", function (req, res) {
  // v4 journey no longer captures coordinates
  delete req.session.data.error;
  return res.redirect("/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns");
});

router.get("/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/how-many-members-of-staff-will-look-after-the-unicorns", { error: req.session.data.error, basePath: "/runner-v4" });
});
router.post("/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns", function (req, res) {
  const { zhJMaM } = req.body;
  req.session.data.zhJMaM = zhJMaM;
  delete req.session.data.error;
  req.session.data.reviewDeclarationCompleteV4 = false;
  delete req.session.data.reviewDeclarationErrorV4;
  res.redirect("/runner-v4/summary");
});

router.get("/runner-v4/summary", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);
  delete req.session.data.reviewDeclarationErrorV4;
  res.render("titan-mvp-1.2/runner-v4/summary-no-payment", {
    data: req.session.data
  });
});

router.post("/runner-v4/summary", function (req, res) {
  if (!req.session.data) req.session.data = {};
  // Summary page captures (or reconfirms) email.
  if (typeof req.body.email === "string" && req.body.email.trim() !== "") {
    req.session.data.email = req.body.email.trim();
  }
  req.session.data.reviewInterventionStartedV4 = true;
  return res.redirect("/runner-v4/send-for-checking");
});

// ── Runner v4: send for checking (replaces /runner-v4/intervention) ──────────
router.use("/runner-v4", function (req, res, next) {
  const checkingStarted = Boolean(
    req.session &&
      req.session.data &&
      req.session.data.reviewInterventionStartedV4
  );

  if (!checkingStarted) {
    return next();
  }

  return next();
});

router.get("/runner-v4/send-for-checking", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);
  const newLinkGenerated = req.query.newLink === "1";
  const inviteEmailSent = req.query.inviteSent === "1";
  const inviteEmailResent = req.query.inviteResent === "1";
  const inviteContactChanged = req.query.inviteChanged === "1";
  const inviteThrottled = req.query.inviteThrottled === "1";
  const RESEND_COOLDOWN_SECONDS = 30;
  const inviteSentAtIso = req.session.data.runnerV4InviteCheckerSentAt || null;
  let inviteSentAtText = null;
  let inviteCooldownRemainingSeconds = 0;
  if (inviteSentAtIso) {
    const d = new Date(inviteSentAtIso);
    if (!Number.isNaN(d.getTime())) {
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const rawHours = d.getHours();
      const ampm = rawHours >= 12 ? "pm" : "am";
      const hours12 = rawHours % 12 || 12;
      const time = `${hours12}:${minutes}${ampm}`;
      const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      inviteSentAtText = `Sent at ${time} on ${date}`;

      const remainingMs =
        (RESEND_COOLDOWN_SECONDS * 1000) - (Date.now() - d.getTime());
      if (remainingMs > 0) {
        inviteCooldownRemainingSeconds = Math.ceil(remainingMs / 1000);
      }
    }
  }

  const reviewStore = ensureReviewStore(req);
  let reviewToken = req.session.data.reviewTokenV4;
  if (!reviewToken) {
    reviewToken = RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
    req.session.data.reviewTokenV4 = reviewToken;
  }

  const existingEntry = reviewStore.get(reviewToken);
  const reviewerDeclarationComplete =
    existingEntry && existingEntry.expires > Date.now()
      ? Boolean(existingEntry.reviewDeclarationComplete)
      : false;

  req.session.data.reviewDeclarationCompleteV4 = reviewerDeclarationComplete;
  req.session.data.reviewApprovedV4 = reviewerDeclarationComplete;

  if (reviewerDeclarationComplete) {
    delete req.session.data.reviewDeclarationErrorV4;
    return res.redirect(`/runner-v4/ready-to-submit?token=${encodeURIComponent(reviewToken)}`);
  }

  reviewStore.set(reviewToken, {
    data: { ...req.session.data },
    reviewDeclarationComplete: reviewerDeclarationComplete,
    reviewerDeclaredAt:
      existingEntry && existingEntry.reviewerDeclaredAt
        ? existingEntry.reviewerDeclaredAt
        : null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  const shareReviewUrl = `/runner-v4/review-declaration?token=${encodeURIComponent(reviewToken)}`;
  const absoluteShareReviewUrl = `${PUBLIC_BASE_URL}${shareReviewUrl}`;
  const reviewStatus = reviewerDeclarationComplete
    ? "Reviewer declaration complete"
    : "Awaiting reviewer declaration";

  return res.render("titan-mvp-1.2/runner-v4/intervention", {
    data: req.session.data,
    reviewStatus,
    shareReviewUrl: absoluteShareReviewUrl,
    newLinkGenerated,
    interventionStarted: Boolean(req.session.data.reviewInterventionStartedV4),
    inviteEmailSent,
    inviteEmailResent,
    inviteContactChanged,
    inviteThrottled,
    inviteSentAtText,
    inviteSentAtIso,
    inviteCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    inviteCooldownRemainingSeconds,
    inviteContactMethod: req.session.data.runnerV4InviteCheckerContactMethod,
    inviteEmail: req.session.data.runnerV4InviteCheckerEmail,
    invitePhone: req.session.data.runnerV4InviteCheckerPhone
  });
});

router.post("/runner-v4/send-for-checking/email-details", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = req.body && typeof req.body.inviteReviewerEmail === "string"
    ? req.body.inviteReviewerEmail.trim()
    : "";
  // Backwards compatible with older UI: treat as email contact.
  req.session.data.runnerV4InviteCheckerContactMethod = "email";
  req.session.data.runnerV4InviteCheckerEmail = email;
  delete req.session.data.runnerV4InviteCheckerPhone;
  req.session.data.runnerV4InviteCheckerSentAt = new Date().toISOString();
  return res.redirect("/runner-v4/send-for-checking?inviteSent=1");
});

router.post("/runner-v4/send-for-checking/contact-details", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const contact = req.body && typeof req.body.contact === "string"
    ? req.body.contact.trim()
    : "";

  req.session.data.runnerV4InviteCheckerContactMethod = contact;
  delete req.session.data.runnerV4InviteCheckerContactError;

  const email = req.body && typeof req.body.contactByEmail === "string"
    ? req.body.contactByEmail.trim()
    : "";
  const emailConfirm = req.body && typeof req.body.contactByEmailConfirm === "string"
    ? req.body.contactByEmailConfirm.trim()
    : "";
  const phone = req.body && typeof req.body.contactByPhone === "string"
    ? req.body.contactByPhone.trim()
    : "";

  if (contact === "phone" || contact === "text-message" || contact === "text") {
    req.session.data.runnerV4InviteCheckerPhone = phone;
    delete req.session.data.runnerV4InviteCheckerEmail;
    delete req.session.data.runnerV4InviteCheckerEmailConfirm;
  } else {
    // Default to email for prototype.
    if (!email || !emailConfirm || email.toLowerCase() !== emailConfirm.toLowerCase()) {
      req.session.data.runnerV4InviteCheckerContactMethod = "email";
      req.session.data.runnerV4InviteCheckerEmail = email;
      req.session.data.runnerV4InviteCheckerEmailConfirm = emailConfirm;
      delete req.session.data.runnerV4InviteCheckerPhone;
      req.session.data.runnerV4InviteCheckerContactError = "Enter matching email addresses";
      return res.redirect("/runner-v4/send-for-checking");
    }

    req.session.data.runnerV4InviteCheckerEmail = email;
    delete req.session.data.runnerV4InviteCheckerEmailConfirm;
    delete req.session.data.runnerV4InviteCheckerPhone;
    req.session.data.runnerV4InviteCheckerContactMethod = "email";
  }

  req.session.data.runnerV4InviteCheckerSentAt = new Date().toISOString();
  return res.redirect("/runner-v4/send-for-checking?inviteSent=1");
});

router.post("/runner-v4/send-for-checking/email-details/resend", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const RESEND_COOLDOWN_SECONDS = 30;
  const lastSentIso = req.session.data.runnerV4InviteCheckerSentAt || null;
  if (lastSentIso) {
    const d = new Date(lastSentIso);
    if (!Number.isNaN(d.getTime())) {
      const elapsedMs = Date.now() - d.getTime();
      if (elapsedMs < RESEND_COOLDOWN_SECONDS * 1000) {
        return res.redirect("/runner-v4/send-for-checking?inviteSent=1&inviteThrottled=1");
      }
    }
  }

  // Prototype only: treat as "send again" using stored contact details.
  req.session.data.runnerV4InviteCheckerSentAt = new Date().toISOString();
  return res.redirect("/runner-v4/send-for-checking?inviteSent=1&inviteResent=1");
});

router.post("/runner-v4/send-for-checking/email-details/change", function (req, res) {
  if (!req.session.data) req.session.data = {};
  delete req.session.data.runnerV4InviteCheckerContactMethod;
  delete req.session.data.runnerV4InviteCheckerEmail;
  delete req.session.data.runnerV4InviteCheckerPhone;
  delete req.session.data.runnerV4InviteCheckerSentAt;
  return res.redirect("/runner-v4/send-for-checking?inviteChanged=1");
});

router.get("/runner-v4/ready-to-submit", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  const reviewStore = ensureReviewStore(req);
  const token = (req.query && req.query.token) || req.session.data.reviewTokenV4;
  if (!token) {
    return res.redirect("/runner-v4/send-for-checking");
  }

  req.session.data.reviewTokenV4 = token;

  // User research: checked token should always be "checked complete"
  // so participants can deep-link into the post-check flow reliably.
  if (token === RUNNER_V4_REVIEW_TOKEN_CHECKED) {
    const existing = reviewStore.get(token);
    if (!existing || !(existing.expires > Date.now())) {
      reviewStore.set(token, {
        data: { ...req.session.data },
        reviewDeclarationComplete: true,
        reviewerDeclaredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedByName: "Sam Reviewer",
        approvedByEmail: "sam.reviewer@example.com",
        approvedByOccupation: "Registered vet",
        approvedByAddress: "1 Review Street, London, SW1A 1AA",
        expires: Date.now() + (30 * 60 * 1000)
      });
    } else if (!existing.reviewDeclarationComplete) {
      reviewStore.set(token, {
        ...existing,
        reviewDeclarationComplete: true,
        reviewerDeclaredAt: existing.reviewerDeclaredAt || new Date().toISOString(),
        approvedAt: existing.approvedAt || new Date().toISOString(),
        expires: Date.now() + (30 * 60 * 1000)
      });
    }
  }

  const existingEntry = reviewStore.get(token);
  const reviewerDeclarationComplete =
    existingEntry && existingEntry.expires > Date.now()
      ? Boolean(existingEntry.reviewDeclarationComplete)
      : false;

  req.session.data.reviewDeclarationCompleteV4 = reviewerDeclarationComplete;
  req.session.data.reviewApprovedV4 = reviewerDeclarationComplete;

  if (!reviewerDeclarationComplete) {
    return res.redirect("/runner-v4/send-for-checking");
  }

  const reviewerDetailsMap = req.session.data.reviewerDetailsV4 || {};
  const reviewerDetails = reviewerDetailsMap[token] || {};
  const checkedByName =
    (existingEntry && String(existingEntry.approvedByName || "").trim()) ||
    String(reviewerDetails.reviewerName || "").trim();
  const checkedAtIso =
    (existingEntry && (existingEntry.approvedAt || existingEntry.reviewerDeclaredAt)) || null;
  let checkedByText = checkedByName || "Not provided";
  const checkedByContact =
    (existingEntry && String(existingEntry.approvedByEmail || "").trim()) ||
    String(reviewerDetails.reviewerEmail || "").trim() ||
    String(reviewerDetails.reviewerPhone || "").trim() ||
    "Not provided";

  const checkedDeclarationText =
    existingEntry && existingEntry.expires > Date.now() && existingEntry.reviewDeclarationComplete
      ? "Agreed by the person checking the form"
      : "Not provided";

  let checkedOnText = "Not provided";
  if (checkedAtIso) {
    const checkedAtDate = new Date(checkedAtIso);
    if (!Number.isNaN(checkedAtDate.getTime())) {
      checkedByText += ` on ${checkedAtDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}`;
      const checkedDateText = checkedAtDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const checkedTimeText = checkedAtDate
        .toLocaleTimeString("en-GB", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
        .replace(" ", "")
        .toLowerCase();
      checkedOnText = `${checkedDateText} at ${checkedTimeText}`;
    }
  }

  return res.render("titan-mvp-1.2/runner-v4/ready-to-submit", {
    data: req.session.data,
    token,
    reviewerDetails,
    checkedByText,
    checkedByContact,
    checkedOnText,
    checkedDeclarationText
  });
});

router.post("/runner-v4/submit", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  const token = (req.body && req.body.token) || req.session.data.reviewTokenV4;
  if (token) {
    req.session.data.reviewTokenV4 = token;
  }

  req.session.data.runnerV4SubmittedAt = new Date().toISOString();
  req.session.data.reviewSubmittedV4 = true;

  return res.redirect(
    `/runner-v4/confirmation${token ? `?token=${encodeURIComponent(token)}` : ""}`
  );
});

router.post("/runner-v4/send-for-checking/generate-review-link", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const reviewStore = ensureReviewStore(req);
  const previousToken = req.session.data.reviewTokenV4;

  if (previousToken) {
    reviewStore.delete(previousToken);
  }

  const newToken = RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
  req.session.data.reviewTokenV4 = newToken;
  req.session.data.reviewDeclarationCompleteV4 = false;
  delete req.session.data.reviewDeclarationErrorV4;

  reviewStore.set(newToken, {
    data: { ...req.session.data },
    reviewDeclarationComplete: false,
    reviewerDeclaredAt: null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  return res.redirect("/runner-v4/send-for-checking?newLink=1");
});

router.post("/runner-v4/send-for-checking/return-for-changes", function (req, res) {
  if (!req.session.data) req.session.data = {};

  const reviewStore = ensureReviewStore(req);
  const currentToken = req.session.data.reviewTokenV4;
  if (currentToken) {
    reviewStore.delete(currentToken);
  }

  // Unlock answers so applicant can edit, and clear review state.
  req.session.data.reviewInterventionStartedV4 = false;
  req.session.data.reviewDeclarationCompleteV4 = false;
  delete req.session.data.reviewDeclarationErrorV4;
  delete req.session.data.reviewTokenV4;

  return res.redirect("/runner-v4/summary");
});

router.get("/runner-v4/review-declaration", function (req, res) {
  const { token, success } = req.query;
  const reviewStore = ensureReviewStore(req);
  let reviewEntry = token ? reviewStore.get(token) : null;

  // User research helper: allow direct linking for the "in progress" token.
  if (!reviewEntry && token === RUNNER_V4_REVIEW_TOKEN_INPROGRESS) {
    if (!req.session.data) req.session.data = {};
    applyRunnerV3DemoData(req.session.data);
    reviewEntry = {
      data: { ...req.session.data },
      reviewDeclarationComplete: false,
      reviewerDeclaredAt: null,
      expires: Date.now() + (30 * 60 * 1000)
    };
    reviewStore.set(token, reviewEntry);
  }
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.render("titan-mvp-1.2/runner-v4/review-declaration-no-back", {
      tokenValid: false
    });
  }

  if (success === "1") {
    return res.redirect(`/runner-v4/review-declaration/complete?token=${encodeURIComponent(token)}`);
  }

  if (!req.session.data) {
    req.session.data = {};
  }
  if (reviewEntry.data && typeof reviewEntry.data === "object") {
    // Merge stored form snapshot into the session, but keep any fresh session
    // state (like access flags) that may have been set immediately before redirect.
    req.session.data = { ...reviewEntry.data, ...req.session.data };
  }

  // User research: always require reference number + memorable word for the
  // deterministic token, but allow a successful pass through the gate once.
  const justGrantedMap = req.session.data.reviewAccessJustGrantedV4 || {};
  const justGranted = Boolean(token && justGrantedMap[token]);
  if (token === RUNNER_V4_REVIEW_TOKEN_INPROGRESS && !justGranted) {
    if (req.session.data.reviewAccessTokensV4 && req.session.data.reviewAccessTokensV4[token]) {
      delete req.session.data.reviewAccessTokensV4[token];
    }
  }

  const accessMap = req.session.data.reviewAccessTokensV4 || {};
  const hasReviewerAccess = Boolean(token && accessMap[token]);
  if (token === RUNNER_V4_REVIEW_TOKEN_INPROGRESS && hasReviewerAccess && justGrantedMap[token]) {
    delete justGrantedMap[token];
    req.session.data.reviewAccessJustGrantedV4 = justGrantedMap;
  }
  const reviewAccessError = req.session.data.reviewAccessErrorV4;
  const enteredReferenceNumber = req.session.data.enteredReviewerReferenceNumberV4 || "";
  const enteredMemorableWord = req.session.data.enteredReviewerMemorableWordV4 || "";
  const reviewerDetailsMap = req.session.data.reviewerDetailsV4 || {};
  const hasReviewerDetails = Boolean(token && reviewerDetailsMap[token]);

  if (!hasReviewerAccess) {
    return res.render("titan-mvp-1.2/runner-v4/review-declaration-no-back", {
      tokenValid: true,
      token,
      hasReviewerAccess: false,
      reviewAccessError,
      enteredReferenceNumber,
      enteredMemorableWord
    });
  }

  // For research convenience, allow reviewers to view the form before entering
  // their own details. The page will still let them add/change reviewer details.

  delete req.session.data.reviewAccessErrorV4;
  delete req.session.data.enteredReviewerReferenceNumberV4;
  delete req.session.data.enteredReviewerMemorableWordV4;
  applyRunnerV3DemoData(req.session.data);
  reviewEntry.data = { ...req.session.data };

  const error = req.session.data && req.session.data.error;

  res.render("titan-mvp-1.2/runner-v4/review-declaration-no-back", {
    tokenValid: true,
    token,
    hasReviewerAccess: true,
    data: reviewEntry.data || {},
    reviewerDetails: reviewerDetailsMap[token] || {},
    error
  });
});

// Prototype helper: seed a valid reviewer token and redirect.
// This keeps static email previews clickable (token won't be "no longer valid").
router.get("/runner-v4/checker-demo-review", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  const demoToken = RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
  const reviewStore = ensureReviewStore(req);

  // Tie the demo token to the applicant journey so that visiting
  // /runner-v4/send-for-checking can detect completion and redirect.
  req.session.data.reviewInterventionStartedV4 = true;
  req.session.data.reviewTokenV4 = demoToken;

  // Ensure token is valid in the review store.
  reviewStore.set(demoToken, {
    data: { ...req.session.data },
    reviewDeclarationComplete: false,
    reviewerDeclaredAt: null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  // Always require reference number + memorable word for access.
  if (req.session.data.reviewAccessTokensV4 && req.session.data.reviewAccessTokensV4[demoToken]) {
    delete req.session.data.reviewAccessTokensV4[demoToken];
  }

  return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(demoToken)}`);
});

router.get("/runner-v4/review-declaration/complete", function (req, res) {
  const { token } = req.query;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  if (!reviewEntry.reviewDeclarationComplete) {
    return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
  }

  return res.render("titan-mvp-1.2/runner-v4/review-declaration-complete", {
    token
  });
});

router.get("/runner-v4/reviewer-details", function (req, res) {
  const { token } = req.query;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  if (!req.session.data) req.session.data = {};
  const accessMap = req.session.data.reviewAccessTokensV4 || {};
  if (!accessMap[token]) {
    return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
  }

  const reviewerDetailsMap = req.session.data.reviewerDetailsV4 || {};
  const existing = reviewerDetailsMap[token] || {};
  const formValues = req.session.data.reviewerDetailsFormV4 || {};
  const errors = req.session.data.reviewerDetailsErrorsV4 || {};

  return res.render("titan-mvp-1.2/runner-v4/reviewer-details", {
    token,
    errors,
    values: {
      reviewerName: formValues.reviewerName || existing.reviewerName || "",
      reviewerOccupation: formValues.reviewerOccupation || existing.reviewerOccupation || "",
      reviewerEmail: formValues.reviewerEmail || existing.reviewerEmail || "",
      reviewerAddress: formValues.reviewerAddress || existing.reviewerAddress || ""
    }
  });
});

router.get("/runner-v4/privacy-notice", function (req, res) {
  const { token } = req.query;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  return res.render("titan-mvp-1.2/runner-v4/privacy-notice", { token });
});

router.post("/runner-v4/reviewer-details", function (req, res) {
  const { token, reviewerName, reviewerOccupation, reviewerEmail } = req.body;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  const errors = {};
  if (!reviewerName || !reviewerName.trim()) errors.reviewerName = "Enter your name";
  if (!reviewerOccupation || !reviewerOccupation.trim()) errors.reviewerOccupation = "Enter your occupation";
  if (!reviewerEmail || !reviewerEmail.trim()) {
    errors.reviewerEmail = "Enter your email address";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewerEmail.trim())) errors.reviewerEmail = "Enter a valid email address";
  }

  req.session.data.reviewerDetailsFormV4 = {
    reviewerName: reviewerName || "",
    reviewerOccupation: reviewerOccupation || "",
    reviewerEmail: reviewerEmail || ""
  };

  if (Object.keys(errors).length > 0) {
    req.session.data.reviewerDetailsErrorsV4 = errors;
    return res.redirect(`/runner-v4/reviewer-details?token=${encodeURIComponent(token)}`);
  }

  const reviewerDetailsMap = req.session.data.reviewerDetailsV4 || {};
  reviewerDetailsMap[token] = {
    reviewerName: reviewerName.trim(),
    reviewerOccupation: reviewerOccupation.trim(),
    reviewerEmail: reviewerEmail.trim()
  };
  req.session.data.reviewerDetailsV4 = reviewerDetailsMap;
  delete req.session.data.reviewerDetailsErrorsV4;
  delete req.session.data.reviewerDetailsFormV4;

  return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
});

router.post("/runner-v4/review-declaration/access", function (req, res) {
  const { token, reviewerReferenceNumber, reviewerMemorableWord } = req.body;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  const expected = reviewerAccessValues();
  const normalizedReference = (reviewerReferenceNumber || "").trim().toUpperCase();
  const expectedReference = String(expected.referenceNumber || "").trim().toUpperCase();
  const normalizedWord = (reviewerMemorableWord || "").trim().toLowerCase();

  if (
    normalizedReference !== expectedReference ||
    normalizedWord !== expected.memorableWord.toLowerCase()
  ) {
    req.session.data.reviewAccessErrorV4 =
      "Enter the correct reviewer reference number and memorable word";
    req.session.data.enteredReviewerReferenceNumberV4 = reviewerReferenceNumber || "";
    req.session.data.enteredReviewerMemorableWordV4 = reviewerMemorableWord || "";
    return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
  }

  const accessMap = req.session.data.reviewAccessTokensV4 || {};
  accessMap[token] = true;
  req.session.data.reviewAccessTokensV4 = accessMap;

  if (!req.session.data.reviewAccessJustGrantedV4) {
    req.session.data.reviewAccessJustGrantedV4 = {};
  }
  req.session.data.reviewAccessJustGrantedV4[token] = true;

  delete req.session.data.reviewAccessErrorV4;
  delete req.session.data.enteredReviewerReferenceNumberV4;
  delete req.session.data.enteredReviewerMemorableWordV4;

  return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
});

router.post("/runner-v4/review-declaration", function (req, res) {
  const { token, declaration } = req.body;
  const reviewStore = ensureReviewStore(req);
  const reviewEntry = token ? reviewStore.get(token) : null;
  const tokenValid = Boolean(reviewEntry && reviewEntry.expires > Date.now());

  if (!tokenValid) {
    return res.redirect("/runner-v4/review-declaration");
  }

  if (!declaration || !declaration.includes("confirmed")) {
    req.session.data.error = {
      declarationError: "You must accept the declaration to continue"
    };
    return res.redirect(`/runner-v4/review-declaration?token=${encodeURIComponent(token)}`);
  }

  if (!req.session.data) req.session.data = {};

  const reviewerDetailsMap = req.session.data.reviewerDetailsV4 || {};
  const reviewerDetails = reviewerDetailsMap[token] || {};
  const approvedAtIso = new Date().toISOString();
  const approvedByName = String(reviewerDetails.reviewerName || "").trim();
  const formName = "DxT design survey";
  const applicantEmail =
    (reviewEntry &&
      reviewEntry.data &&
      typeof reviewEntry.data === "object" &&
      String(reviewEntry.data.email || "").trim()) ||
    String(req.session.data.email || "").trim();

  delete req.session.data.error;
  reviewStore.set(token, {
    ...reviewEntry,
    reviewDeclarationComplete: true,
    reviewerDeclaredAt: approvedAtIso,
    approvedAt: approvedAtIso,
    approvedByName,
    approvedByEmail: String(reviewerDetails.reviewerEmail || "").trim(),
    approvedByOccupation: String(reviewerDetails.reviewerOccupation || "").trim(),
    approvedByAddress: String(reviewerDetails.reviewerAddress || "").trim(),
    expires: Date.now() + (30 * 60 * 1000)
  });

  req.session.data.runnerV4ApprovalEmailSnapshot = {
    token,
    formName,
    approvedByName,
    applicantEmail,
    approvedAt: Date.now()
  };

  return res.redirect(`/runner-v4/review-declaration/complete?token=${encodeURIComponent(token)}`);
});

router.get("/titan-mvp-1.2/runner-v4/approval-notification.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  const reviewStore = ensureReviewStore(req);
  // User research: default to a stable token, but allow overriding for previews.
  const token = (req.query && req.query.token) || RUNNER_V4_REVIEW_TOKEN_CHECKED;
  req.session.data.reviewTokenV4 = token;

  const existing = reviewStore.get(token);
  // Ensure the token exists for clickable previews (don't force it complete for all tokens).
  if (!existing || !(existing.expires > Date.now())) {
    reviewStore.set(token, {
      data: { ...req.session.data },
      reviewDeclarationComplete: token === RUNNER_V4_REVIEW_TOKEN_CHECKED,
      reviewerDeclaredAt: token === RUNNER_V4_REVIEW_TOKEN_CHECKED ? new Date().toISOString() : null,
      approvedAt: token === RUNNER_V4_REVIEW_TOKEN_CHECKED ? new Date().toISOString() : null,
      approvedByName: "Sam Reviewer",
      approvedByEmail: "sam.reviewer@example.com",
      approvedByOccupation: "Registered vet",
      approvedByAddress: "1 Review Street, London, SW1A 1AA",
      expires: Date.now() + (30 * 60 * 1000)
    });
  }
  const entry = reviewStore.get(token) || null;

  const approvalSnapshot =
    req.session.data.runnerV4ApprovalEmailSnapshot &&
    req.session.data.runnerV4ApprovalEmailSnapshot.token === token
      ? req.session.data.runnerV4ApprovalEmailSnapshot
      : null;

  const storedData =
    entry && entry.expires > Date.now() && entry.data && typeof entry.data === "object" ? entry.data : {};
  const storedClean = Object.fromEntries(
    Object.entries(storedData).filter(([, v]) => v !== "" && v !== null && typeof v !== "undefined")
  );
  const answers = { ...req.session.data, ...storedClean };

  const formName =
    (approvalSnapshot && approvalSnapshot.formName) ||
    (entry && entry.formName) ||
    "DxT design survey";
  const approvedByName =
    (approvalSnapshot && approvalSnapshot.approvedByName) ||
    (entry && entry.approvedByName) ||
    "Your checker";
  const applicantEmail =
    (approvalSnapshot && approvalSnapshot.applicantEmail) ||
    String(answers.email || "you@example.com");

  const { referenceNumber, memorableWord } = reviewerAccessValues();

  return res.render("titan-mvp-1.2/runner-v4/approval-notification", {
    data: req.session.data,
    answers,
    token,
    formName,
    approvedByName,
    applicantEmail,
    referenceNumber,
    memorableWord
  });
});

// Runner v4: applicant access gate (reference number + memorable word)
router.get("/runner-v4/applicant-access", function (req, res) {
  const token = (req.query && req.query.token) || RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
  const nextUrl = (req.query && typeof req.query.next === "string" && req.query.next.trim() !== "")
    ? req.query.next.trim()
    : "";
  if (!req.session.data) req.session.data = {};
  req.session.data.reviewInterventionStartedV4 = true;
  req.session.data.reviewTokenV4 = token;

  res.render("titan-mvp-1.2/runner-v4/applicant-access", {
    token,
    next: nextUrl,
    enteredReferenceNumber: req.session.data.enteredApplicantReferenceNumberV4 || "",
    enteredMemorableWord: req.session.data.enteredApplicantMemorableWordV4 || "",
    errorMessage: req.session.data.applicantAccessErrorV4 || null
  });
});

router.post("/runner-v4/applicant-access", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const token = (req.body && req.body.token) || RUNNER_V4_REVIEW_TOKEN_INPROGRESS;
  const nextUrl = (req.body && typeof req.body.next === "string" && req.body.next.trim() !== "")
    ? req.body.next.trim()
    : "";
  const expected = reviewerAccessValues();

  const normalizedRef = String((req.body && req.body.referenceNumber) || "").trim().toUpperCase();
  const expectedRef = String(expected.referenceNumber || "").trim().toUpperCase();
  const normalizedWord = String((req.body && req.body.memorableWord) || "").trim().toLowerCase();
  const expectedWord = String(expected.memorableWord || "").trim().toLowerCase();

  if (normalizedRef !== expectedRef || normalizedWord !== expectedWord) {
    req.session.data.applicantAccessErrorV4 =
      "Enter the correct reference number and memorable word";
    req.session.data.enteredApplicantReferenceNumberV4 = (req.body && req.body.referenceNumber) || "";
    req.session.data.enteredApplicantMemorableWordV4 = (req.body && req.body.memorableWord) || "";
    return res.redirect(`/runner-v4/applicant-access?token=${encodeURIComponent(token)}`);
  }

  delete req.session.data.applicantAccessErrorV4;
  delete req.session.data.enteredApplicantReferenceNumberV4;
  delete req.session.data.enteredApplicantMemorableWordV4;

  req.session.data.reviewInterventionStartedV4 = true;
  req.session.data.reviewTokenV4 = token;

  // If caller provided a next URL, always go there after successful access.
  if (nextUrl) {
    return res.redirect(nextUrl);
  }

  // User research: the checked token should reliably land on ready-to-submit.
  if (token === RUNNER_V4_REVIEW_TOKEN_CHECKED) {
    return res.redirect(`/runner-v4/ready-to-submit?token=${encodeURIComponent(token)}`);
  }

  const reviewStore = ensureReviewStore(req);
  const entry = token ? reviewStore.get(token) : null;
  const complete = Boolean(entry && entry.expires > Date.now() && entry.reviewDeclarationComplete);
  if (complete) {
    return res.redirect(`/runner-v4/ready-to-submit?token=${encodeURIComponent(token)}`);
  }
  return res.redirect("/runner-v4/send-for-checking");
});

router.get("/titan-mvp-1.2/runner-v4/applicant-return-notification.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  return res.render("titan-mvp-1.2/runner-v4/applicant-return-notification", {
    applicantEmail: String(req.session.data.email || "you@example.com")
  });
});

router.get("/runner-v4/confirmation", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  // Ensure we always have a token for the email preview link.
  const reviewStore = ensureReviewStore(req);
  let token = (req.query && req.query.token) || req.session.data.reviewTokenV4;
  if (!token) {
    token = createReviewToken();
  }
  req.session.data.reviewTokenV4 = token;
  const existing = reviewStore.get(token);

  const sessionHasAnyV4Answers =
    Boolean(String(req.session.data.name || "").trim()) ||
    Boolean(String(req.session.data.phoneNumber || "").trim()) ||
    (Array.isArray(req.session.data.DyfjJC)
      ? req.session.data.DyfjJC.length > 0
      : Boolean(req.session.data.DyfjJC)) ||
    Boolean(String(req.session.data.aitzzV || "").trim()) ||
    Boolean(String(req.session.data.zhJMaM || "").trim());

  if (
    !sessionHasAnyV4Answers &&
    existing &&
    existing.expires > Date.now() &&
    existing.data &&
    typeof existing.data === "object"
  ) {
    req.session.data = { ...req.session.data, ...existing.data };
  }

  // Always refresh the stored snapshot so the email preview can show answers.
  reviewStore.set(token, {
    ...(existing && typeof existing === "object" ? existing : {}),
    data: { ...req.session.data },
    reviewDeclarationComplete:
      existing && typeof existing.reviewDeclarationComplete !== "undefined"
        ? Boolean(existing.reviewDeclarationComplete)
        : Boolean(req.session.data.reviewDeclarationCompleteV4),
    reviewerDeclaredAt:
      existing && existing.reviewerDeclaredAt ? existing.reviewerDeclaredAt : null,
    expires: Date.now() + (30 * 60 * 1000)
  });

  // Also persist a snapshot in the session so it survives server restarts.
  req.session.data.runnerV4EmailSnapshot = {
    token,
    data: { ...req.session.data },
    savedAt: Date.now()
  };

  return res.render("titan-mvp-1.2/runner-v4/confirmation", {
    data: req.session.data
  });
});

router.get("/runner-v2/reuse-saved-answers", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/reuse-saved-answers", {
    error: req.session.data.error
  });
});

router.post("/runner-v2/reuse-saved-answers", function (req, res) {
  const { reuseEmail, referenceNumber } = req.body;
  const errors = {};
  if (!reuseEmail || !reuseEmail.trim()) errors.emailError = "Enter your email address";
  if (!referenceNumber || !referenceNumber.trim()) errors.referenceError = "Enter your reference number";
  if (Object.keys(errors).length > 0) {
    req.session.data.error = errors;
    req.session.data.reuseEmail = reuseEmail;
    req.session.data.referenceNumber = referenceNumber;
    return res.redirect("/runner-v2/reuse-saved-answers");
  }
  req.session.data.reuseEmail = reuseEmail;
  req.session.data.referenceNumber = referenceNumber;
  delete req.session.data.error;
  res.redirect("/runner-v2/reuse-summary");
});

router.get("/runner-v2/reuse-summary", function (req, res) {
  if (!req.session.data) req.session.data = {};
  res.render("titan-mvp-1.2/runner/summary-reuse", {
    data: req.session.data
  });
});

router.post("/runner-v2/reuse-summary", function (req, res) {
  res.redirect("/runner-v2/confirmation");
});

router.get("/titan-mvp-1.2/runner/confirmation-email-v2.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const runnerV5ReferenceNumber =
    (req.query && req.query.ref) ||
    req.session.data.runnerV5LastSubmittedReferenceNumber ||
    "V5-1A2B-3C4D";
  res.render("titan-mvp-1.2/runner/confirmation-email-v2", {
    data: req.session.data,
    runnerV5ReferenceNumber
  });
});

router.get("/titan-mvp-1.2/runner-v4/check-notification-1.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  applyRunnerV3DemoData(req.session.data);

  const reviewStore = ensureReviewStore(req);
  const token = (req.query && req.query.token) || req.session.data.reviewTokenV4;
  const entry = token ? reviewStore.get(token) : null;
  const sessionSnapshot =
    req.session.data.runnerV4EmailSnapshot &&
    req.session.data.runnerV4EmailSnapshot.token === token
      ? req.session.data.runnerV4EmailSnapshot.data
      : null;
  const storedData = sessionSnapshot
    ? sessionSnapshot
    : entry && entry.expires > Date.now() && entry.data && typeof entry.data === "object"
        ? entry.data
        : {};
  const storedClean = Object.fromEntries(
    Object.entries(storedData).filter(([, v]) => v !== "" && v !== null && typeof v !== "undefined")
  );
  const answers = { ...req.session.data, ...storedClean };
  const hasAnyV4Answers =
    Boolean(String(answers.name || "").trim()) ||
    Boolean(String(answers.phoneNumber || "").trim()) ||
    (Array.isArray(answers.DyfjJC) ? answers.DyfjJC.length > 0 : Boolean(answers.DyfjJC)) ||
    Boolean(String(answers.aitzzV || "").trim()) ||
    Boolean(String(answers.zhJMaM || "").trim());
  if (!hasAnyV4Answers) {
    applyRunnerV3DemoData(answers);
  }

  const skipKeys = new Set([
    "error",
    "errors",
    "reviewAccessTokensV4",
    "reviewAccessErrorV4",
    "enteredReviewerReferenceNumberV4",
    "enteredReviewerMemorableWordV4",
    "reviewDeclarationErrorV4",
    "reviewInterventionStartedV4"
  ]);
  const answerItems = Object.entries(answers)
    .filter(([k, v]) => !skipKeys.has(k))
    .filter(([, v]) => v !== "" && v !== null && typeof v !== "undefined")
    .filter(([, v]) => !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => ({
      key: k,
      value: Array.isArray(v) ? v.join(", ") : String(v)
    }));

  res.render("titan-mvp-1.2/runner-v4/check-notification-1", {
    data: req.session.data,
    answers,
    answerItems
  });
});

router.get("/summary", function (req, res) {
  console.log("Summary route - session data:", req.session.data);
  console.log("Summary route - session ID:", req.sessionID);
  console.log("Summary route - session keys:", Object.keys(req.session));

  // Ensure session data exists
  if (!req.session.data) {
    req.session.data = {};
    console.log("Session data was null, initialized empty object");
  }

  // Try to restore from server-side store using token from query param
  const resumeToken = req.query.token;
  if (resumeToken) {
    // Ensure tempStore exists
    if (!req.app.locals.tempStore) {
      console.log("Creating tempStore as it doesn't exist (summary route)");
      req.app.locals.tempStore = new Map();
    }

    const tempStore = req.app.locals.tempStore;
    const stored = tempStore.get(resumeToken);

    if (stored && stored.expires > Date.now()) {
      req.session.data = stored.data;
      tempStore.delete(resumeToken); // Clean up after use
      console.log("Restored session data from server store with token:", resumeToken);
    } else {
      console.log("Token not found or expired:", resumeToken);
    }
  }

  // Debug specific fields
  console.log("Name:", req.session.data.name);
  console.log("Email:", req.session.data.email);
  console.log("Phone:", req.session.data.phoneNumber);
  const debugMode = req.query.debug === "1";
  const sessionInfo = {
    id: req.sessionID,
    cookie: req.session.cookie
  };
  res.render("titan-mvp-1.2/runner/summary", {
    data: req.session.data,
    debugMode,
    sessionInfo
  });
});

router.post("/summary", function (req, res) {
  res.redirect("/confirmation");
});

// Allow direct access to summary.html path to use the same session-backed render
router.get("/titan-mvp-1.2/runner/summary.html", function (req, res) {
  if (!req.session.data) {
    req.session.data = {};
  }

  // Try to restore from server-side store using token from query param
  const resumeToken = req.query.token;
  if (resumeToken) {
    // Ensure tempStore exists
    if (!req.app.locals.tempStore) {
      console.log("Creating tempStore as it doesn't exist (html route)");
      req.app.locals.tempStore = new Map();
    }

    const tempStore = req.app.locals.tempStore;
    const stored = tempStore.get(resumeToken);

    if (stored && stored.expires > Date.now()) {
      req.session.data = stored.data;
      tempStore.delete(resumeToken); // Clean up after use
      console.log("Restored session data from server store with token (html route):", resumeToken);
    } else {
      console.log("Token not found or expired (html route):", resumeToken);
    }
  }

  const debugMode = req.query.debug === "1";
  const sessionInfo = {
    id: req.sessionID,
    cookie: req.session.cookie
  };
  res.render("titan-mvp-1.2/runner/summary", {
    data: req.session.data,
    debugMode,
    sessionInfo
  });
});

router.get("/confirmation", function (req, res) {
  res.render("titan-mvp-1.2/runner/confirmation");
});

// Handle return from GOV.UK Pay
router.get("/payment-return", function (req, res) {
  // This route will be called by GOV.UK Pay after payment
  // We'll redirect to a page that can access localStorage
  res.render("titan-mvp-1.2/runner/payment-return", {
    title: "Payment Complete"
  });
});

// Legacy form question routes (keeping for backward compatibility)
router.get("/question-1", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-1");
});

router.post("/question-1", function (req, res) {
  res.redirect("/question-2");
});

router.get("/question-2", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-2");
});

router.post("/question-2", function (req, res) {
  res.redirect("/question-3");
});

router.get("/question-3", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-3");
});

router.post("/question-3", function (req, res) {
  res.redirect("/question-4");
});

router.get("/question-4", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-4");
});

router.post("/question-4", function (req, res) {
  res.redirect("/question-5");
});

router.get("/question-5", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-5");
});

router.post("/question-5", function (req, res) {
  res.redirect("/question-6");
});

router.get("/question-6", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-6");
});

router.post("/question-6", function (req, res) {
  res.redirect("/question-7");
});

router.get("/question-7", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-7");
});

router.post("/question-7", function (req, res) {
  res.redirect("/question-8");
});

router.get("/question-8", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/question-8");
});

router.post("/question-8", function (req, res) {
  res.redirect("/payment-question");
});

router.get("/payment-question", function (req, res) {
  // Generate unique token and store form data server-side
  const token = require('crypto').randomBytes(32).toString('hex');

  // Ensure tempStore exists
  if (!req.app.locals.tempStore) {
    console.log("Creating tempStore as it doesn't exist");
    req.app.locals.tempStore = new Map();
  }

  const tempStore = req.app.locals.tempStore;

  // Store current form data with 30-minute expiry
  tempStore.set(token, {
    data: req.session.data || {},
    expires: Date.now() + (30 * 60 * 1000)
  });

  console.log("Stored form data with token:", token);
  console.log("tempStore size:", tempStore.size);

  res.render("titan-mvp-1.2/runner/payment-question", {
    resumeToken: token
  });
});

router.post("/payment-question", function (req, res) {
  res.redirect("/check-answers");
});

router.get("/check-answers", function (req, res) {
  res.render("titan-mvp-1.2/runner/check-answers");
});

router.post("/check-answers", function (req, res) {
  res.redirect("/confirmation");
});

// Address lookup functionality routes
router.get("/address-lookup-postcode", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/address-lookup-postcode", {
    error: req.session.data.error
  });
});

router.post("/address-lookup-postcode", function (req, res) {
  const { addressPostcode, buildingNameNumber, action, returnUrl } = req.body;

  if (action === "lookup") {
    if (!addressPostcode) {
      req.session.data.error = { addressError: true };
      return res.redirect("/address-lookup-postcode?returnUrl=" + encodeURIComponent(returnUrl));
    }

    // Use real address API
    const {
      getAddressesPostcode,
      getAddressesSearchString,
    } = require("find-an-address-plugin/utils/getData");

    if (buildingNameNumber) {
      // Search with building name/number
      getAddressesSearchString(buildingNameNumber + " " + addressPostcode)
        .then((data) => {
          if (data.length > 0) {
            // Format addresses for dropdown
            const formattedAddresses = data.map(address => ({
              value: address,
              text: address
            }));

            req.session.data.addressResults = formattedAddresses;
            req.session.data.addressPostcode = addressPostcode;
            req.session.data.buildingNameNumber = buildingNameNumber;
            req.session.data.returnUrl = returnUrl;
            delete req.session.data.error;

            res.redirect("/address-lookup-results?returnUrl=" + encodeURIComponent(returnUrl));
          } else {
            // No addresses found
            req.session.data.addressResults = [];
            req.session.data.addressPostcode = addressPostcode;
            req.session.data.buildingNameNumber = buildingNameNumber;
            req.session.data.returnUrl = returnUrl;
            delete req.session.data.error;

            res.redirect("/address-lookup-results?returnUrl=" + encodeURIComponent(returnUrl));
          }
        })
        .catch((error) => {
          console.error("Address lookup error:", error);
          req.session.data.error = { addressError: true };
          res.redirect("/address-lookup-postcode?returnUrl=" + encodeURIComponent(returnUrl));
        });
    } else {
      // Search with postcode only
      getAddressesPostcode(addressPostcode)
        .then((data) => {
          if (data.length > 0) {
            // Format addresses for dropdown
            const formattedAddresses = data.map(address => ({
              value: address,
              text: address
            }));

            req.session.data.addressResults = formattedAddresses;
            req.session.data.addressPostcode = addressPostcode;
            req.session.data.buildingNameNumber = buildingNameNumber;
            req.session.data.returnUrl = returnUrl;
            delete req.session.data.error;

            res.redirect("/address-lookup-results?returnUrl=" + encodeURIComponent(returnUrl));
          } else {
            // No addresses found
            req.session.data.addressResults = [];
            req.session.data.addressPostcode = addressPostcode;
            req.session.data.buildingNameNumber = buildingNameNumber;
            req.session.data.returnUrl = returnUrl;
            delete req.session.data.error;

            res.redirect("/address-lookup-results?returnUrl=" + encodeURIComponent(returnUrl));
          }
        })
        .catch((error) => {
          console.error("Address lookup error:", error);
          req.session.data.error = { addressError: true };
          res.redirect("/address-lookup-postcode?returnUrl=" + encodeURIComponent(returnUrl));
        });
    }
  }
});

router.get("/address-lookup-results", function (req, res) {
  res.render("titan-mvp-1.2/runner/questions/address-lookup-results", {
    error: req.session.data.error
  });
});

router.post("/address-lookup-results", function (req, res) {
  const { selectAddress, action, returnUrl } = req.body;

  if (action === "use-address") {
    if (!selectAddress) {
      req.session.data.error = { addressError: true };
      return res.redirect("/address-lookup-results?returnUrl=" + encodeURIComponent(returnUrl));
    }

    // Store the selected address for display
    req.session.data.selectedAddress = selectAddress;
    req.session.data.finalAddress = selectAddress;

    // Parse the selected address and store in session
    const addressParts = selectAddress.split(", ");

    // Determine which address field to use based on return URL
    if (returnUrl && returnUrl.includes("when-does-your-unicorn-insurance-policy-start")) {
      // Certificate address
      req.session.data['AegFro-address-line-1'] = addressParts[0];
      req.session.data['AegFro-address-line-2'] = addressParts[1] || "";
      req.session.data['AegFro-town'] = addressParts[2] || "";
      req.session.data['AegFro-postcode'] = addressParts[3] || "";
    } else {
      // Main address
      req.session.data['wZLWPy-address-line-1'] = addressParts[0];
      req.session.data['wZLWPy-address-line-2'] = addressParts[1] || "";
      req.session.data['wZLWPy-town'] = addressParts[2] || "";
      req.session.data['wZLWPy-postcode'] = addressParts[3] || "";
    }

    // Clear lookup data
    delete req.session.data.addressResults;
    delete req.session.data.addressPostcode;
    delete req.session.data.buildingNameNumber;
    delete req.session.data.error;

    res.redirect(returnUrl || "/whats-your-address");
  }
});

router.get("/address-lookup-manual", function (req, res) {
  if (req.query.returnUrl) {
    req.session.data.returnUrl = req.query.returnUrl;
  }
  res.render("titan-mvp-1.2/runner/questions/address-lookup-manual", {
    error: req.session.data.error
  });
});

router.post("/address-lookup-manual", function (req, res) {
  const { addressLine1, addressLine2, townCity, addressPostcode, action, returnUrl } = req.body;
  const resolvedReturnUrl =
    returnUrl || (req.session && req.session.data && req.session.data.returnUrl) || "/whats-your-address";

  if (action === "use-manual-address") {
    // Validate required fields
    const errors = {};
    if (!addressLine1) errors.addressLineError = "Enter address line 1";
    if (!townCity) errors.townOrCityError = "Enter town or city";
    if (!addressPostcode) errors.postcodeError = "Enter postcode";

    if (Object.keys(errors).length > 0) {
      req.session.data.error = errors;
      return res.redirect("/address-lookup-manual?returnUrl=" + encodeURIComponent(resolvedReturnUrl));
    }

    // Create formatted address for display
    const formattedAddress = [addressLine1, addressLine2, townCity, addressPostcode]
      .filter(part => part && part.trim())
      .join(", ");

    // Store the formatted address for display
    req.session.data.selectedAddress = formattedAddress;
    req.session.data.finalAddress = formattedAddress;

    // Determine which address field to use based on return URL
    if (returnUrl && returnUrl.includes("when-does-your-unicorn-insurance-policy-start")) {
      // Certificate address
      req.session.data['AegFro-address-line-1'] = addressLine1;
      req.session.data['AegFro-address-line-2'] = addressLine2 || "";
      req.session.data['AegFro-town'] = townCity;
      req.session.data['AegFro-postcode'] = addressPostcode;
    } else {
      // Main address
      req.session.data['wZLWPy-address-line-1'] = addressLine1;
      req.session.data['wZLWPy-address-line-2'] = addressLine2 || "";
      req.session.data['wZLWPy-town'] = townCity;
      req.session.data['wZLWPy-postcode'] = addressPostcode;
    }

    // Clear any errors
    delete req.session.data.error;

    res.redirect(resolvedReturnUrl);
  }
});

// Save and exit functionality routes
router.get("/save-progress", function (req, res) {
  const returnUrl = req.query.returnUrl;

  // Store the returnUrl for when user resumes their progress
  if (returnUrl) {
    req.session.data.returnUrl = returnUrl;
  }

  res.render("titan-mvp-1.2/runner/save-exit/save-progress");
});

router.post("/save-progress", function (req, res) {
  const email = req.body.email;
  const emailConfirm = req.body.emailConfirm;
  const securityAnswer = req.body.securityAnswer;
  const securityQuestion = req.body.securityQuestion;
  const returnUrl = req.body.returnUrl || req.query.returnUrl;

  // Store the security answer for later validation
  req.session.data.securityAnswer = securityAnswer;
  req.session.data.securityQuestion = securityQuestion;
  req.session.data.email = email;

  // Store the returnUrl for when user resumes their progress
  if (returnUrl) {
    req.session.data.returnUrl = returnUrl;
  }

  console.log("Saving progress - security answer:", securityAnswer);
  console.log("Saving progress - security question:", securityQuestion);
  console.log("Email:", email);
  console.log("Email confirm:", emailConfirm);

  // Validate email addresses match
  if (!email || !emailConfirm) {
    req.session.data.emailConfirmError = "Enter both email addresses";
    return res.redirect("/save-progress");
  }

  if (email !== emailConfirm) {
    req.session.data.emailConfirmError =
      "Your email address does not match. Check and try again";
    return res.redirect("/save-progress");
  }

  // Clear any previous errors
  delete req.session.data.emailConfirmError;

  console.log("Session data after save:", req.session.data);

  res.redirect("/progress-saved");
});

router.get("/progress-saved", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/progress-saved");
});

router.get("/resume-form", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/resume-form");
});

// ── Runner v4: resume saved form (prototype) ─────────────────────────────────
router.get("/runner-v4/resume-form", function (req, res) {
  res.render("titan-mvp-1.2/runner-v4/save-exit/resume-form", {
    data: req.session.data || {}
  });
});

router.post("/runner-v4/validate-security-answer", function (req, res) {
  const userInput = req.body.userSecurityAnswer;
  const correctAnswer = req.session.data.securityAnswer || "test answer";
  const attempts = (req.session.data.attemptsV4 || 0) + 1;

  req.session.data.attemptsV4 = attempts;

  const trimmedUserInput = userInput ? userInput.trim() : "";
  const trimmedCorrectAnswer = correctAnswer ? correctAnswer.trim() : "";

  if (userInput && trimmedUserInput === trimmedCorrectAnswer) {
    delete req.session.data.attemptsV4;
    return res.redirect("/runner-v4/welcome-back");
  }

  if (attempts >= 3) {
    delete req.session.data.attemptsV4;
    return res.redirect("/runner-v4/failed-attempts");
  }

  return res.redirect("/runner-v4/resume-form");
});

router.get("/runner-v4/welcome-back", function (req, res) {
  res.render("titan-mvp-1.2/runner-v4/save-exit/welcome-back", {
    data: req.session.data || {}
  });
});

router.get("/runner-v4/failed-attempts", function (req, res) {
  res.render("titan-mvp-1.2/runner-v4/save-exit/failed-attempts");
});

router.get("/runner-v4/resume-to-next-question", function (req, res) {
  const sessionData = req.session.data || {};

  const formFlow = [
    { url: "/runner-v4/whats-your-name", field: "name" },
    { url: "/runner-v4/whats-your-email-address", field: "email" },
    { url: "/runner-v4/whats-your-phone-number", field: "phoneNumber" },
    { url: "/runner-v4/what-type-of-unicorns-will-you-breed", field: "DyfjJC" },
    { url: "/runner-v4/how-many-unicorns-do-you-expect-to-breed-each-year", field: "aitzzV" },
    { url: "/runner-v4/where-will-you-keep-the-unicorns", field: "location-easting" },
    { url: "/runner-v4/how-many-members-of-staff-will-look-after-the-unicorns", field: "zhJMaM" },
    { url: "/runner-v4/declaration", field: "declaration" },
    { url: "/runner-v4/summary", field: null }
  ];

  let nextQuestion = "/runner-v4/summary";

  for (const question of formFlow) {
    if (question.field === null) {
      nextQuestion = question.url;
      break;
    }

    const fieldValue = sessionData[question.field];
    const isAnswered =
      fieldValue &&
      (Array.isArray(fieldValue)
        ? fieldValue.length > 0
        : fieldValue.toString().trim() !== "");

    if (!isAnswered) {
      nextQuestion = question.url;
      break;
    }
  }

  return res.redirect(nextQuestion);
});

router.post("/validate-security-answer", function (req, res) {
  const userInput = req.body.userSecurityAnswer; // User's input from the form
  const correctAnswer = req.session.data.securityAnswer || "test answer"; // The answer saved during save-progress
  const attempts = (req.session.data.attempts || 0) + 1;

  console.log("User input:", userInput);
  console.log("Correct answer:", correctAnswer);
  console.log("Attempts:", attempts);

  req.session.data.attempts = attempts;

  // Trim whitespace but keep case sensitivity
  const trimmedUserInput = userInput ? userInput.trim() : "";
  const trimmedCorrectAnswer = correctAnswer ? correctAnswer.trim() : "";

  console.log("User input (trimmed):", trimmedUserInput);
  console.log("Correct answer (trimmed):", trimmedCorrectAnswer);
  console.log(
    "Do they match?",
    trimmedUserInput === trimmedCorrectAnswer
  );

  if (userInput && trimmedUserInput === trimmedCorrectAnswer) {
    // Correct answer - redirect to welcome back
    console.log("Answer is correct - redirecting to welcome-back");
    delete req.session.data.attempts; // Reset attempts
    res.redirect("/welcome-back");
  } else if (attempts >= 3) {
    // Too many attempts - redirect to failed attempts page
    console.log("Too many attempts - redirecting to failed-attempts");
    delete req.session.data.attempts; // Reset attempts
    res.redirect("/failed-attempts");
  } else {
    // Incorrect answer but still has attempts - go back to resume form
    console.log("Incorrect answer - redirecting back to resume-form");
    res.redirect("/resume-form");
  }
});

router.get("/welcome-back", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/welcome-back", {
    data: req.session.data || {}
  });
});

router.get("/resume-to-next-question", function (req, res) {
  const sessionData = req.session.data || {};

  // Define the form flow sequence with their corresponding data fields
  const formFlow = [
    { url: '/whats-your-name', field: 'name' },
    { url: '/whats-your-email-address', field: 'email' },
    { url: '/whats-your-phone-number', field: 'phoneNumber' },
    { url: '/whats-your-address', field: 'selectedAddress' },
    { url: '/what-type-of-unicorns-will-you-breed', field: 'DyfjJC' },
    { url: '/how-many-unicorns-do-you-expect-to-breed-each-year', field: 'aitzzV' },
    { url: '/where-will-you-keep-the-unicorns', field: 'location-easting' },
    { url: '/how-many-members-of-staff-will-look-after-the-unicorns', field: 'zhJMaM' },
    { url: '/when-does-your-unicorn-insurance-policy-start', field: 'insuranceStartDate-day' },
    { url: '/what-address-do-you-want-the-certificate-sent-to', field: 'AegFro-address-line-1' },
    { url: '/upload-your-insurance-certificate', field: 'dLzALM' },
    { url: '/declaration', field: 'declaration' },
    { url: '/check-answers', field: null } // check-answers doesn't have a specific field
  ];

  // Find the first unanswered question
  let nextQuestion = '/check-answers'; // Default to check-answers if all are answered

  for (const question of formFlow) {
    if (question.field === null) {
      // For check-answers, always include it
      nextQuestion = question.url;
      break;
    }

    const fieldValue = sessionData[question.field];
    const isAnswered = fieldValue &&
      (Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue.toString().trim() !== '');

    if (!isAnswered) {
      nextQuestion = question.url;
      break;
    }
  }

  // Redirect to the next unanswered question
  res.redirect(nextQuestion);
});

router.get("/failed-attempts", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/failed-attempts");
});

router.get("/link-expired", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/link-expired");
});

router.get("/session-expired", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/session-expired");
});

router.get("/notify-email", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/notify-email");
});

router.get("/user-submitted", function (req, res) {
  res.render("titan-mvp-1.2/runner/save-exit/user-submitted");
});
