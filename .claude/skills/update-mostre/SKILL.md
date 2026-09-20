---
name: update-mostre
description: >-
  Refresh public/mostre.json with current and upcoming Milan exhibitions,
  museums, galleries and cultural sites, then publish it live. Use whenever the
  user asks to update or refresh the exhibitions data — e.g. "/update-mostre",
  "update mostre.json", "refresh the exhibitions", "add any news".
---

# Update mostre.json

Refresh the Milan exhibitions dataset that powers MostraMI (`public/mostre.json`),
then publish it so GitHub Pages redeploys the site. No paid API is involved — the
research is done with the built-in web tools in this session.

## Procedure

1. **Establish today's date** (use the real current date).
2. **Research** current + upcoming exhibitions and notable permanent venues in
   the **city of Milan only** (see Sources). For each major venue, check what is
   on now and what is opening soon.
3. **Edit `public/mostre.json`**:
   - Add newly opened / newly announced exhibitions and any missing venues.
   - **Remove exhibitions whose `dataFine` is already in the past** (permanent
     entries — see below — are never pruned).
   - Fix any dates/venues that have changed.
   - Follow the Schema and Rules exactly.
4. **Update `generatedAt`** to the current UTC timestamp
   (`new Date().toISOString()`).
5. **Validate**: run `npm run validate`. It must print `✓ ... is valid`. Fix any
   `✗` errors before continuing. (Warnings about ended shows mean you missed a
   prune — go back and remove them.)
6. **Publish** — commit `public/mostre.json` and push it to `main`; the Deploy
   workflow then rebuilds the site (and re-runs validation as a safety gate):

   ```sh
   git add public/mostre.json
   git commit -m "Refresh mostre.json (<date>): <one-line summary>"
   git push origin HEAD:main
   ```

   This needs the Claude GitHub App to have **write** access to the repo; if the
   push is rejected with `403`, connect/authorize it once from claude.ai and
   retry. The helper `scripts/publish-mostre.mjs` does the same over the GitHub
   API, but it shells out to `gh auth token` and the `gh` CLI is **not** installed
   in the Claude-on-the-web environment (it fails with `gh: not found`) — prefer
   `git push` here and keep the script only for a local checkout where `gh` is
   authenticated.
7. **Confirm the deploy** finished: watch the latest `deploy.yml` run on `main`
   until it reports `success` (via the GitHub MCP `actions_list` / `actions_get`
   tools, or by polling `/actions/runs?branch=main` with `$GITHUB_TOKEN`). Then
   give the user a short summary: what was added, what was pruned, and the new
   total.

## Schema

`public/mostre.json` = `{ "exhibits": [ … ], "generatedAt": "<ISO string>" }`.

Every exhibit object must have all of these fields:

| field | notes |
|---|---|
| `id` | unique kebab-case slug |
| `name` | exhibition title, or the venue name for a permanent entry |
| `luogo` | one of: `mostra`, `museo`, `mostra-permanente`, `galleria`, `installazione`, `monumento`, `altro` |
| `sede` | venue name; for a temporary show this is the venue (differs from `name`), for a permanent venue set it equal to `name` |
| `tema` | one of: `arte`, `scienza`, `fotografia`, `design`, `storia`, `architettura`, `altro` |
| `abbonamentoLombardia` | boolean — true if covered by Abbonamento Musei Lombardia |
| `beneFai` | boolean — true if a FAI property |
| `descrizioneBreve` | 1 short Italian sentence |
| `descrizioneLunga` | 2–3 Italian sentences |
| `dataInizio` | `YYYY-MM-DD` |
| `dataFine` | `YYYY-MM-DD`; use `2099-12-31` for permanent entries |
| `indirizzo` | street, CAP, "Milano" |
| `sitoWeb` | official site |
| `fonteUrl` | source used |

A "permanent" entry is any with `luogo` in {`museo`, `mostra-permanente`, `monumento`}
**or** a `dataFine` of `2099-12-31`. The app shows those as "Permanente" and never
treats them as expired.

## Rules

- **Milan city only** — no hinterland, no other Lombardy cities.
- Keep a healthy mix: current shows, a few **upcoming** (`in-arrivo`) ones, and
  permanent venues. Aim for **at least ~70 entries**.
- **Branch across themes** — arte, fotografia, design, architettura, scienza,
  storia — and across venue types (mostra, museo, galleria, monumento, …).
- For temporary shows, `sede` should name the venue so the map link and the
  popup subtitle resolve to the real place.
- Prefer official venue sites and reputable aggregators as `fonteUrl`.

## Sources (aggregators to sweep, plus official venue sites)

- https://www.milanoguida.com/mostre-milano/
- https://www.yesmilano.it/en/whats-on/all-events/exhibitions-milano-2026
- https://www.milanopocket.it/eventi/milano/mostre/
- https://artsupp.com/it/milano
- https://www.arte.it/calendario-arte/milano
- https://www.museocity.it/
- https://casemuseo.it/
- Official sites: Palazzo Reale, Fondazione Prada, Triennale, PAC, Museo del
  Novecento, Gallerie d'Italia, Pinacoteca di Brera / Palazzo Citterio, Museo
  Diocesano, Pirelli HangarBicocca, MUDEC, GAM, Castello Sforzesco, plus the
  house museums, monuments and galleries already in the dataset.

## Notes

- **Publishing**: push straight to `main` with `git push origin HEAD:main` — it
  works once the Claude GitHub App has write access to the repo. Don't rely on
  `scripts/publish-mostre.mjs` in the Claude-on-the-web environment: it needs the
  `gh` CLI, which isn't installed there, so it fails with `gh: not found`. Use the
  script only in a local checkout where `gh` is logged in.
- The web search tool is US-based and can occasionally return "unavailable" —
  just retry, or fetch an official page directly.
- Web tools often get `403` from aggregator sites via `WebFetch`; when that
  happens, lean on `WebSearch` snippets and official venue pages to confirm exact
  dates and venues.
