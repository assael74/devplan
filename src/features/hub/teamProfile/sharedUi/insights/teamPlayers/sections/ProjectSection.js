// teamProfile/sharedUi/insights/teamPlayers/sections/ProjectSection.js

import React from 'react'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  SummaryChips,
} from '../components/index.js'

export default function ProjectSection({
  cards = [],
}) {
  return (
    <LocalInsightsSection
      title="פרויקט ופיתוח"
      sub="סטטוס שחקנים ביחס לפרויקט: פרויקט, מועמדות, סירוב וכללי"
      icon="project"
    >
      <SummaryChips cards={cards} forceNeutral />
    </LocalInsightsSection>
  )
}
