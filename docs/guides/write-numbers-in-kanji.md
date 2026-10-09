---
title: Write amounts in kanji, and read them aloud
section: how-to
order: 5
description: Show an amount the way a Japanese page writes it, in the formal characters a contract uses, and as it is said.
---

A study tool shows ¥1,200,000 and wants the learner to see 百二十万円 and hear ひゃくにじゅうまんえん. A form needs the amount in the formal characters a contract or a receipt uses, so that nobody can add a stroke. This recipe does all three from one number, and reads the number back from any of the ways a person might type it.

## From a number

```ts
import { readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

const amount = 1_200_000;
console.log(`${writeJapaneseNumber(amount)}円`);                     // 百二十万円
console.log(`金${writeJapaneseNumber(amount, { formal: true })}円也`);  // 金百弐拾万円也, as a receipt writes it
console.log(`${readJapaneseNumber(amount)}えん`);                     // ひゃくにじゅうまんえん
```

The reading gives the sound changes a learner has to learn (300 is さんびゃく, 800 はっぴゃく, 3,000 さんぜん). It is the number alone: a counter such as 円 or 本 changes some sounds again (一本 is いっぽん), and that is left to your page.

## From what was typed

People type amounts every way: in digits, with full-width digits from a Japanese keyboard, mixed with kanji as headlines write them, or in words. Try the Japanese reader first and English words second; both answer `null` for anything they cannot read.

```ts
import { parseEnglishNumber, parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

const readAmount = (typed: string) => parseJapaneseNumber(typed.replace(/円$/, "")) ?? parseEnglishNumber(typed);
for (const typed of ["1,200,000", "１２０００００", "120万", "百二十万円", "1.2 million", "120 man", "百二十万ドル"]) console.log(typed, readAmount(typed));
```

The last one is `null`: ドル (dollars) is not part of a number, and the reader does not guess which part was meant.

## Large and impossible numbers

The writer and the reader stop at 9,007,199,254,740,991 (`LARGEST_JAPANESE_NUMBER`), past which JavaScript cannot count exactly. A number past it, a negative one or a fraction gives `null`, so test for it before you print:

```ts
import { LARGEST_JAPANESE_NUMBER, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

for (const value of [10 ** 12, LARGEST_JAPANESE_NUMBER, 2 ** 60, -5, 0.5]) console.log(value, writeJapaneseNumber(value) ?? "cannot be written exactly");
```
