---
title: Sort example sentences by difficulty
section: how-to
order: 4
description: Score every example sentence once from the kanji data you hold, so the easiest can be shown first.
---

A dictionary page for 水 can show any of thousands of example sentences. Showing the first one a database returns hands a beginner a sentence full of rare kanji. Score each sentence once, when it is added, keep the score in a column, and the query becomes a sort.

## Build the costs

A kanji's cost comes from what you hold about it: a school grade, a frequency rank, or nothing. `kanjiCost` turns that into a number from 1 to 20. Build a `Map` of the kanji you have data for; anything missing counts as the hardest kind.

```ts
import { kanjiCost } from "@johnmorrisdotca/hikidashi/difficulty";

// From KANJIDIC2 or any kanji table: the grade (1 to 6, 8, 9, 10) and the frequency rank, either of them may be null.
const TABLE = [
  { kanji: "水", grade: 1, frequencyRank: 223 },
  { kanji: "飲", grade: 3, frequencyRank: 969 },
  { kanji: "毎", grade: 2, frequencyRank: 436 },
  { kanji: "日", grade: 1, frequencyRank: 1 },
  { kanji: "冷", grade: 4, frequencyRank: 875 },
];
const costs = new Map(TABLE.map((row) => [row.kanji, kanjiCost(row)]));
console.log([...costs]);
```

## Score and sort

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi/difficulty";

const costs = new Map([["水", kanjiCost({ grade: 1, frequencyRank: 223 })], ["飲", kanjiCost({ grade: 3, frequencyRank: 969 })], ["毎", 2], ["日", 1], ["冷", 4]]);
const sentences = ["毎日、水を飲む。", "冷たい水を飲みたい。", "みずをのむ。", "水を飲む。", "清冽な水を飲む。"];
const ranked = sentences
  .map((sentence) => ({ sentence, score: sentenceDifficulty(sentence, costs) }))
  .sort((a, b) => a.score - b.score);
for (const { sentence, score } of ranked) console.log(String(score).padStart(3), sentence);
```

The kana-only sentence comes first, as its length alone. 清冽な水を飲む。 comes last: 清 and 冽 are not in the table, so it is scored as if it held the hardest kanji there is.

## Keep it in the database

Score when a sentence is saved, not when it is shown. The score depends only on the sentence and your costs, so it changes only when your kanji table does, and then a one-off job rescores every row. The page's query is `ORDER BY difficulty` with an index, and nothing is computed while somebody waits.

See [how the score is made](how-it-works.md#sentence-difficulty) for why the hardest kanji weighs three times a character.
