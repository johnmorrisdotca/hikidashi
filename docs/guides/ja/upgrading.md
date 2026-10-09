---
title: アップグレードと、ほかのライブラリーからの移行
section: upgrading
order: 1
description: バージョンの間で変わること、そして Intl の和暦、wanakana、kuromoji との比較。
---

## バージョンの間のアップグレード

Hikidashi は[セマンティック バージョニング](https://semver.org/lang/ja/)に従っています。これまでのリリースはすべて 1.x なので、移行の作業はありません。どの 1.x のリリースも、ほかの 1.x と置き換えられます。

**2.0 になる変更。** 関数の名前、引数、返す値の形の変更。これまで値を返していた入力に `null` を返すようになる変更と、その逆。受け付けない入力の変更。エントリーポイントの削除。こうした変更が必要になったら、このページに節を設け、変更点と、代わりに書くコードを一つずつ載せます。

**2.0 にならない変更。** 新しい関数やエントリーポイントの追加、これまで受け付けなかった入力を正しく読めるようにすること（新しい元号、新しい活用）、間違っていた答えの修正。すべてのリリースは[変更履歴](../../../CHANGELOG.md)にあります。

最新の 1.x を入れるには：

```sh
npm install @johnmorrisdotca/hikidashi@1
```

## Intl.DateTimeFormat の和暦から移る場合

JavaScript でも、元号の年を*書く*ことはすでにできます。和暦を指定した `Intl.DateTimeFormat` で `Date` を整形します。

```ts
import { eraOnDate, formatEraYearJapanese } from "@johnmorrisdotca/hikidashi/wareki";

const day = new Date(2019, 4, 1);
console.log(new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { era: "long", year: "numeric" }).format(day));    // 令和元年
console.log(formatEraYearJapanese(eraOnDate(day)!, { gannen: true }));                                       // 令和元年
```

Hikidashi が加えるのは、逆向きの変換と、日付のない年の扱いです。`parseEraYear` は「令和6年」や「Heisei 3」を西暦の年に変えますが、`Intl` にはこれができません。`eraYearsOf` は日付のない年に答え、改元の年には両方の元号を返します。そして答えは文字列ではなく、元号、その中の年、読み、日付を持ったデータです。また `Intl` は明治より前にもさかのぼります（Node 24 では1850年は嘉永3年）が、Hikidashi はさかのぼりません。分かっている日付を整形するだけなら、`Intl` で足ります。

## wanakana から移る場合

[wanakana](https://www.npmjs.com/package/wanakana) は、ひらがな、カタカナ、ローマ字を互いに変換し、かなと漢字を見分けます。Hikidashi の `hiraganaToKatakana` と `katakanaToHiragana` がするのはそのうち最初の部分だけで、一文字ずつの変換です。読みの割り当てに必要だったのはそれだけで、表を持たない数行の関数です。ローマ字、IME のような入力、漢字かどうかの判定が必要なら wanakana を使い続けてください。二つは並べて使えます。

## kuromoji などの形態素解析器から移る場合

[kuromoji](https://github.com/takuyaa/kuromoji.js) やその仲間は、一緒にダウンロードする辞書（Hikidashi の引き出しが数キロバイトなのに対して、メガバイト単位）を使って文を単語に分け、それぞれの辞書形、品詞、読みを返します。文中のすべての単語に情報を付けたいなら、そちらが適しています。

Hikidashi は、すでにデータベースに辞書があって、大きなダウンロードを増やしたくない場合のための小さな道具です。`dictionaryForms` は活用した一語をその候補に戻し、`extractFromText` は手元の辞書が認めた単語を見つけます。助詞に品詞を付けたり、単語の読みを返したり、辞書にない部分を単語に分けたりはしません。貼り付けた文を自分の単語リストと照らし合わせるだけの学習ツールなら Hikidashi で足り、すべての単語に注釈を付ける読書支援ツールには形態素解析器が必要です。
