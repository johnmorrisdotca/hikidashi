---
title: Why it is built this way
section: explanation
order: 2
description: The choices behind Hikidashi: no data of its own, a refusal rather than a guess, pure functions, one entry point per drawer.
---

Hikidashi was taken out of UmaKuma, a Japanese study app by the same author, where each of these functions had been written, tested and kept. This page explains the choices they share, because they decide what you can expect from every function in the package.

## No data of its own

Every drawer that needs knowledge takes it as an argument: `extractFromText` takes your dictionary as `known`, `wordClassesOf` your dictionary's parts of speech, `kanjiCost` your grade and frequency data, `kanjiAsWord` your readings. The package ships no dictionary, word list or grade table.

A dictionary is large, is updated every month, and has a licence of its own (JMdict and KANJIDIC2 are under Creative Commons Attribution-ShareAlike). Shipping one would make the package megabytes instead of kilobytes, put its licence on everybody who installs it, and make it out of date the week after a release. Your app already has a dictionary, and it is the one your users see, so it is the one the answers should agree with.

The one exception is the five eras in `JAPANESE_ERAS`, which change once a reign.

## A refusal rather than a guess

When a function cannot answer, it says so with `null` or an empty list. It never returns a value that looks right and is not. 昭和65年 is `null`, not 1990; 一二三 is `null`, not 123; a reading that does not fit its word is `null`, not a segmentation that a test would then mark right.

The reason is what happens next. A `null` is noticed: the page shows "not a year", the test leaves the word out, the form asks again. A plausible wrong number is not noticed, and ends up stored, printed and taught. Every `@returns` in the [reference](entry:main) says what its `null` means.

## Proposals, confirmed by the caller

`dictionaryForms` is the clearest case. Japanese conjugation is ambiguous without a dictionary: 食べる is the dictionary form of 食べる and also the potential form of a verb 食ぶ, which does not exist. Rather than pretend to know, the function lists every possibility, likeliest first, each with the kind of word it would have to be, and the caller keeps the ones its dictionary confirms. The same split runs through `/extract`: Hikidashi finds what could be a word, your dictionary says what is one.

## Pure functions

Every function takes values and returns new values. None keeps state between calls, changes its arguments, reads the clock, touches the DOM, the network or the file system. That is why the package runs the same in a browser, on a server and in a test, why `buildKanjiTest` takes a seed instead of calling `Math.random`, and why each example in this documentation shows the exact output it printed when the page was built.

## One entry point per drawer

The drawers share almost nothing (the two kana converters, and `/extract` uses `/deinflect`), so each is an entry point of its own: `@johnmorrisdotca/hikidashi/wareki` and the rest. A page that converts era years loads the era code and nothing else; the package's `sideEffects: false` lets a bundler drop the rest even from the main entry. The [overview](entry:main) lists each entry point's size, minified and gzipped.

## Bounded work

Text pasted into a page is the one input that can be any size, so every function that reads it has a cap: `EXTRACT_LIMITS` and `ALIGN_LIMITS`, and five endings for a conjugation chain. A long or hostile input costs a bounded amount of time, and a result that was cut says so (`stats.truncated`). See the [security policy](../../SECURITY.md) for reporting an input that takes too long.
