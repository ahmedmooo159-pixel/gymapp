// js/plans.js
// Workout plan templates, schedule generator, and today's workout selector

let cachedExercises = null;

/**
 * Loads exercises from /data/exercises.json
 * @returns {Promise<Array>}
 */
export async function loadExercises() {
  if (cachedExercises) return cachedExercises;
  try {
    const res = await fetch('./data/exercises.json');
    if (!res.ok) throw new Error('Failed to load exercises');
    cachedExercises = await res.json();
    return cachedExercises;
  } catch (err) {
    console.error('Error loading exercises:', err);
    return [];
  }
}

/**
 * Checks if an exercise is compatible with user equipment
 * @param {string} exEquipment
 * @param {'gym'|'dumbbells'|'bodyweight'} userEquipment
 * @returns {boolean}
 */
export function isEquipmentAllowed(exEquipment, userEquipment) {
  if (userEquipment === 'gym') return true; // full gym has everything
  if (userEquipment === 'dumbbells') return exEquipment === 'dumbbells' || exEquipment === 'bodyweight';
  if (userEquipment === 'bodyweight') return exEquipment === 'bodyweight';
  return true;
}

/**
 * Filters a pool of exercise IDs based on equipment, replacing with fallback if necessary
 * @param {Array<string>} exerciseIds
 * @param {Array} allExercises
 * @param {'gym'|'dumbbells'|'bodyweight'} userEquipment
 * @returns {Array} List of full exercise objects
 */
export function filterAndHydrateExercises(exerciseIds, allExercises, userEquipment = 'gym') {
  const exMap = new Map(allExercises.map(e => [e.id, e]));
  const result = [];

  for (const id of exerciseIds) {
    const ex = exMap.get(id);
    if (!ex) continue;

    if (isEquipmentAllowed(ex.equipment, userEquipment)) {
      result.push(ex);
    } else {
      // Find fallback for the same muscle group compatible with user's equipment
      const fallback = allExercises.find(e => 
        e.muscleGroup === ex.muscleGroup && 
        isEquipmentAllowed(e.equipment, userEquipment) &&
        !result.some(r => r.id === e.id)
      );
      if (fallback) {
        result.push(fallback);
      } else {
        // As last resort, include the exercise
        result.push(ex);
      }
    }
  }

  return result;
}

/**
 * Base Plan Blueprints (with default ideal gym exercise IDs)
 */
export const WORKOUT_BLUEPRINTS = {
  // 3-Day Full Body Split
  full_body_a: {
    id: 'full_body_a',
    nameAr: 'تمرين شامل (أ) - فول بودي',
    nameEn: 'Full Body A',
    descriptionAr: 'تمرين شامل لجميع العضلات الأساسية لزيادة القوة وبناء الأساس.',
    targetMuscles: ['صدر', 'ظهر', 'أرجل', 'أكتاف', 'تراي', 'بطن'],
    exerciseIds: [
      'bench_press_barbell',
      'lat_pulldown',
      'barbell_back_squat',
      'dumbbell_lateral_raise',
      'tricep_rope_pushdown',
      'crunches'
    ]
  },
  full_body_b: {
    id: 'full_body_b',
    nameAr: 'تمرين شامل (ب) - فول بودي',
    nameEn: 'Full Body B',
    descriptionAr: 'تمرين شامل مع التركيز على عضلات السحب والخلفيات والأكتاف.',
    targetMuscles: ['أرجل وخلفيات', 'ظهر', 'صدر', 'أكتاف', 'باي', 'كور'],
    exerciseIds: [
      'romanian_deadlift_dumbbells',
      'seated_cable_row',
      'incline_dumbbell_press',
      'overhead_dumbbell_shoulder_press',
      'barbell_bicep_curl',
      'plank'
    ]
  },

  // 4-Day Upper / Lower Split
  upper_a: {
    id: 'upper_a',
    nameAr: 'جزء علوي (أ) - Upper A',
    nameEn: 'Upper Body A',
    descriptionAr: 'تركيز على قوة الصدر والظهر والأكتاف والذراعين.',
    targetMuscles: ['صدر', 'ظهر', 'أكتاف', 'تراي', 'باي'],
    exerciseIds: [
      'bench_press_barbell',
      'lat_pulldown',
      'overhead_dumbbell_shoulder_press',
      'seated_cable_row',
      'dumbbell_lateral_raise',
      'tricep_rope_pushdown',
      'barbell_bicep_curl'
    ]
  },
  lower_a: {
    id: 'lower_a',
    nameAr: 'جزء سفلي وبطن (أ) - Lower A',
    nameEn: 'Lower Body & Core A',
    descriptionAr: 'تمرين قوي للأرجل الأمامية والخلفية والسمانة وعضلات البطن.',
    targetMuscles: ['أرجل أمامية', 'خلفيات', 'جلوتس', 'سمانة', 'بطن'],
    exerciseIds: [
      'barbell_back_squat',
      'romanian_deadlift_dumbbells',
      'leg_press_machine',
      'leg_extension_machine',
      'standing_calf_raise',
      'lying_leg_raise'
    ]
  },
  upper_b: {
    id: 'upper_b',
    nameAr: 'جزء علوي (ب) - Upper B',
    nameEn: 'Upper Body B',
    descriptionAr: 'تنويع زوايا الصدر والظهر لتفعيل ألياف عضلية إضافية.',
    targetMuscles: ['صدر علوي', 'ظهر', 'أكتاف جانبي وخلفي', 'ذراعين'],
    exerciseIds: [
      'incline_dumbbell_press',
      'one_arm_dumbbell_row',
      'dumbbell_lateral_raise',
      'face_pull_cable',
      'overhead_dumbbell_tricep_extension',
      'hammer_curls'
    ]
  },
  lower_b: {
    id: 'lower_b',
    nameAr: 'جزء سفلي وبطن (ب) - Lower B',
    nameEn: 'Lower Body & Core B',
    descriptionAr: 'تركيز على الجلوتس والخلفيات وطعنات الأرجل.',
    targetMuscles: ['أرجل', 'جلوتس', 'خلفيات', 'بطن'],
    exerciseIds: [
      'goblet_squat',
      'dumbbell_lunges',
      'hip_thrust_dumbbell',
      'lying_leg_curl',
      'standing_calf_raise',
      'plank'
    ]
  },

  // 5/6-Day Push / Pull / Legs Split
  push_a: {
    id: 'push_a',
    nameAr: 'يوم الدفع (أ) - Push A',
    nameEn: 'Push A (Chest, Shoulders, Triceps)',
    descriptionAr: 'عضلات الدفع: الصدر المستوي والعلوي، الأكتاف الأمامية والجانبية، والتراي سيبس.',
    targetMuscles: ['صدر', 'أكتاف', 'تراي'],
    exerciseIds: [
      'bench_press_barbell',
      'incline_dumbbell_press',
      'overhead_dumbbell_shoulder_press',
      'dumbbell_lateral_raise',
      'tricep_rope_pushdown',
      'bench_dips'
    ]
  },
  pull_a: {
    id: 'pull_a',
    nameAr: 'يوم السحب (أ) - Pull A',
    nameEn: 'Pull A (Back, Rear Delts, Biceps)',
    descriptionAr: 'عضلات السحب: الظهر العلوي وعرض الظهر، الأكتاف الخلفية، والباي سيبس.',
    targetMuscles: ['ظهر', 'كتف خلفي', 'باي', 'بطن'],
    exerciseIds: [
      'lat_pulldown',
      'seated_cable_row',
      'one_arm_dumbbell_row',
      'face_pull_cable',
      'barbell_bicep_curl',
      'hammer_curls'
    ]
  },
  legs_a: {
    id: 'legs_a',
    nameAr: 'يوم الأرجل والكور (أ) - Legs A',
    nameEn: 'Legs & Core A',
    descriptionAr: 'تمرين شامل للأرجل الأمامية والخلفية والسمانة والبطن.',
    targetMuscles: ['أرجل', 'خلفيات', 'سمانة', 'بطن'],
    exerciseIds: [
      'barbell_back_squat',
      'leg_press_machine',
      'romanian_deadlift_dumbbells',
      'leg_extension_machine',
      'standing_calf_raise',
      'crunches'
    ]
  },
  push_b: {
    id: 'push_b',
    nameAr: 'يوم الدفع (ب) - Push B',
    nameEn: 'Push B (Chest & Shoulders Focus)',
    descriptionAr: 'تركيز على الزاوية العالية للصدر ورفرفة الأكتاف.',
    targetMuscles: ['صدر', 'أكتاف', 'تراي'],
    exerciseIds: [
      'incline_dumbbell_press',
      'dumbbell_bench_press',
      'cable_lateral_raise',
      'rear_delt_dumbbell_fly',
      'overhead_dumbbell_tricep_extension',
      'diamond_pushups'
    ]
  },
  pull_b: {
    id: 'pull_b',
    nameAr: 'يوم السحب (ب) - Pull B',
    nameEn: 'Pull B (Lats & Arms Focus)',
    descriptionAr: 'تركيز على كثافة الظهر وعزل الباي سيبس.',
    targetMuscles: ['ظهر', 'باي', 'بطن'],
    exerciseIds: [
      'barbell_bent_over_row',
      'lat_pulldown',
      'bent_over_dumbbell_row',
      'bicep_cable_curl',
      'dumbbell_bicep_curl',
      'hanging_leg_raise'
    ]
  },
  legs_b: {
    id: 'legs_b',
    nameAr: 'يوم الأرجل (ب) - Legs B',
    nameEn: 'Legs & Glutes B',
    descriptionAr: 'تركيز على الجلوتس والخلفيات مع تمرين طعنات.',
    targetMuscles: ['أرجل', 'جلوتس', 'خلفيات', 'بطن'],
    exerciseIds: [
      'goblet_squat',
      'dumbbell_lunges',
      'hip_thrust_dumbbell',
      'lying_leg_curl',
      'standing_calf_raise',
      'russian_twists'
    ]
  }
};

/**
 * Weekly Schedules mapping (Saturday to Friday or standard Sunday to Saturday)
 * In Egypt & Arab region, week starts Saturday (index 6 in JS Date or day 0 in Arab format).
 * We handle standard 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday.
 */
export const WEEK_DAYS = [
  { index: 6, key: 'saturday', nameAr: 'السبت', shortAr: 'سبت' },
  { index: 0, key: 'sunday', nameAr: 'الأحد', shortAr: 'أحد' },
  { index: 1, key: 'monday', nameAr: 'الإثنين', shortAr: 'إثنين' },
  { index: 2, key: 'tuesday', nameAr: 'الثلاثاء', shortAr: 'ثلاثاء' },
  { index: 3, key: 'wednesday', nameAr: 'الأربعاء', shortAr: 'أربعاء' },
  { index: 4, key: 'thursday', nameAr: 'الخميس', shortAr: 'خميس' },
  { index: 5, key: 'friday', nameAr: 'الجمعة', shortAr: 'جمعة' }
];

/**
 * Returns weekly schedule mapping of day index -> workout blueprint key or null (rest)
 * @param {number} trainingDaysPerWeek (3, 4, 5, 6)
 * @returns {Object} map of dayIndex (0-6) to blueprintId or null
 */
export function getWeeklyScheduleBlueprint(trainingDaysPerWeek) {
  const days = Number(trainingDaysPerWeek) || 3;

  switch (days) {
    case 3:
      // Sat: Full Body A, Sun: Rest, Mon: Full Body B, Tue: Rest, Wed: Full Body A, Thu: Rest, Fri: Rest
      return {
        6: 'full_body_a', // Sat
        0: null,          // Sun (Rest)
        1: 'full_body_b', // Mon
        2: null,          // Tue (Rest)
        3: 'full_body_a', // Wed
        4: null,          // Thu (Rest)
        5: null           // Fri (Rest)
      };

    case 4:
      // Sat: Upper A, Sun: Lower A, Mon: Rest, Tue: Upper B, Wed: Lower B, Thu: Rest, Fri: Rest
      return {
        6: 'upper_a',     // Sat
        0: 'lower_a',     // Sun
        1: null,          // Mon (Rest)
        2: 'upper_b',     // Tue
        3: 'lower_b',     // Wed
        4: null,          // Thu (Rest)
        5: null           // Fri (Rest)
      };

    case 5:
      // Sat: Push A, Sun: Pull A, Mon: Legs A, Tue: Rest, Wed: Upper B, Thu: Lower B, Fri: Rest
      return {
        6: 'push_a',      // Sat
        0: 'pull_a',      // Sun
        1: 'legs_a',      // Mon
        2: null,          // Tue (Rest)
        3: 'upper_b',     // Wed
        4: 'lower_b',     // Thu
        5: null           // Fri (Rest)
      };

    case 6:
      // Sat: Push A, Sun: Pull A, Mon: Legs A, Tue: Push B, Wed: Pull B, Thu: Legs B, Fri: Rest
      return {
        6: 'push_a',      // Sat
        0: 'pull_a',      // Sun
        1: 'legs_a',      // Mon
        2: 'push_b',      // Tue
        3: 'pull_b',      // Wed
        4: 'legs_b',      // Thu
        5: null           // Fri (Rest)
      };

    default:
      return getWeeklyScheduleBlueprint(3);
  }
}

/**
 * Returns full populated weekly schedule for user
 * @param {Object} userProfile
 * @param {Array} allExercises
 * @returns {Array} List of 7 days with workout information
 */
export function getFullWeeklySchedule(userProfile, allExercises) {
  const trainingDays = userProfile?.trainingDays || 3;
  const equipment = userProfile?.equipment || 'gym';
  const blueprintMap = getWeeklyScheduleBlueprint(trainingDays);

  return WEEK_DAYS.map(day => {
    const blueprintKey = blueprintMap[day.index];
    if (!blueprintKey) {
      return {
        ...day,
        isRestDay: true,
        workout: null
      };
    }

    const blueprint = WORKOUT_BLUEPRINTS[blueprintKey];
    const exercises = filterAndHydrateExercises(blueprint.exerciseIds, allExercises, equipment);

    return {
      ...day,
      isRestDay: false,
      workout: {
        ...blueprint,
        exercises
      }
    };
  });
}

/**
 * Gets workout details for today (or specified date)
 * @param {Object} userProfile
 * @param {Array} allExercises
 * @param {Date} [targetDate]
 * @returns {{ isRestDay: boolean, workout: Object|null, dayInfo: Object }}
 */
export function getTodaysWorkout(userProfile, allExercises, targetDate = new Date()) {
  const dayIndex = targetDate.getDay();
  const fullSchedule = getFullWeeklySchedule(userProfile, allExercises);
  const todaySchedule = fullSchedule.find(d => d.index === dayIndex) || fullSchedule[0];

  return {
    isRestDay: todaySchedule.isRestDay,
    workout: todaySchedule.workout,
    dayInfo: {
      nameAr: todaySchedule.nameAr,
      shortAr: todaySchedule.shortAr,
      index: todaySchedule.index,
      dateString: targetDate.toISOString().split('T')[0]
    }
  };
}
