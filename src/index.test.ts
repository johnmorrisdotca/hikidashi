import { describe, expect, it } from "vitest";

import * as everything from "./index.ts";
import * as align from "./align.ts";
import * as deinflect from "./deinflect.ts";
import * as difficulty from "./difficulty.ts";
import * as extract from "./extract.ts";
import * as numerals from "./numerals.ts";
import * as wareki from "./wareki.ts";

describe("the entries", () => {
  it("are all in the main one, which is exactly the six drawers and nothing else", () => {
    const drawers = { ...wareki, ...numerals, ...deinflect, ...align, ...extract, ...difficulty, VERSION: "1.0.0" };
    expect(Object.keys(everything).sort()).toEqual(Object.keys(drawers).sort());
  });

  it("keep no two drawers' names alike", () => {
    const names = [wareki, numerals, deinflect, align, extract, difficulty].flatMap((entry) => Object.keys(entry));
    const kana = ["hiraganaToKatakana", "katakanaToHiragana"];
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(expect.arrayContaining(kana));
  });

  it("work together: a pasted sentence, read through a dictionary, then aligned and scored", () => {
    const dictionary = new Map([["勉強する", [deinflect.WORD_CLASSES.suru]], ["日本語", []]]);
    const { words, kanji } = everything.extractFromText({ text: "日本語を勉強しています", known: dictionary });
    expect(words).toEqual(["日本語", "勉強する"]);
    const costs = new Map(kanji.map((one) => [one, 3]));
    expect(everything.sentenceDifficulty("日本語を勉強しています", costs)).toBe(11 + 9);
    expect(everything.segmentWord("勉強する", "べんきょうする")?.map((segment) => segment.reading)).toEqual(["べんきょう", "する"]);
  });
});
