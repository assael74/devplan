// teamProfile/desktop/modules/trainings/TeamTrainingsModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import { TrainingSchedulePreview } from '../../../../../../ui/patterns/schedule'

import { useTeamTrainingsModuleModel } from '../../../sharedModules/trainings'
import { useTeamHubUpdate } from '../../../../hooks/teams/useTeamHubUpdate.js'

export default function TeamTrainingsModule({ entity, context }) {
  const {
    liveTeam,
    trainingWeeks,
  } = useTeamTrainingsModuleModel({
    entity,
    context,
    buildMobileModel: false,
  })

  const { run, pending } = useTeamHubUpdate(liveTeam)

  const handleSave = (patch, meta) => {
    return run(
      'training',
      patch,
      meta
    )
  }

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        trainingWeeks={trainingWeeks}
        title="אימוני קבוצה"
        entity={liveTeam}
        entityType="team"
        context={context}
        mode="profile"
        showNextWeek
        showHeader
        showStats
        onSave={handleSave}
        savePending={pending}
      />
    </SectionPanel>
  )
}
