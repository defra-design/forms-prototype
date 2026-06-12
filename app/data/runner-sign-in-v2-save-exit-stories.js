function errorRef(slug) {
  return `/runner-sign-in-v2/error-messages/${slug}`;
}

function preview(urls, slug) {
  if (typeof urls.preview === "function") {
    return urls.preview(slug);
  }
  return `/runner-sign-in-v2/journeys/preview/${encodeURIComponent(slug)}`;
}

function buildRunnerSignInV2SaveExitStories(urls) {
  return [
    {
      id: "story-1",
      title: "Story 1 – Create a sign-in via Save and Exit (not signed in)",
      summary:
        "Someone fills in a form without signing in, chooses Save and exit, creates a sign-in, and their progress is saved for 28 days. They are not signed in until they follow the link in the save-and-exit email.",
      flows: [
        {
          title: "Flow 1 – Display sign in to save your progress",
          given: "I can see a question page",
          when: "I select Save and exit",
          then: "the Sign in to save your progress page is displayed",
          links: [{ text: "Sign in to save your progress", href: preview(urls, "save-exit-choose") }],
        },
        {
          title: "Flow 2 – Display check your email",
          given:
            "I can see the Sign in to save your progress page and I select Create your sign-in, then enter a valid email address on Enter your email address",
          when: "I select Continue",
          then: "the Check your email page is displayed and a 6-digit security code email is sent (valid for 15 minutes)",
          links: [
            { text: "Enter your email address (save and exit)", href: preview(urls, "create-sign-in-email-save-exit") },
            { text: "Check your email", href: preview(urls, "save-exit-check-email") },
            { text: "Security code email", href: preview(urls, "email-confirmation") },
          ],
        },
        {
          title: "Flow 3 – Successful OTP entry",
          given: "I can see the Check your email page and enter a valid 6-digit security code",
          when: "I select Continue",
          then: "the Enter your mobile phone number page is displayed",
          links: [{ text: "Enter your mobile phone number", href: preview(urls, "create-sign-in-mobile-save-exit") }],
        },
        {
          title: "Flow 4 – Successful new sign-in (save and exit)",
          given:
            "I can see Enter your mobile phone number, have entered a valid email and OTP, and enter a valid mobile number",
          when: "I select Continue",
          then:
            "Your progress has been saved is displayed, a save-and-exit email is sent, the submission is saved for 28 days, and I am not signed in",
          links: [
            { text: "Your progress has been saved", href: preview(urls, "save-exit-progress-saved") },
            { text: "Save and exit email (without sign-in)", href: preview(urls, "email-save-exit-without-sign-in") },
            { text: "We've emailed you a link to resume", href: preview(urls, "save-exit-without-sign-in-leave") },
          ],
        },
        {
          title: "Flow 5 – Invalid or empty email address",
          given: "I can see Enter your email address during create sign-in",
          when: "I select Continue with an invalid or empty email address",
          then: "the appropriate inline validation error is displayed",
          links: [
            { text: "Enter an email address", href: errorRef("create-email-empty") },
            { text: "Enter an email address in the correct format", href: errorRef("create-email-invalid-format") },
          ],
        },
        {
          title: "Flow 6 – Invalid phone number",
          given: "I can see Enter your mobile phone number",
          when: "I select Continue with an invalid mobile number",
          then: "Enter telephone number in the correct format is displayed",
          links: [{ text: "Invalid phone number error", href: errorRef("create-mobile-invalid-format") }],
        },
        {
          title: "Flow 7 – Incorrect, expired, or invalid OTP",
          given: "I can see the Check your email page",
          when: "I select Continue with an incorrect, expired, or wrongly formatted code",
          then: "the appropriate inline validation error is displayed",
          links: [
            { text: "Code not correct or expired", href: errorRef("create-otp-incorrect-or-expired") },
            { text: "Enter the 6 digit security code", href: errorRef("create-otp-too-few-digits") },
            { text: "Enter the security code using only 6 digits", href: errorRef("create-otp-too-many-digits") },
            {
              text: "Wrong security code too many times (unexpected journey)",
              href: urls.unexpected["wrong-security-code-too-many-times"],
            },
          ],
        },
        {
          title: "Flow 8 – Send new security code",
          given: "I can see Check your email and have requested a new code fewer than 5 times",
          when: "I select send the code again",
          then: "the Get security code page is displayed",
          links: [{ text: "Get security code", href: preview(urls, "create-sign-in-get-security-code") }],
        },
        {
          title: "Flow 9 – Re-send OTP code",
          given: "I can see the Get security code page",
          when: "I select Get security code",
          then:
            "Check your email is displayed with a success banner, a new 6-digit code is sent, and it is valid for 15 minutes",
          links: [{ text: "Check your email (code resent)", href: preview(urls, "create-sign-in-check-email-resend") }],
        },
        {
          title: "Flow 11 – OTP attempt limit reached",
          given: "I have entered the wrong security code too many times",
          when: "I try to continue with the same email address",
          then: "You entered the wrong security code too many times is displayed",
          links: [
            {
              text: "Wrong security code locked out",
              href: urls.unexpected["wrong-security-code-locked-out"],
            },
          ],
        },
        {
          title: "Flow 12 – Resend OTP limit reached",
          given: "I have requested more than 5 security codes",
          when: "I try to request another code",
          then: "You asked to resend the security code too many times is displayed",
          links: [
            { text: "Too many security codes", href: urls.unexpected["too-many-security-codes"] },
          ],
        },
        {
          title: "Flow 13 – Email address already has a sign-in",
          given: "I enter an email address that already has a sign-in for this form",
          when: "I select Continue on Enter your email address",
          then: "You already have a sign-in for this form is displayed",
          links: [
            {
              text: "Email already has a sign-in",
              href: urls.unexpected["email-already-has-sign-in"],
            },
          ],
        },
      ],
    },
    {
      id: "story-2",
      title: "Story 2 – Save and Exit when already signed in",
      summary:
        "Someone is signed in while filling in the form. They choose Save and exit and receive an email link to return later.",
      flows: [
        {
          title: "Flow 1 – Confirm email to save and exit",
          given: "I am signed in and can see a question page",
          when: "I select Save and exit",
          then: "Confirm the email for your save link is displayed",
          links: [{ text: "Confirm email to save and exit", href: preview(urls, "save-exit-confirm-email") }],
        },
        {
          title: "Flow 2 – Successful Save and Exit (signed in)",
          given: "I can see Confirm the email for your save link and enter a valid email address",
          when: "I select Continue",
          then:
            "We've emailed you a link to come back is displayed, a save-and-exit email is sent, and the submission is saved for 28 days",
          links: [
            { text: "We've emailed you a link to come back", href: preview(urls, "save-exit-with-sign-in-leave") },
            { text: "Save and exit email (signed in)", href: preview(urls, "email-save-exit-with-sign-in") },
          ],
        },
        {
          title: "Flow 3 – Invalid or empty email on confirm screen",
          given: "I can see Confirm the email for your save link",
          when: "I select Continue with an invalid or empty email address",
          then: "the appropriate inline validation error is displayed",
          links: [
            { text: "Enter an email address", href: errorRef("save-exit-confirm-email-empty") },
            {
              text: "Enter an email address in the correct format",
              href: errorRef("save-exit-confirm-email-invalid-format"),
            },
          ],
        },
      ],
    },
    {
      id: "story-3",
      title: "Story 3 – Sign in to resume saved progress",
      summary:
        "Someone returns via the save-and-exit email or progress-saved screen and signs in to reach Manage your form.",
      flows: [
        {
          title: "Flow 2 – Sign in from save-and-exit email (signed in variant)",
          given: "I can see the save-and-exit email",
          when: "I select Continue with your form",
          then: "Welcome back is displayed and Sign in to continue takes me to sign in",
          links: [
            { text: "Welcome back (signed-in save and exit)", href: preview(urls, "save-exit-resume-with-sign-in") },
            { text: "Welcome back (without sign-in first)", href: preview(urls, "save-exit-resume-without-sign-in") },
          ],
        },
        {
          title: "Flow 4 – Successful sign-in to dashboard",
          given: "I complete sign in with email and a valid security code",
          when: "I select Continue",
          then: "Manage your form is displayed",
          links: [{ text: "Manage your form", href: preview(urls, "manage") }],
        },
        {
          title: "Flow 5 – Email not recognised",
          given: "I enter an unregistered email address on sign in",
          when: "I select Continue",
          then: "We cannot find a sign-in for that email address is displayed",
          links: [{ text: "No sign-in found", href: urls.unexpected["no-sign-in-found"] }],
        },
        {
          title: "Flow 6 – Sign out",
          given: "I am signed in and can see Manage your form or another signed-in page",
          when: "I select Sign out",
          then: "You have signed out is displayed",
          links: [{ text: "You have signed out", href: urls.signOut }],
        },
        {
          title: "Flow 7 – Expired save link",
          given: "I open a save-and-exit email link after 28 days",
          when: "the link is no longer valid",
          then: "Your link has expired is displayed",
          links: [{ text: "Save link expired", href: urls.unexpected["save-link-expired"] }],
        },
      ],
    },
    {
      id: "story-4",
      title: "Story 4 – Display and manage in-progress submissions",
      summary:
        "After signing in from a save-and-exit email, someone sees their in-progress submissions on Manage your form.",
      flows: [
        {
          title: "Flow 1 – Display in-progress submissions",
          given: "I opened the link from the save-and-exit email and successfully signed in",
          when: "Manage your form loads",
          then: "my in-progress submissions for that form are listed",
          links: [{ text: "Manage your form", href: preview(urls, "manage") }],
        },
        {
          title: "Flow 3 – Display delete confirmation",
          given: "I can see Manage your form with active in-progress submissions",
          when: "I select Delete",
          then: "Are you sure you want to delete this draft? is displayed",
          links: [{ text: "Delete draft confirmation", href: preview(urls, "delete-draft") }],
        },
        {
          title: "Flow 6 – Start new form",
          given: "I can see Manage your form",
          when: "I select Start a new form",
          then: "I am taken to start a new application and existing in-progress saves remain",
          links: [{ text: "Start a new application", href: urls.startNewForm }],
        },
      ],
    },
    {
      id: "story-5",
      title: "Story 5 – Delete in-progress submission",
      summary: "Someone permanently removes an in-progress save-and-exit submission from their dashboard.",
      flows: [
        {
          title: "Flow 1 – Delete active in-progress submission",
          given: "I am signed in and select Delete on an in-progress submission",
          when: "I confirm Yes, delete this draft",
          then: "the submission is removed from Manage your form",
          links: [
            { text: "Delete draft confirmation", href: preview(urls, "delete-draft") },
            { text: "Manage your form (after delete)", href: preview(urls, "manage") },
          ],
        },
      ],
    },
    {
      id: "story-copy",
      title: "Copy a previous submission",
      summary:
        "Someone submits a form using answers copied from a previous submission. Form designer advanced settings control whether reuse is allowed.",
      flows: [
        {
          title: "Form designer – reuse previous answers setting",
          given: "I am configuring the form in the editor",
          when: "I open Advanced settings",
          then: "I can turn reuse previous answers on or off",
          links: [
            { text: "Advanced settings", href: urls.formEditorAdvancedSettings },
            { text: "Reuse previous answers", href: urls.formEditorReusePreviousAnswers },
            { text: "Check before submission", href: urls.formEditorCheckBeforeSubmission },
          ],
        },
        {
          title: "Runner – form submitted confirmation and email",
          given: "I submitted a form by copying a previous submission",
          when: "submission completes",
          then:
            "Form submitted is displayed and the confirmation email notes that answers were copied from a previous submission",
          links: [
            { text: "Form submitted", href: preview(urls, "form-submitted") },
            { text: "Form submitted email (copied answers)", href: preview(urls, "email-form-submitted") },
          ],
        },
      ],
    },
  ];
}

module.exports = { buildRunnerSignInV2SaveExitStories };
