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

  return [
    {
      heading: "Prototype",
      links: [
        { text: "Start page", href: "/runner-sign-in-v2/start-page" },
        { text: "All pages", href: urls.allPages || "/runner-sign-in-v2/all-pages" },
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
        { text: "Check before submission", href: urls.formEditorCheckBeforeSubmission },
        { text: "Reuse previous answers", href: urls.formEditorReusePreviousAnswers },
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
        { text: "We've emailed you a link to come back", href: urls.saveExitWithSignInLeave },
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
        { text: "We've emailed you a link to resume", href: urls.saveExitLeave },
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
        { text: "Change email: check your email", href: urls.changeEmailCheckNewEmail },
        { text: "Change phone: get security code (email)", href: urls.changePhoneGetCode },
        { text: "Change phone: check your email", href: urls.changePhoneCheckEmail },
        { text: "Change phone: enter new phone number", href: urls.changePhoneNewPhone },
      ],
    },
    {
      heading: "Checker",
      links: [
        { text: "Invite a checker", href: urls.checkerInvite },
        { text: "Checker invite sent", href: `${urls.checkerInvite}/invite-sent?checkerEmail=checker@example.com` },
        { text: "Checker invite email", href: urls.emailCheckerInvite },
        { text: "Checker landing page", href: checker("start") },
        { text: "Sign in to check answers", href: urls.checkerWhySignIn },
        { text: "Check your email", href: checker("check-email") },
        { text: "Check answers", href: checker("check-answers") },
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

module.exports = { buildRunnerSignInV2AllPagesSections };
