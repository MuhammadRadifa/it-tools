# AGENTS.md

Client-side-only Vue 3 SPA (no backend, API, or DB): every tool runs fully in the browser. Each tool owns `src/tools/<tool-name>/`, is registered in `src/tools/index.ts`, gets a route at `/<tool-name>` via `src/router.ts`, and renders through `src/layouts/tool.layout.vue`.

## Commands

- pnpm only (`packageManager: pnpm@9.11.0`).
- `pnpm dev` / `pnpm build` (build runs `vue-tsc --noEmit` first) / `pnpm preview` (port 5050).
- `pnpm lint` lints `src/` only; `pnpm typecheck` runs `vue-tsc` with `tsconfig.vitest.json` (covers tests).
- `pnpm test` = Vitest, jsdom. Locally it starts in watch mode; for one file: `pnpm exec vitest run --environment jsdom src/tools/<tool>/<tool>.service.test.ts`.
- E2E: `pnpm test:e2e` serves the built app (`npm run preview` on :5050), so run `pnpm build` first; install browsers once with `pnpm exec playwright install --with-deps`. One test: `pnpm test:e2e src/tools/<tool>/<tool>.e2e.spec.ts --project=chromium`. For a live dev server instead: `pnpm test:e2e:dev` (expects `pnpm dev` on :5173).
- CI order (`.github/workflows/ci.yml`): lint → test → typecheck → build.

## Tool conventions

- `pnpm run script:create:tool <name>` scaffolds `src/tools/<name>/` and adds the import to `src/tools/index.ts`, but you must still add the tool to a category inside `toolsByCategory` (same file) or it has no route.
- `defineTool()` (`src/tools/tool.ts`) takes `path`, `name`, `keywords`, lazy `component`; `isNew` is derived from `createdAt` (marked new for 2 weeks).
- Tool title/description translate via `tools.<tool-path>.title` / `.description` in `locales/*.yml`; the literal `name`/`description` from `defineTool` is the fallback.
- Keep logic in `<name>.service.ts` (unit-testable) and UI in `<name>.vue`.
- Tests are co-located and named `<name>.service.test.ts` (Vitest, explicit `import { describe, expect, it } from 'vitest'`, no globals) and `<name>.e2e.spec.ts` (Playwright, select with the `data-test-id` attribute). Vitest excludes `**/*.e2e.spec.ts`; Playwright scans `./src`.
- UI components live in `src/ui/c-*/` (scaffold: `pnpm run script:create:ui`). A co-located `<name>.demo.vue` is auto-registered as a dev-only route at `/c-lib/<name>`. `.md` files are valid SFCs too (`vite-plugin-vue-markdown`).

## Quirks an agent will get wrong

- Auto-imports are everywhere: `ref`, `computed`, `toRefs`, `useI18n`, `@vueuse/core`, naive-ui composables, plus components (`c-*` from `src/`, `n-*` Naive UI, `icon-*` icons) need no imports. `auto-imports.d.ts`, `components.d.ts`, and `.eslintrc-auto-import.json` are generated — never edit by hand; they regenerate on dev/build.
- ESLint (`@antfu` + overrides in `.eslintrc.cjs`): semicolons are required (opposite of antfu default), `curly: all`, and `useClipboard` from `@vueuse/core` is import-banned — use `useCopy` from `@/composable/copy.ts`.
- Styling is UnoCSS utility classes in templates plus scoped `<style lang="less">`; `@` aliases `src/`.
- Runtime config/env lives in `src/config.ts` (figue): `BASE_URL`, `VITE_*`; `PACKAGE_VERSION` is statically injected in `vite.config.ts`.
- `locales/` has one YAML per language (en is the base). `scripts/build-locales-files.mjs` scaffolds missing locale files but imports from `bun` — run it with Bun, not Node.
- `pnpm release` (zx, prompts interactively) creates a calver version + tag and parses conventional commits — keep commit subjects as `type(scope): ...`.
- Never feed user input to `v-html`/`innerHTML` unsanitized; markdown rendering in `c-markdown.vue` is DOMPurify-sanitized — keep it that way when adding renderers.
