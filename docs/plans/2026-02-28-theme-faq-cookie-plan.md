# Light/Dark Theme, FAQ Section & Cookie Consent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three features to the SalesPilot CRM landing page: light/dark theme toggle, FAQ accordion section, and cookie consent banner.

**Architecture:** CSS-only theming via `[data-theme]` attribute with localStorage persistence. FAQ is a standard section component with `useState` accordion. Cookie consent is a fixed-position overlay with `useEffect` + `localStorage`. All copy in `src/data/` config files.

**Tech Stack:** React 18 (no new deps), Vite 6, vanilla CSS custom properties

**Design Doc:** `docs/plans/2026-02-28-theme-faq-cookie-design.md`

---

## Task 1: Add Light Theme CSS Tokens

**Files:**
- Modify: `src/index.css` (after `:root` block, ~line 85)

**Step 1: Add `[data-theme="light"]` token overrides**

Insert immediately after the `:root { ... }` closing brace (line 85). This block redefines all theme-sensitive tokens:

```css
[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-bg-elevated: #f1f5f9;
  --color-bg-card: #ffffff;
  --color-bg-card-hover: #f8fafc;
  --color-surface: #e2e8f0;

  --color-text: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-text-inverse: #f1f5f9;

  --color-border: rgba(15, 23, 42, 0.1);
  --color-border-hover: rgba(15, 23, 42, 0.2);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.1);
}
```

**Step 2: Add `--color-navbar-glass` token to both themes**

In `:root` (dark), add after `--navbar-height: 72px;` (line 84):
```css
  --color-navbar-glass: rgba(10, 14, 26, 0.8);
```

In `[data-theme="light"]`, add:
```css
  --color-navbar-glass: rgba(255, 255, 255, 0.7);
```

**Step 3: Replace hardcoded navbar background with token**

In `.navbar` (line 259), change:
```css
  background: rgba(10, 14, 26, 0.8);
```
to:
```css
  background: var(--color-navbar-glass);
```

**Step 4: Tokenize other hardcoded colors that need theme awareness**

The following hardcoded values are in decorative/gradient contexts. These specific ones need light-theme overrides:

- Line 235: `.btn--outline-white:hover` box-shadow `rgba(255,255,255,0.2)` — keep as-is (white outline buttons only appear on CTA gradient bg, which doesn't change)
- Line 246: `.btn--outline-white:hover` background `rgba(255,255,255,0.1)` — keep as-is (same reason)
- Lines 516-518: `.hero__mockup-dot` hardcoded `#ef4444`, `#f59e0b`, `#10b981` — keep as-is (traffic light dots, decorative, same in both themes)
- Lines 581-584: `.hero__mockup-card--*` gradient backgrounds — keep as-is (decorative mockup, visually fine in both themes)
- Line 980: pricing featured card gradient uses `rgba(99, 102, 241, 0.08)` — keep as-is (subtle brand tint, works on both bg)
- Lines 1084-1093: CTA banner gradient — keep as-is (brand gradient section, doesn't change per theme)
- Line 1110: CTA desc `rgba(255,255,255,0.8)` — add `[data-theme="light"]` override:

```css
[data-theme="light"] .cta-banner__desc {
  color: rgba(255, 255, 255, 0.8);
}
```
(Same value — CTA section has its own gradient bg, text stays white in both themes.)

- Line 435: Hero title gradient text — keep as-is (gradient text on brand colors).

**Summary:** Only the navbar glass bg needs tokenization. The decorative/gradient elements sit on their own colored backgrounds and work in both themes. The CTA section is a gradient-bg section where text is always white regardless of page theme.

**Step 5: Verify build**

Run: `pnpm build`
Expected: Build succeeds. No visible change yet (no data-theme attribute set).

**Step 6: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): add light theme CSS tokens and navbar glass token"
```

---

## Task 2: Add FOWT Prevention Script to index.html

**Files:**
- Modify: `index.html`

**Step 1: Add inline theme detection script**

In `index.html`, add inside `<head>` after the Google Fonts `<link>` tags (after line 11), before `</head>`:

```html
    <script>
      (function() {
        var t = localStorage.getItem('theme');
        if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        document.documentElement.dataset.theme = t;
      })();
    </script>
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds. Page defaults to dark or light based on OS preference.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(theme): add FOWT prevention script in HTML head"
```

---

## Task 3: Add Theme Toggle Data Config

**Files:**
- Modify: `src/data/navigation.js`

**Step 1: Add THEME_TOGGLE export**

Add after the `BRAND` export:

```js
export const THEME_TOGGLE = {
    darkLabel: '切換為淺色模式',
    lightLabel: '切換為深色模式',
    darkIcon: '☀️',
    lightIcon: '🌙',
};
```

**Step 2: Commit**

```bash
git add src/data/navigation.js
git commit -m "feat(theme): add theme toggle config to navigation data"
```

---

## Task 4: Add Theme Toggle to Navbar

**Files:**
- Modify: `src/components/Navbar.jsx`
- Modify: `src/index.css`

**Step 1: Update Navbar component**

Replace the full contents of `src/components/Navbar.jsx`:

```jsx
import { useState } from 'react';
import { NAV_LINKS, BRAND, THEME_TOGGLE } from '../data/navigation';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme || 'dark',
    );

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        setTheme(next);
    }

    const isDark = theme === 'dark';

    return (
        <header className="navbar" role="banner">
            <div className="navbar__inner container">
                <a href="/" className="navbar__brand" aria-label={`${BRAND.name} 首頁`}>
                    <span className="navbar__logo" aria-hidden="true">◆</span>
                    <span className="navbar__brand-name">{BRAND.name}</span>
                </a>

                <button
                    className="navbar__toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-controls="nav-menu"
                    aria-label="切換導覽選單"
                >
                    <span className="navbar__toggle-bar" />
                    <span className="navbar__toggle-bar" />
                    <span className="navbar__toggle-bar" />
                </button>

                <nav
                    id="nav-menu"
                    className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
                    role="navigation"
                    aria-label="主要導覽"
                >
                    <ul className="navbar__list">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href} className="navbar__item">
                                <a href={link.href} className="navbar__link" onClick={() => setMenuOpen(false)}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="navbar__theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDark ? THEME_TOGGLE.darkLabel : THEME_TOGGLE.lightLabel}
                    >
                        <span aria-hidden="true">
                            {isDark ? THEME_TOGGLE.darkIcon : THEME_TOGGLE.lightIcon}
                        </span>
                    </button>
                    <a href="#demo" className="btn btn--primary btn--sm navbar__cta">
                        預約 Demo
                    </a>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
```

**Step 2: Add theme toggle CSS**

Add in `src/index.css` after `.navbar__link:hover::after` block (after line 321), before `.navbar__toggle`:

```css
.navbar__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  transition: background var(--transition-fast);
}

.navbar__theme-toggle:hover {
  background: var(--color-border-hover);
}
```

Inside the existing `@media (max-width: 768px)` block for navbar (line 338), add the theme toggle mobile style:

```css
  .navbar__theme-toggle {
    margin: var(--space-2) 0;
  }
```

**Step 3: Verify**

Run: `pnpm dev`
Expected: Sun icon visible in navbar. Clicking toggles between light/dark. Refresh preserves choice. OS preference used on first visit.

Run: `pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/Navbar.jsx src/index.css
git commit -m "feat(theme): add light/dark toggle button to navbar"
```

---

## Task 5: Create FAQ Data File

**Files:**
- Create: `src/data/faq.js`

**Step 1: Create the data file**

```js
export const FAQ_CONTENT = {
    badge: '常見問題',
    title: '還有疑問？我們來解答',
    description: '以下是客戶最常問的問題，如果找不到答案，歡迎直接聯繫我們的團隊。',
    items: [
        {
            id: 'trial',
            question: '免費試用期有多長？需要綁定信用卡嗎？',
            answer: '所有方案都提供 14 天免費試用，完全不需要綁定信用卡。試用期間可使用該方案的所有功能，讓你充分評估是否適合團隊需求。',
        },
        {
            id: 'data-security',
            question: '我的客戶資料安全嗎？',
            answer: 'SalesPilot 採用銀行等級的 AES-256 加密技術保護你的資料。所有資料儲存於通過 ISO 27001 認證的資料中心，並提供每日自動備份。我們絕不會與第三方分享你的客戶資料。',
        },
        {
            id: 'integrations',
            question: '可以和我現有的工具整合嗎？',
            answer: '當然可以！SalesPilot 原生支援 Gmail、Outlook、LINE、Slack、Google Calendar 等主流工具的深度整合。Pro 方案以上還提供完整的 API 存取權限，可自行串接內部系統。',
        },
        {
            id: 'migration',
            question: '從其他 CRM 搬家過來容易嗎？',
            answer: '我們提供免費的資料搬遷服務，支援從 Salesforce、HubSpot、Pipedrive 等主流 CRM 匯入。專屬客戶成功經理會全程協助你完成搬遷，確保資料零遺失。',
        },
        {
            id: 'support',
            question: '遇到問題時如何取得支援？',
            answer: 'Starter 方案享有社群支援與知識庫存取。Pro 方案享有優先客服支援，平均回應時間 2 小時內。Enterprise 方案則配有專屬客戶成功經理，提供一對一即時支援。',
        },
        {
            id: 'cancel',
            question: '可以隨時取消訂閱嗎？',
            answer: '完全可以。SalesPilot 採月繳制，你可以在任何時候取消訂閱，不會有任何違約金或隱藏費用。取消後，你的資料會保留 30 天供你匯出。',
        },
    ],
};
```

**Step 2: Commit**

```bash
git add src/data/faq.js
git commit -m "feat(faq): add FAQ content data file"
```

---

## Task 6: Create FAQ Component

**Files:**
- Create: `src/components/FAQ.jsx`

**Step 1: Create the component**

```jsx
import { useState } from 'react';
import { FAQ_CONTENT } from '../data/faq';

function FAQ() {
    const { badge, title, description, items } = FAQ_CONTENT;
    const [openItems, setOpenItems] = useState(new Set());

    function toggleItem(id) {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    return (
        <section className="faq" id="faq" aria-labelledby="faq-title">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__badge">{badge}</span>
                    <h2 id="faq-title" className="section-header__title">
                        {title}
                    </h2>
                    <p className="section-header__desc">
                        {description}
                    </p>
                </div>

                <div className="faq__list" role="list">
                    {items.map((item) => {
                        const isOpen = openItems.has(item.id);
                        return (
                            <div key={item.id} className="faq__item" role="listitem">
                                <button
                                    className={`faq__question ${isOpen ? 'faq__question--open' : ''}`}
                                    onClick={() => toggleItem(item.id)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${item.id}`}
                                    id={`faq-question-${item.id}`}
                                >
                                    <span>{item.question}</span>
                                    <span className="faq__icon" aria-hidden="true">+</span>
                                </button>
                                <div
                                    id={`faq-answer-${item.id}`}
                                    className={`faq__answer ${isOpen ? 'faq__answer--open' : ''}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${item.id}`}
                                >
                                    <p className="faq__answer-text">{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FAQ;
```

**Step 2: Commit**

```bash
git add src/components/FAQ.jsx
git commit -m "feat(faq): add FAQ accordion component"
```

---

## Task 7: Add FAQ Styles

**Files:**
- Modify: `src/index.css`

**Step 1: Add FAQ CSS**

Insert after the Pricing section styles and before the CTA Banner section. Find the comment `/* CTA BANNER */` or the `.cta-banner` rule (~line 1075). Insert before it:

```css
/* ========================================
   FAQ
   ======================================== */
.faq {
  padding: var(--space-24) 0;
}

.faq__list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.faq__item {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.faq__item:hover {
  border-color: var(--color-border-hover);
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-5) var(--space-6);
  font-size: var(--text-base);
  font-weight: 600;
  text-align: left;
  color: var(--color-text);
  transition: color var(--transition-fast);
  gap: var(--space-4);
}

.faq__question:hover {
  color: var(--color-primary-light);
}

.faq__icon {
  flex-shrink: 0;
  font-size: var(--text-xl);
  font-weight: 300;
  color: var(--color-text-muted);
  transition: transform var(--transition-base);
}

.faq__question--open .faq__icon {
  transform: rotate(45deg);
  color: var(--color-primary-light);
}

.faq__answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-base);
}

.faq__answer--open {
  max-height: 300px;
}

.faq__answer-text {
  padding: 0 var(--space-6) var(--space-5);
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .faq__question {
    padding: var(--space-4) var(--space-5);
    font-size: var(--text-sm);
  }

  .faq__answer-text {
    padding: 0 var(--space-5) var(--space-4);
  }
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(faq): add FAQ accordion styles"
```

---

## Task 8: Wire FAQ into App + Navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/data/navigation.js`

**Step 1: Add FAQ nav link**

In `src/data/navigation.js`, add to `NAV_LINKS` array (after `'方案價格'` entry, before the closing `];`):

```js
    { label: '常見問題', href: '#faq' },
```

**Step 2: Import and render FAQ in App.jsx**

Add import after the `Pricing` import (line 6):
```jsx
import FAQ from './components/FAQ';
```

Add `<FAQ />` in the JSX after `<Pricing />` and before `<CallToAction />`:
```jsx
                <Pricing />
                <FAQ />
                <CallToAction />
```

**Step 3: Verify**

Run: `pnpm dev`
Expected: FAQ section visible between Pricing and CTA. Accordion items expand/collapse on click. Nav link scrolls to FAQ section. Works in both light and dark themes.

Run: `pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/App.jsx src/data/navigation.js
git commit -m "feat(faq): wire FAQ section into App and navigation"
```

---

## Task 9: Create Cookie Consent Data File

**Files:**
- Create: `src/data/cookieConsent.js`

**Step 1: Create the data file**

```js
export const COOKIE_CONSENT = {
    message: '我們使用 Cookie 來改善您的瀏覽體驗與分析網站流量。',
    acceptLabel: '接受',
    rejectLabel: '拒絕',
    policyLink: { label: '隱私權政策', href: '#' },
};
```

**Step 2: Commit**

```bash
git add src/data/cookieConsent.js
git commit -m "feat(cookie): add cookie consent content data file"
```

---

## Task 10: Create Cookie Consent Component

**Files:**
- Create: `src/components/CookieConsent.jsx`

**Step 1: Create the component**

```jsx
import { useState, useEffect } from 'react';
import { COOKIE_CONSENT } from '../data/cookieConsent';

function CookieConsent() {
    const { message, acceptLabel, rejectLabel, policyLink } = COOKIE_CONSENT;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    function handleAccept() {
        localStorage.setItem('cookie-consent', 'accepted');
        setVisible(false);
    }

    function handleReject() {
        localStorage.setItem('cookie-consent', 'rejected');
        setVisible(false);
    }

    if (!visible) {
        return null;
    }

    return (
        <div
            className={`cookie-consent ${visible ? 'cookie-consent--visible' : ''}`}
            role="dialog"
            aria-label="Cookie 同意"
        >
            <div className="container cookie-consent__inner">
                <p className="cookie-consent__message">
                    {message}
                    {' '}
                    <a href={policyLink.href} className="cookie-consent__link">
                        {policyLink.label}
                    </a>
                </p>
                <div className="cookie-consent__actions">
                    <button
                        className="btn btn--outline btn--sm"
                        onClick={handleReject}
                    >
                        {rejectLabel}
                    </button>
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={handleAccept}
                    >
                        {acceptLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CookieConsent;
```

**Step 2: Commit**

```bash
git add src/components/CookieConsent.jsx
git commit -m "feat(cookie): add cookie consent banner component"
```

---

## Task 11: Add Cookie Consent Styles

**Files:**
- Modify: `src/index.css`

**Step 1: Add cookie consent CSS**

Insert after the CTA Banner styles and before the Footer section. Find the Footer comment block and insert before it:

```css
/* ========================================
   COOKIE CONSENT
   ======================================== */
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  background: var(--color-navbar-glass);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  transform: translateY(0);
  animation: cookie-slide-up var(--transition-slow) ease-out;
}

@keyframes cookie-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.cookie-consent__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.cookie-consent__message {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.cookie-consent__link {
  color: var(--color-primary-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.cookie-consent__link:hover {
  color: var(--color-primary);
}

.cookie-consent__actions {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

@media (max-width: 580px) {
  .cookie-consent__inner {
    flex-direction: column;
    text-align: center;
  }

  .cookie-consent__actions {
    width: 100%;
    justify-content: center;
  }
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(cookie): add cookie consent banner styles"
```

---

## Task 12: Wire Cookie Consent into App

**Files:**
- Modify: `src/App.jsx`

**Step 1: Import and render CookieConsent**

Add import after the Footer import:
```jsx
import CookieConsent from './components/CookieConsent';
```

Add `<CookieConsent />` after `<Footer />` (outside `<main>`, still inside `.app`):
```jsx
            <Footer />
            <CookieConsent />
        </div>
```

**Step 2: Verify**

Run: `pnpm dev`
Expected: Cookie consent banner slides up from bottom on first visit. Clicking Accept/Reject dismisses it. Refreshing the page — banner stays hidden. Clear localStorage → banner reappears.

Verify in both light and dark themes.

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat(cookie): wire cookie consent banner into App"
```

---

## Task 13: Final Visual Verification

**Files:** None (verification only)

**Step 1: Full visual check**

Run: `pnpm dev`

Verify all three features together:
- [ ] Dark theme: all sections render correctly (existing behavior preserved)
- [ ] Light theme: toggle via navbar button, all sections readable, glassmorphism adapts
- [ ] Theme persists on refresh
- [ ] OS preference detected on first visit (clear localStorage to test)
- [ ] FAQ accordion: items expand/collapse, multiple open, icon rotates
- [ ] FAQ section: correct position (after Pricing, before CTA)
- [ ] FAQ nav link: scrolls to FAQ section from navbar
- [ ] Cookie banner: slides up on first visit, dismiss persists
- [ ] Cookie banner: works in both themes
- [ ] Mobile responsive: hamburger menu includes theme toggle, FAQ stacks, cookie banner stacks

**Step 2: Build verification**

Run: `pnpm build`
Expected: Clean build, no warnings.

**Step 3: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix: visual polish for theme/FAQ/cookie features"
```
