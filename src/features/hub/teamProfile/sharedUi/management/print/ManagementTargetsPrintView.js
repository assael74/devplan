// teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js

import React, { useMemo } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { ReportShell, REPORT_STATUS, REPORT_TYPES } from '../../../../../../ui/patterns/reports/index.js'
import { buildManagementTargetsPrintModel } from '../../../sharedLogic/management/index.js'

import { printSx as sx } from './print.sx.js'

const EMPTY = '—'

const formatReportDate = value => {
  const date = value instanceof Date ? value : new Date(value || Date.now())
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

const resolveTeamAvatarSrc = entity => {
  return resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })
}

const resolveClubName = entity => {
  return entity?.club?.name || entity?.club?.clubName || EMPTY
}

const MetricCard = ({ label, value, helper }) => {

  return (
    <Sheet variant='outlined' sx={sx.metricCard}>
      <Typography level='body-xs' sx={sx.metricLabel}>{label}</Typography>
      <Typography level='title-lg' sx={sx.metricValue}>{value || EMPTY}</Typography>
      {helper ? <Typography level='body-xs' sx={sx.metricHelper}>{helper}</Typography> : null}
    </Sheet>
  )
}

const TargetSummary = ({ target }) => {
  if (!target) return null

  return (
    <Sheet variant='outlined' sx={sx.targetSummary}>
      <Typography level='body-xs' sx={sx.targetEyebrow}>{target.label}</Typography>
      <Typography level='h3' sx={sx.targetValue}>{target.value || EMPTY}</Typography>
    </Sheet>
  )
}

const SectionRow = ({ row, sectionId }) => {
  const allowValueWrap = sectionId === 'homeAway' || sectionId === 'difficulty'
  const label = row.baseLabel || row.label
  const helper = row.baseHelper || row.helper
  const icon = iconUi({ id: row.idIcon, sx: sx.rowIconSvg })

  return (
    <Box sx={sx.row(sectionId, row.id)}>
      {icon ? <Box sx={sx.rowIcon(sectionId)}>{icon}</Box> : null}
      <Typography level='body-sm' sx={sx.rowLabel(sectionId, row.id)}>{label}</Typography>
      <Typography level='title-sm' sx={sx.rowValue({ allowValueWrap, sectionId, rowId: row.id })}>
        {row.value || EMPTY}
      </Typography>
      {helper ? <Typography level='body-xs' sx={sx.rowHelper}>{helper}</Typography> : null}
    </Box>
  )
}

const ReportSection = ({ section }) => {
  if (!Array.isArray(section?.rows) || !section.rows.length) return null
  const rows = section.rows.filter((row, index, source) => {
    return source.findIndex(item => item.id === row.id) === index
  })

  return (
    <Sheet sx={sx.section(section.id)}>
      <Box sx={sx.sectionHeader(section.id)}>
        <Typography level='title-sm' sx={sx.sectionTitle(section.id)}>{section.title}</Typography>
        {section.subtitle ? <Typography level='body-xs' sx={sx.sectionSubtitle}>{section.subtitle}</Typography> : null}
      </Box>

      <Box sx={sx.rowsGrid(section.id, rows.length)}>
        {rows.map(row => <SectionRow key={row.id} row={row} sectionId={section.id} />)}
      </Box>
    </Sheet>
  )
}

export default function ManagementTargetsPrintView({ team, draft }) {
  const model = useMemo(() => buildManagementTargetsPrintModel({ team, draft }), [team, draft])
  const entity = model.team || {}
  const avatarSrc = resolveTeamAvatarSrc(entity)
  const reportDate = formatReportDate(model.reportDate || model.generatedAt)
  const coachName = model.coachNameResolved || model.coachName || EMPTY

  const reportMetaItems = [
    { id: 'club', label: 'מועדון', value: model.clubName || resolveClubName(entity) },
    { id: 'birthYear', label: 'שנתון', value: model.teamYear || entity.teamYear || EMPTY },
    { id: 'coach', label: 'מאמן', value: coachName },
    { id: 'season', label: 'עונה', value: model.season || EMPTY },
  ]

  return (
    <ReportShell
      title='דוח יעדי קבוצה'
      reportDate={reportDate}
      reportType={REPORT_TYPES.GOALS}
      status={REPORT_STATUS.ACTIVE}
      reportNumber={model.reportNumber}
      printPages={2}
      entity={{
        type: 'team',
        name: model.teamName || entity.teamName || 'קבוצה',
        avatarUrl: avatarSrc,
      }}
      metaItems={reportMetaItems}
      metaColumns={4}
    >
      <TargetSummary target={model.targetPositionBox} />

      <Box sx={sx.metricsStack}>
        <Box sx={sx.metricsGrid}>
          {model.metrics.map(item => <MetricCard key={item.id} label={item.label} value={item.value} helper={item.helper} />)}
        </Box>
      </Box>

      <Box sx={{ height: 30 }} />

      <Box sx={sx.sections}>
        {model.printSections.map(section => <ReportSection key={section.id} section={section} />)}
      </Box>
    </ReportShell>
  )
}
