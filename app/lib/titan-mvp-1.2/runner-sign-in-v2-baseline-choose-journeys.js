const SEED = {
  notStarted: { formKey: "change-contact-details", applicationId: "app-1721152526402" },
  inProgress: { formKey: "report-local-issue", applicationId: "app-1721152526404", step: "when" },
  inProgressRefund: { formKey: "request-refund", applicationId: "app-1721152526405", step: "bank-details" },
  awaitingCheck: { formKey: "apply-small-grant", applicationId: "app-1721152526407" },
  readyToInvite: { formKey: "apply-small-grant", applicationId: "app-checker-ready-to-invite" },
  submittedCopy: { formKey: "volunteer-application", applicationId: "app-1721152526408" },
  copyDraft: { formKey: "volunteer-application", applicationId: "app-copy-volunteer-draft" },
  copyDeclarationRequired: { formKey: "volunteer-application", applicationId: "app-copy-volunteer-declaration" },
};

// Must match RUNNER_SIGN_IN_V2_PROTOTYPE_KNOWN_RECOVER_PHONE in routes.js (07700900000).
const PROTOTYPE_RECOVER_PHONE_DISPLAY = "07700 900 000";
const PROTOTYPE_UNKNOWN_RECOVER_PHONE_DISPLAY = "07123 456789";

function runnerSignInV2BaselineChooseJourneyRadioItems(selected) {
  const items = [
    {
      value: "create",
      text: "Create a sign-in",
      hint: {
        text: "Users create a sign-in with email verification and a mobile phone number for recovery, then continue to manage their form.",
      },
      checked: selected === "create",
    },
    {
      value: "signin",
      text: "Sign in",
      hint: {
        text: "Users sign in with the email address they used when they created their sign-in. We send a security code to their email.",
      },
      checked: selected === "signin",
    },
    {
      value: "credential-recovery",
      text: "Credential recovery",
      hint: {
        text: "Users who have forgotten their email address enter their mobile phone number, verify with a security code, then set a new email address. In this prototype, use 07700 900 000.",
      },
      checked: selected === "credential-recovery",
    },
    {
      value: "credential-recovery-not-found",
      text: "Credential recovery – mobile phone number not linked to sign-in",
      hint: {
        text: "Users enter a mobile phone number that is not linked to a sign-in for this form and are told to create a sign-in instead.",
      },
      checked: selected === "credential-recovery-not-found",
    },
    {
      value: "save-exit-signed-in",
      text: "Save and exit (signed in)",
      hint: {
        text: "Users who are signed in choose Save and exit while filling in a form. We email them a link to return to their form.",
      },
      checked: selected === "save-exit-signed-in",
    },
    {
      value: "save-exit-unsigned",
      text: "Save and exit (without signing in first)",
      hint: {
        text: "Users fill in a form without signing in, then create a sign-in when they choose Save and exit. They sign in later using the link in their email.",
      },
      checked: selected === "save-exit-unsigned",
    },
    {
      value: "update-email-phone",
      text: "Update email and phone number",
      hint: {
        text: "Signed-in users change their email address or mobile phone number from the Security page. Each change is verified with a security code.",
      },
      checked: selected === "update-email-phone",
    },
    {
      value: "delete-account",
      text: "Delete account",
      hint: {
        text: "Signed-in users permanently delete their sign-in after verifying their email address with a security code.",
      },
      checked: selected === "delete-account",
    },
    {
      value: "checker",
      text: "Get someone to check your answers",
      hint: {
        text: "An applicant invites someone to check their answers. The checker signs in with email and a security code, reviews the form, and submits their check.",
      },
      checked: selected === "checker",
    },
    {
      value: "manage",
      text: "Manage your form",
      hint: {
        text: "After signing in, users manage their form from the Forms page — continuing, checking status, or submitting.",
      },
      checked: selected === "manage",
    },
    {
      value: "copy-submission",
      text: "Copy a form I’ve submitted previously",
      hint: {
        text: "Users copy answers from a previous submission, complete the form again, and receive a confirmation email that notes answers were copied.",
      },
      checked: selected === "copy-submission",
    },
    { divider: "or" },
    {
      value: "prototype-hub",
      text: "Explore the prototype hub",
      hint: {
        text: "Open the runner sign-in v2 baseline start page with seeded examples, prototype mode, and links to documentation.",
      },
      checked: selected === "prototype-hub",
    },
  ];

  return items;
}

function runnerSignInV2BaselineChooseJourneyRedirect(
  journeyId,
  { demoFormKey, demoApplicationId, managePath, securityPath, deleteSignInCheckEmailPath, formStepPath }
) {
  const enc = encodeURIComponent;
  const triple = (path, formKey, applicationId, next) => {
    let url = `${path}?formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`;
    if (next) url += `&next=${enc(next)}`;
    return url;
  };
  const formStart = (formKey, applicationId) =>
    `/runner-sign-in-v2-baseline/forms/${enc(formKey)}/${enc(applicationId)}/start-page`;

  switch (journeyId) {
    case "create":
      return formStart(SEED.notStarted.formKey, SEED.notStarted.applicationId);
    case "signin":
      return formStart(SEED.inProgress.formKey, SEED.inProgress.applicationId);
    case "credential-recovery-not-found":
      return "/runner-sign-in-v2-baseline/static/recover-no-sign-in-for-mobile";
    case "credential-recovery":
      return triple(
        "/runner-sign-in-v2-baseline/recover/phone",
        SEED.inProgress.formKey,
        SEED.inProgress.applicationId,
        managePath(SEED.inProgress.formKey, SEED.inProgress.applicationId)
      );
    case "recover":
      return triple(
        "/runner-sign-in-v2-baseline/sign-in/email",
        SEED.inProgress.formKey,
        SEED.inProgress.applicationId,
        managePath(SEED.inProgress.formKey, SEED.inProgress.applicationId)
      );
    case "save-exit-signed-in":
      return formStepPath(SEED.inProgressRefund.formKey, SEED.inProgressRefund.applicationId, SEED.inProgressRefund.step);
    case "save-exit-unsigned":
      return "/runner-sign-in-v2-baseline/demo/save-and-exit/start-page";
    case "update-email-phone":
    case "security":
      return securityPath(demoFormKey, demoApplicationId);
    case "delete-account":
      return deleteSignInCheckEmailPath(demoFormKey, demoApplicationId);
    case "checker":
      return managePath(SEED.awaitingCheck.formKey, SEED.awaitingCheck.applicationId);
    case "manage":
      return managePath(SEED.inProgress.formKey, SEED.inProgress.applicationId);
    case "copy-submission":
      return managePath(SEED.submittedCopy.formKey, SEED.submittedCopy.applicationId);
    case "prototype-hub":
      return "/runner-sign-in-v2-baseline/start-page";
    default:
      return null;
  }
}

function runnerSignInV2BaselinePrepareChooseJourneySession(req, journeyId, helpers) {
  const { clearAuth, signIn, prepareSaveAndExitDemo, setFocus, seedRecoverPhone, seedRecoverPhoneNotFound } = helpers;

  switch (journeyId) {
    case "create":
    case "signin":
    case "recover":
    case "save-exit-unsigned":
      clearAuth();
      if (journeyId === "save-exit-unsigned") {
        prepareSaveAndExitDemo();
      }
      return;
    case "credential-recovery":
      clearAuth();
      seedRecoverPhone(PROTOTYPE_RECOVER_PHONE_DISPLAY);
      return;
    case "credential-recovery-not-found":
      clearAuth();
      seedRecoverPhoneNotFound(PROTOTYPE_UNKNOWN_RECOVER_PHONE_DISPLAY);
      return;
    case "save-exit-signed-in":
      signIn();
      setFocus(SEED.inProgressRefund.formKey, SEED.inProgressRefund.applicationId);
      return;
    case "update-email-phone":
    case "security":
    case "delete-account":
      signIn();
      setFocus(helpers.demoFormKey, helpers.demoApplicationId);
      return;
    case "checker":
      signIn();
      setFocus(SEED.awaitingCheck.formKey, SEED.awaitingCheck.applicationId);
      return;
    case "manage":
      signIn();
      setFocus(SEED.inProgress.formKey, SEED.inProgress.applicationId);
      return;
    case "copy-submission":
      signIn();
      setFocus(SEED.submittedCopy.formKey, SEED.submittedCopy.applicationId);
      return;
    case "prototype-hub":
    default:
      return;
  }
}

module.exports = {
  SEED,
  PROTOTYPE_RECOVER_PHONE_DISPLAY,
  runnerSignInV2BaselineChooseJourneyRadioItems,
  runnerSignInV2BaselineChooseJourneyRedirect,
  runnerSignInV2BaselinePrepareChooseJourneySession,
};
