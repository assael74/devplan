// teamProfile/sharedUi/insights/teamPlayers/sections/SummarySection.js

import React from 'react'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  SummaryChips,
} from '../components/index.js'

export default function SummarySection({
  cards = [],
}) {
  return (
    <LocalInsightsSection
      title="תקציר מבנה"
      icon="players"
    >
      <SummaryChips cards={cards} />
    </LocalInsightsSection>
  )
}
