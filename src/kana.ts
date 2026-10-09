/**
 * Hiragana written as katakana: ひらがな to ヒラガナ. Anything that is not a hiragana letter is left as it is.
 *
 * @param value - Any text.
 * @returns The same text with every hiragana letter (ぁ to ゖ) written as its katakana.
 * @example
 * ```ts
 * import { hiraganaToKatakana } from "@johnmorrisdotca/hikidashi/align";
 *
 * console.log(hiraganaToKatakana("ひらがな"), hiraganaToKatakana("すし 2つ"));
 * ```
 */
export function hiraganaToKatakana(value: string): string {
  return value.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

/**
 * Katakana written as hiragana: カタカナ to かたかな. The long-vowel mark ー and anything else that is not a katakana
 * letter are left as they are.
 *
 * @param value - Any text.
 * @returns The same text with every katakana letter (ァ to ヶ) written as its hiragana.
 * @example
 * ```ts
 * import { katakanaToHiragana } from "@johnmorrisdotca/hikidashi/align";
 *
 * console.log(katakanaToHiragana("カタカナ"), katakanaToHiragana("コーヒー"));
 * ```
 */
export function katakanaToHiragana(value: string): string {
  return value.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}
