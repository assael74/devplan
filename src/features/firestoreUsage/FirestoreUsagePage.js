// src/features/firestoreUsage/FirestoreUsagePage.js

import React from 'react'
import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import useFirestoreUsageSnapshot from './hooks/useFirestoreUsageSnapshot.js'
import { buildFirestoreUsageViewModel } from './sharedLogic/firestoreUsageViewModel.js'

import UsageHeader from './components/UsageHeader.js'
import UsageFilters from './components/UsageFilters.js'
import UsageKpis from './components/UsageKpis.js'
import UsageBillingLimits from './components/UsageBillingLimits.js'
import UsageBarsCard from './components/UsageBarsCard.js'
import UsageExpensiveActions from './components/UsageExpensiveActions.js'
import UsageAlerts from './components/UsageAlerts.js'
import UsageSessionSummary from './components/UsageSessionSummary.js'
import UsageDrilldownDrawer from './components/UsageDrilldownDrawer.js'
import UsageRecentActivity from './components/UsageRecentActivity.js'

import {
  firestoreUsageAsideColumnSx,
  firestoreUsageContentSx,
  firestoreUsageHeaderSx,
  firestoreUsageMainColumnSx,
  firestoreUsagePageSx,
  firestoreUsagePrimaryLayoutSx,
  firestoreUsageScrollSx,
  firestoreUsageSplitLayoutSx,
} from './sx/firestoreUsage.sx.js'

export default function FirestoreUsagePage() {
  const [selectedFeature, setSelectedFeature] = React.useState('all')
  const [barLimit, setBarLimit] = React.useState(5)
  const [drilldown, setDrilldown] = React.useState(null)

  const {
    snapshot,
    lastRefreshedAt,
    refresh,
    reset,
    exportJson,
  } = useFirestoreUsageSnapshot({
    autoRefresh: true,
    refreshInterval: 1000,
  })

  const viewModel = React.useMemo(
    () => buildFirestoreUsageViewModel(snapshot, {
      feature: selectedFeature,
    }),
    [selectedFeature, snapshot]
  )

  const openDrilldown = React.useCallback((type, row = {}) => {
    setDrilldown({
      type,
      name: row.name || row.key || row.action || row.collection,
      label: row.name || row.key || row.action || row.collection,
    })
  }, [])

  return (
    <Box component="main" sx={firestoreUsagePageSx}>
      <Box sx={firestoreUsageHeaderSx}>
        <UsageHeader
          startedAt={viewModel.startedAt}
          updatedAt={viewModel.updatedAt}
          lastRefreshedAt={lastRefreshedAt}
          hasActivity={viewModel.hasActivity}
          onRefresh={refresh}
          onReset={reset}
          onExport={exportJson}
        />
      </Box>

      <Box className="dpScrollThin" sx={firestoreUsageScrollSx}>
        <Box sx={firestoreUsageContentSx}>
          <UsageFilters
            features={viewModel.filterOptions.features}
            selectedFeature={viewModel.selectedFeature}
            onFeatureChange={setSelectedFeature}
          />

          <UsageKpis items={viewModel.kpis} />

          <Box sx={firestoreUsagePrimaryLayoutSx}>
            <Box sx={firestoreUsageMainColumnSx}>
              <UsageAlerts viewModel={viewModel} />

              <UsageBarsCard
                title="שימוש לפי Collection"
                note="Reads בסשן"
                rows={viewModel.collections}
                metric="reads"
                limit={barLimit}
                onLimitChange={setBarLimit}
                onRowClick={row => openDrilldown('collection', row)}
              />
            </Box>

            <Box sx={firestoreUsageAsideColumnSx}>
              <UsageBillingLimits limits={viewModel.billingLimits} />

              <UsageRecentActivity
                entries={viewModel.recentEntries}
                onEntryClick={entry =>
                  openDrilldown('action', {
                    name: entry.action,
                  })
                }
              />

              <UsageSessionSummary
                summary={viewModel.summary}
                totals={viewModel.totals}
              />
            </Box>
          </Box>

          <Box sx={firestoreUsageSplitLayoutSx}>
            <UsageBarsCard
              title="שימוש לפי Feature"
              note="נפח כולל משוער"
              rows={viewModel.features}
              metric="totalEstimatedKb"
              limit={barLimit}
              onLimitChange={setBarLimit}
              onRowClick={row => openDrilldown('feature', row)}
            />

            <UsageBarsCard
              title="שימוש לפי Action"
              note="כמות פעולות"
              rows={viewModel.actions}
              metric="totalOperations"
              limit={barLimit}
              onLimitChange={setBarLimit}
              onRowClick={row => openDrilldown('action', row)}
            />
          </Box>

          <Box sx={firestoreUsageSplitLayoutSx}>
            <UsageBarsCard
              title="Read Payload לפי Collection"
              note="Estimated KB"
              rows={viewModel.collections}
              metric="estimatedReadKb"
              limit={barLimit}
              onLimitChange={setBarLimit}
              onRowClick={row => openDrilldown('collection', row)}
            />

            <UsageBarsCard
              title="Write Payload לפי Collection"
              note="Estimated KB"
              rows={viewModel.collections}
              metric="estimatedWriteKb"
              limit={barLimit}
              onLimitChange={setBarLimit}
              onRowClick={row => openDrilldown('collection', row)}
            />
          </Box>

          <UsageExpensiveActions rows={viewModel.expensiveActions} />

          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 'lg',
              borderStyle: 'dashed',
              boxShadow: 'none',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr auto',
              },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Typography level="title-md">
                מטרת המסך
              </Typography>

              <Typography
                level="body-sm"
                textColor="text.tertiary"
                sx={{ mt: 0.5 }}
              >
                להפוך את נתוני Firestore להחלטות מוצר: לזהות מה יקר,
                למה הוא יקר, ואיזה תהליך צריך לעבור אופטימיזציה.
              </Typography>
            </Box>

            <Typography
              level="body-xs"
              textColor="text.tertiary"
            >
              Session memory only
            </Typography>
          </Card>
        </Box>
      </Box>

      <UsageDrilldownDrawer
        open={Boolean(drilldown)}
        selection={drilldown}
        entries={viewModel.recentEntries}
        onClose={() => setDrilldown(null)}
      />
    </Box>
  )
}
