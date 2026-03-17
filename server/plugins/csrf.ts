// CSRF protection is handled by SameSite: lax cookies on JWT tokens.
// This plugin is intentionally disabled for same-origin SPA usage.
export default defineNitroPlugin(() => {})
