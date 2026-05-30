const asyncHandler = require('../utils/asyncHandler');
const OpenAI = require('openai');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Lazily create the client so the server still boots if the key is absent.
let client = null;
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
};

const systemPrompt = (user) => `You are EduSphere's friendly AI study assistant.
You are helping ${user?.name || 'a student'} (role: ${user?.role || 'student'}).
Help students understand concepts, summarise lecture topics, explain problems step by step,
suggest study strategies, and answer academic questions clearly and concisely.
You can also explain how to use the EduSphere platform (submitting assignments, checking grades,
attendance, watching recorded lectures). Keep answers focused, encouraging, and easy to read.
Use short paragraphs or bullet points. If asked something outside academics or the platform,
gently steer back to studying.`;

// @route POST /api/chat  (auth)
// body: { message: string, history?: [{ role, content }] }
exports.chat = asyncHandler(async (req, res) => {
  const openai = getClient();
  if (!openai) {
    res.status(503);
    throw new Error('AI assistant is not configured (missing OPENAI_API_KEY)');
  }

  const { message, history = [] } = req.body;
  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Keep only the last 10 turns to bound token usage.
  const trimmed = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-10)
    : [];

  const messages = [
    { role: 'system', content: systemPrompt(req.user) },
    ...trimmed.map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) })),
    { role: 'user', content: message.slice(0, 4000) },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.5,
      max_tokens: 600,
    });
    const reply = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't respond.";
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(502);
    throw new Error('The AI assistant is temporarily unavailable. Please try again.');
  }
});
