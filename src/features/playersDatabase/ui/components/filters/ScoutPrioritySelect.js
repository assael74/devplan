// features/playersDatabase/ui/components/filters/ScoutPrioritySelect.js

import * as React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutPriorityColors } from '../../../../../ui/patterns/scout/ScoutPriority.js'
import { scoutPrioritySelectSx as styles } from './scoutPrioritySelect.sx.js'

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
  count = null,
}) {
  return (
    <Box sx={styles.optionContent({
      colors: option.colors,
      fontSize,
    })}>
      {iconUi({
        id: option.iconId,
        size: 'sm',
        sx: styles.optionIcon({
          colors: option.colors,
          fontSize,
        }),
      })}

      <Typography
        component='span'
        sx={styles.optionLabel({
          colors: option.colors,
          fontSize,
        })}
      >
        {short ? option.shortLabel : option.label}
        {Number.isFinite(count) ? ` · ${count}` : ''}
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
  thresholdMode = false,
  counts = {},
  sx: externalSx = {},
}) {
  const options = thresholdMode
    ? priorityOptions
      .filter(option => ['', 'positive', 'high', 'elite'].includes(option.value))
      .map(option => ({
        ...option,
        label: option.value && option.value !== 'elite'
          ? `${option.label} ומעלה`
          : option.label,
        shortLabel: option.value && option.value !== 'elite'
          ? `${option.shortLabel}+`
          : option.shortLabel,
      }))
    : priorityOptions
  const selectedOption = options.find(option => option.value === (value || '')) || options[0]

  return (
    <Box sx={styles.root}>
      {label ? (
        <Typography
          level='body-xs'
          sx={styles.label(fontSize)}
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
            count={counts[selectedOption.value || 'all']}
          />
        )}
        sx={[styles.select(fontSize), externalSx]}
        onChange={(event, nextValue) => onChange?.(nextValue || '')}
      >
        {options.map(option => (
          <Option
            key={option.value || 'all'}
            value={option.value}
            sx={styles.option(fontSize)}
          >
            <PriorityOptionContent
              option={option}
              fontSize={fontSize}
              count={counts[option.value || 'all']}
            />
          </Option>
        ))}
      </Select>
    </Box>
  )
}
