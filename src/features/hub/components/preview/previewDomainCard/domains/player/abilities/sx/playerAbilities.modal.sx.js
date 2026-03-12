//    preview/PreviewDomainCard/domains/abilities/player/sx/playerAbilities.domain.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const sx = {
  cardStack: {
    display: 'flex',
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    gap: 1
  },

  domainBox: {
    position: 'relative',
    width: 48,
    height: 48,
    flexShrink: 0
  },

  typoDomain: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%) translateY(1px)',
    lineHeight: 1,
    fontWeight: 600,
  }
}
