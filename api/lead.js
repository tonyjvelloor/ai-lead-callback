// Receives demo requests from the landing page.
// Set LEAD_WEBHOOK_URL (e.g. a Dograh trigger or a Google Sheets/Zapier webhook) to forward leads.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { name, phone, business, lang, consent } = req.body || {};
  const digits = String(phone || '').replace(/\D/g, '');
  if (!name || digits.length < 10 || !consent) {
    return res.status(400).json({ error: 'name, valid phone and consent are required' });
  }

  const lead = { name, phone: `+${digits}`, business, lang, consent: true, at: new Date().toISOString() };

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead) });
    } catch (err) {
      console.error('webhook failed', err);
      return res.status(502).json({ error: 'could not forward lead' });
    }
  } else {
    console.log('lead', lead);
  }
  return res.status(200).json({ ok: true });
}
