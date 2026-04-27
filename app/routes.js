const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();
const terms = require("./data/dictionary.json");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const slugify = require("slugify");

// Add middleware to make terms available to all templates
router.use((req, res, next) => {
  res.locals.commonTerms = terms;
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
  if (!req.session.data.sections) {
    req.session.data.sections = [];
  }
  if (!req.session.data.formPages) {
    req.session.data.formPages = [];
  }
  next();
});

// Load features from YAML
const features = yaml.load(
  fs.readFileSync(path.join(__dirname, "data/features.yml"), "utf8")
);

// Add middleware to make features available to all templates
router.use((req, res, next) => {
  res.locals.features = features;
  next();
});

// Add slugify filter to Nunjucks environment
router.use((req, res, next) => {
  res.locals.slugify = (str) => slugify(str, { lower: true });
  next();
});

// Import and use titan-mvp-1.2 routes
router.use("/titan-mvp-1.2", require("./routes/titan-mvp-1.2/routes.js"));
// Also mount titan-mvp-1.2 routes at root for legacy URLs (e.g. /runner-v5/*)
router.use("/", require("./routes/titan-mvp-1.2/routes.js"));

// Import and use titan-mvp-1 routes
router.use("/titan-mvp-1", require("./routes/titan-mvp-1/routes.js"));

// Lists routes
const lists = require("./routes/lists.js");
router.post("/lists/new", lists.post);
router.get("/lists", lists.get);
router.get("/lists/edit/:name", lists.editGet);
router.post("/lists/update/:name", lists.editPost);
router.post("/lists/delete/:name", lists.delete);
router.get("/lists/api", lists.getListsAPI);
router.get("/lists/api/:name", lists.getListAPI);
router.get("/lists/view/:name", lists.viewGet);

// Sections routes
router.use("/sections", require("./routes/sections.js"));

module.exports = router;
