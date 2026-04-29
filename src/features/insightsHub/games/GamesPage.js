// features/insightsHub/games/GamesPage.js

import React from 'react'
import { Box, Button, Card, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

import { pageSx as sx } from './sx/page.sx'

import CatalogPanel from '../shared/components/catalogs/CatalogPanel.js'
import InsightsPanel from '../shared/components/insights/InsightsPanel.js'

import {
  TEAM_GAMES_FACTS_CATALOG,
  TEAM_GAMES_METRICS_CATALOG,
  TEAM_GAMES_BENCHMARKS_CATALOG,
  TEAM_GAMES_VIEW_CONTEXTS,
  TEAM_GAMES_INSIGHTS_CATALOG,
  PLAYER_GAMES_FACTS_CATALOG,
  PLAYER_GAMES_METRICS_CATALOG,
  PLAYER_GAMES_VIEW_CONTEXTS,
} from './catalogs'

const localSx = {
  fourColumnsGrid: {
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  entityShell: (id) => ({
    ...sx.shell(id),
    minHeight: 0,
  }),
}

function ColumnShell({ id, children }) {
  return (
    <Card variant="outlined" sx={localSx.entityShell(id)}>
      {children}
    </Card>
  )
}

export default function GamesPage({ onBack }) {
  return (
    <Box sx={sx.gameRoot}>
      <Box sx={sx.gameWrap}>
        <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
          <Typography level="title-lg" sx={{ fontWeight: 700 }}>
            קטלוג משחקים
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            הפרדה לפי ישות, הקשר זמן, קבוצה מקצועית, עובדות, מדדים ותובנות.
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={onBack}
          startDecorator={iconUi({ id: 'arrowRight', size: 'sm' })}
          sx={{ flexShrink: 0 }}
        >
          חזרה
        </Button>
      </Box>

      <Box sx={localSx.fourColumnsGrid}>
        <ColumnShell id="teams">
          <CatalogPanel
            title="קבוצה — קטלוג"
            subtitle="עובדות, מדדים ובנצ׳מרק ברמת קבוצה"
            iconId="teams"
            factsCatalog={TEAM_GAMES_FACTS_CATALOG}
            metricsCatalog={TEAM_GAMES_METRICS_CATALOG}
            benchmarksCatalog={TEAM_GAMES_BENCHMARKS_CATALOG}
            contexts={TEAM_GAMES_VIEW_CONTEXTS}
           />
        </ColumnShell>

        <ColumnShell id="teams">
        <InsightsPanel
          title="קבוצה — תובנות"
          subtitle="ניהול תובנות אפשריות מתוך מדדי הקבוצה"
          iconId="insights"
          contexts={TEAM_GAMES_VIEW_CONTEXTS}
          insightsCatalog={TEAM_GAMES_INSIGHTS_CATALOG}
          metricsCatalog={TEAM_GAMES_METRICS_CATALOG}
          insightsTitle="תובנות קבוצה"
          insightsSubtitle="כאן יוצגו תובנות שנגזרות מעובדות ומדדים של משחקי קבוצה."
         />
        </ColumnShell>

        <ColumnShell id="players">
          <CatalogPanel
            title="שחקן — קטלוג"
            subtitle="עובדות ומדדים ברמת שחקן"
            iconId="players"
            factsCatalog={PLAYER_GAMES_FACTS_CATALOG}
            metricsCatalog={PLAYER_GAMES_METRICS_CATALOG}
            contexts={PLAYER_GAMES_VIEW_CONTEXTS}
          />
        </ColumnShell>

        <ColumnShell id="players">
          <InsightsPanel
            title="שחקן — תובנות"
            subtitle="בהמשך: תובנות מקצועיות מתוך מדדי השחקן"
            iconId="insights"
            insightsTitle="תובנות שחקן"
            insightsSubtitle="כאן יוצגו בהמשך תובנות שנגזרות מעובדות ומדדים של משחקי שחקן."
          />
        </ColumnShell>
      </Box>
    </Box>
  )
}
