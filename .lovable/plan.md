## Typography Update

Apply the new brand typography system across the app.

### Fonts
- **Pacifico** — exclusively for the logo wordmark "prefud" (lowercase).
- **Montserrat** — entire UI (web + native apps).
  - Bold (700) → headings (h1–h3)
  - Medium (500) → subheadings (h4–h6, labels)
  - Light (300) / Regular (400) → body text

### Changes

1. **`index.html`**
   - Add Google Fonts preconnect + stylesheet for:
     - `Pacifico` (400)
     - `Montserrat` (300, 400, 500, 700)
   - Remove any previously loaded display font no longer used.

2. **`tailwind.config.ts`**
   - Extend `fontFamily`:
     - `sans: ["Montserrat", ...defaults]` (default UI font)
     - `logo: ["Pacifico", "cursive"]`

3. **`src/index.css`**
   - Set `body { font-family: 'Montserrat', sans-serif; font-weight: 400; }`
   - Headings: `h1,h2,h3 { font-weight: 700; }`, `h4,h5,h6 { font-weight: 500; }`
   - Add `.font-logo { font-family: 'Pacifico', cursive; }` utility.

4. **Logo usages — switch wordmark to lowercase `prefud` with `font-logo`**
   - Search for visible "Prefud" / "Prefund" brand text in components (e.g. `SignIn.tsx`, `SignupSteps.tsx`, `Dashboard.tsx` header, `WelcomeModal.tsx`, landing/marketing components, footer, sidebar). Replace with `<span className="font-logo lowercase">prefud</span>`.
   - Do **not** touch:
     - Native app display names in `capacitor.config.ts`, `Info.plist`, `strings.xml`, `build.gradle`
     - `<title>` / meta tags (SEO copy)
     - Backend URLs, env vars, package names

5. **Verification**
   - Build to confirm no broken class names.
   - Visually confirm Pacifico only renders on the logo and Montserrat on all other text.

### Out of scope
- No color, spacing, or layout changes.
- No translation key changes.
- No native config or store-listing changes.
