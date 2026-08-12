// src/features/playersDatabase/ui/components/modals/workTask/steps/LeagueTargetStep.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { LeaguePageContext } from '../WorkTaskContext.js'
import TeamWorkChoiceCard from '../cards/TeamWorkChoiceCard.js'
import { clean } from '../workTask.model.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function LeagueTargetStep({ model, actions }) {
  if (model.leagueTaskType === 'teams') {
    return (
      <Box sx={sx.stepContentWide}>
        <LeaguePageContext leagueContext={model.leagueContext} />

        <Box sx={sx.selectedTaskPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={sx.selectedTaskTitle}>
            הוספת קבוצות · {model.leagueContext?.league?.name} · {model.leagueContext?.seasonKey}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.stepContentWide}>
      <LeaguePageContext leagueContext={model.leagueContext} />

      <Box sx={sx.targetStickyHeader}>
        <Typography level='title-lg' sx={sx.sectionTitle}>
          {model.leagueTaskType === 'roster'
            ? 'בחר קבוצה לטעינת סגל'
            : 'בחר קבוצה לטעינת סטטיסטיקה'}
        </Typography>

        <Typography level='body-sm' sx={sx.sectionCaption}>
          {model.leagueTaskType === 'roster'
            ? 'מוצגות קבוצות עם עדיפות חיובי ומעלה בהתקפה או בהגנה. קבוצה עם סגל קיים אינה ניתנת לבחירה.'
            : 'מוצגות קבוצות עם סגל ובעדיפות חיובי ומעלה בהתקפה או בהגנה. קבוצה עם סטטיסטיקה מלאה אינה ניתנת לבחירה.'}
        </Typography>
      </Box>

      {model.leagueTeamStatusesLoading ? (
        <Box sx={sx.teamNotFoundState}>
          <Typography level='body-sm'>טוען מצב קבוצות...</Typography>
        </Box>
      ) : null}

      {model.leagueTeamStatusesError ? (
        <Typography level='body-sm' color='danger'>
          {model.leagueTeamStatusesError}
        </Typography>
      ) : null}

      {!model.leagueTeamStatusesLoading && !model.leagueTeamStatusesError ? (
        <Box sx={sx.teamAppearanceGrid}>
          {model.leagueTaskTeams.map(team => {
            const teamId = clean(team.birthTeamId || team.teamId || team.id)
            const status = model.leagueTeamStatuses[teamId] || {}
            const disabled = model.leagueTaskType === 'roster'
              ? Boolean(status.rosterLoaded)
              : Boolean(status.statsComplete)
            const stateLabel = model.leagueTaskType === 'roster'
              ? disabled ? 'סגל קיים' : 'טעינת סגל'
              : disabled ? 'סטטיסטיקה מלאה' : 'טעינת סטטיסטיקה'

            return (
              <TeamWorkChoiceCard
                key={teamId}
                team={team}
                disabled={disabled}
                stateLabel={stateLabel}
                stateIconId={model.leagueTaskType === 'roster' ? 'addPlayers' : 'addStats'}
                selected={model.leagueTeamId === teamId}
                onClick={() => actions.onLeagueTeamSelect(teamId)}
              />
            )
          })}
        </Box>
      ) : null}

      {!model.leagueTeamStatusesLoading && !model.leagueTaskTeams.length ? (
        <Box sx={sx.teamNotFoundState}>
          <Typography sx={sx.emptyTitle}>
            אין קבוצות זמינות למשימה הזו
          </Typography>
        </Box>
      ) : null}

      {model.selectedLeagueTaskTeam ? (
        <Box sx={sx.selectedTaskPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={sx.selectedTaskTitle}>
            {model.leagueTaskType === 'roster'
              ? 'טעינת סגל'
              : 'טעינת סטטיסטיקה'} · {model.selectedLeagueTaskTeam.name}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
