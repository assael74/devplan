// features/playersDatabase/ui/components/filters/ScoutPrioritySelect.js

import * as React from 'react'
import { Box, Option, Select, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutPriorityColors } from '../scout/ScoutPriority.js'

const optionStyles = {
  elite: {
    label: 'יעד מוביל',
    shortLabel: 'יעד מוביל',
    colors: scoutPriorityColors.leadingTarget,
    iconId: 'leadingTarget',
  },
  high: {
    label: 'עדיפות גבוהה',
    shortLabel: 'גבוהה',
    colors: scoutPriorityColors.highPriority,
    iconId: 'highPriority',
  },
  positive: {
    label: 'חיובי',
    shortLabel: 'חיובי',
    colors: scoutPriorityColors.positive,
    iconId: 'positivePriority',
  },
  neutral: {
    label: 'רגיל',
    shortLabel: 'רגיל',
    colors: scoutPriorityColors.regular,
    iconId: 'regularPriority',
  },
  low: {
    label: 'עדיפות נמוכה',
    shortLabel: 'נמוכה',
    colors: scoutPriorityColors.lowPriority,
    iconId: 'lowPriority',
  },
}

const priorityOptions = [
  {
    value: '',
    label: 'כל העדיפויות',
    shortLabel: 'הכל',
    colors: scoutPriorityColors.regular,
    iconId: 'regularPriority',
  },
  ...Object.entries(optionStyles).map(([value, option]) => ({
    value,
    ...option,
  })),
]

function PriorityOptionContent({
  option,
  fontSize,
  short = false,
}) {
  return (
    <Box sx={{
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      color: option.colors.text,
      fontSize,
    }}>
      {iconUi({
        id: option.iconId,
        size: 'sm',
        sx: {
          flexShrink: 0,
          color: option.colors.main,
          fontSize: fontSize + 2,
        },
      })}

      <Typography
        component='span'
        sx={{
          minWidth: 0,
          color: option.colors.text,
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {short ? option.shortLabel : option.label}
      </Typography>
    </Box>
  )
}

export default function ScoutPrioritySelect({
  label,
  value,
  onChange,
  fontSize = 12,
  shortValueLabel = true,
  sx = {},
}) {
  const selectedOption = priorityOptions.find(option => option.value === (value || '')) || priorityOptions[0]

  return (
    <Box sx={{
      minWidth: 0,
      display: 'grid',
      gap: 0.45,
    }}>
      {label ? (
        <Typography
          level='body-xs'
          sx={{
            color: '#2F86C7',
            fontSize,
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>
      ) : null}

      <Select
        value={value || ''}
        size='sm'
        indicator={null}
        renderValue={() => (
          <PriorityOptionContent
            option={selectedOption}
            fontSize={fontSize}
            short={shortValueLabel}
          />
        )}
        sx={{
          minWidth: 0,
          width: '100%',
          minHeight: 34,
          bgcolor: '#fff',
          borderColor: '#b9d8ef',
          fontSize,

          '& .MuiSelect-indicator': {
            display: 'none',
          },

          '& .MuiSelect-button': {
            minWidth: 0,
            pr: 0,
          },

          ...sx,
        }}
        onChange={(event, nextValue) => onChange?.(nextValue || '')}
      >
        {priorityOptions.map(option => (
          <Option
            key={option.value || 'all'}
            value={option.value}
            sx={{
              fontSize,

              '&.Mui-selected': {
                fontWeight: 700,
              },
            }}
          >
            <PriorityOptionContent
              option={option}
              fontSize={fontSize}
            />
          </Option>
        ))}
      </Select>
    </Box>
  )
}
