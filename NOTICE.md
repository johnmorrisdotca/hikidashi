# Notice

The published package (`@johnmorrisdotca/hikidashi`) is code only, MIT, and contains no third-party data. This file
credits the one small thing in the repository that is not the author's own writing.

## The demo's grade table (`demo/demo.js`, not published to npm)

The demo's *Sentence difficulty* panel needs a grade for each kanji so that it can show `kanjiCost` working. It uses a
table of the school grade (1 to 3) of 31 elementary-school kanji, typed in by hand. A kanji's grade is a fact set by
Japan's Ministry of Education (学年別漢字配当表), and each value was checked against KANJIDIC2 on 2026-10-01. No
KANJIDIC2 text, file or format is copied.

| | |
| --- | --- |
| Checked against | KANJIDIC2, release 2026-268 |
| Publisher | Electronic Dictionary Research and Development Group (EDRDG) |
| Address | https://www.edrdg.org/wiki/index.php/KANJIDIC_Project |
| Licence | CC BY-SA 4.0, https://www.edrdg.org/edrdg/licence.html (read 2026-10-01) |

The package itself has no table: grades and frequency ranks are passed in by the caller, and KANJIDIC2 is where they
are found. If you use KANJIDIC2 with this package, its licence (attribution, share-alike, and a monthly update for a
web server) is yours to follow.

## The demo's dictionary (`demo/demo.js`)

The thirteen words of the demo's extraction panel are everyday words typed in by the author. They are not taken from
any dictionary.
