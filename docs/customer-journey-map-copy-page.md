# Chris journey map — Copy page

**Persona / segment mapped:** Chris — Defra form / content designer editing a multi-page draft in Form Designer  
**Time horizon mapped:** Single in-product task: need to copy a page through rename and validation  
**Map version:** 1.1  
**Last updated:** 2026-11-10  
**Owner:** Forms prototype / titan-mvp-1.2  
**Source data:** Prototype UI and routes only (`copy/page`, `page-overview`, `copy.js`, `clone-form.js`). **Gap:** no user interviews, diary studies, support tickets, or analytics. Emotions and pain points are inferred from the implemented flow and failure modes, not validated with users.

Skill basis: [journey-mapping (Tessl / rampstackco)](https://tessl.io/registry/skills/github/rampstackco/claude-skills/journey-mapping/quality)

---

## Map structure

| Phase | Step | Touchpoint | Goal | Thoughts | Emotion | Pain points | Opportunities |
|---|---|---|---|---|---|---|---|
| Need | Recognise rebuild cost | Editor / page overview | Avoid rebuilding a similar page | “Whole page or just some questions?” | Tedious (2) | Manual rebuild; inconsistency risk | Guide to the right copy tool |
| Discovery | Find Copy page | Page overview actions | Start page duplicate | “Is this the right control?” | Cautious optimism (3) | Competes with other copy actions | Keep page-scoped label + hint |
| Confirmation | Review copy terms | Copy page screen | Decide to proceed | “Will I lose conditions?” | Anxious (2) | No pre-rename; conditions dropped | Name field; stronger conditions warning |
| Execution | Confirm copy | POST copy/page | Get a working duplicate | “Did it work?” | Hopeful (3) | Edge-case redirect to listing | Keep land-on-copy success |
| Orientation | Land on copy | New page overview + banner | Know what happened next | “I’m on the copy — rename it” | Relieved (5) | Soft rename guidance | Focus heading; persist (copy) reminder |
| Adaptation | Edit the copy | Page settings + questions | Fit copy to new purpose | “Do I rebuild conditions?” | Productive / frustrated (3) | Conditions rebuilt manually | Post-copy conditions helper |
| Validation | Check form integrity | Listing / preview | Confirm order and naming | “Did I leave a (copy) name?” | Confident / doubtful (4) | (copy) names linger | Publish hygiene checklist |

---

## Phase 1: Need

### Step: Recognise rebuild cost

- **Touchpoint:** Form editor listing, page overview, existing page content  
- **Goal:** Avoid recreating a near-identical page from scratch  
- **Thoughts:** “Do I need a whole new page, or just some of these questions?” “Will copying keep my conditions?”  
- **Emotion:** Tedious / mildly frustrated  
- **Emotional intensity:** 2  
- **Pain points:** Manual rebuild is slow; near-identical pages drift apart  
- **Opportunities:** Surface when Copy page vs copy questions vs duplicate question is the right tool  

## Phase 2: Discovery

### Step: Find and open Copy page

- **Touchpoint:** Page overview header action (`Copy page`)  
- **Goal:** Start the page-level duplicate  
- **Thoughts:** “Is this the right control?” “Does this copy the whole form?”  
- **Emotion:** Cautious optimism  
- **Emotional intensity:** 3  
- **Pain points:** Action needs a `pageId`; competes mentally with form-level and question-level copy  
- **Opportunities:** Short helper text that this duplicates *this* page only  

## Phase 3: Confirmation

### Step: Review what will be copied

- **Touchpoint:** `/form-editor/copy/page/:pageId`  
- **Goal:** Decide whether the described copy is acceptable  
- **Thoughts:** “Is `(copy)` enough as a temporary name?” “Page conditions will not be copied — do I rely on those?”  
- **Emotion:** Cautious / anxious if conditions matter  
- **Emotional intensity:** 2 (**trough / moment of truth**)  
- **Pain points:** Cannot rename before submit; conditions omitted; empty pages still copyable  
- **Opportunities:** Optional name field; stronger callout when source page has conditions  

## Phase 4: Execution

### Step: Submit copy

- **Touchpoint:** POST `/form-editor/copy/page` → `clonePage`  
- **Goal:** Produce a duplicate after the source page  
- **Thoughts:** “Did it work?” “Where did my new page go?”  
- **Emotion:** Hopeful  
- **Emotional intensity:** 3  
- **Pain points:** Missing page falls back to listing  
- **Opportunities:** Preserve land-on-new-page behaviour  

## Phase 5: Orientation

### Step: Land on the new page

- **Touchpoint:** Page overview `?copied=page` + success banner  
- **Goal:** Confirm success and know the next action  
- **Thoughts:** “Good — I’m on the copy.” “I should rename this before I forget.”  
- **Emotion:** Relief / clarity  
- **Emotional intensity:** 5 (**aha / peak**)  
- **Pain points:** Rename is guidance only  
- **Opportunities:** Focus heading field; keep reminder while title contains `(copy)`  

## Phase 6: Adaptation

### Step: Rename and edit

- **Touchpoint:** Page heading / guidance settings, question list  
- **Goal:** Make the copy fit its new purpose  
- **Thoughts:** “Are question IDs new?” “Do I need to rebuild conditions?”  
- **Emotion:** Productive, or frustrated if conditions were critical  
- **Emotional intensity:** 3  
- **Pain points:** Conditions recreated manually; single-question rename target can feel inconsistent  
- **Opportunities:** “Set up conditions for this page” after copy  

## Phase 7: Validation

### Step: Check order and naming

- **Touchpoint:** Editor listing, preview, conditions UI  
- **Goal:** Confirm the form is coherent before continuing work or publish  
- **Thoughts:** “Is the form longer than intended?” “Did I leave a `(copy)` name?”  
- **Emotion:** Confident if clean; doubtful if incomplete  
- **Emotional intensity:** 4  
- **Pain points:** `(copy)` names leak into reviews; listing success lacks rename prompt  
- **Opportunities:** Draft hygiene for `(copy)` titles; align listing success copy  

---

## Emotional curve

```
Emotion
valence
   5 │                    ● Orientation (aha)
   4 │                              ● Validation
   3 │      ● Discovery  ● Execution  ● Adaptation
   2 │ ● Need    ● Confirmation
   1 │
     └──────────────────────────────────────────
       Need  Disc  Conf  Exec  Ori   Adapt  Val
```

**Peak:** Orientation — lands on the copy with rename guidance.  
**Trough:** Confirmation — conditions will not be copied.  
**Secondary risk:** Adaptation — rebuilding conditions after the fact.

---

## Service blueprint additions

### Need → Discovery
- **Front-stage actions:** User browses page overview and header actions  
- **Back-stage actions:** Session holds `formPages` and `currentPageIndex`  
- **Supporting processes:** Page overview render; MOJ page header actions when `pageId` present  
- **Line of visibility:** User only sees the Copy page control; no explanation of sibling copy paths

### Confirmation
- **Front-stage actions:** User reads summary and confirms or cancels  
- **Back-stage actions:** `uniqueCopyLabel`, question count, proposed insert position  
- **Supporting processes:** `GET /form-editor/copy/page/:pageId`  
- **Line of visibility:** Conditions policy is disclosed in body copy, but severity is not escalated when the source page actually has conditions

### Execution
- **Front-stage actions:** User clicks **Copy page**  
- **Back-stage actions:** `clonePage(..., { identifyCopy, omitConditions })`; splice after source; set `currentPageIndex` to copy; set `copyPageSuccess`  
- **Supporting processes:** `clone-form.js`, session persistence  
- **Line of visibility:** Clone + condition omission is invisible beyond the prior warning

### Orientation → Adaptation → Validation
- **Front-stage actions:** Success banner; rename; edit questions; check listing/preview  
- **Back-stage actions:** Clear one-shot success flags; user mutations to `formPages`  
- **Supporting processes:** Page overview notification; optional listing banner  
- **Line of visibility:** System does not block publish on lingering `(copy)` names or missing rebuilt conditions

---

## Disconnects and gaps

| Issue | Front-stage symptom | Back-stage cause |
|---|---|---|
| Conditions surprise after the fact | User must rebuild branching | `omitConditions: true` strips page conditions on clone |
| Soft rename guidance | `(copy)` titles linger in draft | Success banner only; no forced rename or focus |
| Wrong copy tool chosen | Whole page copied when only questions needed | Sibling actions not differentiated at discovery |

| Claim type | Status |
|---|---|
| Implemented behaviour (insert after, label, omit conditions, land on copy) | Verified from prototype code |
| Emotion valence and pain severity | **Unvalidated** — inferred, needs research |
| Relative frequency of condition-dependent abandon | **Unknown** — no analytics |

---

## Opportunity map

### Critical friction
1. **Conditions dropped without a follow-up task** — Confirmation discloses it, but Orientation/Adaptation do not create a clear next step when the source had conditions.  
2. **Rename is optional in practice** — Aha moment tells users to rename, but nothing keeps them on that task.

### Quick wins
1. Name field on confirmation (mirrors copy-form).  
2. Stronger conditions warning only when the source page has conditions.  
3. Helper text differentiating Copy page vs copy questions.  
4. Align listing success banner with rename guidance.

### Strategic bets
1. Safe “copy with conditions” mode that rewires targets.  
2. Intent detection suggesting question-level copy when that better matches the JTBD.

### Cross-team disconnects
1. Product policy (“never copy page conditions”) vs designer expectation (“duplicate means duplicate behaviour”) — needs an explicit shared rule and UX treatment.

---

## Action plan (suggested)

### Immediate
- [ ] Post-copy conditions follow-up when source had conditions  
- [ ] Focus / persist rename while title contains `(copy)`  

### Near-term
- [ ] Optional name on confirmation  
- [ ] Discovery helper for sibling copy actions  

### Strategic
- [ ] Evaluate condition-preserving copy  
- [ ] Validate this map with 5–8 form designers (journey-mapping workflow step 7)

---

## Flow (as implemented)

```text
Page overview → Copy page → Confirmation
  → Cancel → original page overview
  → Copy page (POST) → clone + insert after + land on copy
    → Success banner + rename guidance → edit → validate in listing/preview
```

## Related prototype files

- `app/views/titan-mvp-1.2/form-editor/copy/page.html`
- `app/views/titan-mvp-1.2/form-editor/page-overview.html`
- `app/routes/titan-mvp-1.2/copy.js`
- `app/lib/titan-mvp-1.2/clone-form.js`
