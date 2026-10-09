---
title: フォームで元号の年を読む
section: how-to
order: 1
description: 人が入力するとおりの年を、和暦でも西暦でも受け付け、西暦の年として保存します。
---

生まれた年を尋ねる入力フォームがあるとします。1985 と入力する人もいれば、昭和60年、「Showa 60」、あるいは元号をリストから選んで ６０ と入力する人もいます。この手順では、そのどれを受け取っても、西暦の年という一つの数にまとめ、表示し直すための元号の年も添えます。

## 入力されたものをそのまま受け取る

まず元号の年として読み、読めなければ普通の数として読みます。どの段階も、当てはまらなければ `null` を返すので、この順番がそのまま処理のすべてです。

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
console.log(readYear("Showa 60"));    // 同じ
console.log(readYear("１９８５"));     // 全角数字からでも同じ
console.log(readYear("昭和65年"));    // null：そのような年はなかった
```

普通の数として読むときの範囲（1868〜2100）は、このフォームの決まりで、パッケージの決まりではありません。Hikidashi はどんな整数でも読み取ります。

## 元号をリストから選ぶ場合

元号を `<select>` で、年を入力欄で受け取るときは、`JAPANESE_ERAS` から元号を探して `westernYearFor` に渡します。その元号に存在しなかった年には `null` が返るので、それを入力欄の横に表示するエラーにします。

```ts
import { JAPANESE_ERAS, westernYearFor } from "@johnmorrisdotca/hikidashi/wareki";

const options = JAPANESE_ERAS.map((era) => ({ value: era.romaji, label: `${era.kanji}（${era.romaji}）` }));
console.log(options.map((option) => option.label).join("、"));

const picked = JAPANESE_ERAS.find((era) => era.romaji === "Heisei")!;
console.log(westernYearFor(picked, 31), westernYearFor(picked, 32));    // 2019 null
```

## 年ではなく日付の場合

改元のあった年は二つの元号にまたがるので、年だけでは、1989年のある日がどちらの元号かは分かりません。フォームに日付まであるときは `eraOnDate` を使います。

```ts
import { eraOnDate, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi/wareki";

for (const day of ["1989-01-07", "1989-01-08", "2019-04-30", "2019-05-01"]) {
  const found = eraOnDate(day);
  console.log(day, found === null ? "日付ではない" : formatEraYearJapanese(found, { gannen: true }));
}
```

`Date` も渡せます。その場合は、`Date` がそれ自身のタイムゾーン（利用者が選んだタイムゾーン）で示す日付として読みます。1868年10月23日より前の日付は `null` です。このパッケージの元号は明治から始まります。

## 表示し直す

元号の年を、日本の書類と同じように最初の年を元年として書き、西暦も添えます。

```ts
import { eraYearsOf, formatEraYearJapanese, formatEraYearRomaji } from "@johnmorrisdotca/hikidashi/wareki";

const both = eraYearsOf(2019);
console.log(both.map((one) => `${formatEraYearJapanese(one, { gannen: true })}（${formatEraYearRomaji(one)}）`).join(" / "), "= 2019");
```

関連項目：答えが二つある年については [`eraYearsOf`](api:eraYearsOf)、一つの年が二つの元号にまたがる理由については[元号の年の仕組み](how-it-works.md#元号の年)を見てください。
