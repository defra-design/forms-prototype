/**
 * Proof of concept: copy form / page / question.
 * Registers onto the shared titan-mvp-1.2 router.
 */

const {
  createIdFactory,
  cloneQuestion,
  clonePage,
  cloneFormSessionSlice,
  uniqueCopyLabel,
  copyStem,
} = require("../../lib/titan-mvp-1.2/clone-form");

function findPageIndex(formPages, pageId) {
  return (formPages || []).findIndex(
    (page) => String(page.pageId) === String(pageId)
  );
}

function findQuestion(page, questionId) {
  if (!page || !Array.isArray(page.questions)) {
    return { question: null, questionIndex: -1 };
  }
  const questionIndex = page.questions.findIndex(
    (question) => String(question.questionId) === String(questionId)
  );
  return {
    question: questionIndex === -1 ? null : page.questions[questionIndex],
    questionIndex,
  };
}

function pageLabel(page, pageNumber) {
  if (!page) {
    return `Page ${pageNumber}`;
  }
  if (page.pageType === "guidance") {
    return page.guidanceOnlyHeadingInput || `Page ${pageNumber}`;
  }
  if (page.pageHeading) {
    return page.pageHeading;
  }
  if (page.questions && page.questions[0] && page.questions[0].label) {
    return page.questions[0].label;
  }
  return `Page ${pageNumber}`;
}

module.exports = function registerCopyRoutes(router) {
  // ---- Copy question -------------------------------------------------------

  router.get(
    "/titan-mvp-1.2/form-editor/copy/question/:pageId/:questionId",
    function (req, res) {
      const formData = req.session.data || {};
      const formPages = formData.formPages || [];
      const pageIndex = findPageIndex(formPages, req.params.pageId);
      const page = pageIndex === -1 ? null : formPages[pageIndex];
      const { question } = findQuestion(page, req.params.questionId);

      if (!page || !question) {
        return res.redirect("/titan-mvp-1.2/form-editor/listing");
      }

      const questionLabel = question.label || "Untitled question";
      const existingLabels = (page.questions || []).map(
        (item) => item.label || "Untitled question"
      );

      res.render("titan-mvp-1.2/form-editor/copy/question.html", {
        form: { name: formData.formName || "Form name" },
        pageId: page.pageId,
        pageNumber: pageIndex + 1,
        pageHeading: pageLabel(page, pageIndex + 1),
        questionId: question.questionId,
        questionLabel,
        copiedLabel: uniqueCopyLabel(questionLabel, existingLabels, "Untitled question"),
      });
    }
  );

  router.post("/titan-mvp-1.2/form-editor/copy/question", function (req, res) {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = findPageIndex(formPages, req.body.pageId);
    const page = pageIndex === -1 ? null : formPages[pageIndex];
    const { question, questionIndex } = findQuestion(page, req.body.questionId);

    if (!page || !question) {
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    const nextId = createIdFactory();
    const copiedQuestion = cloneQuestion(question, nextId, {
      identifyCopy: true,
      existingLabels: (page.questions || []).map(
        (item) => item.label || "Untitled question"
      ),
    });
    const insertAt =
      req.body.insert === "end" ? page.questions.length : questionIndex + 1;
    page.questions.splice(insertAt, 0, copiedQuestion);

    req.session.data.formPages = formPages;
    req.session.data.currentPageIndex = pageIndex;
    req.session.data.currentQuestionIndex =
      req.body.insert === "end" ? insertAt : questionIndex + 1;

    res.redirect("/titan-mvp-1.2/page-overview?copied=question");
  });

  // ---- Copy questions from another page ------------------------------------

  function questionHasAssociatedConditions(question, page, formConditions) {
    if (
      question &&
      Array.isArray(question.conditions) &&
      question.conditions.length > 0
    ) {
      return true;
    }

    const questionId = String(question && question.questionId);
    const questionLabel = String(
      (question && question.label) || ""
    ).toLowerCase();

    function rulesReferenceQuestion(rules) {
      return (rules || []).some(function (rule) {
        if (rule.questionId && String(rule.questionId) === questionId) {
          return true;
        }
        if (
          rule.questionText &&
          String(rule.questionText).toLowerCase() === questionLabel
        ) {
          return true;
        }
        return false;
      });
    }

    if (
      page &&
      Array.isArray(page.conditions) &&
      page.conditions.some(function (condition) {
        return rulesReferenceQuestion(condition.rules);
      })
    ) {
      return true;
    }

    return (formConditions || []).some(function (condition) {
      return rulesReferenceQuestion(condition.rules);
    });
  }

  router.get(
    "/titan-mvp-1.2/form-editor/copy/questions-from-page",
    function (req, res) {
      const formData = req.session.data || {};
      const formPages = formData.formPages || [];
      const currentPageIndex = formData.currentPageIndex || 0;
      const currentPage = formPages[currentPageIndex];

      if (!currentPage) {
        return res.redirect("/titan-mvp-1.2/form-editor/listing");
      }

      const pageItems = formPages
        .map(function (page, index) {
          if (index === currentPageIndex) {
            return null;
          }
          if (!page.questions || page.questions.length === 0) {
            return null;
          }
          return {
            value: String(page.pageId),
            text:
              "Page " +
              (index + 1) +
              ": " +
              pageLabel(page, index + 1),
            hint: {
              text:
                page.questions.length === 1
                  ? "1 question"
                  : page.questions.length + " questions",
            },
          };
        })
        .filter(Boolean);

      res.render("titan-mvp-1.2/form-editor/copy/questions-from-page.html", {
        form: { name: formData.formName || "Form name" },
        pageNumber: currentPageIndex + 1,
        pageHeading: pageLabel(currentPage, currentPageIndex + 1),
        pageItems,
        errorMessage: req.query.error || null,
      });
    }
  );

  router.get(
    "/titan-mvp-1.2/form-editor/copy/questions-from-page/select",
    function (req, res) {
      const formData = req.session.data || {};
      const formPages = formData.formPages || [];
      const currentPageIndex = formData.currentPageIndex || 0;
      const currentPage = formPages[currentPageIndex];
      const sourcePageId = req.query.sourcePageId;
      const sourcePageIndex = findPageIndex(formPages, sourcePageId);
      const sourcePage =
        sourcePageIndex === -1 ? null : formPages[sourcePageIndex];

      if (
        !currentPage ||
        !sourcePage ||
        sourcePageIndex === currentPageIndex ||
        !sourcePage.questions ||
        sourcePage.questions.length === 0
      ) {
        return res.redirect(
          "/titan-mvp-1.2/form-editor/copy/questions-from-page"
        );
      }

      const formConditions = formData.conditions || [];
      const questionItems = sourcePage.questions.map(function (question, index) {
        return {
          value: String(question.questionId),
          text: question.label || "Untitled question",
          hint: {
            text: "Question " + (index + 1),
          },
          attributes: {
            "data-has-conditions": questionHasAssociatedConditions(
              question,
              sourcePage,
              formConditions
            )
              ? "true"
              : "false",
          },
        };
      });

      res.render(
        "titan-mvp-1.2/form-editor/copy/questions-from-page-select.html",
        {
          form: { name: formData.formName || "Form name" },
          pageNumber: currentPageIndex + 1,
          pageHeading: pageLabel(currentPage, currentPageIndex + 1),
          sourcePageId: sourcePage.pageId,
          sourcePageNumber: sourcePageIndex + 1,
          sourcePageHeading: pageLabel(sourcePage, sourcePageIndex + 1),
          questionItems,
          errorMessage: req.query.error || null,
        }
      );
    }
  );

  router.post(
    "/titan-mvp-1.2/form-editor/copy/questions-from-page/select",
    function (req, res) {
      const sourcePageId = Array.isArray(req.body.sourcePageId)
        ? req.body.sourcePageId[0]
        : req.body.sourcePageId;

      if (!sourcePageId) {
        return res.redirect(
          "/titan-mvp-1.2/form-editor/copy/questions-from-page?error=page"
        );
      }

      res.redirect(
        "/titan-mvp-1.2/form-editor/copy/questions-from-page/select?sourcePageId=" +
          encodeURIComponent(sourcePageId)
      );
    }
  );

  router.post(
    "/titan-mvp-1.2/form-editor/copy/questions-from-page",
    function (req, res) {
      const formData = req.session.data || {};
      const formPages = formData.formPages || [];
      const currentPageIndex = formData.currentPageIndex || 0;
      const currentPage = formPages[currentPageIndex];
      const sourcePageId = Array.isArray(req.body.sourcePageId)
        ? req.body.sourcePageId[0]
        : req.body.sourcePageId;
      const sourcePageIndex = findPageIndex(formPages, sourcePageId);
      const sourcePage =
        sourcePageIndex === -1 ? null : formPages[sourcePageIndex];

      let selectedIds = req.body.questionIds || [];
      if (!Array.isArray(selectedIds)) {
        selectedIds = selectedIds ? [selectedIds] : [];
      }
      selectedIds = selectedIds.map(String);

      if (
        !currentPage ||
        !sourcePage ||
        sourcePageIndex === currentPageIndex
      ) {
        return res.redirect(
          "/titan-mvp-1.2/form-editor/copy/questions-from-page"
        );
      }

      if (selectedIds.length === 0) {
        return res.redirect(
          "/titan-mvp-1.2/form-editor/copy/questions-from-page/select?sourcePageId=" +
            encodeURIComponent(sourcePageId) +
            "&error=questions"
        );
      }

      currentPage.questions = currentPage.questions || [];
      const nextId = createIdFactory();

      // Keep the order the questions appear on the source page
      const questionsToCopy = (sourcePage.questions || []).filter(function (
        question
      ) {
        return selectedIds.indexOf(String(question.questionId)) !== -1;
      });

      const clonedQuestions = questionsToCopy.map(function (question) {
        const copiedQuestion = cloneQuestion(question, nextId);
        // PoC: do not add or keep a “(copy)” suffix on the label
        copiedQuestion.label = copyStem(
          question.label,
          "Untitled question"
        );
        if (Array.isArray(copiedQuestion.conditions)) {
          delete copiedQuestion.conditions;
        }
        return copiedQuestion;
      });

      // Always add copied questions at the bottom of the current page
      currentPage.questions = currentPage.questions.concat(clonedQuestions);

      req.session.data.formPages = formPages;
      req.session.data.currentPageIndex = currentPageIndex;
      req.session.data.currentQuestionIndex = currentPage.questions.length - 1;
      req.session.data.copyQuestionsSuccessCount = clonedQuestions.length;

      res.redirect("/titan-mvp-1.2/page-overview?copied=questions-from-page");
    }
  );

  // ---- Copy page -----------------------------------------------------------

  router.get(
    "/titan-mvp-1.2/form-editor/copy/page/:pageId",
    function (req, res) {
      const formData = req.session.data || {};
      const formPages = formData.formPages || [];
      const pageIndex = findPageIndex(formPages, req.params.pageId);
      const page = pageIndex === -1 ? null : formPages[pageIndex];

      if (!page) {
        return res.redirect("/titan-mvp-1.2/form-editor/listing");
      }

      const heading = pageLabel(page, pageIndex + 1);
      const existingLabels = formPages.map((item, index) =>
        pageLabel(item, index + 1)
      );

      res.render("titan-mvp-1.2/form-editor/copy/page.html", {
        form: { name: formData.formName || "Form name" },
        pageId: page.pageId,
        pageNumber: pageIndex + 1,
        pageHeading: heading,
        copiedLabel: uniqueCopyLabel(heading, existingLabels, "Untitled page"),
        questionCount: (page.questions || []).length,
      });
    }
  );

  router.post("/titan-mvp-1.2/form-editor/copy/page", function (req, res) {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = findPageIndex(formPages, req.body.pageId);

    if (pageIndex === -1) {
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    const nextId = createIdFactory();
    const copiedPage = clonePage(formPages[pageIndex], nextId, {
      identifyCopy: true,
      existingLabels: formPages.map((item, index) =>
        pageLabel(item, index + 1)
      ),
    });
    formPages.splice(pageIndex + 1, 0, copiedPage);

    req.session.data.formPages = formPages;
    req.session.data.currentPageIndex = pageIndex + 1;

    res.redirect("/titan-mvp-1.2/form-editor/listing?copied=page");
  });

  // ---- Copy form -----------------------------------------------------------

  router.get("/titan-mvp-1.2/form-overview/copy-form", function (req, res) {
    const formData = req.session.data || {};
    const currentName = formData.formName || "Form name";
    const existingNames = [
      currentName,
      ...((formData.formCopyHistory || []).map((item) => item.formName)),
    ];
    const source =
      req.query.source === "live" || req.query.source === "draft"
        ? req.query.source
        : "draft";

    res.render("titan-mvp-1.2/form-editor/copy/form.html", {
      form: { name: currentName },
      suggestedName: uniqueCopyLabel(currentName, existingNames, "Form name"),
      pageCount: (formData.formPages || []).length,
      source,
      sourceLabel: source === "live" ? "live" : "draft",
    });
  });

  router.post("/titan-mvp-1.2/form-overview/copy-form", function (req, res) {
    const formData = req.session.data || {};
    const nextId = createIdFactory();
    const source =
      req.body.source === "live" || req.body.source === "draft"
        ? req.body.source
        : "draft";
    const newFormName = (
      Array.isArray(req.body.formName)
        ? req.body.formName[0]
        : req.body.formName ||
          uniqueCopyLabel(
            formData.formName || "Form name",
            [
              formData.formName,
              ...((formData.formCopyHistory || []).map((item) => item.formName)),
            ],
            "Form name"
          )
    ).trim();

    // Keep a lightweight snapshot of the previous form for this prototype session
    req.session.data.formCopyHistory = req.session.data.formCopyHistory || [];
    req.session.data.formCopyHistory.push({
      formName: formData.formName,
      formId: formData.formId || formData.formDetails?.id,
      copiedAt: new Date().toISOString(),
      source,
    });

    const cloned = cloneFormSessionSlice(formData, nextId, newFormName, {
      copiedFrom: source,
    });

    Object.assign(req.session.data, cloned);

    if (source === "live") {
      req.session.data.copySuccessMessage = `Live form copied as “${newFormName}”. The copy is a draft.`;
    } else {
      req.session.data.copySuccessMessage = `Draft copied as “${newFormName}”. Only the draft was copied.`;
    }

    res.redirect(
      "/titan-mvp-1.2/form-overview/copy-poc?copied=form&status=draft"
    );
  });
};
