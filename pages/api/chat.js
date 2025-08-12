import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid request: 'message' is required" });
    }

    // 讀取 FAQ 資料
    const faqPath = path.join(process.cwd(), "data", "faq.json");
    let faqContent = "";
    if (fs.existsSync(faqPath)) {
      const faqData = JSON.parse(fs.readFileSync(faqPath, "utf8"));
      faqContent = faqData.map(item => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");
    } else {
      console.warn("⚠️ faq.json not found at", faqPath);
    }

    // 呼叫 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一個勞資問答機器人。以下是已知的常見問答資料，回答時請優先根據它們來回答，如果無法從中找到答案，再用你的知識回覆。\n\n${faqContent}`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "抱歉，我目前無法回答這個問題。";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Server Error",
      details: error.message,
    });
  }
}
