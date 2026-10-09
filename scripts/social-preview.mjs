// social-preview.mjs: the 1280×640 picture GitHub shows when a repository's link is shared (Settings → General → Social
// preview), one per package, in the family's look: the felt, the name with its Japanese name, the English job beside it
// ("Chizu 地図 — SVG maps for JavaScript"), the line on it, and a picture of its demo. GitHub has no API for the social
// image, so the files are made here and uploaded by hand. Made, never drawn by hand: a change of job or picture is a rerun.
//
//   node scripts/social-preview.mjs --out <folder> [--projects <folder of checkouts>] [repo …]
//
// With no repo named it makes every package of FAMILY and the other packages listed in OTHERS below. A package's job is
// read from its checkout's docs/site.json when there is one (the documentation site's file), otherwise from PROPOSED_JOBS.
// Its picture is its README's hero (docs/images/hero-desk-light.webp) from the checkout, or from GitHub; failing that, its
// card on the profile README (johnmorrisdotca/johnmorrisdotca, cards/<repo>.jpg). Run on the maintainer's Mac, like the
// README's pictures: it needs Playwright's Chromium and, for a package with no checkout, the network.
import { Buffer } from "node:buffer";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { FAMILY, FAMILY_CLOTHS, FAMILY_PITCH } from "./family-template.mjs";

/**
 * The English job of each package, as proposed in docs/ROLLOUT.md for the owner to approve. A package's docs/site.json
 * "job" overrides its line here once it has adopted the documentation site.
 */
export const PROPOSED_JOBS = {
  korokoro: "Dice roller with notation and exact odds",
  kyuubu: "Twisty cube puzzle for the browser",
  hitotsu: "Colour-card shedding game for two to eight",
  toranpu: "Playing cards, card games and solitaire",
  tane: "Seeded random numbers for JavaScript",
  narabe: "Board game rules engine: gomoku, Reversi, Go, checkers",
  tenka: "World conquest strategy game",
  kumimoji: "Crossword tile game in English and Japanese",
  tsunagi: "Connect-the-pairs line puzzle",
  jarajara: "Mahjong tiles and mahjong solitaire",
  suido: "Pipe-connecting puzzle",
  domino: "Dominoes and Mexican Train",
  kotoba: "Word lists and word-game rules",
  sugoroku: "Backgammon and its variants",
  kazu: "Sudoku and grid number puzzles",
  meikyuu: "Maze generator and maze game",
  hikidashi: "Japanese text tools for JavaScript",
  chizu: "SVG maps for JavaScript",
  bushu: "Find kanji by their radicals",
  tobiishi: "Peg solitaire",
  jirai: "Minesweeper with no-guess boards",
  gunjin: "Hidden-rank strategy games",
  karakuri: "Physics and hyper-casual puzzle games",
  houseki: "Match-3 gem puzzles",
  "address-plus": "US and Canadian address parser",
  kuni: "Countries, states and provinces",
  hata: "Country and region flags as SVG",
  "rest-in-pieces": "Fake REST API data for testing",
};

/** The packages outside FAMILY that are made the same way: their name as written, their Japanese name, a line on each, and where the code is. */
export const OTHERS = [
  { id: "address-plus", name: "address-plus", kana: "", pitch: "parses and normalises US and Canadian addresses, with USPS and Canada Post formats and bilingual abbreviations", owner: "johnmorrisdotca" },
  { id: "kuni", name: "Kuni", kana: "国", pitch: "every country and its states, provinces and prefectures, with ISO 3166 codes and names in English and Japanese", owner: "johnmorrisdotca" },
  { id: "hata", name: "Hata", kana: "旗", pitch: "flags as SVG: every country, and the regions of Japan, Canada and the United States, keyed by ISO 3166", owner: "johnmorrisdotca" },
  { id: "rest-in-pieces", name: "REST in Pieces", kana: "", pitch: "a REST service that serves realistic, repeatable fake data for building and testing client applications", owner: "spxis" },
];

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const capital = (text) => text[0].toUpperCase() + text.slice(1);

/** Everything the picture says about one package. */
export function describePackage(id, projects) {
  const member = FAMILY.find((one) => one.id === id);
  const other = OTHERS.find((one) => one.id === id);
  if (!member && !other) throw new Error(`${id} is neither in FAMILY nor in OTHERS`);
  const checkout = join(projects, id);
  const siteFile = join(checkout, "docs", "site.json");
  const job = (existsSync(siteFile) ? JSON.parse(readFileSync(siteFile, "utf8")).job : null) ?? PROPOSED_JOBS[id];
  const owner = other?.owner ?? "johnmorrisdotca";
  return {
    id, owner, checkout, job,
    name: member?.name ?? other.name,
    kana: member?.kana ?? other.kana,
    pitch: capital(member ? FAMILY_PITCH[id] : other.pitch),
    install: `npm install @johnmorrisdotca/${id}`,
  };
}

/** The demo's picture as a data: URI, from the checkout, from GitHub, or from the profile README's card; null when none is found. */
async function pictureOf(one) {
  for (const name of ["hero-desk-light.webp", "hero-desk-light.png", "playground.png"]) {
    const file = join(one.checkout, "docs", "images", name);
    if (existsSync(file)) return `data:image/${name.endsWith("png") ? "png" : "webp"};base64,${readFileSync(file).toString("base64")}`;
  }
  const remote = [
    `https://raw.githubusercontent.com/${one.owner}/${one.id}/main/docs/images/hero-desk-light.webp`,
    `https://raw.githubusercontent.com/johnmorrisdotca/johnmorrisdotca/main/cards/${one.id}.jpg`,
  ];
  for (const url of remote) {
    try {
      const answer = await globalThis.fetch(url);
      if (!answer.ok) continue;
      const type = url.endsWith(".jpg") ? "jpeg" : "webp";
      return `data:image/${type};base64,${Buffer.from(await answer.arrayBuffer()).toString("base64")}`;
    } catch {
      // No network, or GitHub did not answer: try the next.
    }
  }
  return null;
}

/** The page the picture is taken of: 1280 by 640, the family's felt, the words on the left and the demo on the right. */
export function socialPage(one, picture) {
  const { felt, deep, ink } = FAMILY_CLOTHS.green;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1280px; height: 640px; overflow: hidden; }
  body { font-family: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif; color: ${ink};
    background: radial-gradient(120% 90% at 30% 20%, ${felt} 0%, ${deep} 100%); display: grid; grid-template-columns: ${picture ? "600px 1fr" : "1fr"}; gap: 48px; padding: 64px 0 64px 72px; position: relative; }
  body::after { content: ""; position: absolute; inset: 0; opacity: .1; background-image: radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px); background-size: 5px 5px; pointer-events: none; }
  .words { display: flex; flex-direction: column; justify-content: center; gap: 22px; position: relative; z-index: 1; padding-right: ${picture ? "0" : "72px"}; }
  h1 { font-size: ${one.name.length > 10 ? 64 : 82}px; line-height: 1; letter-spacing: -.02em; font-weight: 800; }
  h1 span { font-weight: 500; opacity: .8; margin-left: 14px; font-size: .62em; }
  .job { font-size: 38px; line-height: 1.15; font-weight: 700; }
  .pitch { font-size: 23px; line-height: 1.4; opacity: .82; }
  .foot { margin-top: 14px; font: 600 19px ui-monospace, SFMono-Regular, Menlo, monospace; opacity: .7; display: grid; gap: 6px; }
  .shot { position: relative; z-index: 1; align-self: center; height: 512px; border-radius: 22px 0 0 22px; overflow: hidden; box-shadow: 0 18px 50px rgba(0,0,0,.45), 0 0 0 6px rgba(0,0,0,.18); background: #f4efe4; }
  .shot img { width: 100%; height: 100%; object-fit: cover; object-position: left top; display: block; }
  </style></head><body>
  <div class="words">
    <h1>${escape(one.name)}${one.kana ? `<span lang="ja">${escape(one.kana)}</span>` : ""}</h1>
    <p class="job">${escape(one.job)}</p>
    <p class="pitch">${escape(one.pitch)}</p>
    <div class="foot"><span>${escape(one.install)}</span><span>github.com/${escape(one.owner)}/${escape(one.id)}</span></div>
  </div>
  ${picture ? `<div class="shot"><img src="${picture}" alt=""></div>` : ""}
</body></html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const value = (flag) => { const at = args.indexOf(flag); return at >= 0 ? args.splice(at, 2)[1] : null; };
  const out = value("--out");
  const projects = value("--projects") ?? join(homedir(), "Projects");
  if (!out) throw new Error("--out <folder> is required");
  const ids = args.length > 0 ? args : [...FAMILY.map((one) => one.id), ...OTHERS.map((one) => one.id)];
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  for (const id of ids) {
    const one = describePackage(id, projects);
    const picture = await pictureOf(one);
    await page.setContent(socialPage(one, picture), { waitUntil: "load" });
    const file = join(out, `${id}.png`);
    writeFileSync(file, await page.screenshot({ type: "png" }));
    console.log(`ok   ${file}${picture ? "" : " (no picture found: words only)"}`);
  }
  await browser.close();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
