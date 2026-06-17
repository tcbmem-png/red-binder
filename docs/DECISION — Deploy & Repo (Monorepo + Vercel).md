# Decision — Deploy & Repo: Monorepo + Vercel

_Architecture decision record for the Red Binder Project. Locked 2026-06-17 by Taylor. Both build sessions (POA and detention card) follow this. Supersedes any earlier assumption that Lovable hosts the apps._

---

## Decision

- **One open-source monorepo on GitHub.** Shared `packages/engine`; `apps/poa` and `apps/detention-card` built on top of it.
- **Deploy with Vercel.** Each app is its own Vercel project pointed at its subdirectory in the same repo.
- **Lovable is dropped entirely** — no longer the host, no longer in the build loop. Building happens in Claude Code.

## Why

The shared engine is the expensive, hard-to-reverse decision — it's what makes this a platform instead of two one-off apps. Both apps import it directly, no publish step, one place to fix a rendering bug. The deploy target is the cheap, replaceable decision.

Lovable maps one project to one repo with the app at the repo root; it can't natively deploy an app from a subdirectory of a monorepo. Keeping Lovable would have meant either abandoning the shared monorepo or publishing the engine as a versioned package and carrying a bump-and-sync cycle. Since the build already moved to Claude Code, Lovable's only residual job was hosting — and hosting is a commodity. Vercel deploys a monorepo subdirectory natively. Dropping Lovable is the smallest possible loss and lands cleaner with "build to be owned, not rented."

## Structure

```
red-binder/                      # one public GitHub repo
  packages/
    engine/                      # shared: token-fill, repeaters, pagebreaks, EN/ES layout, pdf-lib draw
                                 # pure (payload, template) -> PDF bytes; NO server-only deps; runs in browser
    templates/                   # bilingual EN/ES markdown templates ({{tokens}}, <!-- pagebreak -->)
  apps/
    poa/                         # national POA app  -> Vercel project #1 (Root Directory: apps/poa)
    detention-card/              # detention card app -> Vercel project #2 (Root Directory: apps/detention-card)
  docs/                          # research, specs, principles, decisions (the .md files)
```

## How Vercel deploys this

- Two Vercel projects, **same repo**. In each project's settings, set **Root Directory** to the app folder (`apps/poa`, `apps/detention-card`).
- Use a workspace tool (pnpm workspaces, optionally Turborepo) so each app resolves `packages/engine` and `packages/templates` as workspace dependencies. Vercel builds the shared packages as part of the app build — no publish step.
- Each app gets its own domain/preview deploys independently. A change to `packages/engine` triggers rebuilds of both apps (that's the point — one engine, both apps current).

## What this doesn't change

- **Privacy floor holds.** See `PRINCIPLES — Privacy & Data Handling.md`. Vercel hosts the static/edge front end; the detention card still generates PDFs entirely client-side and stores nothing. Vercel hosting the page does not mean any PII reaches a server.
- **The engine contract holds.** `(payload, template) → PDF bytes`, environment-agnostic, no server-only dependency, browser-capable. This is what lets the detention card run fully client-side and lets the POA generate client-side too.

## Open items for `architecture-canonical.md` (POA session owns)

1. Confirm workspace tool (pnpm vs pnpm+turbo) and Node/package-manager versions.
2. Final engine function signature and the module boundary (what's in `engine` vs. in an app).
3. Who scaffolds the repo and when, and the protocol for changes to `packages/engine` so two sessions don't collide.
4. The national 50-state template/token strategy for the POA (detention card is federal — no state split — but must not break the shared token contract).
