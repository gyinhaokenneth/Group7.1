// Catch-all so /api/ura/status, /district-stats, /transactions,
// /monthly-trend, /batch and /sync all reach the same handler. Without this,
// Vercel's filesystem routing serves /api/ura only and 404s every subpath.
export { default } from '../_ura-core.js';
