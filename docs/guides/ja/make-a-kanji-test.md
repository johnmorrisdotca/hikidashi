---
title: かん字テストを作る
section: how-to
order: 3
description: 単語の一覧から、日本の学校のかん字テストと同じ形の書き取りと読みのテストを、シードを決めて作ります。
---

かん字テストには二つの部分があります。書き取りでは、空いたマスの横に読みが印刷されていて、児童が漢字を書きます。送り仮名はかっこに入れて示します。読みでは、漢字が印刷されていて、児童が読みを書きます。この手順では一覧から両方を作ります。同じシードからはいつも同じテストができるので、紙のテストと画面のテストが一致します。

## 単語の一覧から作る

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
console.log("書き：", test.writing.map((question) => question.reading).join(" / "));
console.log("読み：", test.reading.map((question) => question.word).join(" / "));
```

どの単語をどちらに入れ、どの順に並べるかは、シードで決まります。シードをテストの URL に入れておけば（`?seed=20241001`）、リンクを開いた人は誰でも同じテストを受けられます。単語はそれぞれ一度だけ出題します。一覧が短くて二つに分けられないときは、片方が足りなくならないよう、同じ単語を両方で出題します。

## マスを描く

それぞれの問題には、部分に分けた単語が入っています。読みの割り当てがついた漢字、語の中のかな、語の終わりの送り仮名です。書き取りの問題を描くのに必要なものは、これですべてそろっています。

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

## 一字の漢字から作る

学年や教科書の章の漢字の一覧は、`kanjiAsWord` で出題する単語に変えられます。辞書にある各漢字の読みを使います（KANJIDIC2 では、語幹と送り仮名の境に点が付いています）。

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

## 読みが合わない単語

読みが当てはまらない単語（打ち間違いや、別の単語の読みなど）は、間違った答えで出題することなく、テストから外します。印刷する前に `segmentWord` で一覧を確かめておきましょう。そうした単語では `null` が返ります。

```ts
import { segmentWord } from "@johnmorrisdotca/hikidashi/align";

const list = [{ word: "食べる", reading: "たべる" }, { word: "食べる", reading: "のむ" }, { word: "ひらがな", reading: "ひらがな" }];
for (const { word, reading } of list) console.log(word, reading, segmentWord(word, reading) === null ? "除外" : "出題");
```

漢字のない単語も外します。書くものがないからです。
