---
title: Getting started
section: tutorial
order: 1
description: Install Hikidashi, call one function from each drawer, and see what it gives back when it cannot answer.
---

This tutorial takes about ten minutes. By the end you will have called a function from each of Hikidashi's six drawers, imported only the drawer you need, and seen how every function says "I cannot answer that" without guessing. You need Node 22 or later, or any browser from 2020 on.

## Install it

```sh
npm install @johnmorrisdotca/hikidashi
```

It has no dependencies and ships its own types. Every example on this page is a complete file: save one as `try.ts` (or `try.mjs`, without the types) and run it with `node try.ts`.

## Read an era year

Japanese forms, coins and birth certificates write years by era: 令和6年 is the sixth year of 令和 (Reiwa). `parseEraYear` reads one and gives the Western year with it.

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

const year = parseEraYear("令和6年");
console.log(year?.westernYear);    // 2024
console.log(year?.era.romaji);     // "Reiwa"
```

It reads the era in kanji or in Latin letters, with full-width digits, and with 元年 for the first year:

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

console.log(parseEraYear("Heisei 3")?.westernYear);    // 1991
console.log(parseEraYear("昭和元年")?.westernYear);     // 1926
```

## See a refusal

Ask for a year an era never had. 昭和 (Showa) ended in its 64th year, so there was no 昭和65年:

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

console.log(parseEraYear("昭和65年"));    // null
```

`null` is an answer, and it means exactly "this is not an era year". Hikidashi never turns a question it cannot answer into a plausible number: 昭和65 would be 1990, and 1990 was 平成2. Every function in the package works this way, so the first thing to write after a call is what your page says when the answer is `null`.

## Go the other way

`eraYearsOf` turns a Western year into its era year. Some years have two, because the era changed partway through: 1989 was 昭和64 until 7 January and 平成1 from the 8th. When you know the day, `eraOnDate` gives the one it fell in.

```ts
import { eraOnDate, eraYearsOf, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi";

console.log(eraYearsOf(1989).map((one) => formatEraYearJapanese(one)));    // ["平成1年", "昭和64年"]
console.log(formatEraYearJapanese(eraOnDate("1989-01-07")!));              // "昭和64年"
```

## Read and write a kanji number

Japanese counts in ten-thousands: 万 (10,000), 億 (100,000,000), 兆. A headline writes 1億2000万 and a textbook 一億二千万; both are 120,000,000.

```ts
import { parseJapaneseNumber, readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi";

console.log(parseJapaneseNumber("1億2000万"));    // 120000000
console.log(writeJapaneseNumber(25_000));         // "二万五千"
console.log(readJapaneseNumber(800));             // "はっぴゃく", said aloud
```

## Find a verb's dictionary form

A sentence says 食べませんでした ("did not eat"); a dictionary lists 食べる. `dictionaryForms` walks the endings back and proposes every dictionary form the written word could come from, likeliest first.

```ts
import { dictionaryForms } from "@johnmorrisdotca/hikidashi";

console.log(dictionaryForms("食べませんでした")[0]);    // { base: "食べる", wordClass: "ichidan" }
```

It proposes rather than decides: the second proposal for 食べませんでした is 食ぶ, a verb that does not exist. Your dictionary says which proposal is a real word; the [how-to on pasted text](extract-words-from-a-paste.md) shows how.

## Share a reading over its kanji

A school's kanji test (かん字テスト) shows a reading beside empty squares and the okurigana, the kana that end the word, in brackets. `segmentWord` cuts a word and its reading that way:

```ts
import { segmentWord } from "@johnmorrisdotca/hikidashi";

for (const part of segmentWord("食べる", "たべる") ?? []) console.log(part.text, part.reading, part.kind);
// 食 た kanji
// べる べる okurigana
```

## Pull words out of a paste

`extractFromText` reads any amount of pasted text and gives back the words your dictionary knows, in dictionary form, and every kanji. Hikidashi holds no dictionary; you pass yours as a `Map`.

```ts
import { extractFromText } from "@johnmorrisdotca/hikidashi";

const known = new Map([["先生", []], ["学校", []], ["行く", ["godan" as const]]]);
const found = extractFromText({ text: "先生と学校へ行きます。", known });
console.log(found.words);    // ["先生", "学校", "行く"]
console.log(found.kanji);    // ["先", "生", "学", "校", "行"]
```

## Score a sentence

`sentenceDifficulty` scores a sentence by its length and its hardest kanji, so the easiest example sentence can be shown first. You give each kanji's cost; `kanjiCost` makes one from a school grade or a frequency rank.

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi";

const costs = new Map([["水", kanjiCost({ grade: 1, frequencyRank: 223 })]]);
console.log(sentenceDifficulty("水を飲む。", costs));    // 5 characters + 3 × 20 for 飲, which costs has no entry for: 65
```

## Import only the drawer you need

Everything above came from the package's main entry. Each drawer is also an entry point of its own, so a page that needs only era years carries only that code:

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

console.log(parseEraYear("平成31年")?.westernYear);    // 2019
```

The six entry points are `/wareki` (era years), `/numerals`, `/deinflect` (dictionary forms), `/align` (readings), `/extract` (pasted text) and `/difficulty`. Their pages in the reference, starting with [`/wareki`](entry:wareki), list every function with its examples.

## Where next

- The how-to guides are recipes for real jobs: [reading era years on a form](read-era-years.md), [pulling words out of a paste with your own dictionary](extract-words-from-a-paste.md), [making a kanji test](make-a-kanji-test.md), [sorting example sentences](sort-sentences-by-difficulty.md) and [writing amounts in kanji](write-numbers-in-kanji.md).
- [How each drawer works](how-it-works.md) explains the rules behind the answers, and [Why it is built this way](design.md) the choices behind the package.
- [Troubleshooting & FAQ](troubleshooting.md) answers the questions that come up first, most of them about a `null`.
