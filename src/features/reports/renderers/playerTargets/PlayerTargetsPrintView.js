// src/features/hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js

import React, {
  useMemo,
} from 'react'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  Box,
  Sheet,
  Typography,
} from '@mui/joy'

import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../ui/patterns/reports/index.js'

import {
  buildPlayerTargetsPrintViewModel,
} from '../../model/players/info/print/playerTargetsPrintModel.js'

import {
  getPrintSx,
} from './sx/print.sx.js'

const EMPTY = '—'

function formatReportDate(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now())

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function resolvePlayerAvatarSrc(player = {}) {
  return player.photo || playerImage
}

function SectionHeader({ sx, title, subtitle }) {
  return (
    <Box sx={sx.sectionHeader}>
      <Typography
        level='title-sm'
        sx={sx.sectionTitle}
      >
        {title}
      </Typography>

      {subtitle ? (
        <Typography
          level='body-xs'
          sx={sx.sectionSubtitle}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  )
}

function BasisItem({ sx, label, value, icon, }) {
  return (
    <Sheet
      variant='outlined'
      sx={sx.basisItem}
    >
      <Box sx={sx.basisIcon}>
        {iconUi({ id: icon })}
      </Box>

      <Typography
        level='body-xs'
        sx={sx.itemLabel}
      >
        {label}
      </Typography>

      <Typography
        level='title-sm'
        sx={sx.basisValue}
      >
        {value || EMPTY}
      </Typography>
    </Sheet>
  )
}

function MetricDetail({ sx, label, value }) {
  if ( !value || value === EMPTY || String(value).startsWith(EMPTY) ) {
    return null
  }

  return (
    <Typography
      level='body-xs'
      sx={sx.metricDetail}
    >
      {label}: {value}
    </Typography>
  )
}

function TargetCard({ sx, card }) {
  return (
    <Sheet
      variant='outlined'
      className='dpPrintCard'
      sx={sx.targetCard}
    >
      <Box sx={sx.cardHeader}>
        <Box sx={sx.cardIcon}>
          {iconUi({ id: card.icon || 'targets', })}
        </Box>

        <Typography
          level='body-sm'
          sx={sx.cardLabel}
        >
          {card.label}
        </Typography>
      </Box>

      <Typography
        level='h3'
        sx={sx.cardValue}
      >
        {card.value || EMPTY}
      </Typography>

      {card.originalValue ? (
        <Typography
          level='body-xs'
          sx={sx.originalTarget}
        >
          יעד מקצועי מקורי: {card.originalValue}
        </Typography>
      ) : null}

      {card.helper ? (
        <Typography
          level='body-xs'
          sx={sx.metricDetail}
        >
          {card.helper}
        </Typography>
      ) : null}

      <MetricDetail
        sx={sx}
        label='טווח מקצועי'
        value={card.range}
      />

      <MetricDetail
        sx={sx}
        label='יעד עונתי'
        value={card.absoluteTarget}
      />

      <MetricDetail
        sx={sx}
        label='טווח עונתי'
        value={card.absoluteRange}
      />
    </Sheet>
  )
}

function EmptyReport({ sx }) {
  return (
    <Sheet
      variant='outlined'
      sx={sx.empty}
    >
      <Typography level='title-md'>
        אין מספיק נתונים להפקת דוח יעדי שחקן
      </Typography>

      <Typography level='body-sm'>
        נדרשים מעמד בסגל, עמדה ראשית ויעד קבוצה פעיל.
      </Typography>
    </Sheet>
  )
}

function PlayerTargetsContent({ sx, model, }) {
  if (!model.hasTargets) {
    return (
      <EmptyReport sx={sx} />
    )
  }

  return (
    <Box sx={sx.contentWrap}>
      <Sheet
        variant='outlined'
        className='dpPrintSection'
        sx={sx.section}
      >
        <SectionHeader
          sx={sx}
          title='בסיס היעד'
          subtitle='הנתונים המקצועיים שעל פיהם נגזר יעד השחקן'
        />

        <Box sx={sx.sectionBody}>
          <Box sx={sx.basisGrid}>
            <BasisItem
              sx={sx}
              label='מעמד בסגל'
              value={model.squadRoleLabel}
              icon='keyPlayer'
            />

            <BasisItem
              sx={sx}
              label='עמדה ראשית'
              value={model.primaryPosition}
              icon='position'
            />

            <BasisItem
              sx={sx}
              label='חוליה'
              value={model.positionGroupLabel}
              icon='layers'
            />

            <BasisItem
              sx={sx}
              label='יעד קבוצה'
              value={model.teamProfileLabel}
              icon='targets'
            />
          </Box>
        </Box>
      </Sheet>

      <Sheet
        variant='outlined'
        className='dpPrintSection'
        sx={sx.summary}
      >
        <Box sx={sx.summaryHeader}>
          <Typography
            level='title-sm'
            sx={sx.summaryLabel}
          >
            {model.profileSummary.title}
          </Typography>
        </Box>

        <Box sx={sx.summaryBody}>
          <Typography
            level='h3'
            sx={sx.summaryValue}
          >
            {model.profileSummary.value}
          </Typography>

          <Box sx={sx.confidence}>
            <Typography
              level='body-xs'
              sx={sx.confidenceLabel}
            >
              ביטחון בביצוע
            </Typography>

            <Typography
              level='title-lg'
              sx={sx.confidenceValue}
            >
              {model.confidence.label} · {model.confidence.multiplierLabel}
            </Typography>
          </Box>
        </Box>
      </Sheet>

      <Sheet
        variant='outlined'
        className='dpPrintSection'
        sx={sx.section}
      >
        <SectionHeader
          sx={sx}
          title={model.primarySection.title}
          subtitle={model.primarySection.subtitle}
        />

        <Box sx={sx.sectionBody}>
          <Box sx={sx.primaryGrid}>
            {model.primarySection.cards.map(card => (
              <TargetCard
                key={card.id}
                sx={sx}
                card={card}
              />
            ))}
          </Box>
        </Box>
      </Sheet>

      <Sheet
        variant='outlined'
        className='dpPrintSection'
        sx={sx.section}
      >
        <SectionHeader
          sx={sx}
          title={model.usageSection.title}
          subtitle={model.usageSection.subtitle}
        />

        <Box sx={sx.sectionBody}>
          <Box sx={sx.usageGrid}>
            {model.usageSection.cards.map(card => (
              <TargetCard
                key={card.id}
                sx={sx}
                card={card}
              />
            ))}
          </Box>
        </Box>
      </Sheet>
    </Box>
  )
}

export default function PlayerTargetsPrintView({
  inputModel = null,
  player,
  team,
  reportDate,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
  presentation = 'pdf',
  isMobile = null,
  actions = null,
}) {
  const theme = useTheme()
  const detectedIsMobile = useMediaQuery( theme.breakpoints.down('md') )

  const resolvedIsMobile = typeof isMobile === 'boolean' ? isMobile : detectedIsMobile

  const model = useMemo(() => {
    return buildPlayerTargetsPrintViewModel({
      inputModel,
      player,
      team,
      reportDate,
      presentation,
      isMobile: resolvedIsMobile,
    })
  }, [
    inputModel,
    player,
    team,
    reportDate,
    presentation,
    resolvedIsMobile,
  ])

  const sx = getPrintSx({ isMobile: resolvedIsMobile, presentation, })

  const avatarSrc = resolvePlayerAvatarSrc(model.player)
  const formattedDate = formatReportDate(model.reportDate)

  const reportMetaItems = [
    {
      id: 'club',
      label: 'מועדון',
      value: model.clubName || EMPTY,
    },
    {
      id: 'team',
      label: 'קבוצה',
      value: model.teamDisplayName || model.teamName || EMPTY,
    },
    {
      id: 'coach',
      label: 'מאמן',
      value: model.coachName || EMPTY,
    },
    {
      id: 'season',
      label: 'עונה',
      value: model.season || EMPTY,
    },
  ]

  return (
    <ReportShell
      title='דוח יעדי שחקן'
      reportDate={formattedDate}
      reportType={REPORT_TYPES.GOALS}
      presentation={presentation}
      isMobile={resolvedIsMobile}
      fillPrintPage
      status={REPORT_STATUS.ACTIVE}
      printPages={1}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
      actions={actions}
      entity={{
        type: 'player',
        name: model.playerName,
        avatarUrl: avatarSrc,
      }}
      metaItems={reportMetaItems}
      metaColumns={4}
    >
      <PlayerTargetsContent
        sx={sx}
        model={model}
      />
    </ReportShell>
  )
}
