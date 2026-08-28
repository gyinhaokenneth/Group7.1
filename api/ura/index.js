// Vercel routes this file as /api/ura. The shared implementation lives in
// api/_ura-core.js — leading-underscore files are excluded from routing, so
// it is bundled as a dependency rather than exposed as its own endpoint.
export { default } from '../_ura-core.js';
