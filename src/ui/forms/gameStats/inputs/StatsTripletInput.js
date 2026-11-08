// src/ui/forms/gameStats/inputs/StatsTripletInput.js

import React from 'react'
import { Box, FormControl, FormLabel, Input, Sheet, Typography } from '@mui/joy'

import {
  buildTripletSuccessPatch,
  buildTripletTotalPatch,
  isTripletSuccessDisabled,
  isValidTripletNumberInput,
  shouldBlockTripletKey,
  shouldBlockTripletPaste,
  toTripletNumber,
} from '../logic/entry.logic.js'

import { inputsSx as sx } from './sx/inputs.sx.js'
import StatsParameterHelp from './StatsParameterHelp.js'

export default function StatsTripletInput({
  label,
  description,
  totalValue,
  successValue,
  rateValue,
  onChange,
  totalKey,
  successKey,
  rateKey,
  disabled = false,
  readOnly = false,
}) {
  const totalNum = toTripletNumber(totalValue)
  const successDisabled = isTripletSuccessDisabled(totalValue)

  const blockInvalidKeys = event => {
    if (shouldBlockTripletKey(event.key)) {
      event.preventDefault()
    }
  }

  const blockInvalidPaste = event => {
    const text = event.clipboardData.getData('text')

    if (shouldBlockTripletPaste(text)) {
      event.preventDefault()
    }
  }

  const handleTotal = event => {
    if (disabled || readOnly) return
    const rawValue = event.target.value
    if (!isValidTripletNumberInput(rawValue)) return

    onChange(
      buildTripletTotalPatch({
        rawValue,
        successValue,
        totalKey,
        successKey,
        rateKey,
      })
    )
  }

  const handleSuccess = event => {
    if (disabled || readOnly) return
    const rawValue = event.target.value
    if (successDisabled) return
    if (!isValidTripletNumberInput(rawValue)) return

    onChange(
      buildTripletSuccessPatch({
        rawValue,
        totalValue,
        successKey,
        rateKey,
      })
    )
  }

  return (
    <Sheet variant="plain" sx={sx.tripletCard}>
      <Box sx={sx.tripletHeader}>
        <Typography level="body-xs" sx={sx.tripletTitle}>
          {label}
        </Typography>
        <StatsParameterHelp label={label} description={description} />
      </Box>

      <Box sx={sx.tripletGrid}>
        <FormControl size="sm" sx={sx.compactField} disabled={disabled}>
          <FormLabel>סה״כ</FormLabel>
          <Input
            type="number"
            value={totalValue === null || totalValue === undefined ? '' : totalValue}
            disabled={disabled}
            readOnly={readOnly}
            onKeyDown={blockInvalidKeys}
            onPaste={blockInvalidPaste}
            onChange={handleTotal}
            slotProps={{
              input: {
                min: 0,
                inputMode: 'numeric',
                'aria-label': `סה״כ ${label}`,
              },
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={sx.compactField} disabled={disabled || successDisabled}>
          <FormLabel>מוצלח</FormLabel>
          <Input
            type="number"
            value={successDisabled || successValue === null || successValue === undefined ? '' : successValue}
            disabled={disabled || successDisabled}
            readOnly={readOnly}
            onKeyDown={blockInvalidKeys}
            onPaste={blockInvalidPaste}
            onChange={handleSuccess}
            slotProps={{
              input: {
                min: 0,
                max: totalNum,
                inputMode: 'numeric',
                'aria-label': `הצלחות ${label}`,
              },
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={sx.compactField}>
          <FormLabel>%</FormLabel>
          <Input
            value={successDisabled || rateValue === null || rateValue === undefined || rateValue === ''
              ? ''
              : `${Math.round(toTripletNumber(rateValue))}%`}
            readOnly
            sx={sx.percentInput}
            slotProps={{ input: { 'aria-label': `אחוז הצלחה ${label}` } }}
          />
        </FormControl>
      </Box>
    </Sheet>
  )
}
