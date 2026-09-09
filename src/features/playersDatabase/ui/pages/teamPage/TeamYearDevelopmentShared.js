import * as React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamYearDevelopmentSharedSx as sx } from './sx/teamYearDevelopmentShared.sx.js'

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
