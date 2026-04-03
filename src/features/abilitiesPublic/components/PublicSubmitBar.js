// features/abilitiesPublic/components/PublicSubmitBar.js

import React from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { domainsSubmitBarSx as sx } from './sx/domainsSubmitBar.sx'

function MissingItemsList({ items = [] }) {
  if (!Array.isArray(items) || !items.length) return null

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {items.map((item) => (
        <Chip
          key={item.id}
          size="sm"
          variant="soft"
          color={item.kind === 'required' ? 'danger' : 'warning'}
          startDecorator={iconUi({ id: item.kind === 'required' ? 'close' : 'info' })}
        >
          {item.label}
        </Chip>
      ))}
    </Stack>
  )
}

export default function PublicSubmitBar({ form = {} }) {
  const {
    ready = false,
    handleSubmit = () => {},
    submitting = false,
    submitted = false,
    submitError = '',
    completion = {},
  } = form

  const {
    totalDomains = 0,
    startedDomains = 0,
    fullDomains = 0,
    missingRequired = [],
    missingDomains = [],
    summaryText = '',
  } = completion

  const topMissing = [...missingRequired, ...missingDomains].slice(0, 4)

  return (
    <Sheet
      variant="solid"
      color="neutral"
      invertedColors
      sx={sx.sheet}
    >
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 1.25, py: 1.1 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={0.5}>
            <Chip size="sm" variant="soft" color={ready ? 'success' : 'neutral'}>
              התחילו {startedDomains}/{totalDomains}
            </Chip>

            <Chip size="sm" variant="soft" color={fullDomains === totalDomains && totalDomains > 0 ? 'success' : 'primary'}>
              מלאים {fullDomains}/{totalDomains}
            </Chip>

            {!ready && !submitted ? (
              <Chip size="sm" variant="soft" color="warning">
                נשארו {completion?.remainingDomains || 0}
              </Chip>
            ) : null}
          </Stack>

          {!submitted && !ready && topMissing.length ? (
            <MissingItemsList items={topMissing} />
          ) : null}

          {submitError ? (
            <Typography level="body-sm" color="danger">
              {submitError}
            </Typography>
          ) : null}

          <Button
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!ready || submitting || submitted}
            onClick={handleSubmit}
            startDecorator={iconUi({ id: submitted ? 'check' : 'send' })}
            sx={{ minHeight: 48, borderRadius: '999px', fontWeight: 700 }}
          >
            {submitted ? 'הטופס נשלח' : 'שליחת הטופס'}
          </Button>
        </Stack>
      </Box>
    </Sheet>
  )
}
