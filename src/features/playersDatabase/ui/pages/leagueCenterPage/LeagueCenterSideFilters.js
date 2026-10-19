// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSideFilters.js

import {
  Box,
  Button,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueCenterSideFiltersSx as sx } from './sx/leagueCenterSideFilters.sx.js'

export default function LeagueCenterSideFilters({ model }) {
  const quickViews = [
    { id: 'active', label: 'פעילה' },
    { id: 'not_started', label: 'לא החלה' },
    { id: 'review', label: 'לבדיקה' },
    { id: 'priority', label: 'עם איתותים' },
  ]

  return (
    <Stack spacing={1} sx={sx.root}>
      <Box sx={sx.header}>
        <Typography level='title-sm' sx={sx.title}>פילטרים</Typography>

        <Tooltip title='איפוס פילטרים'>
          <IconButton
            size='sm'
            variant='outlined'
            color='neutral'
            aria-label='איפוס פילטרים'
            sx={sx.resetButton}
            onClick={model.resetContext}
          >
            {iconUi({id: 'reset', size: 'sm'})}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={sx.gridThree}>
        <FilterSelect
          label='שנתון'
          value={model.birthYear}
          onChange={model.setBirthYear}
          options={[
            { value: 'all', label: 'הכל' },
            ...model.birthYearOptions.map(year => ({ value: String(year), label: String(year) })),
          ]}
        />
        <FilterSelect
          label='עונה'
          value={model.seasonKey}
          onChange={model.setSeasonKey}
          options={[
            { value: 'all', label: 'הכל' },
            ...model.seasonOptions
              .filter(option => option !== 'all')
              .map(option => ({ value: option, label: option })),
          ]}
        />
        <FilterSelect
          label='רמה'
          value={model.leagueLevel}
          onChange={model.setLeagueLevel}
          options={[
            { value: 'all', label: 'הכל' },
            ...model.levelOptions,
          ]}
        />
      </Box>

      <Box sx={sx.gridSecondary}>
        <Box sx={sx.field}>
          <Typography level='body-xs' sx={sx.label}>חיפוש קבוצה</Typography>
          <Input
            size='sm'
            placeholder='שם קבוצה...'
            value={model.query}
            sx={sx.input}
            onChange={event => model.setQuery(event.target.value)}
          />
        </Box>
        <FilterSelect
          label='קבוצת גיל'
          value={model.ageGroupId}
          onChange={model.setAgeGroupId}
          options={[
            { value: 'all', label: 'הכל' },
            ...model.ageGroupOptions,
          ]}
        />
      </Box>

      <Box sx={sx.quickViews}>
        <Typography level='body-xs' sx={sx.label}>תצוגה מהירה</Typography>
        <Box sx={sx.quickViewActions}>
          {quickViews.map(view => (
            <Button
              key={view.id}
              size='sm'
              variant={model.quickView === view.id ? 'solid' : 'soft'}
              sx={sx.quickViewButton}
              onClick={() => model.setQuickView(
                model.quickView === view.id ? 'all' : view.id
              )}
            >
              {view.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Stack>
  )
}

function FilterSelect({ label, value, options, onChange }) {
  const hasSelectedOption = options.some(option => option.value === value)

  return (
    <Box sx={sx.field}>
      <Typography level='body-xs' sx={sx.label}>{label}</Typography>
      <Select
        size='sm'
        indicator={null}
        value={value}
        sx={sx.select}
        onChange={(event, nextValue) => {
          if (nextValue) onChange(nextValue)
        }}
      >
        {!hasSelectedOption && value !== 'all' ? (
          <Option value={value}>{value}</Option>
        ) : null}
        {options.map(option => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>
    </Box>
  )
}
