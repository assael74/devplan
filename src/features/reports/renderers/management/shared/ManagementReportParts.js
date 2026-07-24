// src/features/hub/teamProfile/sharedUi/management/print/shared/ManagementReportParts.js

import React from 'react'
import {
  Box,
  Sheet,
  Divider,
  Typography,
} from '@mui/joy'

import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { getPrintSx } from './sx/print.sx.js'

const EMPTY = '—'

const isPdfPresentation = presentation => (
  presentation === 'pdf' ||
  presentation === 'print'
)

export function TargetSummary({ sx, target }) {
  if (!target) {
    return null
  }

  return (
    <Sheet variant='outlined' sx={sx.targetSummary}>
      <Typography level='body-xs' sx={sx.targetEyebrow}>
        {target.label}
      </Typography>

      <Typography level='h3' sx={sx.targetValue}>
        {target.value || EMPTY}
      </Typography>
    </Sheet>
  )
}

export function MetricCard({ sx, label, value, helper }) {
  return (
    <Sheet variant='outlined' sx={sx.metricCard}>
      <Typography level='body-xs' sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level='title-lg' sx={sx.metricValue}>
        {value || EMPTY}
      </Typography>

      {helper ? (
        <Typography level='body-xs' sx={sx.metricHelper}>
          {helper}
        </Typography>
      ) : null}
    </Sheet>
  )
}

function SectionRow({ sx, row, sectionId }) {
  const allowValueWrap = ( sectionId === 'homeAway' || sectionId === 'difficulty' )

  const label = row.baseLabel || row.label
  const helper = row.baseHelper || row.helper

  const icon = iconUi({ id: row.idIcon, sx: sx.rowIconSvg, })

  return (
    <Box sx={sx.row(sectionId, row.id)}>
      {icon ? (
        <Box sx={sx.rowIcon(sectionId)}>
          {icon}
        </Box>
      ) : null}

      <Typography level='body-sm' sx={sx.rowLabel(sectionId, row.id)}>
        {label || EMPTY}
      </Typography>

      <Typography
        level='title-sm'
        sx={sx.rowValue({ allowValueWrap, sectionId, rowId: row.id, })}
      >
        {row.value || EMPTY}
      </Typography>

      {helper ? (
        <Typography level='body-xs' sx={sx.rowHelper}>
          {helper}
        </Typography>
      ) : null}
    </Box>
  )
}

function SectionBody({ sx, section, rows, hideHeader = false }) {
  return (
    <Sheet sx={sx.section(section.id)}>
      {!hideHeader ? (
        <Box sx={sx.sectionHeader(section.id)}>
          <Typography level='title-sm' sx={sx.sectionTitle(section.id)}>
            {section.title || EMPTY}
          </Typography>

          {section.subtitle ? (
            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              {section.subtitle}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      <Box sx={sx.rowsGrid(section.id, rows.length)}>
        {rows.map(row => (
          <SectionRow
            key={row.id}
            sx={sx}
            row={row}
            sectionId={section.id}
          />
        ))}
      </Box>
    </Sheet>
  )
}

export function ReportSection({ sx, section, presentation, isMobile }) {
  const [open, setOpen] = React.useState(false)

  if (!Array.isArray(section.rows) || !section.rows.length) {
    return null
  }

  const isPdf = isPdfPresentation(presentation)
  const isSquadUsageMobile = section.id === 'squadUsage' && isMobile

  const rows = section.rows.filter((row, index, source) => {
    return source.findIndex(item => item.id === row.id) === index
  })

  if (!isSquadUsageMobile) {
    return (
      <SectionBody
        sx={sx}
        section={section}
        rows={rows}
      />
    )
  }

  return (
    <CollapseBox
      open={isPdf || open}
      onToggle={() => {
        if (isPdf) return

        setOpen(prev => !prev)
      }}
      title={section.title || EMPTY}
      subtitle='מדדי ריכוזיות ויציבות מתוך סגל של 24'
    >
      <SectionBody
        sx={sx}
        section={{
          ...section,
          title: '',
          subtitle: '',
        }}
        rows={rows}
        hideHeader
      />
    </CollapseBox>
  )
}

export function ManagementReportContent({ model }) {
  const sx = getPrintSx({
    isMobile: model.isMobile,
    presentation: model.presentation,
  })

  const metrics = Array.isArray(model.metrics) ? model.metrics : []
  const sections = Array.isArray(model.printSections) ? model.printSections : []

  return (
    <Box sx={sx.contentWrap}>
      <TargetSummary
        sx={sx}
        target={model.targetPositionBox}
      />

      {metrics.length ? (
        <Box sx={sx.metricsStack}>
          <Box sx={sx.metricsGrid}>
            {metrics.map(item => (
              <MetricCard
                key={item.id}
                sx={sx}
                label={item.label}
                value={item.value}
                helper={item.helper}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      <Divider sx={{ my: 2 }} />

      <Box sx={sx.sections}>
        {sections.map(section => (
          <ReportSection
            key={section.id}
            sx={sx}
            section={section}
            isMobile={model.isMobile}
            presentation={model.presentation}
          />
        ))}
      </Box>
    </Box>
  )
}
