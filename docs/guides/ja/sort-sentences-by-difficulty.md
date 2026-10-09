---
title: 例文をやさしい順に並べる
section: how-to
order: 4
description: 手元の漢字のデータから例文ごとに一度だけ点数をつけ、いちばんやさしい例文から表示します。
---

「水」の辞書のページには、何千もの例文の中のどれでも表示できます。データベースが最初に返した例文を表示すると、初心者に難しい漢字だらけの文を見せてしまうことがあります。例文を追加するときに一度だけ点数をつけて列に保存しておけば、クエリーは並べ替えるだけになります。

## コストを作る

漢字のコストは、その漢字について手元にある情報（学年、使用頻度の順位、あるいは何もなし）から決まります。`kanjiCost` はそれを 1 から 20 の数に変えます。データのある漢字で `Map` を作ります。表にない漢字は、いちばん難しいものとして数えます。

```ts
import { kanjiCost } from "@johnmorrisdotca/hikidashi/difficulty";

// KANJIDIC2 などの漢字の表から：学年（1〜6、8、9、10）と使用頻度の順位。どちらも null のことがあります。
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

## 点数をつけて並べる

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi/difficulty";

const costs = new Map([["水", kanjiCost({ grade: 1, frequencyRank: 223 })], ["飲", kanjiCost({ grade: 3, frequencyRank: 969 })], ["毎", 2], ["日", 1], ["冷", 4]]);
const sentences = ["毎日、水を飲む。", "冷たい水を飲みたい。", "みずをのむ。", "水を飲む。", "清冽な水を飲む。"];
const ranked = sentences
  .map((sentence) => ({ sentence, score: sentenceDifficulty(sentence, costs) }))
  .sort((a, b) => a.score - b.score);
for (const { sentence, score } of ranked) console.log(String(score).padStart(3), sentence);
```

かなだけの文は、長さだけが点数になり、先頭に来ます。「清冽な水を飲む。」は最後です。「清」と「冽」は表にないので、いちばん難しい漢字を含むものとして点数がつきます。

## データベースに保存する

点数は例文を表示するときではなく、保存するときにつけます。点数は例文と漢字のコストだけで決まるので、変わるのは漢字の表が変わったときだけです。そのときは一回限りの処理で全行の点数をつけ直します。ページのクエリーはインデックスを使った `ORDER BY difficulty` になり、誰かが待っている間に計算することはありません。

いちばん難しい漢字を、ふつうの一文字の三倍の重みで数える理由は、[点数のつけ方](how-it-works.md#文の難しさ)を見てください。
