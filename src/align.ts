/**
 * 読みの割り当て: a word's reading shared out over its kanji, the way a school's かん字テスト sets it.
 *
 * A reading beside empty squares, the kanji written in the squares and the okurigana in brackets under
 * them. 食べる read たべる is 食 (た) and べる; 形が合う read かたちがあう is 形 (かたち), が, 合 (あ), う.
 * The kana a word is written with are anchors in its reading, which is what lets the rest be shared out
 * between the kanji. This is the part a worksheet, a flashcard that blanks the kanji, or a ruby
 * annotator needs, with nothing to look up.
 *
 * A test has a writing half (see the reading, write the kanji) and a reading half (see the kanji, write
 * the reading), drawn from the same words. `buildKanjiTest` makes both from a list, the same test for
 * the same seed.
 */
import { katakanaToHiragana } from "./kana.ts";

export { hiraganaToKatakana, katakanaToHiragana } from "./kana.ts";

const HAN = /\p{Script=Han}/u;

/**
 * What a run of a word is: kanji with their part of the reading, kana inside the word, or the kana that end it
 * (okurigana). The `kind` of every `WordSegment` is one of these.
 *
 * @example
 * ```ts
 * import { SEGMENT_KINDS, segmentWord } from "@johnmorrisdotca/hikidashi/align";
 *
 * const parts = segmentWord("食べる", "たべる") ?? [];
 * console.log(parts.filter((part) => part.kind === SEGMENT_KINDS.okurigana).map((part) => part.text));
 * ```
 */
export const SEGMENT_KINDS = {
  /** Kanji, with the part of the reading they carry. */
  kanji: "kanji",
  /** Kana inside a word, given on the paper as written. */
  kana: "kana",
  /** Kana that end a word after its kanji: written in the brackets. */
  okurigana: "okurigana",
} as const;
/**
 * One kind of run: `"kanji"`, `"kana"` or `"okurigana"`, the values of `SEGMENT_KINDS`.
 *
 * @example
 * ```ts
 * import { segmentWord, type SegmentKind } from "@johnmorrisdotca/hikidashi/align";
 *
 * const kinds: SegmentKind[] = (segmentWord("形が合う", "かたちがあう") ?? []).map((part) => part.kind);
 * console.log(kinds);
 * ```
 */
export type SegmentKind = (typeof SEGMENT_KINDS)[keyof typeof SEGMENT_KINDS];

/**
 * One run of a word, and its share of the reading in hiragana: what `segmentWord` cuts a word into.
 *
 * @example
 * ```ts
 * import { segmentWord, type WordSegment } from "@johnmorrisdotca/hikidashi/align";
 *
 * const first: WordSegment | undefined = segmentWord("食べる", "たべる")?.[0];
 * console.log(first);
 * ```
 */
export type WordSegment = {
  /** The run as the word writes it: one or more kanji, or kana. */
  text: string;
  /** Kanji, kana inside the word, or okurigana at its end. */
  kind: SegmentKind;
  /** The run's share of the reading, in hiragana. */
  reading: string;
};

/**
 * A word and its reading in hiragana: what `buildKanjiTest` takes a list of, and what `kanjiAsWord` makes.
 *
 * @example
 * ```ts
 * import { buildKanjiTest, type ReadWord } from "@johnmorrisdotca/hikidashi/align";
 *
 * const words: ReadWord[] = [{ word: "水", reading: "みず" }, { word: "食べる", reading: "たべる" }];
 * console.log(buildKanjiTest(words, { seed: 1, count: 1 }).writing.map((question) => question.word));
 * ```
 */
export type ReadWord = {
  /** The word as it is written, with at least one kanji. */
  word: string;
  /** How it is read, in hiragana (katakana is read the same). */
  reading: string;
};

/**
 * One question of a test: the word, its reading, and the word cut into its segments, ready to be drawn as squares
 * with the okurigana in brackets.
 *
 * @example
 * ```ts
 * import { buildKanjiTest, type KanjiTestQuestion } from "@johnmorrisdotca/hikidashi/align";
 *
 * const [question]: KanjiTestQuestion[] = buildKanjiTest([{ word: "食べる", reading: "たべる" }], { seed: 3, count: 1 }).writing;
 * console.log(question?.reading, question?.segments.map((part) => `${part.text}(${part.kind})`).join(" "));
 * ```
 */
export type KanjiTestQuestion = ReadWord & { segments: WordSegment[] };

/**
 * A test: words to write in kanji from their readings, then different words to read. Made by `buildKanjiTest`.
 *
 * @example
 * ```ts
 * import { buildKanjiTest, type KanjiTest } from "@johnmorrisdotca/hikidashi/align";
 *
 * const test: KanjiTest = buildKanjiTest([{ word: "水", reading: "みず" }, { word: "火", reading: "ひ" }], { seed: 9, count: 1 });
 * console.log(test.writing.length, test.reading.length, test.writing[0]?.word !== test.reading[0]?.word);
 * ```
 */
export type KanjiTest = { writing: KanjiTestQuestion[]; reading: KanjiTestQuestion[] };

/**
 * What `segmentWord` will work on: a word of up to 64 characters and a reading of up to 256. A longer word or reading
 * is refused (null) rather than searched.
 *
 * @example
 * ```ts
 * import { ALIGN_LIMITS, segmentWord } from "@johnmorrisdotca/hikidashi/align";
 *
 * console.log(ALIGN_LIMITS, segmentWord("字".repeat(ALIGN_LIMITS.word + 1), "じ"));
 * ```
 */
export const ALIGN_LIMITS = { word: 64, reading: 256 } as const;

function runsOf(word: string): { text: string; han: boolean }[] {
  const runs: { text: string; han: boolean }[] = [];
  for (const character of word) {
    const han = HAN.test(character);
    const last = runs[runs.length - 1];
    if (last && last.han === han) last.text += character;
    else runs.push({ text: character, han });
  }
  return runs;
}

/** The share of `reading` each run takes, left to right, the shortest share a kanji run can take first; null when none fits. */
function share(runs: readonly { text: string; han: boolean }[], reading: readonly string[]): string[] | null {
  /* A failure at (run, place) is the same failure however it is reached, so each is worked out once. */
  const failed = new Set<number>();
  const width = reading.length + 1;
  const go = (run: number, at: number): string[] | null => {
    if (run === runs.length) return at === reading.length ? [] : null;
    if (failed.has(run * width + at)) return null;
    const one = runs[run]!;
    let found: string[] | null = null;
    if (one.han) {
      for (let length = 1; at + length <= reading.length && found === null; length += 1) {
        const rest = go(run + 1, at + length);
        if (rest !== null) found = [reading.slice(at, at + length).join(""), ...rest];
      }
    } else {
      const anchor = Array.from(katakanaToHiragana(one.text));
      if (anchor.every((character, index) => reading[at + index] === character)) {
        const rest = go(run + 1, at + anchor.length);
        if (rest !== null) found = [anchor.join(""), ...rest];
      }
    }
    if (found === null) failed.add(run * width + at);
    return found;
  };
  return go(0, 0);
}

/**
 * A word cut into its kanji and its kana, each kanji run with its share of the reading.
 *
 * The kana a word is written with are anchors in its reading: 形が合う read かたちがあう is 形 かたち, が,
 * 合 あ, う. Kana that end a word after its kanji are its okurigana, which the writing half asks for in
 * brackets. A katakana reading, or katakana in the word, reads the same as hiragana. A compound of
 * several kanji (絵日記, えにっき) is one segment, since a reading cannot be split between kanji without a
 * dictionary.
 *
 * @param word - The word as it is written, such as 食べる or 形が合う.
 * @param reading - Its reading in hiragana or katakana, such as たべる.
 * @returns The word's runs left to right, each with its share of the reading; null when the reading does not fit the
 * word (so that a test can leave the word out rather than mark a wrong answer right), and for a word with no kanji, a
 * reading with a space or control character in it, or a word or reading longer than `ALIGN_LIMITS`.
 * @example
 * ```ts
 * import { segmentWord } from "@johnmorrisdotca/hikidashi/align";
 *
 * console.log(segmentWord("形が合う", "かたちがあう")?.map((part) => `${part.text}:${part.reading}:${part.kind}`));
 * console.log(segmentWord("絵日記", "エニッキ"), segmentWord("食べる", "のむ"));
 * ```
 */
export function segmentWord(word: string, reading: string): WordSegment[] | null {
  const text = String(word ?? "");
  const said = katakanaToHiragana(String(reading ?? "").trim());
  if (Array.from(text).length > ALIGN_LIMITS.word || Array.from(said).length > ALIGN_LIMITS.reading) return null;
  if (/[\s\p{Cc}]/u.test(said)) return null;
  const runs = runsOf(text);
  if (!runs.some((run) => run.han)) return null;
  const shares = share(runs, Array.from(said));
  if (shares === null) return null;
  return runs.map((run, index) => ({
    text: run.text,
    reading: shares[index]!,
    kind: run.han ? SEGMENT_KINDS.kanji : index > 0 && index === runs.length - 1 ? SEGMENT_KINDS.okurigana : SEGMENT_KINDS.kana,
  }));
}

/**
 * A kanji on its own, as a word a test can ask.
 *
 * A dictionary marks okurigana with a dot - た.べる for 食 - so 食 becomes 食べる read たべる, the question
 * a worksheet would ask. A reading without one is the kanji's own word (牛, うし), and a kanji with no
 * kun reading is asked by its on reading (門, もん). Prefix and suffix forms (-び) are passed over.
 *
 * @param kanji - One kanji.
 * @param kun - Its kun readings as a dictionary lists them, okurigana after a dot (た.べる) and prefix or suffix forms
 * with a hyphen.
 * @param on - Its on readings, in katakana or hiragana.
 * @returns The word to ask and its reading in hiragana; null for a kanji with neither a kun nor an on reading.
 * @example
 * ```ts
 * import { kanjiAsWord } from "@johnmorrisdotca/hikidashi/align";
 *
 * console.log(kanjiAsWord("食", ["た.べる", "く.う"], ["ショク"]), kanjiAsWord("牛", ["うし"], ["ギュウ"]));
 * console.log(kanjiAsWord("門", [], ["モン"]), kanjiAsWord("〆", [], []));
 * ```
 */
export function kanjiAsWord(kanji: string, kun: readonly string[], on: readonly string[]): ReadWord | null {
  const whole = kun.find((value) => !value.startsWith("-") && !value.endsWith("-")) ?? kun[0];
  if (whole) {
    const [stem, tail = ""] = katakanaToHiragana(whole.replace(/-/g, "")).split(".");
    if (stem) return { word: `${kanji}${tail}`, reading: `${stem}${tail}` };
  }
  const reading = on.map((value) => katakanaToHiragana(value.replace(/-/g, ""))).find(Boolean);
  return reading ? { word: kanji, reading } : null;
}

/** A small seeded generator (mulberry32), so a test and its link stay the same test. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const random = seededRandom(seed);
  const out = [...items];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [out[index], out[swap]] = [out[swap]!, out[index]!];
  }
  return out;
}

/**
 * The test: words to write in kanji, then different words to read.
 *
 * The seed decides which words and in what order, so the test on paper is the test that was on screen
 * and a link sent to somebody is the same test. Each word is asked once, and a word whose reading does
 * not fit it (`segmentWord` says null) is left out. A list too short for two halves of different words
 * asks its words both ways rather than leave the second half short.
 *
 * @param pool - The words to draw from, each with its reading.
 * @param options - `seed` decides which words and in what order; `count` is how many questions each half has (below
 * one asks nothing).
 * @returns The writing half and the reading half, each up to `count` questions; both empty when no word of the pool
 * fits its reading.
 * @example
 * ```ts
 * import { buildKanjiTest } from "@johnmorrisdotca/hikidashi/align";
 *
 * const pool = [
 *   { word: "食べる", reading: "たべる" }, { word: "水", reading: "みず" },
 *   { word: "学校", reading: "がっこう" }, { word: "形が合う", reading: "かたちがあう" },
 * ];
 * const test = buildKanjiTest(pool, { seed: 7, count: 2 });
 * console.log(test.writing.map((one) => one.word), test.reading.map((one) => one.word));
 * console.log(JSON.stringify(buildKanjiTest(pool, { seed: 7, count: 2 })) === JSON.stringify(test));
 * ```
 */
export function buildKanjiTest(pool: readonly ReadWord[], { seed, count }: { seed: number; count: number }): KanjiTest {
  const seen = new Set<string>();
  const askable: KanjiTestQuestion[] = [];
  for (const { word, reading } of pool) {
    const segments = segmentWord(word, reading);
    if (segments === null || seen.has(word)) continue;
    seen.add(word);
    askable.push({ word, reading, segments });
  }
  const size = Math.max(0, Math.floor(count));
  const order = shuffled(askable, seed);
  const writing = order.slice(0, size);
  const rest = order.slice(writing.length, writing.length + size);
  const topUp = shuffled(writing, seed + 1).slice(0, Math.max(0, size - rest.length));
  return { writing, reading: [...rest, ...topUp] };
}
