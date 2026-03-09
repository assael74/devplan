/// helpers\isDirtys.js
export const isGameDirty = ({ type, goalsFor, goalsAgainst, rivel, result }, initialState) => {
  return (
    JSON.stringify(type) !== JSON.stringify(initialState.type) ||
    JSON.stringify(goalsFor) !== JSON.stringify(initialState.goalsFor) ||
    JSON.stringify(goalsAgainst) !== JSON.stringify(initialState.goalsAgainst) ||
    JSON.stringify(rivel) !== JSON.stringify(initialState.rivel) ||
    JSON.stringify(result) !== JSON.stringify(initialState.result)
  );
};

export const isTeamStatsDirty = (teamStats, initialTeamStats) => {
  return JSON.stringify(teamStats) !== JSON.stringify(initialTeamStats);
};

export const getDirtyState = ({
  type,
  goalsFor,
  goalsAgainst,
  rivel,
  result,
  teamStats,
  initialState,
  initialTeamStats,
}) => {
  const gameDirty = isGameDirty({ type, goalsFor, goalsAgainst, rivel, result }, initialState);
  const teamStatsDirty = isTeamStatsDirty(teamStats, initialTeamStats);

  return { gameDirty, teamStatsDirty };
};
