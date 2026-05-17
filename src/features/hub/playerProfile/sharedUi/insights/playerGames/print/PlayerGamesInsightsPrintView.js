// playerProfile/sharedUi/insights/playerGames/print/PlayerGamesInsightsPrintView.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import defaultPlayerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import {
  PrintMetaItem,
  PrintMetricCard,
  PrintSmallFact,
} from './printCards.js'

import {
  PrintSection,
} from './printSections.js'

import {
  getCardKey,
  getPrintValue,
  getSectionKey,
  hasCards,
  hasText,
  getPrintToneTitleSx,
} from './printView.helpers.js'

import { printSx as sx } from './print.sx.js'

function PrintHeader({ model }) {
  const avatarSrc = model?.avatarUrl || defaultPlayerImage

  return (
    <Box sx={sx.headerRow}>
      <Box sx={sx.headerText}>
        <Typography sx={sx.reportType}>
          {getPrintValue(model?.reportType, 'דוח תובנות שחקן')}
        </Typography>

        <Typography sx={sx.title}>
          {getPrintValue(model?.title, 'שחקן')}
        </Typography>

        {hasText(model?.subtitle) && (
          <Typography sx={sx.subtitle}>
            {model.subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={sx.avatarWrap}>
        <Box
          component="img"
          src={avatarSrc}
          alt={getPrintValue(model?.title, 'שחקן')}
          sx={sx.avatar}
        />
      </Box>
    </Box>
  )
}

function PrintMetaGrid({ items = [] }) {
  if (!hasCards(items)) return null

  return (
    <Box className="dpPrintSection" sx={sx.metaGrid}>
      {items.map((item, index) => (
        <PrintMetaItem
          key={getCardKey(item, index)}
          item={item}
        />
      ))}
    </Box>
  )
}

function PrintMainDiagnosis({ main = {} }) {
  const facts = Array.isArray(main?.facts) ? main.facts : []
  const metrics = Array.isArray(main?.metrics) ? main.metrics : []

  return (
    <Box className="dpPrintSection" sx={sx.mainBox}>
      <Box sx={sx.mainContent}>
        <Typography
          sx={{
            ...sx.mainKicker,
            ...getPrintToneTitleSx(main?.color || 'primary'),
          }}
        >
          שורה תחתונה
        </Typography>

        <Typography
          sx={{
            ...sx.mainTitle,
            ...getPrintToneTitleSx(main?.color || 'primary'),
          }}
        >
          {getPrintValue(main?.title, 'שורה תחתונה')}
        </Typography>

        {hasText(main?.text) && (
          <Typography sx={sx.mainText}>
            {main.text}
          </Typography>
        )}

        {hasText(main?.actionText) && (
          <Typography sx={sx.mainAction}>
            {main.actionText}
          </Typography>
        )}
      </Box>

      <Box>
        {hasCards(facts) && (
          <Box sx={sx.factsGrid}>
            {facts.map((item, index) => (
              <PrintSmallFact
                key={getCardKey(item, index)}
                item={item}
              />
            ))}
          </Box>
        )}

        {hasCards(metrics) && (
          <Box sx={sx.mainMetricsGrid}>
            {metrics.map((item, index) => (
              <PrintMetricCard
                key={getCardKey(item, index)}
                item={item}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

function PrintSectionsGrid({ sections = [] }) {
  if (!Array.isArray(sections) || !sections.length) return null

  return (
    <Box sx={sx.sectionsGrid}>
      {sections.map((section, index) => (
        <PrintSection
          key={getSectionKey(section, index)}
          section={section}
        />
      ))}
    </Box>
  )
}

export default function PlayerGamesInsightsPrintView({ model }) {
  const safeModel = model || {}

  return (
    <Box dir="rtl" sx={sx.root}>
      <PrintHeader model={safeModel} />

      <PrintMetaGrid items={safeModel.meta} />

      <Divider sx={sx.divider} />

      <PrintMainDiagnosis main={safeModel.main} />

      <PrintSectionsGrid sections={safeModel.sections} />

      <Box sx={sx.footer}>
        <Typography sx={sx.footerText}>
          הופק בתאריך {getPrintValue(safeModel.producedAtLabel)}
        </Typography>
      </Box>
    </Box>
  )
}
