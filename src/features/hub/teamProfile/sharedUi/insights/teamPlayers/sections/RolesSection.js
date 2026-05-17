// teamProfile/sharedUi/insights/teamPlayers/sections/RolesSection.js

import React from 'react'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  RangeCardsGrid,
} from '../shared/index.js'

export default function RolesSection({
  cards = [],
}) {
  return (
    <LocalInsightsSection
      title="מעמד בסגל"
      sub="חלוקה לפי שחקני מפתח, מרכזיים, רוטציה ואחרונים"
      icon="keyPlayer"
    >
      <RangeCardsGrid cards={cards} />
    </LocalInsightsSection>
  )
}
