// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: every panel starts
// from its own example, and motion is reduced. It waits on the page saying it is ready, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = 'main[data-ready="true"]';
const panel = (name) => `[data-testid="${name}-panel"]`;

/** A drawer's panel on its own: its box to type in, its examples, the answer and the call that made it. */
const drawer = (name, extra = {}) => ({
  subject: name,
  views: ["desk"],
  url: "/?lang=en&help=off",
  ready: READY,
  target: panel(name),
  ...extra,
});

await takePictures({
  shots: [
    // From the top of the page, so the header, the language chooser, the cloth patches and the first panels show. On a phone, in Japanese.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: "/?lang=en&help=off",
      ready: READY,
      height: 1100,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto("http://hikidashi.test/?lang=ja&help=off");
          await page.waitForSelector(READY);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      },
    },
    drawer("wareki"),
    drawer("numerals"),
    drawer("deinflect"),
    drawer("align"),
    drawer("extract"),
    drawer("difficulty"),
  ],
  // The family's thumbnail, dark thumbnail and icon (scripts/family-thumbnail.mjs): the package's drawing is its
  // typography, so the card sets what its own functions write, in the page's own colours: 引き出し with the reading
  // segmentWord shares out over its kanji, 一億二千万 in kanji, in formal 大字 and read aloud, and 2019's two era
  // years. The icon is the one bold kanji 引 on the page's felt.
  thumbnail: {
    url: "/?lang=en&help=off",
    ready: READY,
    target: "#thumbnail-type",
    icon: { target: "#thumbnail-glyph" },
    label: "Hikidashi 引き出し",
    async prepare(page) {
      await page.evaluate(async () => {
        const { segmentWord } = await import("./dist/align.js");
        const { readJapaneseNumber, writeJapaneseNumber } = await import("./dist/numerals.js");
        const { eraYearsOf, formatEraYearJapanese } = await import("./dist/wareki.js");
        const font = "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif";
        const ruby = (segments) =>
          segments
            .map(({ text, reading, kind }) =>
              kind === "kanji"
                ? `<ruby>${text}<rt style="color:var(--accent);font-size:0.3em">${reading}</rt></ruby>`
                : text,
            )
            .join("");
        const word = ruby(segmentWord("引き出し", "ひきだし"));
        const value = 120000000;
        const eras = eraYearsOf(2019).map((found) => formatEraYearJapanese(found, { gannen: true }));
        const line = (size, colour, text) =>
          `<div style="font-size:${size}px;line-height:1.25;color:${colour};white-space:nowrap">${text}</div>`;
        const stage = `<div id="thumbnail-type" style="display:flex;align-items:center;gap:56px;padding:16px;width:max-content;font-family:${font};font-weight:700">
          <div style="font-size:136px;line-height:1.1;color:var(--ink)">${word}</div>
          <div style="display:grid;gap:10px">
            ${line(24, "var(--accent)", readJapaneseNumber(value))}
            ${line(60, "var(--ink)", writeJapaneseNumber(value))}
            ${line(42, "var(--muted)", writeJapaneseNumber(value, { formal: true }))}
            ${line(44, "var(--ink)", eras.join("・"))}
          </div>
        </div>`;
        // The icon: the first kanji of the drawer's name, cream on the page's felt, so it keeps its margin at any size.
        const glyph = `<div id="thumbnail-glyph" style="display:grid;place-items:center;width:440px;height:440px;border-radius:72px;background:var(--felt);color:var(--felt-ink);font-family:${font};font-weight:800;font-size:330px;line-height:1">${segmentWord("引き出し", "ひきだし")[0].text}</div>`;
        document.body.replaceChildren();
        document.body.insertAdjacentHTML("beforeend", stage + glyph);
        await document.fonts.ready;
      });
    },
  },
});
