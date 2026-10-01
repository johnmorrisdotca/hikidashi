import { describe, expect, it } from "vitest";

import { WORD_CLASSES } from "./deinflect.ts";
import { EXTRACT_LIMITS, extractFromText, sanitizePastedText, wordCandidates } from "./extract.ts";

const known = new Map([
  ["水曜日", []],
  ["毎日", []],
  ["食べる", [WORD_CLASSES.ichidan]],
  ["日本語", []],
]);
const keys = (text: string) => {
  const { words, kanji } = extractFromText({ text, known });
  return [...words.map((word) => `vocabulary:${word}`), ...kanji.map((one) => `kanji:${one}`)];
};

describe("what a paste is cut down to before anything reads it", () => {
  it("stops at the cap, and says it did", () => {
    const long = "水".repeat(EXTRACT_LIMITS.characters + 500);
    const { text, truncated } = sanitizePastedText(long);
    expect(Array.from(text)).toHaveLength(EXTRACT_LIMITS.characters);
    expect(truncated).toBe(true);
  });

  /* A paste is anything at all: control characters and invisible marks go. */
  it("drops what cannot be read", () => {
    const { text } = sanitizePastedText("水\u0000火\u200b土\u001b[31m\u202e木");
    for (const bad of ["\u0000", "\u001b", "\u200b", "\u202e"]) expect(text.includes(bad), JSON.stringify(bad)).toBe(false);
    expect(text).toContain("水");
    expect(text).toContain("木");
  });

  it("keeps markup as the text it is, never as markup", () => {
    /* Nothing here is a word or a kanji, so nothing survives into the list. */
    expect(keys("<script>alert(1)</script>")).toEqual([]);
    expect(keys("'; DROP TABLE StudyList; --")).toEqual([]);
  });
});

describe("the words and kanji a paste comes to", () => {
  it("finds the words the dictionary knows, longest first, and every kanji", () => {
    expect(keys("毎日水曜日")).toEqual([
      "vocabulary:毎日",
      "vocabulary:水曜日",
      "kanji:毎",
      "kanji:日",
      "kanji:水",
      "kanji:曜",
    ]);
  });

  it("reads a word written with kana as a word, and takes no kana as kanji", () => {
    expect(keys("毎日食べる")).toEqual(["vocabulary:毎日", "vocabulary:食べる", "kanji:毎", "kanji:日", "kanji:食"]);
  });

  it("takes each thing once, however often it is written", () => {
    expect(keys("毎日、毎日、毎日")).toEqual(["vocabulary:毎日", "kanji:毎", "kanji:日"]);
  });

  it("takes the kanji out of a passage that holds no word it knows", () => {
    expect(keys("彼は木を見た")).toEqual(["kanji:彼", "kanji:木", "kanji:見"]);
  });

  it("counts what it found, for the line that says what happened", () => {
    const { stats } = extractFromText({ text: "毎日水曜日", known });
    expect(stats).toEqual({ characters: 5, truncated: false, kanji: 4, words: 2 });
  });

  it("ignores everything that is not Japanese", () => {
    expect(keys("Hello, world! 123")).toEqual([]);
  });
});

describe("what the dictionary is asked about", () => {
  it("offers every run's substrings, and stops at the cap", () => {
    expect(wordCandidates("毎日")).toContain("毎日");
    expect(wordCandidates("water")).toEqual([]);
    const huge = "水火土木金".repeat(5_000);
    expect(wordCandidates(huge).length).toBeLessThanOrEqual(EXTRACT_LIMITS.candidates);
  });

  it("never offers a single character as a word, since that is a kanji", () => {
    expect(wordCandidates("水").length).toBe(0);
    const { words, kanji } = extractFromText({ text: "水", known: new Map([["水", []]]) });
    expect([words, kanji]).toEqual([[], ["水"]]);
  });
});

describe("empty and odd input", () => {
  it("finds nothing in an empty paste, and counts it", () => {
    expect(extractFromText({ text: "", known })).toEqual({ words: [], kanji: [], stats: { characters: 0, truncated: false, kanji: 0, words: 0 } });
    expect(extractFromText({ text: "   \n\t " }).words).toEqual([]);
    expect(wordCandidates("")).toEqual([]);
  });

  it("finds kanji with no dictionary at all, and no words", () => {
    expect(extractFromText({ text: "毎日水曜日" })).toMatchObject({ words: [], kanji: ["毎", "日", "水", "曜"] });
  });

  it("refuses what is not text", () => {
    expect(extractFromText({ text: undefined as unknown as string, known }).stats.characters).toBe(0);
    expect(sanitizePastedText(null as unknown as string)).toEqual({ text: "", truncated: false });
  });

  it("does not count the repeat mark or the circle as kanji, and still reads a word that holds one", () => {
    const { words, kanji } = extractFromText({ text: "人々と〇", known: new Map([["人々", []]]) });
    expect(words).toEqual(["人々"]);
    expect(kanji).toEqual(["人"]);
  });

  it("reads the Japanese out of a mixed paste and leaves the rest", () => {
    expect(extractFromText({ text: "Hello 毎日 world 水曜日!", known }).words).toEqual(["毎日", "水曜日"]);
  });

  it("is cut at the cap, finding what is before it and nothing after", () => {
    const text = `${"あ".repeat(EXTRACT_LIMITS.characters - 2)}毎日水`;
    const result = extractFromText({ text, known });
    expect(result.stats).toMatchObject({ characters: EXTRACT_LIMITS.characters, truncated: true });
    expect(result.words).toEqual(["毎日"]);
    expect(result.kanji).toEqual(["毎", "日"]);
  });

  it("is not fooled by the names every object has", () => {
    expect(extractFromText({ text: "constructor __proto__ toString", known }).words).toEqual([]);
  });

  it("never mistakes a word for the stem of a verb after a break in the text", () => {
    expect(extractFromText({ text: "行き\n行きます", known: new Map([["行き", []], ["行く", [WORD_CLASSES.godan]]]) }).words).toEqual(["行き", "行く"]);
  });

  it("reads a cap's worth of kana, a worst case for the matching, in a moment", () => {
    const started = Date.now();
    const text = "いきますたべましたみています".repeat(Math.floor(EXTRACT_LIMITS.characters / 14));
    extractFromText({ text, known: new Map([["行く", [WORD_CLASSES.godan]]]) });
    wordCandidates(text);
    expect(Date.now() - started).toBeLessThan(5_000);
  });
});
