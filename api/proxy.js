// Vercel Serverless function to forward requests to Google Apps Script (GAS)
// Deploy this repo to Vercel; the function will be available at https://<your‑vercel>.vercel.app/api/proxy

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyQ9P8njniZrRNfiMGlKUolIkxKKmLExLpKv271_qMWIVkv5j3AqITlFaILE9UmgOr-/exec';

module.exports = async (req, res) => {
  // Allow CORS from any origin (adjust in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const method = req.method || 'GET';
    // Forward body as JSON to GAS
    const body = (req.body && Object.keys(req.body).length>0) ? req.body : undefined;

    const fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : JSON.stringify({})
    };

    const r = await fetch(GAS_URL, fetchOpts);
    const text = await r.text();
    // Mirror status and body
    res.status(r.status || 200).send(text);
  } catch (err) {
    console.error('proxy error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
};
