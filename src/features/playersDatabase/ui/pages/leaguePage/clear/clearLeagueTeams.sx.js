// src/features/playersDatabase/ui/pages/leaguePage/clear/clearLeagueTeams.sx.js

export const clearLeagueTeamsSx = {
  content: { width: 'min(660px, calc(100vw - 32px))' },
  body: { display: 'grid', gap: 2 },
  loading: { display: 'flex', alignItems: 'center', gap: 1 },
  stages: { display: 'grid', gap: 0.75 },
  stage: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 1,
    alignItems: 'center',
    px: 1.25,
    py: 0.75,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
  },
  actions: { display: 'flex', gap: 1, justifyContent: 'flex-start', flexWrap: 'wrap', mt: 1 },
}
