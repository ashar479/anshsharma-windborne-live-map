export default async function handler(req, res) {
  const { file } = req.query;
  const target = `https://a.windbornesystems.com/treasure/${file}`;

  try {
    const r = await fetch(target, { method: 'GET' });
    const text = await r.text();
    res.status(r.status);
    const ct = r.headers.get('content-type') || 'application/json';
    res.setHeader('content-type', ct);
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'proxy_failed', detail: err.message });
  }
}
