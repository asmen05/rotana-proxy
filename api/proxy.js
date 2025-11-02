// api/proxy.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  try {
    const target = req.query.url;
    if (!target) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const upstream = await fetch(target, {
      headers: {
        'Referer': 'https://rotana.net',
        'Origin': 'https://rotana.net',
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if ((contentType || '').includes('text') || (contentType || '').includes('mpegurl')) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    } else {
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.status(upstream.status).send(buf);
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
