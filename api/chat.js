import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const qaData = [
  { question: "資遣費怎麼計算", answer: "..." },
  { question: "加班費怎麼算", answer: "..." },
  { question: "特休天數如何計算", answer: "..." },
  { question: "特休未休要如何換算工資？", answer: "..." },
];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });

    // 改進比對：直接忽略大小寫
    let relevantQA = qaData.find((q) =>
      question.toLowerCase().includes(q.question.toLowerCase())
    );

    let context = relevantQA
      ? `以下是參考資料：${relevantQA.question} - ${relevantQA.answer}`
      : "無相關資料，請依勞基法與常見勞資規範回答。";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一個勞資專家，請依據參考資料回答問題。",
        },
        { role: "user", content: `${context}\n\n使用者的問題：${question}` },
      ],
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
