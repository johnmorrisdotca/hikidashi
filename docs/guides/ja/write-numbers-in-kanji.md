---
title: 金額を漢数字で書き、読み方も示す
section: how-to
order: 5
description: 金額を日本語のページと同じように書き、契約書で使う大字でも書き、読み方も示します。
---

学習ツールで ¥1,200,000 を表示するとき、学習者に「百二十万円」という書き方と「ひゃくにじゅうまんえん」という読み方も見せたいとします。書類によっては、画を書き足して改ざんされないよう、契約書や領収書と同じ大字で金額を書く必要があります。この手順では、一つの数からこの三つを作り、人が入力しそうなどの書き方からでも数を読み取ります。

## 数から作る

```ts
import { readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

const amount = 1_200_000;
console.log(`${writeJapaneseNumber(amount)}円`);                     // 百二十万円
console.log(`金${writeJapaneseNumber(amount, { formal: true })}円也`);  // 金百弐拾万円也（領収書の書き方）
console.log(`${readJapaneseNumber(amount)}えん`);                     // ひゃくにじゅうまんえん
```

読み方には、学習者が覚えなければならない音の変化（300 は「さんびゃく」、800 は「はっぴゃく」、3,000 は「さんぜん」）が入っています。ただし読むのは数だけです。円や本などの助数詞が付くと音がさらに変わることがあり（一本は「いっぽん」）、それはページの側で扱います。

## 入力されたものから読む

金額の入力のしかたはさまざまです。数字のこともあれば、日本語のキーボードからの全角数字、見出しのような漢字との混ぜ書き、英語のこともあります。まず日本語として読み、だめなら英語として読みます。どちらも、読めないものには `null` を返します。

```ts
import { parseEnglishNumber, parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

const readAmount = (typed: string) => parseJapaneseNumber(typed.replace(/円$/, "")) ?? parseEnglishNumber(typed);
for (const typed of ["1,200,000", "１２０００００", "120万", "百二十万円", "1.2 million", "120 man", "百二十万ドル"]) console.log(typed, readAmount(typed));
```

最後の例は `null` です。「ドル」は数の一部ではなく、どの部分が数なのかを推測することはしません。

## 大きすぎる数と、書けない数

書くのも読むのも 9,007,199,254,740,991（`LARGEST_JAPANESE_NUMBER`）までです。これを超えると JavaScript では正確に数えられません。それより大きい数、負の数、小数には `null` が返るので、表示する前に確かめます。

```ts
import { LARGEST_JAPANESE_NUMBER, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

for (const value of [10 ** 12, LARGEST_JAPANESE_NUMBER, 2 ** 60, -5, 0.5]) console.log(value, writeJapaneseNumber(value) ?? "正確には書けない");
```
