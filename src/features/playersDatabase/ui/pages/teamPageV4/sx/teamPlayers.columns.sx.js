// features/playersDatabase/ui/pages/teamPage/sx/teamPlayers.columns.sx.js

export const teamPlayersColumnsSx = {
  avatarWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    mx: 'auto',
  },
  avatarInterestBadge: level => {
    const colors = {
      reasonable: '#9CA3AF',
      curious: '#F59E0B',
      interesting: '#2F86C7',
      super_interesting: '#2B7C82',
      unavailable: '#CBD5E1',
    }

    return {
      position: 'absolute',
      insetInlineStart: -1,
      bottom: -1,
      width: 10,
      height: 10,
      display: 'block',
      borderRadius: '50%',
      bgcolor: colors[level] || '#9CA3AF',
      border: '2px solid #FFFFFF',
      boxShadow: '0 1px 3px rgba(16, 43, 64, 0.22)',
      zIndex: 1,
    }
  },
  playerStatusBadge: color => ({
    width: 20,
    height: 20,
    minWidth: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: `var(--joy-palette-${color}-700)`,
    bgcolor: `var(--joy-palette-${color}-100)`,
    border: `1px solid var(--joy-palette-${color}-300)`,
    lineHeight: 1,

    '& svg': {
      fontSize: 13,
    },
  }),

  profileCell: {
    width: '100%',
    minWidth: 0,
    py: 0.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
}
