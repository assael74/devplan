// teamProfile/sharedUi/management/print/ManagementTargetsPrintView.js

import React, { useMemo } from 'react'
import { Avatar, Box, Sheet, Typography } from '@mui/joy'

import {
  resolveEntityAvatar,
} from '../../../../../../ui/core/avatars/fallbackAvatar.js'

import {
  buildManagementTargetsPrintModel,
} from '../../../sharedLogic/management/index.js'

import { printSx as sx } from './print.sx.js'

const getSectionTone = (id) => {
  const map = {
    homeAway: {
      bg: '#E8F1FF',
      border: '#B6CCF5',
      text: '#163A70',
    },
    difficulty: {
      bg: '#FDEFD8',
      border: '#F5D18A',
      text: '#7A4B00',
    },
    scorers: {
      bg: '#EAFBF1',
      border: '#B8E7C8',
      text: '#14532D',
    },
    squadUsage: {
      bg: '#F4EAFE',
      border: '#D6BDF7',
      text: '#5B2C8A',
    },
  }

  return map[id] || {
    bg: '#EEF2F6',
    border: '#D4DCE5',
    text: '#243447',
  }
}

const resolveTeamAvatarSrc = (entity) => {
  return entity?.photo || resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })
}

const MetaItem = ({
  label,
  value,
}) => {
  return (
    <Box sx={sx.metaItem}>
      <Typography level="body-xs" sx={sx.metaLabel}>
        {label}
      </Typography>

      <Typography level="title-sm" sx={sx.metaValue}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

const TeamMetaItem = ({
  entity,
}) => {
  const src = resolveTeamAvatarSrc(entity)

  return (
    <Box sx={sx.teamMetaItem}>
      <Avatar
        src={src}
        alt={entity?.teamName || 'קבוצה'}
        sx={sx.teamMetaAvatar}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-xs" sx={sx.metaLabel}>
          קבוצה
        </Typography>

        <Typography level="title-sm" sx={sx.metaValue}>
          {entity?.teamName || '—'}
        </Typography>
      </Box>
    </Box>
  )
}

const MetricCard = ({
  label,
  value,
  helper,
}) => {
  return (
    <Sheet variant="soft" sx={sx.metricCard}>
      <Typography level="body-xs" sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="title-md" sx={sx.metricValue}>
        {value || '—'}
      </Typography>

      {!!helper && (
        <Typography level="body-xs" sx={sx.metricHelper}>
          {helper}
        </Typography>
      )}
    </Sheet>
  )
}

const TargetPositionCard = ({
  label,
  value,
  helper,
}) => {
  return (
    <Sheet variant="outlined" sx={sx.targetPositionCard}>
      <Typography level="body-sm" sx={sx.targetPositionLabel}>
        {label}
      </Typography>

      <Typography level="h3" sx={sx.targetPositionValue}>
        {value || '—'}
      </Typography>

      {!!helper && (
        <Typography level="body-sm" sx={sx.targetPositionHelper}>
          {helper}
        </Typography>
      )}
    </Sheet>
  )
}

const PrintRow = ({
  row,
}) => {
  return (
    <Box sx={sx.row}>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-sm" sx={sx.rowLabel}>
          {row.label}
        </Typography>

        {!!row.helper && (
          <Typography level="body-xs" sx={sx.rowHelper}>
            {row.helper}
          </Typography>
        )}
      </Box>

      <Typography level="title-sm" sx={sx.rowValue}>
        {row.value || '—'}
      </Typography>
    </Box>
  )
}

const PrintSection = ({
  section,
}) => {
  const tone = getSectionTone(section.id)

  if (!Array.isArray(section?.rows) || !section.rows.length) return null

  return (
    <Sheet variant="outlined" sx={sx.section}>
      <Box sx={sx.sectionHeader(tone)}>
        <Typography level="title-sm" sx={sx.sectionTitle(tone)}>
          {section.title}
        </Typography>

        {!!section.subtitle && (
          <Typography level="body-xs" sx={sx.sectionSubtitle(tone)}>
            {section.subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={sx.rows}>
        {section.rows.map((row) => (
          <PrintRow
            key={row.id}
            row={row}
          />
        ))}
      </Box>
    </Sheet>
  )
}

export default function ManagementTargetsPrintView({
  team,
  draft,
}) {
  const model = useMemo(() => {
    return buildManagementTargetsPrintModel({
      team,
      draft,
    })
  }, [team, draft])

  const avatarSrc = resolveTeamAvatarSrc(model.team)

  return (
    <Box sx={sx.page} dir="rtl">
      <Box sx={sx.header}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="h3" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            יעדי קבוצה
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            דוח יעדים ניהולי לפי יעד טבלה, מדדי ליגה והקשרי משחק
          </Typography>
        </Box>

        <Avatar
          src={avatarSrc}
          alt={model.teamName}
          sx={sx.headerAvatar}
        />
      </Box>

      <Box sx={sx.metaGrid}>
        <TeamMetaItem entity={model.team} />

        <MetaItem
          label="מאמן"
          value={model.coachName}
        />

        <MetaItem
          label="שנתון"
          value={model.season}
        />

        <MetaItem
          label="ליגה"
          value={model.league}
        />
      </Box>

      <TargetPositionCard
        label={model.targetPositionBox?.label}
        value={model.targetPositionBox?.value}
        helper={model.targetPositionBox?.helper}
      />

      <Box sx={sx.metricsGrid}>
        {model.metrics.map((item) => (
          <MetricCard
            key={item.id}
            label={item.label}
            value={item.value}
            helper={item.helper}
          />
        ))}
      </Box>

      <Box sx={sx.sectionsGrid}>
        {model.printSections.map((section) => (
          <PrintSection
            key={section.id}
            section={section}
          />
        ))}
      </Box>
    </Box>
  )
}
