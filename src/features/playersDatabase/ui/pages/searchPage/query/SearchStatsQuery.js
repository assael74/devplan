// features/playersDatabase/ui/pages/searchPage/query/SearchStatsQuery.js

import * as React from 'react'
import {
  Box,
  Button,
  Input,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchStatsQuerySx as sx } from './sx/searchStatsQuery.sx.js'

const PLAYER_PRESET_CONDITIONS = [
  {
    field: 'goals',
    operator: 'gte',
    label: 'שערים לפחות',
    placeholder: 'מספר שערים',
  },
  {
    field: 'appearances',
    operator: 'gte',
    label: 'משחקים לפחות',
    placeholder: 'מספר משחקים',
  },
  {
    field: 'minutes',
    operator: 'gte',
    label: 'דקות לפחות',
    placeholder: 'מספר דקות',
  },
]

const TEAM_PRESET_CONDITIONS = [
  {
    field: 'goalsFor',
    operator: 'gte',
    label: 'שערי זכות לפחות',
    placeholder: 'מספר שערים',
  },
  {
    field: 'goalsAgainst',
    operator: 'lte',
    label: 'שערי חובה עד',
    placeholder: 'מספר שערים',
  },
  {
    field: 'teamGamePlayed',
    operator: 'gte',
    label: 'משחקים לפחות',
    placeholder: 'מספר משחקים',
  },
  {
    field: 'tableRank',
    operator: 'lte',
    label: 'מיקום בטבלה עד',
    placeholder: 'מיקום',
  },
]

function getConditionValue(conditions, field) {
  return conditions.find(item => item.field === field)?.value || ''
}

export default function SearchStatsQuery({
  entityType = 'player',
  conditions,
  onSetCondition,
  onResetConditions,
}) {
  const [expanded, setExpanded] = React.useState(conditions.length > 0)
  const presets = entityType === 'team'
    ? TEAM_PRESET_CONDITIONS
    : PLAYER_PRESET_CONDITIONS

  React.useEffect(() => {
    if (conditions.length > 0) setExpanded(true)
  }, [conditions.length])

  React.useEffect(() => {
    onResetConditions()
  }, [entityType, onResetConditions])

  return (
    <SearchQuerySection title='סטטיסטיקה' step='03'>
      <Button
        size='sm'
        variant={expanded ? 'soft' : 'outlined'}
        startDecorator={iconUi({
          id: 'add',
          size: 'sm',
        })}
        sx={sx.addButton}
        onClick={() => setExpanded(current => !current)}
      >
        {expanded ? 'הסתרת נתונים' : 'הוספת נתון'}
      </Button>

      {expanded ? (
        <Box sx={sx.list}>
          {presets.map(preset => (
            <Box key={preset.field} sx={sx.fieldCard}>
              <Box sx={sx.fieldHeader}>
                <Typography level='body-sm' sx={sx.fieldLabel}>
                  {preset.label}
                </Typography>
                <Typography level='body-xs' sx={sx.operatorLabel}>
                  {preset.operator === 'lte' ? 'מקסימום' : 'מינימום'}
                </Typography>
              </Box>

              <Input
                size='sm'
                type='number'
                sx={sx.input}
                slotProps={{
                  input: {
                    min: 0,
                    inputMode: 'numeric',
                  },
                }}
                value={getConditionValue(conditions, preset.field)}
                placeholder={preset.placeholder}
                onChange={event => onSetCondition({
                  field: preset.field,
                  operator: preset.operator,
                  value: event.target.value,
                })}
              />
            </Box>
          ))}

        </Box>
      ) : null}

      <Button
        size='sm'
        variant='plain'
        color='neutral'
        startDecorator={iconUi({
          id: 'reset',
          size: 'sm',
        })}
        sx={sx.resetButton}
        disabled={conditions.length === 0}
        onClick={onResetConditions}
      >
        איפוס סטטיסטיקה
      </Button>
    </SearchQuerySection>
  )
}
