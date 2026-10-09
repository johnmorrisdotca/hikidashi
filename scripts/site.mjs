// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Hikidashi's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "hikidashi";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Crect x='22' y='24' width='56' height='22' rx='4' fill='none' stroke='%23f3efe4' stroke-width='5'/%3E%3Crect x='22' y='54' width='56' height='22' rx='4' fill='none' stroke='%23f3efe4' stroke-width='5'/%3E%3Ccircle cx='50' cy='35' r='4' fill='%23f3efe4'/%3E%3Ccircle cx='50' cy='65' r='4' fill='%23f3efe4'/%3E%3C/svg%3E";

const uses = [
  `import { parseEraYear, eraYearsOf, eraOnDate } from "@johnmorrisdotca/hikidashi/wareki";`,
  `parseEraYear("令和6年")?.westernYear  // 2024`,
  `eraOnDate("1989-01-07")  // 昭和64; the next day is 平成1`,
  `parseJapaneseNumber("2万5千")  // 25000`,
  `writeJapaneseNumber(120_000_000)  // "一億二千万"`,
  `dictionaryForms("食べませんでした")[0]  // { base: "食べる", wordClass: "ichidan" }`,
  `segmentWord("食べる", "たべる")  // 食 た · べる (okurigana)`,
  `extractFromText({ text, known }).words  // 行きます is 行く, when your dictionary has 行く`,
];
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** An option row: a label and the fields, with the help line the Help switch shows in either language. */
const row = (help, content) => `<div class="fam-row" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}">${content}</div>`;
const field = (name, key, value, { area = false, pair = false } = {}) =>
  `${pair ? `<span class="pair">` : ""}<label class="fam-label" for="${name}" data-say="${key}"></label>${area ? `<textarea id="${name}" class="fam-field" data-testid="${name}" lang="ja" spellcheck="false" autocomplete="off" rows="3">${escape(value)}</textarea>` : `<input id="${name}" class="fam-field" data-testid="${name}" type="text" lang="ja" spellcheck="false" autocomplete="off" autocapitalize="off" value="${escape(value)}" />`}${pair ? "</span>" : ""}`;
const examples = (name, help) => `<div class="fam-seg" role="group" data-say-label="examples" id="${name}-examples" data-testid="${name}-examples" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}"></div>`;

/** A drawer's panel: its title and import, what it does, what to type, the examples, the answer and the call. */
const panel = ({ name, fields, help, exampleHelp, extra = "" }) => `<section class="fam-panels drawer" id="${name}" aria-labelledby="${name}-title" data-testid="${name}-panel">
        <div class="fam-panel">
          <h2 id="${name}-title"><span data-say="${name}_title"></span> <code>/${name}</code></h2>
          <p class="blurb" data-say="${name}_blurb"></p>
          ${row(help, fields)}
          ${examples(name, exampleHelp)}
          <div class="answer" id="${name}-answer" data-testid="${name}-answer" aria-live="polite"></div>
          <pre class="call" id="${name}-call" data-testid="${name}-call" aria-label="the call"></pre>${extra}
        </div>
      </section>`;

const panels = [
  panel({
    name: "wareki",
    fields: field("wareki-input", "input", "令和6年"),
    help: ["Type an era year, a Western year or a date. An era year gives the Western year; a year or a date gives the era year.", "元号の年、西暦、日付のどれかを入力します。元号の年からは西暦が、西暦や日付からは元号の年が出ます。"],
    exampleHelp: ["Fill the box with an example: an era year, a changeover year, a date.", "例を入力欄に入れます：元号の年、改元の年、日付。"],
  }),
  panel({
    name: "numerals",
    fields: field("numerals-input", "input", "2万5千"),
    help: ["Type a number in kanji, in digits, mixed, or in English words. It is read, then written and said back.", "漢数字、算用数字、その混ぜ書き、英語のどれかで数を入力します。読み取って、漢数字と読み方で返します。"],
    exampleHelp: ["Fill the box with an example: kanji, a headline's mix of digits and kanji, digits, English words, a formal numeral.", "例を入れます：漢数字、見出しのような混ぜ書き、算用数字、英語、大字。"],
  }),
  panel({
    name: "deinflect",
    fields: field("deinflect-input", "input", "行きました"),
    help: ["Type a verb or adjective as it is written in a sentence. Each dictionary form it could come from is listed.", "文の中で書かれたままの動詞や形容詞を入力します。もとになりうる辞書形を並べます。"],
    exampleHelp: ["Fill the box with an example: a godan verb, a long chain of endings, the irregular 来る and する, an adjective, 来る in kana.", "例を入れます：五段動詞、長い活用の連なり、不規則な来る・する、形容詞、かなの来る。"],
  }),
  panel({
    name: "align",
    fields: `${field("align-word", "align_word", "食べる", { pair: true })}${field("align-reading", "align_reading", "たべる", { pair: true })}`,
    help: ["Type a word and its reading. The reading is shared out over the kanji; the kana are anchors.", "単語とその読みを入力します。読みは漢字に割り当てられ、かなは目印になります。"],
    exampleHelp: ["Fill both boxes with an example. The last one has a reading that does not fit, so it is left out.", "二つの欄に例を入れます。最後の例は読みが合わないので、除かれます。"],
  }),
  panel({
    name: "extract",
    fields: field("extract-input", "input", "先生と学校へ行きます。毎日日本語を勉強しています。", { area: true }),
    help: ["Paste or type Japanese. Words from the demo's short dictionary come out in dictionary form, then every kanji.", "日本語を貼り付けるか入力します。デモの短い辞書にある単語が辞書形で、続いてすべての漢字が出ます。"],
    exampleHelp: ["Fill the box with an example: conjugated verbs, a noun that is also a verb's stem, another sentence.", "例を入れます：活用した動詞、動詞の語幹と同じ名詞、別の文。"],
    extra: `
          <details class="fam-fold dictionary" data-testid="dictionary">
            <summary data-say="extract_dictionary"></summary>
            <p id="dictionary-list" class="fam-notation"></p>
          </details>`,
  }),
  panel({
    name: "difficulty",
    fields: field("difficulty-input", "input", "水を飲む。"),
    help: ["Type a sentence. Its score is its length plus three times its hardest kanji; a kanji not in the demo's table counts as unknown.", "文を入力します。点数は文の長さに、いちばん難しい漢字の三倍を足したものです。表にない漢字は不明として扱います。"],
    exampleHelp: ["Fill the box with an example: all kana, a few kanji, a longer sentence, and two kanji the table does not know.", "例を入れます：すべてかな、少しの漢字、長い文、表にない二つの漢字。"],
  }),
];

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Hikidashi · Japanese era dates, kanji numerals, verb dictionary forms and more",
      description: "Small Japanese text tools you can try in your browser: era years and dates (令和6年 to 2024 and back), kanji numerals both ways, the dictionary forms of a conjugated verb, a reading shared out over its kanji, words pulled from pasted text, and sentence difficulty. Free and open source, in English and Japanese.",
      ogTitle: "Hikidashi: a drawer of Japanese text tools",
      ogDescription: "Era dates, kanji numerals, verb dictionary forms, readings over kanji, pasted-text extraction and sentence difficulty. No data, no dependencies.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="hikidashi.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links: [{ href: "docs/index.html", say: "pageDocs" }, { href: "api.html", say: "pageApi" }] })}
      <div class="drawers">
      ${panels.join("\n      ")}
      </div>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul class="uses">
          ${uses.map((line) => `<li><code>${escape(line)}</code></li>`).join("\n          ")}
        </ul>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
writeFileSync("site/index.html", page);
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Hikidashi", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
