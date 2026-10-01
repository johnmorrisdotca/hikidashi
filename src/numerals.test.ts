import { describe, expect, it } from "vitest";

import {
  LARGEST_JAPANESE_NUMBER,
  parseEnglishNumber,
  parseJapaneseNumber,
  readJapaneseNumber,
  writeJapaneseNumber,
} from "./numerals.ts";

/*
 * Japanese counts in ten-thousands. 一億二千万 is "one hundred million, two
 * thousand ten-thousands", and getting from there to 120,000,000 is the whole
 * skill this answers for.
 */
describe("reading a number written in Japanese", () => {
  it.each([
    ["一", 1],
    ["十", 10],
    ["十五", 15],
    ["二十四", 24],
    ["百", 100],
    ["三百二十一", 321],
    ["千", 1_000],
    ["一万", 10_000],
    ["二千二十六", 2_026],
    ["一億二千万", 120_000_000],
    ["三億五千万", 350_000_000],
    ["一兆", 1_000_000_000_000],
  ])("reads %s as %i", (text, value) => {
    expect(parseJapaneseNumber(text)).toBe(value);
  });

  /* A headline writes the awkward parts in digits and the magnitudes in kanji. */
  it.each([
    ["1億2000万", 120_000_000],
    ["5万", 50_000],
    ["3億5000万", 350_000_000],
    ["120000000", 120_000_000],
    ["1,200", 1_200],
    ["１２０", 120],
  ])("reads the mixed spelling %s as %i", (text, value) => {
    expect(parseJapaneseNumber(text)).toBe(value);
  });

  /*
   * Units descend or the text is not a number anybody wrote on purpose.
   * Reading 万億 as something would put a confident wrong answer on the page.
   */
  it.each(["万億", "十百", "百十百", "一二三", "ねこ", "", "  ", "12kg"])(
    "refuses %s",
    (text) => {
      expect(parseJapaneseNumber(text)).toBeNull();
    },
  );

  /* 〇 and 零 are both zero, and a run of digits keeps its place value. */
  it("reads both zeroes", () => {
    expect(parseJapaneseNumber("零")).toBe(0);
    expect(parseJapaneseNumber("〇")).toBe(0);
  });
});

describe("writing a number the Japanese way", () => {
  it.each([
    [0, "〇"],
    [1, "一"],
    [10, "十"],
    [24, "二十四"],
    [100, "百"],
    [321, "三百二十一"],
    [1_000, "千"],
    [10_000, "一万"],
    [2_026, "二千二十六"],
    [120_000_000, "一億二千万"],
    [350_000_000, "三億五千万"],
    [1_000_000_000_000, "一兆"],
  ])("writes %i as %s", (value, text) => {
    expect(writeJapaneseNumber(value)).toBe(text);
  });

  /* The two directions have to agree, or one of them is lying. */
  it.each([1, 8, 15, 24, 99, 100, 305, 1_000, 8_064, 10_000, 90_210, 1_000_000, 120_000_000, 350_000_000, 1_000_000_000_000])(
    "round-trips %i",
    (value) => {
      const written = writeJapaneseNumber(value);
      expect(written).not.toBeNull();
      expect(parseJapaneseNumber(written!)).toBe(value);
    },
  );

  /* Above the safe range JavaScript answers a digit or two out, which is worse than not answering. */
  it("declines what it cannot write exactly", () => {
    expect(writeJapaneseNumber(-1)).toBeNull();
    expect(writeJapaneseNumber(1.5)).toBeNull();
    expect(writeJapaneseNumber(1e17)).toBeNull();
    expect(LARGEST_JAPANESE_NUMBER).toBe(Number.MAX_SAFE_INTEGER);
  });
});

/*
 * The half a learner cannot get from the digits. 300 is さんびゃく, not
 * さんひゃく, and 八百 is はっぴゃく however confidently you know it is 800.
 */
describe("saying the number aloud", () => {
  it.each([
    [1, "いち"],
    [4, "よん"],
    [7, "なな"],
    [10, "じゅう"],
    [24, "にじゅうよん"],
    [100, "ひゃく"],
    [300, "さんびゃく"],
    [600, "ろっぴゃく"],
    [800, "はっぴゃく"],
    [1_000, "せん"],
    [3_000, "さんぜん"],
    [8_000, "はっせん"],
    [10_000, "いちまん"],
    [100_000_000, "いちおく"],
    [1_000_000_000_000, "いっちょう"],
    [120_000_000, "いちおくにせんまん"],
  ])("says %i as %s", (value, reading) => {
    expect(readJapaneseNumber(value)).toBe(reading);
  });

  it("says zero as the word people use for it", () => {
    expect(readJapaneseNumber(0)).toBe("ゼロ");
  });
});

describe("zero", () => {
  it("is written, read and said every way it is", () => {
    expect(writeJapaneseNumber(0)).toBe("〇");
    expect(writeJapaneseNumber(0, { formal: true })).toBe("零");
    expect(parseJapaneseNumber("0")).toBe(0);
    expect(parseJapaneseNumber("０")).toBe(0);
    expect(parseJapaneseNumber("零")).toBe(0);
    expect(readJapaneseNumber(0)).toBe("ゼロ");
  });

  it("keeps a zero inside a number, and does not make a number of a lone unit", () => {
    expect(writeJapaneseNumber(101)).toBe("百一");
    expect(writeJapaneseNumber(10_001)).toBe("一万一");
    expect(parseJapaneseNumber("万")).toBeNull();
    expect(parseJapaneseNumber("億")).toBeNull();
  });
});

describe("very large numbers", () => {
  it("writes and reads the largest safe integer, and says it", () => {
    const largest = writeJapaneseNumber(LARGEST_JAPANESE_NUMBER)!;
    expect(largest).toBe("九千七兆千九百九十二億五千四百七十四万九百九十一");
    expect(parseJapaneseNumber(largest)).toBe(9_007_199_254_740_991);
    expect(readJapaneseNumber(LARGEST_JAPANESE_NUMBER)).toBe("きゅうせんななちょうせんきゅうひゃくきゅうじゅうにおくごせんよんひゃくななじゅうよんまんきゅうひゃくきゅうじゅういち");
  });

  it("answers null one past it, in either direction, rather than a number a digit out", () => {
    expect(writeJapaneseNumber(LARGEST_JAPANESE_NUMBER + 1)).toBeNull();
    expect(readJapaneseNumber(LARGEST_JAPANESE_NUMBER + 1)).toBeNull();
    expect(parseJapaneseNumber("9007199254740992")).toBeNull();
    expect(parseJapaneseNumber("九千七兆千九百九十二億五千四百七十四万九百九十二")).toBeNull();
    expect(parseJapaneseNumber("一京")).toBeNull();
    expect(parseJapaneseNumber("9".repeat(40))).toBeNull();
    expect(writeJapaneseNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(writeJapaneseNumber(Number.NaN)).toBeNull();
  });

  it("counts in ten-thousands all the way up", () => {
    expect(writeJapaneseNumber(1e8)).toBe("一億");
    expect(writeJapaneseNumber(1e12)).toBe("一兆");
    expect(writeJapaneseNumber(9_000_000_000_000_000)).toBe("九千兆");
    expect(parseJapaneseNumber("九千兆")).toBe(9_000_000_000_000_000);
    expect(parseJapaneseNumber("一千万")).toBe(10_000_000);
    expect(parseJapaneseNumber("千万")).toBe(10_000_000);
    expect(parseJapaneseNumber("十万")).toBe(100_000);
  });
});

describe("a mixture of digits and units", () => {
  it.each([
    ["2万5千", 25_000],
    ["2万5000", 25_000],
    ["２万５千", 25_000],
    ["2万 5千", 25_000],
    ["1億2千万", 120_000_000],
    ["1億2,000万", 120_000_000],
    ["3千", 3_000],
    ["5百", 500],
    ["1万5千300", 15_300],
    ["12万", 120_000],
    ["二万5千", 25_000],
    ["5千2万", 50_020_000],
  ])("reads %s as %i", (text, value) => {
    expect(parseJapaneseNumber(text)).toBe(value);
  });

  it.each(["3百5千", "2万2万", "1.5万", "-3", "２万5千円", "2 万 x"])("refuses %s", (text) => {
    expect(parseJapaneseNumber(text)).toBeNull();
  });
});

describe("the formal numerals", () => {
  it("writes the figures that could be altered in their formal characters", () => {
    expect(writeJapaneseNumber(10_000, { formal: true })).toBe("壱万");
    expect(writeJapaneseNumber(2_000, { formal: true })).toBe("弐千");
    expect(writeJapaneseNumber(5_000, { formal: true })).toBe("五千");
    expect(writeJapaneseNumber(33, { formal: true })).toBe("参拾参");
    expect(writeJapaneseNumber(120_000_000, { formal: true })).toBe("壱億弐千万");
    expect(writeJapaneseNumber(10, { formal: true })).toBe("拾");
  });

  it("reads them back, and the old 萬", () => {
    expect(parseJapaneseNumber("壱万")).toBe(10_000);
    expect(parseJapaneseNumber("弐千")).toBe(2_000);
    expect(parseJapaneseNumber("参拾参")).toBe(33);
    expect(parseJapaneseNumber("壱萬弐千")).toBe(12_000);
    expect(parseJapaneseNumber("壱億弐千万")).toBe(120_000_000);
  });

  it.each([0, 1, 2, 3, 10, 11, 23, 100, 3_333, 10_000, 20_203, 120_000_000, LARGEST_JAPANESE_NUMBER])("round-trips %i formally", (value) => {
    expect(parseJapaneseNumber(writeJapaneseNumber(value, { formal: true })!)).toBe(value);
  });

  it("is the same as the plain way unless asked", () => {
    expect(writeJapaneseNumber(123, { formal: false })).toBe(writeJapaneseNumber(123));
  });
});

describe("what is not a number", () => {
  it("refuses what is not text, and text with nothing in it", () => {
    expect(parseJapaneseNumber(undefined as unknown as string)).toBeNull();
    expect(parseJapaneseNumber(null as unknown as string)).toBeNull();
    expect(parseJapaneseNumber("\n\t ")).toBeNull();
  });

  it("is the English reader's too, from the same entry", () => {
    expect(parseEnglishNumber("five man")).toBe(50_000);
  });
});
