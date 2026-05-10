// teamProfile/desktop/modules/games/sx/sections.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.25,
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

  entryCellSx: {
    minWidth: 0,
    display: 'flex',
    alignContent: 'start',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },
}
