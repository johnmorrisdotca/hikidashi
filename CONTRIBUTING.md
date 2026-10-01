# Contributing

Ideas, bug reports and pull requests are welcome in the
[issues](https://github.com/johnmorrisdotca/hikidashi/issues).

## Working on it

```sh
pnpm install
pnpm check          # lint, types and tests
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play it in a real browser
pnpm docs:make      # rewrite docs/strings-ja.md after changing a word of the demo
```

A change to what a function answers is a change to every page that asks it: add the case to its test first, and
say in `CHANGELOG.md` which answers move. A new answer to something that was `null` is a minor version; a different
answer to something that was answered is a major one.

The drawers carry no data. A dictionary, a grade table or a word list belongs in the page that uses the package, passed
in as an argument. Anything in `demo/` that looks like data is there to show a function working, and is credited in
`NOTICE.md`.

## House rules, shared by every package of the family

- Open an issue first for anything bigger than a typo, so that we can agree on the shape before you spend time on it.
- No runtime dependencies. Every function is pure: it returns new values and never changes what it was given.
- Tests sit beside the code they test. A rule you change has a test that would have caught it.
- Words a person reads come in English and Japanese. If you cannot write the Japanese, say so in the pull request and someone will.
- Option values and names are kebab case.
- Art and sound are CC0 or public domain only, checked at the source, and credited in the README. No GPL or LGPL code.
- Needs Node 22 or later. A change a user would notice gets a line in `CHANGELOG.md`.
- **The list of the family in the README is made, not written.** `pnpm family:readme` writes it between its
  markers from `scripts/family-template.mjs` (the names, the Japanese names and a line on each), and
  `scripts/family-readme.mjs` is the same file in every package. To add a package or change a line, change the
  template in every repository, bump `FAMILY_TEMPLATE_VERSION` and record the new hash in `src/family.test.js`.

## Releasing

A version tag (`v1.2.3`, the same as `package.json`'s version) runs
`.github/workflows/release.yml`: it checks and builds the package, attaches the
tarball to a GitHub release, and publishes it to npm by trusted publishing,
with no token. Write the release in `CHANGELOG.md` first.
