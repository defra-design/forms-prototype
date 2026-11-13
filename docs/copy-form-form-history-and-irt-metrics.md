# Copy form — Form history and IRT metrics

**Feature:** Make a copy of this form (live or draft → new draft)  
**Audience:** Form editors (history) and IRT / platform ops (metrics)  
**Date:** 10 Nov 2026  
**Related:** [customer-journey-map-copy-form.md](./customer-journey-map-copy-form.md), [form-overview-copy-poc-before-after.md](./form-overview-copy-poc-before-after.md), [copy-page-form-history-and-irt-metrics.md](./copy-page-form-history-and-irt-metrics.md)

---

## 1. Form history

### Purpose

Record when a form is duplicated so teams can see whether the **live** or **draft** was the source, and that the result is always a **new draft**.

### Prototype

[Form history](http://localhost:3000/titan-mvp-1.2/form-overview/form-history)

### Proposed events

| Event label | When | Detail to show |
|---|---|---|
| **Form copied from live** | User confirms copy with `source=live` | New draft name; copied pages/questions/details; copy is a draft; live URL/status not copied |
| **Form copied from draft** | User confirms copy with `source=draft` | New draft name; only the draft was copied |

On the **new** form’s history, also record creation (e.g. “Form created” / “Draft created from copy”) with a link or reference to the source form name/id when available.

### Example — Form copied from live

**Label:** Form copied from live  
**Byline:** Chris Smith  
**Body:**

> Created a new draft named ‘Employee Onboarding (copy 2)’ from the **live** form.
>
> - Copied all pages, questions and form details  
> - The copy is a draft — it did not go live  
> - Live URL and live status were not copied  

### Content rules

- Always name the **source** (live vs draft).  
- Always state that the result is a draft.  
- Prefer human form titles over internal IDs.  
- Do not imply submissions or live traffic were copied.

---

## 2. IRT metrics page

### Purpose

Dedicated dashboard for **form-level** copy (separate from runner Copy answers and from editor Copy page).

### Prototype

[Copy form metrics](http://localhost:3000/titan-mvp-1.2/metrics/copy-form)

### Primary KPIs

| Metric | Definition |
|---|---|
| **Forms copied** | Confirmed Make a copy of this form actions |
| **From live** | Copies with source = live |
| **From draft** | Copies with source = draft |
| **Unique source forms** | Distinct forms used as a copy source |
| **Editors who copied a form** | Distinct users completing ≥1 form copy |
| **Avg pages in copied forms** | Average page count of source forms |

### Supporting views

1. **Copy source mix** — live vs draft share  
2. **Forms copied by organisation** — form, org, source, copy count, pages in source  
3. **Insights** — always draft; watch `(copy)` names and stale details  

### Instrumentation

| Event | Properties |
|---|---|
| `editor.copy_form` | `sourceFormId`, `newFormId`, `sourceStatus` (`live`\|`draft`), `newFormName`, `pageCount`, `questionCount`, `userId`, `timestamp` |

Keep separate from `editor.copy_page` and runner `copy_answers`.

### Success questions for IRT

- Are most copies from live (expected for “start from production”)?  
- Which orgs / forms are copied most?  
- Do copied forms go live later (funnel: copy → publish)?  
- Rate of copies that still have `(copy)` in the title at publish time?

### Caveats

- Metric numbers are **illustrative**.  
- Form history examples are static until audit logging is wired from `POST /copy-form`.

---

## 3. Links

| Artefact | Path / URL |
|---|---|
| Overview entry (Copy) | `/titan-mvp-1.2/form-overview/copy-poc` |
| Make a copy screen | `/titan-mvp-1.2/form-overview/copy-form?source=live` |
| Form history | `/titan-mvp-1.2/form-overview/form-history` |
| IRT metrics | `/titan-mvp-1.2/metrics/copy-form` |
| Journey map | `docs/customer-journey-map-copy-form.md` |
| Overview before/after | `docs/form-overview-copy-poc-before-after.md` |
| Flow with screenshots | `docs/copy-form-journey-flow-with-screenshots.png` |
| Mermaid / PNG | `docs/copy-form-journey-flow.mmd`, `docs/copy-form-journey-flow.png` |
