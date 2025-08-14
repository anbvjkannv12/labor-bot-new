import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 直接內建問答資料
const qaData = [
  { question: "資遣費怎麼計算", answer: "依《勞基法》第17條，每滿一年給一個月薪資，不滿一年按比例計算。" },
  { question: "加班費怎麼算", answer: "平日加班費為時薪1.33或1.66倍，休假日依法律計算。" },
  { question: "勞工可以拒絕加班嗎", answer: "勞工可在合理情況下拒絕加班，尤其超過法定上限或健康受影響時。" }
];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });

    // 關鍵字搜尋
    let relevantQA = qaData.find(q => question.includes(q.question)) || null;
    let context = relevantQA
      ? `以下是參考資料：${relevantQA.question} - ${relevantQA.answer}`
      : "無相關資料";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "你是一個勞資專家，請依據參考資料回答問題。" },
        { role: "user", content: `${context}\n\n使用者的問題：${question}` }
      ]
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
