# TypeScript Template

A minimal TypeScript project template with a complete build, format,
lint, and test toolchain. The code does nothing useful — it’s a starting
point for new projects.

The lint/format toolchain lives in
[ts-canon](https://github.com/SynthLuvr/ts-canon): one devDependency
that bundles biome, oxlint (+ tsgolint), ast-grep rules,
convert-to-arrow, jscpd, and the pandoc/peer-dep/audit helpers, and
ships the canonical biome, tsconfig, and vitest presets. This repo keeps
only `typescript` and the vitest packages as direct devDependencies.

## Tech Stack

| Tool | Purpose |
|----|----|
| [pnpm](https://pnpm.io) | Package manager |
| [ts-canon](https://github.com/SynthLuvr/ts-canon) | The shared lint/format/doctor toolchain |
| [TypeScript](https://www.typescriptlang.org) | Type checking (`tsc --noEmit`) |
| [Vitest](https://vitest.dev) | Test runner (unit + integration) |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | Coverage provider + 80% threshold |
| [pandoc](https://pandoc.org) | Markdown formatter (GFM); system dependency |

Bundled inside ts-canon: Biome (primary formatter/linter), oxlint
(secondary type-aware linter), ast-grep (structural rules),
convert-to-arrow (`function` → arrow codemod), and jscpd
(code-duplication detection).

## Prerequisites

- [Node.js](https://nodejs.org) 26 and [pnpm](https://pnpm.io) (enforced
  via `engines`; `.node-version` pins the major for fnm/nvm/asdf)
- [pandoc](https://pandoc.org) ≥ 3.10 — required by the markdown
  lint/format steps; `pnpm exec ts-canon doctor` verifies it
- `bash` on `PATH` — pnpm runs scripts through it (see [Windows
  notes](#windows-notes)); Git for Windows provides it

The toolchain runs on Linux, macOS, and Windows; line endings are
normalized to LF via `.gitattributes`, and pandoc is invoked with
`--eol=lf` so its output stays LF on Windows too.

### Windows notes

On Windows, pnpm installs three shims per binary in `node_modules/.bin`:
a POSIX shell script, a `.CMD` batch file, and a `.ps1`. Managed Windows
hosts commonly enforce an AppLocker script policy that blocks `.cmd` and
`.ps1` files under the user profile, which takes out every `.CMD` shim —
and `cmd.exe` is the shell pnpm reaches for by default.

ts-canon sidesteps this: it resolves every bundled tool from
`node_modules` by absolute path — the tool’s real entry point, read from
its package `bin` field — and spawns it directly, never through a shell
or a shim. pnpm itself is spawned via `npm_execpath`, and tsgolint is
handed to oxlint via `OXLINT_TSGOLINT_PATH`. `scriptShell: bash` in
`pnpm-workspace.yaml` keeps the remaining `pnpm <script>` invocations
off the `.CMD` shims.

pnpm itself is a shim too, so on such a host drive the toolchain from
Git Bash rather than PowerShell.

## Quick Start

``` bash
pnpm install
pnpm build    # type-check with tsc
pnpm test     # run unit tests (coverage gated)
```

## Scripts

### Build

| Script       | Description                                         |
|--------------|-----------------------------------------------------|
| `pnpm build` | Type-check the project with `tsc` (no output files) |

### Lint

`pnpm lint` runs `ts-canon lint`, which runs every check in order and
fails fast on the first non-zero step:

1.  Biome check (format + lint + import order)
2.  oxlint with type-aware rules (tsgolint), warnings denied
3.  ast-grep: no inline exports, no function declarations, no leading
    file comments
4.  pandoc: markdown must be GFM-formatted
5.  `pnpm peers check` (skipped without a lockfile)
6.  `pnpm audit --prod` (skipped with `--fast`)
7.  jscpd: code duplication, 5% threshold (skipped with `--fast`)

Both `lint` and `format` accept path arguments, e.g.
`pnpm lint -- packages/foo`, and `--fast` skips the slow audit/jscpd
steps.

### Format

`pnpm format` runs `ts-canon format`, which runs every formatter in
order (each step’s output is the next step’s input):

1.  `convert-to-arrow` — rewrite `function` declarations to arrow consts
2.  ast-grep strip single-statement braces
3.  Biome format
4.  Biome check (lint + format auto-fix)
5.  pandoc — reformat markdown to canonical GFM

### Doctor

`pnpm exec ts-canon doctor` verifies the environment: pandoc (≥ 3.10),
node (≥ 24), pnpm, the bundled tools, and the project-local
`typescript`.

### Test

| Script            | Description                                  |
|-------------------|----------------------------------------------|
| `pnpm test`       | Run unit tests with coverage (80% threshold) |
| `pnpm test:watch` | Watch mode                                   |

`pnpm test` enforces an 80% coverage threshold (statements, branches,
functions, lines) via `@vitest/coverage-v8`; `pnpm test:watch` runs
without coverage.

## Coding Conventions

These are **enforced** by the toolchain, not just preferences:

- **Arrow functions only** — no `function` declarations
  (`convert-to-arrow` + ast-grep rule)
- **Separate exports** — no inline `export` keywords (ast-grep rule)
- **Single-statement brace stripping** — `if`/`for`/`while` with one
  body line drop braces (ast-grep rule)
- **Double quotes**, 2-space indent, 80-char width, trailing commas,
  semicolons (Biome preset)
- **ESM only** (`"type": "module"`)
- **Markdown via pandoc** — all `.md` formatted with `pandoc -t gfm`

## Project Structure

    ├── .github/workflows/     # CI
    ├── src/
    │   ├── index.ts           # Trivial module (replace with your code)
    │   └── tests/             # Unit and integration tests
    ├── biome.json             # Extends ts-canon/presets/biome.preset.json
    ├── .node-version          # Node major, for fnm/nvm/asdf
    ├── .oxlintrc.json         # oxlint type-aware rules
    ├── pnpm-workspace.yaml    # pnpm settings (incl. scriptShell)
    ├── sgconfig.yml           # Points ast-grep at ts-canon's rules
    ├── tsconfig.json          # Extends ts-canon/presets/tsconfig.base.json
    └── vitest.config.ts       # Test config (mirrors ts-canon's preset)

Rule/config changes happen in ts-canon, not here: bump the ts-canon
version and the whole toolchain moves together. A local `biome.json`
that `extends` the preset can override anything repo-specific.
