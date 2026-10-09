---
title: Upgrading, and coming from other libraries
section: upgrading
order: 1
description: What changes between versions, and how Hikidashi compares with Intl's Japanese calendar, wanakana and kuromoji.
---

## Upgrading between versions

Hikidashi follows [Semantic Versioning](https://semver.org/). Every release so far is 1.x, so there is nothing to migrate: any 1.x release can replace any other.

**What would make a 2.0.** A change to a function's name, its arguments or the shape of what it returns; a function that now answers `null` where it used to answer a value, or the other way round; a change to which inputs are refused; or an entry point taken away. When one is needed, this page will have a section for it, with each change and the line of code to write instead.

**What does not.** A new function or entry point, an input that used to be refused and is now read correctly (a new era, a new conjugation), and a fix to an answer that was wrong. The [changelog](../../CHANGELOG.md) lists every release.

To take the latest 1.x:

```sh
npm install @johnmorrisdotca/hikidashi@1
```

## Coming from Intl.DateTimeFormat's Japanese calendar

JavaScript can already *write* an era year: `Intl.DateTimeFormat` with the Japanese calendar formats a `Date`.

```ts
import { eraOnDate, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi/wareki";

const day = new Date(2019, 4, 1);
console.log(new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { era: "long", year: "numeric" }).format(day));    // 令和元年
console.log(formatEraYearJapanese(eraOnDate(day)!, { gannen: true }));                                       // 令和元年
```

What Hikidashi adds is the other direction and the year without a day: `parseEraYear` reads 令和6年 or "Heisei 3" into a Western year, which `Intl` cannot do; `eraYearsOf` answers for a year with no day, both eras in a changeover year; and the answer is data (the era, its year, its reading and its dates) rather than a string. `Intl` also goes back before 明治 (1850 is 嘉永3年 in Node 24), which Hikidashi does not. If you only ever format a known date, `Intl` is enough.

## Coming from wanakana

[wanakana](https://www.npmjs.com/package/wanakana) converts between hiragana, katakana and romaji, and tells kana from kanji. Hikidashi's `hiraganaToKatakana` and `katakanaToHiragana` do only the first part, letter for letter, because the alignment drawer needed nothing more; they are a few lines with no table. For romaji, IME-style input, or `isKanji`-style tests, keep wanakana: the two work side by side.

## Coming from kuromoji or another morphological analyser

[kuromoji](https://github.com/takuyaa/kuromoji.js) and its relatives split a sentence into words with a dictionary that is downloaded with them (megabytes, where each Hikidashi drawer is a few kilobytes), and give each word's dictionary form, part of speech and reading. They are the right tool when you need every word of running text tagged.

Hikidashi is the smaller tool for the cases where you already have a dictionary in a database and want to stay without a large download: `dictionaryForms` turns one conjugated word back into its candidates, and `extractFromText` matches the words your dictionary confirms. It does not tag particles, give readings for words, or split text your dictionary does not know. A study tool that matches pasted text against its own vocabulary list needs only Hikidashi; a full reading aid that glosses every word needs an analyser.
