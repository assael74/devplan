// src/features/hub/playerProfile/sharedUi/info/print/PlayerTargetsPrintView.js

import React, { useMemo } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import {
  ReportShell,
  REPORT_STATUS,
  REPORT_TYPES,
} from '../../../../../../ui/patterns/reports/index.js'

import { buildPlayerTargetsPrintModel } from '../../../sharedLogic/info/print/playerTargetsPrintModel.js'

import { printSx as sx } from './print.sx.js'

const EMPTY = '—'

const formatReportDate = value => {
  const date = value instanceof Date ? value : new Date(value || Date.now())

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const resolvePlayerAvatarSrc = player => {
  return player?.photo || playerImage
}

const SectionHeader = ({ title, subtitle }) => {
  return (
    <Box sx={sx.sectionHeader}>
      <Typography level='title-sm' sx={sx.sectionTitle}>{title}</Typography>

      {subtitle ? (
        <Typography level='body-xs' sx={sx.sectionSubtitle}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  )
}

const BasisItem = ({ label, value, icon }) => {
  return (
    <Sheet variant='outlined' sx={sx.basisItem}>
      <Box sx={sx.basisIcon}>{iconUi({ id: icon })}</Box>
      <Typography level='body-xs' sx={sx.itemLabel}>{label}</Typography>
      <Typography level='title-sm' sx={sx.basisValue}>{value || EMPTY}</Typography>
    </Sheet>
  )
}

const MetricDetail = ({ label, value }) => {
  if (!value || value === EMPTY || String(value).startsWith(EMPTY)) return null

  return (
    <Typography level='body-xs' sx={sx.metricDetail}>
      {label}: {value}
    </Typography>
  )
}

const TargetCard = ({ card }) => {
  return (
    <Sheet variant='outlined' className='dpPrintCard' sx={sx.targetCard}>
      <Box sx={sx.cardHeader}>
        <Box sx={sx.cardIcon}>{iconUi({ id: card.icon || 'targets' })}</Box>
        <Typography level='body-sm' sx={sx.cardLabel}>{card.label}</Typography>
      </Box>

      <Typography level='h3' sx={sx.cardValue}>
        {card.value || EMPTY}
      </Typography>

      {card.originalValue ? (
        <Typography level='body-xs' sx={sx.originalTarget}>
          יעד מקצועי מקורי: {card.originalValue}
        </Typography>
      ) : null}

      {card.helper ? (
        <Typography level='body-xs' sx={sx.metricDetail}>
          {card.helper}
        </Typography>
      ) : null}

      <MetricDetail label='טווח מקצועי' value={card.range} />
      <MetricDetail label='יעד עונתי' value={card.absoluteTarget} />
      <MetricDetail label='טווח עונתי' value={card.absoluteRange} />
    </Sheet>
  )
}

const EmptyReport = () => {
  return (
    <Sheet variant='outlined' sx={sx.empty}>
      <Typography level='title-md'>
        אין מספיק נתונים להפקת דוח יעדי שחקן
      </Typography>

      <Typography level='body-sm'>
        נדרשים מעמד בסגל, עמדה ראשית ויעד קבוצה פעיל.
      </Typography>
    </Sheet>
  )
}

export default function PlayerTargetsPrintView({ player, team, reportDate }) {
  const model = useMemo(() => {
    return buildPlayerTargetsPrintModel({ player, team, reportDate })
  }, [player, team, reportDate])

  const avatarSrc = resolvePlayerAvatarSrc(model.player)
  const formattedDate = formatReportDate(model.reportDate)
  const reportMetaItems = [
    { id: 'club', label: 'מועדון', value: model.clubName || EMPTY },
    { id: 'team', label: 'קבוצה', value: model.teamDisplayName || model.teamName || EMPTY },
    { id: 'coach', label: 'מאמן', value: model.coachName || EMPTY },
    { id: 'season', label: 'עונה', value: model.season || EMPTY },
  ]

  return (
    <ReportShell
      title='דוח יעדי שחקן'
      reportDate={formattedDate}
      reportType={REPORT_TYPES.GOALS}
      status={REPORT_STATUS.ACTIVE}
      printPages={1}
      entity={{
        type: 'player',
        name: model.playerName,
        avatarUrl: avatarSrc,
      }}
      metaItems={reportMetaItems}
      metaColumns={4}
    >
      {!model.hasTargets ? (
        <EmptyReport />
      ) : (
        <>
          <Sheet variant='outlined' className='dpPrintSection' sx={sx.section}>
            <SectionHeader
              title='בסיס היעד'
              subtitle='הנתונים המקצועיים שעל פיהם נגזר יעד השחקן'
            />

            <Box sx={sx.sectionBody}>
              <Box sx={sx.basisGrid}>
                <BasisItem label='מעמד בסגל' value={model.squadRoleLabel} icon='keyPlayer' />
                <BasisItem label='עמדה ראשית' value={model.primaryPosition} icon='position' />
                <BasisItem label='חוליה' value={model.positionGroupLabel} icon='layers' />
                <BasisItem label='יעד קבוצה' value={model.teamProfileLabel} icon='targets' />
              </Box>
            </Box>
          </Sheet>

          <Sheet variant='outlined' className='dpPrintSection' sx={sx.summary}>
            <Box sx={sx.summaryHeader}>
              <Typography level='title-sm' sx={sx.summaryLabel}>
                {model.profileSummary.title}
              </Typography>
            </Box>

            <Box sx={sx.summaryBody}>
              <Typography level='h3' sx={sx.summaryValue}>
                {model.profileSummary.value}
              </Typography>

              <Box sx={sx.confidence}>
                <Typography level='body-xs' sx={sx.confidenceLabel}>
                  ביטחון בביצוע
                </Typography>

                <Typography level='title-lg' sx={sx.confidenceValue}>
                  {model.confidence.label} · {model.confidence.multiplierLabel}
                </Typography>
              </Box>
            </Box>
          </Sheet>

          <Sheet variant='outlined' className='dpPrintSection' sx={sx.section}>
            <SectionHeader
              title={model.primarySection.title}
              subtitle={model.primarySection.subtitle}
            />

            <Box sx={sx.sectionBody}>
              <Box sx={sx.primaryGrid}>
                {model.primarySection.cards.map(card => (
                  <TargetCard key={card.id} card={card} />
                ))}
              </Box>
            </Box>
          </Sheet>

          <Sheet variant='outlined' className='dpPrintSection' sx={sx.section}>
            <SectionHeader
              title={model.usageSection.title}
              subtitle={model.usageSection.subtitle}
            />

            <Box sx={sx.sectionBody}>
              <Box sx={sx.usageGrid}>
                {model.usageSection.cards.map(card => (
                  <TargetCard key={card.id} card={card} />
                ))}
              </Box>
            </Box>
          </Sheet>
        </>
      )}
    </ReportShell>
  )
}
