/** Hiragana written as katakana: ひらがな to ヒラガナ. Anything that is not a hiragana letter is left as it is. */
export function hiraganaToKatakana(value: string): string {
  return value.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

/** Katakana written as hiragana: カタカナ to かたかな. The long-vowel mark ー and anything else that is not a katakana letter are left as they are. */
export function katakanaToHiragana(value: string): string {
  return value.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}
