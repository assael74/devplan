// playerProfile/mobile/modules/games/sx/playerGames.sections.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const playerGamesSectionsSx = {
  infoCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
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

  metaItemSx: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
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
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },

  entryCellSx: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'start',
    gap: 0.55,
    px: 1,
  },
}
