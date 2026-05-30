// playerProfile/desktop/modules/trainings/PlayerTrainingsModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { TrainingSchedulePreview } from '../../../../../../ui/patterns/schedule'

import { usePlayerTrainingsModuleModel } from '../../../sharedModules/trainings'

export default function PlayerTrainingsModule({ entity, context }) {
  const {
    player,
    state,
    trainingWeeks,
  } = usePlayerTrainingsModuleModel({
    entity,
    context,
    buildMobileModel: false,
  })

  if (state === 'EMPTY') {
    return (
      <SectionPanel>
        <EmptyState
          title="אין אימונים"
          desc="לא נמצאו נתוני אימונים לשחקן"
        />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        entity={player}
        trainingWeeks={trainingWeeks}
        mode="profile"
        title="אימוני שחקן"
        showHeader
        showStats
        showNextWeek
      />
    </SectionPanel>
  )
}
