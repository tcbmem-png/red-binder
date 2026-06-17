# @red-binder/templates

Bilingual (English / Spanish) markdown templates, grouped by document module:

```
poa/         Power of attorney — universal UPOAA body + state variation; verified MS / TN forms.
detention/   Pocket Plan — wallet_card + binder_page (build phase 5).
rbp/         Red Binder Plan — family emergency overview.
```

These are passed to `@red-binder/engine` as **raw strings** — the engine never reads the
filesystem. The string-export mechanism (a generated typed index over the `.md` files) is
wired in build phase 3, when the app first consumes a template.

## Token / rendering conventions (shared contract — extend, don't break)

- Mustache `{{tokens}}`; the **same** token literals appear on the EN and ES lines.
- ES lines are authored in italics (`*…*`) directly beneath their EN line.
- Repeaters are 1-indexed; unfilled rows render blank or hidden.
- `<!-- pagebreak -->` is a hard page break. A signature block never splits from its
  notary acknowledgment.
- A `## VERIFIED — locked` block records statutory provenance for the implementer and
  attorney; a `## Open questions for Taylor` block is **stripped** before output. Content
  marked `<!-- Internal -->` is not principal-facing.
- Tokens are **globally unique across modules** so the one shared payload never collides.

## Status

DRAFT — for attorney review. The legal content license (CC BY 4.0 or CC0) is pending the
project owner's decision; see the root README.
