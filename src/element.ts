import { segmentWord, type WordSegment } from "./align.ts";
import { eraOnDate, eraYearOf, parseEraYear, formatEraYearJapanese, formatEraYearRomaji, type EraYear } from "./wareki.ts";
import { parseJapaneseNumber, parseEnglishNumber, writeJapaneseNumber, readJapaneseNumber } from "./numerals.ts";
const ElementBase = typeof HTMLElement === "undefined" ? class {} as typeof HTMLElement : HTMLElement;
const common = ["lang", "theme", "size", "width", "label"];
const isOn = (value: string | null, fallback = false): boolean => value === null ? fallback : !["off", "false", "no", "0"].includes(value.trim().toLowerCase());
/**
 * The structured result of a text-tool element, or null when its input cannot be read.
 * @example
 * ```ts
 * import type { HikidashiResult } from "@johnmorrisdotca/hikidashi/element";
 * const result: HikidashiResult = 120000000;
 * console.log(result);
 * ```
 */
export type HikidashiResult = WordSegment[] | EraYear | number | string | null;
/**
 * Host callbacks for a text-tool element. Native events carry the same result or message.
 * @example
 * ```ts
 * import type { HikidashiElementOptions } from "@johnmorrisdotca/hikidashi/element";
 * const options: HikidashiElementOptions = { onChange: result => console.log(result) };
 * console.log(typeof options.onChange);
 * ```
 */
export type HikidashiElementOptions = {
  /** Called after input or presentation changes, with the result or null. */
  onChange?: (result: HikidashiResult) => void;
  /** Called with a plain message when the input cannot be read. */
  onError?: (detail: { message: string }) => void;
};
/**
 * Host options checked by the builder's coverage contract.
 * @example
 * ```ts
 * import { HIKIDASHI_EMBED_OPTION_KEYS } from "@johnmorrisdotca/hikidashi/element";
 * console.log(HIKIDASHI_EMBED_OPTION_KEYS);
 * ```
 */
export const HIKIDASHI_EMBED_OPTION_KEYS = Object.keys({ onChange: true, onError: true } satisfies Record<keyof HikidashiElementOptions, boolean>);
class TextTool extends ElementBase {
  #result: HikidashiResult = null;
  #options: HikidashiElementOptions = {};
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  protected kind: "furigana" | "era" | "numerals" = "furigana";
  /** The structured conversion result, or null for invalid input. */
  get result(): HikidashiResult { return this.#result; }
  /** Host callbacks; assigning them does not repeat a conversion. */
  get options(): HikidashiElementOptions { return this.#options; }
  set options(value: HikidashiElementOptions) { this.#options = value ?? {}; }
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }
  /** The theme attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | null) { this.#write("theme", value); }
  /** The display size attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | null) { this.#write("size", value); }
  /** The pixel width attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | null) { this.#write("width", value); }
  /** The spoken label attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | null) { this.#write("label", value); }
  connectedCallback(): void { this.#render(); }
  attributeChangedCallback(): void { if (this.isConnected) this.#render(); }
  protected write(name: string, value: unknown): void { this.#write(name, value); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size"), pixels = this.hasAttribute("width") && Number.isFinite(width) && width > 0 ? Math.min(width, 2000) : size === "small" ? 320 : size === "large" ? 640 : size === "medium" ? 480 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }
  #render(): void {
    this.#frame(); const doc = this.ownerDocument, output = doc.createElement("div"), style = doc.createElement("style"); output.className = "hk-result"; output.setAttribute("aria-live", "polite");
    this.setAttribute("data-hikidashi-embed", "");
    style.textContent = '[data-hikidashi-embed]>.hk-result{font:24px/1.8 system-ui,sans-serif;color:light-dark(#1f2320,#ece8dc);overflow-wrap:anywhere;padding:12px;box-sizing:border-box}[data-hikidashi-embed][size="small"]>.hk-result{font-size:18px}[data-hikidashi-embed][size="large"]>.hk-result{font-size:32px}[data-hikidashi-embed] rt{font-size:.55em}';
    let result: HikidashiResult = null;
    try {
      if (this.kind === "furigana") {
        const text = this.getAttribute("text") ?? "食べる", reading = this.getAttribute("reading") ?? "たべる";
        result = segmentWord(text, reading);
        if (result !== null) for (const part of result) {
          if (part.kind !== "kanji") output.append(doc.createTextNode(part.text));
          else { const ruby = doc.createElement("ruby"), rt = doc.createElement("rt"), left = doc.createElement("rp"), right = doc.createElement("rp"); ruby.append(doc.createTextNode(part.text)); left.textContent = "("; right.textContent = ")"; rt.textContent = part.reading; ruby.append(left, rt, right); output.append(ruby); }
        }
      } else if (this.kind === "era") {
        const value = (this.getAttribute("value") ?? "2019-05-01").trim();
        result = /^\d{4}-\d{2}-\d{2}$/.test(value) ? eraOnDate(value) : /^\d{4}$/.test(value) ? eraYearOf(Number(value)) : parseEraYear(value);
        if (result !== null) output.textContent = this.getAttribute("format") === "romaji" ? formatEraYearRomaji(result) : formatEraYearJapanese(result, { gannen: isOn(this.getAttribute("gannen"), true) });
      } else {
        const value = (this.getAttribute("value") ?? "12345").trim(), mode = this.getAttribute("mode") ?? "write";
        const number = parseJapaneseNumber(value) ?? parseEnglishNumber(value);
        if (number !== null) result = mode === "parse" ? number : mode === "read" ? readJapaneseNumber(number) : writeJapaneseNumber(number, { formal: isOn(this.getAttribute("formal")) });
        if (result !== null) output.textContent = String(result);
      }
      if (result === null) throw new RangeError((this.getAttribute("lang") ?? doc.documentElement.lang) === "ja" ? "入力を読み取れません。値を確認してください。" : "The input could not be read. Check the value.");
      this.#result = result; this.replaceChildren(style, output); this.#options.onChange?.(result);
      const detail = JSON.parse(JSON.stringify({ kind: this.kind, result }));
      this.dispatchEvent(new CustomEvent("hikidashi-change", { bubbles: true, composed: true, detail })); this.dispatchEvent(new CustomEvent("hikidashi-load", { bubbles: true, composed: true, detail }));
    } catch (error) {
      this.#result = null; const message = error instanceof Error ? error.message : String(error); output.setAttribute("role", "status"); output.textContent = message; this.replaceChildren(style, output); this.#options.onError?.({ message });
      this.dispatchEvent(new CustomEvent("hikidashi-error", { bubbles: true, composed: true, detail: { message } }));
    }
  }
}
/**
 * Displays a word with its reading shared over its kanji as native ruby markup.
 * @example
 * ```ts
 * import { HikidashiFurigana } from "@johnmorrisdotca/hikidashi/element";
 * console.log(HikidashiFurigana.observedAttributes.includes("reading"));
 * ```
 */
export class HikidashiFurigana extends TextTool {
  static observedAttributes = [...common, "text", "reading"];
  /** The word to annotate, reflected. */
  get text(): string | null { return this.getAttribute("text"); }
  set text(value: string | null) { this.write("text", value); }
  /** Its reading, reflected. */
  get reading(): string | null { return this.getAttribute("reading"); }
  set reading(value: string | null) { this.write("reading", value); }
}
/**
 * Displays a Japanese era year from a date, a western year or an era year.
 * @example
 * ```ts
 * import { HikidashiEra } from "@johnmorrisdotca/hikidashi/element";
 * console.log(HikidashiEra.observedAttributes.includes("value"));
 * ```
 */
export class HikidashiEra extends TextTool {
  protected override kind = "era" as const;
  static observedAttributes = [...common, "value", "format", "gannen"];
  /** The input date or year, reflected. */
  get value(): string | null { return this.getAttribute("value"); }
  set value(value: string | null) { this.write("value", value); }
  /** Japanese or romaji output, reflected. */
  get format(): string | null { return this.getAttribute("format"); }
  set format(value: string | null) { this.write("format", value); }
  /** Whether the first era year is written 元年, reflected. */
  get gannen(): string | null { return this.getAttribute("gannen"); }
  set gannen(value: string | boolean | null) { this.write("gannen", value); }
}
/**
 * Writes, reads aloud or parses a Japanese numeral using the package's number tools.
 * @example
 * ```ts
 * import { HikidashiNumerals } from "@johnmorrisdotca/hikidashi/element";
 * console.log(HikidashiNumerals.observedAttributes.includes("formal"));
 * ```
 */
export class HikidashiNumerals extends TextTool {
  protected override kind = "numerals" as const;
  static observedAttributes = [...common, "value", "mode", "formal"];
  /** The numeral or number to convert, reflected. */
  get value(): string | null { return this.getAttribute("value"); }
  set value(value: string | number | null) { this.write("value", value); }
  /** Write, read aloud or parse, reflected. */
  get mode(): string | null { return this.getAttribute("mode"); }
  set mode(value: string | null) { this.write("mode", value); }
  /** Formal contract numerals, reflected. */
  get formal(): string | null { return this.getAttribute("formal"); }
  set formal(value: string | boolean | null) { this.write("formal", value); }
}
/**
 * Defines a furigana tag once, optionally under a host's name. Safe on a server.
 * @param tagName - The custom tag name; hikidashi-furigana by default.
 * @param registry - The page's registry, or undefined on a server.
 * @returns Nothing; an existing definition is left in place.
 * @example
 * ```ts
 * import { defineFurigana } from "@johnmorrisdotca/hikidashi/element";
 * defineFurigana();
 * console.log(typeof defineFurigana);
 * ```
 */
export function defineFurigana(tagName = "hikidashi-furigana", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "hikidashi-furigana" ? HikidashiFurigana : class extends HikidashiFurigana {}); }
/**
 * Defines an era-year tag once, optionally under a host's name. Safe on a server.
 * @param tagName - The custom tag name; hikidashi-era by default.
 * @param registry - The page's registry, or undefined on a server.
 * @returns Nothing; an existing definition is left in place.
 * @example
 * ```ts
 * import { defineEra } from "@johnmorrisdotca/hikidashi/element";
 * defineEra();
 * console.log(typeof defineEra);
 * ```
 */
export function defineEra(tagName = "hikidashi-era", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "hikidashi-era" ? HikidashiEra : class extends HikidashiEra {}); }
/**
 * Defines a numeral tag once, optionally under a host's name. Safe on a server.
 * @param tagName - The custom tag name; hikidashi-numerals by default.
 * @param registry - The page's registry, or undefined on a server.
 * @returns Nothing; an existing definition is left in place.
 * @example
 * ```ts
 * import { defineNumerals } from "@johnmorrisdotca/hikidashi/element";
 * defineNumerals();
 * console.log(typeof defineNumerals);
 * ```
 */
export function defineNumerals(tagName = "hikidashi-numerals", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "hikidashi-numerals" ? HikidashiNumerals : class extends HikidashiNumerals {}); }
