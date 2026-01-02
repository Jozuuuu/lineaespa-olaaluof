Deployment: Vercel serverless proxy for Google Apps Script (avoid CORS)

1) Purpose
- This repo includes `api/proxy.js`: a Vercel Serverless Function that forwards POST requests to your Apps Script Web App. Use it when the browser blocks direct requests to GAS due to CORS.

2) How to deploy
- Create a Vercel account and install Vercel CLI (optional).
- From the repo root, run `vercel` and follow prompts (or connect the GitHub repo in the Vercel dashboard).
- After deploy, your proxy will be at `https://<your-deploy>.vercel.app/api/proxy`.

3) How to use from frontend (`inventario.html`)
- Set `GAS_URL` to your proxy URL (e.g. `https://<your-deploy>.vercel.app/api/proxy`).
- The frontend can then `fetch(GAS_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})` without CORS errors because Vercel function responds with `Access-Control-Allow-Origin: *`.

4) Notes
- This proxy simply forwards JSON bodies to the Apps Script exec URL. It does not store data.
- For images it's better to send a multipart upload to a backend (or use the existing `server.js`), but embedding base64 in JSON also works (size limits may apply).
- If you want the proxy to authenticate or restrict origins, modify `api/proxy.js` accordingly.
