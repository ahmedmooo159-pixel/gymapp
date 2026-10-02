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
 * Calculates all fitness targets given a complete user profile.
 * @param {Object} profile
 * @returns {Object} Complete calculated metrics
 */
export function calculateAllTargets(profile) {
  const { gender, weight, height, age, activityLevel, goal } = profile;
  
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
