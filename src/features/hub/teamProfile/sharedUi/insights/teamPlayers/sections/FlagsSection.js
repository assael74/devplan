// teamProfile/sharedUi/insights/teamPlayers/sections/FlagsSection.js

import React from 'react'

import {
  LocalInsightsSection,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

export default function FlagsSection({
  item,
  details = [],
}) {
  return (
    <LocalInsightsSection
      title="חריגים לבדיקה"
      sub="ריכוז הפערים המרכזיים בין מבנה, שימוש, פרויקט ותפוקה"
      icon="insights"
    >
      {item ? (
        <Takeaway
          item={item}
          details={details}
          icon="insights"
          value="מוקד בדיקה"
          withMenu={false}
        />
      ) : null}
    </LocalInsightsSection>
  )
}
