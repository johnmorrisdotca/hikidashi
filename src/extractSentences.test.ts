import { describe, expect, it } from "vitest";

import { WORD_CLASSES, type WordClass } from "./deinflect.ts";
import { extractFromText, wordCandidates } from "./extract.ts";

const { godan, ichidan, iAdjective, suru, kuru } = WORD_CLASSES;

/* A dictionary of these words, with the kinds of word each is. */
const catalogue = new Map<string, readonly WordClass[]>([
  ["先生", []],
  ["学校", []],
  ["行く", [godan]],
  /* A noun, "bound for": the stem of 行く spells it, and that is the trap. */
  ["行き", []],
  ["東京", []],
  ["電車", []],
  ["乗る", [godan]],
  ["昨日", []],
  ["ご飯", []],
  ["食べる", [ichidan]],
  ["友達", []],
  ["待つ", [godan]],
  ["読む", [godan]],
  ["寝る", [ichidan]],
  ["映画", []],
  ["楽しい", [iAdjective]],
  ["部屋", []],
  ["大きい", [iAdjective]],
  ["高い", [iAdjective]],
  ["美味しい", [iAdjective]],
  ["毎日", []],
  ["日本語", []],
  ["勉強", []],
  ["勉強する", [suru]],
  ["来る", [kuru]],
  ["見る", [ichidan]],
  ["静か", []],
]);

const words = (text: string, known = catalogue) => extractFromText({ text, known }).words;

describe("a sentence read into a list saves each verb and adjective as the dictionary lists it", () => {
  it("reads 行きます as 行く, never as the noun its stem spells", () => {
    expect(words("先生と学校へ行きます")).toEqual(["先生", "学校", "行く"]);
  });

  it.each([
    ["the polite past", "昨日ご飯を食べました", ["昨日", "ご飯", "食べる"]],
    ["the polite negative past", "昨日は学校へ行きませんでした", ["昨日", "学校", "行く"]],
    ["the plain past of the one irregular godan", "先生と東京へ行った", ["先生", "東京", "行く"]],
    ["the plain negative past", "学校へ行かなかった", ["学校", "行く"]],
    ["the te-form and a following clause", "本を読んで、寝ました", ["読む", "寝る"]],
    ["the te-form and いる, politely", "駅前で友達を待っています", ["友達", "待つ"]],
    ["the progressive of an ichidan verb", "毎日映画を見ている", ["毎日", "映画", "見る"]],
    ["wanting, negated", "学校へ行きたくない", ["学校", "行く"]],
    ["a する verb", "毎日日本語を勉強しています", ["毎日", "日本語", "勉強する"]],
    ["来る", "友達が来ました", ["友達", "来る"]],
  ])("%s: %s", (_label, sentence, expected) => {
    expect(words(sentence)).toEqual(expected);
  });

  it.each([
    ["past", "映画は楽しかったです", ["映画", "楽しい"]],
    ["negative", "この部屋は大きくない", ["部屋", "大きい"]],
    ["te-form joining two", "高くて美味しい", ["高い", "美味しい"]],
    ["a な adjective, which does not conjugate onto itself", "部屋は静かでした", ["部屋", "静か"]],
  ])("an adjective in the %s: %s", (_label, sentence, expected) => {
    expect(words(sentence)).toEqual(expected);
  });

  it("keeps 行き where the sentence means the noun", () => {
    expect(words("東京行きの電車に乗った")).toEqual(["東京", "行き", "電車", "乗る"]);
  });

  it("takes a dictionary form only when the dictionary says it is that kind of word", () => {
    /* Without the verb, 行きます gives no word rather than the noun its stem spells. */
    const nounOnly = new Map(catalogue).set("行く", []);
    expect(words("学校へ行きます", nounOnly)).toEqual(["学校"]);
  });

  it("still takes every kanji of a conjugated word", () => {
    const { kanji } = extractFromText({ text: "先生と学校へ行きます", known: catalogue });
    expect(kanji).toEqual(["先", "生", "学", "校", "行"]);
  });

  it("asks the dictionary about the dictionary forms a sentence could hold", () => {
    const asked = wordCandidates("先生と学校へ行きます。昨日ご飯を食べました");
    expect(asked).toEqual(expect.arrayContaining(["先生", "学校", "行く", "食べる"]));
  });
});
