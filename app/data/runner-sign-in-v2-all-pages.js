const { SEED } = require("../lib/titan-mvp-1.2/runner-sign-in-v2-choose-journeys");
const { STATIC_BASE } = require("./advanced-settings-static");

function buildRunnerSignInV2AllPagesSections(urls, { formKey, applicationId, reviewToken, unexpectedPages }) {
  const enc = encodeURIComponent;
  const q = `formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`;
  const triple = (path, next) => {
    let url = `${path}?${q}`;
    if (next) url += `&next=${enc(next)}`;
    return url;
  };
  const checker = (path) =>
    `/runner-sign-in-v2/checker/${path}?token=${enc(reviewToken)}&prototype=1&allowApplicant=1`;

  const copyFormKey = SEED.submittedCopy.formKey;
  const copyApplicationId = SEED.submittedCopy.applicationId;
  const copyDraftId = SEED.copyDraft.applicationId;
  const copyDeclarationRequiredId = SEED.copyDeclarationRequired.applicationId;
  const copyManageUrl = `/runner-sign-in-v2/forms/${enc(copyFormKey)}/${enc(copyApplicationId)}/manage`;
  const copyQuery = `formKey=${enc(copyFormKey)}&applicationId=${enc(copyApplicationId)}`;
  const copyEmailTriple = (path) => `${path}?${copyQuery}&next=${enc(copyManageUrl)}`;
  const copyFormStep = (stepId, applicationId = copyDraftId) =>
    `/runner-sign-in/forms/${enc(copyFormKey)}/${enc(applicationId)}/${stepId}?copied=1`;

  return [
    {
      heading: "Prototype",
      links: [
        { text: "Start page", href: "/runner-sign-in-v2/start-page" },
        { text: "Choose a journey", href: "/runner-sign-in-v2/choose-journey" },
        { text: "All pages", href: urls.allPages || "/runner-sign-in-v2/all-pages" },
        { text: "All pages (static)", href: urls.allPagesStatic || "/runner-sign-in-v2/all-pages/static" },
        { text: "Journeys", href: "/runner-sign-in-v2/journeys" },
        { text: "Journey flowcharts", href: "/runner-sign-in-v2/journey-flowcharts" },
        { text: "Unexpected journeys", href: "/runner-sign-in-v2/unexpected-journeys" },
        { text: "Validation error messages", href: urls.errorMessages || "/runner-sign-in-v2/error-messages" },
      ],
    },
    {
      heading: "Form designer (advanced settings)",
      links: [
        { text: "Advanced settings", href: urls.formEditorAdvancedSettings },
        {
          text: "Advanced settings — static pages",
          href: "/titan-mvp-1.2/form-editor/advanced-settings/static",
        },
        { text: "Check before submission", href: urls.formEditorCheckBeforeSubmission },
        { text: "Reuse previous answers", href: urls.formEditorReusePreviousAnswers },
        {
          text: "Reuse previous answers — no selected (static)",
          href: `${STATIC_BASE}/reuse-previous-answers/no-selected`,
        },
        {
          text: "Reuse previous answers — yes selected (static)",
          href: `${STATIC_BASE}/reuse-previous-answers/yes-selected`,
        },
        {
          text: "Advanced settings overview — reuse off (static)",
          href: `${STATIC_BASE}/reuse-previous-answers-off`,
        },
        {
          text: "Advanced settings overview — reuse on (static)",
          href: `${STATIC_BASE}/reuse-previous-answers-on`,
        },
        {
          text: "Email actions (live)",
          href: urls.formEditorConditionalMailboxRouting,
        },
        {
          text: "Email actions — static pages",
          href: "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static",
        },
      ],
    },
    {
      heading: "Form",
      links: [
        { text: "Form start page", href: urls.formStartPage },
        { text: "Sign in to use this form", href: urls.whySignIn },
        { text: "Manage your form", href: urls.manage },
        { text: "Ready to submit", href: urls.readyToSubmit },
        { text: "Form submitted", href: urls.formSubmitted },
        { text: "Form submitted confirmation email", href: urls.emailFormSubmitted },
        { text: "Start a new application", href: urls.startNewForm },
        { text: "Manage your form (checked example)", href: urls.staticManageFormChecked },
      ],
    },
    {
      heading: "Copy a previous submission",
      links: [
        { text: "Advanced settings", href: urls.formEditorAdvancedSettings },
        { text: "Reuse previous answers", href: urls.formEditorReusePreviousAnswers },
        {
          text: "Reuse previous answers — no selected (static)",
          href: `${STATIC_BASE}/reuse-previous-answers/no-selected`,
        },
        {
          text: "Reuse previous answers — yes selected (static)",
          href: `${STATIC_BASE}/reuse-previous-answers/yes-selected`,
        },
        {
          text: "Advanced settings overview — reuse off (static)",
          href: `${STATIC_BASE}/reuse-previous-answers-off`,
        },
        {
          text: "Advanced settings overview — reuse on (static)",
          href: `${STATIC_BASE}/reuse-previous-answers-on`,
        },
        { text: "Manage your form (submitted example)", href: copyManageUrl },
        {
          text: "Copy answers confirmation",
          href: `/runner-sign-in/applications/${enc(copyApplicationId)}/clone`,
        },
        {
          text: "Check answers (copied)",
          href: `/runner-sign-in/forms/${enc(copyFormKey)}/${enc(copyDraftId)}/check-answers?copied=1`,
        },
        {
          text: "Your previous submission (new or changed questions)",
          href: `/runner-sign-in/intervention-copied?formKey=${enc(copyFormKey)}&applicationId=${enc(copyDeclarationRequiredId)}&step=declaration`,
        },
        { text: "Your details (copied form)", href: copyFormStep("details") },
        { text: "Volunteer role (copied form)", href: copyFormStep("role") },
        { text: "Declaration (copied form)", href: copyFormStep("declaration") },
        {
          text: "Declaration (answer again)",
          href: copyFormStep("declaration", copyDeclarationRequiredId),
        },
        {
          text: "Ready to submit (copied form)",
          href: `/runner-sign-in-v2/forms/${enc(copyFormKey)}/${enc(copyDraftId)}/ready-to-submit`,
        },
        {
          text: "Manage your form (after copy)",
          href: `/runner-sign-in-v2/forms/${enc(copyFormKey)}/${enc(copyDraftId)}/manage?cloned=1`,
        },
        {
          text: "Form submitted",
          href: `/runner-sign-in-v2/forms/${enc(copyFormKey)}/${enc(copyApplicationId)}/submitted`,
        },
        {
          text: "Form submitted confirmation email (copied answers)",
          href: copyEmailTriple("/runner-sign-in-v2/emails/form-submitted"),
        },
        {
          text: "Form submitted email – public view (copied answers)",
          href: copyEmailTriple("/runner-sign-in-v2/emails/form-submitted/public"),
        },
      ],
    },
    {
      heading: "Create a sign-in",
      links: [
        { text: "Enter your email address", href: urls.createEmail },
        { text: "Check your email", href: urls.createCheckEmail },
        { text: "Get security code", href: urls.createGetCode },
        { text: "Enter your mobile phone number", href: urls.createMobile },
        { text: "Your sign-in has been created", href: triple("/runner-sign-in-v2/create-sign-in/created", urls.manage) },
      ],
    },
    {
      heading: "Sign in",
      links: [
        { text: "Enter your email address", href: urls.signInEmail },
        { text: "Check your email", href: urls.signInCheckEmail },
        { text: "Get security code", href: triple("/runner-sign-in-v2/sign-in/get-security-code", urls.manage) },
        { text: "You have signed out", href: urls.signOut },
      ],
    },
    {
      heading: "Recover a sign-in",
      links: [
        { text: "Enter your mobile phone number", href: urls.recoverPhone },
        {
          text: "No sign-in found for mobile phone number",
          href: urls.staticRecoverNoSignInForMobile,
        },
        { text: "Get security code", href: urls.recoverGetCode },
        { text: "Check your phone", href: urls.recoverStart },
        { text: "Check your phone (alternate)", href: triple("/runner-sign-in-v2/recover/check-mobile") },
        { text: "Enter your new email address", href: urls.recoverNewEmail },
        { text: "Check your email", href: urls.recoverCheckNewEmail },
      ],
    },
    {
      heading: "Save and exit (signed in)",
      links: [
        { text: "Confirm email to save and exit", href: urls.saveExitConfirmEmail },
        { text: "We've emailed you a link to continue your form later", href: urls.saveExitWithSignInLeave },
        { text: "Save and exit email", href: urls.emailSaveExitWithSignIn || urls.emailSaveExit },
        { text: "Welcome back (from email)", href: urls.saveExitWithSignInResume },
        { text: "Sign in from email link", href: urls.signInEmail },
      ],
    },
    {
      heading: "Save and exit (without signing in)",
      links: [
        { text: "Sign in to save your progress", href: urls.saveExitChoose },
        { text: "Create a sign-in", href: urls.saveExitCreate },
        { text: "Check your email", href: urls.saveExitWithoutSignInCheckEmail },
        { text: "Your progress has been saved", href: urls.saveExitCreated || "/runner-sign-in-v2/journeys/preview/save-exit-progress-saved" },
        { text: "We've emailed you a link to continue your form later", href: urls.saveExitLeave },
        { text: "Save and exit email", href: urls.emailSaveExitWithoutSignIn || `${urls.emailSaveExit}&variant=without-sign-in` },
        { text: "Welcome back (from email)", href: urls.saveExitWithoutSignInResume },
        { text: "Delete draft confirmation", href: urls.deleteDraft },
      ],
    },
    {
      heading: "Security",
      links: [
        { text: "Security", href: urls.security },
        { text: "Change email: get security code (phone)", href: urls.changeEmailGetCode },
        { text: "Change email: check your phone", href: urls.changeEmailCheckPhone },
        { text: "Change email: enter new email address", href: urls.changeEmailNewEmail },
        {
          text: "Change email: enter new email address (same as current error)",
          href: urls.staticChangeEmailNewEmailSameAsCurrent,
        },
        { text: "Change email: check your email", href: urls.changeEmailCheckNewEmail },
        { text: "Change mobile phone number: get security code (email)", href: urls.changePhoneGetCode },
        { text: "Change mobile phone number: check your email", href: urls.changePhoneCheckEmail },
        { text: "Change mobile phone number: enter new mobile phone number", href: urls.changePhoneNewPhone },
      ],
    },
    {
      heading: "Checker",
      links: [
        { text: "Check your answers", href: urls.applicantCheckAnswers },
        {
          text: "Check your answers (optional check)",
          href: "/runner-sign-in-v2/journeys/preview/applicant-check-answers-optional",
        },
        { text: "Invite a checker", href: urls.checkerInvite },
        {
          text: "Checker invite sent",
          href: `/runner-sign-in-v2/forms/${enc(SEED.readyToInvite.formKey)}/${enc(SEED.readyToInvite.applicationId)}/checker/invite-sent?checkerEmail=checker@example.com`,
        },
        { text: "Checker invite email", href: urls.emailCheckerInvite },
        { text: "Checker landing page", href: checker("start") },
        { text: "Sign in to check answers", href: urls.checkerWhySignIn },
        { text: "Check your email", href: checker("check-email") },
        { text: "Check answers", href: checker("check-answers") },
        {
          text: "View form page (organisation)",
          href: `/runner-sign-in-v2/checker/view/organisation?token=${enc(reviewToken)}&prototype=1&allowApplicant=1`,
        },
        { text: "Change answers", href: checker("change-answers") },
        { text: "Check complete", href: checker("complete/success") },
        { text: "Applicant notified email", href: urls.emailApplicantFormChecked },
      ],
    },
    {
      heading: "Emails",
      links: [
        { text: "Save and exit email (signed in)", href: urls.emailSaveExitWithSignIn || urls.emailSaveExit },
        { text: "Save and exit email (without sign-in)", href: urls.emailSaveExitWithoutSignIn || `${urls.emailSaveExit}&variant=without-sign-in` },
        { text: "Security code email", href: `/runner-sign-in-v2/emails/email-confirmation-code?${q}` },
        { text: "Sign-in created email", href: `/runner-sign-in-v2/emails/one-login-created?${q}&email=you@example.com` },
        { text: "Checker invite email", href: urls.emailCheckerInvite },
        { text: "Applicant form checked email", href: urls.emailApplicantFormChecked },
        { text: "Form submitted email (copied answers)", href: urls.emailFormSubmitted },
        { text: "Form submitted email – public view (copied answers)", href: urls.emailFormSubmittedPublic },
        { text: "Form submitted email – public view (checked)", href: urls.emailFormSubmittedCheckedPublic },
        { text: "Form submitted email – processing team (checked)", href: urls.emailFormSubmittedCheckedTeam },
      ],
    },
    {
      heading: "Text messages",
      links: [
        { text: "Security code text (recover sign-in)", href: urls.textRecoverSecurityCode },
        { text: "Security code text (change email address)", href: urls.textChangeEmailSecurityCode },
      ],
    },
    {
      heading: "Unexpected journeys",
      links: unexpectedPages.map((page) => ({
        text: page.title,
        href: page.href,
      })),
    },
  ];
}

function buildRunnerSignInV2AllPagesStaticSections(urls, { unexpectedPages }) {
  const p = urls.preview || {};
  const preview = (slug) => `/runner-sign-in-v2/journeys/preview/${encodeURIComponent(slug)}`;
  const mailboxStatic = "/titan-mvp-1.2/form-editor/advanced-settings/conditional-mailbox-routing/static";

  return [
    {
      heading: "Prototype",
      links: [
        { text: "Start page", href: "/runner-sign-in-v2/start-page" },
        { text: "Choose a journey", href: "/runner-sign-in-v2/choose-journey" },
        { text: "All pages (live links)", href: urls.allPages || "/runner-sign-in-v2/all-pages" },
        { text: "Journeys", href: "/runner-sign-in-v2/journeys" },
        { text: "Journey flowcharts", href: "/runner-sign-in-v2/journey-flowcharts" },
        { text: "Unexpected journeys", href: "/runner-sign-in-v2/unexpected-journeys" },
        { text: "Validation error messages", href: urls.errorMessages || "/runner-sign-in-v2/error-messages" },
      ],
    },
    {
      heading: "Form designer (advanced settings)",
      links: [
        { text: "Advanced settings", href: STATIC_BASE },
        { text: "Check before submission", href: `${STATIC_BASE}/check-before-submission/yes-with-description` },
        { text: "Reuse previous answers", href: `${STATIC_BASE}/reuse-previous-answers/yes-selected` },
        {
          text: "Reuse previous answers — no selected",
          href: `${STATIC_BASE}/reuse-previous-answers/no-selected`,
        },
        {
          text: "Reuse previous answers — yes selected",
          href: `${STATIC_BASE}/reuse-previous-answers/yes-selected`,
        },
        {
          text: "Advanced settings overview — reuse off",
          href: `${STATIC_BASE}/reuse-previous-answers-off`,
        },
        {
          text: "Advanced settings overview — reuse on",
          href: `${STATIC_BASE}/reuse-previous-answers-on`,
        },
        { text: "Email actions", href: mailboxStatic },
      ],
    },
    {
      heading: "Form",
      links: [
        { text: "Form start page", href: preview("form-start-page") },
        { text: "Sign in to use this form", href: p.whySignIn },
        { text: "Manage your form", href: p.manage },
        { text: "Ready to submit", href: p.readyToSubmit },
        { text: "Form submitted", href: preview("form-submitted") },
        { text: "Form submitted confirmation email", href: p.emailFormSubmitted },
        { text: "Start a new application", href: preview("form-start-page") },
        { text: "Manage your form (checked example)", href: urls.staticManageFormChecked },
      ],
    },
    {
      heading: "Copy a previous submission",
      links: [
        { text: "Advanced settings", href: STATIC_BASE },
        { text: "Reuse previous answers", href: `${STATIC_BASE}/reuse-previous-answers/yes-selected` },
        {
          text: "Reuse previous answers — no selected",
          href: `${STATIC_BASE}/reuse-previous-answers/no-selected`,
        },
        {
          text: "Reuse previous answers — yes selected",
          href: `${STATIC_BASE}/reuse-previous-answers/yes-selected`,
        },
        {
          text: "Advanced settings overview — reuse off",
          href: `${STATIC_BASE}/reuse-previous-answers-off`,
        },
        {
          text: "Advanced settings overview — reuse on",
          href: `${STATIC_BASE}/reuse-previous-answers-on`,
        },
        { text: "Manage your form (submitted example)", href: preview("manage-submitted") },
        { text: "Copy answers confirmation", href: preview("copy-clone") },
        { text: "Check answers (copied)", href: preview("copy-check-answers") },
        {
          text: "Your previous submission (new or changed questions)",
          href: preview("copy-intervention"),
        },
        { text: "Your details (copied form)", href: preview("copy-form-step-details") },
        { text: "Volunteer role (copied form)", href: preview("copy-form-step-role") },
        { text: "Declaration (copied form)", href: preview("copy-form-step-declaration") },
        {
          text: "Declaration (answer again)",
          href: preview("copy-form-step-declaration-answer-again"),
        },
        { text: "Ready to submit (copied form)", href: p.readyToSubmit },
        { text: "Manage your form (after copy)", href: p.manage },
        { text: "Form submitted", href: preview("form-submitted") },
        { text: "Form submitted confirmation email (copied answers)", href: p.emailFormSubmitted },
        {
          text: "Form submitted email – public view (copied answers)",
          href: p.emailFormSubmittedPublic,
        },
      ],
    },
    {
      heading: "Create a sign-in",
      links: [
        { text: "Enter your email address", href: p.createEmail },
        { text: "Check your email", href: p.createCheckEmail },
        { text: "Get security code", href: p.createGetCode },
        { text: "Enter your mobile phone number", href: p.createMobile },
        { text: "Your sign-in has been created", href: preview("create-sign-in-created") },
      ],
    },
    {
      heading: "Sign in",
      links: [
        { text: "Enter your email address", href: p.signInEmail },
        { text: "Check your email", href: p.signInCheckEmail },
        { text: "Get security code", href: preview("sign-in-get-security-code") },
        { text: "You have signed out", href: preview("sign-out") },
      ],
    },
    {
      heading: "Recover a sign-in",
      links: [
        { text: "Enter your mobile phone number", href: p.recoverPhone },
        {
          text: "No sign-in found for mobile phone number",
          href: urls.staticRecoverNoSignInForMobile,
        },
        { text: "Get security code", href: p.recoverGetCode },
        { text: "Check your phone", href: p.recoverStart },
        { text: "Check your phone (alternate)", href: preview("recover-check-mobile") },
        { text: "Enter your new email address", href: p.recoverNewEmail },
        { text: "Check your email", href: p.recoverCheckNewEmail },
      ],
    },
    {
      heading: "Save and exit (signed in)",
      links: [
        { text: "Confirm email to save and exit", href: p.saveExitConfirmEmail },
        { text: "We've emailed you a link to continue your form later", href: preview("save-exit-with-sign-in-leave") },
        { text: "Save and exit email", href: preview("email-save-exit-with-sign-in") },
        { text: "Welcome back (from email)", href: p.saveExitResumeWithSignIn },
        { text: "Sign in from email link", href: p.signInEmail },
      ],
    },
    {
      heading: "Save and exit (without signing in)",
      links: [
        { text: "Sign in to save your progress", href: p.saveExitChoose },
        { text: "Create a sign-in", href: p.saveExitCreate },
        { text: "Check your email", href: p.saveExitCheckEmail },
        { text: "Your progress has been saved", href: p.saveExitProgressSaved },
        { text: "We've emailed you a link to continue your form later", href: preview("save-exit-without-sign-in-leave") },
        { text: "Save and exit email", href: preview("email-save-exit-without-sign-in") },
        { text: "Welcome back (from email)", href: p.saveExitResumeWithoutSignIn },
        { text: "Delete draft confirmation", href: p.deleteDraft },
      ],
    },
    {
      heading: "Security",
      links: [
        { text: "Security", href: p.security },
        { text: "Change email: get security code (phone)", href: p.changeEmailGetCode },
        { text: "Change email: check your phone", href: p.changeEmailCheckPhone },
        { text: "Change email: enter new email address", href: p.changeEmailNewEmail },
        {
          text: "Change email: enter new email address (same as current error)",
          href: urls.staticChangeEmailNewEmailSameAsCurrent,
        },
        { text: "Change email: check your email", href: p.changeEmailCheckNewEmail },
        { text: "Change mobile phone number: get security code (email)", href: p.changePhoneGetCode },
        { text: "Change mobile phone number: check your email", href: p.changePhoneCheckEmail },
        { text: "Change mobile phone number: enter new mobile phone number", href: p.changePhoneNewPhone },
      ],
    },
    {
      heading: "Checker",
      links: [
        { text: "Check your answers", href: p.applicantCheckAnswers },
        { text: "Check your answers (optional check)", href: preview("applicant-check-answers-optional") },
        { text: "Invite a checker", href: p.checkerInvite },
        { text: "Checker invite sent", href: preview("checker-invite-sent") },
        { text: "Checker invite email", href: p.emailCheckerInvite },
        { text: "Checker landing page", href: preview("checker-landing") },
        { text: "Sign in to check answers", href: p.checkerWhySignIn },
        { text: "Check your email", href: preview("checker-check-email") },
        { text: "Check answers", href: preview("checker-check-answers") },
        { text: "View form page (organisation)", href: preview("checker-view-organisation") },
        { text: "Change answers", href: preview("checker-change-answers") },
        { text: "Check complete", href: preview("checker-complete") },
        { text: "Applicant notified email", href: preview("email-applicant-form-checked") },
      ],
    },
    {
      heading: "Emails",
      links: [
        { text: "Save and exit email (signed in)", href: preview("email-save-exit-with-sign-in") },
        { text: "Save and exit email (without sign-in)", href: preview("email-save-exit-without-sign-in") },
        { text: "Security code email", href: p.emailConfirmation },
        { text: "Sign-in created email", href: preview("email-one-login-created") },
        { text: "Checker invite email", href: p.emailCheckerInvite },
        { text: "Applicant form checked email", href: preview("email-applicant-form-checked") },
        { text: "Form submitted email (copied answers)", href: p.emailFormSubmitted },
        { text: "Form submitted email – public view (copied answers)", href: p.emailFormSubmittedPublic },
        { text: "Form submitted email – public view (checked)", href: p.emailFormSubmittedCheckedPublic },
        { text: "Form submitted email – processing team (checked)", href: p.emailFormSubmittedCheckedTeam },
      ],
    },
    {
      heading: "Text messages",
      links: [
        { text: "Security code text (recover sign-in)", href: urls.textRecoverSecurityCode },
        { text: "Security code text (change email address)", href: urls.textChangeEmailSecurityCode },
      ],
    },
    {
      heading: "Unexpected journeys",
      links: unexpectedPages.map((page) => ({
        text: page.title,
        href: page.href,
      })),
    },
  ];
}

module.exports = {
  buildRunnerSignInV2AllPagesSections,
  buildRunnerSignInV2AllPagesStaticSections,
};
