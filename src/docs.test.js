// The documents and the demo, held to the source. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import { WORDS } from "../demo/words.js";
import * as everything from "./index.ts";
import { ALIGN_LIMITS } from "./align.ts";
import { LONGEST_ENDING } from "./deinflect.ts";
import { EXTRACT_LIMITS } from "./extract.ts";
import { LARGEST_JAPANESE_NUMBER } from "./numerals.ts";
import { VERSION } from "./version.ts";
import { JAPANESE_ERAS } from "./wareki.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");

/** A README section's text, from its heading to the next heading of the same level. */
const section = (heading, level = "##") => {
  const from = readme.indexOf(`\n${level} ${heading}\n`);
  if (from < 0) throw new Error(`no “${level} ${heading}” in the README`);
  const next = readme.indexOf(`\n${level} `, from + 5);
  return readme.slice(from, next < 0 ? undefined : next);
};

/** The cells of every table row in a piece of text, header and rule rows left out. */
const rows = (text) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[\s|:-]+\|$/.test(line))
    .map((line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.replace(/\\\|/g, "|").trim()));

describe("the documents", () => {
  it("say the version package.json says, in the code and at the top of the changelog", () => {
    expect(VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toMatch(new RegExp(`^## \\[${pkg.version.replace(/\./g, "\\.")}\\] `, "m"));
  });

  it("name in the README every entry package.json exports, and no other", () => {
    const exported = Object.keys(pkg.exports).filter((key) => key !== ".").map((key) => `${pkg.name}/${key.slice(2)}`);
    for (const entry of exported) expect(readme, entry).toContain(`\`${entry}\``);
    const named = [...readme.matchAll(/`(@johnmorrisdotca\/hikidashi\/[\w-]+)`/g)].map((match) => match[1]);
    for (const entry of named) expect(exported, entry).toContain(entry);
  });

  it("name in the README's API table every export of every entry, so no function is undocumented", () => {
    const table = section("API");
    const entries = Object.keys(pkg.exports).filter((key) => key !== ".");
    const rowOf = (entry) => table.split("\n").find((line) => line.startsWith(`| \`${pkg.name}/${entry.slice(2)}\``));
    const all = new Set();
    for (const entry of entries) {
      const row = rowOf(entry);
      expect(row, entry).toBeDefined();
      const names = [...row.matchAll(/`([\w]+)`/g)].map((match) => match[1]);
      for (const name of names) all.add(name);
    }
    // Every runtime export of the main entry is in one of the six drawers' rows, except the version.
    for (const name of Object.keys(everything)) if (name !== "VERSION") expect(all.has(name), `${name} is not in the API table`).toBe(true);
  });

  it("keep the family's stylesheet byte for byte, as its first line's hash says", () => {
    const [first, ...rest] = readFileSync("demo/family.css", "utf8").split("\n");
    const hash = /sha256 of every line after this one: ([0-9a-f]{64})/.exec(first)?.[1];
    expect(createHash("sha256").update(rest.join("\n")).digest("hex")).toBe(hash);
  });

  it("keep the family's template naming this package among the family, as the footer lists it", () => {
    expect(readFileSync("scripts/family-template.mjs", "utf8")).toContain(`{ id: "hikidashi", name: "Hikidashi", kana: "引き出し" }`);
  });
});

describe("the README's promises", () => {
  it("has the sections a package of this family has, each with something in it", () => {
    for (const heading of ["In 30 seconds", "Who it is for", "Features", "Use it in your project", "The drawers", "API", "Limits", "Languages", "Browser and runtime support", "Roadmap", "Architecture", "The name", "Where it comes from, and where it is used", "Development", "Contributing", "Changes", "Licence"]) {
      expect(section(heading).length, heading).toBeGreaterThan(heading.length + 40);
    }
  });

  it("installs the package it is, and every version it names is the one in package.json", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    const major = pkg.version.split(".")[0];
    const named = [...readme.matchAll(/@johnmorrisdotca\/hikidashi@([\w.-]+)/g)].map((match) => match[1]);
    expect(named.length).toBeGreaterThan(0);
    for (const version of named) expect(version).toBe(major);
    expect(readme).not.toMatch(/\bhikidashi@\d+\.\d+/);
  });

  it("links only to files that exist", () => {
    const targets = [...readme.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)/g)].map((match) => match[1]);
    expect(targets.length).toBeGreaterThan(4);
    for (const target of targets) expect(existsSync(target), target).toBe(true);
  });

  it("says Node 22 or later, as package.json's engines do", () => {
    expect(pkg.engines.node).toBe(">=22");
    expect(readme).toContain("Node 22 or later");
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(17);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect(block).toContain(`The demos of all ${words[family.length]} share`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
  });

  it("gives every era with its reading, its first and last day and its years, as the code has them", () => {
    const table = rows(section("The drawers")).filter((row) => /^[明大昭平令]/.test(row[0]));
    expect(table).toHaveLength(JAPANESE_ERAS.length);
    for (const [index, era] of JAPANESE_ERAS.entries()) {
      const [name, reading, first, last, years] = table[index];
      expect(name).toBe(`${era.kanji} ${era.romaji}`);
      expect(reading).toBe(era.reading);
      expect(first).toBe(era.startDate);
      expect(last).toBe(era.endDate ?? "still running");
      expect(years).toBe(`1 to ${era.lastYear ?? 99}`);
    }
  });

  it("states the limits as the code has them", () => {
    const limits = section("Limits");
    expect(limits).toContain(`0 to ${LARGEST_JAPANESE_NUMBER.toLocaleString("en-US")}`);
    expect(limits).toContain(`${EXTRACT_LIMITS.characters.toLocaleString("en-US")} characters`);
    expect(limits).toContain(`${EXTRACT_LIMITS.wordLength} characters`);
    expect(limits).toContain(EXTRACT_LIMITS.candidates.toLocaleString("en-US"));
    expect(limits).toContain(`${ALIGN_LIMITS.word} characters; its reading ${ALIGN_LIMITS.reading}`);
    expect(LONGEST_ENDING).toBeGreaterThan(0);
    expect(readFileSync("src/deinflect.ts", "utf8")).toContain("const MAX_STEPS = 5;");
    expect(limits).toContain("5 endings deep");
    expect(readFileSync("src/wareki.ts", "utf8")).toContain("const OPEN_ERA_LIMIT = 99;");
    expect(limits).toContain("1 to 99");
  });

  it("describes the demo's two small tables as NOTICE.md counts them", () => {
    const demo = readFileSync("demo/demo.js", "utf8");
    const grades = demo.slice(demo.indexOf("const GRADES"), demo.indexOf("const COSTS"));
    const kanji = [...grades.matchAll(/"([^"]+)"/g)].reduce((sum, match) => sum + Array.from(match[1]).length, 0);
    const dictionary = demo.slice(demo.indexOf("const DICTIONARY"), demo.indexOf("const language"));
    const words = [...dictionary.matchAll(/^\s+\["/gm)].length;
    const notice = readFileSync("NOTICE.md", "utf8");
    expect(notice).toContain(`of ${kanji} elementary-school kanji`);
    expect(notice).toContain(`The ${["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"][words]} words`);
    expect(pkg.files).toContain("NOTICE.md");
    expect(pkg.dependencies).toBeUndefined();
  });

  it("carries no WaniKani, no private names and no secrets, anywhere a file is published", () => {
    for (const file of ["README.md", "NOTICE.md", "CHANGELOG.md", "demo/demo.js", "demo/words.js", ...["align", "deinflect", "difficulty", "englishNumbers", "extract", "index", "kana", "numerals", "version", "wareki"].map((name) => `src/${name}.ts`)]) {
      const text = readFileSync(file, "utf8").toLowerCase();
      for (const word of ["wanikani", "@gmail", "password", "secret", "api key", "colleague", "umakuma.com", "/users/"]) expect(text.includes(word), `${file} has “${word}”`).toBe(false);
    }
  });

  it("keeps the demo's English and Japanese words the same set, each with something to say", () => {
    const flat = (words) => Object.entries(words).flatMap(([key, value]) => (typeof value === "object" ? Object.entries(value).map(([inner, text]) => [`${key}.${inner}`, text]) : [[key, value]]));
    const en = flat(WORDS.en);
    const ja = flat(WORDS.ja);
    expect(ja.map(([key]) => key)).toEqual(en.map(([key]) => key));
    for (const [key, text] of [...en, ...ja]) expect(String(text).length, key).toBeGreaterThan(0);
    for (const [, text] of ja.filter(([key]) => !/^(pageApi)$/.test(key))) expect(/[぀-ヿ一-鿿]/.test(text), text).toBe(true);
  });

  it("keeps docs/strings-ja.md as the demo's words, English beside Japanese (pnpm docs:make rewrites it)", () => {
    const cell = (text) => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
    const lines = ["# Hikidashi's demo words, in English and Japanese", "", "Made from `demo/words.js` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.", "", "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please", "open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown.", "", "| Name | English | Japanese |", "| --- | --- | --- |"];
    for (const key of Object.keys(WORDS.en)) {
      if (typeof WORDS.en[key] === "object") for (const inner of Object.keys(WORDS.en[key])) lines.push(`| \`${key}.${inner}\` | ${cell(WORDS.en[key][inner])} | ${cell(WORDS.ja[key]?.[inner] ?? "")} |`);
      else lines.push(`| \`${key}\` | ${cell(WORDS.en[key])} | ${cell(WORDS.ja[key] ?? "")} |`);
    }
    const made = `${lines.join("\n")}\n`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });

  it("has the files a visitor looks for: issue templates, a pull request template, a security policy", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/config.yml", ".github/pull_request_template.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "LICENSE", "NOTICE.md"]) expect(existsSync(file), file).toBe(true);
    expect(readme).toContain("issues/new?template=fix-a-translation.md");
  });

  it("keeps SECURITY.md and CODE_OF_CONDUCT.md equal to the family's master text, a copy of which is kept in scripts/community", () => {
    for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) expect(readFileSync(file, "utf8"), file).toBe(readFileSync(`scripts/community/${file}`, "utf8"));
  });
});
