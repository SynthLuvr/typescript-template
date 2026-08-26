# TypeScript Template

A minimal TypeScript project template with a complete build, format,
lint, and test toolchain. The code does nothing useful — it’s a starting
point for new projects.

## Tech Stack

| Tool | Purpose |
|----|----|
| [pnpm](https://pnpm.io) | Package manager |
| [TypeScript](https://www.typescriptlang.org) | Type checking (`tsc --noEmit`) |
| [Biome](https://biomejs.dev) | Primary formatter and linter |
| [oxlint](https://oxc.rs/docs/guide/usage/linter) | Secondary type-aware linter |
| [ast-grep](https://ast-grep.github.io) | Structural lint/format rules |
| [convert-to-arrow](https://github.com/chimurai/convert-to-arrow) | Codemod: `function` → arrow consts |
| [Vitest](https://vitest.dev) | Test runner (unit + integration) |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | Coverage provider + 80% threshold |
| [jscpd](https://github.com/kucherenko/jscpd) | Code-duplication detection |
| [tsx](https://github.com/privatenumber/tsx) | Dev-time TypeScript execution |
| [npm-run-all2](https://github.com/bcomnes/npm-run-all2) | Orchestrates multi-step scripts |
| [pandoc](https://pandoc.org) | Markdown formatter (GFM) |

## Prerequisites

- [Node.js](https://nodejs.org) 26 and [pnpm](https://pnpm.io) (enforced
  via `engines`; `.node-version` pins the major for fnm/nvm/asdf)
- [pandoc](https://pandoc.org) ≥ 3.10 — required by `pnpm lint:md` /
  `pnpm format:md`
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
and `cmd.exe` is the shell pnpm reaches for by default. Three settings
keep the toolchain off that path:

- `scriptShell: bash` in `pnpm-workspace.yaml` — scripts run under bash,
  which resolves the extensionless POSIX shims instead of the `.CMD`
  ones. On Linux and macOS this is what already happens.
- Scripts call binaries by bare name (`biome check .`) rather than
  `pnpm biome check .`. pnpm already puts `node_modules/.bin` on `PATH`;
  routing back through `pnpm exec` re-resolves the binary to its `.CMD`
  shim, bypassing the shell entirely.
- `scripts/oxlint.mts` and `scripts/peer-deps.mts` resolve tsgolint and
  pnpm to real paths, so neither a shim nor a shell gets involved.

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

The `lint` script runs all linters in sequence via `npm-run-all`:

| Script                 | Description                               |
|------------------------|-------------------------------------------|
| `pnpm lint`            | Run all lint steps                        |
| `pnpm lint:biome`      | Biome check: format + lint + import order |
| `pnpm lint:oxlint`     | oxlint with type-aware rules (tsgolint)   |
| `pnpm lint:exports`    | ast-grep: no inline exports               |
| `pnpm lint:functions`  | ast-grep: no function declarations        |
| `pnpm lint:md`         | pandoc: Markdown must be GFM-formatted    |
| `pnpm lint:peer-deps`  | pnpm: no peer dependency conflicts        |
| `pnpm lint:audit`      | pnpm audit: production dependency vulns   |
| `pnpm lint:duplicates` | jscpd: code duplication (5% threshold)    |

### Format

The `format` script runs all formatters in sequence:

| Script | Description |
|----|----|
| `pnpm format` | Run all format steps |
| `pnpm format:arrows` | `convert-to-arrow` — rewrite `function` to arrow consts |
| `pnpm format:braces` | ast-grep strip single-statement braces |
| `pnpm format:biome` | Biome format with auto-fix |
| `pnpm format:check` | Biome check (lint + format auto-fix) |
| `pnpm format:md` | pandoc: reformat Markdown to canonical GFM |

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
  semicolons (Biome)
- **ESM only** (`"type": "module"`)
- **Markdown via pandoc** — all `.md` formatted with `pandoc -t gfm`
  (`lint:md`/`format:md`)

## Project Structure

    ├── .ast-grep/rules/       # Structural lint/format rules
    ├── .github/workflows/     # CI
    ├── scripts/
    │   ├── oxlint.mts         # oxlint runner (resolves tsgolint)
    │   ├── pandoc-md.mts      # Markdown lint/format via pandoc
    │   └── peer-deps.mts      # Peer dependency check
    ├── src/
    │   ├── index.ts           # Trivial module (replace with your code)
    │   └── tests/             # Unit and integration tests
    ├── biome.json             # Biome formatter + linter config
    ├── .node-version          # Node major, for fnm/nvm/asdf
    ├── .oxlintrc.json         # oxlint type-aware rules
    ├── pnpm-workspace.yaml    # pnpm settings (incl. scriptShell)
    ├── tsconfig.json          # TypeScript config
    └── vitest.config.ts       # Test config
