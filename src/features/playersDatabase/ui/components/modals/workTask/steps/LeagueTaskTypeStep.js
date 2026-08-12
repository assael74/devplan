// src/features/playersDatabase/ui/components/modals/workTask/steps/LeagueTaskTypeStep.js

import * as React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { LeaguePageContext } from '../WorkTaskContext.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

function TaskTypeIcon({ iconId, exists, label }) {
  return (
    <Box
      aria-label={label}
      title={label}
      sx={[
        sx.taskTypeIcon,
        exists ? sx.taskTypeIconExists : sx.taskTypeIconMissing,
      ]}
    >
      {iconUi({id: iconId, size: 'md'})}
    </Box>
  )
}

export default function LeagueTaskTypeStep({ model, actions }) {
  const loadedTeamsCount = Array.isArray(model.leagueContext?.teams)
    ? model.leagueContext.teams.length
    : 0
  const hasLoadedTeams = loadedTeamsCount > 0
  const rosterMissingCount = Number(
    model.leagueTaskCounts?.rosterMissing || 0
  )
  const statsMissingCount = Number(
    model.leagueTaskCounts?.statsMissing || 0
  )

  return (
    <Box sx={sx.stepContentWide}>
      <LeaguePageContext leagueContext={model.leagueContext} />

      <Typography level='title-lg' sx={sx.sectionTitle}>
        מה המשימה שצריך לבצע?
      </Typography>

      <Box sx={sx.leagueTaskChoiceGrid}>
        <Button
          disabled={hasLoadedTeams}
          variant={model.leagueTaskType === 'teams' ? 'soft' : 'outlined'}
          sx={[
            sx.leagueTaskTypeCard,
            model.leagueTaskType === 'teams' && sx.leagueTaskTypeCardSelected,
          ]}
          onClick={() => actions.onLeagueTaskTypeChange('teams')}
        >
          <TaskTypeIcon
            iconId='addTeams'
            exists={hasLoadedTeams}
            label={hasLoadedTeams ? 'קבוצות קיימות' : 'קבוצות חסרות'}
          />
          <Typography sx={sx.leagueTaskTypeTitle}>
            הוספת קבוצות
          </Typography>
          <Typography level='body-xs' sx={sx.leagueTaskTypeMeta}>
            {hasLoadedTeams
              ? `${loadedTeamsCount} קבוצות קיימות בליגה`
              : 'טעינת טבלת הקבוצות לליגה'}
          </Typography>
        </Button>

        <Button
          disabled={!hasLoadedTeams || rosterMissingCount === 0}
          variant={model.leagueTaskType === 'roster' ? 'soft' : 'outlined'}
          sx={[
            sx.leagueTaskTypeCard,
            model.leagueTaskType === 'roster' && sx.leagueTaskTypeCardSelected,
          ]}
          onClick={() => actions.onLeagueTaskTypeChange('roster')}
        >
          <TaskTypeIcon
            iconId='addPlayers'
            exists={hasLoadedTeams && rosterMissingCount === 0}
            label={hasLoadedTeams
              ? rosterMissingCount > 0
                ? 'יש סגלים להשלמה'
                : 'כל הסגלים הושלמו'
              : 'יש לטעון קבוצות תחילה'}
          />
          <Typography sx={sx.leagueTaskTypeTitle}>
            טעינת סגל
          </Typography>
          <Typography level='body-xs' sx={sx.leagueTaskTypeMeta}>
            {hasLoadedTeams
              ? rosterMissingCount > 0
                ? `${rosterMissingCount} קבוצות להשלמת סגל`
                : 'כל הסגלים הרלוונטיים הושלמו'
              : 'יש לטעון קבוצות לליגה תחילה'}
          </Typography>
        </Button>

        <Button
          disabled={!hasLoadedTeams || statsMissingCount === 0}
          variant={model.leagueTaskType === 'stats' ? 'soft' : 'outlined'}
          sx={[
            sx.leagueTaskTypeCard,
            model.leagueTaskType === 'stats' && sx.leagueTaskTypeCardSelected,
          ]}
          onClick={() => actions.onLeagueTaskTypeChange('stats')}
        >
          <TaskTypeIcon
            iconId='addStats'
            exists={hasLoadedTeams && statsMissingCount === 0}
            label={hasLoadedTeams
              ? statsMissingCount > 0
                ? 'יש סטטיסטיקה להשלמה'
                : 'כל הסטטיסטיקה הושלמה'
              : 'יש לטעון קבוצות תחילה'}
          />
          <Typography sx={sx.leagueTaskTypeTitle}>
            טעינת סטטיסטיקה
          </Typography>
          <Typography level='body-xs' sx={sx.leagueTaskTypeMeta}>
            {hasLoadedTeams
              ? statsMissingCount > 0
                ? `${statsMissingCount} קבוצות להשלמת סטטיסטיקה`
                : 'כל הסטטיסטיקה הרלוונטית הושלמה'
              : 'יש לטעון קבוצות לליגה תחילה'}
          </Typography>
        </Button>
      </Box>
    </Box>
  )
}
