---
title: ふりがな・元号の年・数を埋め込む
section: how-to
order: 7
description: カスタム要素またはiframeを使い、日本語の文字処理を記事やフォームに追加します。
---

[埋め込みのビルダー](https://johnmorrisdotca.github.io/hikidashi/builder.html)で、
ふりがな・元号の年・数から選び、ページで使える形式のコードをコピーします。
プレビューには、パッケージと同じ文字の分割・変換処理を使います。

## HTMLに追加する

ビルダーのDocsリンクは選んだ英語または日本語に従い、APIリンクは従来のエクスポート一覧を開きます。


定義のスクリプトを一度読み込み、使いたい要素を追加します。
ふりがなには、文字と読みを属性で渡します。表示にはHTMLのrubyとrtを使います。

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hikidashi@1/dist/element-define.js"></script>
<hikidashi-furigana text="日本語" reading="にほんご"></hikidashi-furigana>
<hikidashi-era value="2026" lang="ja"></hikidashi-era>
<hikidashi-numerals value="123" mode="write"></hikidashi-numerals>
```

## 表示と処理を選ぶ

属性は同じ名前のプロパティでも設定できます。sizeはsmall・medium・large、
widthはピクセルの幅です。themeはauto・light・dark、langはen・jaから選びます。
labelで読み上げる名前を付けられます。false・off・no・0はオフを表します。
元号のgannenは初期設定がオン、数のformalはオフです。
変換できない入力には状態を表示します。入力をHTMLとして挿入しません。
resultで変換結果を取得し、optionsでページ内のコールバックを設定できます。

カスタム要素のエントリにはdefineFurigana・defineEra・defineNumeralsがあり、
別のタグ名でも登録できます。サーバーで読み込んでも登録処理は動きません。
ビルダーにはReact・Vue・Svelte・Angular用の例もあります。

## iframeを使う

埋め込みページはembed/furigana/・embed/era/・embed/numerals/です。
ビルダーが設定を確認したURLと高さを示します。iframeはデータを保存しません。
読み込み・変更・エラーをJSONで通知します。通知には入力した文字や変換結果を入れません。受け取るページではevent.originが
GitHub Pagesの正しいオリジンか、event.sourceが自分のiframeかを確認してください。
設定リンクには入力した文字が入ります。共有するリンクに入れたくない文字は、
ページ内のプロパティで渡してください。
