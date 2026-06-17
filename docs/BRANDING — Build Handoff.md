# Branding — Build Handoff

_Build-ready artifacts for the single Claude Code session. Folds into the master kickoff prompt. Dresses the surfaces in `apps/builder`: the document picker, the entered-once shared core, the conditional POA / detention / RBP sections, the POA state tile map, review → generate → download, and the privacy + clear controls. Honors `rebuild/architecture-canonical.md` (§3b intake model, §7 privacy floor), `DECISION — Unified Builder App`, and `PRINCIPLES — Privacy & Data Handling.md`._

_Scope: tokens, voice/microcopy, naming, entry points. This doc does not touch code, schema, the engine, or the architecture records. Stack assumed: React + Vite + Tailwind + shadcn/ui, client-side, bilingual EN/ES side-by-side. Drafted 2026-06-17._

> **Naming is LOCKED (§3): Pocket Plan for the card, Red Binder Project for the app.** Remaining sign-off flags (red value, EN copy, Spanish reviewer, dark mode) are in §6 — none block the master prompt.

---

## 1. Design tokens

A calm tool with one bold color. Binder red is the **find-me** color — it marks the brand and the single most important action on a screen. It is **not** an alarm color. Alarm/caution is a separate, muted amber, used sparingly. There is intentionally **no second alarm-red** in the system; the most "destructive" action here (Clear everything) is a privacy *relief*, styled calm, never as danger.

Kept deliberately distinct from the other two house systems: **gotcb web** (ink/cream/orange, Georgia/Helvetica) and **TCB Law letterhead** (oxblood, bone, Fraunces/Inter). Three separate looks — do not blend.

### 1a. Semantic color roles (hex is authoritative)

| Role | Hex | Use |
|---|---|---|
| `background` (page) | `#FBF7F1` | Bone. The page ground. Warm near-white. |
| `surface` / card / input | `#FFFFFF` | Cards, inputs, the wallet-card preview. |
| `muted` surface | `#F1ECE4` | Section bands, disabled, subtle fills. |
| `foreground` (text) | `#1F1B1A` | Ink. Body text. |
| `muted-foreground` | `#6B6360` | Steady gray. Captions, helper text, the calm voice. |
| `border` / input border | `#E4DCD0` | Warm hairline. 1px. |
| **`primary`** | `#C8362B` | Binder red. Brand, primary CTA, key action, the mark. |
| `primary-foreground` | `#FBF7F1` | Bone, for text on red. |
| `ring` (focus) | `#C8362B` | Focus ring, 2px, with 2px offset for contrast on red fills. |
| `success` / ready | `#3F6B53` | "Signed", "ready", "cleared". The one moment of relief. |
| `success-bg` / `success-fg` | `#E6EFE9` / `#20382B` | Light fill / text on fill. |
| **`caution`** (= shadcn `destructive`) | `#BE8A3E` | Muted amber. Disclaimers, "must be signed and notarized", clear-confirm. Calm, not red. |
| `caution-bg` / `caution-fg` | `#F5ECDB` / `#5C3F11` | Light fill / text on fill. |
| `info` | `#4A5A6B` | Steel. Neutral informational notes. |
| `info-bg` / `info-fg` | `#E7ECF1` / `#25303B` | Light fill / text on fill. |

Note on `destructive`: shadcn defaults it to a bright red that would collide with `primary` and read as alarm. **Remap shadcn's `--destructive` to the caution amber above** so any stray destructive-variant component stays calm. The Clear-everything control is a quiet outline button with a confirm step — not a red button.

### 1b. shadcn/ui CSS variables (copy-paste into `globals.css`)

shadcn convention: space-separated HSL channels, consumed as `hsl(var(--token))`. Light mode only is specified (the tool is light-first); a dark block can follow later if needed.

```css
@layer base {
  :root {
    --background: 36 55.6% 96.5%;        /* #FBF7F1 bone */
    --foreground: 12 8.8% 11.2%;         /* #1F1B1A ink */

    --card: 0 0% 100%;                   /* #FFFFFF */
    --card-foreground: 12 8.8% 11.2%;
    --popover: 0 0% 100%;
    --popover-foreground: 12 8.8% 11.2%;

    --primary: 4.2 64.6% 47.6%;          /* #C8362B binder red */
    --primary-foreground: 36 55.6% 96.5%;/* bone */

    --secondary: 36.9 31.7% 92%;         /* #F1ECE4 muted band */
    --secondary-foreground: 12 8.8% 11.2%;

    --muted: 36.9 31.7% 92%;             /* #F1ECE4 */
    --muted-foreground: 16.4 5.4% 39.8%; /* #6B6360 steady gray */

    --accent: 140 22% 92%;               /* #E6EFE9 quiet-green tint, subtle hover/selected */
    --accent-foreground: 147.5 27.3% 17.3%;

    --destructive: 35.6 50.8% 49.4%;     /* #BE8A3E caution amber — NOT red (see 1a) */
    --destructive-foreground: 36.8 68.8% 21.4%;

    --border: 36 27% 85.5%;              /* #E4DCD0 */
    --input: 36 27% 85.5%;
    --ring: 4.2 64.6% 47.6%;             /* #C8362B */

    --radius: 0.625rem;                  /* 10px cards; see 1d */
  }
}
```

Functional/semantic colors not in shadcn's base set (success/caution/info) — add as Tailwind tokens (1c) and use directly.

### 1c. Tailwind config (`tailwind.config.ts` → `theme.extend`)

```ts
extend: {
  colors: {
    binder: { DEFAULT: '#C8362B', fg: '#FBF7F1' },
    bone:   '#FBF7F1',
    ink:    '#1F1B1A',
    steady: '#6B6360',
    success: { DEFAULT: '#3F6B53', bg: '#E6EFE9', fg: '#20382B' },
    caution: { DEFAULT: '#BE8A3E', bg: '#F5ECDB', fg: '#5C3F11' },
    info:    { DEFAULT: '#4A5A6B', bg: '#E7ECF1', fg: '#25303B' },
    // POA state tile legend (documentPath) — mirrors states.ts legend
    path: {
      universal:  '#3F6B53',  universalBg:  '#E6EFE9',
      addendum:   '#BE8A3E',  addendumBg:   '#F5ECDB',
      stateForm:  '#4A5A6B',  stateFormBg:  '#E7ECF1',
    },
  },
  fontFamily: {
    sans: ['"Atkinson Hyperlegible"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  borderRadius: { lg: '0.625rem', md: '0.5rem', sm: '0.375rem' },
}
```

### 1d. Typography, radius, spacing

- **Family: Atkinson Hyperlegible** for everything — UI, body, cards, and the wallet card. It's open-source (matches the project's posture), designed for maximum legibility including low-vision readers, and its letterforms resist confusion — which matters on a pocket card read under stress and across two languages with diacritics. Self-host the woff2 in the repo (don't depend on a CDN at runtime; it's a privacy-floor app and an offline-friendly print tool). Fallback stack as in 1c.
- **Weights: 400 and 700 only.** Atkinson Hyperlegible ships Regular and Bold (no medium). Use 700 for headings, labels, and the one primary action; 400 for body. Don't fake a 500.
- **Type scale (rem):** display 2rem · h1 1.5rem · h2 1.25rem · h3 1.125rem · body 1rem · small 0.875rem · micro 0.75rem (12px floor — wallet-card fine print only). Body line-height 1.6.
- **Radius tone:** gently rounded, never pill. 10px cards, 8px inputs/buttons, 6px chips. (Pill shape is reserved for status chips only.)
- **Spacing tone:** generous and unhurried — 4px base unit; section gaps 1.5–2rem. This audience is mostly on phones, often stressed: **touch targets ≥ 44px**, inputs ≥ 44px tall, labels above fields (not placeholder-only). High contrast, large tap zones, no dense legal walls.
- **Red discipline:** red anchors the mark, the brand bar, and the single most important action per screen. It never becomes the background of legal text. Calm pages, one bold thing to reach for.

---

## 2. Voice + core microcopy (EN / ES)

Voice: plain words, periods where others use commas, calm and direct, honest about limits. Dignity, not fear. No funnel-bro language — no scarcity, no "trusted by," no manufactured urgency. Spanish is neutral Latin American, ~8th-grade reading level, equal dignity to English (not stiff legal translation). **All ES strings below are draft and flagged for native bilingual review (§6).**

### 2a. Product + section names

| Surface | EN | ES |
|---|---|---|
| App / project | Red Binder Project | Proyecto La Carpeta Roja |
| Tagline | A plan, before the emergency. | Un plan, antes de la emergencia. |
| Picker (front door) | What do you want to create? | ¿Qué quieres crear? |
| Document: RBP | Red Binder Plan | Plan de la Carpeta Roja |
| Document: POA | Power of attorney — who handles money & home | Poder legal — quién maneja el dinero y la casa |
| Document: detention card | Pocket Plan | Plan de Bolsillo |
| Shared core section | About you and your people | Sobre ti y tu gente |
| POA section | Your state and who you trust | Tu estado y en quién confías |
| Detention section | Your rights and your plan | Tus derechos y tu plan |
| Review step | Check it over | Revísalo |
| Generate | Make my documents | Crear mis documentos |

### 2b. Document picker (multi-select)

- Helper under the heading — EN: "Pick what you need. You can choose more than one. You'll enter your information once." · ES: "Elige lo que necesitas. Puedes elegir más de uno. Pondrás tu información una sola vez."
- Each card carries a one-line plain description + the privacy line (§2d). Picker also accepts a `?doc=` URL param to pre-select a document for deep-linked landing pages (§4) — pre-selected card is shown checked, user can still change it.

Card descriptions:

- RBP — EN: "A simple overview so a trusted person can step in fast." · ES: "Un resumen sencillo para que una persona de confianza pueda ayudar rápido."
- POA — EN: "Lets someone you trust pay rent, reach accounts, and keep the household running if you can't." · ES: "Permite que alguien de confianza pague la renta, use las cuentas y mantenga el hogar si tú no puedes."
- Pocket Plan — EN: "A card you carry and a plan that helps your family reach a lawyer fast — set up before you ever need it." · ES: "Una tarjeta que llevas contigo y un plan para que tu familia localice a un abogado rápido — listo antes de que lo necesites."

### 2c. Buttons / CTAs

| Action | EN | ES |
|---|---|---|
| Primary continue | Continue | Continuar |
| Back | Back | Atrás |
| Add another (repeater) | Add another | Agregar otro |
| Remove row | Remove | Quitar |
| Generate | Make my documents | Crear mis documentos |
| Download one | Download | Descargar |
| Download all | Download all | Descargar todo |
| Print | Print | Imprimir |
| Start over | Start over | Empezar de nuevo |
| Clear everything | Clear everything | Borrar todo |

CTAs name the next concrete action. No "Get started free / Unlock / Claim." It is free; we don't say it like a sale.

### 2d. Privacy notice — the headline trust message

Per PRINCIPLES and §7 of the architecture, this is the core relationship, not fine print. Three registers, all true, never overstated. Show the short line on the picker and review screens; the full panel on first load and on the privacy/about page.

- **Short (persistent, both screens):** EN — "Made on your device. We keep nothing." · ES — "Se crea en tu teléfono. No guardamos nada."
- **Warm (one line under it):** EN — "Your information never leaves your phone." · ES — "Tu información nunca sale de tu teléfono."
- **Full panel:**
  - EN: "Everything happens on your device. We don't have an account system, a database, or a copy of what you type. Your documents are made right here in your browser and only you have them. The code is open — you don't have to take our word for it; anyone can check."
  - ES: "Todo ocurre en tu dispositivo. No tenemos cuentas, ni base de datos, ni una copia de lo que escribes. Tus documentos se crean aquí mismo en tu navegador y solo tú los tienes. El código es público — no tienes que creernos; cualquiera puede verificarlo."
- **If on-device autosave is offered (opt-in, per PRINCIPLES):** EN — "Want this device to remember your answers? It stays only on this device. One tap to erase." · ES — "¿Quieres que este dispositivo recuerde tus respuestas? Se queda solo en este dispositivo. Un toque para borrar." Default off.

### 2e. Disclaimers (legally required, kept honest and calm)

Render in `caution` styling (amber), never red, never buried. The POA disclaimer appears at POA selection, before review, and on the generated document's instruction sheet.

- **Not legal advice (global footer + first load):** EN — "This is a free tool, not legal advice, and using it does not make us your lawyers. For advice about your situation, talk to a licensed attorney." · ES — "Esta es una herramienta gratuita, no es asesoría legal, y usarla no nos convierte en tus abogados. Para consejo sobre tu caso, habla con un abogado con licencia."
- **POA must be signed and notarized:** EN — "A power of attorney does nothing until you sign it in front of a notary, following your state's rules. Printing it is the first step, not the last." · ES — "Un poder legal no tiene efecto hasta que lo firmes ante un notario, según las reglas de tu estado. Imprimirlo es el primer paso, no el último."
- **Pocket Plan limits (honest, never overselling):** EN — "This card can't stop a deportation and isn't a lawyer. What it does: it helps you avoid one mistake — signing away your right to see a judge — and helps your people reach a lawyer fast." · ES — "Esta tarjeta no puede detener una deportación y no es un abogado. Lo que sí hace: te ayuda a evitar un error — renunciar a tu derecho de ver a un juez — y ayuda a tu gente a localizar a un abogado rápido."

### 2f. States — empty, confirm, clear, success, error

| State | EN | ES |
|---|---|---|
| Picker empty (nothing chosen) | Choose at least one to begin. | Elige al menos uno para empezar. |
| Optional field hint | Optional — only if it helps. | Opcional — solo si ayuda. |
| Review intro | Here's what you'll get. Check the details before you make them. | Esto es lo que recibirás. Revisa los detalles antes de crearlos. |
| Generating | Making your documents on this device… | Creando tus documentos en este dispositivo… |
| Success | Done. Your documents are ready to print. Nothing was saved or sent. | Listo. Tus documentos están listos para imprimir. No se guardó ni se envió nada. |
| Clear confirm | Clear everything you've entered? This can't be undone — and that's the point. Nothing was ever stored. | ¿Borrar todo lo que pusiste? No se puede deshacer — y de eso se trata. Nunca se guardó nada. |
| Clear done | Cleared. This device holds nothing. | Borrado. Este dispositivo no guarda nada. |
| Generation error | Something went wrong making the file. Your information is still only on this device. Try again. | Algo salió mal al crear el archivo. Tu información sigue solo en este dispositivo. Inténtalo de nuevo. |

The clear/confirm copy turns a scary "delete" moment into a privacy *reassurance* — consistent with the brand.

### 2g. POA state tile map (documentPath legend)

`states.ts` carries the legend (label/color/EN-ES description) the tile map renders. Suggested labels + the colors from §1c (`path.*`):

| `documentPath` | Color | Label EN / ES | Description EN / ES |
|---|---|---|---|
| `UNIVERSAL` | success green | Ready to use / Listo para usar | Your state works with our standard form. / Tu estado funciona con nuestro formulario estándar. |
| `UNIVERSAL_PLUS_ADDENDUM` | caution amber | One extra page / Una página extra | Your state needs a short add-on page we include. / Tu estado necesita una página adicional que incluimos. |
| `STATE_FORM` | steel info | Your state's own form / Formulario propio de tu estado | Your state requires its own official form. / Tu estado requiere su propio formulario oficial. |

Colors here are functional (a 3-way legend), distinct from brand red so a tile never reads as an action. Amber = "one more step," not "warning."

---

## 3. Naming — LOCKED (Taylor, 2026-06-17)

- **Detention card → `Pocket Plan` / `Plan de Bolsillo`. Locked.** Retire the "DD" working label in all UI. (Red Card / Tarjeta Roja was weighed and set aside for v1; it can be revisited post-launch as a UI-string rename only — no schema/token impact.) Reasons recapped: it never says "detention," it names what the thing is *for* the person (a plan you carry), it's on-brand, and it translates clean and warm. Its two physical pieces:
  - **Pocket Card / Tarjeta de Bolsillo** — what you carry (the one rule + short script; no sensitive info on it, by design).
  - **Binder Page / Página de la Carpeta** — kept at home and with a trusted person (identity details so a lawyer can find you, the decision, and the counsel/trusted-person authorization).
- **App/product name:** keep it simple — **Red Binder Project**, and the act is "start your Red Binder." Recommend **not** minting a separate app name.
- **Strong alternative to weigh before lock:** `Red Card / Tarjeta Roja` (builds a color family with the binder, pre-understood in immigrant communities) — but it overlaps with ILRC's established red cards and ours does more (counsel authorization). Recommend leading with Pocket Plan and letting "red" live in the visual system. **Worth a 1-question check with your immigration-org contacts.**
- ES term check: `carpeta` vs. `fólder`/`cartapacio` for "binder" — `carpeta` travels best; confirm in the §6 Spanish review.

---

## 4. Entry-point framing — two doors, one tool

Two branded landing pages, each deep-linking into the same picker with a document pre-selected via `?doc=` (app-layer routing per §3b; POA content renders identically regardless of entry). Both carry the persistent privacy line. POA is presented first inside the flow.

### Door A — Planning (`?doc=poa`)
For the family thinking ahead; calmer, lower fear; the widest top of funnel.
- EN headline: **Make the plan you hope you never use.** Subhead: "Free documents that let someone you trust care for your kids, your home, and your money if you can't be there. Made on your device. We keep nothing."
- ES headline: **Haz el plan que esperas nunca usar.** Subhead: "Documentos gratis para que alguien de confianza cuide a tus hijos, tu casa y tu dinero si tú no puedes. Se crea en tu teléfono. No guardamos nada."
- Tone: steady, preventive, dignified. First step lands on the picker with POA checked.

### Door B — Right now (`?doc=detention`)
For acute fear (active enforcement, someone taken); urgent but still calm, dignity over fear.
- EN headline: **Know what to do. Don't sign anything until you talk to a lawyer.** Subhead: "A card you carry and a plan that helps your family reach a lawyer fast — set up before you ever need it. Made on your device. We keep nothing."
- ES headline: **Sé qué hacer. No firmes nada hasta hablar con un abogado.** Subhead: "Una tarjeta que llevas contigo y un plan para que tu familia localice a un abogado rápido — listo antes de que lo necesites. Se crea en tu teléfono. No guardamos nada."
- Tone: practical, no fear-mongering. First step lands on the picker with Pocket Plan checked.

Both converge: `landing → picker (pre-selected) → shared core (entered once) → conditional section(s) → review → separate PDFs`. The privacy line rides every screen.

### TCB Law tie (applies to both doors + footer)
Endorsed by, not branded as. Front face is the Red Binder Project's own identity. TCB Law appears quietly where trust needs a name — footer, about, disclaimers: "A TCB Law initiative. Built by Taylor C. Berger, attorney (MS/TN)." Keep it out of the hero, and keep its oxblood/Fraunces letterhead system in its own lane.

---

## 5. How this maps to the build (quick index for the master prompt)

- **Tokens (§1)** → `globals.css` `:root` + `tailwind.config.ts` + self-hosted Atkinson woff2. shadcn `destructive` remapped to caution amber.
- **Microcopy (§2)** → the bilingual string set for picker, core, POA, detention, review, privacy, disclaimers, states. Tokens for documents already globally unique per architecture §3a/§4 — copy attaches to fields, doesn't add tokens.
- **Tile legend (§2g)** → label/color/description for `states.ts` `documentPath` legend; colors from `path.*`.
- **Naming (§3)** → "Pocket Plan" replaces "DD" in UI strings (no schema/token change).
- **Entry points (§4)** → two landing pages + `?doc=` pre-select (app-layer UI; no engine/content constraint).

This dresses surfaces only. It changes no module boundary, no schema, no token contract, no engine type.

---

## 6. Needs Taylor's sign-off

1. **Naming — LOCKED ✓.** Pocket Plan / Plan de Bolsillo (card) and Red Binder Project (app). Settled 2026-06-17; the master prompt can carry these as final. Remaining sign-offs below.
2. **Binder red exact value** — `#C8362B` is the recommendation; approve or adjust. (Seen against TCB oxblood and gotcb orange in the visual board.)
3. **Spanish review** — all ES strings here are draft. Name who does the native bilingual pass (neutral LatAm, ~8th grade), including `carpeta` vs. `fólder`. Architecture §5 already sequences ES as phase 8 after EN sign-off — this just needs a reviewer named.
4. **EN copy sign-off** — confirm the disclaimer wording (not legal advice; POA must be signed/notarized; Pocket Plan limits) reads right to you as the attorney before it ships.
5. **Light-only vs. dark mode** — tokens are specified light-first. Confirm dark mode isn't needed for v1 (recommend skipping it for launch speed).
