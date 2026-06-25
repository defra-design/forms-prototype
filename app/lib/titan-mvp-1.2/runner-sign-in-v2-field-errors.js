const RUNNER_SIGN_IN_V2_CHANGE_EMAIL_SAME_AS_CURRENT_ERROR =
  "Enter a different email address. This is the same as your current email address.";

const RUNNER_SIGN_IN_V2_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_ERROR =
  "Enter a different email address. This email address is already used for another sign-in.";

const RUNNER_SIGN_IN_V2_CHANGE_PHONE_SAME_AS_CURRENT_ERROR =
  "Enter a different mobile phone number. This is the same as your current mobile phone number.";

const RUNNER_SIGN_IN_V2_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_ERROR =
  "Enter a different mobile phone number. This mobile phone number is already used for another sign-in.";

const RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_NEW_EMAIL_SAME_AS_CURRENT_PATH =
  "/runner-sign-in-v2/static/change-email-new-email-same-as-current";

const RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_PATH =
  "/runner-sign-in-v2/static/change-email-used-on-other-account";

const RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_SAME_AS_CURRENT_PATH =
  "/runner-sign-in-v2/static/change-phone-same-as-current";

const RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_PATH =
  "/runner-sign-in-v2/static/change-phone-used-on-other-account";

const RUNNER_SIGN_IN_V2_PROTOTYPE_EMAIL_USED_ON_OTHER_ACCOUNT = "alreadyused@example.com";
const RUNNER_SIGN_IN_V2_PROTOTYPE_PHONE_USED_ON_OTHER_ACCOUNT = "07123456789";

function runnerSignInV2NormalizePhoneDigits(phone) {
  return String(phone || "").replace(/\D+/g, "");
}

function runnerSignInV2ChangeEmailValidationError(email, currentEmail) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const current = String(currentEmail || "").trim().toLowerCase();
  if (current && normalized === current) {
    return RUNNER_SIGN_IN_V2_CHANGE_EMAIL_SAME_AS_CURRENT_ERROR;
  }
  if (normalized === RUNNER_SIGN_IN_V2_PROTOTYPE_EMAIL_USED_ON_OTHER_ACCOUNT.toLowerCase()) {
    return RUNNER_SIGN_IN_V2_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_ERROR;
  }
  return null;
}

function runnerSignInV2ChangePhoneValidationError(phone, currentPhone) {
  const normalized = runnerSignInV2NormalizePhoneDigits(phone);
  if (!normalized) return null;
  const currentNormalized = runnerSignInV2NormalizePhoneDigits(currentPhone);
  if (currentNormalized && normalized === currentNormalized) {
    return RUNNER_SIGN_IN_V2_CHANGE_PHONE_SAME_AS_CURRENT_ERROR;
  }
  if (normalized === runnerSignInV2NormalizePhoneDigits(RUNNER_SIGN_IN_V2_PROTOTYPE_PHONE_USED_ON_OTHER_ACCOUNT)) {
    return RUNNER_SIGN_IN_V2_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_ERROR;
  }
  return null;
}

const RUNNER_SIGN_IN_V2_FIELD_ERRORS = {
  "create-email-empty": {
    title: "Enter an email address",
    group: "Email address",
    journey: "Create a sign-in",
    page: "Enter your email address",
    useWhen: "The user selects Continue without entering an email address.",
    field: "runnerSignInV2Email",
    error: { runnerSignInV2Email: "Enter an email address" },
    values: { runnerSignInV2Email: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/email",
  },
  "create-email-invalid-format": {
    title: "Enter an email address in the correct format",
    group: "Email address",
    journey: "Create a sign-in",
    page: "Enter your email address",
    useWhen: "The user enters text that is not a valid email address format.",
    field: "runnerSignInV2Email",
    error: { runnerSignInV2Email: "Enter an email address in the correct format, like name@example.com" },
    values: { runnerSignInV2Email: "not-an-email" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/email",
  },
  "sign-in-email-empty": {
    title: "Enter an email address (sign in)",
    group: "Email address",
    journey: "Sign in",
    page: "Enter your email address",
    useWhen: "The user selects Continue on the sign-in email page without entering an email address.",
    field: "runnerSignInV2Email",
    error: { runnerSignInV2Email: "Enter an email address" },
    values: { runnerSignInV2Email: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/email",
  },
  "sign-in-email-invalid-format": {
    title: "Enter an email address in the correct format (sign in)",
    group: "Email address",
    journey: "Sign in",
    page: "Enter your email address",
    useWhen: "The user enters text that is not a valid email address format on the sign-in journey.",
    field: "runnerSignInV2Email",
    error: { runnerSignInV2Email: "Enter an email address in the correct format, like name@example.com" },
    values: { runnerSignInV2Email: "not-an-email" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/email",
  },
  "save-exit-confirm-email-empty": {
    title: "Enter an email address (save and exit)",
    group: "Email address",
    journey: "Save and exit (signed in)",
    page: "Confirm the email for your save link",
    useWhen: "A signed-in user selects Continue on confirm email without entering an email address.",
    field: "runnerSignInV2ResumeEmail",
    error: { runnerSignInV2ResumeEmail: "Enter an email address" },
    values: { runnerSignInV2ResumeEmail: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/save-and-exit/with-sign-in/confirm-email",
  },
  "save-exit-confirm-email-invalid-format": {
    title: "Enter an email address in the correct format (save and exit)",
    group: "Email address",
    journey: "Save and exit (signed in)",
    page: "Confirm the email for your save link",
    useWhen: "A signed-in user enters text that is not a valid email address on the save-and-exit confirm email page.",
    field: "runnerSignInV2ResumeEmail",
    error: { runnerSignInV2ResumeEmail: "Enter an email address in the correct format, like name@example.com" },
    values: { runnerSignInV2ResumeEmail: "not-an-email" },
    template: "titan-mvp-1.2/runner-sign-in-v2/save-and-exit/with-sign-in/confirm-email",
  },
  "change-email-same-as-current": {
    title: "Enter a different email address (change email)",
    group: "Email address",
    journey: "Security · Change email",
    page: "Enter your new email address",
    useWhen: "The user enters the same email address as their current sign-in email when changing their email address.",
    field: "runnerSignInV2NewEmail",
    error: {
      runnerSignInV2NewEmail: RUNNER_SIGN_IN_V2_CHANGE_EMAIL_SAME_AS_CURRENT_ERROR,
    },
    values: { runnerSignInV2NewEmail: "you@example.com" },
    template: "titan-mvp-1.2/runner-sign-in-v2/security/change-email/new-email",
    staticHref: RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_NEW_EMAIL_SAME_AS_CURRENT_PATH,
    setupSession: (data) => {
      data.runnerSignInEmail = "you@example.com";
      data.runnerSignInV2ChangeEmailPhoneVerified = true;
    },
  },
  "change-email-used-on-other-account": {
    title: "Enter a different email address (already used)",
    group: "Email address",
    journey: "Security · Change email",
    page: "Enter your new email address",
    useWhen:
      "The user enters an email address that is already linked to a different sign-in when changing their email address.",
    field: "runnerSignInV2NewEmail",
    error: {
      runnerSignInV2NewEmail: RUNNER_SIGN_IN_V2_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_ERROR,
    },
    values: { runnerSignInV2NewEmail: RUNNER_SIGN_IN_V2_PROTOTYPE_EMAIL_USED_ON_OTHER_ACCOUNT },
    template: "titan-mvp-1.2/runner-sign-in-v2/security/change-email/new-email",
    staticHref: RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_PATH,
    setupSession: (data) => {
      data.runnerSignInEmail = "you@example.com";
      data.runnerSignInV2ChangeEmailPhoneVerified = true;
    },
  },
  "change-phone-same-as-current": {
    title: "Enter a different mobile phone number (change phone)",
    group: "Mobile phone number",
    journey: "Security · Change phone",
    page: "Enter your new mobile phone number",
    useWhen:
      "The user enters the same mobile phone number as their current sign-in number when changing their phone number.",
    field: "runnerSignInV2Mobile",
    error: {
      runnerSignInV2Mobile: RUNNER_SIGN_IN_V2_CHANGE_PHONE_SAME_AS_CURRENT_ERROR,
    },
    values: { runnerSignInV2Mobile: "07700 900000" },
    template: "titan-mvp-1.2/runner-sign-in-v2/security/change-phone/new-phone",
    staticHref: RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_SAME_AS_CURRENT_PATH,
    setupSession: (data) => {
      data.runnerSignInEmail = "you@example.com";
      data.runnerSignInPhone = "07700 900000";
      data.runnerSignInV2ChangePhoneEmailVerified = true;
    },
  },
  "change-phone-used-on-other-account": {
    title: "Enter a different mobile phone number (already used)",
    group: "Mobile phone number",
    journey: "Security · Change phone",
    page: "Enter your new mobile phone number",
    useWhen:
      "The user enters a mobile phone number that is already linked to a different sign-in when changing their phone number.",
    field: "runnerSignInV2Mobile",
    error: {
      runnerSignInV2Mobile: RUNNER_SIGN_IN_V2_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_ERROR,
    },
    values: { runnerSignInV2Mobile: RUNNER_SIGN_IN_V2_PROTOTYPE_PHONE_USED_ON_OTHER_ACCOUNT },
    template: "titan-mvp-1.2/runner-sign-in-v2/security/change-phone/new-phone",
    staticHref: RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_PATH,
    setupSession: (data) => {
      data.runnerSignInEmail = "you@example.com";
      data.runnerSignInPhone = "07700 900000";
      data.runnerSignInV2ChangePhoneEmailVerified = true;
    },
  },
  "create-mobile-empty": {
    title: "Enter a mobile phone number",
    group: "Mobile phone number",
    journey: "Create a sign-in",
    page: "Enter your mobile phone number",
    useWhen: "The user selects Continue without entering a mobile phone number.",
    field: "runnerSignInV2Mobile",
    error: { runnerSignInV2Mobile: "Enter a mobile phone number" },
    values: { runnerSignInV2Mobile: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/mobile",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
      data.runnerSignInV2CreateSignInEmailConfirmed = true;
    },
  },
  "recover-mobile-empty": {
    title: "Enter a mobile phone number (recover)",
    group: "Mobile phone number",
    journey: "Recover my sign-in",
    page: "Enter the phone number you used to sign in",
    useWhen:
      "The user selects Continue on the recover mobile phone page without entering a mobile phone number.",
    field: "runnerSignInV2Mobile",
    error: { runnerSignInV2Mobile: "Enter a mobile phone number" },
    values: { runnerSignInV2Mobile: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/recover/phone",
  },
  "create-mobile-invalid-format": {
    title: "Enter telephone number in the correct format",
    group: "Mobile phone number",
    journey: "Create a sign-in",
    page: "Enter your mobile phone number",
    useWhen:
      "The user enters a phone number that fails UK or international mobile validation (use the same Google lib validation as the phone number form component).",
    field: "runnerSignInV2Mobile",
    error: { runnerSignInV2Mobile: "Enter telephone number in the correct format" },
    values: { runnerSignInV2Mobile: "123" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/mobile",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
      data.runnerSignInV2CreateSignInEmailConfirmed = true;
    },
  },
  "create-otp-empty": {
    title: "Enter the 6 digit security code",
    group: "Security code",
    journey: "Create a sign-in",
    page: "Check your email",
    useWhen: "The user selects Continue on check your email without entering a security code.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the 6 digit security code" },
    values: { runnerSignInV2Code: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "create-otp-too-few-digits": {
    title: "Enter the 6 digit security code (too few digits)",
    group: "Security code",
    journey: "Create a sign-in",
    page: "Check your email",
    useWhen: "The user enters fewer than 6 digits and selects Continue.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the 6 digit security code" },
    values: { runnerSignInV2Code: "123" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "create-otp-too-many-digits": {
    title: "Enter the security code using only 6 digits",
    group: "Security code",
    journey: "Create a sign-in",
    page: "Check your email",
    useWhen: "The user enters more than 6 digits and selects Continue.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the security code using only 6 digits" },
    values: { runnerSignInV2Code: "1234567" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "create-otp-incorrect-or-expired": {
    title: "The code you entered is not correct or has expired",
    group: "Security code",
    journey: "Create a sign-in · Save and exit",
    page: "Check your email",
    useWhen: "The user enters an incorrect security code, or a code that has expired (codes expire after 15 minutes).",
    field: "runnerSignInV2Code",
    error: {
      runnerSignInV2Code:
        "The code you entered is not correct or has expired – enter it again or request a new code",
    },
    values: { runnerSignInV2Code: "000000" },
    template: "titan-mvp-1.2/runner-sign-in-v2/create-sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "sign-in-otp-empty": {
    title: "Enter the 6 digit security code (sign in)",
    group: "Security code",
    journey: "Sign in",
    page: "Check your email",
    useWhen: "The user selects Continue on the sign-in check your email page without entering a code.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the 6 digit security code" },
    values: { runnerSignInV2Code: "" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2SignInPendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "sign-in-otp-too-few-digits": {
    title: "Enter the 6 digit security code (sign in, too few digits)",
    group: "Security code",
    journey: "Sign in",
    page: "Check your email",
    useWhen: "The user enters fewer than 6 digits on the sign-in check your email page.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the 6 digit security code" },
    values: { runnerSignInV2Code: "12" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2SignInPendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "sign-in-otp-too-many-digits": {
    title: "Enter the security code using only 6 digits (sign in)",
    group: "Security code",
    journey: "Sign in",
    page: "Check your email",
    useWhen: "The user enters more than 6 digits on the sign-in check your email page.",
    field: "runnerSignInV2Code",
    error: { runnerSignInV2Code: "Enter the security code using only 6 digits" },
    values: { runnerSignInV2Code: "1234567" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2SignInPendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "sign-in-otp-incorrect-or-expired": {
    title: "The code you entered is not correct or has expired (sign in)",
    group: "Security code",
    journey: "Sign in · Save and exit",
    page: "Check your email",
    useWhen: "The user enters an incorrect or expired security code on the sign-in journey.",
    field: "runnerSignInV2Code",
    error: {
      runnerSignInV2Code:
        "The code you entered is not correct or has expired – enter it again or request a new code",
    },
    values: { runnerSignInV2Code: "000000" },
    template: "titan-mvp-1.2/runner-sign-in-v2/sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2SignInPendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
  "save-exit-otp-incorrect-or-expired": {
    title: "The code you entered is not correct or has expired (save and exit)",
    group: "Security code",
    journey: "Save and exit (without signing in)",
    page: "Check your email",
    useWhen: "The user enters an incorrect or expired security code during save and exit sign-in creation.",
    field: "runnerSignInV2Code",
    error: {
      runnerSignInV2Code:
        "The code you entered is not correct or has expired – enter it again or request a new code",
    },
    values: { runnerSignInV2Code: "000000" },
    template: "titan-mvp-1.2/runner-sign-in-v2/save-and-exit/without-sign-in/check-email",
    setupSession: (data) => {
      data.runnerSignInV2PendingEmail = "you@example.com";
    },
    extra: { email: "you@example.com", resend: false },
  },
};

function listRunnerSignInV2FieldErrors() {
  return Object.entries(RUNNER_SIGN_IN_V2_FIELD_ERRORS).map(([slug, item]) => ({
    slug,
    href: `/runner-sign-in-v2/error-messages/${slug}`,
    previewHref: item.staticHref || `/runner-sign-in-v2/error-messages/${slug}/preview`,
    ...item,
  }));
}

function groupRunnerSignInV2FieldErrors() {
  const groups = new Map();
  for (const item of listRunnerSignInV2FieldErrors()) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  }
  return [...groups.entries()].map(([heading, items]) => ({ heading, items }));
}

module.exports = {
  RUNNER_SIGN_IN_V2_CHANGE_EMAIL_SAME_AS_CURRENT_ERROR,
  RUNNER_SIGN_IN_V2_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_ERROR,
  RUNNER_SIGN_IN_V2_CHANGE_PHONE_SAME_AS_CURRENT_ERROR,
  RUNNER_SIGN_IN_V2_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_ERROR,
  RUNNER_SIGN_IN_V2_PROTOTYPE_EMAIL_USED_ON_OTHER_ACCOUNT,
  RUNNER_SIGN_IN_V2_PROTOTYPE_PHONE_USED_ON_OTHER_ACCOUNT,
  RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_NEW_EMAIL_SAME_AS_CURRENT_PATH,
  RUNNER_SIGN_IN_V2_STATIC_CHANGE_EMAIL_USED_ON_OTHER_ACCOUNT_PATH,
  RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_SAME_AS_CURRENT_PATH,
  RUNNER_SIGN_IN_V2_STATIC_CHANGE_PHONE_USED_ON_OTHER_ACCOUNT_PATH,
  runnerSignInV2ChangeEmailValidationError,
  runnerSignInV2ChangePhoneValidationError,
  RUNNER_SIGN_IN_V2_FIELD_ERRORS,
  listRunnerSignInV2FieldErrors,
  groupRunnerSignInV2FieldErrors,
};
