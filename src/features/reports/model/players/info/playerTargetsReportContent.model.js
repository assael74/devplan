// features/reports/model/players/info/playerTargetsReportContent.model.js

import {
  buildPlayerTargetsPrintModel,
} from '../../../../hub/playerProfile/sharedLogic/info/print/playerTargetsPrintModel.js'

import {
  sanitizeReportValue,
} from '../../reportValue.shared.js'

export function buildPlayerTargetsReportContent({
  player,
  team,
  reportDate,
} = {}) {
  return sanitizeReportValue(
    buildPlayerTargetsPrintModel({
      player,
      team,
      reportDate,
    })
  )
}
