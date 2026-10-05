// AI caller brain. The browser sends the conversation so far; we return the agent's next line.
// Needs GEMINI_API_KEY (Vercel env var). GEMINI_MODEL is optional.
const MAX_TURNS = 24;
const MAX_CHARS = 500;

const LANGS = {
  en: 'English (Indian accent, simple words)',
  hi: 'Hinglish: Hindi mixed with common English words, written in Roman script',
  ml: 'Malayalam, written in Malayalam script',
  ta: 'Tamil, written in Tamil script',
};

const BUSINESSES = {
  education: { business: 'Livart Academy', offer: 'a course admission', visit: 'campus visit or counselling call' },
  realestate: { business: 'a property consultancy', offer: 'a property enquiry', visit: 'site visit' },
  coworking: { business: 'a coworking space', offer: 'a workspace enquiry', visit: 'site visit' },
  clinic: { business: 'a clinic', offer: 'a consultation', visit: 'consultation slot' },
  other: { business: 'our company', offer: 'your enquiry', visit: 'call with our team' },
};

function systemPrompt(lang, biz) {
  const b = BUSINESSES[biz] || BUSINESSES.other;
  return `You are a phone assistant calling a lead who just submitted an enquiry form for ${b.offer} at ${b.business}.
This is a demo. Speak ${LANGS[lang] || LANGS.en}.
Rules:
- In your first message say you are an AI assistant, greet the lead, and ask if it is a good time for a two minute chat.
- Ask ONE short question at a time, at most 2 sentences per turn, no lists, no emojis, no markdown.
- Qualify: what they are looking for, when they plan to start, budget (optional), preferred area.
- Then offer to book a ${b.visit} and confirm a day and time.
- If asked whether you are a human, say honestly that you are an AI.
- Never invent prices, discounts or availability; offer a callback from the team instead.
- If the person is annoyed, wants no calls, or asks for a human, apologise, offer a callback, and end.
- When the conversation is finished, end your last line with the token [END].`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'agent not configured yet' });

  const { lang = 'en', business = 'other', messages = [] } = req.body || {};
  if (!Array.isArray(messages) || messages.length > MAX_TURNS) {
    return res.status(400).json({ error: 'conversation too long' });
  }

  const contents = messages.map((m) => ({
    role: m.role === 'agent' ? 'model' : 'user',
    parts: [{ text: String(m.text || '').slice(0, MAX_CHARS) }],
  }));
  // Gemini needs a user turn to answer; the first call is the "call connects" cue.
  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    contents.push({ role: 'user', parts: [{ text: '(the lead picks up the phone)' }] });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(lang, business) }] },
          contents,
          generationConfig: { maxOutputTokens: 200, temperature: 0.6 },
        }),
      }
    );
    if (!r.ok) {
      console.error('gemini error', r.status, await r.text());
      return res.status(502).json({ error: 'model error' });
    }
    const data = await r.json();
    let text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const end = text.includes('[END]');
    text = text.replace('[END]', '').trim();
    return res.status(200).json({ text, end });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'model unreachable' });
  }
}
