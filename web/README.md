# Web Platform Best Practices

This document outlines the standard best practices for code quality, design, and performance adopted by our front-end web platform. Following these guidelines ensures maintainability, fast load times, and a uniform aesthetic.

## Code Best Practices

### 1. Separation of Concerns
*   **No Inline Styles:** Do not use `style="..."` attributes on elements. All styles should be extracted to CSS classes in `style.css` or scoped stylesheets. Custom styling tightly coupled to markup makes the site difficult to scale, maintain, and adapt.
*   **Structure vs. Behavior:** Keep `<script>` tags to a bare minimum in HTML. For any substantial logic, place scripts in separate `.js` files and load them with `defer` to prevent render blocking. Do not use legacy methods like `document.write()`.

### 2. Semantic HTML
*   Use native HTML5 landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`) to structure content properly. This aids SEO ranking significantly.
*   Ensure interactive elements utilize standard semantic tags (`<button>`, `<a>`) rather than plain `div` tags equipped with click handlers.

### 3. Image Optimization & Layout Stability
*   Always include `width` and `height` attributes on `<img>` tags to provide a placeholder for images during painting and heavily prevent Cumulative Layout Shift (CLS).
*   Use optimized next-gen formats where possible (WebP, AVIF) and specify `loading="lazy"` on below-the-fold assets.

### 4. Accessibility (a11y)
*   Ensure meaningful `alt` text is available for all `<img>` tags.
*   Add `aria-label` to buttons without text (e.g., hamburger icons or pure iconography) for screen-readers.

## Deployment

The web platform is deployed via **Vercel** as a static site.

### Vercel Setup
- **Framework Preset:** Other (no framework)
- **Root Directory:** `web`
- **Build Command:** _(leave blank)_
- **Output Directory:** _(leave blank / `.`)_

Configuration is managed via [vercel.json](./vercel.json) in this directory. `cleanUrls` is enabled so paths like `/resources/` resolve without the `.html` extension.

### Deploying
Push to `main` — Vercel auto-deploys on every push to the connected branch.

---

## Design Best Practices

### 1. Typography
*   Limit the number of web font variations used. Ensure fonts load asynchronously or leverage fast font-display swaps.
*   Utilize robust fallbacks (e.g., `system-ui, -apple-system, sans-serif`).
*   Respect heading hierarchy (H1 -> H2 -> H3) implicitly—never skip a heading level for styling reasons. Use utility classes for styling if sizes need to differ structurally.

### 2. UI Aesthetics
*   **Color Palette:** Maintain the premium "deep space" dark mode aesthetic, leveraging `var(--bg-deep)` and `var(--bg-surface)` globally. Use accent colors judiciously (e.g., `--accent-orange` and `--grad-primary`) to guide the user's eye to call-to-action endpoints.
*   **Glassmorphism:** Use conservative glassmorphism (`backdrop-filter: blur(12px)`) combined with a semi-transparent border (`rgba(255, 255, 255, 0.08)`) to lift floating sections like navigation panels, hero menus, or elevated feature cards.
*   **Shadows:** Add subtle dropshadows mapped around `rgba(0, 0, 0, 0.5)` bounds, and larger softer glows behind primary action buttons to convey a "premium" dynamic space.

### 3. Responsive Adaptations
*   Embrace CSS Grid auto-fits (e.g., `grid-template-columns: repeat(auto-fit, minmax(X, 1fr))`) to dynamically handle responsiveness without a heavy reliance on explicit media queries.
*   Test small mobile (320px width), tablet vertical, tablet horizontal, laptop, and ultrawide formats during front-end deployment. Ensure elements like endless scrolling tickers fill ultra-wide screens properly with relative values such as `100vw`.
