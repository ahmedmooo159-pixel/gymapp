// js/db.js
// Firestore read/write helpers
import { db } from "./firebase-config.js";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/**
 * Saves or updates user profile document at users/{uid}
 * @param {string} uid
 * @param {Object} data
 * @returns {Promise<void>}
 */
export async function saveUserProfile(uid, data) {
  if (!uid) throw new Error("UID is required to save user profile");
  const userRef = doc(db, "users", uid);
  const payload = {
    ...data,
    updatedAt: serverTimestamp()
  };
  // If first time creating, set createdAt
  return setDoc(userRef, payload, { merge: true });
}

/**
 * Gets user profile document from users/{uid}
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Saves a completed workout session to users/{uid}/workoutLogs/{dateStr}
 * @param {string} uid
 * @param {string} dateStr - e.g. "2026-10-02"
 * @param {Object} workoutData
 * @returns {Promise<void>}
 */
export async function saveWorkoutLog(uid, dateStr, workoutData) {
  if (!uid || !dateStr) throw new Error("UID and dateStr required");
  const logRef = doc(db, "users", uid, "workoutLogs", dateStr);
  const payload = {
    ...workoutData,
    date: dateStr,
    timestamp: serverTimestamp()
  };
  return setDoc(logRef, payload, { merge: true });
}

/**
 * Retrieves a single workout log by date
 * @param {string} uid
 * @param {string} dateStr
 * @returns {Promise<Object|null>}
 */
export async function getWorkoutLogByDate(uid, dateStr) {
  if (!uid || !dateStr) return null;
  const logRef = doc(db, "users", uid, "workoutLogs", dateStr);
  const snap = await getDoc(logRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Retrieves recent workout logs sorted by date desc
 * @param {string} uid
 * @param {number} limitCount
 * @returns {Promise<Array>}
 */
export async function getWorkoutLogs(uid, limitCount = 30) {
  if (!uid) return [];
  const logsCol = collection(db, "users", uid, "workoutLogs");
  const q = query(logsCol, orderBy("date", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  const logs = [];
  snap.forEach(d => logs.push({ id: d.id, ...d.data() }));
  return logs;
}

/**
 * Saves a weight entry at users/{uid}/weightHistory/{dateStr} and updates profile current weight
 * @param {string} uid
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} weight - in kg
 * @returns {Promise<void>}
 */
export async function saveWeightRecord(uid, dateStr, weight) {
  if (!uid || !dateStr) throw new Error("UID and dateStr are required");
  const numericWeight = Number(weight);
  const recordRef = doc(db, "users", uid, "weightHistory", dateStr);
  
  await setDoc(recordRef, {
    date: dateStr,
    weight: numericWeight,
    timestamp: serverTimestamp()
  }, { merge: true });

  // Update current weight in user profile as well
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { weight: numericWeight, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Gets full weight history ordered by date ascending for charts
 * @param {string} uid
 * @returns {Promise<Array<{date: string, weight: number}>>}
 */
export async function getWeightHistory(uid) {
  if (!uid) return [];
  const colRef = collection(db, "users", uid, "weightHistory");
  const q = query(colRef, orderBy("date", "asc"));
  const snap = await getDocs(q);
  const history = [];
  snap.forEach(d => {
    const data = d.data();
    history.push({
      date: data.date || d.id,
      weight: data.weight
    });
  });
  return history;
}

/**
 * Finds the most recent logged sets for a specific exercise ID to display as previous reference
 * @param {string} uid
 * @param {string} exerciseId
 * @returns {Promise<Array<{setNumber: number, weight: number|string, reps: number|string}>|null>}
 */
export async function getLastExercisePerformance(uid, exerciseId) {
  if (!uid || !exerciseId) return null;
  const recentLogs = await getWorkoutLogs(uid, 15);
  
  for (const log of recentLogs) {
    if (log.exercises && Array.isArray(log.exercises)) {
      const match = log.exercises.find(e => e.id === exerciseId);
      if (match && match.sets && match.sets.length > 0) {
        // Return sets where done is true or has valid numbers
        const validSets = match.sets.filter(s => s.done || (s.weight > 0 && s.reps > 0));
        if (validSets.length > 0) {
          return validSets;
        }
      }
    }
  }
  return null;
}

/**
 * Gets strength progression data for a specific exercise over time for charts
 * @param {string} uid
 * @param {string} exerciseId
 * @returns {Promise<Array<{date: string, maxWeight: number, totalVolume: number}>>}
 */
export async function getExerciseHistory(uid, exerciseId) {
  if (!uid || !exerciseId) return [];
  const logs = await getWorkoutLogs(uid, 50);
  const history = [];

  // Reverse to get chronological ascending order
  const chronologicalLogs = [...logs].reverse();

  for (const log of chronologicalLogs) {
    if (log.exercises && Array.isArray(log.exercises)) {
      const match = log.exercises.find(e => e.id === exerciseId);
      if (match && match.sets && match.sets.length > 0) {
        let maxWeight = 0;
        let totalVolume = 0;
        let performedSets = 0;

        match.sets.forEach(set => {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          if (w > 0 && r > 0) {
            performedSets++;
            if (w > maxWeight) maxWeight = w;
            totalVolume += w * r;
          }
        });

        if (performedSets > 0) {
          history.push({
            date: log.date,
            maxWeight,
            totalVolume
          });
        }
      }
    }
  }

  return history;
}

/**
 * Saves InBody test report at users/{uid}/inbodyHistory/{dateStr}
 * @param {string} uid
 * @param {string} dateStr
 * @param {Object} inbodyData
 * @returns {Promise<void>}
 */
export async function saveInBodyReport(uid, dateStr, inbodyData) {
  if (!uid || !dateStr) throw new Error("UID and dateStr are required");
  const recordRef = doc(db, "users", uid, "inbodyHistory", dateStr);
  
  await setDoc(recordRef, {
    date: dateStr,
    ...inbodyData,
    timestamp: serverTimestamp()
  }, { merge: true });

  // Update user profile with latest InBody summary
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    weight: Number(inbodyData.weight),
    bodyFatPct: Number(inbodyData.bodyFatPct),
    muscleMassKg: Number(inbodyData.muscleMassKg) || null,
    visceralFat: Number(inbodyData.visceralFat) || null,
    inbodyLastDate: dateStr,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Retrieves full InBody history for charts & comparison
 * @param {string} uid
 * @returns {Promise<Array>}
 */
export async function getInBodyHistory(uid) {
  if (!uid) return [];
  const colRef = collection(db, "users", uid, "inbodyHistory");
  const q = query(colRef, orderBy("date", "asc"));
  const snap = await getDocs(q);
  const history = [];
  snap.forEach(d => {
    history.push({
      id: d.id,
      ...d.data()
    });
  });
  return history;
}

/**
 * Retrieves the most recent InBody report
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getLatestInBodyReport(uid) {
  if (!uid) return null;
  const colRef = collection(db, "users", uid, "inbodyHistory");
  const q = query(colRef, orderBy("date", "desc"), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}
