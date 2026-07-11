# TypeScript Template

A minimal TypeScript project template with a complete build, format,
lint, and test toolchain. The code does nothing useful — it’s a starting
point for new projects.

## Tech Stack

| Tool                                                             | Purpose                            |
|------------------------------------------------------------------|------------------------------------|
| [pnpm](https://pnpm.io)                                          | Package manager                    |
| [TypeScript](https://www.typescriptlang.org)                     | Type checking (`tsc --noEmit`)     |
| [Biome](https://biomejs.dev)                                     | Primary formatter and linter       |
| [oxlint](https://oxc.rs/docs/guide/usage/linter)                 | Secondary type-aware linter        |
| [ast-grep](https://ast-grep.github.io)                           | Structural lint/format rules       |
| [convert-to-arrow](https://github.com/chimurai/convert-to-arrow) | Codemod: `function` → arrow consts |
| [Vitest](https://vitest.dev)                                     | Test runner (unit + integration)   |
| [tsx](https://github.com/privatenumber/tsx)                      | Dev-time TypeScript execution      |
| [npm-run-all2](https://github.com/bcomnes/npm-run-all2)          | Orchestrates multi-step scripts    |
| [pandoc](https://pandoc.org)                                     | Markdown formatter (GFM)           |

## Prerequisites

- [Node.js](https://nodejs.org) 24 and [pnpm](https://pnpm.io) (enforced
  via `engines`)
- [pandoc](https://pandoc.org) ≥ 3.1 — required by `pnpm lint:md` /
  `pnpm format:md`

## Quick Start

``` bash
pnpm install
pnpm build    # type-check with tsc
pnpm test     # run unit tests
```

## Scripts

### Build

| Script       | Description                                         |
|--------------|-----------------------------------------------------|
| `pnpm build` | Type-check the project with `tsc` (no output files) |

### Lint

The `lint` script runs all linters in sequence via `npm-run-all`:

| Script                | Description                               |
|-----------------------|-------------------------------------------|
| `pnpm lint`           | Run all lint steps                        |
| `pnpm lint:biome`     | Biome check: format + lint + import order |
| `pnpm lint:oxlint`    | oxlint with type-aware rules              |
| `pnpm lint:exports`   | ast-grep: no inline exports               |
| `pnpm lint:functions` | ast-grep: no function declarations        |
| `pnpm lint:md`        | pandoc: Markdown must be GFM-formatted    |

### Format

The `format` script runs all formatters in sequence:

| Script               | Description                                             |
|----------------------|---------------------------------------------------------|
| `pnpm format`        | Run all format steps                                    |
| `pnpm format:arrows` | `convert-to-arrow` — rewrite `function` to arrow consts |
| `pnpm format:braces` | ast-grep strip single-statement braces                  |
| `pnpm format:biome`  | Biome format with auto-fix                              |
| `pnpm format:check`  | Biome check (lint + format auto-fix)                    |
| `pnpm format:md`     | pandoc: reformat Markdown to canonical GFM              |

### Test

| Script            | Description    |
|-------------------|----------------|
| `pnpm test`       | Run unit tests |
| `pnpm test:watch` | Watch mode     |

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
    ├── .github/workflows/     # CI + Copilot setup
    ├── scripts/               # Tooling scripts (pandoc-md)
    ├── src/
    │   ├── index.ts           # Trivial module (replace with your code)
    │   └── tests/             # Unit and integration tests
    ├── biome.json             # Biome formatter + linter config
    ├── .oxlintrc.json         # oxlint type-aware rules
    ├── tsconfig.json          # TypeScript config
    └── vitest.config.ts       # Test config
