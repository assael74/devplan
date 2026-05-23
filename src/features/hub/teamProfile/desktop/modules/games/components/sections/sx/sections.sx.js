// teamProfile/desktop/modules/games/sections/sx/sections.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const sectionsSx = {
  mediaCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 'lg',
  },

  avatarDot: (statusMeta) => ({
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: '50%',
    bgcolor: `${statusMeta?.color || 'neutral'}.solidBg`,
    border: '2px solid',
    borderColor: 'background.surface',
    boxShadow: 'sm',
  }),

  infoCellSx: {
    minWidth: 0,
    display: 'flex',
    alignContent: 'center',
    gap: 0.65,
    px: 1,
  },

  titleSx: {
    minWidth: 0,
    flex: 1,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    lineHeight: 1.25,
  },

  emptyList: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    flexWrap: 'nowrap',
  },

  leagueNum: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontWeight: 700,
    lineHeight: 1.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    fontSize: 10,
    px: 0.75,
    py: 0.25,
  },

  infoMetaRowSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  metaItemSx: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    color: 'text.secondary',
  },

  resultCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'center',
    gap: 0.55,
    px: 1,
    textAlign: 'center',
  },

  impactCellSx: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },

  chip: count => ({
    minWidth: 0,
    maxWidth: count <= 1 ? 150 : count === 2 ? 116 : count === 3 ? 94 : 78,
    flex: '1 1 0',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',

    '& .MuiChip-label': {
      minWidth: 0,
      overflow: 'hidden',
    },
  }),

  chipText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 11
  },

  moreChip: {
    flex: '0 0 auto',
  },

  entryCellSx: {
    minWidth: 0,
    display: 'flex',
    gap: 0.55,
  },
}
