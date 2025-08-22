import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 直接內建問答資料
const qaData = [
  { question: "資遣費怎麼計算", answer: "依勞動基準法第17條第1項規定，每滿1年發給相當於1個月平均工資之資遣費。依前開計算之剩餘月數，或工作未滿1年者，以比例計給之。未滿1個月者以1個月計。例如：A勞工平均工資為30,000元，適用勞基法退休金規定工作年資為3年6個月15天，則舊制資遣費計約107,500元。" },
  { question: "加班費怎麼算", answer: "平日加班費為時薪1.33或1.66倍，休假日依法律計算。A勞工平均工資為30,000元，適用勞工退休金條例之工作年資為3年6個月15天，則新制資遣費計約53,125元。" },
  { question: "勞工可以拒絕加班嗎", answer: "勞工可在合理情況下拒絕加班，尤其超過法定上限或健康受影響時。" }
  { question: "特休天數計算", answer: "6個月以上1年未滿者，3日。1年以上2年未滿者，7日。2年以上3年未滿者，10日。3年以上5年未滿者，每年14日。5年以上10年未滿者，每年15日。10年以上者，每1年加給1日，加至30日為止。" }
  { question: "特休未休怎麼辦", answer: "依《勞動基準法》規定，年度終結或契約終止時若有未休完的特休天數，雇主應發給工資，或經勞雇雙方協商後遞延至次一年度。 特休換錢的計算方式是「未休天數× 勞工的1 日正常工資」。 1 日工資的計算為，若為在職員工，則以其年度終結前1 日的工資計算；若為離職員工，則以契約終止（離職日）前1 日的工資計算，月薪制者通常以月薪除以30 天。 
換錢的選擇 
1. 年度終結或契約終止時換錢：
依《勞基法》第38 條規定，若年度結束時或勞工離職時特休未休完，雇主應將剩餘天數換算成工資發給勞工。
2. 勞資協商遞延：
勞工與雇主協商後，可將未休完的特休遞延至次一年度實施。 但此為協商，並非強制，若雙方同意後遞延至次年，於次年年度終結或契約終止仍未休完的特休天數，雇主仍應發給工資。
計算公式 
未休完特休天數× 勞工的1 日正常工資:
在職員工：: 以年度終結前1 日的工資為準。
月薪制員工：: 以該月薪資除以30 天所得的金額作為1 日工資。
離職員工：: 以契約終止（離職日）前1 日的工資為準。" }
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




