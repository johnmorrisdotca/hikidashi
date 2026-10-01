# Hikidashi's demo words, in English and Japanese

Made from `demo/words.js` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown.

| Name | English | Japanese |
| --- | --- | --- |
| `pageApi` | API reference | API（英語） |
| `pitch` | A drawer of small Japanese text tools: era dates, kanji numerals, the dictionary forms of a verb, a reading shared out over its kanji, words pulled from pasted text, and how hard a sentence is. Type in any panel and the answer appears. Each one is the package's own function. | 日本語の小さな道具を入れた引き出しです：元号の年、漢数字、動詞の辞書形、漢字への読みの割り当て、貼り付けた文章からの単語拾い、文の難しさ。どのパネルでも、入力するとすぐ答えが出ます。どれもパッケージ自身の関数です。 |
| `name` | Hikidashi (引き出し) is Japanese for “drawer”, and 引き出しが多い, “many drawers”, is said of someone with a deep store to draw on. | 「引き出し」はタンスや机のひきだしのこと。「引き出しが多い」は、知識や経験を豊富にたくわえている人のことをいいます。 |
| `nameLink` | About the name | 名前について（英語） |
| `input` | Type | 入力 |
| `examples` | Try | 例 |
| `call` | The call | 呼び出し |
| `moreTitle` | Using it | 使い方 |
| `moreText` | Each panel above is the package itself. Every drawer is an entry of its own, so a page imports only the one it needs. Each line below is all it takes. | 上の各パネルは、このパッケージそのものです。引き出しごとに入口が別なので、必要なものだけを読み込めます。下の各行がそれぞれ必要なコードのすべてです。 |
| `foot` | Everything is worked out in your browser by the package's own code. Nothing leaves this page. | すべて、パッケージ自身のコードがあなたのブラウザーで計算します。このページの外には何も送られません。 |
| `wareki_title` | Era years | 元号の年 |
| `wareki_blurb` | Type an era year (令和6年, Heisei 3, 昭和元年), a Western year (1989) or a date (2019-05-01). The five modern eras, 明治 to 令和, are covered. | 元号の年（令和6年、Heisei 3、昭和元年）、西暦（1989）、日付（2019-05-01）のどれかを入力します。対象は明治から令和までの五つです。 |
| `wareki_year` | Western year | 西暦 |
| `wareki_era` | Era year | 和暦 |
| `wareki_reading` | Reading | 読み |
| `wareki_began` | Era began | 元号の始まり |
| `wareki_ended` | Era ended | 元号の終わり |
| `wareki_still` | still running | いまも続いています |
| `wareki_day` | On that day | その日は |
| `wareki_both` | A changeover year: both are right. | 改元の年なので、どちらも正しいです。 |
| `wareki_none` | Not a date in 明治 to 令和. Try 令和6年, Heisei 3, 1989 or 2019-05-01. | 明治から令和までの日付ではありません。令和6年、Heisei 3、1989、2019-05-01 などを試してください。 |
| `numerals_title` | Kanji numerals | 漢数字 |
| `numerals_blurb` | Type a number as 一億二千万, 1億2000万, 2万5千, 120000000, or in English words (five hundred, 5 man). It is read, then written back in kanji, in formal kanji, and said aloud. | 一億二千万、1億2000万、2万5千、120000000、または英語（five hundred、5 man）で数を入力します。読み取った数を、漢数字、大字（だいじ）、読み方で表します。 |
| `numerals_value` | Value | 数値 |
| `numerals_kanji` | Kanji | 漢数字 |
| `numerals_formal` | Formal (大字) | 大字（壱弐参） |
| `numerals_said` | Said | 読み方 |
| `numerals_none` | Not a whole number this can read, up to 9,007,199,254,740,991. Try 2万5千 or one hundred and twenty. | 9,007,199,254,740,991 までの整数として読めません。2万5千 や one hundred and twenty を試してください。 |
| `deinflect_title` | Dictionary forms | 辞書形 |
| `deinflect_blurb` | Type a conjugated verb or adjective. Every dictionary form it could come from is listed, likeliest first, with the kind of word it would have to be. Your own dictionary then says which one is real. | 活用した動詞か形容詞を入力します。もとになりうる辞書形を、可能性の高い順に、その語の種類とともに並べます。どれが本物かは、手元の辞書で確かめます。 |
| `deinflect_none` | Nothing: this is already a dictionary form, or it does not end like a conjugated verb or adjective. | 該当なし：すでに辞書形か、活用した動詞・形容詞の形ではありません。 |
| `kinds.godan` | godan verb | 五段動詞 |
| `kinds.ichidan` | ichidan verb | 一段動詞 |
| `kinds.iAdjective` | i-adjective | い形容詞 |
| `kinds.suru` | する verb | する動詞 |
| `kinds.kuru` | 来る verb | 来る動詞 |
| `align_title` | Reading alignment | 読みの割り当て |
| `align_blurb` | Give a word and its reading. The reading is shared out over the kanji, as in a かん字テスト: each kanji with its part of the reading, the kana as written, and the okurigana that end the word. | 単語とその読みを入力します。かん字テストのように、読みを漢字に割り当てます：漢字ごとの読み、そのまま書くかな、語の終わりの送りがなに分けます。 |
| `align_word` | Word | 単語 |
| `align_reading` | Reading | 読み |
| `align_none` | The reading does not fit this word, so a test would leave it out. | この単語に読みが合いません。テストではこの単語は除かれます。 |
| `segment.kanji` | kanji | 漢字 |
| `segment.kana` | kana | かな |
| `segment.okurigana` | okurigana | 送りがな |
| `extract_title` | Pasted text | 貼り付けた文章 |
| `extract_blurb` | Paste some Japanese. The words your dictionary knows come out in dictionary form, then every kanji. The dictionary here is a short list typed in for the demo. | 日本語を貼り付けます。手元の辞書にある単語を辞書形で、続いてすべての漢字を取り出します。ここで使う辞書は、デモ用に書き込んだ短い一覧です。 |
| `extract_words` | Words | 単語 |
| `extract_kanji` | Kanji | 漢字 |
| `extract_none` | Nothing found | 見つかりません |
| `extract_stats` | Characters {characters}, words {words}, kanji {kanji}{cut} | {characters}文字、単語{words}、漢字{kanji}{cut} |
| `extract_cut` | , cut at the limit | 、上限で切りました |
| `extract_dictionary` | The demo's dictionary | デモの辞書 |
| `difficulty_title` | Sentence difficulty | 文の難しさ |
| `difficulty_blurb` | Type a sentence. Its score is its length plus three times its hardest kanji, so the easiest sentences sort first. The grades are a short table typed in for the demo; any other kanji counts as unknown, the hardest kind. | 文を入力します。点数は、文の長さに、いちばん難しい漢字の三倍を足したものです。やさしい文ほど先に並びます。学年はデモ用に書き込んだ短い表で、ほかの漢字は不明（いちばん難しい扱い）です。 |
| `difficulty_score` | Score | 点数 |
| `difficulty_length` | Length | 長さ |
| `difficulty_hardest` | Hardest kanji | いちばん難しい漢字 |
| `difficulty_unknown` | unknown | 不明 |
| `difficulty_none` | No kanji: only its length counts. | 漢字なし：長さだけで決まります。 |
| `difficulty_cost` | cost {cost} | 難しさ{cost} |
