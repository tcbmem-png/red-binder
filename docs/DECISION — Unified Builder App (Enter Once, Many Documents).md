# Decision — Unified Builder App (Enter Once, Many Documents)

_Architecture decision for the Red Binder Project. Locked 2026-06-17 by Taylor. Refines `DECISION — Deploy & Repo (Monorepo + Vercel).md`. The monorepo, shared engine, Vercel deploy, and client-side privacy floor all stand; what changes is that there is **one app**, not two._

---

## Decision

Build **one client-side intake app** — `apps/builder` — where the user enters shared facts once and gets multiple documents (Red Binder Plan, POA, detention card) from a single payload. The backend may run multiple engines/templates; the user sees one form.

This replaces the earlier two-app shape (`apps/poa` + `apps/detention-card`). Less typing, fewer typos, one UI to maintain.

## Why

The project's original RBP builder already produced multiple documents from one form. Extending that to every document type is the natural shape. The shared engine (`(payload, template) → PDF bytes`) was built to be called repeatedly over one payload — fan-out is free.

## What stands (unchanged)

- One open-source monorepo on GitHub; shared `packages/engine` and `packages/templates`.
- **Vercel** deploy. Now **one** Vercel project (one app) instead of two.
- The privacy floor in `PRINCIPLES — Privacy & Data Handling.md`.

## Structure

```
red-binder/
  packages/
    engine/            # pure (payload, template) -> PDF bytes; browser-safe; called once per selected document
    templates/         # bilingual EN/ES templates, grouped by document module:
                       #   templates/poa/*, templates/detention/*, templates/rbp/*
  apps/
    builder/           # THE app: unified conditional intake -> selected PDFs. One Vercel project.
  docs/                # research, specs, principles, decisions
```

## Intake model (this is the point)

1. **Front door:** "What do you want to create?" — pick one or more of: Red Binder Plan, POA, detention card.
2. **Shared core, entered once:** name, DOB, address, county, phone, emergency contacts, agents.
3. **Conditional sections:** document-specific fields appear **only** if that document is selected. A POA-only user never sees an A-number or fear-of-return field. (Data minimization is non-negotiable.)
4. **Review → Generate:** the app runs the engine once per selected template and offers each PDF to print/download. Everything client-side; nothing stored.

## Two rules the unification forces

- **Whole app at the strict floor.** Because one form may now hold A-number, immigration status, and a fear-of-return statement beside POA data, the entire app is client-side only, nothing stored or transmitted. The POA gives up server-side email delivery *inside this app* — acceptable per PRINCIPLES.
- **Outputs stay separate.** The detention card holds the most dangerous data in the program. Shared intake is fine; do **not** auto-bundle the detention card into a POA packet. Each document is its own file the user chooses to print.

## Sequencing

The detention path is the most time-sensitive given current enforcement. Build it so it can ship **first**, independently, behind the document picker — it must not wait on the full 50-state POA to go live.

## Session split

- **POA session (first):** scaffolds the monorepo; builds and commits `packages/engine` to the locked, browser-safe signature; sets up the single Vercel project for `apps/builder`; moves planning docs into `docs/`; and produces the POA **legal content** — `templates/poa/*`, `states.ts`, the 50-state portability matrix. It does **not** build a standalone POA intake UI. Signals when the engine is committed (the handoff gate).
- **Builder session (second, after the gate):** builds `apps/builder` — the unified conditional intake, the shared-core + per-document Zod schema, and the fan-out to selected PDFs — consuming the engine and the POA/detention/RBP templates. Detention path first.

## Schema ownership

A shared **core** schema (entered-once fields) plus per-document **subschemas** (POA, detention, RBP), composed in the Builder app. The Builder session owns the core schema and intake; the POA session owns the POA subschema and templates. Keep the token contract in `HANDOFF — Token List for PDF Generation.md` intact; extend, don't break.
