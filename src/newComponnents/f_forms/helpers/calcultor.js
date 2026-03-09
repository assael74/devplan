/// calcultor.js
import { abilitiesList } from '../../x_utils/abilitiesList';

// helpers/calcultor.js
export const generateTeamStats = (playerStatsList, game, videoTimeStats) => {
  const totals = {};
  const ignoreKeys = new Set([
    'playerId','gameId','isSelected','isStart','isStarting',
    'timePlayed','totalPlayers','goals','timeVideoStats' // לא לסכום per-player
  ]);

  playerStatsList.forEach((player) => {
    Object.entries(player).forEach(([key, value]) => {
      if (ignoreKeys.has(key)) return;

      const num = Number(value);
      if (!Number.isNaN(num)) {
        if (!totals[key]) totals[key] = 0;
        totals[key] += num;
      }
    });
  });

  // הוספות חיצוניות
  totals.goalsFor     = Number(game.goalsFor)     || 0;
  totals.goalsAgainst = Number(game.goalsAgainst) || 0;
  totals.timePlay     = Number(game.gameDuration) || 0;
  totals.totalPlayers = playerStatsList.length;

  // זמן משחק מצולם קבוצתי – מספר יחיד כפי שביקשת
  totals.teamVideoTime = Number(videoTimeStats) || 0;

  // ניקוד לפי תוצאה
  const result = game.result;
  totals.points = result === 'win' ? 3 : result === 'draw' ? 1 : 0;

  // החזרה כמערך
  return Object.entries(totals).map(([id, value]) => ({ id, value }));
};

function roundToHalf(num) {
  return Math.round(num * 2) / 2;
}

export function mergeAbilitiesWeighted(oldAbilities = {}, newAbilities = {}, playerId) {
  const result = {};
  let sum = 0;
  let totalWeight = 0;

  for (const { id, weight = 1 } of abilitiesList) {
    if (id === 'growthStage') continue;

    const oldVal = Number(oldAbilities[id] ?? 0);
    const newVal = Number(newAbilities[id] ?? 0);

    let finalVal = 0;

    if (oldVal === 0) {
      finalVal = newVal;
    } else if (newVal === 0) {
      finalVal = oldVal;
    } else {
      finalVal = roundToHalf(oldVal * 0.3 + newVal * 0.7);
    }

    result[id] = finalVal;

    if (finalVal > 0) {
      sum += finalVal * weight;
      totalWeight += weight;
    }
  }

  // חישוב שלב ההתפתחות
  const growthStage = Number(newAbilities.growthStage ?? 0);

  // ממוצע רמות
  const level = totalWeight === 0 ? 0 : roundToHalf(sum / totalWeight);

  // פוטנציאל – תוספת או הפחתה לפי growthStage
  let levelPotential = level;
  if (growthStage > 3) levelPotential += 0.5;
  else if (growthStage < 3) levelPotential -= 0.5;
  levelPotential = Math.max(1, Math.min(5, roundToHalf(levelPotential)));

  return {
    id: playerId,
    abilities: { ...result, growthStage },
    level,
    levelPotential,
  };
}

// כלי עזר קטן: האם יש ערך מספרי > 0 (גם כמחרוזת)
const gtZero = (v) => {
  if (v === '' || v == null) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
};

export const emptyPlayerRow = (playerId) => ({
  playerId,
  isSelected: false,
  isStarting: false,
  position: '',
  timeVideoStats: '', // string בטופס
});

export const getSaveErrors = ({
  gameId,
  isDirty,
  playerStats,
  extraFields,
  videoTimeStats,
}) => {
  const errors = [];

  // 1) נבחר משחק
  if (!gameId) {
    errors.push("לא נבחר משחק");
  }

  // 2) נעשה שינוי
  if (!isDirty) {
    errors.push("לא נעשה שינוי בטופס");
  }

  // 3) יש לפחות שחקן נבחר
  const selectedPlayers = (playerStats || []).filter(p => p.isSelected);
  if (selectedPlayers.length === 0) {
    errors.push("יש לבחור לפחות שחקן אחד");
  }

  // 4) כלל הווידאו — רק אם יש בדיוק שדה אחד ב-extraFields
  const extraLen = Array.isArray(extraFields) ? extraFields.length : 0;
  if (extraLen === 1) {
    if (!gtZero(videoTimeStats)) {
      errors.push("יש למלא דקות משחק מצולמות (קבוצתי) בערך גדול מ-0");
    }
    const badPlayers = selectedPlayers.filter(p => !gtZero(p.timeVideoStats));
    if (badPlayers.length > 0) {
      errors.push("יש למלא דקות משחק מצולמות > 0 לכל שחקן שנבחר");
    }
  }

  // דיבוג ברור:
  // (מומלץ להוריד אחרי שסיימת לבדוק)
  // console.log('[getSaveErrors]', { gameId, isDirty, selectedPlayers: selectedPlayers.length, extraLen, videoTimeStats, errors });

  return {
    errors,
    message: errors.join(" • "),
  };
};
