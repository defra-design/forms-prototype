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

    res.render("titan-mvp-1.2/form-editor/copy/form.html", {
      form: { name: currentName },
      suggestedName: uniqueCopyLabel(currentName, existingNames, "Form name"),
      pageCount: (formData.formPages || []).length,
    });
  });

  router.post("/titan-mvp-1.2/form-overview/copy-form", function (req, res) {
    const formData = req.session.data || {};
    const nextId = createIdFactory();
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

    // Keep a lightweight snapshot of the previous draft for this prototype session
    req.session.data.formCopyHistory = req.session.data.formCopyHistory || [];
    req.session.data.formCopyHistory.push({
      formName: formData.formName,
      formId: formData.formId || formData.formDetails?.id,
      copiedAt: new Date().toISOString(),
    });

    const cloned = cloneFormSessionSlice(formData, nextId, newFormName);

    Object.assign(req.session.data, cloned);
    req.session.data.copySuccessMessage = `Form copied as “${newFormName}”`;

    res.redirect(
      "/titan-mvp-1.2/form-overview/simplified/index-tabs?copied=form"
    );
  });
};
