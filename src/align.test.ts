import { describe, expect, it } from "vitest";

import { ALIGN_LIMITS, buildKanjiTest, SEGMENT_KINDS as KINDS, kanjiAsWord, segmentWord } from "./align.ts";

/* A かん字テスト: a reading beside empty squares, the kanji written in the squares and the okurigana in brackets under them. */
describe("a word cut for a test", () => {
  it("gives the kanji its share of the reading and marks the okurigana", () => {
    expect(segmentWord("食べる", "たべる")).toEqual([
      { text: "食", kind: KINDS.kanji, reading: "た" },
      { text: "べる", kind: KINDS.okurigana, reading: "べる" },
    ]);
  });

  it("keeps kana inside a word as written, anchoring the readings on either side", () => {
    expect(segmentWord("形が合う", "かたちがあう")?.map((s) => [s.text, s.kind, s.reading])).toEqual([
      ["形", KINDS.kanji, "かたち"],
      ["が", KINDS.kana, "が"],
      ["合", KINDS.kanji, "あ"],
      ["う", KINDS.okurigana, "う"],
    ]);
    expect(segmentWord("まがり角", "まがりかど")?.map((s) => s.kind)).toEqual([KINDS.kana, KINDS.kanji]);
  });

  it("reads a katakana reading as the same reading", () => {
    expect(segmentWord("引く", "ヒく")?.[0]?.reading).toBe("ひ");
  });

  it("takes a compound whole", () => {
    expect(segmentWord("絵日記", "えにっき")).toEqual([{ text: "絵日記", kind: KINDS.kanji, reading: "えにっき" }]);
  });

  it("refuses a reading that does not fit, and a word with no kanji", () => {
    expect(segmentWord("食べる", "たべた")).toBeNull();
    expect(segmentWord("ノート", "のーと")).toBeNull();
  });
});

describe("a kanji asked on its own", () => {
  it("takes its okurigana from the dictionary's dot", () => {
    expect(kanjiAsWord("食", ["た.べる", "く.う"], ["ショク"])).toEqual({ word: "食べる", reading: "たべる" });
  });

  it("is its own word where the reading has no okurigana, passing over prefix forms", () => {
    expect(kanjiAsWord("牛", ["うし"], ["ギュウ"])).toEqual({ word: "牛", reading: "うし" });
    expect(kanjiAsWord("日", ["-び", "ひ"], ["ニチ"])).toEqual({ word: "日", reading: "ひ" });
  });

  it("falls back to the on reading, and to nothing", () => {
    expect(kanjiAsWord("門", [], ["モン"])).toEqual({ word: "門", reading: "もん" });
    expect(kanjiAsWord("々", [], [])).toBeNull();
  });
});

describe("a test", () => {
  const pool = Array.from({ length: 30 }, (_, index) => ({
    word: `${String.fromCharCode(0x4e00 + index)}`,
    reading: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほ"[index]!,
  }));
  const words = (questions: { word: string }[]) => questions.map((question) => question.word);

  it("is the same test for the same seed, and another test for another seed", () => {
    expect(buildKanjiTest(pool, { seed: 7, count: 12 })).toEqual(buildKanjiTest(pool, { seed: 7, count: 12 }));
    expect(words(buildKanjiTest(pool, { seed: 8, count: 12 }).writing)).not.toEqual(
      words(buildKanjiTest(pool, { seed: 7, count: 12 }).writing),
    );
  });

  it("asks different words in each half while the list has enough", () => {
    const test = buildKanjiTest(pool, { seed: 3, count: 12 });
    expect([test.writing.length, test.reading.length]).toEqual([12, 12]);
    const written = new Set(words(test.writing));
    expect(words(test.reading).filter((item) => written.has(item))).toEqual([]);
  });

  it("asks a short list's words both ways rather than leave the second half short", () => {
    const test = buildKanjiTest(pool.slice(0, 15), { seed: 3, count: 12 });
    expect([test.writing.length, test.reading.length]).toEqual([12, 12]);
    expect(new Set(words(test.reading)).size).toBe(12);
    expect(buildKanjiTest(pool.slice(0, 5), { seed: 3, count: 12 }).reading).toHaveLength(5);
  });

  it("carries each question's segments for the sheet to draw", () => {
    const [question] = buildKanjiTest([{ word: "食べる", reading: "たべる" }], { seed: 1, count: 12 }).writing;
    expect(question?.segments.map((segment) => segment.kind)).toEqual([KINDS.kanji, KINDS.okurigana]);
  });

});

describe("the words a test is asked", () => {
  it("asks each word once, and leaves out one whose reading does not fit", () => {
    const test = buildKanjiTest(
      [
        { word: "会う", reading: "あう" },
        { word: "会う", reading: "あう" },
        { word: "食べる", reading: "たべた" },
        { word: "ノート", reading: "のーと" },
        { word: "電車", reading: "でんしゃ" },
      ],
      { seed: 1, count: 12 },
    );
    expect(test.writing.map((question) => question.word).sort()).toEqual(["会う", "電車"].sort());
  });

  it("asks nothing of a count below one, and nothing of an empty list", () => {
    expect(buildKanjiTest([{ word: "会う", reading: "あう" }], { seed: 1, count: 0 })).toEqual({ writing: [], reading: [] });
    expect(buildKanjiTest([{ word: "会う", reading: "あう" }], { seed: 1, count: -3 })).toEqual({ writing: [], reading: [] });
    expect(buildKanjiTest([], { seed: 1, count: 12 })).toEqual({ writing: [], reading: [] });
  });
});

describe("the readings a word is refused", () => {
  it("refuses an empty reading, a reading with a space or a line break in it, and a word that is empty", () => {
    expect(segmentWord("食べる", "")).toBeNull();
    expect(segmentWord("食べる", "た べる")).toBeNull();
    expect(segmentWord("食べる", "た\nべる")).toBeNull();
    expect(segmentWord("", "")).toBeNull();
  });

  it("ignores spaces round a reading", () => {
    expect(segmentWord("食べる", "  たべる \n")?.map((segment) => segment.reading)).toEqual(["た", "べる"]);
  });

  it("gives the first kanji the shortest share the rest allows", () => {
    expect(segmentWord("会う", "あう")?.[0]?.reading).toBe("あ");
    expect(segmentWord("山川", "やまがわ")).toEqual([{ text: "山川", kind: KINDS.kanji, reading: "やまがわ" }]);
    expect(segmentWord("見て見る", "みてみる")?.map((segment) => [segment.text, segment.reading])).toEqual([["見", "み"], ["て", "て"], ["見", "み"], ["る", "る"]]);
  });

  it("is given a word of several runs and a reading that fits only one way", () => {
    expect(segmentWord("入り口", "いりぐち")?.map((segment) => [segment.text, segment.kind, segment.reading])).toEqual([
      ["入", KINDS.kanji, "い"],
      ["り", KINDS.kana, "り"],
      ["口", KINDS.kanji, "ぐち"],
    ]);
  });

  it("answers in no time for a word that is nearly all one repeated kana, which a backtracking pattern would not", () => {
    const word = "亜あ".repeat(30);
    const reading = "あ".repeat(59);
    const started = Date.now();
    expect(segmentWord(word, reading)).toBeNull();
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  it("refuses a word or a reading past the limits rather than searching it", () => {
    expect(segmentWord("亜".repeat(ALIGN_LIMITS.word + 1), "あ".repeat(10))).toBeNull();
    expect(segmentWord("亜", "あ".repeat(ALIGN_LIMITS.reading + 1))).toBeNull();
    expect(segmentWord("亜".repeat(ALIGN_LIMITS.word), "あ".repeat(ALIGN_LIMITS.word))).not.toBeNull();
  });

  it("refuses what is not text", () => {
    expect(segmentWord(undefined as unknown as string, "あ")).toBeNull();
    expect(segmentWord("亜", undefined as unknown as string)).toBeNull();
  });

  it("matches the long-vowel mark in a katakana word", () => {
    expect(segmentWord("車ー", "くるまー")?.at(-1)?.kind).toBe(KINDS.okurigana);
  });
});
