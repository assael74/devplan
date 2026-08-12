// src/features/playersDatabase/ui/components/modals/workTask/steps/TeamLookupStep.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import { clean } from '../workTask.model.js'
import { workTaskCardsSx as cardSx } from '../sx/workTaskCards.sx.js'
import { workTaskStepsSx as stepSx } from '../sx/workTaskSteps.sx.js'

export default function TeamLookupStep({ model, actions }) {
  if (!model.selectedTeam) {
    return (
      <Box sx={stepSx.stepContentWide}>
        <Box sx={stepSx.teamLookupContext}>
          <Typography level='body-xs' sx={stepSx.selectedTaskLabel}>
            קבוצה שחיפשת
          </Typography>
          <Typography sx={stepSx.teamLookupTitle}>
            {clean(model.teamInputValue)}
          </Typography>
          <Chip size='sm' variant='soft' sx={stepSx.teamYearChip}>
            שנתון {model.teamBirthYear}
          </Chip>
        </Box>

        <Box sx={stepSx.teamNotFoundState}>
          <Typography sx={stepSx.emptyTitle}>
            הקבוצה לא נמצאה במסמכי הליגות
          </Typography>
          <Typography level='body-sm' sx={stepSx.emptyCaption}>
            לא ניתן לפתוח מכאן משימת סגל או סטטיסטיקה לקבוצה שאינה מופיעה בליגה. חזור ובחר קבוצה אחרת.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={stepSx.stepContentWide}>
      <Box sx={stepSx.teamLookupContext}>
        <Typography level='body-xs' sx={stepSx.selectedTaskLabel}>
          עובדים על
        </Typography>
        <Typography sx={stepSx.teamLookupTitle}>
          {model.selectedTeam.label}
        </Typography>
        <Chip size='sm' variant='soft' sx={stepSx.teamYearChip}>
          שנתון {model.teamBirthYear}
        </Chip>
      </Box>

      <Typography level='title-md' sx={stepSx.teamTaskSectionTitle}>
        בחר ליגה ועונה
      </Typography>

      <Box sx={stepSx.teamAppearanceGrid}>
        {model.selectedTeamAppearances.map(appearance => (
          <Button
            key={appearance.key}
            variant={model.selectedAppearanceKey === appearance.key ? 'soft' : 'outlined'}
            sx={[
              cardSx.teamAppearanceCard,
              model.selectedAppearanceKey === appearance.key && cardSx.teamAppearanceCardSelected,
            ]}
            onClick={() => actions.onAppearanceSelect(appearance.key)}
          >
            <Typography sx={cardSx.teamAppearanceLeague}>
              {appearance.leagueName}
            </Typography>
            <Box sx={cardSx.teamAppearanceMeta}>
              <Typography sx={cardSx.teamAppearanceSeason}>
                {appearance.seasonLabel}
              </Typography>
              {appearance.level ? (
                <Typography level='body-xs' sx={cardSx.teamAppearanceLevel}>
                  רמה {appearance.level}
                </Typography>
              ) : null}
            </Box>
          </Button>
        ))}
      </Box>

      {model.selectedAppearance ? (
        <Box sx={stepSx.teamTaskChoiceWrap}>
          <Typography level='title-md' sx={stepSx.teamTaskSectionTitle}>
            מה צריך לבצע?
          </Typography>

          {model.teamWorkStatusLoading ? (
            <Typography level='body-sm'>בודק מסמך קבוצה...</Typography>
          ) : null}

          {model.teamWorkStatusError ? (
            <Typography level='body-sm'>
              {model.teamWorkStatusError}
            </Typography>
          ) : null}

          {!model.teamWorkStatusLoading && !model.teamWorkStatusError ? (
            <Box sx={stepSx.teamTaskChoiceGrid}>
              <Button
                disabled={model.selectedAppearanceHasRoster}
                variant={model.teamTaskType === 'squad' ? 'soft' : 'outlined'}
                sx={[
                  cardSx.teamTaskChoice,
                  model.teamTaskType === 'squad' && cardSx.teamTaskChoiceSelected,
                ]}
                onClick={() => actions.onTeamTaskTypeChange('squad')}
              >
                {model.selectedAppearanceHasRoster ? 'סגל קיים' : 'טעינת סגל'}
              </Button>

              <Button
                disabled={
                  !model.selectedAppearanceHasRoster ||
                  model.selectedAppearanceStatsComplete
                }
                variant={model.teamTaskType === 'stats' ? 'soft' : 'outlined'}
                sx={[
                  cardSx.teamTaskChoice,
                  model.teamTaskType === 'stats' && cardSx.teamTaskChoiceSelected,
                ]}
                onClick={() => actions.onTeamTaskTypeChange('stats')}
              >
                {model.selectedAppearanceStatsComplete
                  ? 'סטטיסטיקה קיימת'
                  : 'טעינת סטטיסטיקה'}
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {model.selectedAppearance && model.teamTaskType ? (
        <Box sx={stepSx.selectedTaskPreview}>
          <Typography level='body-xs' sx={stepSx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={stepSx.selectedTaskTitle}>
            {model.teamTaskType === 'squad'
              ? 'טעינת סגל'
              : 'טעינת סטטיסטיקה'} · {model.selectedTeam.label} · {model.selectedAppearance.seasonLabel}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
