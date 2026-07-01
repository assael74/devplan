// src/features/hub/playerProfile/sharedLogic/info/targets.viewModel.js

import {
  buildPlayerTargetProfile,
  buildPlayerTargetsState,
} from '../../../../../shared/players/targets/index.js'

import { buildActualCards, buildPlayerTargetsActuals } from './targets.actuals.js'
import { buildPlayerTargetSections } from './targets.cards.js'

const EMPTY = '—'

const buildTargetBasis = ({ profile, targets }) => {
  const labels = targets?.labels || {}

  return {
    role: labels.role || EMPTY,
    primaryPosition: profile?.primaryPosition || EMPTY,
    positionGroup: profile?.positionGroupLabel || labels.position || EMPTY,
    teamProfile: labels.teamProfile || EMPTY,
  }
}

const buildConfidence = profile => ({
  rated: profile?.confidenceRated === true,
  level: profile?.confidenceLevel || '',
  label: profile?.confidenceLabel || 'לא דורג',
  multiplier: Number(profile?.confidenceMultiplier || 1),
})

export function buildPlayerTargetsViewModel({ player = {}, team = {} } = {}) {
  const profile = buildPlayerTargetProfile({ player, team })
  const targets = buildPlayerTargetsState({ player, team })
  const actuals = buildPlayerTargetsActuals({ player, team })
  const sections = buildPlayerTargetSections({ profile, targets })

  return {
    hasTargets: profile?.hasBenchmark === true,
    emptyText: EMPTY,
    targetProfile: profile,
    targetBasis: buildTargetBasis({ profile, targets }),
    confidence: buildConfidence(profile),
    actualCards: buildActualCards({ actuals }),
    targetSection: sections.primary,
    usageSection: sections.usage,
    targetCards: [...sections.primary.cards, ...sections.usage.cards],
  }
}
