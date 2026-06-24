function runnerSignInV2BuildJourneyUrls({
  formKey,
  applicationId,
  staticCheckedReviewToken,
  journeyPreviewPath,
}) {
  const enc = (value) => encodeURIComponent(value);
  const manageUrl = `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/manage`;
  const securityUrl = `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/security`;
  const triple = (path, next) => {
    let url = `${path}?formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`;
    if (next) url += `&next=${enc(next)}`;
    return url;
  };
  const checkerStartPath = `/runner-sign-in-v2/checker/why-sign-in?token=${enc(staticCheckedReviewToken)}&prototype=1&allowApplicant=1`;
  const saveExitLeaveUrl = `/runner-sign-in-v2/save-and-exit/without-sign-in/leave?formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`;
  const queryOnly = `formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`;

  return {
    formStartPage: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/start-page`,
    whySignIn: triple("/runner-sign-in-v2/why-sign-in", manageUrl),
    createEmail: triple("/runner-sign-in-v2/create-sign-in/email", manageUrl),
    createCheckEmail: triple("/runner-sign-in-v2/create-sign-in/check-email", manageUrl),
    createMobile: triple("/runner-sign-in-v2/create-sign-in/mobile", manageUrl),
    createGetCode: triple("/runner-sign-in-v2/create-sign-in/get-security-code", manageUrl),
    signInEmail: triple("/runner-sign-in-v2/sign-in/email", manageUrl),
    signInCheckEmail: triple("/runner-sign-in-v2/sign-in/check-email", manageUrl),
    recoverPhone: triple("/runner-sign-in-v2/recover/phone", manageUrl),
    recoverGetCode: triple("/runner-sign-in-v2/recover/get-security-code", manageUrl),
    recoverStart: triple("/runner-sign-in-v2/recover/start", manageUrl),
    recoverNewEmail: triple("/runner-sign-in-v2/recover/new-email", manageUrl),
    recoverCheckNewEmail: triple("/runner-sign-in-v2/recover/check-new-email", manageUrl),
    manage: manageUrl,
    security: securityUrl,
    changeEmailGetCode: `${securityUrl}/change-email/get-security-code`,
    changeEmailCheckPhone: `${securityUrl}/change-email/check-phone`,
    changeEmailNewEmail: `${securityUrl}/change-email/new-email`,
    changeEmailCheckNewEmail: `${securityUrl}/change-email/check-new-email`,
    changePhoneGetCode: `${securityUrl}/change-phone/get-security-code`,
    changePhoneCheckEmail: `${securityUrl}/change-phone/check-email`,
    changePhoneNewPhone: `${securityUrl}/change-phone/new-phone`,
    saveExitChoose: triple("/runner-sign-in-v2/save-and-exit/without-sign-in/choose", manageUrl),
    saveExitCreate: triple("/runner-sign-in-v2/save-and-exit/without-sign-in/create-sign-in", manageUrl),
    saveExitConfirmEmail: triple("/runner-sign-in-v2/save-and-exit/with-sign-in/confirm-email", manageUrl),
    saveExitLeave: saveExitLeaveUrl,
    saveExitWithSignInLeave: `/runner-sign-in-v2/save-and-exit/with-sign-in/leave?${queryOnly}&email=you@example.com`,
    saveExitWithSignInResume: `/runner-sign-in-v2/save-and-exit/with-sign-in/resume?${queryOnly}`,
    saveExitWithoutSignInResume: `/runner-sign-in-v2/save-and-exit/without-sign-in/resume?${queryOnly}`,
    saveExitWithoutSignInCheckEmail: `/runner-sign-in-v2/save-and-exit/without-sign-in/check-email?${queryOnly}&prototype=1`,
    saveExitCreated: triple("/runner-sign-in-v2/create-sign-in/created", saveExitLeaveUrl),
    createCheckEmailSaveExit: triple("/runner-sign-in-v2/create-sign-in/check-email", saveExitLeaveUrl),
    createMobileSaveExit: triple("/runner-sign-in-v2/create-sign-in/mobile", saveExitLeaveUrl),
    createGetCodeSaveExit: triple("/runner-sign-in-v2/create-sign-in/get-security-code", saveExitLeaveUrl),
    createCheckEmailSaveExitResend: `${triple("/runner-sign-in-v2/create-sign-in/check-email", saveExitLeaveUrl)}&resend=1`,
    emailSaveExitWithoutSignIn: `${triple("/runner-sign-in-v2/emails/save-and-exit", manageUrl)}&variant=without-sign-in`,
    emailSaveExitWithSignIn: `${triple("/runner-sign-in-v2/emails/save-and-exit", manageUrl)}&variant=with-sign-in`,
    signOut: "/runner-sign-in-v2/sign-out",
    formSubmitted: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/submitted`,
    startNewForm: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/start-new`,
    deleteDraft: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/delete`,
    errorMessages: "/runner-sign-in-v2/error-messages",
    allPages: "/runner-sign-in-v2/all-pages",
    formEditorAdvancedSettings: "/titan-mvp-1.2/form-editor/advanced-settings",
    formEditorCheckBeforeSubmission: "/titan-mvp-1.2/form-editor/advanced-settings/check-before-submission",
    formEditorReusePreviousAnswers: "/titan-mvp-1.2/form-editor/advanced-settings/reuse-previous-answers",
    readyToSubmit: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/ready-to-submit`,
    checkerInvite: `/runner-sign-in-v2/forms/${enc(formKey)}/${enc(applicationId)}/checker/invite`,
    checkerWhySignIn: `/runner-sign-in-v2/checker/why-sign-in?token=${enc(staticCheckedReviewToken)}`,
    checkerStart: checkerStartPath,
    emailSaveExit: triple("/runner-sign-in-v2/emails/save-and-exit", manageUrl),
    emailCheckerInvite: triple("/runner-sign-in-v2/emails/checker-invite-v2", manageUrl),
    emailApplicantFormChecked: `/runner-sign-in-v2/emails/applicant-form-checked?formKey=${enc(formKey)}&applicationId=${enc(applicationId)}`,
    emailFormSubmitted: triple("/runner-sign-in-v2/emails/form-submitted", manageUrl),
    textRecoverSecurityCode: "/runner-sign-in-v2/texts/recover-security-code",
    textChangeEmailSecurityCode: "/runner-sign-in-v2/texts/change-email-security-code",
    staticManageFormChecked: "/runner-sign-in-v2/static/manage-form-checked",
    staticChangeEmailNewEmailSameAsCurrent:
      "/runner-sign-in-v2/static/change-email-new-email-same-as-current",
    staticChangeEmailUsedOnOtherAccount:
      "/runner-sign-in-v2/static/change-email-new-email-used-on-other-account",
    staticChangePhoneSameAsCurrent: "/runner-sign-in-v2/static/change-phone-same-as-current",
    staticChangePhoneUsedOnOtherAccount: "/runner-sign-in-v2/static/change-phone-used-on-other-account",
    staticRecoverNoSignInForMobile: "/runner-sign-in-v2/static/recover-no-sign-in-for-mobile",
    unexpected: {
      "email-already-has-sign-in": "/runner-sign-in-v2/unexpected-journeys/email-already-has-sign-in",
      "no-sign-in-found": "/runner-sign-in-v2/unexpected-journeys/no-sign-in-found",
      "security-code-expired": "/runner-sign-in-v2/unexpected-journeys/security-code-expired",
      "wrong-security-code-too-many-times": "/runner-sign-in-v2/unexpected-journeys/wrong-security-code-too-many-times",
      "wrong-security-code-locked-out": "/runner-sign-in-v2/unexpected-journeys/wrong-security-code-locked-out",
      "too-many-security-codes": "/runner-sign-in-v2/unexpected-journeys/too-many-security-codes",
      "cannot-recover-online": "/runner-sign-in-v2/unexpected-journeys/cannot-recover-online",
      "no-sign-in-found-for-mobile": "/runner-sign-in-v2/static/recover-no-sign-in-for-mobile",
      "save-link-expired": "/runner-sign-in-v2/unexpected-journeys/save-link-expired",
      "review-link-expired": "/runner-sign-in-v2/unexpected-journeys/review-link-expired",
      "service-unavailable": "/runner-sign-in-v2/unexpected-journeys/service-unavailable",
      "page-not-found": "/runner-sign-in-v2/unexpected-journeys/page-not-found",
      "problem-with-service": "/runner-sign-in-v2/unexpected-journeys/problem-with-service",
    },
    preview: journeyPreviewPath
      ? {
          createEmail: journeyPreviewPath("create-sign-in-email"),
          createCheckEmail: journeyPreviewPath("create-sign-in-check-email"),
          createMobile: journeyPreviewPath("create-sign-in-mobile"),
          createGetCode: journeyPreviewPath("create-sign-in-get-security-code"),
          signInEmail: journeyPreviewPath("sign-in-email"),
          signInCheckEmail: journeyPreviewPath("sign-in-check-email"),
          whySignIn: journeyPreviewPath("why-sign-in"),
          recoverPhone: journeyPreviewPath("recover-phone"),
          recoverGetCode: journeyPreviewPath("recover-get-security-code"),
          recoverStart: journeyPreviewPath("recover-start"),
          recoverNewEmail: journeyPreviewPath("recover-new-email"),
          recoverCheckNewEmail: journeyPreviewPath("recover-check-new-email"),
          manage: journeyPreviewPath("manage"),
          security: journeyPreviewPath("security"),
          changeEmailGetCode: journeyPreviewPath("change-email-get-security-code"),
          changeEmailCheckPhone: journeyPreviewPath("change-email-check-phone"),
          changeEmailNewEmail: journeyPreviewPath("change-email-new-email"),
          changeEmailNewEmailSameAsCurrent:
            "/runner-sign-in-v2/static/change-email-new-email-same-as-current",
          changeEmailNewEmailUsedOnOtherAccount:
            "/runner-sign-in-v2/static/change-email-new-email-used-on-other-account",
          changeEmailCheckNewEmail: journeyPreviewPath("change-email-check-new-email"),
          changePhoneGetCode: journeyPreviewPath("change-phone-get-security-code"),
          changePhoneCheckEmail: journeyPreviewPath("change-phone-check-email"),
          changePhoneNewPhone: journeyPreviewPath("change-phone-new-phone"),
          changePhoneNewPhoneSameAsCurrent: "/runner-sign-in-v2/static/change-phone-same-as-current",
          changePhoneNewPhoneUsedOnOtherAccount:
            "/runner-sign-in-v2/static/change-phone-used-on-other-account",
          saveExitChoose: journeyPreviewPath("save-exit-choose"),
          saveExitCreate: journeyPreviewPath("save-exit-create"),
          saveExitConfirmEmail: journeyPreviewPath("save-exit-confirm-email"),
          checkerInvite: journeyPreviewPath("checker-invite"),
          checkerWhySignIn: journeyPreviewPath("checker-why-sign-in"),
          readyToSubmit: journeyPreviewPath("ready-to-submit"),
          emailSaveExit: journeyPreviewPath("email-save-exit"),
          emailConfirmation: journeyPreviewPath("email-confirmation"),
          emailCheckerInvite: journeyPreviewPath("email-checker-invite"),
          emailFormSubmitted: journeyPreviewPath("email-form-submitted"),
          manageFormChecked: journeyPreviewPath("manage-form-checked"),
          saveExitCheckEmail: journeyPreviewPath("save-exit-check-email"),
          saveExitResumeWithSignIn: journeyPreviewPath("save-exit-resume-with-sign-in"),
          saveExitResumeWithoutSignIn: journeyPreviewPath("save-exit-resume-without-sign-in"),
          saveExitProgressSaved: journeyPreviewPath("save-exit-progress-saved"),
          deleteDraft: journeyPreviewPath("delete-draft"),
        }
      : undefined,
  };
}

function runnerSignInV2ResolvePageKey(pageKey, urls) {
  if (!pageKey) return null;
  if (pageKey.startsWith("unexpected:")) {
    const slug = pageKey.slice("unexpected:".length);
    return (urls.unexpected && urls.unexpected[slug]) || null;
  }
  if (pageKey.startsWith("static:")) {
    const slug = pageKey.slice("static:".length);
    if (slug === "manage-form-checked") return urls.staticManageFormChecked;
    if (slug === "change-email-new-email-same-as-current") {
      return urls.staticChangeEmailNewEmailSameAsCurrent;
    }
    if (slug === "change-email-new-email-used-on-other-account") {
      return urls.staticChangeEmailUsedOnOtherAccount;
    }
    if (slug === "change-phone-same-as-current") {
      return urls.staticChangePhoneSameAsCurrent;
    }
    if (slug === "change-phone-used-on-other-account") {
      return urls.staticChangePhoneUsedOnOtherAccount;
    }
    if (slug === "recover-no-sign-in-for-mobile") {
      return urls.staticRecoverNoSignInForMobile;
    }
    return null;
  }
  return urls[pageKey] || null;
}

function runnerSignInV2ResolveJourneyFlows(journeyFlows, urls) {
  return Object.fromEntries(
    Object.entries(journeyFlows).map(([id, journey]) => [
      id,
      {
        ...journey,
        nodes: journey.nodes.map((node) => {
          const { pageKey, ...rest } = node;
          const href = runnerSignInV2ResolvePageKey(pageKey, urls);
          return href ? { ...rest, href } : rest;
        }),
      },
    ])
  );
}

module.exports = {
  runnerSignInV2BuildJourneyUrls,
  runnerSignInV2ResolveJourneyFlows,
  runnerSignInV2ResolvePageKey,
};
