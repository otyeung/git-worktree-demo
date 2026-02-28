# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-28
**Commit:** cb53942
**Branch:** master

## OVERVIEW

SalesPilot CRM landing page — React 18 + Vite 6 SPA. Config-driven marketing site with dark theme, glassmorphism UI, full responsive design. Traditional Chinese (zh-Hant) copy.

## STRUCTURE

```
.
├── index.html              # HTML entry (zh-Hant, Google Fonts preload)
├── vite.config.js          # Dev server port 3000, auto-open
├── package.json            # pnpm, ES modules, no test/lint scripts
├── src/
│   ├── main.jsx            # React 18 createRoot entry
│   ├── App.jsx             # Root orchestrator — imports all sections sequentially
│   ├── index.css           # MONOLITHIC design system (1245 lines, CSS custom properties)
│   ├── components/         # 8 presentational sections (only Navbar has state)
│   └── data/               # 7 JS config modules — ALL copy/content lives here
└── .agent/workflows/       # Git worktree spec executor workflow
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Change any copy/text | `src/data/*.js` | Never edit components for content changes |
| Add new page section | `src/components/` + `src/data/` + `App.jsx` | Create component, data file, import in App |
| Change colors/spacing/fonts | `src/index.css` `:root` block (lines 1–80) | CSS custom properties design system |
| Change component styling | `src/index.css` | BEM-like classes, all styles centralized |
| Add interactivity | `src/components/*.jsx` | Only Navbar uses `useState`; rest are stateless |
| Build for production | `pnpm build` | Outputs to `dist/` |
| Worktree feature workflow | `.agent/workflows/exec-worktree-spec.md` | Reads `git-worktree-spec.md` from root |

## CONVENTIONS

- **Config-driven content**: Components render data from `src/data/`; copy changes never touch component code
- **Single CSS file**: All styles in `index.css` using CSS custom properties — no CSS modules, no Tailwind, no styled-components
- **BEM-like naming**: `navbar__inner`, `navbar__nav--open`, `hero__stats-item`
- **CSS variables**: kebab-case 3-segment (`--color-primary`, `--space-8`, `--radius-md`)
- **Components**: PascalCase files, default exports, functional components only
- **Data files**: camelCase files, named exports (e.g., `BRAND`, `NAV_LINKS`, `FEATURES`)
- **No routing**: Single-page with anchor links (`#features`, `#pricing`)
- **No TypeScript**: Pure JSX — intentional for simplicity
- **Package manager**: pnpm (not npm/yarn)
- **4-space indentation** in JSX files

## ANTI-PATTERNS (THIS PROJECT)

- **Do NOT** add CSS modules or component-scoped styles — all CSS is centralized in `index.css`
- **Do NOT** hardcode text in components — content belongs in `src/data/`
- **Do NOT** add React Router — this is a single-page landing, navigation is anchor-based
- **Do NOT** add state management (Redux, Zustand) — stateless presentational components by design
- **Do NOT** convert to TypeScript without explicit request — JSX chosen intentionally

## COMMANDS

```bash
pnpm install      # Install dependencies
pnpm dev          # Dev server → http://localhost:3000 (auto-opens)
pnpm build        # Production build → dist/
pnpm preview      # Preview production build
```

## NOTES

- No linter, formatter, or type checker configured — code style enforced by convention only
- No tests exist — no testing framework installed
- No CI/CD pipeline — manual deployment
- `index.css` is 1245 lines — the heaviest file; contains full design system + all component styles
- `.gitignore` excludes `git-worktree-spec.md` (ephemeral spec files for worktree workflows)
- `excalidraw.log` in root is a stray artifact
- Accessibility: semantic HTML, `aria-label`, `aria-expanded`, `role` attributes used throughout
