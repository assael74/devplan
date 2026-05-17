// teamProfile/sharedUi/insights/teamPlayers/cards/project.cards.js

import {
  buildTooltip,
} from '../tooltips/index.js'

const emptyArray = []

const getWarningTone = (count) => {
  return count > 0 ? 'warning' : 'success'
}
