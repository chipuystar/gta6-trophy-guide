# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/chipuystar/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/chipuystar/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI
(1 platinum, 2 gold, 6 silver, 46 bronze) — built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

Every trophy shows its official name, description and grade as PlayStation publishes them,
plus a guide written in our own words that names its sources. The app also gives you a
six-stage roadmap to the platinum, flags every missable trophy, and tracks your progress
in the browser.

## Features

- **Checklist tracker** — all 55 trophies with official names, descriptions and grades;
  progress saved in `localStorage`, with an overall bar and per-grade counts.
- **Guides with sources** — each trophy's guide says what to do, where and how, and when
  it can be missed, and names its sources (Exophase, PSNProfiles, and PowerPyx where a
  general guide fits).
- **Roadmap to platinum** — six stages in play order: story first, strangers, collectibles
  cleanup, activities and grind, one-off feats, then the platinum.
- **Missable flags** — 26 trophies tied to a specific chapter, mission, choice or one-time
  event are flagged, with the context in the guide.
- **Filters** — story, missable, collectibles, activities, online (the official list holds
  no online trophy, and the app says so).
- **Spoiler mode** — hides the names and descriptions of story trophies until they are earned.
- **Export / import** — download your progress as JSON and import it back.
- **Fully offline** — static files, no build step, no network request at runtime.

## Run it offline

No build step, no server needed for a quick look — just open `app/index.html` in a
desktop browser. (Some browsers block a file page from fetching its own data file;
serve the folder with any static server instead, for example
`python3 -m http.server` from inside `app/`, then open the local address.)
The app makes no network request at runtime: fonts are embedded in the stylesheet
and the trophy data is a local JSON file.

## Layout

- `app/index.html` — the page: header, progress, search, filters, spoiler toggle,
  export/import, checklist, roadmap view, detail panel.
- `app/style.css` — the whole look, including the embedded fonts.
- `app/app.js` — boot, state, list rendering, search, filters, spoiler behaviour.
- `app/roadmap.js` — the six roadmap stages and the roadmap view.
- `app/store.js` — `localStorage` persistence plus export and import.
- `app/data/trophies.json` — the 55 official trophies with our guides.
- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output
  directory and writes `dossier.json` with the kit's `buildDossier`.
- `screenshots/` — four real renders of the app in a browser.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unmodified.

## Sources

Trophy names, descriptions and grades are the official PlayStation list, as
Exophase and PSNProfiles publish it. Every guide is written in our own words
for this entry and names its sources; nothing is copied from another guide.
No Rockstar logo, official artwork, box art or game imagery is used anywhere.
Fan-made guide, not affiliated with Rockstar Games or PlayStation.
