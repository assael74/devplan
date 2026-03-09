import { getGameStatsFieldLists, getAutoExtraFields } from './gameStatsFields';
import { generateEvalutionParmId } from './generateId';

export const resetStatsForm = ({
  isEditMode,
  initialStats,
  formProps,
  teamPlayers,
  fillFromInitial,
  createEmptyStatsObject,
  setExtraFields,
  setPlayerStats,
  setShowExtraStats
}) => {
  if (isEditMode && initialStats.length && formProps.statsParm?.length) {
    const { defaultList } = getGameStatsFieldLists({
      statsParm: formProps.statsParm,
      extraFields: [],
    });

    const autoExtra = getAutoExtraFields(initialStats, formProps.statsParm, defaultList);
    setExtraFields(autoExtra);
  } else {
    setExtraFields([]);
  }

  const newStats = teamPlayers.map((id) => {
    return isEditMode ? fillFromInitial(id) : createEmptyStatsObject(id);
  });

  setPlayerStats(newStats);
  setShowExtraStats(false);
};

export const buildAbilitiesFormEntry = (formData) => {
  const {
    playerId,
    abilities,
    reportDate,
    evaluatorId,
    evaluatorRole,
    note = '',
  } = formData;

  return {
    formId: generateEvalutionParmId(`${playerId}_${reportDate}`),
    abilities,
    reportDate,
    evaluatorId,
    evaluatorRole,
    note,
    createdAt: Date.now(),
  };
};
