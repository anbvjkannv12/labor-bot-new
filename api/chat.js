import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // 讀取本地問答資料
    const qaPath = path.join(process.cwd(), "data", "qa.json");
    const qaData = JSON.parse(fs.readFileSync(qaPath, "utf8"));

    // 簡單比對關鍵字
    let relevantQA = qaData.find(q => question.includes(q.question.split("？")[0])) || null;
    let context = relevantQA
      ? `以下是參考資料：\n${relevantQA.question} - ${relevantQA.answer}`
      : "無相關資料";

    // 呼叫 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是一個勞資專家，請依據參考資料與法律回答問題。" },
        { role: "user", content: `${context}\n\n使用者的問題是：${question}` }
      ]
    });

    res.status(200).json({ answer: completion.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
