// playerProfile/sharedLogic/games/insightsDrawer/cards/opportunity.view.js

import {
  buildOpportunityCards,
} from '../cards/opportunity.cards.js'

import {
  buildTakeawayModel,
} from './view.shared.js'

const resolveMetrics = ({ brief, gamesData } = {}) => {
  return buildOpportunityCards({
    brief,
    gamesData,
  })
}

export const buildOpportunityView = ({ data, brief, gamesData = null } = {}) => {
  const metrics = resolveMetrics({
    brief,
    gamesData,
  })

  return {
    metrics,
    takeaway: buildTakeawayModel({
      brief,
      metrics,
      mainId: 'main_opportunity_takeaway',
      icon: 'time',
      label: 'הזדמנות',
      emptyText: 'כאן תופיע תובנה על נפח ההזדמנות שקיבל השחקן.',
    }),
  }
}
