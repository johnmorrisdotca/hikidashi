import { describe, expect, it } from "vitest";

import { LONGEST_ENDING, WORD_CLASSES, dictionaryForms, followsAsVerbStem, wordClassesOf } from "./deinflect.ts";

const { godan, ichidan, iAdjective, suru, kuru } = WORD_CLASSES;
const has = (written: string, base: string, wordClass: string) =>
  dictionaryForms(written).some((form) => form.base === base && form.wordClass === wordClass);

describe("the dictionary form a conjugated word was written from", () => {
  it.each([
    ["行きます", "行く", godan],
    ["行きませんでした", "行く", godan],
    ["行って", "行く", godan],
    ["行かなかった", "行く", godan],
    ["行きたくない", "行く", godan],
    ["行ける", "行く", godan],
    ["食べました", "食べる", ichidan],
    ["食べさせられました", "食べる", ichidan],
    ["見ています", "見る", ichidan],
    ["待って", "待つ", godan],
    ["読んだ", "読む", godan],
    ["泳いで", "泳ぐ", godan],
    ["話した", "話す", godan],
    ["買おう", "買う", godan],
    ["高くて", "高い", iAdjective],
    ["楽しかった", "楽しい", iAdjective],
    ["大きくなかった", "大きい", iAdjective],
    ["勉強しました", "勉強する", suru],
    ["来ます", "来る", kuru],
    ["来なかった", "来る", kuru],
  ])("%s is %s", (written, base, wordClass) => {
    expect(has(written, base, wordClass)).toBe(true);
  });

  it("never reads a bare stem as its verb, so 東京行き keeps its noun", () => {
    expect(dictionaryForms("行き")).toEqual([]);
    expect(dictionaryForms("東京行き")).toEqual([]);
  });

  it("puts the reading that accounts for more of the ending first", () => {
    expect(dictionaryForms("食べました")[0]).toEqual({ base: "食べる", wordClass: ichidan });
    expect(dictionaryForms("高くて")[0]).toEqual({ base: "高い", wordClass: iAdjective });
  });
});

describe("the kinds of word a dictionary says a word is", () => {
  it("reads a dictionary's plain parts of speech", () => {
    expect(wordClassesOf("行く", ["intransitive verb", "godan verb"])).toEqual([godan]);
    expect(wordClassesOf("食べる", ["transitive verb", "ichidan verb"])).toEqual([ichidan]);
    expect(wordClassesOf("高い", ["い adjective"])).toEqual([iAdjective]);
    expect(wordClassesOf("勉強する", ["する verb"])).toEqual([suru]);
    expect(wordClassesOf("行き", ["noun", "suffix"])).toEqual([]);
  });

  /* A dictionary may list 来る only as an intransitive verb. */
  it("knows 来る by its spelling", () => {
    expect(wordClassesOf("来る", ["intransitive verb"])).toEqual([kuru]);
  });
});

describe("the irregular verbs", () => {
  it.each([
    ["します", "する"],
    ["しました", "する"],
    ["しません", "する"],
    ["しませんでした", "する"],
    ["しない", "する"],
    ["しなかった", "する"],
    ["して", "する"],
    ["している", "する"],
    ["した", "する"],
    ["したい", "する"],
    ["すれば", "する"],
    ["しよう", "する"],
    ["される", "する"],
    ["させる", "する"],
    ["勉強します", "勉強する"],
    ["勉強しなかった", "勉強する"],
    ["勉強している", "勉強する"],
    ["勉強すれば", "勉強する"],
    ["勉強された", "勉強する"],
  ])("%s is %s, a する verb", (written, base) => {
    expect(has(written, base, suru)).toBe(true);
  });

  it.each([
    ["来ます", "来る"],
    ["来ました", "来る"],
    ["来ません", "来る"],
    ["来ない", "来る"],
    ["来なかった", "来る"],
    ["来て", "来る"],
    ["来ている", "来る"],
    ["来た", "来る"],
    ["来たい", "来る"],
    ["来れば", "来る"],
    ["来よう", "来る"],
    ["来られる", "来る"],
    ["来させる", "来る"],
    ["持って来ました", "持って来る"],
    ["きます", "くる"],
    ["きました", "くる"],
    ["きて", "くる"],
    ["きた", "くる"],
    ["こない", "くる"],
    ["こなかった", "くる"],
    ["こよう", "くる"],
    ["こられる", "くる"],
    ["くれば", "くる"],
  ])("%s is %s, a 来る verb", (written, base) => {
    expect(has(written, base, kuru)).toBe(true);
  });

  it("takes a kana 来る verb after kana or alone, never after a kanji", () => {
    expect(has("持ってきた", "持ってくる", kuru)).toBe(true);
    expect(has("やってきました", "やってくる", kuru)).toBe(true);
    expect(has("出てこない", "出てくる", kuru)).toBe(true);
    expect(has("行きました", "行くる", kuru)).toBe(false);
    expect(has("行きました", "行く", godan)).toBe(true);
  });

  it("never finds a verb in the verb itself, or in what is not a verb", () => {
    expect(dictionaryForms("する")).toEqual([]);
    expect(dictionaryForms("来る")).toEqual([]);
    expect(dictionaryForms("くる")).toEqual([]);
    expect(dictionaryForms("し")).toEqual([]);
    expect(dictionaryForms("来")).toEqual([]);
  });

  it("offers a kana stem as every verb it could be, for the caller to choose from", () => {
    const forms = dictionaryForms("きた");
    expect(forms).toContainEqual({ base: "くる", wordClass: kuru });
    expect(forms).toContainEqual({ base: "きる", wordClass: ichidan });
  });
});

describe("the other forms", () => {
  it.each([
    ["書かれる", "書く", godan],
    ["書かせる", "書く", godan],
    ["書けば", "書く", godan],
    ["書いている", "書く", godan],
    ["遊んでいた", "遊ぶ", godan],
    ["死んだ", "死ぬ", godan],
    ["食べられない", "食べる", ichidan],
    ["食べなければ", "食べる", ichidan],
    ["見よう", "見る", ichidan],
    ["高かったら", "高い", iAdjective],
    ["高ければ", "高い", iAdjective],
    ["寒くなかった", "寒い", iAdjective],
  ])("%s is %s", (written, base, wordClass) => {
    expect(has(written, base, wordClass)).toBe(true);
  });

  /* 食べる is also the potential of a verb 食ぶ: a guess, and the caller's dictionary says there is no such verb. */
  it("never offers the written form itself, and finds nothing in a な adjective's forms or text that is not Japanese", () => {
    for (const text of ["食べる", "高い", "行く", "静かです"]) expect(dictionaryForms(text).map((form) => form.base), text).not.toContain(text);
    for (const text of ["静かです", "water", "123", "ABC"]) expect(dictionaryForms(text), text).toEqual([]);
  });
});

describe("empty and odd input", () => {
  it("finds nothing in an empty string", () => {
    expect(dictionaryForms("")).toEqual([]);
  });

  it("finds nothing in a single character", () => {
    for (const character of ["た", "て", "る", "い", "く", "ま"]) expect(dictionaryForms(character), character).toEqual([]);
  });

  it("finishes at once on a long chain of endings, and on a very long string", () => {
    const started = Date.now();
    expect(dictionaryForms("食べさせられませんでした").length).toBeGreaterThan(0);
    expect(dictionaryForms("ませんでした".repeat(2_000)).length).toBeGreaterThanOrEqual(0);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("is not fooled by the names every object has", () => {
    expect(dictionaryForms("constructor")).toEqual([]);
    expect(wordClassesOf("constructor", ["constructor", "__proto__"])).toEqual([]);
  });
});

describe("the exported limits", () => {
  it("say how far past a word a caller must look, and which endings mark a stem", () => {
    expect(LONGEST_ENDING).toBeGreaterThanOrEqual(6);
    expect(followsAsVerbStem("ます。")).toBe(true);
    expect(followsAsVerbStem("たい")).toBe(true);
    expect(followsAsVerbStem("ながら")).toBe(false);
    expect(followsAsVerbStem("の電車")).toBe(false);
    expect(followsAsVerbStem("")).toBe(false);
  });
});

describe("reading a dictionary's tags", () => {
  it("reads JMdict's part-of-speech tags", () => {
    expect(wordClassesOf("行く", ["v5k-s", "vi"])).toEqual([godan]);
    expect(wordClassesOf("買う", ["v5u"])).toEqual([godan]);
    expect(wordClassesOf("食べる", ["v1", "vt"])).toEqual([ichidan]);
    expect(wordClassesOf("高い", ["adj-i"])).toEqual([iAdjective]);
    expect(wordClassesOf("いい", ["adj-ix"])).toEqual([iAdjective]);
    expect(wordClassesOf("愛する", ["vs-s", "vt"])).toEqual([suru]);
    expect(wordClassesOf("為る", ["vs-i"])).toEqual([suru]);
    expect(wordClassesOf("来る", ["vk", "vi"])).toEqual([kuru]);
  });

  it("reads plain labels in any case, with or without the hyphen", () => {
    expect(wordClassesOf("高い", ["I-Adjective"])).toEqual([iAdjective]);
    expect(wordClassesOf("勉強する", ["Suru verb"])).toEqual([suru]);
    expect(wordClassesOf("食べる", [" Ichidan Verb "])).toEqual([ichidan]);
  });

  it("knows a compound 来る verb, in kanji or kana, but not an adverb that happens to end that way", () => {
    expect(wordClassesOf("持って来る", ["transitive verb"])).toEqual([kuru]);
    expect(wordClassesOf("持ってくる", ["transitive verb"])).toEqual([kuru]);
    expect(wordClassesOf("明くる", ["adverb"])).toEqual([]);
    expect(wordClassesOf("来る", ["noun"])).toEqual([]);
  });

  it("answers nothing for no parts of speech", () => {
    expect(wordClassesOf("行く", [])).toEqual([]);
  });
});
