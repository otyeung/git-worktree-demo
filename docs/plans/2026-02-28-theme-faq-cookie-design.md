# Design: Light/Dark Theme, FAQ Section, Cookie Consent Banner

**Date:** 2026-02-28
**Status:** Approved
**Branch:** TBD (feature branch per worktree workflow)

## Overview

Three new features for the SalesPilot CRM landing page:

1. **Light/dark theme toggle** — CSS-only token swap via `[data-theme]` attribute
2. **FAQ section** — Accordion component placed after Pricing
3. **Cookie consent banner** — Fixed bottom bar with accept/reject + localStorage persistence

All features follow existing project conventions: config-driven content, single CSS file, functional components, semantic HTML with ARIA.

---

## Feature 1: Light/Dark Theme

### Mechanism

A `data-theme` attribute on `<html>` controls the active theme. CSS custom properties in a `[data-theme="light"]` block override the dark defaults in `:root`.

**Theme resolution order (on page load):**

1. `localStorage.getItem('theme')` → use stored preference if present
2. `window.matchMedia('(prefers-color-scheme: light)')` → use OS preference
3. Default to `'dark'` (current behavior, no change for existing users)

### Flash Prevention (FOWT)

An inline `<script>` in `index.html` `<head>` (before React loads) sets `document.documentElement.dataset.theme` synchronously. This prevents a dark→light flash on reload for light-mode users.

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
  })();
</script>
```

### Light Theme Token Map

`:root` remains unchanged (dark theme). New `[data-theme="light"]` block overrides:

| Token | Dark (current) | Light |
|-------|---------------|-------|
| `--color-bg` | `#0a0e1a` | `#f8fafc` |
| `--color-bg-elevated` | `#111827` | `#f1f5f9` |
| `--color-bg-card` | `#1a2035` | `#ffffff` |
| `--color-bg-card-hover` | `#1f2847` | `#f8fafc` |
| `--color-surface` | `#252d44` | `#e2e8f0` |
| `--color-text` | `#f1f5f9` | `#0f172a` |
| `--color-text-secondary` | `#94a3b8` | `#475569` |
| `--color-text-muted` | `#64748b` | `#64748b` (unchanged) |
| `--color-text-inverse` | `#0f172a` | `#f1f5f9` |
| `--color-border` | `rgba(148,163,184,0.12)` | `rgba(15,23,42,0.1)` |
| `--color-border-hover` | `rgba(148,163,184,0.25)` | `rgba(15,23,42,0.2)` |
| `--shadow-sm/md/lg` | High opacity | Lower opacity |

**Brand colors unchanged across themes:** `--color-primary`, `--color-accent`, `--color-success`, `--color-warning`, `--color-error`.

### Glassmorphism Adaptation

New token `--color-navbar-glass` — dark: `rgba(10,14,26,0.85)`, light: `rgba(255,255,255,0.7)`. The navbar's `backdrop-filter: blur()` works on both backgrounds.

### Toggle Button

- **Placement:** Navbar, between nav links and CTA button
- **Icon:** Sun emoji (☀️) in dark mode, moon emoji (🌙) in light mode — no SVG dependency
- **Mobile:** Appears inside the hamburger menu
- **Behavior:** `onClick` toggles `document.documentElement.dataset.theme`, writes to `localStorage`, updates component state

### Hardcoded Color Audit

~6-8 raw `rgba`/hex values in gradients and decorative elements (hero glow, mockup cards, CTA gradient) need tokenization or theme-conditional overrides. These are purely decorative and can use opacity-based approaches that work in both themes.

### Files Changed

| File | Change |
|------|--------|
| `index.html` | Add inline `<script>` in `<head>` for FOWT prevention |
| `src/index.css` | Add `[data-theme="light"]` token block (~30 lines), add `--color-navbar-glass` token, tokenize 6-8 hardcoded decorative colors |
| `src/components/Navbar.jsx` | Add theme toggle button with `useState` + DOM manipulation |
| `src/data/navigation.js` | Add `THEME_TOGGLE` config (aria-labels for both states) |

---

## Feature 2: FAQ Section

### Placement

After Pricing, before CallToAction.

Page order: Hero → SocialProof → Features → UseCases → Pricing → **FAQ** → CallToAction → Footer

### Accordion Behavior

- `useState` tracks an array/set of open item IDs
- Multiple items can be open simultaneously (not mutually exclusive)
- Click an open item to collapse it
- `max-height` CSS transition for smooth expand/collapse
- `+` icon rotates 45° to `×` when open

### Data Structure (`src/data/faq.js`)

```js
export const FAQ_CONTENT = {
    badge: '常見問題',
    title: '還有疑問？我們來解答',
    description: '以下是客戶最常問的問題，如果找不到答案，歡迎直接聯繫我們。',
    items: [
        {
            id: 'trial',
            question: '免費試用期有多長？',
            answer: '所有方案都提供 14 天免費試用，無需綁定信用卡...',
        },
        // 6-8 items: trial, data security, integrations,
        // migration, support, contract, cancellation
    ],
};
```

### JSX Structure (`src/components/FAQ.jsx`)

```jsx
<section className="faq" id="faq" aria-labelledby="faq-title">
    <div className="container">
        <div className="section-header">
            <span className="section-header__badge">{badge}</span>
            <h2 id="faq-title" className="section-header__title">{title}</h2>
            <p className="section-header__desc">{description}</p>
        </div>
        <div className="faq__list" role="list">
            {items.map((item) => (
                <div key={item.id} className="faq__item" role="listitem">
                    <button
                        className={`faq__question ${isOpen ? 'faq__question--open' : ''}`}
                        onClick={() => toggle(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${item.id}`}
                    >
                        <span>{item.question}</span>
                        <span className="faq__icon" aria-hidden="true">+</span>
                    </button>
                    <div
                        id={`faq-answer-${item.id}`}
                        className={`faq__answer ${isOpen ? 'faq__answer--open' : ''}`}
                        role="region"
                    >
                        <p>{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
</section>
```

### CSS

- Card-style items: `--color-bg-card` background, `--radius-lg` corners, `--color-border` border
- Expand: `max-height: 0` → `max-height: 300px` with `--transition-base`
- Icon rotation: `transform: rotate(0)` → `rotate(45deg)`
- Theme-aware automatically via existing token system

### Navigation Update

Add `{ label: '常見問題', href: '#faq' }` to `NAV_LINKS` in `src/data/navigation.js`.

### Files Changed

| File | Change |
|------|--------|
| `src/components/FAQ.jsx` | New component |
| `src/data/faq.js` | New data file |
| `src/App.jsx` | Import FAQ, place between Pricing and CallToAction |
| `src/data/navigation.js` | Add FAQ link to `NAV_LINKS` |
| `src/index.css` | Add `.faq__*` styles (~60-80 lines) + responsive media queries |

---

## Feature 3: Cookie Consent Banner

### Behavior

1. First visit — banner slides up from bottom of viewport
2. User clicks 「接受」 or 「拒絕」 → banner dismisses, `localStorage.setItem('cookie-consent', 'accepted' | 'rejected')`
3. Subsequent visits — `useEffect` checks localStorage on mount; if value exists, banner stays hidden
4. No actual cookie logic — UI consent mechanism only

### Component Architecture

`CookieConsent.jsx` — uses `useState` (visible/hidden) + `useEffect` (check localStorage on mount). This is the project's first `useEffect` usage.

Rendered in `App.jsx` outside `<main>`, after `<Footer />`:

```jsx
<div className="app">
    <Navbar />
    <main>...</main>
    <Footer />
    <CookieConsent />
</div>
```

### Data Structure (`src/data/cookieConsent.js`)

```js
export const COOKIE_CONSENT = {
    message: '我們使用 Cookie 來改善您的瀏覽體驗。繼續使用本網站即表示您同意我們的 Cookie 政策。',
    acceptLabel: '接受',
    rejectLabel: '拒絕',
    policyLink: { label: '隱私權政策', href: '/privacy' },
};
```

### CSS

- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000`
- Glassmorphism: `backdrop-filter: blur()` + semi-transparent bg (matches navbar pattern)
- Slide-up entrance: `transform: translateY(100%)` → `translateY(0)` with `--transition-slow`
- Responsive: on mobile (≤580px), stack message and buttons vertically
- Theme-aware via token system — no extra work

### Accessibility

- `role="dialog"`, `aria-label="Cookie 同意"`
- Buttons are proper `<button>` elements with clear labels
- Focus management: not required (non-modal dialog)

### Files Changed

| File | Change |
|------|--------|
| `src/components/CookieConsent.jsx` | New component |
| `src/data/cookieConsent.js` | New data file |
| `src/App.jsx` | Import CookieConsent, render after Footer |
| `src/index.css` | Add `.cookie-consent__*` styles (~40-50 lines) + responsive |

---

## Summary of All Changes

### New Files (4)
- `src/components/FAQ.jsx`
- `src/components/CookieConsent.jsx`
- `src/data/faq.js`
- `src/data/cookieConsent.js`

### Modified Files (5)
- `index.html` — inline theme script
- `src/App.jsx` — import FAQ + CookieConsent
- `src/components/Navbar.jsx` — theme toggle button
- `src/data/navigation.js` — FAQ nav link + theme toggle config
- `src/index.css` — light theme tokens (~30 lines), FAQ styles (~70 lines), cookie consent styles (~45 lines), tokenize hardcoded colors (~10 lines)

### Estimated CSS Addition: ~155 lines to `src/index.css`

### New React Patterns Introduced
- `useEffect` (first usage in project) — CookieConsent only
- Direct DOM manipulation via `document.documentElement.dataset.theme` — theme toggle only
- Both are appropriate and minimal; the project remains overwhelmingly stateless
