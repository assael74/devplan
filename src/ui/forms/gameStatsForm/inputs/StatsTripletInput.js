// src/ui/forms/gameStatsForm/inputs/StatsTripletInput.js

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

export default function StatsTripletInput({
  label,
  totalValue,
  successValue,
  rateValue,
  onChange,
  totalKey,
  successKey,
  rateKey,
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
    <Sheet variant="outlined" sx={sx.tripletCard}>
      <Typography level="body-sm" sx={sx.tripletTitle}>
        {label}
      </Typography>

      <Box sx={sx.tripletGrid}>
        <FormControl size="sm" sx={sx.compactField}>
          <FormLabel>סה״כ</FormLabel>
          <Input
            type="number"
            value={totalValue ?? ''}
            onKeyDown={blockInvalidKeys}
            onPaste={blockInvalidPaste}
            onChange={handleTotal}
            slotProps={{
              input: {
                min: 0,
                inputMode: 'numeric',
              },
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={sx.compactField} disabled={successDisabled}>
          <FormLabel>מוצלח</FormLabel>
          <Input
            type="number"
            value={successDisabled ? '' : successValue ?? ''}
            disabled={successDisabled}
            onKeyDown={blockInvalidKeys}
            onPaste={blockInvalidPaste}
            onChange={handleSuccess}
            slotProps={{
              input: {
                min: 0,
                max: totalNum,
                inputMode: 'numeric',
              },
            }}
          />
        </FormControl>

        <FormControl size="sm" sx={sx.compactField}>
          <FormLabel>%</FormLabel>
          <Input
            value={successDisabled ? '' : rateValue ?? ''}
            readOnly
          />
        </FormControl>
      </Box>
    </Sheet>
  )
}
