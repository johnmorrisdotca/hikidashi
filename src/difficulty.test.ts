import { describe, expect, it } from "vitest";

import { UNKNOWN_KANJI_COST, kanjiCost, kanjiIn, sentenceDifficulty } from "./difficulty.ts";

describe("kanjiCost", () => {
  it("costs an elementary grade its own year", () => {
    expect(kanjiCost({ grade: 1, frequencyRank: 223 })).toBe(1);
    expect(kanjiCost({ grade: 6, frequencyRank: 900 })).toBe(6);
  });

  it("puts the rest of jōyō above elementary and name kanji above that", () => {
    expect(kanjiCost({ grade: 8, frequencyRank: null })).toBeGreaterThan(
      kanjiCost({ grade: 6, frequencyRank: null }),
    );
    expect(kanjiCost({ grade: 9, frequencyRank: null })).toBeGreaterThan(
      kanjiCost({ grade: 8, frequencyRank: null }),
    );
  });

  it("falls back to how common an ungraded character is", () => {
    const common = kanjiCost({ grade: null, frequencyRank: 400 });
    const rarer = kanjiCost({ grade: null, frequencyRank: 2400 });
    expect(common).toBeLessThan(rarer);
  });

  it("treats a character it knows nothing about as the hardest kind", () => {
    expect(kanjiCost(null)).toBe(20);
    expect(kanjiCost({ grade: null, frequencyRank: null })).toBe(20);
  });
});

describe("kanjiIn", () => {
  it("lists each kanji once, ignoring kana and punctuation", () => {
    expect(kanjiIn("水を飲む。水がある")).toEqual(["水", "飲"]);
  });

  it("finds nothing in a kana-only sentence", () => {
    expect(kanjiIn("ありがとうございます。")).toEqual([]);
  });
});

describe("sentenceDifficulty", () => {
  const costs = new Map([
    ["水", 1],
    ["飲", 3],
    ["鬱", 9],
  ]);

  it("puts a short kana sentence above everything", () => {
    const kana = sentenceDifficulty("みずをのむ。", costs);
    const kanji = sentenceDifficulty("水を飲む。", costs);
    expect(kana).toBeLessThan(kanji);
  });

  it("prefers the shorter of two sentences made of the same characters", () => {
    expect(sentenceDifficulty("水を飲む。", costs)).toBeLessThan(
      sentenceDifficulty("私は毎朝水を飲むことにしている。", costs),
    );
  });

  /*
   * One unknown character stops a learner as surely as ten do, so the hardest
   * kanji drives the score rather than the average.
   */
  it("is dominated by its hardest character, not its easiest", () => {
    const easy = sentenceDifficulty("水を飲む。", costs);
    const hard = sentenceDifficulty("水を鬱む。", costs);
    expect(hard).toBeGreaterThan(easy);
  });

  it("treats a character the dictionary is missing as the hardest kind", () => {
    const known = sentenceDifficulty("水。", costs);
    const unknown = sentenceDifficulty("鰐。", costs);
    expect(unknown).toBeGreaterThan(known);
  });
});

describe("the edges", () => {
  it("costs nothing but its length for an empty sentence", () => {
    expect(sentenceDifficulty("", new Map())).toBe(0);
    expect(kanjiIn("")).toEqual([]);
  });

  it("costs the most for an unknown kanji, and says what that is", () => {
    expect(UNKNOWN_KANJI_COST).toBe(20);
    expect(sentenceDifficulty("鰐", new Map())).toBe(1 + 20 * 3);
  });

  it("puts name kanji above the rest of jōyō, and a grade of 10 with them", () => {
    expect(kanjiCost({ grade: 10, frequencyRank: null })).toBe(kanjiCost({ grade: 9, frequencyRank: null }));
  });

  it("falls back to frequency for an ungraded kanji, but never above 18", () => {
    expect(kanjiCost({ grade: null, frequencyRank: 1 })).toBe(10);
    expect(kanjiCost({ grade: null, frequencyRank: 100_000 })).toBe(18);
  });

  it("counts a kanji in the rarer planes of the first block, and not 々", () => {
    expect(kanjiIn("人々㐀")).toEqual(["人", "㐀"]);
  });

  it("refuses what is not text", () => {
    expect(kanjiIn(undefined as unknown as string)).toEqual([]);
    expect(sentenceDifficulty(null as unknown as string, new Map())).toBe(0);
  });
});
