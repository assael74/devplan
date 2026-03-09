/// newComponnents\f_forms\helpers\useSmartStatChange.js
import { getTripletFields } from './gameStatsFields'

export const useSmartStatChange = (handleStatChange) => {
  return (playerId, fieldId, type) => {
    return (val) => {
      let parsedVal = val;

      if (type === 'number') {
        if (val === '' || val === null) {
          parsedVal = null; // תשאיר null כשהשדה ריק
        } else {
          parsedVal = Number(val);
          if (isNaN(parsedVal)) parsedVal = null;
        }
      }

      handleStatChange(playerId, fieldId, parsedVal);
    };
  };
};

export const useSmartNumberChange = (handleChange) => {
  return (fieldId) => {
    return (val) => {
      const parsedVal = Number(val);
      if (isNaN(parsedVal)) {
        handleChange(fieldId, null); // ערך לא תקין - null
      } else {
        handleChange(fieldId, parsedVal); // ערך תקני
      }
    };
  };
};

export const normalizePlayerStats = (playerStats, statsParm) => {
  if (!playerStats || !statsParm) return playerStats;

  const normalized = { ...playerStats };

  statsParm.forEach(({ id, statsParmFieldType, tripletGroup }) => {
    const val = playerStats[id];

    if (id in playerStats) {
      switch (statsParmFieldType) {
        case 'number':
          normalized[id] = typeof val === 'number' ? val : Number(val);
          if (isNaN(normalized[id])) normalized[id] = 0;
          break;

        case 'boolean':
          normalized[id] = Boolean(val);
          break;

        case 'select':
        case 'string':
          normalized[id] = val || '';
          break;
      }
    }

    if (statsParmFieldType === 'triplet' && tripletGroup) {
      const { totalField, successField, rateField } = getTripletFields(tripletGroup, statsParm);

      if (totalField && totalField in playerStats) {
        const raw = playerStats[totalField];
        const parsed = typeof raw === 'number' ? raw : Number(raw);
        normalized[totalField] = isNaN(parsed) ? 0 : parsed;
      }

      if (successField && successField in playerStats) {
        const raw = playerStats[successField];
        const parsed = typeof raw === 'number' ? raw : Number(raw);
        normalized[successField] = isNaN(parsed) ? 0 : parsed;
      }

      if (rateField && rateField in playerStats) {
        normalized[rateField] = '-';
      }
    }
  });

  return normalized;
};

export const normalizePlayerStatsList = (playersStatsArray, statsParm) => {
  if (!Array.isArray(playersStatsArray) || !statsParm) return playersStatsArray;

  return playersStatsArray.map((playerStats) =>
    normalizePlayerStats(playerStats, statsParm)
  );
};
