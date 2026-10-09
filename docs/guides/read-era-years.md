---
title: Read era years on a form
section: how-to
order: 1
description: Accept a year the way people write it on a Japanese form, in either calendar, and store the Western year.
---

A form asks for a year of birth. Some people type 1985, some 昭和60年, some "Showa 60", some ６０ with the era picked from a list. This recipe takes any of them and keeps one number, the Western year, with the era year beside it for showing back.

## Take whatever was typed

Try the text as an era year first, then as a plain number. Each step answers `null` when it does not apply, so the order is the whole of the logic.

```ts
import { eraYearOf, formatEraYearJapanese, parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";
import { parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

function readYear(typed: string): { western: number; shown: string } | null {
  const era = parseEraYear(typed);
  if (era !== null) return { western: era.westernYear, shown: formatEraYearJapanese(era) };
  const western = parseJapaneseNumber(typed);
  if (western === null || western < 1868 || western > 2100) return null;
  const asEra = eraYearOf(western);
  return { western, shown: asEra === null ? String(western) : formatEraYearJapanese(asEra) };
}

console.log(readYear("昭和60年"));    // { western: 1985, shown: "昭和60年" }
console.log(readYear("Showa 60"));    // the same
console.log(readYear("１９８５"));     // the same, from full-width digits
console.log(readYear("昭和65年"));    // null: there was no such year
```

The bounds on the plain number (1868 to 2100) are the form's own rule, not the package's: Hikidashi reads any whole number.

## An era picked from a list

When the era is a `<select>` and the year a box, find the era in `JAPANESE_ERAS` and ask `westernYearFor`. It answers `null` for a year the era never reached, which is the error to show beside the box.

```ts
import { JAPANESE_ERAS, westernYearFor } from "@johnmorrisdotca/hikidashi/wareki";

const options = JAPANESE_ERAS.map((era) => ({ value: era.romaji, label: `${era.kanji} (${era.romaji})` }));
console.log(options.map((option) => option.label).join(", "));

const picked = JAPANESE_ERAS.find((era) => era.romaji === "Heisei")!;
console.log(westernYearFor(picked, 31), westernYearFor(picked, 32));    // 2019 null
```

## A date, not a year

Two eras share every changeover year, so a year alone cannot say which one a day of 1989 belongs to. When the form has a whole date, use `eraOnDate`:

```ts
import { eraOnDate, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi/wareki";

for (const day of ["1989-01-07", "1989-01-08", "2019-04-30", "2019-05-01"]) {
  const found = eraOnDate(day);
  console.log(day, found === null ? "not a day" : formatEraYearJapanese(found, { gannen: true }));
}
```

A `Date` works too, and is read as the day it shows in its own time zone, the one the person picked. A date before 23 October 1868 is `null`: the package's eras start with 明治.

## Show it back

Write the era year the way a Japanese form does, with 元年 for a first year, and the Western year beside it:

```ts
import { eraYearsOf, formatEraYearJapanese, formatEraYearRomaji } from "@johnmorrisdotca/hikidashi/wareki";

const both = eraYearsOf(2019);
console.log(both.map((one) => `${formatEraYearJapanese(one, { gannen: true })} (${formatEraYearRomaji(one)})`).join(" / "), "= 2019");
```

See also: [`eraYearsOf`](api:eraYearsOf) for the years with two answers, and [why a year can belong to two eras](how-it-works.md#era-years).
