// How the demo looks and holds still: finger-sized controls, light and dark, English and Japanese, and no sideways scroll,
// at a phone's width and a desk's.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, type } from "./demo.mjs";

for (const scheme of ["light", "dark"]) {
  for (const lang of ["en", "ja"]) {
    test(`fits the page without a sideways scroll, in ${scheme} and ${lang}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      const errors = await open(page, `?lang=${lang}`);
      await noSidewaysScroll(page);
      // The longest things the demo is given still fit: a very long word, the longest number, a long paste.
      await type(page, "numerals-input", "九千七兆千九百九十二億五千四百七十四万九百九十一");
      await type(page, "deinflect-input", "食べさせられませんでした".repeat(6));
      await type(page, "align-word", "亜".repeat(30));
      await type(page, "align-reading", "あ".repeat(30));
      await type(page, "extract-input", "先生と学校へ行きます。毎日日本語を勉強しています。".repeat(40));
      await type(page, "difficulty-input", "毎日日本語を勉強しています。".repeat(20));
      await noSidewaysScroll(page);
      const paper = await page.locator(".fam-panels").first().evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(paper).toBe(scheme === "dark" ? "rgb(29, 32, 30)" : "rgb(251, 248, 241)");
      expect(errors).toEqual([]);
    });
  }
}

test("every button and field is a finger tall", async ({ page }) => {
  await open(page);
  const small = await page.evaluate(() => [...document.querySelectorAll("main button, main input, main textarea, nav a, nav button")].filter((one) => one.offsetParent !== null).map((one) => ({ name: one.textContent.trim() || one.id || one.dataset.lang, ...one.getBoundingClientRect().toJSON() })).filter((one) => one.height < 43.5 || (one.width < 43.5 && one.name !== "")));
  expect(small).toEqual([]);
});

test("each panel keeps its answer's box while it is typed in, so nothing below it moves", async ({ page }) => {
  await open(page);
  const box = page.locator(at("difficulty-answer"));
  const first = await box.boundingBox();
  await type(page, "difficulty-input", "みずをのむ。");
  const second = await box.boundingBox();
  await type(page, "difficulty-input", "水を飲む。毎日日本語を勉強しています。");
  const third = await box.boundingBox();
  expect(Math.abs(second.width - first.width)).toBeLessThan(0.5);
  expect(Math.abs(third.width - first.width)).toBeLessThan(0.5);
  expect(first.height).toBeGreaterThan(100);
});

test("the fields are real fields: no zoom on a phone, no autocorrect on Japanese", async ({ page }) => {
  await open(page);
  const sizes = await page.evaluate(() => [...document.querySelectorAll("main input, main textarea")].map((one) => parseFloat(getComputedStyle(one).fontSize)));
  expect(sizes.length).toBeGreaterThanOrEqual(7);
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
});
