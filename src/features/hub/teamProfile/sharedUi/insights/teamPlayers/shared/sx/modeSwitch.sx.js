// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/sx/modeSwitch.sx.js

export const modeSwitchSx = {
  root: {
    justifySelf: 'start',
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    p: 0.2,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  chip: active => ({
    cursor: 'pointer',
    fontWeight: 700,
    minHeight: 24,
    fontSize: 11,
    bgcolor: active ? 'background.surface' : 'transparent',
  }),
}
