---
title: Embed furigana, era years and numbers
section: how-to
order: 7
description: Add native Japanese text tools to an article or form with a custom element or a private iframe.
---

Open the [embed builder](https://johnmorrisdotca.github.io/hikidashi/builder.html),
choose furigana, an era year or a numeral, and copy the format your page accepts.
The preview uses the package's native segmentation and conversion functions.

## Put a tool in HTML

Load the definition entry once, then add any of the three elements. Text and
readings are ordinary attributes; the furigana element renders native ruby/rt.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hikidashi@1/dist/element-define.js"></script>
<hikidashi-furigana text="日本語" reading="にほんご"></hikidashi-furigana>
<hikidashi-era value="2026" lang="en"></hikidashi-era>
<hikidashi-numerals value="123" mode="write"></hikidashi-numerals>
```

## Choose display and host behaviour

Every attribute reflects as a property. Use size small/medium/large or width in
pixels, theme auto/light/dark, lang en/ja and an optional label. False/off/no/0
turn off booleans. Era gannen is on by default; numeral formal is off. Invalid
conversions show a status instead of inserting HTML. The local result getter
returns the native conversion, and options holds local callbacks.

The element entry exports defineFurigana/defineEra/defineNumerals for custom tags;
imports remain safe on a server. The builder also supplies React, Vue, Svelte,
Angular and HTML-block examples.

## Use an iframe

Frames live at embed/furigana/, embed/era/ and embed/numerals/. The builder prints
a validated URL and height. Frames use no storage and send JSON-safe load/change/
error metadata messages, without input text or conversion results. Check event.origin against the exact GitHub Pages origin and
event.source against your frame. Setup links include the text you typed; use
trusted host properties for text that must stay out of a shared link.
