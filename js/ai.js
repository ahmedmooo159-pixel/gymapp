// js/ai.js
// AI Coach Integration using AIML API + Smart Fallback Knowledge Base

export const AI_CONFIG = {
  apiKey: "f759a8840103c9bb8f10dea53fa84218",
  endpoint: "https://api.aimlapi.com/v1/chat/completions",
  model: "gpt-4o-mini" // Supported models: gpt-4o-mini, google/gemini-1.5-flash, etc.
};

export const COACH_SYSTEM_PROMPT = `أنت "كابتن وحش الجيم" - مدرب جيم مصري ودود ومحترف وصبور مع المبتدئين.
القواعد والتعليمات الصارمة:
1. تحدث دائماً باللغة العربية البسيطة واللهجة المصرية الشعبية الراقية والمشجعة (يا بطل، عاش يا وحش، تمام يا كوتش).
2. اجعل إجاباتك مختصرة ومباشرة وفي نقاط واضحة تناسب شخص يقرأ في الجيم.
3. ركز دائماً على الأداء والتكنيك الصحيح، مسار الحركة، والأمان قبل زيادة الأوزان.
4. ممنوع منعاً باتاً تقديم أي نصائح طبية أو تشخيص إصابات أو وصف علاجات. إذا اشتكى المستخدم من ألم حاد أو شك في إصابة بمفصل، وجهه فوراً وباستمرار لاستشارة طبيب عظام أو أخصائي علاج طبيعي.
5. شجع اللاعب وادعمه دائماً بالروح الرياضية الإيجابية.`;

/**
 * Sends a prompt to the AI Coach and returns the generated reply.
 * Gracefully falls back to the internal gym knowledge engine if the API quota is depleted or network is offline.
 * @param {string} userMessage
 * @param {Array<{role: 'user'|'assistant'|'system', content: string}>} [history]
 * @param {Object} [userContext]
 * @returns {Promise<string>}
 */
export async function askAICoach(userMessage, history = [], userContext = null) {
  const contextSnippet = userContext ? 
    `\n[معلومات اللاعب: السن ${userContext.age || '-'}، الوزن ${userContext.weight || '-'} كجم، الهدف: ${userContext.goal || '-'}، نسبة الدهون: ${userContext.bodyFatPct || '-'}%]` 
    : '';

  const messages = [
    { role: "system", content: COACH_SYSTEM_PROMPT + contextSnippet },
    ...history.slice(-6), // last 6 turns
    { role: "user", content: userMessage }
  ];

  try {
    const res = await fetch(AI_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_CONFIG.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    const data = await res.json();

    if (res.ok && data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }

    // If out of credits or rate limited, log and fallback
    console.warn("AIML API notice (balance/quota):", data.message || data.error?.message);
    return getSmartFallbackReply(userMessage, userContext);

  } catch (err) {
    console.warn("AI network request failed, switching to local knowledge engine:", err);
    return getSmartFallbackReply(userMessage, userContext);
  }
}

/**
 * Generates an exercise form and safety explanation.
 * @param {Object} exercise
 * @param {Object} [userContext]
 * @returns {Promise<string>}
 */
export async function explainExerciseAI(exercise, userContext = null) {
  const prompt = `اشرح لي تمرين "${exercise.nameAr}" (${exercise.nameEn}) لمبتدئ في الجيم:
1. التكنيك الصحيح وطريقة التنفس.
2. أهم غلطتين شائعتين لازم أتجنبهم.
3. نصيحة أمان لحماية المفاصل.`;

  return askAICoach(prompt, [], userContext);
}

/**
 * Local offline knowledge engine for intelligent Egyptian gym coach replies.
 * @param {string} query
 * @param {Object} [userContext]
 * @returns {string}
 */
export function getSmartFallbackReply(query, userContext = null) {
  const q = query.toLowerCase();

  if (q.includes('ألم') || q.includes('وجع') || q.includes('اصابة') || q.includes('إصابة') || q.includes('مفصل') || q.includes('غضروف') || q.includes('ركبتي') || q.includes('كتفي')) {
    return "سلامتك ألف سلامة يا بطل! 🛑\nلو الوجع ده في المفاصل أو الأوتار أو حسيت بـ طقطقة مصحوبة بألم حاد، **وقف التمرين فوراً وماتتمرنش عليه أبداً**.\nصحتك ومفاصلك أهم من أي تمرين. ريح العضلة المصابة، واستشر دكتور عظام أو أخصائي علاج طبيعي عشان يشخص الحالة صح وتتجنب تفاقم الإصابة! 💪";
  }

  if (q.includes('تنفس') || q.includes('نفس')) {
    return "قاعدة التنفس الذهبية في الجيم يا وحش:\n1. **الزفير (طلع نفسك)**: مع المجهود وأنت بترفع أو تدفع الوزن.\n2. **الشهيق (خد نفس عميق)**: وأنت نازل بالوزن براحة وبتحكم كامل.\n⚠️ أوعى تكتم نفسك أثناء الرفعة عشان تحافظ على ضغط دمك ثابت وتوصل الأكسجين للعضلات.";
  }

  if (q.includes('وزن') || q.includes('أوزان') || q.includes('اوزان') || q.includes('أثقال')) {
    return "كمبتدئ، اختار وزن تقدر تلعب بيه من **8 لـ 12 عدة** بتكنيك سليم 100% وبدون مرجحة بالظهر أو الأكتاف.\nالعدة الأخيرة لازم تكون صعبة بس تطلع مظبوطة. لو التكنيك اتأثر عشان الوزن تقيل، نزل الوزن فوراً لأن العضلة بتكبر بالمدى الحركي الكامل مش بالأوزان العشوائية!";
  }

  if (q.includes('ماية') || q.includes('مياه') || q.includes('عطش') || q.includes('سوائل')) {
    return "اشرب رشفات ماء بسيطة بين المجموعات كل 10-15 دقيقة (حوالي 500 مل على مدار جلسة التمرين ككل).\nوخلال اليوم ككل، حافظ على شرب من **3 إلى 4 لتر ماء** يومياً لأن جفاف العضلة بيقلل قوتك وأدائك بنسبة تفوق 15%!";
  }

  if (q.includes('تكسير') || q.includes('عضلاتي') || q.includes('تاني يوم') || q.includes('شد') || q.includes('doms')) {
    return "ده اسمه (DOMS) أو وجع الاستشفاء العضلي الطبيعي بعد تمرين جديد، ومفيش منه قلق! 💪\nعلاجه السريع:\n1. اشرب ماية كتير.\n2. نام من 7 لـ 8 ساعات بالليل.\n3. التزم باحتياجك من البروتين كامل.\n4. مشي خفيف لتنشيط الدورة الدموية.";
  }

  if (q.includes('كرياتين') || q.includes('مكمل') || q.includes('واي بروتين') || q.includes('مكملات')) {
    return "المكملات الغذائية وسيلة مساعدة وليست سحر! الأهم أولاً تظبط أكلك الطبيعي (الفراخ، البيض، التونة، الرز، والشوفان).\nإذا كان أكلك ناقص بروتين تقدر تاخد سكوب واي بروتين، والكرياتين ممتاز لزيادة القوة ولكن بعد ما تلتزم وتفهم التكنيك الصح أول شهرين.";
  }

  return "يا هلا بيك يا بطل! أهم 3 قواعد ذهبية ليك في البداية:\n1. **التكنيك أولاً** ثم زيادة الأوزان بالتدريج.\n2. **الأكل والنوم 8 ساعات** هما سر بناء العضلات الحقيقي.\n3. **الاستمرار والانضباط** حتى لو يومك زحمة.\nأنا معاك في أي وقت تسألني فيه عن أي تمرين أو وجبة! عاش يا وحش 💪🔥";
}
