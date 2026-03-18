// hub/teamProfile/modules/games/sx/teamGames.sections.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const teamGamesSectionsSx = {
  mediaCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 'lg',
  },

  infoCellSx: {
    minWidth: 0,
    display: 'flex',
    alignContent: 'center',
    gap: 0.65,
    px: 1,
  },

  titleSx: {
    minWidth: 0,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.25,
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
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },
}
