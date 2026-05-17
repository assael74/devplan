// playerProfile/sharedLogic/games/insightsDrawer/print/playerGamesInsightsPrint.model.js

import {
  buildPlayerPrintMainModel,
} from './printMain.model.js'

import {
  buildPlayerPrintSectionsModel,
} from './printSections.model.js'

export const buildPlayerGamesInsightsPrintModel = (model = {}) => {
  const mainModel = buildPlayerPrintMainModel(model)
  const sections = buildPlayerPrintSectionsModel(model)

  return {
    ...mainModel,
    sections,
  }
}
