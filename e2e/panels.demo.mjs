// The six panels: type in each and read the answer, press an example, and read it in Japanese.
import { expect, test } from "@playwright/test";

import { at, open, tap, type } from "./demo.mjs";

const answer = (page, name) => page.locator(at(`${name}-answer`));
const call = (page, name) => page.locator(at(`${name}-call`));

test("era years: an era year gives the Western year, a year gives both eras of a changeover, a day gives its era", async ({ page }) => {
  const errors = await open(page);
  await expect(answer(page, "wareki")).toContainText("2024");
  await expect(answer(page, "wareki")).toContainText("令和6年 · Reiwa 6");
  await expect(call(page, "wareki")).toContainText('parseEraYear("令和6年")');
  await type(page, "wareki-input", "1989");
  await expect(answer(page, "wareki")).toContainText("平成元年");
  await expect(answer(page, "wareki")).toContainText("昭和64年");
  await expect(answer(page, "wareki")).toContainText("both are right");
  await type(page, "wareki-input", "1989-01-07");
  await expect(answer(page, "wareki")).toContainText("昭和64年");
  await type(page, "wareki-input", "2019-05-01");
  await expect(answer(page, "wareki")).toContainText("令和元年");
  await expect(answer(page, "wareki")).toContainText("still running");
  await type(page, "wareki-input", "昭和65年");
  await expect(answer(page, "wareki")).toContainText("Not a date");
  await type(page, "wareki-input", "");
  await expect(answer(page, "wareki")).toContainText("Not a date");
  expect(errors).toEqual([]);
});

test("kanji numerals: kanji, digits and mixtures are read and written back, and what is not a number says so", async ({ page }) => {
  const errors = await open(page);
  await expect(answer(page, "numerals")).toContainText("25,000");
  await expect(answer(page, "numerals")).toContainText("二万五千");
  await expect(answer(page, "numerals")).toContainText("弐万五千");
  await expect(answer(page, "numerals")).toContainText("にまんごせん");
  await type(page, "numerals-input", "一億二千万");
  await expect(answer(page, "numerals")).toContainText("120,000,000");
  await expect(answer(page, "numerals")).toContainText("壱億弐千万");
  await type(page, "numerals-input", "five hundred");
  await expect(answer(page, "numerals")).toContainText("ごひゃく");
  await expect(call(page, "numerals")).toContainText("parseEnglishNumber");
  await type(page, "numerals-input", "9007199254740991");
  await expect(answer(page, "numerals")).toContainText("9,007,199,254,740,991");
  await type(page, "numerals-input", "9007199254740992");
  await expect(answer(page, "numerals")).toContainText("Not a whole number");
  await type(page, "numerals-input", "万億");
  await expect(answer(page, "numerals")).toContainText("Not a whole number");
  expect(errors).toEqual([]);
});

test("dictionary forms: the likeliest form leads, the irregular verbs are found, and a dictionary form is not conjugated", async ({ page }) => {
  const errors = await open(page);
  await expect(answer(page, "deinflect").locator("dt").first()).toHaveText("行く");
  await expect(answer(page, "deinflect").locator("dd").first()).toHaveText("godan verb");
  await type(page, "deinflect-input", "来なかった");
  await expect(answer(page, "deinflect")).toContainText("来る");
  await expect(answer(page, "deinflect")).toContainText("来る verb");
  await type(page, "deinflect-input", "勉強しています");
  await expect(answer(page, "deinflect")).toContainText("勉強する");
  await type(page, "deinflect-input", "行き");
  await expect(answer(page, "deinflect")).toContainText("Nothing");
  await type(page, "deinflect-input", "");
  await expect(answer(page, "deinflect")).toContainText("Nothing");
  expect(errors).toEqual([]);
});

test("reading alignment: the reading is shared out, the okurigana marked, and a reading that does not fit is left out", async ({ page }) => {
  const errors = await open(page);
  const segments = answer(page, "align").locator(".segment");
  await expect(segments).toHaveCount(2);
  await expect(segments.nth(0)).toContainText("食");
  await expect(segments.nth(0)).toContainText("た");
  await expect(segments.nth(1)).toHaveAttribute("data-kind", "okurigana");
  await type(page, "align-word", "形が合う");
  await type(page, "align-reading", "かたちがあう");
  await expect(segments).toHaveCount(4);
  await expect(segments.nth(1)).toHaveAttribute("data-kind", "kana");
  await type(page, "align-reading", "かたちがう");
  await expect(answer(page, "align")).toContainText("does not fit");
  expect(errors).toEqual([]);
});

test("pasted text: the dictionary's words come out as dictionary forms, then every kanji, once", async ({ page }) => {
  const errors = await open(page);
  await expect(answer(page, "extract")).toContainText("先生");
  await expect(answer(page, "extract")).toContainText("行く");
  await expect(answer(page, "extract")).toContainText("勉強する");
  await expect(answer(page, "extract")).toContainText("Characters 25, words 6, kanji 11");
  await type(page, "extract-input", "東京行きの電車");
  await expect(answer(page, "extract")).toContainText("words 1");
  await type(page, "extract-input", "");
  await expect(answer(page, "extract")).toContainText("Characters 0, words 0, kanji 0");
  await page.locator(`${at("dictionary")} summary`).click();
  await expect(page.locator("#dictionary-list")).toContainText("先生");
  expect(errors).toEqual([]);
});

test("sentence difficulty: the score is the length and three times the hardest kanji, and a kanji not in the table counts as unknown", async ({ page }) => {
  const errors = await open(page);
  await expect(answer(page, "difficulty")).toContainText("14");
  await expect(answer(page, "difficulty")).toContainText("飲 (cost 3)");
  await type(page, "difficulty-input", "みずをのむ。");
  await expect(answer(page, "difficulty")).toContainText("6");
  await expect(answer(page, "difficulty")).toContainText("No kanji");
  await type(page, "difficulty-input", "鬱");
  await expect(answer(page, "difficulty")).toContainText("61");
  await expect(answer(page, "difficulty")).toContainText("unknown");
  expect(errors).toEqual([]);
});

test("an example fills the box, is shown pressed, and the answer follows", async ({ page }, testInfo) => {
  await open(page);
  const examples = page.locator(at("wareki-examples"));
  await tap(page, examples.getByRole("button", { name: "Heisei 3" }), testInfo);
  await expect(page.locator(at("wareki-input"))).toHaveValue("Heisei 3");
  await expect(examples.getByRole("button", { name: "Heisei 3" })).toHaveAttribute("aria-pressed", "true");
  await expect(examples.getByRole("button", { name: "令和6年" })).toHaveAttribute("aria-pressed", "false");
  await expect(answer(page, "wareki")).toContainText("1991");
  await tap(page, page.locator(at("align-examples")).getByRole("button", { name: "絵日記" }), testInfo);
  await expect(page.locator(at("align-reading"))).toHaveValue("えにっき");
  await expect(answer(page, "align").locator(".segment")).toHaveCount(1);
});

test("in Japanese the panels' words and answers are Japanese, and the choice is kept", async ({ page }) => {
  const errors = await open(page, "?lang=ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator(at("wareki-panel"))).toContainText("元号の年");
  await expect(answer(page, "wareki")).toContainText("令和（れいわ）");
  await expect(answer(page, "wareki")).toContainText("いまも続いています");
  await expect(answer(page, "deinflect").locator("dd").first()).toHaveText("五段動詞");
  await expect(answer(page, "extract")).toContainText("25文字、単語6、漢字11");
  await expect(answer(page, "difficulty")).toContainText("点数");
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(answer(page, "wareki")).toContainText("Reiwa");
  await expect(answer(page, "extract")).toContainText("Characters 25, words 6, kanji 11");
  expect(errors).toEqual([]);
});

test("a hostile paste is shown as text and never as markup", async ({ page }) => {
  const errors = await open(page);
  await type(page, "extract-input", "<img src=x onerror=alert(1)>先生<script>alert(1)</script>");
  await expect(answer(page, "extract")).toContainText("先生");
  expect(await page.locator("main img, main script").count()).toBe(0);
  await type(page, "wareki-input", "<b>令和6年</b>");
  await expect(answer(page, "wareki")).toContainText("Not a date");
  await type(page, "deinflect-input", "<i>行きました</i>");
  await expect(answer(page, "deinflect")).toContainText("Nothing");
  expect(await answer(page, "deinflect").locator("i").count()).toBe(0);
  expect(await answer(page, "wareki").locator("b").count()).toBe(0);
  expect(errors).toEqual([]);
});
