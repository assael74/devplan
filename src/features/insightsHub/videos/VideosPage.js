// features/insightsHub/videos/VideosPage.js

import React from 'react'
import { Box, Button, Card, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

import { pageSx as sx } from './sx/page.sx'

import CatalogPanel from '../shared/components/catalogs/CatalogPanel.js'
import InsightsPanel from '../shared/components/insights/InsightsPanel.js'

import {
  TEAM_VIDEOS_FACTS_CATALOG,
  TEAM_VIDEOS_METRICS_CATALOG,
  TEAM_VIDEOS_VIEW_CONTEXTS,
  PLAYER_VIDEOS_FACTS_CATALOG,
  PLAYER_VIDEOS_METRICS_CATALOG,
  PLAYER_VIDEOS_VIEW_CONTEXTS,
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

export default function VideosPage({ onBack }) {
  return (
    <Box sx={sx.gameRoot}>
      <Box sx={sx.gameWrap}>
        <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
          <Typography level="title-lg" sx={{ fontWeight: 700 }}>
            קטלוג וידאו
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            הפרדה בין וידאו קבוצתי לווידאו אישי, כולל עובדות, מדדים ותובנות עתידיות.
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
            title="קבוצה — קטלוג וידאו"
            subtitle="עובדות ומדדים של ניתוח וידאו קבוצתי"
            iconId="teams"
            factsCatalog={TEAM_VIDEOS_FACTS_CATALOG}
            metricsCatalog={TEAM_VIDEOS_METRICS_CATALOG}
            contexts={TEAM_VIDEOS_VIEW_CONTEXTS}
          />
        </ColumnShell>

        <ColumnShell id="teams">
          <InsightsPanel
            title="קבוצה — תובנות וידאו"
            subtitle="בהמשך: תובנות מתוך מדדי הווידאו הקבוצתי"
            iconId="insights"
            contexts={TEAM_VIDEOS_VIEW_CONTEXTS}
            insightsTitle="תובנות וידאו קבוצתי"
            insightsSubtitle="כאן יוצגו בהמשך תובנות שנגזרות מעובדות ומדדים של ניתוחי וידאו קבוצתיים."
          />
        </ColumnShell>

        <ColumnShell id="players">
          <CatalogPanel
            title="שחקן — קטלוג וידאו"
            subtitle="עובדות ומדדים של ניתוח וידאו אישי"
            iconId="players"
            factsCatalog={PLAYER_VIDEOS_FACTS_CATALOG}
            metricsCatalog={PLAYER_VIDEOS_METRICS_CATALOG}
            contexts={PLAYER_VIDEOS_VIEW_CONTEXTS}
          />
        </ColumnShell>

        <ColumnShell id="players">
          <InsightsPanel
            title="שחקן — תובנות וידאו"
            subtitle="בהמשך: תובנות מתוך מדדי הווידאו האישי"
            iconId="insights"
            contexts={PLAYER_VIDEOS_VIEW_CONTEXTS}
            insightsTitle="תובנות וידאו אישי"
            insightsSubtitle="כאן יוצגו בהמשך תובנות שנגזרות מעובדות ומדדים של ניתוחי וידאו אישיים."
          />
        </ColumnShell>
      </Box>
    </Box>
  )
}
