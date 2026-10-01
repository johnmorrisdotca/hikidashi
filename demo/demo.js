// The demo page's own script: one panel for each drawer of the package, each importing only its own entry
// (`./dist/wareki.js`, `./dist/numerals.js` and so on, as a page that wants one drawer would). Type in a panel
// and its answer is written as you type, from the package's own functions, in the language the header's
// chooser picks. The page's words are set as text, never as HTML.
import { eraOnDate, eraYearsOf, formatEraYearJapanese, formatEraYearRomaji, parseEraYear } from "./dist/wareki.js";
import { parseEnglishNumber, parseJapaneseNumber, readJapaneseNumber, writeJapaneseNumber } from "./dist/numerals.js";
import { dictionaryForms } from "./dist/deinflect.js";
import { segmentWord } from "./dist/align.js";
import { extractFromText } from "./dist/extract.js";
import { kanjiCost, kanjiIn, sentenceDifficulty } from "./dist/difficulty.js";
import { WORDS } from "./words.js";

// The grades of a few elementary-school kanji (the Ministry of Education's list), typed in for the demo. The package
// carries no table: your own dictionary has the grades, and the costs come from `kanjiCost`.
const GRADES = {
  1: "日本先生学校車木火山大人見水",
  2: "語食電行来毎曜話読買強京東",
  3: "飲勉待駅",
};
const COSTS = new Map(Object.entries(GRADES).flatMap(([grade, kanji]) => [...kanji].map((one) => [one, kanjiCost({ grade: Number(grade), frequencyRank: null })])));

// A short dictionary typed in for the demo, with the kinds of word each is, as `extractFromText` takes it.
const DICTIONARY = new Map([
  ["先生", []],
  ["学校", []],
  ["日本語", []],
  ["勉強", []],
  ["毎日", []],
  ["行く", ["godan"]],
  ["行き", []],
  ["食べる", ["ichidan"]],
  ["見る", ["ichidan"]],
  ["待つ", ["godan"]],
  ["高い", ["iAdjective"]],
  ["勉強する", ["suru"]],
  ["来る", ["kuru"]],
]);

const language = familyLanguage({ id: "hikidashi", words: WORDS, onChange: () => render() });
/** A line of the page in its language, with each `{name}` filled in from `values`. */
const say = (key, values) => {
  const word = WORDS[language.lang][key];
  return typeof word === "string" && values !== undefined ? word.replace(/\{(\w+)\}/g, (whole, name) => String(values[name] ?? "")) : word;
};
const ja = () => language.lang === "ja";
const $ = (id) => document.getElementById(id);

/** A definition list: [[label, value], …] written as text, in a box that keeps its room. */
function facts(target, pairs) {
  const list = document.createElement("dl");
  list.className = "facts";
  for (const [label, value] of pairs) {
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    if (value instanceof Node) detail.append(value);
    else detail.textContent = value;
    list.append(term, detail);
  }
  target.replaceChildren(list);
}

/** One line of words in the answer's box. `bad` marks it as a no. */
function note(target, text, bad = true) {
  const line = document.createElement("p");
  line.className = bad ? "note fam-muted" : "note";
  line.textContent = text;
  target.replaceChildren(line);
}

function chips(items) {
  const wrap = document.createElement("span");
  wrap.className = "chips";
  for (const { text, small, tone } of items) {
    const chip = document.createElement("span");
    chip.className = "fam-chip";
    if (tone) chip.dataset.tone = tone;
    chip.append(document.createTextNode(text));
    if (small) {
      const sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = small;
      chip.append(sub);
    }
    wrap.append(chip);
  }
  return wrap;
}

const show = (id, text) => {
  $(id).textContent = text;
};
const quote = (text) => JSON.stringify(text);

// ----- wareki ------------------------------------------------------------------------------------------------

const eraName = (era) => (ja() ? `${era.kanji}（${era.reading}）` : `${era.kanji} ${era.romaji}`);
const eraYearText = (found) => `${formatEraYearJapanese(found, { gannen: true })}${ja() ? "" : ` · ${formatEraYearRomaji(found)}`}`;

function wareki() {
  const text = $("wareki-input").value.trim();
  const out = $("wareki-answer");
  const pairs = [];
  const sayEra = (era) => [[say("wareki_reading"), eraName(era)], [say("wareki_began"), era.startDate], [say("wareki_ended"), era.endDate ?? say("wareki_still")]];
  let called = `parseEraYear(${quote(text)})`;
  const era = parseEraYear(text);
  if (era !== null) {
    pairs.push([say("wareki_year"), String(era.westernYear)], [say("wareki_era"), eraYearText(era)], ...sayEra(era.era));
    // 1989 and 2019 are two eras' years: say so.
    const both = eraYearsOf(era.westernYear);
    if (both.length > 1) pairs.push(["", say("wareki_both")]);
  } else if (/^\d{4}$/.test(text)) {
    called = `eraYearsOf(${text})`;
    const found = eraYearsOf(Number(text));
    if (found.length > 0) {
      for (const one of found) pairs.push([say("wareki_era"), eraYearText(one)]);
      pairs.push(...sayEra(found[0].era));
      if (found.length > 1) pairs.push(["", say("wareki_both")]);
    }
  } else {
    called = `eraOnDate(${quote(text)})`;
    const found = eraOnDate(text);
    if (found !== null) pairs.push([say("wareki_day"), eraYearText(found)], ...sayEra(found.era));
  }
  if (pairs.length === 0) note(out, say("wareki_none"));
  else facts(out, pairs);
  show("wareki-call", `${called}  // ${pairs.length === 0 ? "null" : pairs[0][1]}`);
}

// ----- numerals ----------------------------------------------------------------------------------------------

function numerals() {
  const text = $("numerals-input").value;
  const out = $("numerals-answer");
  let called = `parseJapaneseNumber(${quote(text)})`;
  let value = parseJapaneseNumber(text);
  if (value === null) {
    value = parseEnglishNumber(text);
    if (value !== null) called = `parseEnglishNumber(${quote(text)})`;
  }
  if (value === null) {
    note(out, say("numerals_none"));
    show("numerals-call", `${called}  // null`);
    return;
  }
  const kanji = writeJapaneseNumber(value);
  if (kanji === null) {
    note(out, say("numerals_none"));
    show("numerals-call", `${called}  // ${value}`);
    return;
  }
  facts(out, [
    [say("numerals_value"), value.toLocaleString(ja() ? "ja-JP" : "en-US")],
    [say("numerals_kanji"), kanji],
    [say("numerals_formal"), writeJapaneseNumber(value, { formal: true })],
    [say("numerals_said"), readJapaneseNumber(value)],
  ]);
  show("numerals-call", `${called}  // ${value}`);
}

// ----- deinflect ---------------------------------------------------------------------------------------------

function deinflect() {
  const text = $("deinflect-input").value.trim();
  const out = $("deinflect-answer");
  const forms = dictionaryForms(text);
  if (forms.length === 0) note(out, say("deinflect_none"));
  else facts(out, forms.map(({ base, wordClass }) => [base, say("kinds")[wordClass]]));
  show("deinflect-call", `dictionaryForms(${quote(text)})  // ${forms.length === 0 ? "[]" : `[${forms.slice(0, 2).map((form) => `{ base: ${quote(form.base)}, wordClass: ${quote(form.wordClass)} }`).join(", ")}${forms.length > 2 ? ", …" : ""}]`}`);
}

// ----- align -------------------------------------------------------------------------------------------------

function align() {
  const word = $("align-word").value.trim();
  const reading = $("align-reading").value.trim();
  const out = $("align-answer");
  const segments = segmentWord(word, reading);
  if (segments === null) note(out, say("align_none"));
  else {
    const wrap = document.createElement("span");
    wrap.className = "segments";
    for (const segment of segments) {
      const cell = document.createElement("span");
      cell.className = "segment";
      cell.dataset.kind = segment.kind;
      const text = document.createElement("b");
      text.textContent = segment.text;
      const said = document.createElement("span");
      said.textContent = segment.reading;
      const kind = document.createElement("span");
      kind.className = "kind";
      kind.textContent = say("segment")[segment.kind];
      cell.append(text, said, kind);
      wrap.append(cell);
    }
    out.replaceChildren(wrap);
  }
  show("align-call", `segmentWord(${quote(word)}, ${quote(reading)})  // ${segments === null ? "null" : segments.map((segment) => `${segment.text}:${segment.reading}`).join(" ")}`);
}

// ----- extract -----------------------------------------------------------------------------------------------

function extract() {
  const text = $("extract-input").value;
  const out = $("extract-answer");
  const { words, kanji, stats } = extractFromText({ text, known: DICTIONARY });
  const pairs = [
    [say("extract_words"), words.length === 0 ? say("extract_none") : chips(words.map((word) => ({ text: word })))],
    [say("extract_kanji"), kanji.length === 0 ? say("extract_none") : chips(kanji.map((one) => ({ text: one })))],
  ];
  facts(out, pairs);
  const line = document.createElement("p");
  line.className = "fam-fine";
  line.textContent = say("extract_stats", { ...stats, cut: stats.truncated ? say("extract_cut") : "" });
  out.append(line);
  show("extract-call", `extractFromText({ text, known })  // { words: [${words.map(quote).join(", ")}], kanji: ${kanji.length} }`);
}

// ----- difficulty --------------------------------------------------------------------------------------------

function difficulty() {
  const text = $("difficulty-input").value.trim();
  const out = $("difficulty-answer");
  const score = sentenceDifficulty(text, COSTS);
  const found = kanjiIn(text);
  const length = Array.from(text).length;
  const hardest = found.reduce((worst, one) => ((COSTS.get(one) ?? 20) > (COSTS.get(worst) ?? 20) ? one : worst), found[0] ?? "");
  const pairs = [
    [say("difficulty_score"), String(score)],
    [say("difficulty_length"), String(length)],
    [say("difficulty_hardest"), found.length === 0 ? say("difficulty_none") : `${hardest} (${COSTS.has(hardest) ? say("difficulty_cost", { cost: COSTS.get(hardest) }) : say("difficulty_unknown")})`],
  ];
  if (found.length > 0) pairs.push([say("extract_kanji"), chips(found.map((one) => ({ text: one, small: COSTS.has(one) ? String(COSTS.get(one)) : "?", tone: COSTS.has(one) ? undefined : "bad" })))]);
  facts(out, pairs);
  show("difficulty-call", `sentenceDifficulty(${quote(text)}, costs)  // ${score}`);
}

// ----- the page ----------------------------------------------------------------------------------------------

const PANELS = {
  wareki: { run: wareki, inputs: ["wareki-input"], examples: ["令和6年", "Heisei 3", "昭和元年", "1989", "2019-05-01"] },
  numerals: { run: numerals, inputs: ["numerals-input"], examples: ["2万5千", "一億二千万", "1億2000万", "120000000", "five hundred", "5 man", "壱万"] },
  deinflect: { run: deinflect, inputs: ["deinflect-input"], examples: ["行きました", "食べさせられませんでした", "来なかった", "しています", "高くて", "きた"] },
  align: { run: align, inputs: ["align-word", "align-reading"], examples: [["食べる", "たべる"], ["形が合う", "かたちがあう"], ["絵日記", "えにっき"], ["引き出し", "ひきだし"], ["食べる", "たべた"]] },
  extract: { run: extract, inputs: ["extract-input"], examples: ["先生と学校へ行きます。毎日日本語を勉強しています。", "東京行きの電車に乗った。", "友達が来ました。"] },
  difficulty: { run: difficulty, inputs: ["difficulty-input"], examples: ["みずをのむ。", "水を飲む。", "毎日日本語を勉強しています。", "鬱の鰐"] },
};

function fillExamples() {
  for (const [name, panel] of Object.entries(PANELS)) {
    const row = $(`${name}-examples`);
    row.replaceChildren(
      ...panel.examples.map((example) => {
        const values = [].concat(example);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = values[0].length > 12 ? `${values[0].slice(0, 11)}…` : values[0];
        button.dataset.value = values.join("|");
        button.addEventListener("click", () => {
          panel.inputs.forEach((id, index) => {
            $(id).value = values[index];
          });
          panel.run();
          press();
        });
        return button;
      }),
    );
  }
  press();
}

/** The example that is on show is the one pressed. */
function press() {
  for (const [name, panel] of Object.entries(PANELS)) {
    const now = panel.inputs.map((id) => $(id).value).join("|");
    $(`${name}-examples`).querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === now)));
  }
}

function dictionaryList() {
  $("dictionary-list").textContent = [...DICTIONARY.keys()].join("、");
}

function render() {
  language.say();
  for (const panel of Object.values(PANELS)) panel.run();
  press();
}

for (const panel of Object.values(PANELS)) {
  for (const id of panel.inputs) {
    $(id).addEventListener("input", () => {
      panel.run();
      press();
    });
  }
}

fillExamples();
dictionaryList();
render();
document.querySelector("main").dataset.ready = "true";
