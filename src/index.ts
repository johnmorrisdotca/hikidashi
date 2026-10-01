/**
 * Hikidashi 引き出し: a drawer of small Japanese text tools. 和暦 era years and dates both ways; kanji
 * numerals both ways, read aloud and in formal 大字; the dictionary forms a conjugated verb or adjective
 * could come from; a word's reading shared out over its kanji, and a かん字テスト made from it; Japanese
 * words and kanji pulled out of pasted text; and how hard a sentence is to read. Pure functions, no
 * dictionary or data of their own, and no dependencies. Each drawer is also an entry of its own, so a
 * page imports only the one it needs: `@johnmorrisdotca/hikidashi/wareki`, `/numerals`, `/deinflect`,
 * `/align`, `/extract` and `/difficulty`.
 */
export * from "./wareki.ts";
export * from "./numerals.ts";
export * from "./deinflect.ts";
export * from "./align.ts";
export * from "./extract.ts";
export * from "./difficulty.ts";
export { VERSION } from "./version.ts";
