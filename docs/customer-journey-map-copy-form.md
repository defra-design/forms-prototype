# Chris journey map — Copy form

**Persona / segment mapped:** Chris — Defra form / content designer managing live and draft forms in Form Designer  
**Time horizon mapped:** Single in-product task: need a new form based on an existing one through rename and draft review  
**Map version:** 1.0  
**Last updated:** 2026-11-10  
**Owner:** Forms prototype / titan-mvp-1.2  
**Source data:** Prototype UI and routes (`form-overview/copy-poc`, `copy/form`, `copy.js`, `clone-form.js`). **Gap:** no user interviews or analytics. Emotions inferred from the implemented flow.

Skill basis: journey-mapping (Tessl / rampstackco) + customer-journey-map skill

---

## Persona

| | |
|---|---|
| **Role** | Builds and maintains GOV.UK-style application forms |
| **Context** | On form overview for a live and/or draft form |
| **JTBD** | When I need a new form that reuses an existing structure (variant scheme, new year, similar licence), I want to copy the live or draft form into a new draft so I can adapt it safely without changing the original |
| **Success looks like** | A new **draft** exists with a clear name; pages/questions/details copied; live status and live links are **not** inherited; prompted to check org/team/support/privacy |

---

## Journey stages

| Stage | Description |
|---|---|
| **1. Need** | Needs a new form based on an existing one |
| **2. Discovery** | Finds Copy on draft and/or live status cards |
| **3. Source choice** | Chooses draft vs live as the copy source |
| **4. Naming** | Reviews guidance and names the new form |
| **5. Execution** | Confirms Make a copy |
| **6. Orientation** | Lands on the new draft overview with success banner |
| **7. Validation** | Checks details, history, and edits the draft |

---

## Journey map table

| Stage | Touchpoint | User action | Emotion (valence) | Pain point | Opportunity |
|---|---|---|---|---|---|
| Need | Library / overview | Decide to reuse an existing form | Tedious (2) | Rebuilding from scratch | Surface Copy beside Create draft |
| Discovery | Overview status cards | Find **Copy** on Draft / Live | Curious (3) | Two Copy actions when Draft+Live | Clear labels: Copy draft / Copy live |
| Source choice | Draft vs live Copy links | Pick which version to clone | Cautious (3) | Unsure live vs draft differences | Short helper: live copy ≠ take live offline |
| Naming | Make a copy of this form | Edit suggested name; read checks | Focused (3) | Easy to leave `(copy)` name | Required rename validation before publish |
| Execution | POST copy-form | Submit Make a copy | Hopeful (4) | Session swap to new form may surprise | Keep success message explicit about draft |
| Orientation | New overview + banner | Read success; see new draft only | Relieved (5) | Must still verify org/privacy details | Checklist deep-links after copy |
| Validation | Details + history + editor | Review and edit | Confident / doubtful (4) | Copied stale support/privacy content | Highlight fields to review |

---

## Critical moments

| Moment | Where | What happens |
|---|---|---|
| **Aha** | Success on new overview | “Live/Draft form copied as … The copy is a draft.” |
| **Moment of truth** | Source choice | Live vs draft — wrong source = wrong content |
| **Moment of truth** | Naming + guidance | Confirm org/team/support/privacy still correct |
| **Drop-off** | Naming | Cancel if unsure about creating another form |
| **Churn risk** | After copy | Leaving `(copy)` name or stale privacy/support details |

---

## Emotional curve

```
valence
   5 │                         ● Orientation
   4 │                   ● Exec      ● Validation
   3 │     ● Disc  ● Source  ● Naming
   2 │ ● Need
   1 │
     └────────────────────────────────────────
```

---

## Service blueprint (summary)

| Phase | Front-stage | Back-stage | Supporting systems |
|---|---|---|---|
| Discovery | Copy links on Draft / Live cards | Render status from `form.status` | Overview copy-poc |
| Naming | Name field + guidance | `uniqueCopyLabel`; `source=live\|draft` | GET `/copy-form` |
| Execution | Make a copy | Push `formCopyHistory`; `cloneFormSessionSlice`; always Draft | POST `/copy-form` |
| Orientation | Success banner on new form | Session replaced with cloned slice; `copySuccessMessage` | Overview `?copied=form` |

**Line of visibility:** Copy is always a new draft — never inherits live status or live URLs — disclosed in success copy, not strongly on the confirmation screen when source is live.

---

## Flow (as implemented)

```text
Form overview (copy-poc)
  → Copy draft  OR  Copy live
    → Make a copy of this form (name + checks)
      → Cancel → overview
      → Make a copy (POST)
        → clone session as new draft
        → Overview of NEW form (?copied=form)
          → Success banner
          → Edit draft / review details
```

**Behaviour notes**

- Suggested name uses unique `(copy)` / `(copy N)`.
- Copy is always **Draft**.
- Live copy message: `Live form copied as “…”. The copy is a draft.`
- Draft copy message: `Draft copied as “…”. Only the draft was copied.`
- Pages, questions, conditions, sections, and form details are cloned; live links are not.

---

## Opportunity map

### Critical friction
1. Dual Copy actions (draft vs live) without strong explanation of difference.  
2. Soft guidance to check org/support/privacy — easy to skip.  
3. `(copy)` names can persist into library and publish paths.

### Quick wins
1. Confirmation line stating source: “Copying the **live** version” / “Copying the **draft** version”.  
2. Post-copy checklist with links to organisation, support, privacy.  
3. Keep success banner until user edits the form name away from `(copy)`.

### Strategic bets
1. Optional “copy without responses history / without conditions” modes if product needs lighter clones.  
2. Library-level “Duplicate form” with same naming flow.

---

## Related files

- Overview UI changes (before/after): [`form-overview-copy-poc-before-after.md`](./form-overview-copy-poc-before-after.md)
- `app/views/titan-mvp-1.2/form-editor/copy/form.html`
- `app/views/titan-mvp-1.2/form-overview/copy-poc.html`
- `app/views/titan-mvp-1.2/form-overview/includes/_form-status-copy-poc.html`
- `app/routes/titan-mvp-1.2/copy.js`
- `app/lib/titan-mvp-1.2/clone-form.js`
