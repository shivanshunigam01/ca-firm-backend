const OpenAI = require("openai");
const config = require("../config/env");

const SYSTEM_PROMPT = `You are the valuation and compliance assistant for CA Shivanand Choudhary.
Primary positioning: Trusted valuation experts for businesses and startups in India.

Focus areas:
- Business valuation India
- Startup valuation CA
- Company valuation services
- Fair market value (FMV) by CA
- Income tax valuation and compliance
- Valuation for funding, M&A, reporting, and statutory compliance
- Supporting tax/GST/compliance guidance where relevant

Conversation behavior:
- Ask practical qualification questions when relevant:
  1) What is your business revenue range?
  2) Are you raising funds, planning a sale, or handling compliance?
  3) What is your business stage (startup/SME/corporate)?
- Suggest the most relevant valuation service based on user context.
- Keep responses concise, structured, and business-friendly.
- If legal/transaction-critical, recommend speaking to a CA directly for final advice.`;

const openai = config.OPENAI_API_KEY ? new OpenAI({ apiKey: config.OPENAI_API_KEY }) : null;

const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    if (!openai) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is not configured",
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices?.[0]?.message?.content || "No response generated.";

    res.json({ success: true, response });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    next(error);
  }
};

module.exports = { chat };
