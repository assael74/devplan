// features/playersDatabase/ui/pages/searchPage/query/SearchStatsQuery.js

import * as React from 'react'
import { Box, Button, Input, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchStatsQuerySx as sx } from './sx/searchStatsQuery.sx.js'

const PRESET_CONDITIONS = [
  {
    field: 'goals',
    operator: 'gte',
    label: 'שערים מעל',
    placeholder: 'מספר שערים',
  },
  {
    field: 'minutes',
    operator: 'gte',
    label: 'דקות מעל',
    placeholder: 'מספר דקות',
  },
  {
    field: 'starts',
    operator: 'gte',
    label: 'הרכב מעל',
    placeholder: 'מספר הופעות בהרכב',
  },
  {
    field: 'yellowCards',
    operator: 'lte',
    label: 'צהובים עד',
    placeholder: 'מספר כרטיסים',
  },
]

function getConditionValue(conditions, field) {
  const condition = conditions.find(item => item.field === field)
  return condition?.value || ''
}

export default function SearchStatsQuery({ conditions, onSetCondition }) {
  const [expanded, setExpanded] = React.useState(conditions.length > 0)

  React.useEffect(() => {
    if (conditions.length > 0) {
      setExpanded(true)
    }
  }, [conditions.length])

  return (
    <SearchQuerySection title='תנאים סטטיסטיים' step='03'>
      <Button
        size='sm'
        variant={expanded ? 'soft' : 'outlined'}
        startDecorator={iconUi({ id: 'add', size: 'sm' })}
        sx={sx.addButton}
        onClick={() => setExpanded(current => !current)}
      >
        {expanded ? 'הסתרת תנאים' : 'הוספת תנאי'}
      </Button>

      {expanded && (
        <Box sx={sx.list}>
          {PRESET_CONDITIONS.map(preset => (
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
      )}
    </SearchQuerySection>
  )
}
