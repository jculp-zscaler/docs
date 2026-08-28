# Documentation project instructions

## About this project

- Mintlify docs site for the **Zenith Design System (ZDS)** — a fictional design system built as a POC for Zscaler's design-system evaluation.
- Pages are MDX files with YAML frontmatter. Configuration lives in `docs.json`.
- **All content must stay fictional.** No live Zscaler product data, screenshots, or documentation. Only the public brand shell (logo, GT Haptik fonts, brand blue) is reused. The blue is `#2066EE` — the brand's `#226BF5` nudged one step darker so text-on-light passes WCAG AA (4.78:1 vs 4.47:1); don't "correct" it back.

## JSX sandbox rules (interactive components)

Interactive React components live in `/snippets/*.jsx` and render live in MDX. The sandbox has hard constraints:

- Arrow functions only — the `function` keyword is not supported in snippets.
- Named exports only (`export const Foo = ...`); no default exports.
- Hooks (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useContext`, `useReducer`) are pre-injected — never import them.
- **No cross-snippet imports.** A snippet cannot import another snippet. Each playground file is fully self-contained and intentionally duplicates its small knob-primitive block (`KnobSelect`, `KnobToggle`, `KnobText`). Do not "refactor" this duplication away — it isolates failures to one page.
- No npm packages, no JSON imports, no `React.lazy`/dynamic imports.

## CSS conventions

- `styles/zds.css` holds the mock design system: tokens as CSS custom properties (`--zds-*`) on `:root`, redefined under `.dark`, plus component classes strictly namespaced `.zds-*`. All component visuals live here — snippets contain state and markup only.
- `styles/theme.css` holds Mintlify chrome overrides only (documented ID/element selectors like `#navbar`, `sidebar-group`, `card`).
- **No Tailwind arbitrary values** (e.g. `w-[350px]`) — they silently fail. Use real CSS in `zds.css` or standard Tailwind utilities for coarse layout only.

## Content conventions

- Mock package: `@zenith/ui`. Mock Jira project key: `DS` (always unlinked inline code, e.g. `` `DS-214` ``). Mock Confluence space: `ZDS`.
- Never use "POC", "preview", "demo", or "clone" language in rendered pages — the site reads as ZDS's real documentation.
- Use active voice, second person, sentence-case headings. Bold for UI elements, code formatting for file names/commands/tokens.
- The changelog page must stay in default page mode (tag filters are hidden in wide/center/custom modes).
