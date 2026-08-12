// src/features/playersDatabase/ui/components/modals/workTask/steps/TeamContextStep.js

import * as React from 'react'
import {
  Autocomplete,
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { clean } from '../workTask.model.js'
import { workTaskStepsSx as sx } from '../sx/workTaskSteps.sx.js'

export default function TeamContextStep({ model, actions }) {
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
