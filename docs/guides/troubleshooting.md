---
title: Troubleshooting & FAQ
section: troubleshooting
order: 1
description: Why a function answered null, why a word was not found, and the setup problems that come up first.
---

Most questions about Hikidashi are about a `null` or an empty list. Each function returns one only when it cannot answer, and each one's page in the reference says exactly when. This page lists the cases people meet first.

## Why is this era year null?

`parseEraYear` answers `null` when the text does not name a year the era had:

- **The era had ended.** 昭和 ran to 64, 平成 to 31, 大正 to 15 and 明治 to 45. 平成32年 is `null`; the year is 令和2年.
- **The era is older than 明治.** Only the five modern eras are known; 慶応4年 is `null`.
- **Something else is in the text.** A day or month (令和6年5月1日), a word around it (生年: 昭和60年) or a stray character makes it `null`. Cut the year out first, or use `eraOnDate` for a full date in `YYYY-MM-DD` form.
- **The year of the running era is over 99.** 令和100年 is treated as a typing slip.

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

for (const text of ["平成32年", "慶応4年", "令和6年5月1日", "令和６年", "Shōwa 64"]) console.log(text, parseEraYear(text)?.westernYear ?? null);
```

## Why does 1989 give two era years?

Because it had two: 昭和64 until 7 January and 平成1 from 8 January. `eraYearsOf` lists both, newest first, and `eraYearOf` picks the newest. If you have the day, `eraOnDate` gives the right one. 1912, 1926 and 2019 are the same.

## Why is a Date in the wrong era?

`eraOnDate` reads a `Date` as the day it shows in its own time zone, which is the time zone of the machine it runs on. A `Date` made at midnight in Tokyo is the previous day on a server in UTC. Pass the day as a `YYYY-MM-DD` string when the time zone matters.

## Why is this number null?

`parseJapaneseNumber` refuses anything it cannot read exactly:

- **A full-width comma.** "１２，０００" is `null`; the reader takes a half-width thousands comma (12,000) and full-width digits without one (１２０００). Replace "，" with "," first if your input has it.
- **Kanji digits in a row.** 二〇二四, the way a year is sometimes written digit by digit, is refused today: kanji digits are read only with their units (二千二十四), and 〇 only as a place (二〇 is 20). Reading digit-by-digit numbers is on the README's roadmap. Until then, use digits, or `parseEraYear` for an era year.
- **A unit on its own, or out of order.** 万 alone, 万億.
- **A sign, a decimal point, or a number over 9,007,199,254,740,991.**

```ts
import { parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

for (const text of ["１２，０００", "12,000", "二〇二四", "二〇", "万", "1.5"]) console.log(text, parseJapaneseNumber(text));
```

## Why does dictionaryForms give a word that does not exist?

It proposes every dictionary form the written word could come from, without a dictionary, so some proposals are not real words: 食べる gives 食ぶ (godan) beside 食べる itself. Keep only the proposals your dictionary has, as that kind of word, with `wordClassesOf`. The [extraction how-to](extract-words-from-a-paste.md) does this end to end.

## Why does extractFromText find no words?

- **No `known` was passed.** Without your dictionary only kanji are found.
- **The word is in `known` but not in its dictionary form.** `known` lists words as a dictionary does: 行く, not 行きます.
- **A verb has no kinds in `known`.** `["行く", []]` matches 行く as written but never 行きます: a conjugation is matched only to a word your dictionary says is that kind of verb. Use `wordClassesOf` to fill the kinds.
- **The word is longer than 8 characters**, `EXTRACT_LIMITS.wordLength`.

## Why is 行き returned instead of 行く?

Because nothing after it makes it a verb. 東京行きの電車 ("the train bound for Tokyo") has the noun 行き; 行きます has the verb. The extractor keeps the word as written when your dictionary lists it, unless an ending that only a verb's stem takes (ます, たい and the rest) follows it.

## TypeScript cannot find "@johnmorrisdotca/hikidashi/wareki"

The entry points are declared in `package.json`'s `exports`, which TypeScript reads only with `"moduleResolution": "bundler"`, `"node16"` or `"nodenext"`. The old `"node"` setting (also called `node10`) does not read them. Set one of the three in your `tsconfig.json`.

## require() fails

The package is ES modules. Node 22.12 and later can `require` it; on an older Node 22, use `import` (or `await import(…)` in CommonJS). Node 20 and older are not supported.

## Does it work in Deno or Bun?

Probably, since it uses nothing but the language, but neither is tested. Reports are welcome as [issues](https://github.com/johnmorrisdotca/hikidashi/issues).

## Is the Japanese in the demo and these docs checked?

Not yet by a native speaker. The Japanese of these docs was checked for meaning and naturalness before it was published, and every Japanese page says it has not had a native reader. A wrong or awkward line can be reported with the [*Fix a translation* issue template](https://github.com/johnmorrisdotca/hikidashi/issues/new?template=fix-a-translation.md).
