// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskTeamFlow.js

import * as React from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { clean } from './workTask.model.js'
import { workTaskTeamFlowSx as sx } from './sx/workTaskTeamFlow.sx.js'

function TeamContextStep({ model, actions }) {
  return (
    <Box sx={sx.stepContentWide}>
      <Typography level='title-lg' sx={sx.sectionTitle}>
        בחירת קבוצה ושנתון
      </Typography>
      <Typography level='body-sm' sx={sx.sectionCaption}>
        בחר שנתון ואז הקלד או בחר קבוצה מתוך הקבוצות שמופיעות במסמכי הליגות.
      </Typography>

      <Box sx={sx.teamContextGrid}>
        <Box sx={sx.fieldWrapCompact}>
          <Typography level='body-xs' sx={sx.fieldLabel}>
            שנתון
          </Typography>
          <Select
            value={model.teamBirthYear || null}
            placeholder='בחר שנתון'
            sx={sx.select}
            onChange={(event, value) => actions.onTeamBirthYearChange(value || '')}
          >
            {model.birthYearOptions.map(year => (
              <Option key={year} value={String(year)}>
                {year}
              </Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.fieldWrapCompact}>
          <Typography level='body-xs' sx={sx.fieldLabel}>
            קבוצה
          </Typography>
          <Autocomplete
            freeSolo
            options={model.teamOptions}
            value={model.selectedTeam}
            inputValue={model.teamInputValue}
            loading={model.teamOptionsLoading}
            disabled={!model.teamBirthYear}
            placeholder={model.teamBirthYear ? 'הקלד שם קבוצה' : 'בחר שנתון תחילה'}
            getOptionLabel={team => (
              typeof team === 'string' ? team : team.label || ''
            )}
            isOptionEqualToValue={(team, selected) => (
              typeof selected !== 'string' && team.key === selected.key
            )}
            noOptionsText={model.teamOptionsLoading
              ? 'טוען קבוצות...'
              : 'לא נמצאו קבוצות בשנתון'}
            sx={sx.select}
            onInputChange={(event, value) => actions.onTeamInputChange(value || '')}
            onChange={(event, team) => actions.onTeamChange(team)}
          />

          {model.teamOptionsError ? (
            <Typography level='body-xs' color='danger'>
              {model.teamOptionsError}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {model.teamBirthYear && (model.selectedTeam || clean(model.teamInputValue)) ? (
        <Box sx={sx.teamContextPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            הקשר העבודה
          </Typography>
          <Typography sx={sx.teamContextTitle}>
            {model.selectedTeam
              ? model.selectedTeam.label
              : clean(model.teamInputValue)} · שנתון {model.teamBirthYear}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

function TeamLookupStep({ model, actions }) {
  if (!model.selectedTeam) {
    return (
      <Box sx={sx.stepContentWide}>
        <Box sx={sx.teamLookupContext}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            קבוצה שחיפשת
          </Typography>
          <Typography sx={sx.teamLookupTitle}>
            {clean(model.teamInputValue)}
          </Typography>
          <Chip size='sm' variant='soft' sx={sx.teamYearChip}>
            שנתון {model.teamBirthYear}
          </Chip>
        </Box>

        <Box sx={sx.teamNotFoundState}>
          <Typography sx={sx.emptyTitle}>
            הקבוצה לא נמצאה במסמכי הליגות
          </Typography>
          <Typography level='body-sm' sx={sx.emptyCaption}>
            לא ניתן לפתוח מכאן משימת סגל או סטטיסטיקה לקבוצה שאינה מופיעה בליגה. חזור ובחר קבוצה אחרת.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.stepContentWide}>
      <Box sx={sx.teamLookupContext}>
        <Typography level='body-xs' sx={sx.selectedTaskLabel}>
          עובדים על
        </Typography>
        <Typography sx={sx.teamLookupTitle}>
          {model.selectedTeam.label}
        </Typography>
        <Chip size='sm' variant='soft' sx={sx.teamYearChip}>
          שנתון {model.teamBirthYear}
        </Chip>
      </Box>

      <Typography level='title-md' sx={sx.teamTaskSectionTitle}>
        בחר ליגה ועונה
      </Typography>

      <Box sx={sx.teamAppearanceGrid}>
        {model.selectedTeamAppearances.map(appearance => (
          <Button
            key={appearance.key}
            variant={model.selectedAppearanceKey === appearance.key ? 'soft' : 'outlined'}
            sx={[
              sx.teamAppearanceCard,
              model.selectedAppearanceKey === appearance.key && sx.teamAppearanceCardSelected,
            ]}
            onClick={() => actions.onAppearanceSelect(appearance.key)}
          >
            <Typography sx={sx.teamAppearanceLeague}>
              {appearance.leagueName}
            </Typography>
            <Box sx={sx.teamAppearanceMeta}>
              <Typography sx={sx.teamAppearanceSeason}>
                {appearance.seasonLabel}
              </Typography>
              {appearance.level ? (
                <Typography level='body-xs' sx={sx.teamAppearanceLevel}>
                  רמה {appearance.level}
                </Typography>
              ) : null}
            </Box>
          </Button>
        ))}
      </Box>

      {model.selectedAppearance ? (
        <Box sx={sx.teamTaskChoiceWrap}>
          <Typography level='title-md' sx={sx.teamTaskSectionTitle}>
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
            <Box sx={sx.teamTaskChoiceGrid}>
              <Button
                disabled={model.selectedAppearanceHasRoster}
                variant={model.teamTaskType === 'squad' ? 'soft' : 'outlined'}
                sx={[
                  sx.teamTaskChoice,
                  model.teamTaskType === 'squad' && sx.teamTaskChoiceSelected,
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
                  sx.teamTaskChoice,
                  model.teamTaskType === 'stats' && sx.teamTaskChoiceSelected,
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
        <Box sx={sx.selectedTaskPreview}>
          <Typography level='body-xs' sx={sx.selectedTaskLabel}>
            משימה שתיווצר
          </Typography>
          <Typography sx={sx.selectedTaskTitle}>
            {model.teamTaskType === 'squad'
              ? 'טעינת סגל'
              : 'טעינת סטטיסטיקה'} · {model.selectedTeam.label} · {model.selectedAppearance.seasonLabel}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

export default function WorkTaskTeamFlow({ mode, model, actions }) {
  if (mode === 'context') {
    return <TeamContextStep model={model} actions={actions} />
  }

  if (mode === 'lookup') {
    return <TeamLookupStep model={model} actions={actions} />
  }

  return null
}
