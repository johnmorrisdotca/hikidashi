import { test, expect } from "@playwright/test";
import { open, noSidewaysScroll } from "./demo.mjs";

test("the family groups remain readable and translate on phones and desks", async ({ page }) => {
  const errors = await open(page);
  const groups = page.locator("footer .family-group");
  await expect(groups).toHaveCount(8);
  await expect(groups.first().locator("strong")).toHaveText("Games — board");
  await expect(groups.first().locator("a")).toHaveText(["Domino", "Gunjin", "Narabe", "Sugoroku", "Tenka"]);
  await expect(page.locator("footer .family-group a")).toHaveCount(32);
  await expect(page.locator('footer a[aria-current="page"]')).toHaveText("Hikidashi");
  await expect(groups.last().locator("a")).toHaveAttribute("href", "https://spxis.github.io/rest-in-pieces/");
  await page.locator('[data-lang="ja"]').click();
  await expect(groups.first().locator("strong")).toHaveText("ボードゲーム");
  await expect(groups.last().locator("a")).toHaveAttribute("title", /フロントエンド/);
  await noSidewaysScroll(page);
  await page.locator('[data-lang="en"]').click();
  await expect(groups.last().locator("strong")).toHaveText("Developer tools");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});
