// playerProfile/sharedLogic/games/insightsDrawer/cards/difficulty.view.js

import {
  buildDifficultyCards,
} from '../cards/difficulty.cards.js'

import {
  buildTakeawayModel,
} from './view.shared.js'

export const buildDifficultyView = ({ brief } = {}) => {
  const metrics = buildDifficultyCards(brief)

  return {
    metrics,
    takeaway: buildTakeawayModel({
      brief,
      metrics,
      mainId: 'main_difficulty_takeaway',
      icon: 'difficulty',
      label: 'רמת יריבה',
      emptyText: 'כאן תופיע תובנה על ביצועי השחקן לפי רמת יריבה.',
    }),
  }
}
