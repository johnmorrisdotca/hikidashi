/**
 * 難しさ: how hard an example sentence is to read, so the easiest one can lead.
 *
 * A character like 水 appears in thousands of example sentences, and showing whichever one a database
 * returned first hands a first-grader a sentence built from rare name kanji. Score each sentence once
 * (when it is added, say) and the query is a plain sort.
 *
 * Two things make a sentence hard: how long it is, and the hardest character in it. Length is the
 * honest baseline, since a short sentence is readable even when every word is new, and the hardest
 * kanji dominates, because one unknown character stops a learner as surely as ten do.
 *
 * What a kanji costs comes from the school grade or the frequency rank you hold for it (KANJIDIC2 has
 * both). The package carries no table of its own.
 */

/** What a character costs, given what your dictionary knows about it. */
export type KanjiDifficultySource = {
  /** The school grade: 1 to 6 for elementary, 8 for the rest of the jōyō kanji, 9 and 10 for name kanji (KANJIDIC2's numbering). Null when ungraded. */
  grade: number | null;
  /** How common the kanji is, 1 being the most common. Null when not ranked. */
  frequencyRank: number | null;
};

/** A character nobody has graded and nobody counts as frequent. */
export const UNKNOWN_KANJI_COST = 20;
/** The hardest kanji weighs this much more than a character of length. */
const HARDEST_WEIGHT = 3;

/**
 * The cost of one kanji.
 *
 * School grades are the scale a family already understands, so grades 1 to 6 cost their own number.
 * Grade 8 is the rest of jōyō, taught in secondary school, and 9 and 10 are the name kanji, which a
 * learner meets late if at all. Ungraded characters fall back to how common they are, since a frequent
 * character is easier than a rare one whatever any curriculum says. A kanji nothing is known about
 * costs `UNKNOWN_KANJI_COST`, the most.
 */
export function kanjiCost(entry: KanjiDifficultySource | null | undefined): number {
  if (!entry) return UNKNOWN_KANJI_COST;
  if (entry.grade !== null && entry.grade <= 6) return entry.grade;
  if (entry.grade === 8) return 9;
  if (entry.grade !== null) return 14;
  if (entry.frequencyRank !== null) return Math.min(18, 10 + Math.round(entry.frequencyRank / 400));
  return UNKNOWN_KANJI_COST;
}

/** Every kanji in the text, once each, in the order they appear. Kana, punctuation and 々 are not kanji. */
export function kanjiIn(text: string): string[] {
  const seen = new Set<string>();
  for (const character of String(text ?? "")) {
    if (/[一-鿿㐀-䶿]/.test(character)) seen.add(character);
  }
  return [...seen];
}

/**
 * The sentence's score, lowest first: its length in characters plus three times its hardest kanji.
 *
 * Kana-only sentences score their length alone, which puts them at the top where they belong: a
 * beginner can read every one of them. A kanji missing from `costs` counts as the hardest kind.
 */
export function sentenceDifficulty(text: string, costs: ReadonlyMap<string, number>): number {
  const characters = kanjiIn(text);
  const hardest = characters.reduce((worst, character) => Math.max(worst, costs.get(character) ?? UNKNOWN_KANJI_COST), 0);
  return [...String(text ?? "")].length + hardest * HARDEST_WEIGHT;
}
