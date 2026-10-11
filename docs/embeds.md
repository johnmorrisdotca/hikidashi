# Japanese text embeds

The shared builder provides furigana, era-year and numeral makers and all host formats, with complete attribute coverage and explicit host-only callback reasons. Copied code uses the installed package's major version. Inputs and presentation choices, including cleared defaults, stay in the URL.

Furigana takes text and reading, runs segmentWord and draws native ruby/rt with a parenthesis fallback. Era takes value (a full ISO date, western year or Japanese era year), format japanese/romaji and gannen (default on). Numerals takes value, mode write/read/parse and formal (default off); the existing Japanese/English number parsers and Japanese writer/readings do the work. False/off/no/0 disable booleans.

Each tag also supports native lang, theme auto/light/dark, size small/medium/large (320/480/640px), width in pixels and label. Every attribute has a reflected property. Label and width restore their previous host values when removed. Text is inserted as text nodes, never HTML. Each result is announced politely; invalid input gives a visible status and an error event. Native ruby remains selectable and uses its normal accessible semantics. No animation, storage, timers or external runtime service is used.

result is WordSegment[], EraYear, a number, a string or null. options supplies onChange(result) and onError({ message }) callbacks. hikidashi-change and hikidashi-load carry { kind, valid }; hikidashi-error carries a fixed { kind, message }. Full results remain in the local getter/callback, never public events or frame messages. All native events bubble, cross shadow roots and carry JSON-safe copies. defineFurigana, defineEra and defineNumerals accept a custom tag and optional registry, leave existing definitions alone and safely do nothing on a server. Custom tags use subclasses.

Frames live at embed/furigana/, embed/era/ and embed/numerals/; embed/ redirects to furigana and preserves the query. Each frame validates enum values, bounded widths, boolean aliases and input length before setting attributes. Text remains plain text; invalid conversion input shows a status. Frames use noindex, device colour-scheme, transparent margins and no document scrolling. They forward { type, detail } messages; hosts should verify the sender's origin and frame. Copied imports use jsDelivr; the frame itself loads local package files.

The docs-site guide is [Embed text tools](guides/embed-text-tools.md), with a [Japanese guide](guides/ja/embed-text-tools.md).
