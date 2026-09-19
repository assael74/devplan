import * as React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import LeagueName from '../../../../components/entities/LeagueName.js'
import { teamYearDevelopmentSharedSx as sx } from '../sx/teamYearDevelopmentShared.sx.js'

export const TeamYearSection = ({ iconId, title, titleExtra, children }) => (
  <Box sx={sx.section}>
    <Box sx={sx.header}>
      <Box sx={sx.titleContainer}>
        <Box sx={sx.titleRow}>
          <Box sx={sx.titleIdentity}>
            <Box sx={sx.titleIcon}>{iconUi({ id: iconId, size: 'sm' })}</Box>
            <Typography sx={sx.title}>{title}</Typography>
          </Box>
          {titleExtra ? <Box sx={sx.titleExtra}>{titleExtra}</Box> : null}
        </Box>
      </Box>
    </Box>
    {children}
  </Box>
)

export const SummaryChip = ({ iconId, label, value }) => (
  <Box sx={sx.evolutionSummaryChip}>
    {iconUi({ id: iconId, size: 'sm' })}
    <Typography>{label}</Typography>
    <Box sx={sx.evolutionSummaryValue}><Typography>{value}</Typography></Box>
  </Box>
)

export const SummaryFacts = ({ children }) => {
  const facts = React.Children.toArray(children).filter(Boolean)
  return (
    <Box sx={sx.evolutionCollapseFacts}>
      {facts.map((fact, index) => (
        <React.Fragment key={fact.key || index}>
          {index > 0 ? <Box component='span' aria-hidden sx={sx.evolutionSummarySeparator}>•</Box> : null}
          {fact}
        </React.Fragment>
      ))}
    </Box>
  )
}

export const SeasonSummaryChip = ({ season = {} }) => {
  const seasonKey = String(season?.seasonKey || '').trim()
  const leagueName = String(season?.leagueName || '').trim()
  const ageGroupLabel = String(season?.ageGroupLabel || '').trim()

  return (
    <Box sx={sx.seasonSummary}>
      <Chip size='sm' variant='soft' color='neutral' sx={sx.seasonSummaryChip}>
        <Box sx={sx.seasonSummaryChipContent}>
          <Typography component='span' sx={sx.seasonSummaryChipText}>{seasonKey}</Typography>
          {leagueName ? <Typography component='span' sx={sx.seasonSummaryChipSeparator}>·</Typography> : null}
          {leagueName ? (
            <LeagueName
              value={leagueName}
              level={season?.leagueLevel}
              showLevel
              fontSize={10}
              levelFontSize={9}
              rootSx={sx.seasonSummaryChipLeague}
              nameSx={sx.seasonSummaryChipText}
              levelSx={sx.seasonSummaryChipLevel}
            />
          ) : null}
        </Box>
      </Chip>
      {ageGroupLabel ? <Typography component='span' sx={sx.seasonSummaryChipAgeGroup}>· {ageGroupLabel}</Typography> : null}
    </Box>
  )
}
