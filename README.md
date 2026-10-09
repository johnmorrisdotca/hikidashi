<h1 align="center">Hikidashi <sub>引き出し</sub> — Japanese text tools for JavaScript</h1>

<p align="center"><strong>A drawer of small Japanese text tools for JavaScript and TypeScript.</strong><br>
Era dates (和暦) and kanji numerals both ways, the dictionary forms a conjugated verb or adjective could come from, a word's reading shared out over its kanji (かん字テスト), Japanese words and kanji pulled out of pasted text, and how hard a sentence is to read. Pure functions with no data of their own. No dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/hikidashi/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/hikidashi/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/hikidashi"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/hikidashi?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
  <a href="https://johnmorrisdotca.github.io/hikidashi/docs/api/main/index.html"><img alt="6.4 kB minified and gzipped" src="https://img.shields.io/badge/min%2Bgzip-6.4%20kB-2f5d4a"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/hikidashi#provenance"><img alt="Published with npm provenance" src="https://img.shields.io/badge/npm-provenance-2f5d4a"></a>
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/hikidashi/"><strong>Try the drawers →</strong></a> · <a href="https://johnmorrisdotca.github.io/hikidashi/docs/">Documentation</a> · <a href="https://johnmorrisdotca.github.io/hikidashi/docs/guides/getting-started.html">Getting started</a> · <a href="https://johnmorrisdotca.github.io/hikidashi/api.html">API reference</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, in English: the header with its language chooser, the Docs and API reference links, five cloth patches and the Help switch, then panels in two columns, each with a box to type in, a row of examples and the answer with the call that made it: Era years showing 令和6年 worked out as 2024, Kanji numerals showing 2万5千 as 25,000 and 二万五千, and under them Dictionary forms and Reading alignment" width="600">
</picture>
<br><em>The demo on a desk: four of the six drawers, each answering the example in its box.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: the header and its language chooser and patches, then the first panel for era years, 元号の年, with 令和6年 typed in, its examples, and the start of its answer, 西暦 2024 and 和暦 令和6年" width="190">
</picture>
<br><em>On a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

Hikidashi is the handful of Japanese-text helpers a study tool, a worksheet maker or a reading aid ends up writing for itself, taken out and tested once: what year is 平成3年, how is 一億二千万 written in digits, which verb is 食べませんでした, how does たべる divide over 食べる. It is a drawer of them, each small and each its own import, so a page that wants one era converter does not carry the rest. It was taken out of UmaKuma, a Japanese study app by the same author, and it works in [the demo](https://johnmorrisdotca.github.io/hikidashi/) with nothing to install.

## In 30 seconds

```sh
npm install @johnmorrisdotca/hikidashi
```

```ts
import { dictionaryForms, parseEraYear, parseJapaneseNumber, segmentWord, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi";

parseEraYear("令和6年")?.westernYear;             // 2024
parseJapaneseNumber("2万5千");                    // 25000
writeJapaneseNumber(120_000_000);                // "一億二千万"
dictionaryForms("食べませんでした")[0];            // { base: "食べる", wordClass: "ichidan" }
segmentWord("形が合う", "かたちがあう");           // 形 かたち · が · 合 あ · う (okurigana)
```

Or take only the drawer you need:

```ts
import { eraOnDate } from "@johnmorrisdotca/hikidashi/wareki";

eraOnDate("1989-01-07");   // 昭和64: the next day, 1989-01-08, is 平成1
```

## Who it is for

- **Language-learning tools** that read what a learner pastes in or types, and want 行きます to be 行く and 一億二千万 to be a number.
- **Teachers' worksheets and test makers**, who need a reading divided over its kanji, the okurigana in brackets, and a test that is the same one for the same seed.
- **Reading aids and forms**, which meet 令和6年 and 昭和64年 and need the Western year, or the era, from a date.
- **Anyone who wants the logic without the data**: every drawer takes your own dictionary, grades and lists as an argument, so there is nothing to keep up to date here.

## Features

- **Era years both ways (和暦).** Five modern eras, 明治 to 令和. 令和6年, Heisei 3 and 昭和元年 to a Western year, and a Western year or a day back to its era year, with 元年 read and written, and the years an era changed in answered with both eras.
- **Kanji numerals both ways (漢数字).** 一億二千万, 1億2000万, 2万5千 and 120000000 to a number, and a number back to kanji, to the largest safe integer. Also in the formal 大字 contracts and banknotes use (壱万), read aloud in hiragana with the sound changes (さんびゃく), and English words and romaji (`five hundred`, `5 man`) read too.
- **Dictionary forms (活用).** From a conjugated form to every dictionary form it could come from, with the kind of word it would have to be: godan and ichidan verbs, i-adjectives, する and 来る, in the polite, negative, past, te, conditional, volitional, passive, causative and potential forms and chains of them.
- **Reading alignment (読みの割り当て).** A word and its reading cut into kanji, kana and okurigana, each kanji with its share of the reading, and a seeded かん字テスト of writing and reading questions built from a list.
- **Pasted-text extraction (抽出).** The words your dictionary knows, in dictionary form and longest match first, and every kanji, from text of any length, with a cap on what it will read and every control character dropped.
- **Sentence difficulty (難しさ).** A score from a sentence's length and its hardest kanji, from the school grades or frequency ranks you hold, so the easiest example sentence can lead.
- **No data and no dependencies.** No dictionary, no word list, no grade table and no network request. Every function is pure and returns new values.
- **English and Japanese demo**, with a Help switch that explains each option.

### What's in it

Each picture is the real drawer, a panel of [the demo](https://johnmorrisdotca.github.io/hikidashi/) taken with `pnpm screenshots:readme`, in light and dark. The panel shows the answer and, under it, the call that made it.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/wareki-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/wareki-desk-light.webp" alt="The Era years panel of the demo on a desk: the title Era years with its import /wareki, a box holding 令和6年, a row of examples, and the answer: Western year 2024, era year 令和6年 and Reiwa 6, the reading れいわ, the era began 2019-05-01 and is still running, with the call parseEraYear(&quot;令和6年&quot;) // 2024 under it" width="400">
</picture>
<br><em><strong>Era years.</strong> 令和6年 is 2024, and the panel says when the era began and that it is still running.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/numerals-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/numerals-desk-light.webp" alt="The Kanji numerals panel of the demo on a desk: a box holding 2万5千, a row of examples, and the answer: value 25,000, kanji 二万五千, formal 弐万五千 and said as にまんごせん, with the call parseJapaneseNumber(&quot;2万5千&quot;) // 25000 under it" width="400">
</picture>
<br><em><strong>Kanji numerals.</strong> 2万5千 is 25,000, written in kanji, in the formal characters, and said aloud.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/deinflect-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/deinflect-desk-light.webp" alt="The Dictionary forms panel of the demo on a desk: a box holding 行きました, a row of examples, and the list of dictionary forms it could come from, each with the kind of word it would have to be: 行く godan verb, 行きる ichidan verb, 行きます godan verb, 行きまする suru verb and 行きまし ichidan verb, with the call dictionaryForms(&quot;行きました&quot;) under it" width="400">
</picture>
<br><em><strong>Dictionary forms.</strong> Every form 行きました could come from, likeliest first; your own dictionary says which is real.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/align-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/align-desk-light.webp" alt="The Reading alignment panel of the demo on a desk: boxes holding the word 食べる and its reading たべる, a row of examples, and the word cut into two cards, 食 with the reading た marked kanji and べる with the reading べる marked okurigana, with the call segmentWord(&quot;食べる&quot;, &quot;たべる&quot;) under it" width="400">
</picture>
<br><em><strong>Reading alignment.</strong> 食べる read たべる: 食 takes た and べる is the okurigana.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/extract-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/extract-desk-light.webp" alt="The Pasted text panel of the demo on a desk: a text box with two Japanese sentences, a row of examples, the words found (先生, 学校, 行く, 毎日, 日本語, 勉強する) and the eleven different kanji found, the counts 25 characters, 6 words, 11 kanji, and the call extractFromText({ text, known }) under it" width="400">
</picture>
<br><em><strong>Pasted text.</strong> The words the demo's small dictionary knows, in dictionary form, and every kanji.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/difficulty-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/hikidashi/main/docs/images/difficulty-desk-light.webp" alt="The Sentence difficulty panel of the demo on a desk: a box holding 水を飲む。, a row of example sentences, and the answer: score 14, length 5, hardest kanji 飲 (cost 3) and the kanji 水 with 1 and 飲 with 3, with the call sentenceDifficulty(&quot;水を飲む。&quot;, costs) under it" width="400">
</picture>
<br><em><strong>Sentence difficulty.</strong> Five characters plus three times the hardest kanji's cost of 3 makes 14.</em>
</td>
</tr>
</table>

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/hikidashi
# or: pnpm add @johnmorrisdotca/hikidashi
# or: yarn add @johnmorrisdotca/hikidashi
```

It is ES modules only, with its types included and `sideEffects: false`, and needs Node 22 or later outside a browser (on Node 22.12 or later it loads by `require` too). A page with no bundler imports a drawer from a CDN (`@1` is the major version).

### Install under another name

The package's name is Japanese. If your code reads better with the job in plain English, npm can install it under a name of your choosing, an alias, and your imports use that name:

```sh
npm install japanese-text@npm:@johnmorrisdotca/hikidashi
```

```ts no-check
import { parseEraYear } from "japanese-text/wareki";
```

pnpm and yarn take the same `<alias>@npm:<package>` form. The alias is only a name in your `package.json`: it is the same package, version and code.

### 1. A drawer on a server or in an app

```ts
import { parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

const form = { amount: "2万5千" };
parseJapaneseNumber(form.amount);   // a number, or null when it is not one
```

Each drawer is an entry of its own (`/wareki`, `/numerals`, `/deinflect`, `/align`, `/extract`, `/difficulty`), so a bundler keeps only what is imported, and the main entry has them all. The package is ES modules with `sideEffects: false`; on Node 22.12 or later it loads by `require` too.

### 2. In a page, with no bundler

```html
<script type="module">
  import { eraYearsOf } from "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hikidashi@1/dist/wareki.js";
  console.log(eraYearsOf(2019).map((one) => `${one.era.kanji}${one.year}`));   // ["令和1", "平成31"]
</script>
```

### What a developer gets

- **Typed results**, with a doc comment on every export. Every function is pure: it returns new values and never changes what it was given.
- **Refusal rather than a guess.** A text that is not a number, a year an era never had, a reading that does not fit its word: each gives `null` or an empty list, never a plausible wrong answer.
- **No dependencies.** One entry for each drawer.
- **Where it runs.** See [Browser and runtime support](#browser-and-runtime-support).

### In a framework

The drawers are plain functions, so a framework needs no adapter: call one where you would compute a value. Each of these is an era-year box that answers as you type.

#### React

```jsx
import { useState } from "react";
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

export function EraYear() {
  const [text, setText] = useState("令和6年");
  const year = parseEraYear(text);
  return (
    <label>
      年 <input value={text} lang="ja" onChange={(event) => setText(event.target.value)} />
      <output>{year ? `西暦${year.westernYear}年` : "年号の年を入れてください"}</output>
    </label>
  );
}
```

#### Vue

```vue
<script setup>
import { computed, ref } from "vue";
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

const text = ref("令和6年");
const year = computed(() => parseEraYear(text.value));
</script>

<template>
  <label>年 <input v-model="text" lang="ja" /></label>
  <output>{{ year ? `西暦${year.westernYear}年` : "年号の年を入れてください" }}</output>
</template>
```

#### Svelte

```svelte
<script>
  import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

  let text = "令和6年";
  $: year = parseEraYear(text);
</script>

<label>年 <input bind:value={text} lang="ja" /></label>
<output>{year ? `西暦${year.westernYear}年` : "年号の年を入れてください"}</output>
```

#### Angular

```ts no-check
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

@Component({
  selector: "era-year",
  standalone: true,
  imports: [FormsModule],
  template: `<label>年 <input [(ngModel)]="text" lang="ja" /></label><output>{{ answer() }}</output>`,
})
export class EraYearComponent {
  text = "令和6年";
  answer() {
    const year = parseEraYear(this.text);
    return year ? `西暦${year.westernYear}年` : "年号の年を入れてください";
  }
}
```

## Examples

Each example is a whole recipe: copy it and it works. They are run in CI against the built package (`pnpm test:readme`), so none of them is a guess, and the output shown is what they print.

### A form that turns an era year into a Western one

A page with no bundler: one drawer, from a CDN (`@1` is the major version), and a box that answers as you type. Save it as a file and open it.

```html
<!doctype html>
<meta charset="utf-8">
<title>和暦 to 西暦</title>
<label>年 <input id="year" value="令和6年" lang="ja" autocomplete="off"></label>
<p id="answer" role="status"></p>
<script type="module">
  import { parseEraYear } from "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hikidashi@1/dist/wareki.js";

  const input = document.getElementById("year");
  const show = () => {
    const year = parseEraYear(input.value);
    document.getElementById("answer").textContent = year ? `西暦${year.westernYear}年` : "年号の年を入れてください";   // null when it is not an era year
  };
  input.addEventListener("input", show);
  show();
</script>
```

### Era years, both ways

An era changes partway through a Western year, so a year may belong to two eras, and a day to one. A year an era never had is `null`, never a guess.

```ts
import { eraOnDate, eraYearOf, eraYearsOf, formatEraYearJapanese, parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

console.log(parseEraYear("Heisei 3")?.westernYear, parseEraYear("令和元年")?.westernYear, parseEraYear("昭和65年"));
console.log(eraYearsOf(1989).map((one) => `${one.era.kanji}${one.year}`));
console.log(eraOnDate("1989-01-07")?.era.kanji, eraOnDate("1989-01-08")?.era.kanji);
console.log(formatEraYearJapanese(eraYearOf(2019)!, { gannen: true }));
```

```text
1991 2019 null
[ '平成1', '昭和64' ]
昭和 平成
令和元年
```

### Kanji numerals, both ways

A number written in kanji, in digits or in a mixture becomes a number, and a number becomes kanji, in the formal characters a contract uses, and in the reading aloud with its sound changes.

```ts
import { parseEnglishNumber, parseJapaneseNumber, readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

console.log(parseJapaneseNumber("1億2000万"), parseJapaneseNumber("2万5千"), parseJapaneseNumber("一二三"));
console.log(writeJapaneseNumber(120_000_000), writeJapaneseNumber(10_000, { formal: true }));
console.log(readJapaneseNumber(300), readJapaneseNumber(800), parseEnglishNumber("5 man"));
```

```text
120000000 25000 null
一億二千万 壱万
さんびゃく はっぴゃく 50000
```

### Which verb is this?

A sentence writes 食べませんでした where a dictionary lists 食べる. `dictionaryForms` proposes every dictionary form it could come from, and the caller keeps only the ones its own dictionary confirms, with `wordClassesOf` to compare the kind of word.

```ts
import { dictionaryForms, wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";

const proposals = dictionaryForms("食べませんでした");
console.log(proposals.slice(0, 2));

// Your own dictionary says what each word is: here, JMdict's tags for 食べる.
const confirmed = proposals.filter((proposal) => wordClassesOf("食べる", ["v1", "vt"]).includes(proposal.wordClass) && proposal.base === "食べる");
console.log(confirmed);
```

```text
[
  { base: '食べる', wordClass: 'ichidan' },
  { base: '食ぶ', wordClass: 'godan' }
]
[ { base: '食べる', wordClass: 'ichidan' } ]
```

### A reading divided over its kanji, and a test made from it

`segmentWord` cuts a word and its reading into kanji, kana and okurigana, each kanji with its share of the reading, the way a school's かん字テスト writes them. `buildKanjiTest` makes the test from a list, the same test for the same seed.

```ts
import { buildKanjiTest, kanjiAsWord, segmentWord } from "@johnmorrisdotca/hikidashi/align";

console.log(segmentWord("形が合う", "かたちがあう")?.map((part) => `${part.text}:${part.reading}:${part.kind}`));
console.log(segmentWord("食べる", "たべる")?.map((part) => `${part.text}:${part.reading}`));
console.log(segmentWord("食べる", "のむ"));                        // a reading that does not fit: null, never a wrong answer

const words = ["食べる", "水", "学校", "形が合う"]
  .map((word, at) => ({ word, reading: ["たべる", "みず", "がっこう", "かたちがあう"][at]! }));
const test = buildKanjiTest(words, { seed: 7, count: 3 });
console.log(Object.keys(test), test.writing.length, test.reading.length);
console.log(kanjiAsWord("食", ["た.べる"], ["ショク"]));       // a kanji and its dictionary readings become a word to ask
```

```text
[ '形:かたち:kanji', 'が:が:kana', '合:あ:kanji', 'う:う:okurigana' ]
[ '食:た', 'べる:べる' ]
null
[ 'writing', 'reading' ] 3 3
{ word: '食べる', reading: 'たべる' }
```

### Words and kanji out of pasted text

Somebody pastes a page of a book. The text is cut to a length, stripped of control characters, matched longest first against a dictionary that the caller holds, and what comes back is words in dictionary form and the kanji.

```ts
import type { WordClass } from "@johnmorrisdotca/hikidashi/deinflect";
import { extractFromText, wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

const known = new Map<string, WordClass[]>([["先生", []], ["学校", []], ["行く", ["godan"]]]);
const found = extractFromText({ text: "先生と学校へ行きます", known });
console.log(found.words, found.kanji.join(""));
console.log(found.stats);
console.log(wordCandidates("先生と学校").length > 5);   // every substring a dictionary might know: one question to the database
```

```text
[ '先生', '学校', '行く' ] 先生学校行
{ characters: 10, truncated: false, kanji: 5, words: 3 }
true
```

### Put the easiest example sentence first

A sentence is as hard as it is long, and as its hardest kanji. You give the costs, from the grades or frequencies you hold; the package gives the score.

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi/difficulty";

const costs = new Map([
  ["水", kanjiCost({ grade: 1, frequencyRank: 223 })],
  ["飲", kanjiCost({ grade: 3, frequencyRank: 969 })],
  ["毎", kanjiCost({ grade: 2, frequencyRank: null })],
  ["日", kanjiCost({ grade: 1, frequencyRank: null })],
]);
const sentences = ["水を飲む。", "みずをのむ。", "毎日、水を飲む。"];
const ranked = sentences.map((sentence) => ({ sentence, score: sentenceDifficulty(sentence, costs) })).sort((a, b) => a.score - b.score);
console.log(ranked);
```

```text
[
  { sentence: 'みずをのむ。', score: 6 },
  { sentence: '水を飲む。', score: 14 },
  { sentence: '毎日、水を飲む。', score: 17 }
]
```

## The drawers

Each drawer in a few lines, with its first calls. How each one decides its answers, and every case it refuses, is in [How each drawer works](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html) in the documentation, and every function has a page of its own in the [reference](https://johnmorrisdotca.github.io/hikidashi/docs/).

### Era years: `/wareki`

```ts
import { eraOnDate, eraYearOf, eraYearsOf, formatEraYearJapanese, parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

parseEraYear("Heisei 3")?.westernYear;                    // 1991
parseEraYear("令和元年")?.westernYear;                     // 2019
eraYearsOf(1989).map((one) => `${one.era.kanji}${one.year}`);   // ["平成1", "昭和64"]: both are right
eraOnDate("1989-01-07");                                  // 昭和64
eraOnDate("1989-01-08");                                  // 平成1
formatEraYearJapanese(eraYearOf(2019)!, { gannen: true }); // "令和元年"
```

| Era | Reading | First day | Last day | Years |
| --- | --- | --- | --- | --- |
| 明治 Meiji | めいじ | 1868-10-23 | 1912-07-29 | 1 to 45 |
| 大正 Taisho | たいしょう | 1912-07-30 | 1926-12-24 | 1 to 15 |
| 昭和 Showa | しょうわ | 1926-12-25 | 1989-01-07 | 1 to 64 |
| 平成 Heisei | へいせい | 1989-01-08 | 2019-04-30 | 1 to 31 |
| 令和 Reiwa | れいわ | 2019-05-01 | still running | 1 to 99 |

An era changes partway through a Western year, so the years 1912, 1926, 1989 and 2019 each belong to two eras: `eraYearsOf` answers with both, and `eraOnDate` says which one a day is in. A year an era never reached (昭和65), a day that is not on the calendar and anything before 明治 give `null`. More: [era years, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#era-years), and the [`/wareki` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/wareki/index.html).

### Kanji numerals: `/numerals`

```ts
import { parseEnglishNumber, parseJapaneseNumber, readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

parseJapaneseNumber("1億2000万");              // 120000000
parseJapaneseNumber("2万5千");                 // 25000
writeJapaneseNumber(120_000_000);              // "一億二千万"
writeJapaneseNumber(10_000, { formal: true }); // "壱万"
readJapaneseNumber(800);                       // "はっぴゃく"
parseEnglishNumber("5 man");                   // 50000
```

Japanese counts in ten-thousands (万, 億, 兆), which is why 120 million is 一億二千万. The reader takes kanji, digits and any mixture, and refuses what is not a number (万億, 一二三, a bare 万) with `null`; whole numbers from 0 to 9,007,199,254,740,991 only. More: [kanji numerals, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#kanji-numerals), and the [`/numerals` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/numerals/index.html).

### Dictionary forms: `/deinflect`

```ts
import { dictionaryForms, wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";

dictionaryForms("食べませんでした");
// [{ base: "食べる", wordClass: "ichidan" }, { base: "食ぶ", wordClass: "godan" }, …]
wordClassesOf("行く", ["v5k-s", "vi"]);       // ["godan"], from JMdict's tags
```

A sentence writes 行きます where a dictionary lists 行く. `dictionaryForms` *proposes* every dictionary form a written word could come from, likeliest first, each with the kind of word it would have to be, and your dictionary confirms which is real, through `wordClassesOf`. Not covered: the imperative, keigo verbs, and な adjectives. More: [dictionary forms, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#dictionary-forms), and the [`/deinflect` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/deinflect/index.html).

### Reading alignment: `/align`

```ts
import { buildKanjiTest, segmentWord } from "@johnmorrisdotca/hikidashi/align";

segmentWord("形が合う", "かたちがあう");
// [{ text: "形", kind: "kanji", reading: "かたち" }, { text: "が", kind: "kana", reading: "が" },
//  { text: "合", kind: "kanji", reading: "あ" }, { text: "う", kind: "okurigana", reading: "う" }]
const words = [{ word: "食べる", reading: "たべる" }, { word: "水", reading: "みず" }];
buildKanjiTest(words, { seed: 7, count: 12 });   // { writing: [...], reading: [...] }, the same test for the same seed
```

The kana in a word are anchors in its reading, which lets the rest be shared out over the kanji, the way a school's かん字テスト sets it: 形が合う read かたちがあう is 形 (かたち), が, 合 (あ), う. `segmentWord` is `null` when the reading does not fit, so a test leaves the word out; `buildKanjiTest` makes a seeded test from a list. More: [reading alignment, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#reading-alignment), and the [`/align` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/align/index.html).

### Pasted text: `/extract`

```ts
import type { WordClass } from "@johnmorrisdotca/hikidashi/deinflect";
import { extractFromText, wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

const known = new Map<string, WordClass[]>([["先生", []], ["学校", []], ["行く", ["godan"]]]);
extractFromText({ text: "先生と学校へ行きます", known });
// { words: ["先生", "学校", "行く"], kanji: ["先", "生", "学", "校", "行"], stats: { characters: 10, … } }
```

The text is never stored and never trusted for its length: it is cut to `EXTRACT_LIMITS.characters`, and what comes back is the words your dictionary (`known`) recognised, in dictionary form, and single kanji. `wordCandidates` lists what to ask your database, once per paste. More: [pasted text, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#pasted-text), the [how-to](https://johnmorrisdotca.github.io/hikidashi/docs/guides/extract-words-from-a-paste.html), and the [`/extract` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/extract/index.html).

### Sentence difficulty: `/difficulty`

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi/difficulty";

const costs = new Map([["水", kanjiCost({ grade: 1, frequencyRank: 223 })], ["飲", kanjiCost({ grade: 3, frequencyRank: 969 })]]);
sentenceDifficulty("水を飲む。", costs);   // 14: five characters and three times the hardest kanji's 3
```

The score is a sentence's length plus three times its hardest kanji's cost, so a kana-only sentence sorts first. `kanjiCost` turns a school grade or a frequency rank you hold into a cost from 1 to 20; none is shipped here. More: [sentence difficulty, explained](https://johnmorrisdotca.github.io/hikidashi/docs/guides/how-it-works.html#sentence-difficulty), and the [`/difficulty` reference](https://johnmorrisdotca.github.io/hikidashi/docs/api/difficulty/index.html).

## API

The [documentation](https://johnmorrisdotca.github.io/hikidashi/docs/) has a page for every export of every entry point: its signature, its parameters, what it returns and what `null` means, and examples that are run when the site is built, with what they print. It is made from the source and its doc comments by `pnpm docs:site`, so it cannot fall behind the code, and it is searchable. The one-page [API reference](https://johnmorrisdotca.github.io/hikidashi/api.html) lists every export and links to its page.

| Entry | Exports |
| --- | --- |
| `@johnmorrisdotca/hikidashi/wareki` | `JAPANESE_ERAS`, `parseEraYear`, `westernYearFor`, `eraYearsOf`, `eraYearOf`, `eraOnDate`, `formatEraYearJapanese`, `formatEraYearRomaji`, and the types `JapaneseEra` and `EraYear` |
| `@johnmorrisdotca/hikidashi/numerals` | `parseJapaneseNumber`, `writeJapaneseNumber`, `readJapaneseNumber`, `parseEnglishNumber`, `LARGEST_JAPANESE_NUMBER` |
| `@johnmorrisdotca/hikidashi/deinflect` | `dictionaryForms`, `wordClassesOf`, `followsAsVerbStem`, `WORD_CLASSES`, `LONGEST_ENDING`, and the types `WordClass` and `Deinflection` |
| `@johnmorrisdotca/hikidashi/align` | `segmentWord`, `kanjiAsWord`, `buildKanjiTest`, `katakanaToHiragana`, `hiraganaToKatakana`, `SEGMENT_KINDS`, `ALIGN_LIMITS`, and the types `WordSegment`, `ReadWord`, `KanjiTest` and `KanjiTestQuestion` |
| `@johnmorrisdotca/hikidashi/extract` | `extractFromText`, `wordCandidates`, `sanitizePastedText`, `EXTRACT_LIMITS`, and the types `KnownWords`, `ExtractInput` and `ExtractResult` |
| `@johnmorrisdotca/hikidashi/difficulty` | `kanjiCost`, `kanjiIn`, `sentenceDifficulty`, `UNKNOWN_KANJI_COST`, and the type `KanjiDifficultySource` |
| `@johnmorrisdotca/hikidashi` | all of the above, from one import |

Every function is pure: it returns new values and never changes what it was given. Anything that is not text where text is expected is refused, not thrown at.

## Theming

None, on purpose: Hikidashi makes no colours, no markup and no styles, so there is nothing of its own to theme, and a page built on it looks however the page looks. The demo is the worked example: its panels are drawn by [`demo/demo.js`](./demo/demo.js) and [`demo/hikidashi.css`](./demo/hikidashi.css), over the family's shared stylesheet.

## Limits

All of these are held by tests, and the ones with a name are exported.

| Limit | Value | Where |
| --- | --- | --- |
| Eras | the five modern eras, 明治 (1868) to 令和; nothing before | `JAPANESE_ERAS` |
| Years of the era still running | 1 to 99 | `eraYearsOf`, `westernYearFor` |
| Numbers | whole numbers from 0 to 9,007,199,254,740,991 | `LARGEST_JAPANESE_NUMBER` |
| A pasted text | read to 20,000 characters, then cut, and `stats.truncated` says so | `EXTRACT_LIMITS.characters` |
| The longest word matched | 8 characters, and the ending a sentence can put on it | `EXTRACT_LIMITS.wordLength`, `LONGEST_ENDING` |
| Candidates asked of a dictionary | 4,000 | `EXTRACT_LIMITS.candidates` |
| A word to align | 64 characters; its reading 256 | `ALIGN_LIMITS` |
| A conjugation chain | 5 endings deep | `dictionaryForms` |

The matching is bounded, not exponential: a word of repeated kana that no reading fits is refused in no time, and a paste of the longest length is read in a moment.

## Accessibility

Hikidashi draws nothing: its functions take text and give back text, numbers and lists, so what it can do for accessibility is give a page results a screen reader can say. The demo is the worked example of a page built on them.

- **Results that can be spoken.** `readJapaneseNumber` gives a number as hiragana with the sound changes (さんびゃく), `formatEraYearJapanese` gives an era year as written (令和元年), and `segmentWord` gives each kanji its reading, so a page can put the reading next to a kanji for a learner who hears the page and cannot see the character.
- **Nothing depends on colour or sound.** The package makes no colours and no sounds. A function that cannot answer says so with `null` or an empty list, never with a plausible wrong answer, so a page can say plainly that it could not read what was typed.
- **In the demo, every panel is a labelled region.** Each is a `section` named by its heading, each box has a `label`, and the answer is an `aria-live="polite"` region, so what a person types is answered without moving focus. The boxes are marked `lang="ja"`, so a screen reader reads what is typed in Japanese.
- **The examples are real buttons**, in a labelled group, with `aria-pressed` for the one in use; the language chooser and every button are at least 44 pixels square, with a visible focus ring, and the page fits a phone at 390 pixels.
- **The keyboard.** The demo needs nothing but Tab, typing and Enter or Space on a button.
- **Reduced motion.** Nothing in the package or the demo's panels moves.
- **Not yet.** The demo's colours have not been measured against WCAG contrast ratios, and its Japanese has not been read by a native reader (see [Languages](#languages)).

## Browser and runtime support

Nothing here touches the DOM, the network or the file system, so the package runs anywhere JavaScript does: Node 22 or later (CI tests 22 and 24, on Linux, macOS and Windows), and any browser with ES2020 modules and Unicode property escapes in regular expressions (`\p{Script=Han}`): Chrome and Edge 80, Safari 13.1, Firefox 78, all from 2020 on. The demo is played in a real Chromium at a phone's width (with touch) and a desk's, and in WebKit, Safari's engine, at a phone's width; Firefox is not in that run. Deno and Bun are not tested.

## Languages

The functions answer in kanji, kana and numbers, so they have no words of their own to translate. The [documentation](https://johnmorrisdotca.github.io/hikidashi/docs/) is in English and [Japanese](https://johnmorrisdotca.github.io/hikidashi/docs/ja/index.html): every guide in both, and the reference's descriptions and examples in English under Japanese headings. The demo is in English and Japanese, chosen by its own chooser, taking the browser's language on a first visit. **Japanese: included; not yet reviewed by a native reader. Corrections welcome.** Every line of the demo is listed beside its English in [docs/strings-ja.md](./docs/strings-ja.md), and there is an [issue template](https://github.com/johnmorrisdotca/hikidashi/issues/new?template=fix-a-translation.md) for fixing one.

## Roadmap

Not here yet, and each welcome as an [issue](https://github.com/johnmorrisdotca/hikidashi/issues):

- The imperative form, and keigo, in the dictionary forms.
- Positional numerals with several non-zero digits (二〇二四), which kanji numerals use for years and which are refused today (二〇 and 一〇〇 are read).
- Era names before 明治.

Left out on purpose: any dictionary, word list or grade table, which would need keeping up to date and has its own licence; and any network request.

## Architecture

Each drawer is a plain module with no DOM, and an entry of its own in `package.json`, so a bundler keeps only what a page imports. The drawers share nothing but the two kana converters, and `deinflect` is used by `extract`.

```text
src/
├── index.ts            the main entry: every drawer
├── wareki.ts           era years and dates, both ways: the "/wareki" entry
├── numerals.ts         kanji numerals, read, written and said aloud: the "/numerals" entry
├── englishNumbers.ts   numbers in English words and romaji, read by "/numerals"
├── deinflect.ts        the dictionary forms of a conjugated word: the "/deinflect" entry
├── align.ts            a reading shared out over its kanji, and a kanji test: the "/align" entry
├── extract.ts          words and kanji pulled out of pasted text: the "/extract" entry
├── difficulty.ts       what a kanji costs and how hard a sentence is: the "/difficulty" entry
├── kana.ts             hiragana and katakana into each other
└── version.ts          the package's version
```

Tests sit beside the code they test (`*.test.ts`). `scripts/` builds the demo, its API reference page and the documentation site, takes the README's pictures and checks the package as npm packs it; `demo/` is the page, and `e2e/` its browser tests.

## The name

*Hikidashi* (引き出し) is Japanese for a "drawer": the sliding box in a desk or a chest. It is the noun of the verb 引き出す (*hikidasu*), "to pull out", and the same word means a withdrawal from a bank. 引き出しが多い (*hikidashi ga ōi*), "to have many drawers", is the compliment for somebody with a deep store of knowledge, experience and things to say, all within reach to draw on. This package is that: a drawer of small tools, each one pulled out when wanted. ([Wiktionary: 引き出し](https://en.wiktionary.org/wiki/引き出し), which gives "drawer" and "withdrawal"; the idiom is explained by Japanese writers such as [ダイヤモンド・オンライン](https://diamond.jp/articles/-/318222), for whom it is a person's stock of experience they can bring out in conversation.)

It is a supplement to a larger product, not the product, which is why it is named for a drawer.

## Where it comes from, and where it is used

Hikidashi was built for UmaKuma, a Japanese study app by the same author, and its functions are the ones that app had written, tested and kept for itself: era years for dates on a form, kanji numerals for amounts in a headline, dictionary forms so that a pasted sentence gives 行く and not 行き, a reading shared out over its kanji for a worksheet, and the cost of a sentence so the easiest example comes first. They were pure, so they came out whole.

### Used by

- UmaKuma, a Japanese study app by the same author.

Using Hikidashi in something? Open an *Add my project* issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Hikidashi is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Hikidashi.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install
pnpm check          # lint, types and every test
pnpm test:package   # pack, install and import it as somebody who installed it would
pnpm test:demo      # build the demo and play it in a real browser, at a phone's width and a desk's
pnpm site           # build the demo into site/, as the Pages workflow publishes it
pnpm test:readme    # run every example in the README against the built package
pnpm screenshots:readme   # take the README's pictures from the built demo, in light and dark
pnpm docs:make      # rewrite docs/strings-ja.md after changing a word of the demo
pnpm docs:check     # the docs' checks: a TSDoc summary, @param, @returns and @example on every export, guide links, every example run
pnpm docs:site      # build the documentation into site/docs/ (after pnpm site), with its search index, llms.txt and llms-full.txt
pnpm size           # each entry point, bundled, minified and gzipped (pnpm size --write records docs/bundle-size.json)
```

The documentation's guides are Markdown in [`docs/guides/`](./docs/guides/) (English) and [`docs/guides/ja/`](./docs/guides/ja/) (Japanese); the reference is made from the doc comments in `src/`. The generator, `scripts/docs-site.mjs`, is the same file in every package of the family; [docs/ROLLOUT.md](./docs/ROLLOUT.md) says how a package adopts it.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The commands are under [Development](#development).

Please follow the [code of conduct](./CODE_OF_CONDUCT.md). Text that makes a function run for a very long time is for the [security policy](./SECURITY.md), not a public issue.

## Changes

See [CHANGELOG.md](./CHANGELOG.md). The latest release, 1.0.2, adds no code: it is this README in full, with pictures of every drawer, examples that are run on every change, examples for React, Vue, Svelte and Angular, and an Accessibility section.

## Licence

MIT, © John Morris. The package is code only and ships no data. The demo's one small table (the school grade of thirty-odd kanji, typed in to show `kanjiCost`) is credited in [NOTICE.md](./NOTICE.md), and is not part of the published package.

