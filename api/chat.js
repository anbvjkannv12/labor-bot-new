import OpenAI from "openai";
import stringSimilarity from "string-similarity";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const qaData = [
  {
    question: "資遣費應如何計算？",
    answer: `依《勞動基準法》第17條...`,
  },
  {
    question: "加班費應如何計算？",
    answer: `依《勞動基準法》第24條...`,
  },
  // ... 其他 QA
];

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // 模糊比對
    const questions = qaData.map((q) => q.question);
    const match = stringSimilarity.findBestMatch(question, questions);
    const bestMatch =
      match.bestMatch.rating > 0.5 ? qaData[match.bestMatchIndex] : null;

    let context = bestMatch
      ? `以下是參考資料：\n${bestMatch.question}\n${bestMatch.answer}`
      : "沒有找到相關資料，請直接回覆「目前無相關資訊」。";

    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是一個勞資專家。請嚴格依據提供的參考資料回答，不能自行發揮。如果沒有提供相關資料，請回覆「目前無相關資訊」。",
        },
        {
          role: "user",
          content: `${context}\n\n使用者的問題：${question}`,
        },
      ],
    });

    const answer = completion.choices[0].message.content;

    res.status(200).json({ answer });
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Server error" });
  }
}
