const OpenAI = require("openai");
const config = require("../config/env");

const SYSTEM_PROMPT = `You are a professional Chartered Accountant (CA) assistant for CA Shivanand & Choudhary, specializing in Indian taxation, GST, and corporate compliance. Provide accurate, helpful, and concise information about:

- Income Tax: slabs, deductions, ITR forms, deadlines
- GST: filing, registrations, compliance, GSTR forms
- ROC filings, TDS rules, company incorporation
- MSME regulations, compliance checklists

Always be professional, accurate, and helpful. If you're unsure, advise consulting a qualified CA.
Keep responses clear and well-structured.`;

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
