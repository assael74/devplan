// teamProfile/sharedLogic/games/insightsLogic/print/teamGamesInsightsPrint.model.js

import { buildInsightsPrintReportModel } from '../../../../../../../shared/games/insights/shared/index.js'

import {
  buildPrintMainCards,
  buildPrintMainTakeaway,
  buildPrintMeta,
  getPrintTeamTitle,
} from './printMain.model.js'

import { buildPrintSections } from './printSections.model.js'

export const buildTeamGamesInsightsPrintModel = ({ model } = {}) => {
  const liveTeam = model?.liveTeam || {}
  const calculationMode = model?.calculationMode
  const forecast = model?.forecast || {}
  const targetRows = model?.targetRows || []
  const briefSections = model?.briefSections || {}

  const cards = buildPrintMainCards({
    forecast,
    targetRows,
  })

  const sections = buildPrintSections({
    model,
    briefSections,
  })

  const baseModel = buildInsightsPrintReportModel({
    reportType: 'דוח תובנות משחקי קבוצה',
    title: getPrintTeamTitle(liveTeam),
    subtitle: 'סיכום תובנות משחקים',
    meta: buildPrintMeta({
      liveTeam,
      calculationMode,
      model,
    }),
    cards: [],
    sections: [],
  })

  return {
    ...baseModel,
    cards,
    sections,
    mainTakeaway: buildPrintMainTakeaway(briefSections),
  }
}
