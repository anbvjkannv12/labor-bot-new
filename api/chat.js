import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 直接內建問答資料
const qaData = [
  { question: "資遣費怎麼計算", answer: "依勞動基準法第17條第1項規定，每滿1年發給相當於1個月平均工資之資遣費。依前開計算之剩餘月數，或工作未滿1年者，以比例計給之。未滿1個月者以1個月計。例如：A勞工平均工資為30,000元，適用勞基法退休金規定工作年資為3年6個月15天，則舊制資遣費計約107,500元。" },
  { question: "加班費怎麼算", answer: "平日加班費為時薪1.33或1.66倍，休假日依法律計算。A勞工平均工資為30,000元，適用勞工退休金條例之工作年資為3年6個月15天，則新制資遣費計約53,125元。" },
  { question: "勞工可以拒絕加班嗎", answer: "勞工可在合理情況下拒絕加班，尤其超過法定上限或健康受影響時。" }
  { question: "特休天數計算", answer: "6個月以上1年未滿者，3日。1年以上2年未滿者，7日。2年以上3年未滿者，10日。3年以上5年未滿者，每年14日。5年以上10年未滿者，每年15日。10年以上者，每1年加給1日，加至30日為止。" }
 
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





