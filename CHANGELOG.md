# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.2] - 2026-10-06

Nothing that was exported has changed. The README is the family's one layout, in full.

### Added

- The README has a picture of the demo on a desk and on a phone, in light and dark, taken from the demo by `pnpm screenshots:readme` (the pictures are in `docs/images/` and are not in the package), a picture of each of the six drawers' panels, an Examples section of seven examples that run, examples for React, Vue, Svelte and Angular, a Theming section and an Accessibility section.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a job of its own in CI; `src/readme.test.js` holds the README to the family's standard (sections in order, languages on code fences, pictures with alt text and a caption, no marketing words, version pins) in `pnpm check`; `pnpm test:package` fails if a picture or anything under `docs/` is in the packed package.

### Changed

- `pnpm pictures` is `pnpm screenshots:readme`, and takes WebP pictures in light and dark under `docs/images/`; `docs/desktop.jpg` and `docs/phone.jpg` are gone.
- The README's examples for `/align` and `/extract` now compile and run as written: they named a word list and a dictionary that were not defined, and the dictionary's value type is `WordClass[]`.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Hikidashi, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [1.0.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/hikidashi@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

## [1.0.0] - 2026-10-01

A drawer of small Japanese text tools, taken out of UmaKuma, a Japanese study app by the same author, so that other tools can use them. Each drawer is an entry of its own, and the package has no data and no dependencies.

- **`@johnmorrisdotca/hikidashi/wareki`**: era years (和暦) both ways for 明治 to 令和. `parseEraYear` reads 令和6年, Heisei 3 and 令和元年; `eraYearsOf`, `eraYearOf` and `eraOnDate` go from a Western year or a day to its era year, answering a changeover year with both eras; each era carries its first and last day.
- **`/numerals`**: kanji numerals both ways: `parseJapaneseNumber` (一億二千万, 1億2000万, 2万5千, formal 壱万), `writeJapaneseNumber` (also formal), `readJapaneseNumber` (hiragana, with the sound changes), and `parseEnglishNumber` (words and romaji).
- **`/deinflect`**: `dictionaryForms` gives every dictionary form a conjugated verb or adjective could come from, with the kind of word it must be, for godan and ichidan verbs, i-adjectives, する and 来る (kana too); `wordClassesOf` reads a dictionary's parts of speech, plain or JMdict's tags.
- **`/align`**: `segmentWord` shares a reading out over a word's kanji, kana and okurigana; `kanjiAsWord`; `buildKanjiTest` makes a seeded かん字テスト.
- **`/extract`**: `extractFromText` pulls the words your dictionary knows and every kanji out of pasted text, capped and stripped of control characters; `wordCandidates`.
- **`/difficulty`**: `kanjiCost` and `sentenceDifficulty`, from the grades or frequency ranks you hold.
- A demo with a panel for each drawer, a Help switch, the cloth patches and English and Japanese, and browser tests (`pnpm test:demo`) at a phone's width and a desk's, in Chromium and WebKit.
