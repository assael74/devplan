export const abilitiesList = [
  // 🟦 פיזי (Physical)
  { id: 'speed', label: 'מהירות בסיסית', domain: 'physical', domainLabel: 'פיסי', weight: 1.2 },
  { id: 'agility', label: 'זריזות', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'coordination', label: 'קואורדינציה', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'endurance', label: 'סיבולת', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },
  { id: 'explosiveness', label: 'כוח מתפרץ', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },

  // 🟨 טכני (Technical)
  { id: 'ballComfort', label: 'נוחות עם כדור', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'firstTouch', label: 'נגיעה ראשונה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'passingSkill', label: 'טכניקת מסירה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'dribbleConfidence', label: 'ביטחון בדריבל', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'ballStriking', label: 'טכניקת בעיטה', domain: 'technical', domainLabel: 'טכני', weight: 1 },

  // 🟩 הבנה משחקית (Game Understanding)
  { id: 'spatialAwareness', label: 'הבנת מרחבים', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'vision', label: 'ראיית משחק', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'basicPositioning', label: 'הבנת מיקום בסיסית', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'offBallMovement', label: 'תנועה ללא כדור', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },

  // 🟥 מנטלי וחברתי (Mental & Social)
  { id: 'effort', label: 'השקעה והתמדה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'coachability', label: 'פתיחות ללמידה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'emotionalControl', label: 'שליטה רגשית', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'teamPlay', label: 'שיתוף פעולה קבוצתי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'confidenceLevel', label: 'ביטחון עצמי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'aggressiveness', label: 'אגרסיביות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'communication', label: 'תקשורתיות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },

  // 🟪 קוגניטיבי (Cognitive)
  { id: 'decisionSpeed', label: 'מהירות החלטות', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'learningCurve', label: 'יכולת למידה', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'adaptability', label: 'גמישות מחשבתית', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },

  // 🟫 ביולוגי (Development) – ללא שקלול ב־level
  { id: 'growthStage', label: 'שלב התפתחות ביולוגית', domain: 'development', domainLabel: 'התפתחות', weight: 0 },
];

export function groupAbilitiesByDomain(abilities = {}) {
  const grouped = {};

  for (const { id, label, domain, domainLabel, weight } of abilitiesList) {
    if (!grouped[domain]) {
      grouped[domain] = {
        domain,
        domainLabel,
        items: [],
      };
    }

    grouped[domain].items.push({
      id,
      label,
      weight: weight || 1,
      value: abilities[id] ?? 0,
    });
  }

  return Object.values(grouped);
}

// ---- 1) סיכום שחקנים לפי קטגוריה (דומיין) ----
export function summarizePlayersByDomain(players = []) {
  // נכין מיפוי מטא לקטגוריות
  const domainsMeta = {};
  for (const { domain, domainLabel } of abilitiesList) {
    if (!domainsMeta[domain]) domainsMeta[domain] = { domain, domainLabel };
  }

  // אגרגטורים
  const acc = {};
  for (const { domain } of abilitiesList) {
    acc[domain] = {
      domain,
      domainLabel: domainsMeta[domain].domainLabel,
      weightedSum: 0,
      weightSum: 0,
      ratingsCount: 0,     // כמה ציונים בפועל (מספר פריטים מדורגים בכל הדומיין מכלל השחקנים)
      playersRated: 0,     // כמה שחקנים תרמו לפחות ציון אחד בדומיין
    };
  }

  for (const player of players) {
    const abilities = player?.abilities || {};
    // בדיקה האם לשחקן יש לפחות ציון אחד בדומיין
    const hasRatedPerDomain = {};

    for (const { id, domain, weight } of abilitiesList) {
      const val = Number(abilities[id] ?? 0);
      if (val > 0) {
        if (weight > 0) {                 // דומיינים שלא נכנסים ל-level (למשל development עם weight 0) לא ישוקללו
          acc[domain].weightedSum += val * weight;
          acc[domain].weightSum   += weight;
        }
        acc[domain].ratingsCount += 1;
        hasRatedPerDomain[domain] = true;
      }
    }

    Object.keys(hasRatedPerDomain).forEach((d) => {
      acc[d].playersRated += 1;
    });
  }

  // הפקה: ממוצע משוקלל לפי weight (מעל כל השחקנים)
  return Object.values(acc).map(d => ({
    domain: d.domain,
    domainLabel: d.domainLabel,
    avgWeighted: d.weightSum > 0 ? +(d.weightedSum / d.weightSum).toFixed(2) : null, // null כשאין נתונים
    ratingsCount: d.ratingsCount,
    playersRated: d.playersRated,
  }));
}
// ---- 2) סיכום לפי יכולת בתוך כל דומיין ----
export function summarizePlayersByAbility(players = []) {
  // נבנה אגרגטור abilities per domain
  const byDomain = {};
  for (const { domain, domainLabel } of abilitiesList) {
    if (!byDomain[domain]) {
      byDomain[domain] = { domain, domainLabel, items: {} };
    }
  }

  // אתחל כל יכולת
  for (const { id, label, domain } of abilitiesList) {
    byDomain[domain].items[id] = { id, label, sum: 0, count: 0 };
  }

  // צבירה של ממוצע פשוט לכל יכולת (רק ערכים > 0)
  for (const player of players) {
    const abilities = player?.abilities || {};
    for (const { id, domain } of abilitiesList) {
      const val = Number(abilities[id] ?? 0);
      if (val > 0) {
        byDomain[domain].items[id].sum   += val;
        byDomain[domain].items[id].count += 1;
      }
    }
  }

  // הפקה: החזר מבנה נוח לשימוש
  return Object.values(byDomain).map(d => ({
    domain: d.domain,
    domainLabel: d.domainLabel,
    items: Object.values(d.items).map(it => ({
      id: it.id,
      label: it.label,
      avg: it.count > 0 ? +(it.sum / it.count).toFixed(2) : null, // null כשאין נתונים
      ratedCount: it.count,
    })),
  }));
}
