// api/availability.js — Seat Availability
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { train, from, to, class: cls, date } = req.query;
  if (!train || !from || !to || !cls || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  const KEY  = process.env.RAPIDAPI_KEY;
  const HOST = 'irctc-indian-railway-pnr-status.p.rapidapi.com';

  try {
    const response = await fetch(`https://${HOST}/checkSeatAvailability/${train}/${from}/${to}/${cls}/${date}/GN`, {
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
