// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: every panel starts
// from its own example, and motion is reduced. It waits on the page saying it is ready, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = 'main[data-ready="true"]';
const panel = (name) => `[data-testid="${name}-panel"]`;

/** A drawer's panel on its own: its box to type in, its examples, the answer and the call that made it. */
const drawer = (name, extra = {}) => ({ subject: name, views: ["desk"], url: "/?lang=en&help=off", ready: READY, target: panel(name), ...extra });

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
});
