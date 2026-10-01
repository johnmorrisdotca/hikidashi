/**
 * 活用: the dictionary form a conjugated word was written from.
 *
 * A sentence writes its verbs and adjectives conjugated: 行きます, 食べました, 待って, 高くて. A
 * dictionary lists them as 行く, 食べる, 待つ and 高い. Look a sentence up as it is written and
 * 先生と学校へ行きます finds 行き, a noun meaning "bound for" that is also the stem of the verb,
 * instead of 行く.
 *
 * This walks a written form back through its endings, one at a time, the way a learner does:
 * 行きませんでした is the polite negative past of 行く; 食べなかった is the past of 食べない, which is
 * the negative of 食べる. Every answer says which kind of word it would have to be, and a caller keeps
 * only the ones its dictionary confirms are that kind, so 行き is never taken for a verb stem when
 * nothing follows it and a noun ending in る is never taken for a verb.
 *
 * There is deliberately no rule that reads a bare stem as its verb. 東京行き is a noun, and 行き alone
 * is only ever a verb when an ending follows it, which is exactly when a longer rule matches.
 *
 * Covered: godan and ichidan verbs, い adjectives, and the two irregular verbs する and 来る, in the
 * polite, negative, past, te, conditional, volitional, passive, causative, potential and
 * "wanting" forms and chains of them. Not covered: the imperative, keigo verbs, and な adjectives
 * (which do not conjugate onto themselves).
 */

export const WORD_CLASSES = {
  godan: "godan",
  ichidan: "ichidan",
  iAdjective: "iAdjective",
  suru: "suru",
  kuru: "kuru",
} as const;

export type WordClass = (typeof WORD_CLASSES)[keyof typeof WORD_CLASSES];

/* A te-form waiting for its verb: 見ている is 見て + いる. */
const TE = "te";
type Tag = WordClass | typeof TE;

type Rule = { from: string; to: string; gives: Tag; accepts: readonly Tag[]; afterKana?: true };

export type Deinflection = { base: string; wordClass: WordClass };

const { godan, ichidan, iAdjective, suru, kuru } = WORD_CLASSES;

/* Each godan ending with the rows a conjugation reaches for. */
const GODAN_ROWS: { dictionary: string; i: string; a: string; e: string; o: string; te: string; ta: string }[] = [
  { dictionary: "く", i: "き", a: "か", e: "け", o: "こ", te: "いて", ta: "いた" },
  { dictionary: "ぐ", i: "ぎ", a: "が", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  { dictionary: "す", i: "し", a: "さ", e: "せ", o: "そ", te: "して", ta: "した" },
  { dictionary: "つ", i: "ち", a: "た", e: "て", o: "と", te: "って", ta: "った" },
  { dictionary: "ぬ", i: "に", a: "な", e: "ね", o: "の", te: "んで", ta: "んだ" },
  { dictionary: "ぶ", i: "び", a: "ば", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  { dictionary: "む", i: "み", a: "ま", e: "め", o: "も", te: "んで", ta: "んだ" },
  { dictionary: "る", i: "り", a: "ら", e: "れ", o: "ろ", te: "って", ta: "った" },
  { dictionary: "う", i: "い", a: "わ", e: "え", o: "お", te: "って", ta: "った" },
];

/* Endings on the stem 食べ / 行き, and what the whole then conjugates as. */
const STEM_ENDINGS: { ending: string; accepts: readonly Tag[] }[] = [
  { ending: "ます", accepts: [] },
  { ending: "ました", accepts: [] },
  { ending: "ません", accepts: [] },
  { ending: "ませんでした", accepts: [] },
  { ending: "ましょう", accepts: [] },
  { ending: "まして", accepts: [] },
  { ending: "ながら", accepts: [] },
  { ending: "なさい", accepts: [] },
  /* 行きたい is an adjective, so 行きたくない comes back through it. */
  { ending: "たい", accepts: [iAdjective] },
];

/* Endings on the a-row (godan) or the stem (ichidan): the negative, passive, causative. */
const NEGATIVE_ENDINGS: { ending: string; accepts: readonly Tag[] }[] = [
  { ending: "ない", accepts: [iAdjective] },
  { ending: "れる", accepts: [ichidan] },
  { ending: "せる", accepts: [ichidan] },
];

const TE_ENDINGS = [
  { suffix: "", accepts: [TE] },
  { suffix: "も", accepts: [] },
] as const;
const TA_ENDINGS = ["", "ら", "り"] as const;

function godanRules(): Rule[] {
  const rules: Rule[] = [];
  for (const row of GODAN_ROWS) {
    const to = row.dictionary;
    for (const { ending, accepts } of STEM_ENDINGS) rules.push({ from: `${row.i}${ending}`, to, gives: godan, accepts });
    for (const { ending, accepts } of NEGATIVE_ENDINGS) rules.push({ from: `${row.a}${ending}`, to, gives: godan, accepts });
    rules.push({ from: `${row.e}ば`, to, gives: godan, accepts: [] });
    /* The potential, 行ける, conjugates as an ichidan verb of its own. */
    rules.push({ from: `${row.e}る`, to, gives: godan, accepts: [ichidan] });
    rules.push({ from: `${row.o}う`, to, gives: godan, accepts: [] });
    for (const { suffix, accepts } of TE_ENDINGS) rules.push({ from: `${row.te}${suffix}`, to, gives: godan, accepts });
    for (const suffix of TA_ENDINGS) rules.push({ from: `${row.ta}${suffix}`, to, gives: godan, accepts: [] });
  }
  /* 行く is the one godan verb whose te-form is not the く row's. */
  for (const stem of ["行", "い"]) {
    for (const { suffix, accepts } of TE_ENDINGS) rules.push({ from: `${stem}って${suffix}`, to: `${stem}く`, gives: godan, accepts });
    for (const suffix of TA_ENDINGS) rules.push({ from: `${stem}った${suffix}`, to: `${stem}く`, gives: godan, accepts: [] });
  }
  return rules;
}

function ichidanRules(): Rule[] {
  const rules: Rule[] = [];
  for (const { ending, accepts } of STEM_ENDINGS) rules.push({ from: ending, to: "る", gives: ichidan, accepts });
  rules.push({ from: "ない", to: "る", gives: ichidan, accepts: [iAdjective] });
  rules.push({ from: "られる", to: "る", gives: ichidan, accepts: [ichidan] });
  rules.push({ from: "させる", to: "る", gives: ichidan, accepts: [ichidan] });
  rules.push({ from: "れば", to: "る", gives: ichidan, accepts: [] });
  rules.push({ from: "よう", to: "る", gives: ichidan, accepts: [] });
  for (const { suffix, accepts } of TE_ENDINGS) rules.push({ from: `て${suffix}`, to: "る", gives: ichidan, accepts });
  for (const suffix of TA_ENDINGS) rules.push({ from: `た${suffix}`, to: "る", gives: ichidan, accepts: [] });
  /* 見ている / 見てる is 見て and the verb いる, which itself conjugates. */
  rules.push({ from: "ている", to: "て", gives: TE, accepts: [ichidan] });
  rules.push({ from: "てる", to: "て", gives: TE, accepts: [ichidan] });
  rules.push({ from: "でいる", to: "で", gives: TE, accepts: [ichidan] });
  rules.push({ from: "でる", to: "で", gives: TE, accepts: [ichidan] });
  return rules;
}

function adjectiveRules(): Rule[] {
  return [
    { from: "かった", to: "い", gives: iAdjective, accepts: [] },
    { from: "かったら", to: "い", gives: iAdjective, accepts: [] },
    { from: "くない", to: "い", gives: iAdjective, accepts: [iAdjective] },
    { from: "くて", to: "い", gives: iAdjective, accepts: [] },
    { from: "く", to: "い", gives: iAdjective, accepts: [] },
    { from: "ければ", to: "い", gives: iAdjective, accepts: [] },
  ];
}

/* する and 来る are irregular; they are spelled out rather than derived. */
function irregularRules(): Rule[] {
  const forms: { ending: string; accepts: readonly Tag[] }[] = [
    ...STEM_ENDINGS,
    { ending: "ない", accepts: [iAdjective] },
    { ending: "て", accepts: [TE] },
    { ending: "ても", accepts: [] },
    { ending: "た", accepts: [] },
    { ending: "たら", accepts: [] },
    { ending: "たり", accepts: [] },
    { ending: "よう", accepts: [] },
  ];
  const rules: Rule[] = [];
  for (const { ending, accepts } of forms) {
    rules.push({ from: `し${ending}`, to: "する", gives: suru, accepts });
    rules.push({ from: `来${ending}`, to: "来る", gives: kuru, accepts });
  }
  rules.push({ from: "すれば", to: "する", gives: suru, accepts: [] });
  rules.push({ from: "される", to: "する", gives: suru, accepts: [ichidan] });
  rules.push({ from: "させる", to: "する", gives: suru, accepts: [ichidan] });
  rules.push({ from: "来れば", to: "来る", gives: kuru, accepts: [] });
  rules.push({ from: "来られる", to: "来る", gives: kuru, accepts: [ichidan] });
  rules.push({ from: "来させる", to: "来る", gives: kuru, accepts: [ichidan] });
  /* 来る is often written in kana, and its stem changes with the ending: き, こ, く. Only after kana (持ってきた), or alone (きた): after a kanji, 行きました is 行く and never 行くる. */
  for (const { ending, accepts } of forms.filter((form) => form.ending !== "ない" && form.ending !== "よう")) {
    rules.push({ from: `き${ending}`, to: "くる", gives: kuru, accepts, afterKana: true });
  }
  rules.push({ from: "こない", to: "くる", gives: kuru, accepts: [iAdjective], afterKana: true });
  rules.push({ from: "こよう", to: "くる", gives: kuru, accepts: [], afterKana: true });
  rules.push({ from: "こられる", to: "くる", gives: kuru, accepts: [ichidan], afterKana: true });
  rules.push({ from: "こさせる", to: "くる", gives: kuru, accepts: [ichidan], afterKana: true });
  rules.push({ from: "くれば", to: "くる", gives: kuru, accepts: [], afterKana: true });
  return rules;
}

const RULES: readonly Rule[] = [...godanRules(), ...ichidanRules(), ...adjectiveRules(), ...irregularRules()];

/* Filed by their last character, so a word is only tried against endings it could have. */
const RULES_BY_LAST = new Map<string, Rule[]>();
for (const rule of RULES) {
  const last = rule.from.slice(-1);
  RULES_BY_LAST.set(last, [...(RULES_BY_LAST.get(last) ?? []), rule]);
}

/** The longest ending any rule strips, so a caller knows how far past a word to look. */
export const LONGEST_ENDING = Math.max(...RULES.map((rule) => Array.from(rule.from).length));

/*
 * Endings only a verb's stem takes. A noun is never followed by ます or たい,
 * so a word the catalogue lists that is followed by one is being written as a
 * stem - 行き in 行きます - and is not the word the sentence means. ながら is
 * left out on purpose: 残念ながら is a な adjective taking it.
 */
const STEM_ONLY_ENDINGS = ["ます", "ました", "ません", "ましょう", "まして", "たい", "なさい"] as const;

/** Whether `following` opens with an ending that makes the word before it a verb stem. */
export function followsAsVerbStem(following: string): boolean {
  return STEM_ONLY_ENDINGS.some((ending) => following.startsWith(ending));
}

/* Deep enough for 食べさせられませんでした; a chain never needs more. */
const MAX_STEPS = 5;

type Step = { term: string; tag: Tag | null; outer: number };

/**
 * Every dictionary form `written` could be a conjugation of, with the kind of
 * word it would have to be. The written form itself is not among them: a word
 * written as the catalogue lists it is the caller's plain match.
 *
 * Likeliest first: the reading that accounts for more of the written ending
 * leads, so 食べました is 食べる (ました) before it is 食べます (した). A
 * caller that cannot check the kind of word, like the news reader's lookup,
 * tries them in this order.
 */
export function dictionaryForms(written: string): Deinflection[] {
  const found = new Map<string, Deinflection & { outer: number; steps: number }>();
  let frontier: Step[] = [{ term: written, tag: null, outer: 0 }];
  for (let step = 0; step < MAX_STEPS && frontier.length > 0; step += 1) {
    const next: Step[] = [];
    for (const { term, tag, outer } of frontier) {
      for (const rule of RULES_BY_LAST.get(term.slice(-1)) ?? []) {
        if (tag !== null && !rule.accepts.includes(tag)) continue;
        if (!term.endsWith(rule.from)) continue;
        const stem = term.slice(0, term.length - rule.from.length);
        if (rule.afterKana && stem !== "" && !/[\p{Script=Hiragana}\p{Script=Katakana}ー]$/u.test(stem)) continue;
        /* 来ます has no stem of its own; an ending alone never does. */
        if (!stem && Array.from(rule.to).length < 2) continue;
        const base = `${stem}${rule.to}`;
        const reach = step === 0 ? rule.from.length : outer;
        next.push({ term: base, tag: rule.gives, outer: reach });
        const key = `${rule.gives}:${base}`;
        if (rule.gives !== TE && !found.has(key)) found.set(key, { base, wordClass: rule.gives, outer: reach, steps: step });
      }
    }
    frontier = next;
  }
  return [...found.values()]
    .sort((a, b) => b.outer - a.outer || a.steps - b.steps)
    .map(({ base, wordClass }) => ({ base, wordClass }));
}

/** The labels a dictionary gives each kind of word, in the wording of its own: plain English, and JMdict's tags. */
const LABELS: Record<WordClass, readonly RegExp[]> = {
  godan: [/^godan verb$/, /^v5/],
  ichidan: [/^ichidan verb$/, /^v1(-s)?$/],
  iAdjective: [/^(i|い)[- ]adjective$/, /^adj-ix?$/],
  suru: [/^(suru|する) verb$/, /^vs-[is]$/],
  kuru: [/^kuru verb$/, /^vk$/],
};

/**
 * The kinds of word a dictionary entry is, from the parts of speech it lists, so a conjugated form
 * is only taken for a verb or an adjective the dictionary says is one.
 *
 * Reads plain labels (`"godan verb"`, `"ichidan verb"`, `"i-adjective"` or `"い adjective"`,
 * `"suru verb"` or `"する verb"`), and JMdict's tags (`v5k`, `v1`, `adj-i`, `vs-i`, `vk`), in any case.
 * A dictionary that lists 来る only as "an intransitive verb" is covered: a verb whose spelling
 * ends in 来る or くる is a 来る verb.
 */
export function wordClassesOf(characters: string, partsOfSpeech: readonly string[]): WordClass[] {
  const parts = partsOfSpeech.map((part) => part.trim().toLowerCase());
  const classes = (Object.keys(LABELS) as WordClass[]).filter((wordClass) => parts.some((part) => LABELS[wordClass].some((label) => label.test(part))));
  const spelledAsKuru = /(来る|くる|來る)$/.test(characters) && parts.some((part) => /\bverb$/.test(part) || /^v(1|5|k)/.test(part));
  if (spelledAsKuru && !classes.includes(kuru)) classes.push(kuru);
  return classes;
}
