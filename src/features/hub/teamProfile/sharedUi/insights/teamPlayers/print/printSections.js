// TEAMPROFILE/sharedUi/insights/teamPlayers/print/printSections.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  PlayersTable,
} from './printTable.js'

import { sectionsSx as sx } from './sx/sections.sx.js'

const SummaryCard = ({ item }) => {
  return (
    <Box sx={sx.summaryCard} className="dpPrintCard">
      <Typography sx={sx.summaryLabel}>
        {item.label}
      </Typography>

      <Typography sx={sx.summaryValue}>
        {item.value}
      </Typography>
    </Box>
  )
}

const RoleSummaryCard = ({ item }) => {
  return (
    <Box sx={sx.roleSummaryCard} className="dpPrintCard">
      <Typography sx={sx.roleSummaryLabel}>
        {item.label}
      </Typography>

      <Typography sx={sx.roleSummaryValue}>
        {item.value}
      </Typography>
    </Box>
  )
}

const RecommendationItem = ({ item, index }) => {
  return (
    <Box sx={sx.recommendationItem} className="dpPrintRow">
      <Typography sx={sx.recommendationTitle}>
        {index + 1}. {item.title}
      </Typography>

      <Typography sx={sx.recommendationText}>
        {item.text}
      </Typography>
    </Box>
  )
}

const RoleSection = ({ section }) => {
  return (
    <Box sx={sx.roleSection} className="dpPrintSection">
      <Box sx={sx.roleHeader}>
        <Box sx={sx.roleHeaderText}>
          <Typography sx={sx.roleTitle}>
            {section.title}
          </Typography>

          <Typography sx={sx.roleSub}>
            {section.sub}
          </Typography>
        </Box>

        <Typography sx={sx.roleBadge}>
          {section.playersCount} שחקנים
        </Typography>
      </Box>

      <Box sx={sx.roleSummaryGrid}>
        {section.summary.map(item => {
          return (
            <RoleSummaryCard
              key={item.id}
              item={item}
            />
          )
        })}
      </Box>

      <PlayersTable rows={section.rows} />
    </Box>
  )
}

export const PrintSummary = ({ items = [] }) => {
  return (
    <Box sx={sx.summaryGrid} className="dpPrintSection">
      {items.map(item => {
        return (
          <SummaryCard
            key={item.id}
            item={item}
          />
        )
      })}
    </Box>
  )
}

export const PrintRoleSections = ({ sections = [] }) => {
  return (
    <Box sx={sx.sectionsWrap}>
      {sections.map(section => {
        return (
          <RoleSection
            key={section.id}
            section={section}
          />
        )
      })}
    </Box>
  )
}

export const PrintRecommendations = ({ items = [] }) => {
  if (!items.length) return null

  return (
    <Box sx={sx.recommendationsSection} className="dpPrintSection">
      <Typography sx={sx.sectionTitle}>
        המלצות למאמן
      </Typography>

      <Box sx={sx.recommendationsGrid}>
        {items.map((item, index) => {
          return (
            <RecommendationItem
              key={item.id || index}
              item={item}
              index={index}
            />
          )
        })}
      </Box>
    </Box>
  )
}
