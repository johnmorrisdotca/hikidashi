import { describe, expect, it } from "vitest";

import { hiraganaToKatakana, katakanaToHiragana } from "./kana.ts";

describe("kana in the other script", () => {
  it("turns hiragana into katakana, and back", () => {
    expect(hiraganaToKatakana("ひらがな")).toBe("ヒラガナ");
    expect(katakanaToHiragana("カタカナ")).toBe("かたかな");
    expect(katakanaToHiragana(hiraganaToKatakana("がっこうでんしゃ"))).toBe("がっこうでんしゃ");
  });

  it("leaves everything else as it is, the long-vowel mark included", () => {
    expect(katakanaToHiragana("コーヒー abc 漢字 123")).toBe("こーひー abc 漢字 123");
    expect(hiraganaToKatakana("こーひー abc 漢字 123")).toBe("コーヒー abc 漢字 123");
    expect(katakanaToHiragana("")).toBe("");
  });

  it("turns the small and voiced letters too", () => {
    expect(katakanaToHiragana("ァィゥェォッャュョヴ")).toBe("ぁぃぅぇぉっゃゅょゔ");
    expect(hiraganaToKatakana("ぁぃぅぇぉっゃゅょゔ")).toBe("ァィゥェォッャュョヴ");
  });
});
