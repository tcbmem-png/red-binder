# Handoff — Footer "State of the Law" block (EN + ES)

*For the build (CC). Adds a standing block to the global `SiteFooter` that points readers to live trackers of detention/removal law instead of stating volatile law in static copy. Attorney-reviewed copy below; ship as-is. Last reviewed by counsel: June 2026.*

---

## Why this shape (read first)

The ask was "current state of the law on detaining and removing people." The trap is that this area is moving week to week — sometimes overnight by court order (e.g., the expedited-removal expansion was enjoined Aug. 29, 2025 in *Make the Road v. Noem*, appeal pending). **Any specific legal claim baked into a static footer is stale the week we ship it, and stale law on a detention site is a liability, not a help.**

So this block does not assert the law. It does three honest things: (1) tells the reader the law is changing fast and this site is not real-time, (2) points to the people who track it as it moves, (3) carries a "last reviewed by counsel" date so freshness is visible. Low-maintenance, accurate indefinitely, and on-voice.

---

## Placement

- Global `SiteFooter`, its own block **above** the existing privacy line / not-legal-advice disclaimer / TCB line. Reads: **state-of-the-law block → privacy → not-legal-advice → TCB initiative line**, each quieter than the last.
- Compact by default. A short heading + one sentence + a small link list. It should not dominate the footer.
- Localized — EN copy on the EN builder, ES copy on the ES builder, same as the rest of the footer.
- Links: open in a new tab, `rel="noopener noreferrer"`. **Outbound links only — no third-party scripts, embeds, iframes, or trackers.** This block must not violate gate #3 (no `fetch`/`sendBeacon`/storage / no third-party origins). Plain anchor tags.
- The "Last reviewed" date should be a single editable constant/token, not hardcoded in five places — so counsel can bump it on each legal pass.

---

## EN copy (ship as-is)

**The law here is changing fast**

Immigration detention and removal rules shift week to week — sometimes overnight, by court order. This site is reviewed by a licensed attorney, but it is not updated in real time, and nothing here is legal advice. For the current state of the law, follow the people who track it as it moves:

- **Immigration Review** — weekly case-law podcast (U.S. Supreme Court, BIA, and all Circuits, every Monday), from Kurzban Kurzban Tetzeli & Pratt. → https://www.kktplaw.com/immigration-review-podcast/
- **American Immigration Council — Litigation** — court challenges to detention and expedited removal, with current case status. → https://www.americanimmigrationcouncil.org/litigation/
- **Immigration Policy Tracking Project** — a running record of every federal immigration policy change. → https://immpolicytracking.org/
- **National Immigration Project (NIPNLG)** — practice advisories on detention, stipulated removal, and expedited removal. → https://nipnlg.org/work/resources
- **AILA** — practice alerts from immigration lawyers nationwide. → https://www.aila.org/

*Last reviewed by counsel: June 2026. If something here conflicts with what a lawyer tells you about your case, listen to the lawyer.*

---

## ES copy (ship as-is)

**La ley aquí está cambiando rápido**

Las reglas sobre detención y deportación de inmigrantes cambian de semana a semana — a veces de un día para otro, por orden de un tribunal. Un abogado con licencia revisa este sitio, pero no se actualiza en tiempo real, y nada aquí es asesoría legal. Para conocer el estado actual de la ley, siga a quienes lo monitorean al momento:

- **Immigration Review** — pódcast semanal de jurisprudencia (Corte Suprema de EE. UU., BIA y todos los Circuitos, cada lunes), de Kurzban Kurzban Tetzeli & Pratt. → https://www.kktplaw.com/immigration-review-podcast/
- **American Immigration Council — Litigios** — demandas judiciales sobre detención y deportación acelerada, con el estado actual de cada caso (en inglés). → https://www.americanimmigrationcouncil.org/litigation/
- **Immigration Policy Tracking Project** — registro continuo de cada cambio en la política migratoria federal (en inglés). → https://immpolicytracking.org/
- **National Immigration Project (NIPNLG)** — guías prácticas sobre detención, orden estipulada de deportación y deportación acelerada (en inglés). → https://nipnlg.org/work/resources
- **AILA** — alertas de abogados de inmigración a nivel nacional (en inglés). → https://www.aila.org/

*Última revisión por un abogado: junio de 2026. Si algo aquí contradice lo que un abogado le dice sobre su caso, hágale caso al abogado.*

> ES note: this is pointer copy, not the rights script, so it doesn't gate on the Phase-8 §4 sign-off — but flag it for the same ES review pass for consistency. Several targets are English-only; the "(en inglés)" tags are deliberate so a Spanish-first reader isn't surprised.

---

## Links — verified June 18, 2026

| Source | URL | What it tracks | Cadence |
| :-- | :-- | :-- | :-- |
| Immigration Review (KKTP / Kevin A. Gregg) | https://www.kktplaw.com/immigration-review-podcast/ | Published opinions: SCOTUS, BIA, all Circuits | Weekly (Mon) |
| American Immigration Council — Litigation | https://www.americanimmigrationcouncil.org/litigation/ | Active court challenges, injunction status | Ongoing |
| Immigration Policy Tracking Project | https://immpolicytracking.org/ | Every federal immigration policy action | Ongoing |
| National Immigration Project (NIPNLG) | https://nipnlg.org/work/resources | Practice advisories: detention, stipulated/expedited removal | Ongoing |
| AILA | https://www.aila.org/ | Practitioner practice alerts | Ongoing |

All five are independent, reputable, and free to read (AILA gates some member-only content, but its public alerts are open). The KKTP podcast is free on Apple/Spotify/iHeart — link the firm's page so listeners pick their own app.

---

## Build checklist

- [ ] New `SiteFooter` block, localized (EN/ES), placed above the disclaimer stack.
- [ ] Plain anchor links, new tab, `rel="noopener noreferrer"`. No embeds/scripts.
- [ ] "Last reviewed" date as one editable constant (current value: June 2026).
- [ ] Gate #3 clean (no new third-party origins / fetch / storage).
- [ ] Re-run gates (typecheck, lint, format, test) — same green bar as the pages slice.
- [ ] Commit on its own slice; PR → preview; counsel eyeballs before merge.
