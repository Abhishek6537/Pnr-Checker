// api/live.js — Live Train Status
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { train, date } = req.query;
  if (!train || !/^\d{4,5}$/.test(train)) {
    return res.status(400).json({ success: false, message: 'Invalid train number.' });
  }

  const KEY  = process.env.RAPIDAPI_KEY;
  const HOST = 'irctc-indian-railway-pnr-status.p.rapidapi.com';

  try {
    const response = await fetch(`https://${HOST}/getTrainLiveStatus/${train}/${date || ''}`, {
      headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST }
    });
    if (!response.ok) return res.status(502).json({ success: false, message: `API error: ${response.status}` });
    const data = await response.json();
    if (data.success === false) return res.status(200).json({ success: false, message: data.message });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}
