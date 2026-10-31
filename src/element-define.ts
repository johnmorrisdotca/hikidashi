import { defineEra, defineFurigana, defineNumerals } from "./element.ts";

defineFurigana();
defineEra();
defineNumerals();

export * from "./element.ts";
