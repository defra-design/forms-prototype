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
  const choose = `${preview(urls, "save-exit-choose")}&step=details`;

  const stories = [
    {
      id: "story-1",
      title: "Story 1 – Create a DEFRA Forms sign-in via Save and Exit (not signed in)",
      summary:
        "User is filling in a form without being signed in. They choose Save and exit, create a DEFRA Forms sign-in, and their progress is saved for 28 days. They are not signed in until they follow the link in the save-and-exit email.",
      flows: [
        {
          title: "Flow 1 – Display sign in to save your progress",
          lines: [
            { label: "GIVEN", text: "I can see a question page" },
            { label: "WHEN", text: "I select Save and exit" },
            { label: "THEN", text: "the Sign in to save your progress page is displayed" },
          ],
          links: [{ text: "Sign in to save your progress", href: choose }],
          notes: ["(Ignore header email address and sign out on this screen.)"],
        },
        {
          title: "Flow 2 – Display check your email (OTP sent)",
          lines: [
            { label: "GIVEN", text: "I can see the Sign in to save your progress page" },
            { label: "AND", text: "I select Create your sign-in" },
            { label: "AND", text: "I am on the Enter your email address page" },
            { label: "AND", text: "a valid email address is entered (re-use validation from the email address component)" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the Check your email page is displayed" },
            { label: "AND", text: "a security code email is sent to the email address entered (from: submit a form to DEFRA) — see Security code email prototype" },
            { label: "AND", text: "the OTP code is unique, 6 digits, and valid for 15 minutes only" },
          ],
          links: [
            { text: "Enter your email address (save and exit)", href: preview(urls, "create-sign-in-email-save-exit") },
            { text: "Check your email", href: preview(urls, "save-exit-check-email") },
            { text: "Security code email", href: preview(urls, "email-confirmation") },
          ],
        },
        {
          title: "Flow 3 – Successful OTP entry",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "a valid (not expired) 6-digit OTP is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the Enter your mobile phone number page is displayed" },
          ],
          links: [{ text: "Enter your mobile phone number", href: preview(urls, "create-sign-in-mobile-save-exit") }],
        },
        {
          title: "Flow 4 – Successful new DEFRA Forms sign-in (initial sign-in via Save and Exit)",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your mobile phone number page" },
            { label: "AND", text: "a valid email address was entered" },
            { label: "AND", text: "a valid OTP was successfully entered" },
            { label: "WHEN", text: "I enter a valid UK mobile number (Google lib validation on phone component)" },
            { label: "OR", text: "a valid international mobile number (Google lib validation on phone component)" },
            { label: "AND", text: "I select Continue" },
            { label: "THEN", text: "the Your progress has been saved page is displayed" },
            { label: "AND", text: "a save-and-exit email is sent to the email address I entered" },
            { label: "AND", text: "the in-progress submission is saved for 28 days" },
            { label: "AND", text: "I am not signed in" },
          ],
          links: [
            { text: "Your progress has been saved", href: preview(urls, "save-exit-progress-saved") },
            { text: "Save and exit email (without sign-in)", href: preview(urls, "email-save-exit-without-sign-in") },
          ],
          notes: ["(from: submit a form to DEFRA)"],
        },
        {
          title: "Flow 5 – Unsuccessful registration (invalid email address)",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your email address page" },
            { label: "AND", text: "a non-email value is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter an email address in the correct format, like name@example.com",
          links: [{ text: "Validation error reference", href: errorRef("create-email-invalid-format") }],
        },
        {
          title: "Flow 5.1 – Unsuccessful registration (empty email address)",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your email address page" },
            { label: "AND", text: "no email address is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter an email address",
          links: [{ text: "Validation error reference", href: errorRef("create-email-empty") }],
        },
        {
          title: "Flow 6 – Unsuccessful registration (invalid phone number)",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your mobile phone number page" },
            { label: "AND", text: "an invalid mobile phone number is entered (UK or international)" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter telephone number in the correct format",
          links: [{ text: "Validation error reference", href: errorRef("create-mobile-invalid-format") }],
        },
        {
          title: "Flow 7 – Unsuccessful registration (incorrect or expired OTP)",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "an incorrect OTP is entered" },
            { label: "OR", text: "an expired OTP is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "The code you entered is not correct or has expired – enter it again or request a new code",
          notes: ['(Replaces older copy: "Your security code has expired".)'],
          links: [
            { text: "Validation error reference", href: errorRef("create-otp-incorrect-or-expired") },
            {
              text: "Wrong security code too many times (unexpected journey)",
              href: urls.unexpected["wrong-security-code-too-many-times"],
            },
          ],
        },
        {
          title: "Flow 7.1 – Unsuccessful registration (OTP not 6 digits)",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "fewer than 6 digits are entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter the 6 digit security code",
          links: [{ text: "Validation error reference", href: errorRef("create-otp-too-few-digits") }],
        },
        {
          title: "Flow 7.2 – Unsuccessful registration (too many OTP digits)",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "more than 6 digits are entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter the security code using only 6 digits",
          links: [{ text: "Validation error reference", href: errorRef("create-otp-too-many-digits") }],
        },
        {
          title: "Flow 8 – Display screen to send new code",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "I have requested a new security code fewer than 5 times" },
            { label: "WHEN", text: 'I select send the code again (under "Problems with the code?")' },
            { label: "THEN", text: "the Get security code page is displayed" },
          ],
          links: [{ text: "Get security code", href: preview(urls, "create-sign-in-get-security-code") }],
        },
        {
          title: "Flow 9 – Re-send OTP code",
          lines: [
            { label: "GIVEN", text: "I can see the Get security code page" },
            { label: "WHEN", text: "I select Get security code" },
            { label: "THEN", text: "the Check your email page is displayed with a success banner: We've sent you a new security code" },
            { label: "AND", text: "a new 6-digit OTP is sent to my email address" },
            { label: "AND", text: "the new OTP is valid for 15 minutes" },
          ],
          links: [{ text: "Check your email (with resend banner)", href: preview(urls, "create-sign-in-check-email-resend") }],
        },
        {
          title: "Flow 10 – Use alternative email address",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "WHEN", text: 'I select use a different email address (under "Problems with the code?")' },
            { label: "THEN", text: "the Enter your email address page is displayed" },
            { label: "AND", text: "I can enter a different email address" },
          ],
          links: [{ text: "Enter your email address", href: preview(urls, "create-sign-in-email-save-exit") }],
        },
        {
          title: "Flow 11 – OTP attempt limit reached",
          lines: [
            { label: "GIVEN", text: "I can see the Check your email page" },
            { label: "AND", text: "I have entered the wrong security code too many times" },
            { label: "WHEN", text: "I try to continue with the same email address" },
            { label: "THEN", text: "the You entered the wrong security code too many times page is displayed" },
            { label: "AND", text: "I cannot sign in using the same email address for 2 hours" },
          ],
          links: [
            {
              text: "Wrong security code locked out",
              href: urls.unexpected["wrong-security-code-locked-out"],
            },
          ],
        },
        {
          title: "Flow 12 – Resend OTP limit reached",
          lines: [
            { label: "GIVEN", text: "I have requested more than 5 security codes" },
            { label: "WHEN", text: "I try to request another code" },
            { label: "THEN", text: "the You asked to resend the security code too many times page is displayed" },
            { label: "AND", text: "I cannot sign in for 2 hours" },
          ],
          links: [
            { text: "Too many security codes", href: urls.unexpected["too-many-security-codes"] },
          ],
        },
        {
          title: "Flow 13 – Email address already has a sign-in",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your email address page (create sign-in)" },
            { label: "AND", text: "I enter an email address that already has a DEFRA Forms sign-in for this form" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the You already have a sign-in for this form page is displayed" },
            { label: "AND", text: "selecting Sign in takes me to the sign-in journey" },
            { label: "AND", text: "selecting Use a different email address takes me back to enter a different email" },
          ],
          links: [
            {
              text: "Email already has a sign-in",
              href: urls.unexpected["email-already-has-sign-in"],
            },
          ],
        },
      ],
      additionalAc: [
        {
          title: "Check your email page – additional AC",
          items: [
            "OTP is unique and exactly 6 digits",
            "OTP is valid for 15 minutes",
            "Page shows which email the code was sent to",
            '"Problems with the code?" provides send the code again and use a different email address',
            "After resend, success banner is shown",
          ],
        },
      ],
    },
    {
      id: "story-2",
      title: "Story 2 – Save and Exit when already signed in",
      summary:
        "User is signed in while filling in the form. They choose Save and exit and receive an email link to return later.",
      flows: [
        {
          title: "Flow 1 – Display confirm email to save and exit",
          lines: [
            { label: "GIVEN", text: "I am signed in" },
            { label: "AND", text: "I can see a question page" },
            { label: "WHEN", text: "I select Save and exit" },
            { label: "THEN", text: "the Confirm the email for your save link page is displayed" },
          ],
          links: [{ text: "Confirm email to save and exit", href: preview(urls, "save-exit-confirm-email") }],
        },
        {
          title: "Flow 2 – Successful Save and Exit (signed in)",
          lines: [
            { label: "GIVEN", text: "I can see the Confirm the email for your save link page" },
            { label: "AND", text: "a valid email address is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the We've emailed you a link to come back page is displayed" },
            { label: "AND", text: "a save-and-exit email is sent to the email address entered" },
            { label: "AND", text: "the in-progress submission is saved for 28 days" },
          ],
          links: [
            { text: "We've emailed you a link to come back", href: preview(urls, "save-exit-with-sign-in-leave") },
            { text: "Save and exit email (signed in)", href: preview(urls, "email-save-exit-with-sign-in") },
          ],
        },
        {
          title: "Flow 3 – Unsuccessful Save and Exit (invalid email)",
          lines: [
            { label: "GIVEN", text: "I can see the Confirm the email for your save link page" },
            { label: "AND", text: "a non-email value is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter an email address in the correct format, like name@example.com",
          links: [{ text: "Validation error reference", href: errorRef("save-exit-confirm-email-invalid-format") }],
        },
        {
          title: "Flow 4 – Unsuccessful Save and Exit (empty email)",
          lines: [
            { label: "GIVEN", text: "I can see the Confirm the email for your save link page" },
            { label: "AND", text: "no email address is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the following error is displayed:" },
          ],
          errorText: "Enter an email address",
          links: [{ text: "Validation error reference", href: errorRef("save-exit-confirm-email-empty") }],
        },
      ],
    },
    {
      id: "story-3",
      title: "Story 3 – Sign in to resume saved progress",
      summary:
        "User returns via the save-and-exit email or progress-saved screen and signs in to reach Manage your form.",
      flows: [
        {
          title: "Flow 1 – Sign in from your progress has been saved screen",
          lines: [
            { label: "GIVEN", text: "I can see the Your progress has been saved screen (Story 1, Flow 4)" },
            { label: "WHEN", text: "I select Sign in" },
            { label: "THEN", text: "the Enter your email address page is displayed for the sign-in journey" },
          ],
          links: [
            { text: "Your progress has been saved", href: preview(urls, "save-exit-progress-saved") },
            { text: "Sign in – enter your email address", href: preview(urls, "sign-in-email") },
          ],
        },
        {
          title: "Flow 2 – Sign in from save-and-exit email",
          lines: [
            { label: "GIVEN", text: "I can see the save-and-exit email" },
            { label: "WHEN", text: "I select Continue with your form" },
            { label: "THEN", text: "the Welcome back page is displayed" },
            { label: "AND", text: "selecting Sign in to continue takes me to the Enter your email address sign-in page" },
          ],
          links: [
            { text: "Welcome back (with-sign-in variant)", href: preview(urls, "save-exit-resume-with-sign-in") },
            { text: "Welcome back (without sign-in first)", href: preview(urls, "save-exit-resume-without-sign-in") },
          ],
        },
        {
          title: "Flow 3 – Sign in from sign in to save your progress (existing account)",
          lines: [
            { label: "GIVEN", text: "I can see the Sign in to save your progress page" },
            { label: "WHEN", text: "I select Sign in" },
            { label: "THEN", text: "the Enter your email address page is displayed for the sign-in journey" },
            {
              label: "AND",
              text: "after successful sign-in I am taken to Confirm the email for your save link to complete Save and Exit",
            },
          ],
          links: [
            { text: "Sign in to save your progress", href: choose },
            { text: "Sign in – enter your email address", href: preview(urls, "sign-in-email") },
            { text: "Confirm email to save and exit", href: preview(urls, "save-exit-confirm-email") },
          ],
        },
        {
          title: "Flow 4 – Successful sign-in and display dashboard",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your email address page (sign-in)" },
            { label: "AND", text: "a registered email address is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the Check your email page is displayed" },
            { label: "AND", text: "a security code email is sent (valid 15 minutes)" },
            { label: "GIVEN", text: "I can see the Check your email page (sign-in)" },
            { label: "AND", text: "a valid OTP is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "Manage your form (dashboard) is displayed" },
          ],
          links: [
            { text: "Sign in – enter your email address", href: preview(urls, "sign-in-email") },
            { text: "Sign in – check your email", href: preview(urls, "sign-in-check-email") },
            { text: "Manage your form", href: preview(urls, "manage") },
          ],
          notes: ["(Prototype may show placeholder content; no need to pull through submission data for this story.)"],
        },
        {
          title: "Flow 5 – Unsuccessful sign-in (email not recognised)",
          lines: [
            { label: "GIVEN", text: "I can see the Enter your email address page (sign-in)" },
            { label: "AND", text: "an unregistered email address is entered" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "the We cannot find a sign-in for that email address page is displayed" },
          ],
          links: [{ text: "No sign-in found", href: urls.unexpected["no-sign-in-found"] }],
        },
        {
          title: "Flow 6 – Sign out",
          lines: [
            { label: "GIVEN", text: "I am signed in and can see Manage your form (or any signed-in runner page with the service header)" },
            { label: "WHEN", text: "I select Sign out" },
            { label: "THEN", text: "the sign-out confirmation page is displayed" },
          ],
          links: [{ text: "You have signed out", href: urls.signOut }],
        },
        {
          title: "Flow 7 – Expired save link",
          lines: [
            { label: "GIVEN", text: "I open a save-and-exit email link after 28 days" },
            { label: "WHEN", text: "the link is no longer valid" },
            { label: "THEN", text: "the Your link has expired page is displayed" },
            { label: "AND", text: "I am directed to sign in again from the form start page" },
          ],
          links: [{ text: "Save link expired", href: urls.unexpected["save-link-expired"] }],
        },
      ],
      additionalAc: [
        {
          title: "We cannot find a sign-in for that email address – additional AC",
          items: [
            "Try again → sign-in Enter your email address page",
            "Create a sign-in → create sign-in Enter your email address page",
            "All OTP / phone / resend error scenarios from Story 1 apply to the sign-in journey too",
          ],
          links: [
            { text: "Sign-in validation errors", href: urls.errorMessages },
          ],
        },
        {
          title: "Dashboard page – additional AC",
          items: [
            "If a user selects their email address in the header, the page reloads",
            "Manage your form shows the form name as the page heading",
            "User remains signed in until they sign out",
          ],
        },
      ],
    },
    {
      id: "story-4",
      title: "Story 4 – Display and manage in-progress form submissions",
      summary:
        "After signing in from a save-and-exit email, someone manages their in-progress submissions from the dashboard.",
      notice: "DO NOT DECOMMISSION THE OLD SAVE AND EXIT AUTH PROCESS OF MEMORABLE WORD",
      flows: [
        {
          title: "Flow 1 – Display in-progress submissions after sign-in from email",
          lines: [
            { label: "GIVEN", text: "I opened the link from the save-and-exit email" },
            { label: "AND", text: "I successfully sign in" },
            { label: "THEN", text: "all my in-progress submissions for that form are displayed on Manage your form" },
          ],
          links: [{ text: "Manage your form", href: preview(urls, "manage") }],
        },
        {
          title: "Flow 2 – Resume in-progress form",
          lines: [
            { label: "GIVEN", text: "I can see Manage your form" },
            { label: "AND", text: "an active in-progress submission is listed" },
            { label: "WHEN", text: "I select Continue" },
            { label: "THEN", text: "I can continue completing my form at the last saved question (existing behaviour)" },
          ],
          links: [{ text: "Manage your form", href: preview(urls, "manage") }],
        },
        {
          title: "Flow 3 – Display delete form confirmation page",
          lines: [
            { label: "GIVEN", text: "I can see Manage your form" },
            { label: "AND", text: "there are active in-progress submissions listed" },
            { label: "WHEN", text: "I select Delete" },
            { label: "THEN", text: "the Are you sure you want to delete this draft? page is displayed" },
          ],
          links: [{ text: "Delete draft confirmation", href: preview(urls, "delete-draft") }],
        },
        {
          title: "Flow 4 – Confirm form deletion",
          lines: [
            { label: "GIVEN", text: "I can see the Are you sure you want to delete this draft? page" },
            { label: "WHEN", text: "I select Yes, delete this draft" },
            { label: "AND", text: "I select Continue" },
            { label: "THEN", text: "Manage your form is displayed" },
            { label: "AND", text: "the deleted submission no longer appears in the list" },
          ],
          links: [
            { text: "Delete draft confirmation", href: preview(urls, "delete-draft") },
            { text: "Manage your form", href: preview(urls, "manage") },
          ],
        },
        {
          title: "Flow 5 – Cancel form deletion",
          lines: [
            { label: "GIVEN", text: "I can see the Are you sure you want to delete this draft? page" },
            { label: "WHEN", text: "I select No, keep this draft" },
            { label: "AND", text: "I select Continue" },
            { label: "THEN", text: "Manage your form is displayed" },
            { label: "AND", text: "the submission remains visible in the list" },
          ],
          links: [
            { text: "Delete draft confirmation", href: preview(urls, "delete-draft") },
            { text: "Manage your form", href: preview(urls, "manage") },
          ],
        },
        {
          title: "Flow 6 – Start new form",
          lines: [
            { label: "GIVEN", text: "I can see Manage your form" },
            { label: "WHEN", text: "I select Start a new form" },
            { label: "THEN", text: "I am taken to the first question of the form as a new application" },
            { label: "AND", text: "existing in-progress save-and-exit instances remain unaffected" },
          ],
          links: [
            { text: "Start a new application", href: urls.startNewForm },
            { text: "Form start page (demo)", href: urls.formStartPage },
          ],
        },
      ],
      additionalAc: [
        {
          title: "Manage your form – additional AC",
          items: [
            "Submissions listed in expiry order (earliest expiry first → latest)",
            "Only submissions for the current form are shown",
            "Start a new form creates a new application; saved in-progress instances are unchanged",
            "Expired submissions show status Deleted (govuk-tag--red) below active in-progress rows",
            "When a form is submitted, that in-progress row must not appear on the dashboard",
            "Submitted forms show Submitted status (govuk-tag--green) where applicable",
          ],
          table: {
            head: [
              { text: "Column" },
              { text: "Content" },
            ],
            rows: [
              [{ text: "Reference number" }, { text: "Submission reference number" }],
              [{ text: "Status" }, { text: "In progress (govuk-tag--teal)" }],
              [{ text: "Last updated" }, { text: "Date/time of successful Save and Exit" }],
              [{ text: "Saved until" }, { text: "Expiry date (28 days from save)" }],
              [{ text: "Actions" }, { text: "Continue | Delete" }],
            ],
          },
        },
      ],
    },
    {
      id: "story-5",
      title: "Story 5 – Delete in-progress form submission",
      summary: "Focused story for deletion; complements Story 4 Flows 3–5.",
      flows: [
        {
          title: "Flow 1 – Delete active in-progress submission",
          lines: [
            { label: "GIVEN", text: "I am signed in" },
            { label: "AND", text: "I can see an active in-progress submission on Manage your form" },
            { label: "WHEN", text: "I select Delete" },
            { label: "AND", text: "I confirm Yes, delete this draft" },
            { label: "THEN", text: "the submission is permanently removed from my dashboard" },
            { label: "AND", text: "I cannot resume it via the save-and-exit email link for that submission" },
          ],
          links: [
            { text: "Delete draft confirmation", href: preview(urls, "delete-draft") },
            { text: "Manage your form", href: preview(urls, "manage") },
          ],
        },
        {
          title: "Flow 2 – Cannot delete submitted form",
          lines: [
            { label: "GIVEN", text: "I can see a Submitted form on Manage your form" },
            { label: "THEN", text: "no Delete action is available" },
            { label: "AND", text: "Copy is available instead" },
          ],
          links: [{ text: "Manage your form (submitted example)", href: urls.manage }],
        },
        {
          title: "Flow 3 – Delete confirmation required",
          lines: [
            { label: "GIVEN", text: "I select Delete on an in-progress submission" },
            { label: "THEN", text: "I must confirm on the Are you sure you want to delete this draft? page before deletion occurs" },
            { label: "AND", text: "selecting No, keep this draft cancels deletion" },
          ],
          links: [{ text: "Delete draft confirmation", href: preview(urls, "delete-draft") }],
        },
      ],
      additionalAc: [
        {
          title: "Delete in-progress form – additional AC",
          items: [
            "Deletion only applies to the selected submission reference",
            "Other in-progress submissions for the same form are unaffected",
            "After deletion, no success banner is required (prototype redirects with ?deleted=1 optional)",
            "Memorable-word save-and-exit flow remains available in parallel (do not decommission)",
          ],
        },
      ],
    },
  ];

  const openItems = [
    "Welsh translation – copy on save-and-exit screens and emails still needs Welsh versions",
  ];

  return { stories, openItems };
}

module.exports = { buildRunnerSignInV2SaveExitStories };
