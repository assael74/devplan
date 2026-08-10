// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskLeagueFlow.js

import * as React from 'react'
import {
  Box,
  Button,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import {
  LeaguePageContext,
  LeagueReviewContext,
  YearFocus,
} from './WorkTaskContext.js'
import {
  LeagueChoiceCard,
  LevelChoiceCard,
  RouteChoiceCard,
  TeamWorkChoiceCard,
} from './WorkTaskChoiceCard.js'
import {
  TEAM_ROUTE,
  YEAR_ROUTE,
  clean,
} from './workTask.model.js'
import { workTaskLeagueFlowSx as sx } from './sx/workTaskLeagueFlow.sx.js'

function RouteStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <Typography level='title-lg' sx={sx.sectionTitle}>
        איך מתחילים את העבודה?
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        בחר את מסלול העבודה המתאים למשימה שברצונך לפתוח.
      </Typography>

      <Box sx={sx.routeGrid}>
        <RouteChoiceCard
          title='שנתון בלבד'
          description='עבודה רוחבית לפי שנתון, רמות ליגה וליגות.'
          selected={model.workRoute === YEAR_ROUTE}
          onClick={() => actions.onRouteChange(YEAR_ROUTE)}
        />
        <RouteChoiceCard
          title='קבוצה + שנתון'
          description='עבודה ממוקדת על קבוצה של מועדון בשנתון מסוים.'
          selected={model.workRoute === TEAM_ROUTE}
          onClick={() => actions.onRouteChange(TEAM_ROUTE)}
        />
      </Box>
    </Box>
  )
}

function YearStep({ model, actions }) {
  return (
    <Box sx={sx.stepContent}>
      <Typography level='title-lg' sx={sx.sectionTitle}>
        מאיזה שנתון מתחילים לעבוד?
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        שנתון הוא נקודת הכניסה הקבועה לעבודה.
      </Typography>

      <Box sx={sx.fieldWrap}>
        <Typography level='body-xs' sx={sx.fieldLabel}>
          שנתון
        </Typography>
        <Select
          value={model.birthYear || null}
          placeholder='בחר שנתון'
          sx={sx.select}
          onChange={(event, value) => actions.onBirthYearChange(value || '')}
        >
          {model.birthYearOptions.map(year => (
            <Option key={year} value={String(year)}>
              {year}
            </Option>
          ))}
        </Select>
      </Box>
    </Box>
  )
}

function LevelStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <YearFocus birthYear={model.birthYear} />

      <Typography level='title-lg' sx={sx.sectionTitle}>
        בחירת רמת ליגה
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        בכל רמה מוצג מצב טבלאות הליגה לפי עונה.
      </Typography>

      <Box sx={sx.levelGrid}>
        {model.availableLevelOptions.map(option => {
          const seasonMap = model.levelSummaryMap.get(String(option.value)) || new Map()
          const seasons = [...seasonMap.entries()]
            .sort(([seasonA], [seasonB]) => seasonB.localeCompare(seasonA))
            .map(([season, summary]) => {
              const missingCount = summary.missing + summary.partial
              const statusLabel = missingCount === 0
                ? `${summary.full} ליגות מלאות · אין טבלאות חסרות`
                : `${summary.full} ליגות מלאות · ${missingCount} טבלאות להשלמה`

              return {
                key: `${option.value}-${season}`,
                season,
                missingCount,
                statusLabel,
              }
            })

          return (
            <LevelChoiceCard
              key={option.value}
              label={option.label}
              seasons={seasons}
              selected={String(model.leagueLevel) === String(option.value)}
              onClick={() => actions.onLeagueLevelChange(String(option.value))}
            />
          )
        })}
      </Box>

      {!model.availableLevelOptions.length ? (
        <Box sx={sx.emptyState}>
          <Typography sx={sx.emptyTitle}>
            אין רמות ליגה זמינות לשנתון הזה
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

function ReviewStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <LeagueReviewContext
        birthYear={model.birthYear}
        leagueLevel={model.leagueLevel}
      />

      <Box sx={sx.reviewHeader}>
        <Typography level='title-lg' sx={sx.sectionTitle}>
          סקירת הליגות
        </Typography>

        <Box sx={sx.seasonFilter}>
          <Typography level='body-xs' sx={sx.fieldLabel}>
            עונה
          </Typography>
          <Select
            size='sm'
            value={model.seasonKey}
            sx={sx.seasonSelect}
            onChange={(event, value) => actions.onSeasonChange(value || 'all')}
          >
            <Option value='all'>כל העונות</Option>
            {model.seasonOptions.map(season => (
              <Option key={season} value={season}>
                {season}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={sx.leagueGrid}>
        {model.reviewRows.length ? (
          model.reviewRows.map(row => {
            const rowKey = `${row.leagueId}-${row.seasonKey}-${row.birthYear}`

            return (
              <LeagueChoiceCard
                key={rowKey}
                row={row}
                selected={model.selectedLeagueKey === rowKey}
                onClick={() => actions.onLeagueSelect(rowKey)}
              />
            )
          })
        ) : (
          <Box sx={sx.emptyState}>
            <Typography sx={sx.emptyTitle}>
              לא נמצאו ליגות בהקשר הזה
            </Typography>
            <Typography level='body-xs' sx={sx.emptyCaption}>
              נסה עונה אחרת או חזור לבחירת רמת הליגה.
            </Typography>
          </Box>
        )}
      </Box>

      {model.selectedLeague ? (
        <Box sx={sx.selectedTaskPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={sx.selectedTaskTitle}>
            הוספת קבוצות · {clean(
              model.selectedLeague.leagueName || model.selectedLeague.name
            )}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

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

function LeagueTaskTypeStep({ model, actions }) {
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

function LeagueTargetStep({ model, actions }) {
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

export default function WorkTaskLeagueFlow({ mode, model, actions }) {
  if (mode === 'route') return <RouteStep model={model} actions={actions} />
  if (mode === 'year') return <YearStep model={model} actions={actions} />
  if (mode === 'level') return <LevelStep model={model} actions={actions} />
  if (mode === 'review') return <ReviewStep model={model} actions={actions} />
  if (mode === 'taskType') return <LeagueTaskTypeStep model={model} actions={actions} />
  if (mode === 'target') return <LeagueTargetStep model={model} actions={actions} />

  return null
}
