/**
 * Best-effort POST to a Zapier catch hook. Never throws — failures are logged
 * and swallowed so they don't affect the main request.
 */
async function notifyZapier(payload) {
  const url = process.env.ZAPIER_CALL_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.warn('⚠️  Zapier webhook failed:', err.message);
  }
}

module.exports = { notifyZapier };
