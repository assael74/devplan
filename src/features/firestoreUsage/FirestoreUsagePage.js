// src/features/firestoreUsage/FirestoreUsagePage.js

import React from 'react'
import { Box } from '@mui/joy'

import useFirestoreUsageSnapshot from './hooks/useFirestoreUsageSnapshot.js'
import useOfficialFirestoreUsage from './hooks/useOfficialFirestoreUsage.js'
import { buildFirestoreUsageViewModel } from './sharedLogic/firestoreUsageViewModel.js'

import UsageHeader from './components/UsageHeader.js'
import UsageBarsCard from './components/UsageBarsCard.js'
import UsageExpensiveActions from './components/UsageExpensiveActions.js'
import UsageAlerts from './components/UsageAlerts.js'
import UsageDrilldownDrawer from './components/UsageDrilldownDrawer.js'
import UsageOfficialStatus from './components/UsageOfficialStatus.js'
import UsageFilters from './components/UsageFilters.js'
import UsageProcessesTable from './components/UsageProcessesTable.js'
import UsageListenersTable from './components/UsageListenersTable.js'
import UsagePayloadSummary from './components/UsagePayloadSummary.js'

import {
  firestoreUsageAsideColumnSx,
  firestoreUsageContentSx,
  firestoreUsageHeaderSx,
  firestoreUsageMainColumnSx,
  firestoreUsagePageSx,
  firestoreUsagePrimaryLayoutSx,
  firestoreUsageScrollSx,
} from './sx/firestoreUsage.sx.js'

export default function FirestoreUsagePage() {
  const [barLimit, setBarLimit] = React.useState(5)
  const [selectedFeature, setSelectedFeature] = React.useState('all')
  const [drilldown, setDrilldown] = React.useState(null)

  const officialUsage = useOfficialFirestoreUsage()

  const {
    snapshot,
    lastRefreshedAt,
    refresh,
    reset,
    exportJson,
  } = useFirestoreUsageSnapshot({
    autoRefresh: true,
    refreshInterval: 3000,
  })

  const viewModel = React.useMemo(
    () => buildFirestoreUsageViewModel(snapshot, {
      feature: selectedFeature,
    }),
    [snapshot, selectedFeature]
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
          hasActivity={viewModel.hasActivity}
          onRefresh={refresh}
          onReset={reset}
          onExport={exportJson}
        />
      </Box>

      <Box className="dpScrollThin" sx={firestoreUsageScrollSx}>
        <Box sx={firestoreUsageContentSx}>
          <UsageOfficialStatus
            source={viewModel.officialSources}
            official={officialUsage}
            onRefresh={officialUsage.refresh}
          />

          <UsageFilters
            features={viewModel.filterOptions.features}
            selectedFeature={selectedFeature}
            onFeatureChange={setSelectedFeature}
          />

          <UsageProcessesTable
            rows={viewModel.processes}
            onRowClick={row => openDrilldown('action', {
              name: row.action,
            })}
          />

          <Box sx={firestoreUsagePrimaryLayoutSx}>
            <Box sx={firestoreUsageMainColumnSx}>
              <UsageAlerts viewModel={viewModel} />

              {viewModel.expensiveActions.length > 0 ? (
                <UsageExpensiveActions rows={viewModel.expensiveActions} />
              ) : null}

              <UsageBarsCard
                title="שימוש לפי Collection"
                note="חלק מכלל ה-Reads שנמדדו בסשן"
                rows={viewModel.collections}
                metric="reads"
                limit={barLimit}
                onLimitChange={setBarLimit}
                onRowClick={row => openDrilldown('collection', row)}
              />
            </Box>

            <Box sx={firestoreUsageAsideColumnSx}>
              <UsageListenersTable rows={viewModel.activeListeners} />
              <UsagePayloadSummary payload={viewModel.payloadSummary} />
            </Box>
          </Box>
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
