// ============== Helpers ==============

function mostFrequentNumber(arr, fallback = 90) {
  if (!arr || !arr.length) return fallback;
  const map = new Map();
  for (const n of arr) map.set(n, (map.get(n) || 0) + 1);
  let best = fallback, cnt = -1;
  for (const [n, c] of map) if (c > cnt) { best = n; cnt = c; }
  return best;
}

function labelFor(fieldId, statsParm) {
  const m = Array.isArray(statsParm) ? statsParm.find(p => p.id === fieldId) : null;
  const custom = {
    totalGameTime: 'דקות סה\"כ',
    playTimeRate: 'אחוז דקות',
    successRate: 'אחוז הצלחה',
    points: 'נקודות',
    involvement: 'מעורבות',
    placeholder: 'נא לבחור פרמטר',
  };
  return (m && m.statsParmName) || custom[fieldId] || fieldId;
}

function perFull(value, minutesBase, fullTime) {
  if (value == null) return null;
  const m = Number(minutesBase || 0);
  if (!m) return null;
  return (Number(value) * fullTime) / m;
}

function formatValue(num, isPercent) {
  if (num == null || Number.isNaN(Number(num))) return '-';
  const n = Number(num);
  if (isPercent) return `${Math.round(n)}%`;
  return String(n).includes('.') ? n.toFixed(1) : String(n);
}

function buildAgg(valuesRaw) {
  const valid = valuesRaw.filter(v => Number.isFinite(Number(v))).map(Number);
  const min = valid.length ? Math.min(...valid) : 0;
  const max = valid.length ? Math.max(...valid) : 0;
  const mean = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  const sd = valid.length ? Math.sqrt(valid.reduce((a, b) => a + (b - mean) ** 2, 0) / (valid.length || 1)) : 0;

  const percentile = (v) => {
    if (v == null || !valid.length) return null;
    const rank = valid.filter(x => x <= v).length;
    return (rank / valid.length) * 100;
  };
  const minmax = (v) => {
    if (v == null || max === min) return 0.5;
    return (v - min) / (max - min);
  };
  const z = (v) => {
    if (v == null || !sd) return 0;
    return (v - mean) / sd;
  };
  return { min, max, mean, sd, percentile, minmax, z };
}

function calcPlayTimeRate(timePlayed, teamTotalMinutes) {
  const tp = Number(timePlayed ?? 0);
  const tm = Number(teamTotalMinutes ?? 0);
  if (!tm) return null;
  return (100 * tp) / tm;
}

function mapToBucket(pos) {
  const raw = String(pos || '').trim();
  const code = raw.toUpperCase();

  // מיפוי לפי הקוד מה-Select
  if (code === 'DC' || code === 'FB') return 'DEF';
  if (code === 'MC') return 'MID';
  if (code === 'FC') return 'FW';
  if (code === 'W')  return 'WING';
  if (code === 'GK') return 'GK'; // לא צובעים במסירות לפי הכללים שלך

  // נפילות סימון נפוצות ואפשרות לתוויות בעברית
  if (['RB','LB','RWB','LWB','DF','CB'].includes(code) || ['בלם','מגן'].includes(raw)) return 'DEF';
  if (['DM','CM','AM','MF'].includes(code) || raw.includes('קשר')) return 'MID';
  if (['ST','CF','FW','9'].includes(code) || raw.includes('חלוץ')) return 'FW';
  if (['RW','LW','WG','WING'].includes(code) || raw.includes('כנף')) return 'WING';

  return 'UNK';
}

function perfColor(fieldId, rawPercent, bucket) {
  const v = Number(rawPercent);
  if (!Number.isFinite(v)) return 'inherit';
  //console.log(bucket)
  // מסירות
  if (fieldId === 'passesSuccessRate') {
    if (bucket === 'DEF')  return v > 90 ? '#2e7d32' : v < 85 ? '#ef5350' : 'inherit';
    if (bucket === 'MID')  return v > 85 ? '#2e7d32' : v < 80 ? '#ef5350' : 'inherit';
    if (bucket === 'FW' || bucket === 'WING')
                           return v > 80 ? '#2e7d32' : v < 70 ? '#ef5350' : 'inherit';
    return 'inherit';
  }
  // לחץ אישי
  if (fieldId === 'personalPressuresSuccessRate') {
    return v > 60 ? '#2e7d32' : v < 40 ? '#ef5350' : 'inherit';
  }
  return 'inherit';
}

export const isPercentColumn = (fieldId, normMode) => {
  const f = String(fieldId || '').toLowerCase();
  if (normMode === 'percentile' || normMode === 'minmax') return true; // כל העמודות מוצגות באחוזים
  return f.includes('rate') || fieldId === 'playTimeRate';             // רק עמודות אחוזים אמיתיות
};

export function buildTeamStatsRows(input) {
  const {
    players,
    normMode,
    teamGames,
    statsParm,
    visibleFields,
    gameTypeFilter,
    groupByMap = null,
    calculateFullPlayerStats,
    excludeNorm = new Set(['goals', 'assists', 'timePlayed', 'totalGameTime', 'playTimeRate']),
  } = input;

  // 0) סינון משחקי קבוצה לפי סוג
  const teamGamesFiltered = (teamGames || []).filter(g =>
    gameTypeFilter === 'league' ? true : g?.gameType === gameTypeFilter
  );

  // 1) FULL_TIME מהשכיח
  const durations = teamGamesFiltered
    .map(g => Number(g?.gameDuration))
    .filter(n => Number.isFinite(n) && n > 0);
  const FULL_TIME = mostFrequentNumber(durations, 90);

  // 1.1) דקות סה\"כ קבוצתיות ואורך עונה בפועל
  const TEAM_GAMES_COUNT   = teamGamesFiltered.length;
  const TEAM_TOTAL_MINUTES = TEAM_GAMES_COUNT * FULL_TIME;

  // 1.2) עמודות מוצגות: מחליפים totalGameTime ב-involvement
  const visible = (visibleFields || []).map(f => (f === 'totalGameTime' ? 'involvement' : f));

  // 2) סטטיסטיקות לשחקנים
  const playerStats = (players || []).map(p => {
    const gamesAll = Array.isArray(p.playerGames) ? p.playerGames : [];
    const games = gameTypeFilter === 'league' ? gamesAll : gamesAll.filter(g => g?.gameType === gameTypeFilter);

    const stats = gameTypeFilter === 'league'
      ? calculateFullPlayerStats(gamesAll, null)
      : calculateFullPlayerStats(gamesAll, gameTypeFilter);
    //console.log()
    // מופעים בסגל/הרכב
    const selectedCount = p.playerFullStats.isSelected;
    const startingCount = p.playerFullStats.isStarting;

    const minutesTotal  = Number(stats?.totalGameTime ?? 0);
    const minutesFilmed = Number(stats?.timeVideoStats ?? 0);
    const timePlayed    = Number(stats?.timePlayed ?? 0); // דקות בפועל

    const getRaw = (k) => {
      const v = stats?.[k];
      return (v == null || Number.isNaN(Number(v))) ? null : Number(v);
    };

    const basePos = p.position || p.role || '';

    return {
      player: { id: p.id, playerFullName: p.playerFullName, photo: p.photo, basePos },
      stats,
      timePlayed,
      minutesTotal,
      minutesFilmed,
      selectedCount,
      startingCount,
      getRaw,
    };
  });

  const groupKeyOf = (ps) =>
    (groupByMap && groupByMap[ps.player.id]) ? groupByMap[ps.player.id] : 'ALL';

  // 3) אגרגציות על RAW לפי שדה וקבוצה
  const rawByFieldGrouped = {};
  for (const f of visible) {
    if (f === 'placeholder' || f === 'involvement') continue;
    rawByFieldGrouped[f] = {};
  }

  playerStats.forEach(ps => {
    const gk = groupKeyOf(ps);
    for (const f of Object.keys(rawByFieldGrouped)) {
      const v = ps.getRaw(f);
      (rawByFieldGrouped[f][gk] ||= []).push(v);
      (rawByFieldGrouped[f]['ALL'] ||= []).push(v);
    }
  });

  const aggByFieldGrouped = {};
  for (const f of Object.keys(rawByFieldGrouped)) {
    aggByFieldGrouped[f] = {};
    for (const gk of Object.keys(rawByFieldGrouped[f])) {
      aggByFieldGrouped[f][gk] = buildAgg(rawByFieldGrouped[f][gk]);
    }
  }
  const aggFor = (field, gk) =>
    (aggByFieldGrouped[field] && (aggByFieldGrouped[field][gk] || aggByFieldGrouped[field]['league'])) || null;

  // 4) כותרות
  const headerLabels = visible.map(fid => fid === 'placeholder' ? 'נא לבחור פרמטר' : labelFor(fid, statsParm));

  // 5) שורות
  const rows = playerStats.map(ps => {
    const gk = groupKeyOf(ps);
    const bucket = mapToBucket(groupByMap?.[ps.player.id] ?? ps.player.basePos);
    const playRateNum = calcPlayTimeRate(ps.timePlayed, TEAM_TOTAL_MINUTES) ?? -Infinity;

    const cells = visible.map(field => {
      if (field === 'placeholder')
        return { field, raw: null, value: null, score: null, display: '-', textColor: 'inherit' };

      // שילוב: בסגל/הרכב
      if (field === 'involvement') {
        const numberTeamGames = teamGamesFiltered.length
        const display = `${ps.selectedCount} (${ps.startingCount})`;
        return { field, raw: null, value: null, score: null, display, textColor: 'inherit' };
      }

      // playTimeRate: לפי דקות עונה קבוצתיות
      if (field === 'playTimeRate') {
        const rate = calcPlayTimeRate(ps.timePlayed, TEAM_TOTAL_MINUTES);
        return { field, raw: rate, value: rate, score: null, display: formatValue(rate, true), textColor: 'inherit' };
      }

      const raw = ps.getRaw(field);
      let value = raw;

      // per90 = נרמול לפי FULL_TIME, בדקות וידאו כברירת מחדל, לא לשדות שב־excludeNorm
      if (normMode === 'per90' && !excludeNorm.has(field)) {
        const minutesBase = ps.minutesFilmed || ps.minutesTotal;
        value = perFull(raw, minutesBase, FULL_TIME);
      }

      if (normMode === 'raw') value = raw;
      if (normMode === 'percentile') value = aggFor(field, gk)?.percentile(raw) ?? null;
      if (normMode === 'minmax')    value = aggFor(field, gk)?.minmax(raw) ?? null;

      const score =
        normMode === 'percentile' ? (value == null ? null : value / 100) :
        normMode === 'minmax'     ? value :
        (() => {
          const agg = aggFor(field, gk);
          if (!agg) return null;
          const r = raw ?? 0;
          return agg.max === agg.min ? 0.5 : (r - agg.min) / (agg.max - agg.min);
        })();

      const isPercentField = field.toLowerCase().includes('rate') && field !== 'playTimeRate';
      const display =
        normMode === 'percentile' ? formatValue(value, true) :
        normMode === 'minmax'     ? (value == null ? '-' : `${Math.round(Number(value) * 100)}%`) :
                                    formatValue(isPercentField ? raw : value, isPercentField);

      const textColor = perfColor(field, raw, bucket);

      return { field, raw, value, score, display, textColor };
    });

    return {
      player: ps.player,
      minutes: ps.minutesTotal, // לא בשימוש בטבלה כעת, תוכל להסיר אם אינך צריך אותו בהמשך
      stats: ps.stats,
      cells,
      playRate: playRateNum,
    };
  }).sort((a, b) => (b.playRate ?? -Infinity) - (a.playRate ?? -Infinity));;

  return { FULL_TIME, TEAM_GAMES_COUNT, TEAM_TOTAL_MINUTES, headerLabels, rows };
}
