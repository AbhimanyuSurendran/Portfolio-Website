# Portfolio (React)

React + Vite version of the portfolio site. Same design and behaviour as the static HTML site in the repository root.

## Commands

```bash
npm install       # install dependencies
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serve dist/ locally to test the build
npm run lint
```

## Structure

```
public/             Images, GIFs, PDF, CNAME, sitemap.xml, 404.html (copied as-is into the build)
src/
  main.jsx          Entry point: HashRouter + shared CSS
  App.jsx           Routes + site-wide behaviours
  pages/            One file per page (Preloader, Home, Projects, Skills, Certificates, Publications, About)
  components/       Header, Footer, PageLayout, TechStackGame, background layers, SiteLink
  hooks/            Theme, typewriter, scroll reveal, pointer effects, image fallbacks, anti-inspect
  data/             Project / skill / certificate / about content and particles.js settings
  styles/           glass, header, creative, animation (shared) + one CSS file per page
  utils/            assetUrl (public/ file URLs), media-query helpers
```

## Things to know

- **Routing:** `HashRouter`, so addresses look like `/#/projects`. Refreshing a page works on GitHub Pages with no server rules.
- **Page CSS:** several pages reuse class names (`.main-content`, `.card-container`, ...) with different styles, so each page's CSS is imported with `?inline` and added by `PageLayout` only while that page is open. Shared CSS (`glass`, `header`, `creative`, `animation`) is imported once in `main.jsx`.
- **Images:** keep files in `public/` and reference them with `assetUrl('folder/file.png')`. Do not hard-code a leading `/`.
- **Base path:** `base: '/'` in `vite.config.js` because the site uses a custom domain (`public/CNAME`). For `https://<user>.github.io/<repo>/` set it to `'/<repo>/'` (and update the redirect in `public/404.html`).
- **Deployment:** `.github/workflows/deploy.yml` (repository root) builds and deploys on every push to `main`.
