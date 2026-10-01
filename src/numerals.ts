/**
 * 漢数字: numbers, in both directions between the two ways of writing them.
 *
 * 一億二千万 is a number a learner meets in a news headline and cannot read, and 120,000,000 is a number
 * they can read and cannot write. Japanese counts in ten-thousands rather than thousands (万, 億, 兆,
 * each one 10,000 times the last), which is why 120 million is "twelve thousand ten-thousands" and why
 * reading one off a page is a different skill from reading the digits. That grouping is the whole of
 * this module.
 *
 * - `parseJapaneseNumber` reads 一億二千万, 1億2000万, 2万5千 or 120000000 and gives 120000000, or null.
 * - `writeJapaneseNumber` writes it back, and with `formal` the way a contract or a banknote does: 壱万.
 * - `readJapaneseNumber` says it aloud in hiragana, with the sound changes (さんびゃく, はっぴゃく).
 * - `parseEnglishNumber` reads "five hundred", "twenty-five" and the magnitudes in romaji ("5 man").
 *
 * Whole numbers from 0 to 9,007,199,254,740,991 only: past that JavaScript stops counting exactly,
 * and a number the runtime cannot hold is worse than one that is not offered.
 */
const DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;

/**
 * The formal numerals (大字, daiji) that contracts and banknotes write so that a stroke cannot be added
 * to a figure: 壱 for 一, 弐 for 二, 参 for 三, 拾 for 十. Nothing else changes in modern use, so 四 to
 * 九, 百 and 千 stay as they are. 萬 is the old form of 万 and is read, not written.
 */
const FORMAL: Record<string, string> = { "一": "壱", "二": "弐", "三": "参", "十": "拾", "〇": "零" };
const PLAIN_OF_FORMAL: Record<string, string> = { "壱": "一", "弐": "二", "参": "三", "拾": "十", "萬": "万" };

/** Both zeroes are written; 零 is the formal one and 〇 the everyday one. */
const ZEROES = new Set(["〇", "零", "0"]);

/** The units below a myriad, which stack inside one group of four digits. */
const SMALL_UNITS: Record<string, number> = { "十": 10, "百": 100, "千": 1_000 };

/**
 * The myriad units, largest first.
 *
 * 京 is 10^16, past which JavaScript's integers stop being exact - a number
 * that cannot be represented is worse than one that is not offered.
 */
const MYRIADS: Array<{ kanji: string; value: number }> = [
  { kanji: "京", value: 1e16 },
  { kanji: "兆", value: 1e12 },
  { kanji: "億", value: 1e8 },
  { kanji: "万", value: 1e4 },
];

/**
 * The largest number this module will answer for.
 *
 * JavaScript stops counting exactly above it, and a number the runtime cannot
 * hold is worse than one that is not offered: it would answer, confidently,
 * with a value a digit or two out.
 */
export const LARGEST_JAPANESE_NUMBER = Number.MAX_SAFE_INTEGER;

function toHalfWidthDigits(text: string): string {
  return text.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
}

/** A thousands comma is punctuation inside a number, not a break between two. */
function withoutThousandsCommas(text: string): string {
  return text.replace(/(\d),(?=\d{3}\b)/g, "$1");
}

/**
 * The value of a number written in Japanese, or null when it is not one.
 *
 * Mixed spellings are the common case rather than an edge: a headline writes
 * 1億2000万 with digits for the awkward parts and characters for the
 * magnitudes, and a textbook writes the same number 一億二千万. Both are read
 * here, and so is a plain run of digits, because the answer wants to go both
 * ways from whichever one was typed.
 *
 * The formal numerals are read too (壱万弐千, 萬), and so is a thousands comma. Units must descend:
 * 万億 is not a number anybody wrote on purpose, and reading it as one would put a confident wrong
 * answer on the page. Null for anything else, including a minus sign, a decimal point, a bare 万 and
 * a number past 9,007,199,254,740,991.
 */
export function parseJapaneseNumber(text: string): number | null {
  const cleaned = withoutThousandsCommas(toHalfWidthDigits(String(text ?? "").trim()))
    .replace(/\s+/g, "")
    .replace(/[壱弐参拾萬]/g, (char) => PLAIN_OF_FORMAL[char]!);
  if (!cleaned) return null;

  let total = 0;
  /* The group being built below the current myriad, and the digits before a unit. */
  let group = 0;
  let current: number | null = null;
  let lastMyriad = Number.POSITIVE_INFINITY;
  let lastSmall = Number.POSITIVE_INFINITY;
  let sawAnything = false;

  for (const char of cleaned) {
    if (ZEROES.has(char)) {
      current = (current ?? 0) * 10;
      sawAnything = true;
      continue;
    }

    if (/\d/.test(char)) {
      current = (current ?? 0) * 10 + Number(char);
      sawAnything = true;
      continue;
    }

    const digit = DIGITS.indexOf(char as (typeof DIGITS)[number]);
    if (digit > 0) {
      /* 二三 is not twenty-three: kanji digits do not sit side by side. */
      if (current !== null) return null;
      current = digit;
      sawAnything = true;
      continue;
    }

    const small = SMALL_UNITS[char];
    if (small !== undefined) {
      if (small >= lastSmall) return null;
      group += (current ?? 1) * small;
      current = null;
      lastSmall = small;
      sawAnything = true;
      continue;
    }

    const myriad = MYRIADS.find((unit) => unit.kanji === char);
    if (myriad) {
      const section = group + (current ?? 0);
      if (section === 0 || myriad.value >= lastMyriad) return null;
      total += section * myriad.value;
      group = 0;
      current = null;
      lastMyriad = myriad.value;
      lastSmall = Number.POSITIVE_INFINITY;
      sawAnything = true;
      continue;
    }

    return null;
  }

  if (!sawAnything) return null;

  const value = total + group + (current ?? 0);
  return Number.isSafeInteger(value) ? value : null;
}

/** The three-or-fewer digits below a myriad, written with 十百千. */
function writeBelowMyriad(value: number): string {
  if (value === 0) return "";

  let remaining = value;
  let out = "";

  for (const [kanji, unit] of [["千", 1_000], ["百", 100], ["十", 10]] as const) {
    const count = Math.floor(remaining / unit);
    if (count === 0) continue;
    remaining -= count * unit;
    /* The language drops the one: ten is 十, not 一十, and so for 百 and 千. */
    out += count === 1 ? kanji : `${DIGITS[count]}${kanji}`;
  }

  return remaining > 0 ? `${out}${DIGITS[remaining]}` : out;
}

/**
 * The number as Japanese writes it, or null when it is out of range (negative, not a whole number,
 * or past 9,007,199,254,740,991).
 *
 * Grouped by myriads, so each group is a number below 10,000 followed by its unit: 120,000,000 comes
 * out 一億二千万 rather than as a run of digits. With `formal`, the figures that can be altered are
 * written in their formal characters, as on a contract or a banknote: 壱万 for 一万, 弐千 for 二千.
 */
export function writeJapaneseNumber(value: number, options: { formal?: boolean } = {}): string | null {
  const written = writePlain(value);
  if (written === null || options.formal !== true) return written;
  return written.replace(/[一二三十〇]/g, (char) => FORMAL[char]!);
}

function writePlain(value: number): string | null {
  if (!Number.isInteger(value) || value < 0 || value > LARGEST_JAPANESE_NUMBER) return null;
  if (value === 0) return DIGITS[0]!;

  let remaining = value;
  let out = "";

  for (const unit of MYRIADS) {
    const count = Math.floor(remaining / unit.value);
    if (count === 0) continue;
    remaining -= count * unit.value;
    /* 一万 keeps its one, unlike 十 and 百: the myriads are counted, not implied. */
    out += `${writeBelowMyriad(count) || DIGITS[1]}${unit.kanji}`;
  }

  return `${out}${writeBelowMyriad(remaining)}`;
}

/**
 * How the number is said, which is the part that catches people out.
 *
 * The readings are not the digits read in a row: 300 is さんびゃく rather than
 * さんひゃく, 600 and 800 change again, and 3,000 and 8,000 do it to 千. A
 * learner who has worked out that 八百 is 800 still cannot say it, and a
 * dictionary that answered with the digits alone would leave the harder half
 * of the question untouched.
 */
const DIGIT_READINGS = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"] as const;

/** The sound changes, by unit and by the digit in front of it. */
const UNIT_READINGS: Record<string, { base: string; irregular: Record<number, string> }> = {
  "十": { base: "じゅう", irregular: {} },
  "百": { base: "ひゃく", irregular: { 3: "さんびゃく", 6: "ろっぴゃく", 8: "はっぴゃく" } },
  "千": { base: "せん", irregular: { 3: "さんぜん", 8: "はっせん" } },
  "万": { base: "まん", irregular: {} },
  "億": { base: "おく", irregular: {} },
  /* 兆 takes the small tsu after 一 and 八, the way 百 and 千 take theirs. */
  "兆": { base: "ちょう", irregular: { 1: "いっちょう", 8: "はっちょう", 10: "じゅっちょう" } },
  "京": { base: "けい", irregular: {} },
};

/** One unit with the count in front of it, sound changes applied. */
function readUnit(count: number, kanji: string): string {
  const unit = UNIT_READINGS[kanji]!;
  const irregular = unit.irregular[count];
  if (irregular) return irregular;
  /* 十 and 百 and 千 leave their one unsaid; the myriads say it. */
  const implied = count === 1 && ["十", "百", "千"].includes(kanji);
  return implied ? unit.base : `${readBelowMyriad(count)}${unit.base}`;
}

function readBelowMyriad(value: number): string {
  if (value === 0) return "";
  if (value < 10) return DIGIT_READINGS[value]!;

  let remaining = value;
  let out = "";
  for (const [kanji, unit] of [["千", 1_000], ["百", 100], ["十", 10]] as const) {
    const count = Math.floor(remaining / unit);
    if (count === 0) continue;
    remaining -= count * unit;
    out += readUnit(count, kanji);
  }
  return remaining > 0 ? `${out}${DIGIT_READINGS[remaining]}` : out;
}

/** The number said aloud, in hiragana, or null when it is out of range. */
export function readJapaneseNumber(value: number): string | null {
  if (!Number.isInteger(value) || value < 0 || value > LARGEST_JAPANESE_NUMBER) return null;
  if (value === 0) return "ゼロ";

  let remaining = value;
  let out = "";

  for (const unit of MYRIADS) {
    const count = Math.floor(remaining / unit.value);
    if (count === 0) continue;
    remaining -= count * unit.value;
    out += readUnit(count, unit.kanji);
  }

  return `${out}${readBelowMyriad(remaining)}`;
}

export { parseEnglishNumber } from "./englishNumbers.ts";
