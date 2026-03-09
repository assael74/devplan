// src/newComponents/a_firestore/actionData/updateRouter/getDiffFields.js
export function getDiffFields(oldData, newData) {
  const diff = {};

  for (const key in newData) {
    const oldVal = oldData?.[key];
    const newVal = newData?.[key];

    const bothAreObjects =
      typeof oldVal === "object" &&
      typeof newVal === "object" &&
      oldVal !== null &&
      newVal !== null;

    const changed = bothAreObjects
      ? JSON.stringify(oldVal) !== JSON.stringify(newVal)
      : oldVal !== newVal;

    if (changed) {
      diff[key] = newVal;
    }
  }

  return diff;
}

export function normalizeType(type) {
  if (!type || typeof type !== 'string') return 'default';
  //console.log(type)
  // חריגות ידועות
  const specialCases = {
    videoAnalysis: 'videoAnalyses',
    player: 'players',
    team: 'teams',
    club: 'clubs',
    meeting: 'meetings',
    payment: 'payments',
    video: 'videos',
    statsParm: 'statsParm',
    scouting: 'scouting'
  };

  if (specialCases[type]) return specialCases[type];

  // כלל בסיסי: הוסף s אם לא מסתיים ב-s
  return type.endsWith('s') ? type : `${type}s`;
}
