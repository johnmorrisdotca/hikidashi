---
title: Pull words out of a paste with your own dictionary
section: how-to
order: 2
description: Turn a pasted page into the words and kanji your dictionary knows, asking the database once.
---

Somebody pastes a page of a book into a study tool and wants a vocabulary list from it. Hikidashi does the reading; your dictionary (a database, a JSON file, JMdict) says what is a word. The recipe is three steps: list what could be a word, ask the dictionary about all of it at once, and read the text against the answers.

## 1. List the candidates

`wordCandidates` gives every run of the text that a dictionary might list, and the dictionary forms of the runs that look conjugated (行きます offers 行く). It is capped at `EXTRACT_LIMITS.candidates`, so even a chapter is one bounded question.

```ts
import { wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

const text = "毎日、先生と学校へ行きます。日本語を勉強しています。";
const candidates = wordCandidates(text);
console.log(candidates.length, candidates.slice(0, 8));
```

## 2. Ask the dictionary once

Look all the candidates up in one query, and build a `Map` from each word found to the kinds of word it is. `wordClassesOf` turns the parts of speech your dictionary lists, in plain words or as JMdict tags, into Hikidashi's kinds. Here an array stands in for the database:

```ts
import { wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";
import { type KnownWords, wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

// Your dictionary: each word with the parts of speech it lists.
const DICTIONARY = [
  { word: "毎日", pos: ["n", "adv"] },
  { word: "先生", pos: ["n"] },
  { word: "学校", pos: ["n"] },
  { word: "行く", pos: ["v5k-s", "vi"] },
  { word: "日本語", pos: ["n"] },
  { word: "勉強", pos: ["n", "vs-s"] },
  { word: "する", pos: ["vs-i"] },
];

const text = "毎日、先生と学校へ行きます。日本語を勉強しています。";
const wanted = new Set(wordCandidates(text));
// In a real app: SELECT word, pos FROM entries WHERE word = ANY($1), with the candidates as $1.
const rows = DICTIONARY.filter((row) => wanted.has(row.word));
const known: KnownWords = new Map(rows.map((row) => [row.word, wordClassesOf(row.word, row.pos)]));
console.log([...known.keys()]);
```

## 3. Read the text

```ts
import { wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";
import { extractFromText } from "@johnmorrisdotca/hikidashi/extract";

const known = new Map([
  ["毎日", []], ["先生", []], ["学校", []], ["日本語", []],
  ["行く", wordClassesOf("行く", ["v5k-s"])], ["勉強", wordClassesOf("勉強", ["vs-s"])],
]);
const found = extractFromText({ text: "毎日、先生と学校へ行きます。日本語を勉強しています。", known });
console.log(found.words);    // dictionary forms: 行きます is 行く
console.log(found.kanji.join(""));
console.log(found.stats);
```

The words come back in dictionary form and in the order they first appear, each once. The kanji come back whether or not they belong to a word, because a learner who pasted a page may want either list.

## What to check

- **A word with no kinds is matched only as written.** In step 3, 先生 has `[]` and is found as it stands. A verb with no kinds would be found only in its dictionary form, never in 行きます.
- **A noun that is also a verb's stem stays a noun** when nothing follows it: 東京行き gives 行き if your dictionary lists it, and 行きます gives 行く. See [how the extractor decides](how-it-works.md#pasted-text).
- **Nothing is stored or echoed.** The result is words your dictionary already had and single kanji; the pasted text is never returned. `stats.truncated` says when a paste was longer than `EXTRACT_LIMITS.characters` and was cut.
