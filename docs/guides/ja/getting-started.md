---
title: はじめに
section: tutorial
order: 1
description: Hikidashi をインストールし、六つの引き出しの関数を一つずつ呼び、答えられないときに何が返るかを確かめます。
---

このチュートリアルは10分ほどで終わります。最後まで進むと、Hikidashi の六つの引き出しから関数を一つずつ呼び、必要な引き出しだけをインポートし、どの関数も推測せずに「答えられない」と伝えることを確かめられます。必要なのは Node 22 以降か、2020年以降のブラウザーだけです。

## インストールする

```sh
npm install @johnmorrisdotca/hikidashi
```

依存パッケージはなく、型定義も含まれています。このページの例はどれも一つのファイルとして完結しています。`try.ts`（型を除けば `try.mjs`）として保存し、`node try.ts` で実行できます。

## 元号の年を読む

日本の書類や硬貨、出生証明書では、年を元号で書きます。令和6年は令和の6年目です。`parseEraYear` はこれを読み取り、西暦の年も一緒に返します。

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

const year = parseEraYear("令和6年");
console.log(year?.westernYear);    // 2024
console.log(year?.era.romaji);     // "Reiwa"
```

元号は漢字でもローマ字でも、数字は全角でも読み取れます。最初の年は「元年」とも書けます。

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

console.log(parseEraYear("Heisei 3")?.westernYear);    // 1991
console.log(parseEraYear("昭和元年")?.westernYear);     // 1926
```

## 答えられない場合を見る

その元号に存在しなかった年を渡してみます。昭和は64年で終わったので、昭和65年はありません。

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi";

console.log(parseEraYear("昭和65年"));    // null
```

`null` も答えの一つで、「これは元号の年ではない」という意味です。Hikidashi は、答えられない問いを、もっともらしい数に変えることはしません。昭和65年を計算すれば1990年になりますが、1990年は平成2年です。このパッケージの関数はどれも同じ考え方で作られているので、呼び出しのすぐ後には、答えが `null` のときにページに何を表示するかを書いておきましょう。

## 逆向きに変換する

`eraYearsOf` は西暦の年を元号の年に変えます。途中で元号が変わった年には答えが二つあります。1989年は1月7日までが昭和64年、8日からが平成元年でした。日付が分かっているときは、`eraOnDate` がその日の元号の年を返します。

```ts
import { eraOnDate, eraYearsOf, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi";

console.log(eraYearsOf(1989).map((one) => formatEraYearJapanese(one)));    // ["平成1年", "昭和64年"]
console.log(formatEraYearJapanese(eraOnDate("1989-01-07")!));              // "昭和64年"
```

## 漢数字を読み書きする

日本語では、数を四桁ごとに区切って万、億、兆と数えます。見出しでは「1億2000万」、教科書では「一億二千万」と書きますが、どちらも 120,000,000 です。

```ts
import { parseJapaneseNumber, readJapaneseNumber, writeJapaneseNumber } from "@johnmorrisdotca/hikidashi";

console.log(parseJapaneseNumber("1億2000万"));    // 120000000
console.log(writeJapaneseNumber(25_000));         // "二万五千"
console.log(readJapaneseNumber(800));             // "はっぴゃく"（声に出して読んだ形）
```

## 動詞の辞書形を探す

文の中では「食べませんでした」と書かれていても、辞書には「食べる」で載っています。`dictionaryForms` は語尾を一つずつさかのぼり、書かれた語のもとになりうる辞書形を、可能性の高い順にすべて挙げます。

```ts
import { dictionaryForms } from "@johnmorrisdotca/hikidashi";

console.log(dictionaryForms("食べませんでした")[0]);    // { base: "食べる", wordClass: "ichidan" }
```

挙げるだけで、決めはしません。「食べませんでした」の二つ目の候補は、実在しない動詞「食ぶ」です。どれが本当の単語かは、手元の辞書で確かめます。その方法は[貼り付けた文から単語を取り出すやり方](extract-words-from-a-paste.md)で説明しています。

## 読みを漢字に割り当てる

学校のかん字テストでは、空いたマスの横に読みを示し、語の終わりのかな（送り仮名）はかっこの中に入れます。`segmentWord` は、語とその読みをこの形に分けます。

```ts
import { segmentWord } from "@johnmorrisdotca/hikidashi";

for (const part of segmentWord("食べる", "たべる") ?? []) console.log(part.text, part.reading, part.kind);
// 食 た kanji
// べる べる okurigana
```

## 貼り付けた文から単語を取り出す

`extractFromText` は、貼り付けられた文を長さに関係なく読み、手元の辞書にある単語を辞書形で、そして文中のすべての漢字を返します。Hikidashi 自身は辞書を持たないので、辞書は `Map` として渡します。

```ts
import { extractFromText } from "@johnmorrisdotca/hikidashi";

const known = new Map([["先生", []], ["学校", []], ["行く", ["godan" as const]]]);
const found = extractFromText({ text: "先生と学校へ行きます。", known });
console.log(found.words);    // ["先生", "学校", "行く"]
console.log(found.kanji);    // ["先", "生", "学", "校", "行"]
```

## 文に点数をつける

`sentenceDifficulty` は、文の長さといちばん難しい漢字から点数を出します。こうすれば、いちばんやさしい例文を最初に表示できます。漢字ごとのコストは自分で渡します。`kanjiCost` は、学年や使用頻度の順位からコストを作ります。

```ts
import { kanjiCost, sentenceDifficulty } from "@johnmorrisdotca/hikidashi";

const costs = new Map([["水", kanjiCost({ grade: 1, frequencyRank: 223 })]]);
console.log(sentenceDifficulty("水を飲む。", costs));    // 5文字 + 3 × 20（「飲」はコストの表にない）= 65
```

## 必要な引き出しだけをインポートする

ここまでの関数はすべて、パッケージのメインのエントリーポイントから読み込みました。引き出しはそれぞれ独立したエントリーポイントでもあるので、元号の年だけを使うページには、そのコードだけが入ります。

```ts
import { parseEraYear } from "@johnmorrisdotca/hikidashi/wareki";

console.log(parseEraYear("平成31年")?.westernYear);    // 2019
```

エントリーポイントは `/wareki`（元号の年）、`/numerals`（漢数字）、`/deinflect`（辞書形）、`/align`（読み）、`/extract`（貼り付けた文）、`/difficulty`（難しさ）の六つです。[`/wareki`](entry:wareki) をはじめ、リファレンスの各ページに、すべての関数とその例が載っています。

## 次に読むもの

- やり方のガイドは、実際の作業の手順です。[フォームで元号の年を読む](read-era-years.md)、[手元の辞書で貼り付けた文から単語を取り出す](extract-words-from-a-paste.md)、[かん字テストを作る](make-a-kanji-test.md)、[例文をやさしい順に並べる](sort-sentences-by-difficulty.md)、[金額を漢数字で書く](write-numbers-in-kanji.md)。
- [それぞれの引き出しの仕組み](how-it-works.md)では答えの背後にある決まりを、[この作りにした理由](design.md)ではパッケージの設計の考え方を説明しています。
- [困ったとき・よくある質問](troubleshooting.md)には、最初によく出る質問への答えがあります。そのほとんどは `null` についてです。
