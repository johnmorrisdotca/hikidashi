/**
 * 抽出: Japanese words and kanji pulled out of pasted text.
 *
 * Somebody pastes a page of a book, a lesson handout, a chat message, and wants the kanji and the
 * words out of it. Two things follow from "somebody pastes anything".
 *
 * The first is safety. The text is never stored, never rendered as anything but text, and never trusted
 * for its length: it is cut to a cap before any work is done, control characters are dropped, and what
 * comes back is not the text but words your own dictionary recognised and single kanji, a fixed shape of
 * strings. Nothing a paste can contain survives that as anything but a kanji or a word you already knew.
 *
 * The second is the reading itself: the runs of Japanese are found, the words in them are matched
 * longest-first against the dictionary you pass in as `known`, and every kanji is taken whether it
 * belongs to a matched word or not. A verb or adjective is matched as it is written (行きます, 高くて)
 * and returned as the dictionary form `known` lists (`deinflect`), so a sentence gives 行く rather than
 * the noun 行き that its stem happens to spell. The package carries no dictionary of its own: `known`
 * is a Map from each word to the kinds of word it is, from yours.
 */
import { LONGEST_ENDING, dictionaryForms, followsAsVerbStem, type WordClass } from "./deinflect.ts";

/** What a paste is held to. */
export const EXTRACT_LIMITS = {
  /** A chapter is about this long. Past it the paste is cut, and says so. */
  characters: 20_000,
  /** The longest run treated as one word. */
  wordLength: 8,
  /** How many distinct candidates a paste may ask the dictionary about. */
  candidates: 4_000,
} as const;

const HAN = /\p{Script=Han}/u;
/* 々 and 〇 are Han by script and are not kanji: a list of kanji to learn does not hold them. */
const NOT_KANJI = /[々〇]/u;
const HIRAGANA_END = /\p{Script=Hiragana}$/u;
/* A word the dictionary lists, plus the longest ending a sentence can put on it. */
const LONGEST_WRITTEN = EXTRACT_LIMITS.wordLength + LONGEST_ENDING;
const JAPANESE_RUN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー々]+/gu;
/* Anything a terminal or a parser might act on, and everything invisible. */
const CONTROL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;

/**
 * The words your dictionary confirmed, each with the kinds of word it is. A word with no kinds is
 * still a match as written; only a conjugated form needs its dictionary form to be the right kind
 * (`wordClassesOf` reads the kinds from a dictionary's parts of speech).
 */
export type KnownWords = ReadonlyMap<string, readonly WordClass[]>;

/** What to read, and the dictionary to read it against. Without `known` only kanji are found. */
export type ExtractInput = { text: string; known?: KnownWords };

/** The words found, then the kanji, each once, in the order they first appear; and what the paste held. */
export type ExtractResult = {
  /** Dictionary forms: 行きます is 行く. */
  words: string[];
  /** Single kanji, whether or not they belong to a word. */
  kanji: string[];
  /** What the paste held, for the line that says what happened. */
  stats: { characters: number; truncated: boolean; kanji: number; words: number };
};

/** The text as it will be read: cut to the cap, stripped of what cannot be read. */
export function sanitizePastedText(raw: string): { text: string; truncated: boolean } {
  const cleaned = String(raw ?? "").replace(CONTROL, " ");
  const characters = Array.from(cleaned);
  const truncated = characters.length > EXTRACT_LIMITS.characters;
  return { text: truncated ? characters.slice(0, EXTRACT_LIMITS.characters).join("") : cleaned, truncated };
}

/* Only a written form ending in kana can be a conjugation. */
function conjugatedForms(written: string) {
  return HIRAGANA_END.test(written) ? dictionaryForms(written) : [];
}

/**
 * Every substring the dictionary might know, so one question can be asked about the whole paste: look
 * all of them up at once, and pass the ones found as `known`. Capped at `EXTRACT_LIMITS.candidates`,
 * because a long paste of Japanese has more substrings than anybody needs to look up. Conjugated
 * forms are offered as the dictionary forms they could come from, and a single character is never
 * offered, since that is a kanji.
 */
export function wordCandidates(text: string): string[] {
  const candidates = new Set<string>();
  const offer = (candidate: string) => {
    candidates.add(candidate);
    return candidates.size >= EXTRACT_LIMITS.candidates;
  };
  for (const [run] of sanitizePastedText(text).text.matchAll(JAPANESE_RUN)) {
    const characters = Array.from(run);
    for (let start = 0; start < characters.length; start += 1) {
      for (let length = Math.min(LONGEST_WRITTEN, characters.length - start); length >= 2; length -= 1) {
        const written = characters.slice(start, start + length).join("");
        if (length <= EXTRACT_LIMITS.wordLength && offer(written)) return [...candidates];
        for (const { base } of conjugatedForms(written)) {
          if (Array.from(base).length >= 2 && offer(base)) return [...candidates];
        }
      }
    }
  }
  return [...candidates];
}

/* The few characters after a word, to see whether they make it a verb's stem. */
function followedByStemEnding(characters: string[], end: number): boolean {
  return followsAsVerbStem(characters.slice(end, end + 3).join(""));
}

/**
 * The word written at the start of `characters`, longest first: as written if the dictionary lists it,
 * otherwise as the dictionary form of a verb or adjective the dictionary confirms is that kind of word.
 * At the same length the word as written wins, so 東京行き keeps the noun 行き, unless an ending only a
 * verb's stem takes follows it, as ます follows 行き in 行きます.
 */
function wordAt(characters: string[], index: number, known: KnownWords): { length: number; word: string } | null {
  for (let length = Math.min(LONGEST_WRITTEN, characters.length - index); length >= 2; length -= 1) {
    const written = characters.slice(index, index + length).join("");
    if (length <= EXTRACT_LIMITS.wordLength && known.has(written) && !followedByStemEnding(characters, index + length)) {
      return { length, word: written };
    }
    for (const { base, wordClass } of conjugatedForms(written)) {
      if (known.get(base)?.includes(wordClass)) return { length, word: base };
    }
  }
  return null;
}

/**
 * The words and kanji a paste comes to: the words `known` lists, longest match first, and every kanji
 * in the text.
 *
 * Both, rather than one or the other. A handout of vocabulary is wanted as words; the same handout is
 * also the kanji a learner has to write, and which of the two somebody meant is not for this to decide.
 * Show the result first, and let them take out what they did not want.
 */
export function extractFromText({ text, known = new Map() }: ExtractInput): ExtractResult {
  const { text: safe, truncated } = sanitizePastedText(text);
  const words: string[] = [];
  const seenWords = new Set<string>();

  for (const [run] of safe.matchAll(JAPANESE_RUN)) {
    const characters = Array.from(run);
    let index = 0;
    while (index < characters.length) {
      const found = wordAt(characters, index, known);
      if (found && !seenWords.has(found.word)) {
        seenWords.add(found.word);
        words.push(found.word);
      }
      index += found?.length ?? 1;
    }
  }

  const kanji: string[] = [];
  const seenKanji = new Set<string>();
  for (const character of Array.from(safe)) {
    if (!HAN.test(character) || NOT_KANJI.test(character) || seenKanji.has(character)) continue;
    seenKanji.add(character);
    kanji.push(character);
  }

  return { words, kanji, stats: { characters: Array.from(safe).length, truncated, kanji: kanji.length, words: words.length } };
}
