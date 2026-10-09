---
title: How each drawer works
section: explanation
order: 1
description: The rules behind each drawer's answers, and the cases each one refuses.
---

This page explains what each drawer does with its input and why it answers the way it does. It is the "how it works" half of what used to be the README's section on the drawers; the README keeps a summary and the examples. Each section ends with the cases the drawer refuses, since a refusal (`null` or an empty list) is part of every answer.

## Era years

The drawer is `/wareki`, from 和暦 (*wareki*, the Japanese calendar).

| Era | Reading | First day | Last day | Years |
| --- | --- | --- | --- | --- |
| 明治 Meiji | めいじ | 1868-10-23 | 1912-07-29 | 1 to 45 |
| 大正 Taisho | たいしょう | 1912-07-30 | 1926-12-24 | 1 to 15 |
| 昭和 Showa | しょうわ | 1926-12-25 | 1989-01-07 | 1 to 64 |
| 平成 Heisei | へいせい | 1989-01-08 | 2019-04-30 | 1 to 31 |
| 令和 Reiwa | れいわ | 2019-05-01 | still running | 1 to 99 |

An era changes partway through a Western year, so the years 1912, 1926, 1989 and 2019 each begin one era and end another. `eraYearsOf` answers with both, newest first; `eraYearOf` gives the newest, which is how the year is usually written; `eraOnDate` says which a day is in, from `YYYY-MM-DD` or a `Date`.

Era years restart from 元年 (*gannen*, "first year") on the first of January, as years are counted today. 明治 is dated from 23 October 1868, when the name was proclaimed, and its years are counted as if it began with 1868. All dates are in the Gregorian calendar.

`parseEraYear` reads kanji or Latin names, in any romanization (Showa, Shouwa, Shōwa), with half-width or full-width digits, with or without 年, and 元 for 1.

**Refused:** a year an era never reached (昭和65), a day that is not on the calendar, anything before 明治, and a year of the running era past 99, which is a typing slip rather than a date.

## Kanji numerals

The drawer is `/numerals`, for 漢数字 (*kansūji*).

Japanese counts in ten-thousands (万, 億, 兆, each 10,000 times the last), which is why 120 million is 一億二千万, "twelve thousand ten-thousands". The reader takes kanji, digits (half-width or full-width) and any mixture, a thousands comma, the formal numerals 壱 弐 参 拾 and the old 萬. The writer drops the one where the language does (十, not 一十) and keeps it where it does not (一万). With `formal`, it writes the characters a contract uses so a stroke cannot be added: 壱 for 一, 弐 for 二, 参 for 三, 拾 for 十.

`readJapaneseNumber` says the number in hiragana with its sound changes: 三百 is さんびゃく, 六百 ろっぴゃく, 八千 はっせん, 一兆 いっちょう. `parseEnglishNumber` reads English number words and the Japanese magnitudes in romaji (`5 man`), because a learner types those long before they can type 5万.

**Refused:** units out of order (万億), kanji digits side by side (一二三; but 〇 is read as a place, so 二〇 is 20), a bare 万, a minus sign, a decimal point, and anything past 9,007,199,254,740,991, where JavaScript stops counting exactly. The answer is `null`, never a number a digit out.

## Dictionary forms

The drawer is `/deinflect`, for 活用 (*katsuyō*, conjugation).

A sentence writes 行きます where a dictionary lists 行く. `dictionaryForms` walks a written form back through its endings, one at a time, up to five deep, and answers with every dictionary form it could be a conjugation of, each with the kind of word it would have to be (`godan`, `ichidan`, `iAdjective`, `suru`, `kuru`).

It *proposes*. 食べる is also the potential form of a verb 食ぶ, which does not exist, so the caller keeps only the answers its own dictionary confirms are that kind of word. `wordClassesOf` is for that: it reads plain labels such as `"godan verb"` and JMdict's tags such as `v5k`. The answers come likeliest first: the reading that explains more of the written ending leads, so 食べました is 食べる (ました) before it is 食べます (した).

There is deliberately no rule that reads a bare stem as its verb: 東京行き is a noun, and 行き is a verb only when an ending follows it.

**Covered:** the polite, negative, past, te, conditional, volitional, passive, causative and potential forms and chains of them (食べさせられませんでした), the "wanting" form (行きたい), する and 来る, and 来る written in kana after kana (持ってきた).

**Not covered:** the imperative, keigo verbs, and な adjectives, which do not conjugate onto themselves.

## Reading alignment

The drawer is `/align`, for 読みの割り当て, sharing a reading out.

A Japanese school's かん字テスト shows a reading beside empty squares and asks for the kanji, and the okurigana that end the word are written in brackets under them. The kana in a word are anchors in its reading, which is what lets the rest be shared out over the kanji: 形が合う read かたちがあう is 形 (かたち), が, 合 (あ), う. A compound of several kanji (絵日記, えにっき) is one segment, since a reading cannot be split between kanji without a dictionary. The reading may be in katakana.

The search tries the shortest share a kanji can take first and remembers every dead end, so a word of repeated kana that no reading fits is refused at once rather than searched for long. `buildKanjiTest` shuffles with a seeded generator (mulberry32), so the test on paper is the test on screen.

**Refused:** a reading that does not fit the word, a word with no kanji, a reading with a space or control character, and a word over 64 characters or a reading over 256.

## Pasted text

The drawer is `/extract`, for 抽出 (*chūshutsu*, extraction).

Somebody pastes a page of a book, a handout or a chat message and wants the words and kanji out of it. Two things follow from "somebody pastes anything".

The first is safety. The text is never stored and never trusted for its length: it is cut to `EXTRACT_LIMITS.characters` (20,000), control and invisible characters are turned into spaces, and what comes back is not the text but the words your dictionary recognised and single kanji.

The second is the reading. The runs of Japanese are found, and the words in them are matched longest first against `known`, the `Map` you pass from each word to the kinds of word it is. A conjugated verb or adjective (行きます, 高くて) is returned as the dictionary form `known` lists. At the same length the word as written wins, so 東京行き keeps the noun 行き, unless an ending only a verb's stem takes follows it, as ます follows 行き in 行きます. Every kanji is taken whether or not it belongs to a word. 々 and 〇 are not counted as kanji.

`wordCandidates` lists every substring a dictionary might know, and the dictionary forms of conjugated ones, capped at 4,000, so a page asks its database once about a whole paste.

## Sentence difficulty

The drawer is `/difficulty`, for 難しさ (*muzukashisa*).

Two things make a sentence hard: how long it is, and the hardest character in it. The score is its length plus three times its hardest kanji's cost, so a kana-only sentence scores its length and sorts first, and one kanji the reader cannot read stops them as surely as ten.

`kanjiCost` turns what you hold about a kanji into a cost: grades 1 to 6 cost their own number, grade 8 (the rest of the jōyō kanji) costs 9, name kanji (grades 9 and 10) cost 14, an ungraded kanji costs by its frequency rank from 10 to 18, and a kanji you know nothing about costs 20 (`UNKNOWN_KANJI_COST`). The grades and ranks are in KANJIDIC2 and other kanji tables; none is shipped here.
