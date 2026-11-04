/**
 * POC: optional reasons on high-impact form changes, shown in form history.
 */
const express = require("express");
const router = express.Router();

const BASE = "/titan-mvp-1.2/concepts/notes-in-history";
const VIEW = "titan-mvp-1.2/concepts/notes-in-history";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function noteHtml(note) {
  if (!note) return null;
  return (
    '<p class="govuk-body govuk-!-margin-top-2 govuk-!-margin-bottom-0">' +
    "<strong>Note:</strong> " +
    escapeHtml(note) +
    "</p>"
  );
}

function eventHtml(text, note) {
  const parts = [];
  if (text) {
    parts.push('<p class="govuk-body govuk-!-margin-bottom-0">' + escapeHtml(text) + "</p>");
  }
  const noteBlock = noteHtml(note);
  if (noteBlock) parts.push(noteBlock);
  return parts.length ? parts.join("") : null;
}

function seedEvents() {
  return [
    {
      id: "seed-meme",
      label: "Internal note added",
      html:
        '<p class="govuk-body">Someone asked for the change note. This was the reply.</p>' +
        '<img src="/public/images/concepts/form-history-meme.jpg" alt="Meme: Form history. When someone asks why you made it live. A person shrugs." style="max-width: 100%; height: auto; border: 1px solid #b1b4b6;">',
      text: null,
      note: null,
      timestamp: "2024-05-08T16:45:00.000Z",
      byline: "Chris Smith",
    },
    {
      id: "seed-draft-edited",
      label: "Draft edited",
      text: "Edited the draft 3 times between 3:30pm and 4:30pm.",
      note: null,
      timestamp: "2024-05-08T16:30:00.000Z",
      byline: "Chris Smith",
    },
    {
      id: "seed-live",
      label: "Form made live",
      text: "Made the form live.",
      note: "Policy approved this for private beta from 8 May.",
      timestamp: "2024-05-08T14:45:00.000Z",
      byline: "Emily Wong",
    },
    {
      id: "seed-next-steps",
      label: "Next steps updated",
      text: "Changed the next steps guidance from ‘We will call you in 2 working days’ to ‘We will send you a confirmation email’.",
      note: null,
      timestamp: "2024-05-08T11:15:00.000Z",
      byline: "Emily Wong",
    },
    {
      id: "seed-email",
      label: "Notification email updated",
      text: "Changed where submitted forms are sent from ‘notify@old.com’ to ‘notify@defra.gov.uk’.",
      note: "Personal mailbox replaced with the shared team inbox.",
      timestamp: "2024-05-08T11:00:00.000Z",
      byline: "Chris Smith",
    },
    {
      id: "seed-created",
      label: "Form created",
      text: "Created the form ‘Employee Onboarding’.",
      note: null,
      timestamp: "2024-05-08T09:00:00.000Z",
      byline: "Alex Patel",
    },
  ];
}

function getState(req) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.notesInHistory) {
    req.session.data.notesInHistory = {
      formStatus: "live-draft",
      notificationEmail: "notify@defra.gov.uk",
      events: seedEvents(),
      successBanner: null,
    };
  }
  return req.session.data.notesInHistory;
}

function takeBanner(state) {
  const banner = state.successBanner;
  state.successBanner = null;
  return banner;
}

function toTimelineItem(event) {
  const item = {
    label: { text: event.label },
    datetime: { timestamp: event.timestamp, type: "datetime" },
    byline: { text: event.byline },
  };
  if (event.html) {
    item.html = event.html;
  } else {
    const html = eventHtml(event.text, event.note);
    if (html) {
      item.html = html;
    } else if (event.text) {
      item.text = event.text;
    }
  }
  return item;
}

function addEvent(state, event) {
  state.events.unshift({
    id: "evt-" + Date.now() + "-" + Math.random().toString(16).slice(2),
    timestamp: new Date().toISOString(),
    byline: "Chris Smith",
    note: null,
    text: null,
    ...event,
  });
}

function cleanReason(value) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
}

router.get(`${BASE}`, function (req, res) {
  res.render(`${VIEW}/index.html`);
});

router.get(`${BASE}/reset`, function (req, res) {
  if (req.session.data) {
    delete req.session.data.notesInHistory;
  }
  getState(req).successBanner = "Prototype reset.";
  res.redirect(`${BASE}/overview`);
});

router.get(`${BASE}/overview`, function (req, res) {
  const state = getState(req);
  const recent = state.events.slice(0, 4).map(toTimelineItem);
  res.render(`${VIEW}/overview.html`, {
    formStatus: state.formStatus,
    notificationEmail: state.notificationEmail,
    recentTimelineItems: recent,
    successBanner: takeBanner(state),
  });
});

router.get(`${BASE}/history`, function (req, res) {
  const state = getState(req);
  res.render(`${VIEW}/history.html`, {
    timelineItems: state.events.map(toTimelineItem),
    successBanner: takeBanner(state),
  });
});

router.get(`${BASE}/make-live`, function (req, res) {
  const state = getState(req);
  res.render(`${VIEW}/make-live.html`, {
    notificationEmail: state.notificationEmail,
  });
});

router.post(`${BASE}/make-live`, function (req, res) {
  const state = getState(req);
  const reason = cleanReason(req.body.changeReason);
  const replacing = state.formStatus === "live-draft" || state.formStatus === "live";

  addEvent(state, {
    label: replacing ? "Replaced live form" : "Form made live",
    text: replacing
      ? "Made the draft live. This replaced the previous live form."
      : "Made the form live.",
    note: reason,
  });

  state.formStatus = "live";
  state.successBanner = reason
    ? "Draft made live. Your note was added to form history."
    : "Draft made live.";
  res.redirect(`${BASE}/history`);
});

router.get(`${BASE}/close`, function (req, res) {
  res.render(`${VIEW}/close.html`);
});

router.post(`${BASE}/close`, function (req, res) {
  const state = getState(req);
  const reason = cleanReason(req.body.changeReason);

  addEvent(state, {
    label: "Form closed",
    text: "Closed the form. People trying to use it now see a service unavailable page.",
    note: reason,
  });

  state.formStatus = "closed";
  state.successBanner = reason
    ? "Form closed. Your note was added to form history."
    : "Form closed.";
  res.redirect(`${BASE}/history`);
});

router.get(`${BASE}/change-email`, function (req, res) {
  const state = getState(req);
  res.render(`${VIEW}/change-email.html`, {
    notificationEmail: state.notificationEmail,
    errors: {},
  });
});

router.post(`${BASE}/change-email`, function (req, res) {
  const state = getState(req);
  const email = String(req.body.notificationEmail || "").trim();
  const reason = cleanReason(req.body.changeReason);

  if (!email || !email.includes("@")) {
    return res.render(`${VIEW}/change-email.html`, {
      notificationEmail: email,
      changeReason: req.body.changeReason,
      errors: { notificationEmail: "Enter an email address" },
    });
  }

  const previous = state.notificationEmail;
  if (previous !== email) {
    addEvent(state, {
      label: "Notification email updated",
      text: `Changed where submitted forms are sent from ‘${previous}’ to ‘${email}’.`,
      note: reason,
    });
    state.notificationEmail = email;
    state.successBanner = reason
      ? "Email address updated. Your note was added to form history."
      : "Email address updated.";
  } else {
    state.successBanner = "Nothing was changed.";
  }

  res.redirect(`${BASE}/history`);
});

router.get(`${BASE}/add-note`, function (req, res) {
  res.render(`${VIEW}/add-note.html`, { errors: {} });
});

router.post(`${BASE}/add-note`, function (req, res) {
  const state = getState(req);
  const noteText = String(req.body.noteText || "").trim();

  if (!noteText) {
    return res.render(`${VIEW}/add-note.html`, {
      errors: { noteText: "Enter a note" },
    });
  }

  addEvent(state, {
    label: "Internal note added",
    text: noteText,
    note: null,
  });

  state.successBanner = "Note added to form history.";
  res.redirect(`${BASE}/history`);
});

module.exports = router;
