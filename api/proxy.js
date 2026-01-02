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
    // Read body robustly: Vercel may or may not populate req.body depending on content-type
    let bodyObj = {};
    if (req.method !== 'GET'){
      if (req.body && Object.keys(req.body).length > 0) {
        bodyObj = req.body;
      } else {
        // try to read raw text
        const txt = await new Promise((resolve, reject) => {
          let data = '';
          req.on && req.on('data', chunk => data += chunk);
          req.on && req.on('end', () => resolve(data));
          req.on && req.on('error', err => reject(err));
          // timeout fallback
          setTimeout(() => resolve(''), 50);
        });
        try{ bodyObj = txt ? JSON.parse(txt) : {}; }catch(e){ bodyObj = txt || {}; }
      }
    }

    const fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj || {})
    };

    const r = await fetch(GAS_URL, fetchOpts);
    const text = await r.text();
    // Mirror status and body
    // Try to set JSON content-type if response looks like JSON
    const ct = r.headers.get('content-type') || '';
    if(ct.includes('application/json')){
      try{ const j = JSON.parse(text); return res.status(r.status || 200).json(j); }catch(e){ /* fallthrough */ }
    }
    return res.status(r.status || 200).send(text);
  } catch (err) {
    console.error('proxy error', err && err.stack ? err.stack : err);
    // return error details to help debugging (will appear in Vercel logs and response)
    res.status(500).json({ ok: false, error: String(err), stack: err && err.stack ? err.stack.split('\n').slice(0,5) : undefined });
  }
};
