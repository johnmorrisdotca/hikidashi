# Rolling out the documentation site

[README](../README.md) · How every package of the family adopts the documentation site that Hikidashi pilots, step by
step, so the sweep across the other repositories is mechanical. The standard it serves is
[README-STANDARD.md](https://github.com/johnmorrisdotca/.github/blob/main/README-STANDARD.md) in johnmorrisdotca/.github,
under "The documentation site".

## What a package gets

A site at `https://johnmorrisdotca.github.io/<repo>/docs/`, published by the Pages workflow beside the demo:

- a home page, a page for each entry point, and **one page per public export**, made from the TypeScript source and its
  doc comments: the import line, the definition, the parameters, what it returns and what `null` means, members, and every
  `@example` with what it printed when the site was built;
- the guides, from Markdown in `docs/guides/` and `docs/guides/ja/`: Getting started, How-to, Explanation,
  Troubleshooting & FAQ, Upgrading, and the Changelog rendered from `CHANGELOG.md`;
- search (Pagefind: an index built with the site, searched in the browser; nothing hosted, nothing billed);
- English and Japanese, the family's header, footer and cloth, light and dark, 390 px with no sideways scroll, a skip
  link, landmarks, headings in order;
- `api.html` kept as an index with its old anchors, so no old link breaks;
- `llms.txt` and `llms-full.txt` at the site's root, and a Markdown twin of every English page;
- every title a search engine reads in the form **`<Name> <kanji> — <English job>`**.

## The shared files

Copied **unchanged** from Hikidashi (or from the masters in johnmorrisdotca/.github, `docs-site/`), never edited in a
package. `src/docs-site.test.js` records the hashes of the first and the third.

| File | What it is |
| --- | --- |
| `scripts/docs-site.mjs` | The generator and its checks: `build`, `check`, `size [--write]`. Version marker `DOCS_SITE_VERSION`. |
| `src/docs-site.test.js` | In `pnpm check`: the hashes, the wiring, no docs problem, the job, the size and provenance badges, the alias note. In `test/` where a package keeps its tests there (Kyuubu). |
| `e2e/docs-site.demo.mjs` | In `pnpm test:demo`: every page at 390 px, one `h1`, headings in order, the skip link, search in both languages, the language links, every internal link, `api.html`'s anchors, `llms.txt`. |
| `scripts/readme-lint.mjs`, `src/readme.test.js` | The README standard's lint, now with the job rule (the title and the npm description carry the job from `docs/site.json`). Same files as `readme-standard/` in johnmorrisdotca/.github. |
| `scripts/social-preview.mjs` | Optional in a package: the 1280×640 social preview. One copy (Hikidashi's) makes every package's. |

## The steps, for one repository

Every command is run from the repository's root on a branch `docs-site`. Commit as the repository's owner, with no
trailer of any kind, staging files by name.

1. **Copy the shared files** above into the same paths.
2. **Add the three build tools**, as development dependencies only:

   ```sh
   pnpm add -D pagefind@^1.5.2 marked@^18.0.0 esbuild@^0.28.0
   ```

   All three are MIT licensed, run on the machine that builds, and add nothing to what is installed from npm.
3. **package.json scripts**, exactly as `src/docs-site.test.js` reads them:

   ```json
   {
     "docs:site": "pnpm build && node scripts/docs-site.mjs build",
     "docs:check": "pnpm build && node scripts/docs-site.mjs check",
     "size": "node scripts/docs-site.mjs size",
     "test:demo": "pnpm site && node scripts/docs-site.mjs build && playwright test"
   }
   ```

   Where `test:demo` does more (a server, a second config), keep the rest and put `node scripts/docs-site.mjs build`
   after `pnpm site`.
4. **The Pages workflow**: one line after `- run: pnpm site`, which `family.test.js` already allows:

   ```yaml
         - run: pnpm site
         - run: pnpm docs:site
   ```

5. **Ignores**: `.docs-examples/` in `.gitignore`, and in `eslint.config.js`'s ignores beside `.readme-examples/`.
6. **docs/site.json**: the job from the table below once the owner has approved it, the header's lines and the entry
   points' titles in both languages. Hikidashi's is the example:

   ```json
   {
     "job": "Japanese text tools for JavaScript",
     "pitch": { "en": "…", "ja": "…" },
     "name": { "en": "…", "ja": "…" },
     "icon": "data:image/svg+xml,…",
     "entries": { ".": { "en": "Everything", "ja": "すべて" }, "./wareki": { "en": "Era years", "ja": "和暦" } }
   }
   ```

   `icon` is the demo's own icon (`ICON` in `scripts/site.mjs`).
7. **package.json `description` and `keywords`**: the description starts `<Name> <kanji> — <job>:` and stays at 250
   characters or fewer; the keywords take the plain English words in the table. Set the same description and topics on
   GitHub (step 15).
8. **TSDoc**: run `pnpm docs:check`. It lists every export with no summary, a parameter with no `@param`, a function with
   no `@returns` (or one that can return null without saying what null means), and every export with no `@example`.
   Write each. An example is a fenced `ts` block that imports the package by its name and prints with `console.log`, so
   its output appears under it; one that needs a browser is fenced `ts no-run`. A module's own comment at the top of its
   file is set apart from the first declaration by a blank line, or it is read as that declaration's.
9. **Guides**: at least one of each kind, in `docs/guides/<slug>.md` with front matter (`title`, `section`, `order`,
   `description`), headings from `##`, links as `other-guide.md#heading`, `api:name`, `entry:slug` or a relative path to
   a file of the repository. The kinds: `tutorial` (Getting started), `how-to` (three to five recipes for real jobs),
   `explanation` (how it works inside, which is what moves out of the README, and why it is built so), `troubleshooting`
   (Troubleshooting & FAQ: every `null` a reader will meet, setup errors), `upgrading` (each major version; "coming from
   <other library>" where readers come from one).
10. **Japanese**: write `docs/guides/ja/<slug>.md` for each guide, then have the `japanese-reviewer` agent read every
    Japanese string (the guides, `docs/site.json`'s "ja" values) and apply its fixes; record its terminology. A guide
    with no Japanese yet shows the English with a note, and the build says which.
11. **README** (stays the front door under the standard):
    - the title is `<Name> <sub><kanji></sub> — <job>`;
    - after the TypeScript badge, the size badge `pnpm size --write` prints, and the provenance badge
      (`https://img.shields.io/badge/npm-provenance-2f5d4a`, linking to the npm page's `#provenance`);
    - the links row adds `Documentation` and `Getting started`;
    - `### Install under another name` under Use it in your project: `npm install <english-name>@npm:@johnmorrisdotca/<repo>`
      and an import from that name (`ts no-check`);
    - the API section links the documentation;
    - reference material (how a part works inside, long tables of calls) moves to the Explanation guide, leaving a
      sentence and a link; every required section, picture, example and table a test reads stays.
12. **Demo header**: a `Docs` pill before the API pill, `pageDocs` in the demo's words (English "Docs", Japanese
    ドキュメント), linking `docs/index.html`, or `docs/ja/index.html` while the demo is in Japanese; `pnpm docs:make` where
    the package keeps its strings list.
13. **Changelog**: an entry under `## [Unreleased]`. Nothing that is exported changes, so it ships with the next patch.
14. **Run everything**, green before pushing: `pnpm check`, `pnpm docs:check`, `pnpm test:demo`, `pnpm test:readme`,
    `pnpm test:package`. Look at the site on a desk and at 390 px, in both languages and both schemes.
15. **Outside the repository, with the owner's go**: the social preview (`node scripts/social-preview.mjs --out <folder>
    <repo>` from Hikidashi's checkout; upload in Settings → General → Social preview), and the GitHub description and
    topics (`gh repo edit johnmorrisdotca/<repo> --description "<npm description>" --add-topic <topic> …`).

### What varies between packages

- **Tests in `test/`** (Kyuubu): `docs-site.test.js` goes there; its import of `../scripts/docs-site.mjs` is the same.
- **Entry points**: the generator maps `./dist/<path>.js` in `exports` to `src/<path>.ts` (or `.tsx`, `.mts`) and says when
  one has no source. A wildcard export (`./*`) is not documented; give it a named entry if readers use it.
- **Classes and custom elements** get a page with their constructor and public members; a member's doc comment is its
  description. Events and attributes of an element go in a guide ("The element's attributes and events").
- **Long-running examples** (a solver, a generator at large sizes) are `ts no-run`, so the build stays a minute or less.
- **A package outside FAMILY** (address-plus, Kuni, Hata) works without the family header: give `docs/site.json` a `title`
  and a `kana`; the job rule is the same.

### How long it takes

The mechanical part, steps 1 to 7 and 11 to 15, is about twenty minutes a repository. The words are the work: TSDoc for
every export (Hikidashi's 47 exports took most of a session) and ten guides in two languages. Measured on Hikidashi
(2026-10-09): 47 exports, 10 guides, 105 examples run in about one second, 134 pages, a search index of 1.3 MB, and the
build in about five seconds on an M-series Mac.

## English jobs and keywords, for approval

Each package's title everywhere a search engine reads is `<Name> <kanji> — <job>`. The job is what a person would type
into a search box; the keywords go into `package.json` and, as topics, onto GitHub. **Proposed; the owner approves or
edits the table, and step 6 copies the job into each `docs/site.json`.** The social previews already made use these jobs.

| Repo | Title | Keywords and topics to add |
| --- | --- | --- |
| korokoro | Korokoro コロコロ — Dice roller with notation and exact odds | dice, dice-roller, dice-notation, rpg, probability |
| kyuubu | Kyuubu キューブ — Twisty cube puzzle for the browser | cube, rubiks-cube, twisty-puzzle, cube-solver, puzzle |
| hitotsu | Hitotsu 一つ — Colour-card shedding game for two to eight | card-game, shedding-game, crazy-eights, uno-like, multiplayer |
| toranpu | Toranpu トランプ — Playing cards, card games and solitaire | playing-cards, card-games, solitaire, klondike, deck |
| tane | Tane 種 — Seeded random numbers for JavaScript | random, seeded-random, prng, daily-seed, deterministic |
| narabe | Narabe 並べ — Board game rules engine: gomoku, Reversi, Go, checkers | board-games, rules-engine, gomoku, reversi, go, checkers |
| tenka | Tenka 天下 — World conquest strategy game | strategy-game, world-conquest, risk-like, map-game, multiplayer |
| kumimoji | Kumimoji 組み文字 — Crossword tile game in English and Japanese | word-game, crossword, tile-game, scrabble-like, kana |
| tsunagi | Tsunagi 繋ぎ — Connect-the-pairs line puzzle | puzzle, line-puzzle, flow-puzzle, numberlink, logic-puzzle |
| jarajara | Jarajara ジャラジャラ — Mahjong tiles and mahjong solitaire | mahjong, mahjong-tiles, mahjong-solitaire, tile-game, svg |
| suido | Suido 水道 — Pipe-connecting puzzle | pipe-puzzle, plumber, puzzle-game, logic-puzzle |
| domino | Domino ドミノ — Dominoes and Mexican Train | dominoes, mexican-train, tile-game, board-game |
| kotoba | Kotoba 言葉 — Word lists and word-game rules | word-list, dictionary, word-game, scrabble-words, english, french, german |
| sugoroku | Sugoroku 双六 — Backgammon and its variants | backgammon, board-game, doubling-cube, dice-game |
| kazu | Kazu 数 — Sudoku and grid number puzzles | sudoku, sudoku-generator, number-puzzle, futoshiki, skyscrapers |
| meikyuu | Meikyuu 迷宮 — Maze generator and maze game | maze, maze-generator, maze-game, labyrinth, seeded |
| hikidashi | Hikidashi 引き出し — Japanese text tools for JavaScript | japanese-text, japanese-text-tools, text-tools (added), already: wareki, kanji-numerals, deinflect, furigana |
| chizu | Chizu 地図 — SVG maps for JavaScript | maps, svg-map, world-map, choropleth, map-quiz |
| bushu | Bushu 部首 — Find kanji by their radicals | kanji, radicals, kanji-lookup, kanji-search, japanese |
| tobiishi | Tobiishi 飛び石 — Peg solitaire | peg-solitaire, solitaire, puzzle-game, brain-teaser |
| jirai | Jirai 地雷 — Minesweeper with no-guess boards | minesweeper, no-guess, puzzle-game, logic-puzzle |
| gunjin | Gunjin 軍人 — Hidden-rank strategy games | stratego-like, strategy-game, hidden-information, board-game, pass-and-play |
| karakuri | Karakuri からくり — Physics and hyper-casual puzzle games | puzzle-games, hyper-casual, physics-game, casual-games |
| houseki | Houseki 宝石 — Match-3 gem puzzles | match-3, gem-puzzle, puzzle-game, swap-game |
| address-plus | address-plus — US and Canadian address parser | address-parser, address, usps, canada-post, postal-code (most already there) |
| kuni | Kuni 国 — Countries, states and provinces | countries, iso-3166, subdivisions, states, provinces (already there) |
| hata | Hata 旗 — Country and region flags as SVG | flags, country-flags, flag-icons, svg (already there) |
| rest-in-pieces | REST in Pieces — Fake REST API data for testing | mock-api, fake-data, rest-api, test-data, api-mock |

Two notes for the approval:

- **Names of other products** (Rubik's, UNO, Scrabble, Risk, Stratego, Flow Free) are trademarks. They appear only as
  `-like` keywords and topics, where people search for them, and never in a title, a description or a picture. Drop any
  of them that the owner would rather not use.
- **Installing under another name** (README step 11) suggests one English alias per package; the alias in each README
  is the first keyword above (Hikidashi's is `japanese-text`).
