/**
 * 和暦: Japanese era years, and the Western years and dates they name, both ways.
 *
 * Working out what 平成3年 is means knowing where the era started and subtracting one, which is
 * exactly the arithmetic nobody wants to do in their head while reading a form, a coin or somebody's
 * birth year. This goes from an era year to a Western year (`parseEraYear`), from a Western year or a
 * date to the era year it falls in (`eraYearOf`, `eraYearsOf`, `eraOnDate`), and writes the answer
 * (`formatEraYearJapanese`).
 *
 * Five eras, back to 明治. Not because the earlier ones do not exist, since there are two hundred and
 * more, but because 1868 is where the modern calendar begins, and a date before it is a history
 * question rather than a reading one. Every date here is in the Gregorian calendar.
 *
 * An era changes partway through a Western year, so a year can belong to two of them: 1989 is 昭和64
 * until 7 January and 平成1 from the 8th. `eraYearsOf` answers with both; `eraOnDate` says which one a
 * day is in.
 */

/** An era, as it is written, said and counted. */
export type JapaneseEra = {
  /** The name in kanji, which is how a date is written. */
  kanji: string;
  /** The Latin name, capitalised as English writes it. */
  romaji: string;
  /** The reading in hiragana, for anyone meeting the kanji for the first time. */
  reading: string;
  /** The Western year the era's first year falls in. */
  startYear: number;
  /**
   * The highest year the era reached, or null while it is still running.
   *
   * 昭和 ran to 64 and 平成 to 31, so 昭和65 is not a date and answering with 1990 would be a wrong
   * answer rather than a missing one.
   */
  lastYear: number | null;
  /** The era's first day, as `YYYY-MM-DD`: the day the emperor's reign, or for 明治 the name itself, began. */
  startDate: string;
  /** The era's last day, as `YYYY-MM-DD`: the day before the next era began. Null while it is still running. */
  endDate: string | null;
  /**
   * Every spelling the name is written with in Latin letters, in lower case.
   *
   * The long vowels are the reason there is a list rather than one string: 昭和 is Showa, Shouwa and
   * Shōwa depending on whose romanization somebody learned, and all three are the same era.
   */
  spellings: readonly string[];
};

/**
 * How far an era still running is allowed to be counted.
 *
 * An era year is written with two digits at most, 令和6年 or 昭和64年, so a third digit is a typo
 * rather than a date, and answering 令和500 with the year 2518 would be arithmetic rather than help.
 */
const OPEN_ERA_LIMIT = 99;

/**
 * The five modern eras, oldest first.
 *
 * 明治 is dated from 23 October 1868, when the name was proclaimed; its years are counted as if it
 * began with 1868, so 明治1 is 1868 and 明治45 is 1912. Each later era begins the day the emperor
 * before it died, which is also the day the year number starts again from 元年.
 */
export const JAPANESE_ERAS: readonly JapaneseEra[] = [
  { kanji: "明治", romaji: "Meiji", reading: "めいじ", startYear: 1868, lastYear: 45, startDate: "1868-10-23", endDate: "1912-07-29", spellings: ["meiji"] },
  { kanji: "大正", romaji: "Taisho", reading: "たいしょう", startYear: 1912, lastYear: 15, startDate: "1912-07-30", endDate: "1926-12-24", spellings: ["taisho", "taishou", "taishō"] },
  { kanji: "昭和", romaji: "Showa", reading: "しょうわ", startYear: 1926, lastYear: 64, startDate: "1926-12-25", endDate: "1989-01-07", spellings: ["showa", "shouwa", "shōwa"] },
  { kanji: "平成", romaji: "Heisei", reading: "へいせい", startYear: 1989, lastYear: 31, startDate: "1989-01-08", endDate: "2019-04-30", spellings: ["heisei"] },
  { kanji: "令和", romaji: "Reiwa", reading: "れいわ", startYear: 2019, lastYear: null, startDate: "2019-05-01", endDate: null, spellings: ["reiwa"] },
];

/** An era year that parsed or was found, and the year it names. */
export type EraYear = {
  era: JapaneseEra;
  /** The year within the era, counting from one. */
  year: number;
  /** The Western year it falls in. */
  westernYear: number;
};

/** Full-width digits are what a Japanese keyboard produces. */
function toHalfWidthDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
}

/** The highest year an era may be counted to: its last, or two digits for the one still running. */
function ceilingOf(era: JapaneseEra): number {
  return era.lastYear ?? OPEN_ERA_LIMIT;
}

/**
 * The Western year an era year falls in, or null when the era never had that year.
 *
 * Minus one, because an era's first year is year one rather than year zero: 平成1年 is 1989, the
 * year the era began, not the year after it. 昭和65 is null, since 昭和 ended in its 64th year.
 */
export function westernYearFor(era: JapaneseEra, year: number): number | null {
  if (!Number.isInteger(year) || year < 1) return null;
  if (year > ceilingOf(era)) return null;
  return era.startYear + year - 1;
}

/** The era a name refers to, written either way, or null. */
function eraNamed(name: string): JapaneseEra | null {
  const kanji = JAPANESE_ERAS.find((era) => era.kanji === name);
  if (kanji) return kanji;

  const spelling = name.toLowerCase();
  return JAPANESE_ERAS.find((era) => era.spellings.includes(spelling)) ?? null;
}

/**
 * The era name and the number, however the two were written.
 *
 * The name may be kanji or Latin and the number may sit against it or a space away, because 平成3年
 * and "Heisei 3" are the same question typed by two people. 年 is optional for the same reason: it is
 * how the date is written, not part of what was asked.
 */
const ERA_QUERY = /^(明治|大正|昭和|平成|令和|[a-zA-ZĀ-ſ]+)\s*(元|\d{1,3})\s*年?$/;

/**
 * The era year a text names, or null when it does not name one.
 *
 * 元年, "first year", is spelled out rather than numbered on anything official, so it is read as the
 * 1 it means. Everything else is a plain number, half-width or full, with or without the 年 that
 * usually follows it. Latin names may be spelled with a long-vowel macron (Shōwa) or without.
 */
export function parseEraYear(raw: string): EraYear | null {
  const query = toHalfWidthDigits(String(raw ?? "").normalize("NFC").trim());
  const match = ERA_QUERY.exec(query);
  if (!match) return null;

  const era = eraNamed(match[1]!);
  if (!era) return null;

  const year = match[2] === "元" ? 1 : Number(match[2]);
  const westernYear = westernYearFor(era, year);
  return westernYear === null ? null : { era, year, westernYear };
}

/**
 * Every era year that falls in a Western year, the newest era first.
 *
 * Most years have one answer. The five years an era changed in have two: 1912 is 大正1 and 明治45,
 * 1926 is 昭和1 and 大正15, 1989 is 平成1 and 昭和64, 2019 is 令和1 and 平成31. 1868 is 明治1 alone.
 * A year before 1868, a year past the reach of the era still running, or a number that is not a
 * whole year gives an empty list.
 */
export function eraYearsOf(westernYear: number): EraYear[] {
  if (!Number.isInteger(westernYear)) return [];
  const found: EraYear[] = [];
  for (const era of [...JAPANESE_ERAS].reverse()) {
    const year = westernYear - era.startYear + 1;
    if (year >= 1 && year <= ceilingOf(era)) found.push({ era, year, westernYear });
  }
  return found;
}

/**
 * The era year a Western year is usually written as: the newest era's, so 1989 is 平成1 and 2019 is
 * 令和1. Null where `eraYearsOf` has nothing. Use `eraYearsOf` to get both of a changeover year, or
 * `eraOnDate` when the day is known.
 */
export function eraYearOf(westernYear: number): EraYear | null {
  return eraYearsOf(westernYear)[0] ?? null;
}

/** A real calendar day as `YYYY-MM-DD`, from the same text or from a Date's own day; null for anything else. */
function isoDay(date: string | Date): string | null {
  let year: number;
  let month: number;
  let day: number;
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null;
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  } else {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toHalfWidthDigits(String(date ?? "").trim()));
    if (!match) return null;
    [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  const real = new Date(Date.UTC(year, month - 1, day));
  if (real.getUTCFullYear() !== year || real.getUTCMonth() !== month - 1 || real.getUTCDate() !== day) return null;
  const pad = (value: number, width: number) => String(value).padStart(width, "0");
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/**
 * The era year a day is in, from `YYYY-MM-DD` or a Date (read as the day it shows in its own time zone).
 *
 * Exact where `eraYearOf` cannot be: 1989-01-07 is 昭和64 and 1989-01-08 is 平成1. Null for a day
 * that is not on the calendar (the 30th of February), or before 明治 began on 1868-10-23.
 */
export function eraOnDate(date: string | Date): EraYear | null {
  const day = isoDay(date);
  if (day === null) return null;
  const era = [...JAPANESE_ERAS].reverse().find((one) => one.startDate <= day);
  if (!era) return null;
  const westernYear = Number(day.slice(0, 4));
  const year = westernYear - era.startYear + 1;
  return year <= ceilingOf(era) ? { era, year, westernYear } : null;
}

/**
 * The date as it is written in Japanese: 平成3年. With `gannen`, the first year is written the way
 * forms write it: 令和元年.
 */
export function formatEraYearJapanese(found: EraYear, options: { gannen?: boolean } = {}): string {
  const number = options.gannen === true && found.year === 1 ? "元" : String(found.year);
  return `${found.era.kanji}${number}年`;
}

/** The date as it is written in Latin letters: Heisei 3. */
export function formatEraYearRomaji(found: EraYear): string {
  return `${found.era.romaji} ${found.year}`;
}
