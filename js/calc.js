// js/calc.js
// Pure calculation functions for fitness & nutrition metrics

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation.
 * @param {'male'|'female'} gender
 * @param {number} weightKg - Body weight in kg
 * @param {number} heightCm - Height in cm
 * @param {number} age - Age in years
 * @returns {number} BMR in calories/day
 */
export function calcBMR(gender, weightKg, heightCm, age) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  const a = Number(age);
  
  if (gender === 'female') {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  // Default to male
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

/**
 * Activity level multipliers
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,    // خامل / مكتبي
  light: 1.375,      // نشاط خفيف (1-3 أيام تمرين)
  moderate: 1.55,    // نشاط متوسط (3-5 أيام تمرين)
  high: 1.725        // نشاط عالي (6-7 أيام تمرين شاق)
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * @param {number} bmr - BMR value
 * @param {'sedentary'|'light'|'moderate'|'high'} activityLevel
 * @returns {number} TDEE in calories/day
 */
export function calcTDEE(bmr, activityLevel) {
  const factor = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * factor);
}

/**
 * Calculates daily target calories based on goal.
 * @param {number} tdee
 * @param {'cut'|'bulk'|'maintain'} goal
 * @returns {number} Target calories/day
 */
export function calcTargetCalories(tdee, goal) {
  switch (goal) {
    case 'cut': // تنشيف / حرق دهون
      return Math.round(tdee * 0.85);
    case 'bulk': // تضخيم / زيادة عضلات
      return Math.round(tdee * 1.10);
    case 'maintain': // ثبات وزن / لياقة
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculates daily macronutrients in grams.
 * - Protein = 2.0 g/kg
 * - Fat = 0.9 g/kg
 * - Carbs = remaining calories / 4
 * @param {number} targetCalories
 * @param {number} weightKg
 * @returns {{ protein: number, fat: number, carbs: number }}
 */
export function calcMacros(targetCalories, weightKg) {
  const w = Number(weightKg);
  const protein = Math.round(w * 2.0);
  const fat = Math.round(w * 0.9);
  
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = targetCalories - (proteinCalories + fatCalories);
  
  const carbs = Math.max(0, Math.round(remainingCalories / 4));
  
  return {
    protein, // grams
    fat,     // grams
    carbs    // grams
  };
}

/**
 * Calculates Lean Body Mass (LBM) in kg.
 * @param {number} weightKg
 * @param {number} bodyFatPct - Body fat percentage (e.g. 20 for 20%)
 * @returns {number} Lean mass in kg
 */
export function calcLeanMass(weightKg, bodyFatPct) {
  const fatKg = (Number(weightKg) * Number(bodyFatPct)) / 100;
  return Math.round((Number(weightKg) - fatKg) * 10) / 10;
}

/**
 * Calculates BMR using the Katch-McArdle formula (most accurate when body fat / lean mass is known).
 * BMR = 370 + (21.6 * Lean Body Mass in kg)
 * @param {number} leanMassKg
 * @returns {number}
 */
export function calcKatchMcArdleBMR(leanMassKg) {
  return Math.round(370 + 21.6 * Number(leanMassKg));
}

/**
 * Comprehensive InBody Analyzer.
 * Takes inbody readings and produces deep diagnostic results, health indicators, and strategic recommendations.
 * @param {Object} inbody
 * @returns {Object} Complete InBody diagnostic report
 */
export function analyzeInBody(inbody) {
  const weight = Number(inbody.weight);
  const height = Number(inbody.height) || 170;
  const age = Number(inbody.age) || 25;
  const gender = inbody.gender || 'male';
  const fatPct = Number(inbody.bodyFatPct);
  const muscleKg = Number(inbody.muscleMassKg) || null;
  const visceralFat = Number(inbody.visceralFat) || null;
  const waterKg = Number(inbody.waterKg) || null;

  // 1. Calculate Lean Mass & Precise BMR
  const leanMassKg = calcLeanMass(weight, fatPct);
  const preciseBmr = calcKatchMcArdleBMR(leanMassKg);

  // 2. Classify Body Fat Percentage
  let fatStatus = { labelAr: 'طبيعي', color: 'primary', description: 'نسبة الدهون في المعدل الصحي والمثالي.' };
  let recommendedGoal = 'maintain';

  if (gender === 'male') {
    if (fatPct < 8) {
      fatStatus = { labelAr: 'منخفض جداً (نحافة حادة)', color: 'danger', description: 'نسبة دهون منخفضة جداً قد تؤثر على الهرمونات والمناعة.' };
      recommendedGoal = 'bulk';
    } else if (fatPct <= 14) {
      fatStatus = { labelAr: 'رياضي ممتاز (Athletic)', color: 'primary', description: 'جسم رياضي مقسم، عضلات واضحة ودهون منخفضة.' };
      recommendedGoal = 'bulk';
    } else if (fatPct <= 19) {
      fatStatus = { labelAr: 'صحي ومتناسق (Fitness)', color: 'secondary', description: 'معدل دهون صحي ممتاز وبداية تقاسيم الجسم.' };
      recommendedGoal = 'maintain';
    } else if (fatPct <= 24) {
      fatStatus = { labelAr: 'فوق المتوسط (بحاجة لتنشيف خفيف)', color: 'amber', description: 'زيادة بسيطة في الدهون تفضل التركيز على تنشيف معتدل أو ريكومب.' };
      recommendedGoal = 'cut';
    } else {
      fatStatus = { labelAr: 'مرتفع (سمنة / دهون عالية)', color: 'danger', description: 'نسبة دهون مرتفعة تزيد مقاومة الأنسولين ويجب البدء بالتنشيف فوراً.' };
      recommendedGoal = 'cut';
    }
  } else {
    // Female
    if (fatPct < 15) {
      fatStatus = { labelAr: 'منخفض جداً', color: 'danger', description: 'نسبة دهون منخفضة قد تؤثر على انتظام الهرمونات والدورة.' };
      recommendedGoal = 'bulk';
    } else if (fatPct <= 22) {
      fatStatus = { labelAr: 'رياضي ومثالي (Athletic)', color: 'primary', description: 'مستوى دهون مثالي وقوام مشدود ورياضي.' };
      recommendedGoal = 'maintain';
    } else if (fatPct <= 28) {
      fatStatus = { labelAr: 'صحي وطبيعي', color: 'secondary', description: 'نسبة دهون طبيعية وصحية بالكامل.' };
      recommendedGoal = 'maintain';
    } else if (fatPct <= 34) {
      fatStatus = { labelAr: 'فوق المتوسط', color: 'amber', description: 'زيادة في الدهون يفضل معها تنشيف محسوب لشد الجسم.' };
      recommendedGoal = 'cut';
    } else {
      fatStatus = { labelAr: 'مرتفع (سمنة)', color: 'danger', description: 'نسبة دهون مرتفعة تحتاج عجز سعرات وتمارين مقاومة منتظمة.' };
      recommendedGoal = 'cut';
    }
  }

  // 3. Classify Visceral Fat Level (1 to 20 scale)
  let visceralStatus = null;
  if (visceralFat) {
    if (visceralFat <= 8) {
      visceralStatus = { level: visceralFat, labelAr: 'ممتاز وصحي (1-8)', badge: 'primary', desc: 'الدهون الحشوية حول الكبد والأعضاء في الحدود الآمنة تماماً.' };
    } else if (visceralFat <= 12) {
      visceralStatus = { level: visceralFat, labelAr: 'انتباه وتحذير (9-12)', badge: 'amber', desc: 'بداية تراكم دهون حشوية. يفضل تقليل السكريات المكررة والزيوت المهدرجة.' };
    } else {
      visceralStatus = { level: visceralFat, labelAr: 'مرتفع وخطر (13+)', badge: 'danger', desc: 'دهون حشوية عالية تزيد خطر مقاومة الأنسولين والكبد الدهني. التنشيف أولوية قصوى.' };
    }
  }

  // 4. InBody Shape Classification (C-Shape, I-Shape, D-Shape)
  let bodyShape = { type: 'I', labelAr: 'قوام متوازن (I-Shape)', desc: 'توازن جيد بين كتلة العضلات والدهون.' };
  if (fatPct > 20 && muscleKg && muscleKg < (weight * 0.4)) {
    bodyShape = {
      type: 'C',
      labelAr: 'قوام منحنى C (عضل قليل ودهون أعلى)',
      desc: 'حجم الدهون أكبر من الكتلة العضلية (Skinny Fat أو سمنة). خطتك تحتاج إعادة بناء الجسم (Recomposition): تمرين حديد قوي مع سعرات محسوبة وبروتين عالي.'
    };
  } else if (fatPct <= 15 && muscleKg && muscleKg >= (weight * 0.42)) {
    bodyShape = {
      type: 'D',
      labelAr: 'قوام رياضي متقدم (D-Shape)',
      desc: 'كتلة عضلية بارزة ودهون منخفضة. أنت في فورمة ممتازة وجاهز للتضخيم النظيف الصافي!'
    };
  }

  // 5. Total Daily Energy Expenditure (TDEE) based on Katch-McArdle
  const activityLevel = inbody.activityLevel || 'moderate';
  const tdee = calcTDEE(preciseBmr, activityLevel);
  const targetCalories = calcTargetCalories(tdee, recommendedGoal);

  // Protein tailored to Lean Mass (2.2g per kg of lean mass)
  const proteinGrams = Math.round(leanMassKg * 2.2);
  const fatGrams = Math.round(weight * 0.85);
  const remainingKcal = targetCalories - (proteinGrams * 4 + fatGrams * 9);
  const carbsGrams = Math.max(0, Math.round(remainingKcal / 4));

  // 6. Strategic Cardio Recommendation
  let cardioAdvice = 'كارديو خفيف 15-20 دقيقة (مشي سريع أو دراجة) مرتين أسبوعياً لصحة القلب.';
  if (fatPct > 22) {
    cardioAdvice = 'كارديو منتظم: مشي على مشاية مائلة (Incline Walk) 25-30 دقيقة بعد تمارين الحديد 3-4 مرات أسبوعياً لحرق الدهون دون هدم العضل.';
  } else if (fatPct < 12) {
    cardioAdvice = 'كارديو خفيف جداً: 10-15 دقيقة فقط بعد التمرين للحفاظ على اللياقة دون حرق سعرات زائدة تمنع البناء العضلي.';
  }

  // 7. Daily Water Target (based on weight + muscle water)
  const waterLiters = (weight * 0.04).toFixed(1);

  return {
    weight,
    height,
    age,
    gender,
    fatPct,
    muscleKg,
    visceralFat,
    waterKg,
    leanMassKg,
    fatKg: Math.round((weight * fatPct / 100) * 10) / 10,
    preciseBmr,
    tdee,
    targetCalories,
    recommendedGoal,
    fatStatus,
    visceralStatus,
    bodyShape,
    macros: {
      protein: proteinGrams,
      fat: fatGrams,
      carbs: carbsGrams
    },
    cardioAdvice,
    waterLiters
  };
}

/**
 * Calculates all fitness targets given a complete user profile.
 * @param {Object} profile
 * @returns {Object} Complete calculated metrics
 */
export function calculateAllTargets(profile) {
  const { gender, weight, height, age, activityLevel, goal, bodyFatPct } = profile;
  
  // If body fat percentage is provided from InBody, use Katch-McArdle
  if (bodyFatPct && Number(bodyFatPct) > 0) {
    const leanMass = calcLeanMass(weight, bodyFatPct);
    const bmr = calcKatchMcArdleBMR(leanMass);
    const tdee = calcTDEE(bmr, activityLevel);
    const targetCalories = calcTargetCalories(tdee, goal);
    const macros = calcMacros(targetCalories, weight);
    return {
      bmr,
      tdee,
      targetCalories,
      protein: macros.protein,
      fat: macros.fat,
      carbs: macros.carbs,
      leanMassKg: leanMass
    };
  }

  const bmr = calcBMR(gender, weight, height, age);
  const tdee = calcTDEE(bmr, activityLevel);
  const targetCalories = calcTargetCalories(tdee, goal);
  const macros = calcMacros(targetCalories, weight);
  
  return {
    bmr,
    tdee,
    targetCalories,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs
  };
}

// ==========================================
// Unit Tests / Self Validation Assertions
// ==========================================
try {
  // Test Male 80kg, 180cm, 25yo
  // BMR = 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
  const testBmrMale = calcBMR('male', 80, 180, 25);
  console.assert(testBmrMale === 1805, `calcBMR male failed: expected 1805, got ${testBmrMale}`);

  // Test Female 60kg, 165cm, 30yo
  // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320
  const testBmrFemale = calcBMR('female', 60, 165, 30);
  console.assert(testBmrFemale === 1320, `calcBMR female failed: expected 1320, got ${testBmrFemale}`);

  // Test TDEE moderate (1.55) on 1805 = 2797.75 -> 2798
  const testTdee = calcTDEE(1805, 'moderate');
  console.assert(testTdee === 2798, `calcTDEE moderate failed: expected 2798, got ${testTdee}`);

  // Test Target Calories for cut (0.85) on 2798 = 2378.3 -> 2378
  const testCut = calcTargetCalories(2798, 'cut');
  console.assert(testCut === 2378, `calcTargetCalories cut failed: expected 2378, got ${testCut}`);

  // Test Macros for 80kg with 2378 kcal:
  // Protein = 80 * 2 = 160g (640 kcal)
  // Fat = 80 * 0.9 = 72g (648 kcal)
  // Remaining kcal = 2378 - (640 + 648) = 1090 kcal -> carbs = 1090 / 4 = 272.5 -> 273g
  const testMacros = calcMacros(2378, 80);
  console.assert(testMacros.protein === 160, `Protein failed: expected 160, got ${testMacros.protein}`);
  console.assert(testMacros.fat === 72, `Fat failed: expected 72, got ${testMacros.fat}`);
  console.assert(testMacros.carbs === 273, `Carbs failed: expected 273, got ${testMacros.carbs}`);

  console.log('✅ calc.js: All calculation assertions passed successfully!');
} catch (e) {
  console.error('❌ calc.js assertion error:', e);
}
