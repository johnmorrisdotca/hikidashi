---
title: 手元の辞書で貼り付けた文から単語を取り出す
section: how-to
order: 2
description: 貼り付けられたページを、手元の辞書にある単語と漢字に変えます。辞書への問い合わせは一度だけです。
---

学習ツールに本のページが貼り付けられ、そこから単語の一覧を作りたいとします。文を読むのは Hikidashi の役目で、何が単語かを決めるのは手元の辞書（データベース、JSON ファイル、JMdict など）です。手順は三つです。単語になりうるものを並べ、それをまとめて辞書に問い合わせ、その答えをもとに文を読みます。

## 1. 候補を並べる

`wordCandidates` は、辞書に載っていそうな文中の部分と、活用しているように見える部分の辞書形（「行きます」なら「行く」）を返します。数は `EXTRACT_LIMITS.candidates` までなので、一章分の文でも、問い合わせの大きさには上限があります。

```ts
import { wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

const text = "毎日、先生と学校へ行きます。日本語を勉強しています。";
const candidates = wordCandidates(text);
console.log(candidates.length, candidates.slice(0, 8));
```

## 2. 辞書に一度だけ問い合わせる

候補をすべて一つのクエリーで引き、見つかった単語から、その語の種類への `Map` を作ります。`wordClassesOf` は、辞書に載っている品詞（`"godan verb"` のような英語の名前でも JMdict のタグでも）を Hikidashi の種類に変えます。ここでは配列をデータベースの代わりにしています。

```ts
import { wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";
import { type KnownWords, wordCandidates } from "@johnmorrisdotca/hikidashi/extract";

// 手元の辞書：単語と、その品詞。
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
// 実際のアプリでは SELECT word, pos FROM entries WHERE word = ANY($1) のように、候補を $1 に渡します。
const rows = DICTIONARY.filter((row) => wanted.has(row.word));
const known: KnownWords = new Map(rows.map((row) => [row.word, wordClassesOf(row.word, row.pos)]));
console.log([...known.keys()]);
```

## 3. 文を読む

```ts
import { wordClassesOf } from "@johnmorrisdotca/hikidashi/deinflect";
import { extractFromText } from "@johnmorrisdotca/hikidashi/extract";

const known = new Map([
  ["毎日", []], ["先生", []], ["学校", []], ["日本語", []],
  ["行く", wordClassesOf("行く", ["v5k-s"])], ["勉強", wordClassesOf("勉強", ["vs-s"])],
]);
const found = extractFromText({ text: "毎日、先生と学校へ行きます。日本語を勉強しています。", known });
console.log(found.words);    // 辞書形：「行きます」は「行く」
console.log(found.kanji.join(""));
console.log(found.stats);
```

単語は辞書形で、文に最初に出てきた順に、一つずつ返ります。漢字は、単語に含まれるかどうかに関係なく返ります。ページを貼り付けた学習者は、どちらの一覧を求めているかもしれないからです。

## 確かめておくこと

- **種類を持たない単語は、書かれたままの形でしか一致しません。** 手順 3 の「先生」は `[]` なので、そのままの形で見つかります。種類を持たない動詞は辞書形でしか見つからず、「行きます」からは見つかりません。
- **動詞の語幹と同じ形の名詞は、後ろに何もなければ名詞のままです。** 辞書に「行き」があれば「東京行き」からは「行き」が、「行きます」からは「行く」が出ます。[取り出し方の決まり](how-it-works.md#貼り付けた文)を見てください。
- **何も保存せず、そのまま返しもしません。** 結果は、辞書にもともとあった単語と一文字ずつの漢字だけで、貼り付けた文そのものは返りません。文が `EXTRACT_LIMITS.characters` より長くて切り詰めたときは、`stats.truncated` がそれを示します。
