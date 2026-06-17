# Principles — Privacy & Data Handling

_Program-wide. Applies to every Red Binder Project tool — the POA, the detention card, anything that comes after. Written once so both build sessions cite the same rule instead of re-deciding it. Drafted 2026-06-17._

---

## The rule

**The person's data stays on the person's device.** Documents are generated client-side, in the browser. By default nothing the user types is stored, transmitted, or logged anywhere we control.

## Why

The audience has a well-founded fear of government data. A tool that quietly collects A-numbers, immigration status, fear-of-return statements, and family contacts is a liability to the very people it claims to help — and a thing that can be subpoenaed, breached, or turned. The credibility of the whole project rests on the data not existing in the first place. Build it to be owned, not rented. Say so plainly, in the UI, in words the user can verify.

## What it means concretely

- **No backend store of user PII.** No database row, no uploaded payload, no document retained on a server.
- **No telemetry on user input.** Analytics, if any, never capture what the user typed. No third-party call carries PII.
- **The shared engine is environment-agnostic.** `packages/engine` is a pure `(payload, template) → PDF bytes` function with no server-only dependency, so the same code runs in the browser. This is what makes client-side generation possible for every tool.
- **Open source.** The code is public so the privacy claims are auditable, not just asserted.
- **On-device convenience only by consent.** If a tool offers to remember entries (e.g. `localStorage` on the user's own device), it's opt-in, clearly labeled, and one click to clear.

## How it applies per tool

- **Detention card:** the strict floor. Zero storage, zero transmission, no exceptions. This is the most sensitive data in the program.
- **POA:** generate client-side wherever possible. If a server path is kept for something the browser can't do (e.g. emailed delivery, follow-up), it must be explicit, minimized, consent-disclosed, purged on a short clock, and never the *only* way to get the document — the user can always produce it with nothing leaving their device.

## The floor

Nothing in the program drops below this: **a user can always create their document with nothing leaving their device.** Any feature that would require otherwise is opt-in, disclosed, and additive — never the default and never mandatory.
