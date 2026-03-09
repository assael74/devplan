import { statsParm } from './statsParmList.js'

export function getTimePlayText(timePlay, totalTime) {
  const tp = Number(timePlay) || 0;
  const tt = Number(totalTime) || 0;

  const formattedTP = tp > 0 ? tp : '00';
  const formattedTT = tt > 0 ? tt : '00';

  return `${formattedTP} / ${formattedTT}`;
}

export function calculateFullPlayerStats(playerGames = [], typeFilter = 'all') {
  const result = {
    totalGameTime: 0,
    gamesCount: 0,
  };

  const normalizeType = (g) => {
    const raw = g?.type ?? g?.gameType ?? g?.meta?.type ?? '';
    const s = String(raw).toLowerCase().trim();
    return s || 'friendly';
  };

  const minutesOf = (g) => {
    const v = g?.gameDuration ?? g?.duration ?? g?.minutes ?? g?.gameTime ?? g?.timePlay;
    const n = Number(v);
    return Number.isFinite(n) ? n : 90; // דיפולט בטוח
  };

  const skipKeys = new Set(['playerId','teamId','gameId','id','uid','name']);
  const add = (key, val) => {
    if (val == null || skipKeys.has(key)) return;

    if (typeof val === 'boolean') {
      result[key] = (result[key] || 0) + (val ? 1 : 0);
      return;
    }

    const n = typeof val === 'number' ? val : Number(val);
    if (Number.isFinite(n)) {
      result[key] = (result[key] || 0) + n;
    }
  };

  for (const game of playerGames) {
    const gType = normalizeType(game);
    if (typeFilter && typeFilter !== 'all' && gType !== String(typeFilter).toLowerCase()) {
      continue; // מסנן רק אם ביקשו פילטר ספציפי
    }

    result.totalGameTime += minutesOf(game);
    result.gamesCount += 1;

    // יש מקרים שהסטטיסטיקות עטופות תחת stats
    const stats = (game?.gameStats?.stats ?? game?.gameStats);
    if (!stats || typeof stats !== 'object') continue;

    for (const [k, v] of Object.entries(stats)) add(k, v);
  }

  // אחוזי הצלחה לכל זוג Success/Total או Success/Attempts
  for (const key of Object.keys(result)) {
    if (key.endsWith('Success')) {
      const base = key.slice(0, -'Success'.length);
      const total = result[`${base}Total`] ?? result[`${base}Attempts`] ?? 0;
      result[`${base}SuccessRate`] = total > 0 ? +((result[key] / total) * 100).toFixed(1) : 0;
    }
  }

  // זמן משחק באחוזים
  if (result.totalGameTime > 0 && result.timePlayed != null) {
    result.playTimeRate = Math.round((result.timePlayed / result.totalGameTime) * 100);
  } else {
    result.playTimeRate = 0;
  }

  // שדות חובה
  for (const field of ['goals', 'assists', 'timePlayed']) {
    if (result[field] == null) result[field] = 0;
  }

  return result;
}

export function calculateFullTeamStats(teamGames = [], typeFilter = 'league') {
  const result = {
    gamesPlayed: 0,
    totalPlayers: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    totalGameTime: 0,
  };

  teamGames.forEach((game) => {
    const gameType = game.type || 'friendly';
    if (gameType !== typeFilter) return; // ← חישוב רק עבור סוג מבוקש

    result.gamesPlayed += 1;

    const gameDuration = Number(game.gameDuration) || 90;
    result.totalGameTime += gameDuration;

    // תוצאה
    const outcome = game.result;
    if (outcome === 'win') result.wins += 1;
    else if (outcome === 'draw') result.draws += 1;
    else if (outcome === 'loss') result.losses += 1;

    // שערים
    result.goalsFor += Number(game.goalsFor) || 0;
    result.goalsAgainst += Number(game.goalsAgainst) || 0;

    // playerStats
    const playerStatsList = Array.isArray(game.playerStats) ? game.playerStats : [];
    result.totalPlayers += playerStatsList.length;

    playerStatsList.forEach((playerStats) => {
      if (!playerStats || typeof playerStats !== 'object') return;

      Object.entries(playerStats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          result[key] = (result[key] || 0) + value;
        }
      });
    });
  });

  // זמן משחק קבוצתי
  result.timePlayed = result.totalGameTime;

  // נקודות ואחוז הצלחה
  result.points = result.wins * 3 + result.draws * 1;
  const maxPoints = result.gamesPlayed * 3;
  result.successRate = maxPoints > 0 ? Number((result.points / maxPoints * 100).toFixed(1)) : 0;

  return result;
}

// games של scout => stats מצטברות
export function calculateFullScoutStats(scout, typeFilter = 'all') {
  const games = Array.isArray(scout?.games) ? scout.games : [];

  // מיפוי משחק scout למשחק שהמערכת יודעת לחשב
  const mappedGames = games.map(g => {
    const timePlayed = Number(g.timePlayed);
    const duration   = Number(g.gameDuration);

    // scored יכול להיות boolean (true/false) או מספר (שערים)
    let goals = 0;
    if (typeof g.scored === 'number') {
      goals = g.scored;
    } else if (typeof g.scored === 'boolean') {
      goals = g.scored ? 1 : 0;
    }

    return {
      ...g,
      gameDuration: Number.isFinite(duration) ? duration : 90,
      gameStats: {
        // שדות שהמצטבר יודע לסכום
        timePlayed: Number.isFinite(timePlayed) ? timePlayed : 0,
        goals,
        isSelected: !!g.isSelected,
        isStarting: !!g.isStarting,
      },
    };
  });

  // שימוש בפונקציה הקיימת שמחברת הכל
  return calculateFullPlayerStats(mappedGames, typeFilter);
}

export const statsParmOptions = [
  { id: 'all', label: 'כולם', labelH: 'כל הפרמטרים', idIcon: 'statsParm', disabled: false },
  { id: 'offensive', label: 'התקפה', labelH: 'פרמטר התקפי', idIcon: 'offensive', disabled: false },
  { id: 'defensive', label: 'הגנה', labelH: 'פרמטר הגנתי', idIcon: 'defensive', disabled: false },
  { id: 'mental', label: 'מנטלי', labelH: 'פרמטר מנטלי', idIcon: 'mental', disabled: false },
  { id: 'goalkeeping', label: 'שוערות', labelH: 'פרמטר שוערות', idIcon: 'goalkeeping', disabled: false },
  { id: 'general', label: 'כללי', labelH: 'פרמטר כללי', idIcon: 'generalParm', disabled: false },
]

export const statsParmTypeFieldOptions = [
  { id: 'number', label: '', labelH: 'מספר', idIcon: 'number', disabled: false },
  { id: 'text', label: '', labelH: 'טקסט', idIcon: 'text', disabled: false },
  { id: 'boolean', label: '', labelH: 'כן/לא', idIcon: 'boolean', disabled: false },
  { id: 'select', label: '', labelH: 'בחירה', idIcon: 'boolean', disabled: false },
]

export const statsViewTypeOptions = [
  { id: 'team', label: '', labelH: 'קבוצה', idIcon: 'teams', disabled: false },
  { id: 'players', label: '', labelH: 'שחקנים', idIcon: 'players', disabled: false },
]

export const statsMobileGroupViewOptions = [
  {
    id: 'timeGroup',
    labelH: 'זמני משחק',
    idIcon: 'time',
    disabled: false,
    fields: ['totalGameTime', 'timePlayed', 'playTimeRate']
  },
  {
    id: 'qualityGroup',
    labelH: 'תרומה התקפית',
    idIcon: 'star',
    disabled: false,
    fields: ['goals', 'assists', 'xG']
  },
  // שדות Triplet דינאמים
  ...Array.from(
    statsParm
      .filter(p => p.statsParmFieldType === 'triplet' && p.tripletGroup)
      .reduce((acc, curr) => {
        const group = curr.tripletGroup;
        if (!acc.has(group)) acc.set(group, []);
        acc.get(group).push(curr.id);
        return acc;
      }, new Map())
  ).map(([group, fields]) => ({
    id: `${group}Group`,
    labelH:
      statsParm.find(p => p.tripletGroup === group && p.id.endsWith('Total'))?.statsParmShortName ||
      group,
    idIcon: group,
    disabled: false,
    fields
  }))
];

export const statusStats = (game, statsParm = []) => {
  if (!game) {
    return {
      status: 'empty',
      countIsStarting: { trueCount: 0, falseCount: 0, hasTrue: false },
      countIsSelect:  { trueCount: 0, falseCount: 0, hasTrue: false },
    };
  }

  const rows = Array.isArray(game.playerStats) ? game.playerStats : [];

  // מזהי שדות דיפולט
  const defaultFields = new Set(
    (statsParm || []).filter(p => p.isDefault).map(p => p.id)
  );

  // מזהי שדות מוחרגים (מערכתיים)
  const EXCLUDED = new Set([
    'playerId','teamId','gameId','isStarting','isSelected','timeVideoStats','position',
  ]);

  const isFilled = (v) => v !== null && v !== undefined && v !== '';

  const countByKey = (key) => {
    let t = 0, f = 0;
    for (const r of rows) (r?.[key] ? t++ : f++);
    return { trueCount: t, falseCount: f, hasTrue: t > 0 };
  };

  const isStartingNum = countByKey('isStarting');
  const isSelectNum  = countByKey('isSelected');

  // “מילוי דיפולט חלקי” מוגדר אצלך: אם יש לפחות אחד starting או selected
  const defaultFilled =
    isStartingNum.hasTrue || isSelectNum.hasTrue;

  if (!defaultFilled) {
    return { status: 'empty', countIsStarting: isStartingNum, countIsSelect: isSelectNum };
  }

  // האם יש לפחות שדה אקסטרה אחד “מולא” באיזו שורה
  const hasAnyExtraFilled = rows.some((row) => {
    if (!row || typeof row !== 'object') return false;
    return Object.keys(row).some((k) => {
      if (EXCLUDED.has(k) || defaultFields.has(k)) return false;
      return isFilled(row[k]);
    });
  });

  return {
    status: hasAnyExtraFilled ? 'full' : 'partial',
    countIsStarting: isStartingNum,
    countIsSelect: isSelectNum,
  };
};

export const mostFrequent = (arr) => {
  if (!arr?.length) return null;
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .reduce((a, b) => (b[1] > a[1] ? b : a))[0]; // מחזיר את הערך עצמו
};
