// ui/forms/MeetingCreateForm.js

import React, { useEffect, useMemo } from 'react'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import MeetingCreateFields from './ui/meetings/MeetingCreateFields.js'
import { getMeetingCreateFormLayout } from './layouts/meetingCreateForm.layout.js'

const clean = (v) => String(v ?? '').trim()

export default function MeetingCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const validity = useMemo(() => {
    const meetingDate = clean(draft?.meetingDate)
    const meetingFor = clean(draft?.meetingFor)
    const type = clean(draft?.type)

    const okDate = !!meetingDate
    const okFor = !!meetingFor
    const okType = !!type

    const isValid = okDate && okFor && okType

    return {
      isValid,
      okDate,
      okFor,
      okType,
    }
  }, [draft])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(() => {
    return getMeetingCreateFormLayout({ variant, isMobile })
  }, [variant, isMobile])

  return (
    <MeetingCreateFields
      draft={draft}
      onDraft={onDraft}
      onValidChange={onValidChange}
      context={context}
      validity={validity}
      layout={layout}
    />
  )
}
