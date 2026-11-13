# Copy page — Form history and IRT metrics

**Feature:** Editor copy (page, question, questions-from-page, form)  
**Audience:** Form editors (history) and IRT / platform ops (metrics)  
**Date:** 10 Nov 2026  
**Related:** [customer-journey-map-copy-page.md](./customer-journey-map-copy-page.md)

---

## 1. Form history

### Purpose

Show an auditable record when someone duplicates content in a form draft, so teammates can see what changed and that **conditions were not copied**.

### Prototype

[Form history](http://localhost:3000/titan-mvp-1.2/form-overview/form-history)

### Proposed events

| Event label | When it is written | Detail to show |
|---|---|---|
| **Page copied** | User confirms **Copy page** | Source page number + heading; new heading (`(copy)`); insert position; question count; “Page conditions were not copied” |
| **Question duplicated** | User confirms **Duplicate question** | Original and new labels; page context; conditions using the original were not copied |
| **Questions copied from another page** | User confirms cross-page question copy | Source page; destination page; list of question labels; associated conditions not copied |
| **Form copied** | User confirms **Make a copy of this form** | New draft name; that pages/questions/details were copied; copy is a draft |

### Example — Page copied

**Label:** Page copied  
**Byline:** Chris Smith  
**Body:**

> Copied page 4, ‘Business address’, as ‘Business address (copy)’.
>
> - Inserted after page 4  
> - Copied 3 questions  
> - Page conditions were not copied  

### Content rules

- Prefer the **visible page heading** (or single-question label) over internal IDs in the timeline.
- Always state when conditions were omitted — this is a support and audit hotspot.
- Group rapid edits as today (“Draft edited 3 times…”) only for minor renames after copy; the copy action itself stays a distinct event.
- Form-level copy appears on the **source** form’s history and should also appear as “Form created” (or equivalent) on the **new** draft’s history.

### Out of scope for v1 history

- Logging cancelled confirmation screens  
- Diff of every cloned question field  
- Reconstructing omitted conditions automatically  

---

## 2. IRT metrics page

### Purpose

Give IRT a feature dashboard for **editor copy** adoption and mix (distinct from runner **Copy answers**).

### Prototype

[Copy page metrics](http://localhost:3000/titan-mvp-1.2/metrics/copy-page)

Lives under **Defra Form Designer metrics** with the same 7 / 30 / all-time tabs as other feature metrics.

### Primary KPIs

| Metric | Definition |
|---|---|
| **Pages copied** | Confirmed Copy page actions |
| **Questions duplicated** | Confirmed same-page duplicate question actions |
| **Questions copied across pages** | Confirmed copy-questions-from-another-page actions (count actions, or questions — prototype shows actions; table notes average questions) |
| **Forms copied** | Confirmed Make a copy of this form actions |
| **Forms with any editor copy** | Distinct forms with ≥1 editor copy event in the period |
| **Editors using copy** | Distinct users who completed ≥1 editor copy event |

### Supporting views

1. **Copy actions by type** — share of page / question / cross-page / form  
2. **Pages copied by form** — form, organisation, status, pages copied, average questions per page copy  
3. **Insights callout** — conditions never copied; watch support friction  

### Instrumentation (recommended events)

| Event name | Key properties |
|---|---|
| `editor.copy_page` | `formId`, `sourcePageId`, `newPageId`, `questionCount`, `hadPageConditions` (bool), `userId`, `timestamp` |
| `editor.duplicate_question` | `formId`, `pageId`, `sourceQuestionId`, `newQuestionId`, `hadQuestionConditions`, `userId` |
| `editor.copy_questions_from_page` | `formId`, `sourcePageId`, `targetPageId`, `questionIds[]`, `userId` |
| `editor.copy_form` | `sourceFormId`, `newFormId`, `sourceStatus` (`live`\|`draft`), `pageCount`, `userId` |

Do **not** conflate these with runner `copy_answers` metrics.

### Success questions for IRT

- Is page copy the dominant reuse path vs rebuilding pages?  
- Which forms / orgs drive volume?  
- After launch, do support contacts about missing conditions rise? (`hadPageConditions: true` rate vs tickets)  
- Are empty-page copies common (possible misfire)?  

### Gaps / prototype caveats

- Numbers on the metrics page are **illustrative**, not live telemetry.  
- Subnav “Copy page” is wired on the new page and Copy answers; other metrics pages should gain the same link as they are next touched.  
- Form history entries in the prototype are **static examples** until copy routes write to a real audit log.

---

## 3. Links

| Artefact | Path / URL |
|---|---|
| Form history UI | `/titan-mvp-1.2/form-overview/form-history` |
| IRT metrics UI | `/titan-mvp-1.2/metrics/copy-page` |
| Journey map | `docs/customer-journey-map-copy-page.md` |
| Flow with screenshots | `docs/copy-page-journey-flow-with-screenshots.png` |
