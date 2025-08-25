import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const qaData = [
  {
    question: "資遣費應如何計算？",
    answer: `1. 依《勞動基準法》第17條第1項，於同一雇主之事業單位繼續工作每滿一年，發給一個月平均工資；未滿一年則依比例計給之；未滿一個月，以一個月計。
例如：月薪為45000元，工作7年4個月又13天，則應計給資遣費「45000*7+45000*(5/12)=333,750元」。
2. 以上為民國94年7月1日前之舊制計算方式。
3. 新制資遣費計算，依《勞工退休金條例》第12條第1項規定，每滿一年僅發給半個月工資，未滿一年依比例計給之。總和最大不超過6個月。
例如：月薪為36000元，工作18年4個月又10天，則應計給資遣費「36000*0.5*18 + 36000*0.5*(4/12) + 36000*0.5*(10/365) = 330,493.151，上限為36000*6=216000元」。
4. 當工作年資有跨越民國94年7月1日者，得選擇繼續使用舊制。
5. 雇主應於終止勞動契約後30日內發給。`
  },
  {
    question: "加班費應如何計算？",
    answer: `依《勞動基準法》第24條第1項，加班費應如下：
1. 加班2小時內，按平日時薪加給至少1/3。
2. 再加班2小時以內，按平日時薪加給至少2/3。
3. 因特殊狀況（天災、事變或突發事件），依同法第32條第4項而加班者，按平日時薪2倍發給。
4. 第2項規定，於同法第36條所定之休息日（即例假日等）工作，加班2小時內應加給至少1又1/3；2小時以上則至少1又2/3。`
  },
  {
    question: "特休天數如何計算？",
    answer: `依《勞動基準法》第38條，於同一雇主或事業單位繼續工作：
1. 6個月～1年未滿，3天/年
2. 1年～2年未滿，7天/年
3. 2年～3年未滿，10天/年
4. 3年～5年未滿，14天/年
5. 5年～10年未滿，15天/年
6. 10年以上，每年增加1日，最多30日`
  },
  {
    question: "特休未休要如何換算工資？",
    answer: `即每日發給一日之工資。例如，月薪32000元，特休12天，8天未休，則應發給「32000/30*8=8533元」。`
  }
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

