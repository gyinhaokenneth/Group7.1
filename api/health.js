// Health check. This also exists on the Express dev server in server.ts, but
// server.ts never runs on Vercel, so the deployment needs its own function.
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
