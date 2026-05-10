// playerProfile/sharedLogic/games/insightsDrawer/cards/impact.view.js

import {
  buildImpactCards,
} from '../cards/impact.cards.js'

import {
  buildTakeawayModel,
} from './view.shared.js'

export const buildImpactView = ({ brief } = {}) => {
  const metrics = buildImpactCards(brief)

  return {
    metrics,
    takeaway: buildTakeawayModel({
      brief,
      metrics,
      mainId: 'main_team_impact_takeaway',
      icon: 'team',
      label: 'השפעה',
      emptyText: 'כאן תופיע תובנה על השפעת השחקן על ביצועי הקבוצה.',
    }),
  }
}
