// api/pnr.js — Vercel Serverless Function
// Users never see the API key — it lives here on the server as an env variable

export default async function handler(req, res) {
  // Allow CORS so the frontend HTML can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { pnr } = req.query;

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return res.status(400).json({ success: false, message: 'Invalid PNR. Must be 10 digits.' });
  }

  const KEY  = process.env.RAPIDAPI_KEY; // stored safely in Vercel dashboard
  const HOST = 'irctc-indian-railway-pnr-status.p.rapidapi.com';

  try {
    const response = await fetch(`https://${HOST}/getPNRStatus/${pnr}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key':  KEY,
        'x-rapidapi-host': HOST,
        'Content-Type':    'application/json'
      }
    });

    if (response.status === 403 || response.status === 401) {
      return res.status(502).json({ success: false, message: 'API authentication failed. Contact admin.' });
    }
    if (response.status === 429) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again in a minute.' });
    }
    if (!response.ok) {
      return res.status(502).json({ success: false, message: `Upstream API error: ${response.status}` });
    }

    const data = await response.json();

    if (data.success === false) {
      return res.status(200).json({ success: false, message: data.message || 'PNR not found or expired.' });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}
