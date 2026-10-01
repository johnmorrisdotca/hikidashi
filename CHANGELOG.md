# Changelog

## 1.0.0 — 2026-10-01

A drawer of small Japanese text tools, taken out of UmaKuma, a Japanese study app by the same author, so that other tools can use them. Each drawer is an entry of its own, and the package has no data and no dependencies.

- **`@johnmorrisdotca/hikidashi/wareki`**: era years (和暦) both ways for 明治 to 令和. `parseEraYear` reads 令和6年, Heisei 3 and 令和元年; `eraYearsOf`, `eraYearOf` and `eraOnDate` go from a Western year or a day to its era year, answering a changeover year with both eras; each era carries its first and last day.
- **`/numerals`**: kanji numerals both ways: `parseJapaneseNumber` (一億二千万, 1億2000万, 2万5千, formal 壱万), `writeJapaneseNumber` (also formal), `readJapaneseNumber` (hiragana, with the sound changes), and `parseEnglishNumber` (words and romaji).
- **`/deinflect`**: `dictionaryForms` gives every dictionary form a conjugated verb or adjective could come from, with the kind of word it must be, for godan and ichidan verbs, i-adjectives, する and 来る (kana too); `wordClassesOf` reads a dictionary's parts of speech, plain or JMdict's tags.
- **`/align`**: `segmentWord` shares a reading out over a word's kanji, kana and okurigana; `kanjiAsWord`; `buildKanjiTest` makes a seeded かん字テスト.
- **`/extract`**: `extractFromText` pulls the words your dictionary knows and every kanji out of pasted text, capped and stripped of control characters; `wordCandidates`.
- **`/difficulty`**: `kanjiCost` and `sentenceDifficulty`, from the grades or frequency ranks you hold.
- A demo with a panel for each drawer, a Help switch, the cloth patches and English and Japanese, and browser tests (`pnpm test:demo`) at a phone's width and a desk's, in Chromium and WebKit.
