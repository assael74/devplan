// src/features/hub/teamProfile/sharedUi/management/print/ReportRoot.js

import React, {
  useMemo,
} from 'react'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  resolveEntityAvatar,
} from '../../../../ui/core/avatars/fallbackAvatar.js'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../ui/patterns/reports/index.js'

import {
  getManagementPrintViewModel,
} from './shared/managementPrintViewModel.js'

import PdfReport from './pdf/PdfReport.js'
import UrlReport from './url/UrlReport.js'

function formatReportDate(value) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function resolveTeamAvatarSrc(entity = {}) {
  const club = entity && entity.club ? entity.club : {}

  return resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: club,
    subline: club.name,
  })
}

function resolveEntityName({ model, sourceEntity, modelEntity }) {
  return (
    model.teamName ||
    model.teamDisplayName ||
    sourceEntity.teamName ||
    sourceEntity.name ||
    modelEntity.name ||
    'קבוצה'
  )
}

export default function ReportRoot({
  team,
  draft,
  inputModel = null,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
  presentation = 'pdf',
  isMobile = null,
  actions = null,
}) {
  const theme = useTheme()
  const detectedIsMobile = useMediaQuery(theme.breakpoints.down('md'))
  const resolvedIsMobile = typeof isMobile === 'boolean' ? isMobile : detectedIsMobile

  const model = useMemo(() => {
    return getManagementPrintViewModel({
      inputModel,
      team,
      draft,
      presentation,
      isMobile: resolvedIsMobile,
    })
  }, [ inputModel, team, draft, presentation, resolvedIsMobile ])

  const modelEntity = model.entity || {}
  const teamEntity = model.team || {}
  const sourceEntity = inputModel ? modelEntity : teamEntity

  const avatarSrc = modelEntity.avatarUrl || resolveTeamAvatarSrc(sourceEntity)
  const reportDate = formatReportDate(
    model.reportDate ||
    model.generatedAt ||
    Date.now()
  )

  return (
    <ReportShell
      title={model.title || 'דוח יעדי קבוצה'}
      reportDate={reportDate}
      reportType={REPORT_TYPES.GOALS}
      presentation={presentation}
      isMobile={resolvedIsMobile}
      status={REPORT_STATUS.ACTIVE}
      reportNumber={model.reportNumber}
      printPages={model.printPages || 2}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
      actions={actions}
      entity={{
        type: 'team',
        name: resolveEntityName({ model, sourceEntity, modelEntity }),
        avatarUrl: avatarSrc,
      }}
      metaItems={model.metaItems}
      metaColumns={4}
    >
      {presentation === 'pdf' ? (
        <PdfReport model={model} />
      ) : (
        <UrlReport model={model} />
      )}
    </ReportShell>
  )
}
