// pages/api/chat.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { question } = req.body;

  // 1. 讀取 faq.json
  const faqPath = path.join(process.cwd(), "data", "faq.json");
  const faqData = JSON.parse(fs.readFileSync(faqPath, "utf-8"));

  // 2. 把 Q&A 轉成文字
  const contextText = faqData
    .map(item => `Q: ${item.q}\nA: ${item.a}`)
    .join("\n\n");

  try {
    // 3. 呼叫 OpenAI API
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 你可以換成 gpt-4o 或 gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content:
              "你是一個專門回答台灣勞資問題的客服助理。" +
              "以下是你可以參考的知識資料：\n\n" +
              contextText +
              "\n\n當用戶的問題和資料無關時，請根據你的專業知識回答。"
          },
          { role: "user", content: question }
        ],
        temperature: 0.7
      }),
    });

    const data = await r.json();

    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
