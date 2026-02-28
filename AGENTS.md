# AGENTS.md — SalesPilot CRM Landing Page

> React 18 + Vite 6 SPA. Config-driven marketing site with dark theme, glassmorphism UI, Traditional Chinese (zh-Hant) copy.

## COMMANDS

```bash
pnpm install        # Install deps (pnpm only — no npm/yarn)
pnpm dev            # Dev server → http://localhost:3000 (auto-opens browser)
pnpm build          # Production build → dist/
pnpm preview        # Preview production build locally
```

**No linter, formatter, test runner, or type checker is configured.** There are no `lint`, `test`, or `format` scripts. Style is enforced by convention only.

## PROJECT STRUCTURE

```
index.html                  # Entry HTML (zh-Hant lang, Google Fonts preload)
vite.config.js              # Dev server port 3000, auto-open
package.json                # pnpm, ES modules, React 18, Vite 6
src/
├── main.jsx                # createRoot entry — StrictMode wrapper
├── App.jsx                 # Root component — sequential section imports
├── index.css               # SINGLE monolithic stylesheet (1245 lines)
├── components/             # 8 presentational section components
│   ├── Navbar.jsx          # Only stateful component (useState for mobile menu)
│   ├── Hero.jsx            # Hero section with pipeline mockup
│   ├── SocialProof.jsx     # Client logos + testimonials
│   ├── Features.jsx        # 6 feature cards grid
│   ├── UseCases.jsx        # 3 use-case tabs
│   ├── Pricing.jsx         # 3-tier pricing cards
│   ├── CallToAction.jsx    # Bottom CTA banner
│   └── Footer.jsx          # Footer columns + legal links
└── data/                   # 7 config modules — ALL copy/content lives here
    ├── navigation.js       # BRAND, NAV_LINKS
    ├── hero.js             # HERO_CONTENT
    ├── socialProof.js      # CLIENT_LOGOS, TESTIMONIALS
    ├── features.js         # FEATURES
    ├── useCases.js         # USE_CASES
    ├── pricing.js          # PRICING_PLANS
    └── footer.js           # FOOTER_CONTENT
```

## WHERE TO CHANGE THINGS

| Task | Location | Notes |
|------|----------|-------|
| Change any text/copy | `src/data/*.js` | **Never** hardcode text in components |
| Add new page section | `src/components/` + `src/data/` + `App.jsx` | Component + data file + import in App |
| Modify colors/spacing/fonts | `src/index.css` `:root` block (lines 1–85) | CSS custom properties only |
| Component styling | `src/index.css` | All styles centralized — no scoped CSS |
| Add interactivity | `src/components/*.jsx` | Prefer stateless; only Navbar uses state |
| Worktree workflow | `.agent/workflows/exec-worktree-spec.md` | Reads `git-worktree-spec.md` from root |

## CODE STYLE — JSX COMPONENTS

- **4-space indentation** everywhere (JSX, CSS, data files)
- **Functional components only** — `function ComponentName() {}`, no arrow-function components
- **`export default ComponentName`** at end of file (separate line, not inline)
- **Named imports** for React hooks: `import { useState } from 'react'`
- **Named imports** for data: `import { FEATURES } from '../data/features'`
- **Default imports** for components: `import Navbar from './components/Navbar'`
- **No semicolons omission** — always use semicolons
- **Trailing commas** in multiline arrays/objects and function args
- **Single quotes** for JS strings
- **Destructure** data props at top of component body: `const { title, stats } = HERO_CONTENT`
- **`.map()` for lists** — always provide a `key` prop from data (prefer `id` or unique field, index as last resort)
- **Accessibility**: always add `role`, `aria-label`, `aria-labelledby`, `aria-expanded`, `aria-hidden` as appropriate
- **Semantic HTML**: `<section>`, `<article>`, `<nav>`, `<header>`, `<main>`, `<footer>` — not div soup

### Component Template

```jsx
import { DATA_CONST } from '../data/dataFile';

function SectionName() {
    return (
        <section className="section-name" id="section-name" aria-labelledby="section-name-title">
            <div className="container">
                {/* content */}
            </div>
        </section>
    );
}

export default SectionName;
```

## CODE STYLE — DATA FILES

- **Named exports** with UPPER_SNAKE_CASE: `export const FEATURES = [...]`
- **Plain `.js` extension** (not `.jsx`) — data files contain no JSX
- Objects use `id` field as unique key for `.map()` rendering
- All user-facing text is **Traditional Chinese (zh-Hant)**

## CODE STYLE — CSS

- **Single file**: `src/index.css` — no CSS modules, no Tailwind, no CSS-in-JS
- **CSS custom properties** defined in `:root` — kebab-case 3-segment: `--color-primary`, `--space-8`, `--radius-md`
- **BEM-like naming**: `block__element--modifier` (e.g., `navbar__nav--open`, `hero__mockup-card--blue`)
- **Media query breakpoints** (mobile-last, max-width):
  - `968px` — tablet/small desktop
  - `768px` — tablet portrait
  - `580px` — large phone
  - `480px` — small phone
- Media queries placed **immediately after** the component's desktop styles (not grouped at bottom)
- Use `var(--token)` for all colors, spacing, radii, shadows, transitions — never raw values
- Selectors follow source component order (Navbar → Hero → SocialProof → … → Footer)

## ANTI-PATTERNS — DO NOT

- **Do NOT** add CSS modules, Tailwind, styled-components, or any scoped styling
- **Do NOT** hardcode text in components — all copy belongs in `src/data/`
- **Do NOT** add React Router — single-page with anchor links (`#features`, `#pricing`)
- **Do NOT** add state management (Redux, Zustand, Context) — stateless by design
- **Do NOT** convert to TypeScript — pure JSX is intentional
- **Do NOT** use `npm` or `yarn` — this project uses `pnpm`
- **Do NOT** add new dependencies without explicit request — zero external UI/CSS libraries
- **Do NOT** split `index.css` into multiple files — monolithic stylesheet is intentional
- **Do NOT** use inline styles in JSX — all styling via CSS classes in `index.css`
- **Do NOT** use `@ts-ignore`, `as any`, or type escape hatches (project is untyped JS)

## ARCHITECTURE DECISIONS

1. **Config-driven**: Components are pure renderers. Changing text = editing `src/data/` only.
2. **No routing**: Anchor-based navigation (`<a href="#features">`). `scroll-behavior: smooth` + `scroll-padding-top` in CSS.
3. **Single CSS source of truth**: Design tokens in `:root`, component styles below, media queries colocated.
4. **Minimal React**: Only `useState` in Navbar for mobile toggle. No effects, no context, no refs.
5. **Glassmorphism theme**: Dark bg (`#0a0e1a`), Indigo/Cyan gradients, `backdrop-filter` blur on navbar.

## GIT CONVENTIONS

- Commit messages follow: `type(scope): description` in Chinese or English
- Types: `feat`, `fix`, `docs`, `refactor`, `chore`
- `.gitignore` excludes `git-worktree-spec.md` (ephemeral worktree spec files)
- Branch-per-feature workflow using git worktrees (see `.agent/workflows/`)

## NOTES

- No CI/CD pipeline — manual deployment
- No tests — no testing framework installed
- `index.css` at 1245 lines is the heaviest file; design system + all component styles
- `.agent/skills/` contains agent-specific skills (UI/UX, git workflows) — not application code
- `excalidraw.log` in root is a stray artifact, ignore it
- Google Fonts loaded externally: Inter (Latin) + Noto Sans TC (Chinese)
