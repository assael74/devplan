// playerProfile/sharedUi/insights/playerGames/PlayerGamesInsightsContent.js

import React from 'react'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
} from '../../../../../../ui/patterns/insights/index.js'

import {
  PlayerBriefCards,
  PlayerBriefDetails,
  PlayerTopStats,
  PlayerMainDiagnosis
} from './sections/index.js'

import { usePlayerGamesInsightsModel } from './usePlayerGamesInsightsModel.js'

export default function PlayerGamesInsightsContent({
  games,
  player,
  team,
}) {
  const model = usePlayerGamesInsightsModel({
    games,
    player,
    team,
  })

  const {
    gamesReady,
    topStats,
    briefCards,
    briefsList,
    blocked,
    mainDiagnosis,
  } = model

  if (!gamesReady) {
    return (
      <LocalInsightsSection title="תובנות משחקי שחקן" icon="insights">
        <ModeBlockedPlaceholder
          title="אין מספיק נתוני משחקים"
          text="כדי להציג תובנות שחקן נדרשים משחקי ליגה משוחקים עם דקות שחקן, פתיחות ונתוני תרומה."
        />
      </LocalInsightsSection>
    )
  }

  return (
    <>
      <LocalInsightsSection title="התאמה השחקן למעמד בסגל" icon="keyPlayer">
        <PlayerMainDiagnosis data={mainDiagnosis} />
      </LocalInsightsSection>

      <LocalInsightsSection title="איכות השימוש" icon="insights">

      </LocalInsightsSection>

      <LocalInsightsSection title="התאמה לעמדה" icon="details">

      </LocalInsightsSection>

      <LocalInsightsSection title="תפוקה ישירה" icon="details">

      </LocalInsightsSection>

      <LocalInsightsSection title="השפעה קבוצתית" icon="details">

      </LocalInsightsSection>

      <LocalInsightsSection title="מגמה אחרונה" icon="details">

      </LocalInsightsSection>

      {blocked?.teamContext ? (
        <LocalInsightsSection title="אמינות השפעה קבוצתית" icon="info">
          <ModeBlockedPlaceholder
            title="השוואת עם/בלי במדגם נמוך"
            text="השפעת השחקן על תוצאות הקבוצה מוצגת ככיוון בלבד עד שיצטברו מספיק משחקים איתו ובלעדיו."
          />
        </LocalInsightsSection>
      ) : null}
    </>
  )
}
