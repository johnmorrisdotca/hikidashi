---
title: Make a kanji test
section: how-to
order: 3
description: Build a seeded writing and reading test from a word list, the way a Japanese school's かん字テスト sets it.
---

A かん字テスト (kanji test) has two halves: in the writing half the reading is printed beside empty squares and the pupil writes the kanji, with the okurigana in brackets; in the reading half the kanji are printed and the pupil writes the reading. This recipe makes both from a list, the same test every time for the same seed, so the sheet on paper and the one on screen match.

## From a list of words

```ts
import { buildKanjiTest } from "@johnmorrisdotca/hikidashi/align";

const words = [
  { word: "食べる", reading: "たべる" },
  { word: "飲む", reading: "のむ" },
  { word: "学校", reading: "がっこう" },
  { word: "形が合う", reading: "かたちがあう" },
  { word: "水", reading: "みず" },
  { word: "読む", reading: "よむ" },
];
const test = buildKanjiTest(words, { seed: 20241001, count: 3 });
console.log("write:", test.writing.map((question) => question.reading).join(" / "));
console.log("read: ", test.reading.map((question) => question.word).join(" / "));
```

The seed decides which words go in each half and in what order. Put it in the test's address (`?seed=20241001`) and anybody who opens the link gets the same test. Each word is asked once; a list too short for two halves asks its words both ways rather than leave a half short.

## Draw the squares

Each question carries its word cut into segments: kanji with their share of the reading, kana inside the word, and okurigana at its end. That is everything a writing question needs to draw.

```ts
import { buildKanjiTest } from "@johnmorrisdotca/hikidashi/align";

const [question] = buildKanjiTest([{ word: "形が合う", reading: "かたちがあう" }], { seed: 1, count: 1 }).writing;
const line = question!.segments.map((part) => {
  if (part.kind === "kanji") return `[${"□".repeat(part.text.length)}](${part.reading})`;
  if (part.kind === "okurigana") return `(${part.text})`;
  return part.text;
}).join("");
console.log(line);    // [□](かたち)が[□](あ)(う)
```

## From single kanji

A list of kanji, from a grade or a textbook's chapter, becomes words to ask with `kanjiAsWord`, from each kanji's readings as a dictionary lists them (KANJIDIC2 marks okurigana with a dot):

```ts
import { buildKanjiTest, kanjiAsWord, type ReadWord } from "@johnmorrisdotca/hikidashi/align";

const kanji = [
  { kanji: "食", kun: ["た.べる", "く.う"], on: ["ショク"] },
  { kanji: "水", kun: ["みず"], on: ["スイ"] },
  { kanji: "門", kun: [], on: ["モン"] },
];
const words = kanji.map((one) => kanjiAsWord(one.kanji, one.kun, one.on)).filter((word): word is ReadWord => word !== null);
console.log(words);
console.log(buildKanjiTest(words, { seed: 5, count: 3 }).writing.map((question) => question.word));
```

## Words whose reading does not fit

A word whose reading cannot be shared out over it (a typing slip, a reading that belongs to another word) is left out of the test, never asked with a wrong answer. Check a list before printing it with `segmentWord`, which is `null` for those:

```ts
import { segmentWord } from "@johnmorrisdotca/hikidashi/align";

const list = [{ word: "食べる", reading: "たべる" }, { word: "食べる", reading: "のむ" }, { word: "ひらがな", reading: "ひらがな" }];
for (const { word, reading } of list) console.log(word, reading, segmentWord(word, reading) === null ? "left out" : "asked");
```

A word with no kanji is left out too: there is nothing to write.
