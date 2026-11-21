// Builds the URL of a file inside the public/ folder.
// BASE_URL comes from `base` in vite.config.js, so images keep working if the
// site is ever moved from a custom domain ('/') to a sub-path ('/repo-name/').
export function assetUrl(path) {
  return import.meta.env.BASE_URL + path
}
