# Token List — PDF Generation Handoff

_Canonical mapping between template `{{tokens}}`, Zod schema paths (`src/lib/free-plan.schema.ts`), and PDF form field names. Use this to wire `pdf-lib` against the locked templates in `templates/`._

---

## How to use this file

- **Template token** = the `{{token}}` literal appearing in `templates/rbp_basic.en-es.md`, `templates/poa_tn.en-es.md`, `templates/poa_ms.en-es.md`.
- **Schema path** = the path inside the validated payload from `submitFreePlan`. Use exactly this path to read the value.
- **PDF field name** (if going the fillable-PDF route) = token name without braces. Identical strings.
- **Repeaters** are 1-indexed. Children N=1..20, emergency contacts N=1..5, document locations N=1..30. If the payload array is shorter than the max, the unfilled rows must render as blank (or be hidden if rendering from markdown).
- **Effectiveness tokens** are checkbox-style: exactly one of `effective_immediately` / `effective_on_incapacity` renders as ☒, the other as ☐, driven by `payload.effectiveness`.
- **Server-injected tokens** (`state`, `language`, `generated_date`) are not on the payload — inject them at render time.
- **Spanish lines** carry the same `{{token}}` literals as English. Same payload values fill both. No language-specific tokens.

---

## Principal

| Template token | Schema path | PDF field name | Required |
|---|---|---|---|
| `{{principal_first}}` | `payload.principal.first_name` | `principal_first` | yes |
| `{{principal_last}}` | `payload.principal.last_name` | `principal_last` | yes |
| `{{principal_dob}}` | `payload.principal.dob` | `principal_dob` | yes (YYYY-MM-DD) |
| `{{principal_address}}` | `payload.principal.address` | `principal_address` | yes |
| `{{principal_county}}` | `payload.principal.county` | `principal_county` | yes |
| `{{principal_phone}}` | `payload.principal.phone` | `principal_phone` | yes |
| `{{principal_email}}` | `payload.principal.email` | `principal_email` | yes |

## Primary agent

Relationship is **required** for primary agent.

| Template token | Schema path | PDF field name | Required |
|---|---|---|---|
| `{{agent_first}}` | `payload.primary_agent.first_name` | `agent_first` | yes |
| `{{agent_last}}` | `payload.primary_agent.last_name` | `agent_last` | yes |
| `{{agent_address}}` | `payload.primary_agent.address` | `agent_address` | yes |
| `{{agent_phone}}` | `payload.primary_agent.phone` | `agent_phone` | yes |
| `{{agent_relationship}}` | `payload.primary_agent.relationship` | `agent_relationship` | yes |

## Successor agent (optional)

If `payload.successor_agent` is absent or null, hide the entire successor section in the rendered PDF. If present, `first_name` and `last_name` are guaranteed; address/phone/relationship may be empty strings.

| Template token | Schema path | PDF field name | Required when block present |
|---|---|---|---|
| `{{agent2_first}}` | `payload.successor_agent.first_name` | `agent2_first` | yes |
| `{{agent2_last}}` | `payload.successor_agent.last_name` | `agent2_last` | yes |
| `{{agent2_address}}` | `payload.successor_agent.address` | `agent2_address` | no |
| `{{agent2_phone}}` | `payload.successor_agent.phone` | `agent2_phone` | no |
| `{{agent2_relationship}}` | `payload.successor_agent.relationship` | `agent2_relationship` | no |

## Second successor agent (optional)

Same hide-if-absent rule as successor agent.

| Template token | Schema path | PDF field name | Required when block present |
|---|---|---|---|
| `{{agent3_first}}` | `payload.second_successor.first_name` | `agent3_first` | yes |
| `{{agent3_last}}` | `payload.second_successor.last_name` | `agent3_last` | yes |
| `{{agent3_address}}` | `payload.second_successor.address` | `agent3_address` | no |
| `{{agent3_phone}}` | `payload.second_successor.phone` | `agent3_phone` | no |
| `{{agent3_relationship}}` | `payload.second_successor.relationship` | `agent3_relationship` | no |

## Effectiveness (checkboxes)

Driven by `payload.effectiveness`, which is exactly one of `'immediately'` or `'on_incapacity'`. Render the selected option as ☒, the other as ☐.

| Template token | Renders as ☒ when | Renders as ☐ when |
|---|---|---|
| `{{effective_immediately}}` | `payload.effectiveness === 'immediately'` | otherwise |
| `{{effective_on_incapacity}}` | `payload.effectiveness === 'on_incapacity'` | otherwise |

## Children (repeater, 1–20)

`payload.children` is an array of `{ name, dob, school }`. Iterate N = 1..20. For N ≤ `payload.children.length`, fill from `payload.children[N-1]`. For N > length, leave fields blank (or hide row entirely in markdown render).

| Template token (N = 1..20) | Schema path | PDF field name |
|---|---|---|
| `{{child_N_name}}` | `payload.children[N-1].name` | `child_N_name` |
| `{{child_N_dob}}` | `payload.children[N-1].dob` (YYYY-MM-DD) | `child_N_dob` |
| `{{child_N_school}}` | `payload.children[N-1].school` | `child_N_school` |

## Emergency contacts (repeater, 1–5)

`payload.emergency_contacts` is an array of `{ name, relationship, phone }`. Same iteration pattern, max 5.

| Template token (N = 1..5) | Schema path | PDF field name |
|---|---|---|
| `{{emergency_N_name}}` | `payload.emergency_contacts[N-1].name` | `emergency_N_name` |
| `{{emergency_N_relationship}}` | `payload.emergency_contacts[N-1].relationship` | `emergency_N_relationship` |
| `{{emergency_N_phone}}` | `payload.emergency_contacts[N-1].phone` | `emergency_N_phone` |

## Document locations (repeater, 1–30)

`payload.document_locations` is an array of `{ label, location }`. Max 30.

| Template token (N = 1..30) | Schema path | PDF field name |
|---|---|---|
| `{{doc_N_label}}` | `payload.document_locations[N-1].label` | `doc_N_label` |
| `{{doc_N_location}}` | `payload.document_locations[N-1].location` | `doc_N_location` |

## Server-injected (not on payload)

Set these at render time, not from the user's payload.

| Template token | Source | Notes |
|---|---|---|
| `{{state}}` | `contact.state` from `free_plan_contacts` row | `'MS'` or `'TN'` |
| `{{language}}` | `contact.language` | `'en'` or `'es'` — controls which language renders first if you ever go single-language; for v1 both render side-by-side regardless |
| `{{generated_date}}` | server `Date.now()` formatted YYYY-MM-DD | shown on cover sheet only |

---

## Rendering rules

1. **Bilingual side-by-side preserved.** Both English and Spanish lines render in every output. Do not skip Spanish based on `language`.
2. **Hide-if-absent blocks.** Successor agent and second successor agent sections are entirely hidden when the payload field is null/absent. Do not render an empty block with blank fields.
3. **Repeater blank rows.** For children, emergency contacts, and document locations: unfilled rows must not display as visible underscores or empty cells in the rendered PDF. Hide the row, or compress to fit only filled rows.
4. **Page-break hints.** Markdown source contains `<!-- pagebreak -->` HTML comments. Honor these as hard page breaks. Critical: signature block must never split from the notary acknowledgment block.
5. **Date format split.** Notary acknowledgment date blanks are traditional (`___ day of ________, 20___`) — do not auto-fill these. The user fills them at notarization. Only `{{generated_date}}` on the cover sheet uses the YYYY-MM-DD machine format.
6. **Effectiveness checkboxes.** Exactly one of the two effectiveness tokens renders as ☒. Render the other as ☐. The two boxes must both appear (so a reader can see the unchecked option).
7. **PII sanitization.** Strip control characters and HTML from every user-input field before rendering. Do not interpret tokens inside user input — treat user input as literal text.

---

## Template files (source of truth)

- `templates/rbp_basic.en-es.md`
- `templates/poa_tn.en-es.md`
- `templates/poa_ms.en-es.md`

Each ends with a `## VERIFIED — locked` block (statutory cites, durability magic words, notary acknowledgment) and a `## Open questions for Taylor` block. The VERIFIED block is rendered into the document; the Open Questions block is **not** rendered — strip before output.

---

## What's not in the payload (do not invent)

- No attorney signature, attorney bar number, or law firm metadata in the document body. These are part of the template static content if needed at all.
- No witness names, addresses, or signatures pre-filled. Witness blocks are blank lines in the rendered PDF for handwritten completion (UDPAA: witnesses optional, marked as such in the templates).
- No notary information. Notary acknowledgment is signed by the notary at execution; render the form blank.
