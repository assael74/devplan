export const getAutoExtraFields = (initialStats = [], statsParm = [], defaultList = []) => {
  const isRelevantTripletField = (fieldId) => !fieldId.toLowerCase().includes('successrate');
  const existingKeys = new Set(initialStats.flatMap((p) => Object.keys(p)));

  return statsParm
    .filter((p) => {
      if (defaultList.find((d) => d.id === p.id)) return false;

      if (existingKeys.has(p.id)) return true;

      if (p.statsParmFieldType === 'triplet' && p.tripletFields) {
        return Object.values(p.tripletFields)
          .filter(isRelevantTripletField)
          .some((fieldId) => existingKeys.has(fieldId));
      }

      return false;
    })
    .map((p) => p.id);
};

export const getTripletGroup = (fieldId, statsParm) => {
  const match = statsParm.find(p => p.statsParmFieldType === 'triplet' && (
    p.id === fieldId || (
      p.tripletFields && Object.values(p.tripletFields).includes(fieldId)
    )
  ));
  return match?.tripletGroup || null;
};

export const getTripletFields = (tripletGroup, statsParm) => {
  const groupFields = statsParm.filter(
    (p) => p.statsParmFieldType === 'triplet' && p.tripletGroup === tripletGroup
  );

  if (!groupFields.length) return {};

  let totalField = null;
  let successField = null;
  let rateField = null;

  groupFields.forEach(({ id }) => {
    const idLower = id.toLowerCase();
    if (idLower.includes('total')) totalField = id;
    else if (idLower.includes('successrate')) rateField = id;
    else if (idLower.includes('success')) successField = id;
  });

  return { totalField, successField, rateField };
};

export const getGameStatsFieldLists = ({
  statsParm = [],
  extraFields = [],
  playerStats = [],          // ← חדש: מקבל את כל שורות השחקנים (או game.playerStats)
  includeUnknownSaved = false, // אופציונלי: לכלול שדות שמורים שלא קיימים ב-statsParm
} = {}) => {
  // מזהים שאסור שיופיעו ברשימות (גם מערכתיים)
  const EXCLUDED_IDS = new Set([
    'timeVideoStats', 'isStarting', 'position',
    'playerId', 'teamId', 'gameId', 'isSelected'
  ]);

  const sortStatsFields = (fields) => {
    return [...fields].sort((a, b) => {
      const getScore = (item) => {
        const type = item.statsParmFieldType || item.type || 'number';
        if (type === 'number') return 0;
        if (type === 'boolean') return 1;
        return 2;
      };
      const scoreA = getScore(a);
      const scoreB = getScore(b);
      if (scoreA !== scoreB) return scoreA - scoreB;
      if (scoreA === 0) {
        const orderA = Number(a.order ?? 999);
        const orderB = Number(b.order ?? 999);
        return orderA - orderB;
      }
      return 0;
    });
  };

  const mapStatField = (p) => ({
    id: p.id,
    label: p.statsParmName,
    labelShort: p.statsParmShortName,
    type: p.statsParmFieldType || 'number',
    isDefault: !!p.isDefault,
    order: p.order,
    tripletGroup: p.tripletGroup,
  });

  const parmById = new Map(statsParm.map(p => [p.id, p]));
  const defaultIds = new Set(statsParm.filter(p => p.isDefault).map(p => p.id));

  // 1) אסוף מזהים מהנתונים השמורים (playerStats)
  const savedIds = new Set();
  for (const row of Array.isArray(playerStats) ? playerStats : []) {
    if (!row) continue;
    for (const k of Object.keys(row)) {
      if (EXCLUDED_IDS.has(k)) continue;
      if (defaultIds.has(k)) continue;
      savedIds.add(k);
    }
  }

  // 2) איחוד עם הבחירה הידנית (extraFields)
  const combined = new Set(
    [...extraFields, ...savedIds].filter(
      (id) => id && !EXCLUDED_IDS.has(id) && !defaultIds.has(id)
    )
  );

  // 3) השלמות טריפלט
  const tripletGroups = statsParm
    .filter(p => p.statsParmFieldType === 'triplet' && p.tripletGroup && !EXCLUDED_IDS.has(p.id))
    .reduce((acc, p) => {
      (acc[p.tripletGroup] ||= []).push(p.id);
      return acc;
    }, {});
  for (const groupIds of Object.values(tripletGroups)) {
    const present = groupIds.filter((id) => combined.has(id));
    if (present.length === 2) {
      const missing = groupIds.find((id) => !combined.has(id));
      if (missing) combined.add(missing);
    }
  }

  // 4) רשימת ברירת מחדל (ללא EXCLUDED)
  const defaultList = sortStatsFields(
    statsParm.filter(
      (p) => p.isDefault && !EXCLUDED_IDS.has(p.id)
    )
  ).map(mapStatField);

  // 5) extraList מתוך ה־statsParm (רק מה שקיים ב-combined)
  const extraListFromParm = sortStatsFields(
    statsParm.filter(
      (p) => !p.isDefault && !EXCLUDED_IDS.has(p.id) && combined.has(p.id)
    )
  ).map(mapStatField);

  // 6) אופציונלי: אם יש שדות שמורים שלא קיימים ב-statsParm – צור להם פריטים "וירטואליים"
  let extraList = extraListFromParm.slice();
  if (includeUnknownSaved) {
    for (const id of combined) {
      if (parmById.has(id)) continue;
      // נסיק טיפוס בסיסי מהערך הראשון שאינו null/undefined
      let sample;
      for (const row of playerStats) {
        if (row && row[id] != null) { sample = row[id]; break; }
      }
      const inferredType =
        typeof sample === 'number' ||
        (!Number.isNaN(Number(sample)) && String(sample).trim() !== '')
          ? 'number'
          : typeof sample === 'boolean'
          ? 'boolean'
          : 'text';

      extraList.push({
        id,
        statsParmName: id,
        statsParmShortName: id,
        statsParmFieldType: inferredType,
        isDefault: false,
        order: 999,
      });
    }
    extraList = sortStatsFields(extraList).map(mapStatField);
  }

  // 7) כל האופציות לבחירת Extra – ללא EXCLUDED וללא דיפולט
  const availableExtraOptions = sortStatsFields(
    statsParm.filter((p) => !p.isDefault && !EXCLUDED_IDS.has(p.id))
  ).map(mapStatField);

  return { defaultList, extraList, availableExtraOptions };
};
