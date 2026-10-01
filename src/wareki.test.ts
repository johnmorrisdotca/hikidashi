import { describe, expect, it } from "vitest";

import {
  JAPANESE_ERAS,
  eraOnDate,
  eraYearOf,
  eraYearsOf,
  formatEraYearJapanese,
  formatEraYearRomaji,
  parseEraYear,
  westernYearFor,
} from "./wareki.ts";

const REIWA = JAPANESE_ERAS.find((era) => era.kanji === "令和")!;
const SHOWA = JAPANESE_ERAS.find((era) => era.kanji === "昭和")!;

describe("westernYearFor", () => {
  /* An era's first year is year one, so the offset is one rather than none. */
  it("counts the first year as the year the era began", () => {
    expect(westernYearFor(REIWA, 1)).toBe(2019);
    expect(westernYearFor(SHOWA, 1)).toBe(1926);
  });

  it("works out three worked examples", () => {
    expect(westernYearFor(JAPANESE_ERAS[3]!, 3)).toBe(1991);
    expect(westernYearFor(SHOWA, 40)).toBe(1965);
    expect(westernYearFor(REIWA, 6)).toBe(2024);
  });

  /*
   * 昭和 ended partway through its 64th year and 平成 ended in its 31st, so
   * a higher number is not a late date - it is not a date at all, and
   * answering with the arithmetic would be a wrong answer rather than none.
   */
  it("refuses a year the era never reached", () => {
    expect(westernYearFor(SHOWA, 64)).toBe(1989);
    expect(westernYearFor(SHOWA, 65)).toBeNull();
    expect(westernYearFor(JAPANESE_ERAS[0]!, 46)).toBeNull();
    expect(westernYearFor(JAPANESE_ERAS[1]!, 16)).toBeNull();
    expect(westernYearFor(JAPANESE_ERAS[3]!, 32)).toBeNull();
  });

  it("keeps counting the era still running, within two digits", () => {
    expect(westernYearFor(REIWA, 99)).toBe(2117);
    expect(westernYearFor(REIWA, 100)).toBeNull();
  });

  it("refuses a year that is not one", () => {
    expect(westernYearFor(REIWA, 0)).toBeNull();
    expect(westernYearFor(REIWA, -1)).toBeNull();
    expect(westernYearFor(REIWA, 1.5)).toBeNull();
  });
});

describe("parseEraYear", () => {
  it("reads three spellings", () => {
    expect(parseEraYear("Heisei 3")?.westernYear).toBe(1991);
    expect(parseEraYear("Showa 40")?.westernYear).toBe(1965);
    expect(parseEraYear("令和6年")?.westernYear).toBe(2024);
  });

  it("does not mind the case, the spacing or the 年", () => {
    expect(parseEraYear("heisei 3")?.westernYear).toBe(1991);
    expect(parseEraYear("HEISEI3")?.westernYear).toBe(1991);
    expect(parseEraYear("  平成 3 年 ")?.westernYear).toBe(1991);
    expect(parseEraYear("平成3")?.westernYear).toBe(1991);
  });

  /* Whoever wrote Shōwa learned a different romanization, not another era. */
  it("takes every romanization of a long vowel", () => {
    expect(parseEraYear("Shouwa 40")?.westernYear).toBe(1965);
    expect(parseEraYear("Shōwa 40")?.westernYear).toBe(1965);
    expect(parseEraYear("Taisho 5")?.westernYear).toBe(1916);
    expect(parseEraYear("Taishou 5")?.westernYear).toBe(1916);
    expect(parseEraYear("Taishō 5")?.westernYear).toBe(1916);
  });

  /* 元年 is how a first year is written on anything official. */
  it("reads 元年 as the first year", () => {
    expect(parseEraYear("令和元年")?.westernYear).toBe(2019);
    expect(parseEraYear("平成元年")?.year).toBe(1);
  });

  /* A Japanese keyboard produces these, and they are the same digits. */
  it("reads full-width digits", () => {
    expect(parseEraYear("平成３年")?.westernYear).toBe(1991);
  });

  it("answers nothing for a query that is not a date", () => {
    expect(parseEraYear("morning")).toBeNull();
    expect(parseEraYear("water 3")).toBeNull();
    expect(parseEraYear("平成")).toBeNull();
    expect(parseEraYear("3")).toBeNull();
    expect(parseEraYear("")).toBeNull();
    expect(parseEraYear("Heisei 3 years")).toBeNull();
  });

  it("answers nothing for a year its era never reached", () => {
    expect(parseEraYear("Showa 65")).toBeNull();
    expect(parseEraYear("平成32年")).toBeNull();
  });

  it("carries the era it read, not just the number", () => {
    const found = parseEraYear("Heisei 3")!;
    expect(found.era.kanji).toBe("平成");
    expect(found.year).toBe(3);
  });
});

describe("formatting", () => {
  it("writes the date both ways", () => {
    const found = parseEraYear("Heisei 3")!;
    expect(formatEraYearJapanese(found)).toBe("平成3年");
    expect(formatEraYearRomaji(found)).toBe("Heisei 3");
  });

  it("writes the kanji form for a query that arrived in Latin letters", () => {
    expect(formatEraYearJapanese(parseEraYear("reiwa 6")!)).toBe("令和6年");
  });
});

describe("the era table", () => {
  it("runs from Meiji forwards with no gap between the eras", () => {
    expect(JAPANESE_ERAS[0]!.startYear).toBe(1868);
    for (let index = 1; index < JAPANESE_ERAS.length; index += 1) {
      const previous = JAPANESE_ERAS[index - 1]!;
      const era = JAPANESE_ERAS[index]!;
      /*
       * An era begins in the Western year the one before it ended in, because
       * the change happens partway through a year: 1989 is both 昭和64 and
       * 平成1, and 1926 is both 大正15 and 昭和1.
       */
      expect(westernYearFor(previous, previous.lastYear!)).toBe(era.startYear);
    }
  });

  it("leaves only the era still running open-ended", () => {
    const open = JAPANESE_ERAS.filter((era) => era.lastYear === null);
    expect(open.map((era) => era.kanji)).toEqual(["令和"]);
  });

  it("spells every era in lower case, so a query can be matched against it", () => {
    for (const era of JAPANESE_ERAS) {
      expect(era.spellings.length, era.romaji).toBeGreaterThan(0);
      for (const spelling of era.spellings) {
        expect(spelling, era.romaji).toBe(spelling.toLowerCase());
      }
      expect(era.spellings, era.romaji).toContain(era.romaji.toLowerCase());
    }
  });
});

const label = (found: { era: { kanji: string }; year: number } | null) => (found === null ? null : `${found.era.kanji}${found.year}`);

describe("a Western year to its era year", () => {
  it.each([
    [1868, ["明治1"]],
    [1911, ["明治44"]],
    [1912, ["大正1", "明治45"]],
    [1926, ["昭和1", "大正15"]],
    [1965, ["昭和40"]],
    [1989, ["平成1", "昭和64"]],
    [2000, ["平成12"]],
    [2019, ["令和1", "平成31"]],
    [2024, ["令和6"]],
    [2117, ["令和99"]],
  ])("%i is %j", (year, expected) => {
    expect(eraYearsOf(year).map(label)).toEqual(expected);
  });

  it("says the newest era's for one answer, the way a year is usually written", () => {
    expect(label(eraYearOf(1989))).toBe("平成1");
    expect(label(eraYearOf(2019))).toBe("令和1");
    expect(label(eraYearOf(1950))).toBe("昭和25");
    expect(eraYearOf(1989)?.westernYear).toBe(1989);
  });

  it("answers nothing before 明治, past the era still running, or for what is not a year", () => {
    expect(eraYearsOf(1867)).toEqual([]);
    expect(eraYearOf(0)).toBeNull();
    expect(eraYearOf(-5)).toBeNull();
    expect(eraYearOf(2118)).toBeNull();
    expect(eraYearOf(2024.5)).toBeNull();
    expect(eraYearOf(Number.NaN)).toBeNull();
    expect(eraYearOf(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("is the way back from parseEraYear for every year of every era", () => {
    for (const era of JAPANESE_ERAS) {
      for (let year = 1; year <= (era.lastYear ?? 99); year += 1) {
        const western = westernYearFor(era, year)!;
        expect(eraYearsOf(western).some((found) => found.era === era && found.year === year), `${era.kanji}${year}`).toBe(true);
      }
    }
  });
});

describe("the days an era changes on", () => {
  it.each([
    ["1868-10-22", null],
    ["1868-10-23", "明治1"],
    ["1912-07-29", "明治45"],
    ["1912-07-30", "大正1"],
    ["1926-12-24", "大正15"],
    ["1926-12-25", "昭和1"],
    ["1926-12-31", "昭和1"],
    ["1927-01-01", "昭和2"],
    ["1989-01-07", "昭和64"],
    ["1989-01-08", "平成1"],
    ["1989-12-31", "平成1"],
    ["1990-01-01", "平成2"],
    ["2019-04-30", "平成31"],
    ["2019-05-01", "令和1"],
    ["2020-01-01", "令和2"],
    ["2024-02-29", "令和6"],
  ])("%s is %s", (day, expected) => {
    expect(label(eraOnDate(day))).toBe(expected);
  });

  it("reads a Date as the day it shows, and carries the Western year", () => {
    expect(label(eraOnDate(new Date(2019, 3, 30)))).toBe("平成31");
    expect(label(eraOnDate(new Date(2019, 4, 1)))).toBe("令和1");
    expect(eraOnDate("2019-05-01")?.westernYear).toBe(2019);
  });

  it("answers nothing for a day that is not on the calendar, or not written as one", () => {
    for (const day of ["2023-02-30", "2023-13-01", "2023-00-10", "2023-1-5", "20230105", "令和6年", "", "x", "1989-01-08T00:00:00"]) expect(eraOnDate(day), day).toBeNull();
    expect(eraOnDate(new Date(Number.NaN))).toBeNull();
    expect(eraOnDate(undefined as unknown as string)).toBeNull();
  });

  it("knows the leap day, and that 1900 had none", () => {
    expect(label(eraOnDate("2000-02-29"))).toBe("平成12");
    expect(eraOnDate("1900-02-29")).toBeNull();
  });
});

describe("the era table's dates", () => {
  it("start each era the day after the last one ended, with the years matching the dates", () => {
    const day = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
    for (let index = 0; index < JAPANESE_ERAS.length; index += 1) {
      const era = JAPANESE_ERAS[index]!;
      expect(Number(era.startDate.slice(0, 4)), era.kanji).toBe(era.startYear);
      if (index > 0) expect(day(JAPANESE_ERAS[index - 1]!.endDate!) + 86_400_000, era.kanji).toBe(day(era.startDate));
      if (era.endDate !== null) expect(Number(era.endDate.slice(0, 4)) - era.startYear + 1, era.kanji).toBe(era.lastYear);
      else expect(index).toBe(JAPANESE_ERAS.length - 1);
    }
  });
});

describe("the changeover years, read from the era", () => {
  it("reads 平成31 and 令和1 as the same year, 2019", () => {
    expect(parseEraYear("平成31年")?.westernYear).toBe(2019);
    expect(parseEraYear("令和元年")?.westernYear).toBe(2019);
  });

  it("reads 昭和64 and 平成1 as the same year, 1989, and 昭和65 as nothing", () => {
    expect(parseEraYear("昭和64")?.westernYear).toBe(1989);
    expect(parseEraYear("平成元年")?.westernYear).toBe(1989);
    expect(parseEraYear("昭和65")).toBeNull();
  });

  it("reads the years either side of each boundary", () => {
    expect(parseEraYear("明治45")?.westernYear).toBe(1912);
    expect(parseEraYear("大正元年")?.westernYear).toBe(1912);
    expect(parseEraYear("大正15")?.westernYear).toBe(1926);
    expect(parseEraYear("昭和元年")?.westernYear).toBe(1926);
    expect(parseEraYear("明治46")).toBeNull();
    expect(parseEraYear("大正16")).toBeNull();
  });

  it("reads a macron written as a letter and a mark, and a name typed in capitals", () => {
    expect(parseEraYear("Sho\u0304wa 40")?.westernYear).toBe(1965);
    expect(parseEraYear("REIWA 元")?.westernYear).toBe(2019);
  });

  it("answers nothing for what is not text, and for 元 on its own", () => {
    expect(parseEraYear(undefined as unknown as string)).toBeNull();
    expect(parseEraYear(null as unknown as string)).toBeNull();
    expect(parseEraYear("元年")).toBeNull();
    expect(parseEraYear("令和0年")).toBeNull();
    expect(parseEraYear("令和1000年")).toBeNull();
  });
});

describe("writing the first year", () => {
  it("writes 元年 when asked, the way forms do, and 1 otherwise", () => {
    const first = parseEraYear("Reiwa 1")!;
    expect(formatEraYearJapanese(first)).toBe("令和1年");
    expect(formatEraYearJapanese(first, { gannen: true })).toBe("令和元年");
    expect(formatEraYearJapanese(parseEraYear("令和2")!, { gannen: true })).toBe("令和2年");
    expect(formatEraYearRomaji(first)).toBe("Reiwa 1");
  });
});
