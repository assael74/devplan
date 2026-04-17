// src/features/players/payments/PlayerPaymentsModule.js

import React, { useMemo, useState, useCallback } from 'react'
import { Box, Tabs, TabList, Tab, TabPanel, Typography } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'
import PermissionGate from './PermissionGate'

import PaymentsSummary from './PaymentsSummary'
import PaymentsTable from './PaymentsTable'
import PaymentsFiltersBar from './PaymentsFiltersBar'
import ParentsTab from './ParentsTab'

import {
  normalizePlayerPayments,
  buildPaymentsSummary,
  applyPaymentsFilters,
  buildPaymentsFilterOptions,
} from './playerPayments.logic'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const toStr = (v) => (v == null ? '' : String(v))
const buildPlayerName = (p) => {
  const full = `${toStr(p?.playerFirstName).trim()} ${toStr(p?.playerLastName).trim()}`.trim()
  return full || toStr(p?.playerShortName).trim() || 'שחקן'
}

export default function PlayerPaymentsModule({ entity, context }) {
  const [tab, setTab] = useState(0)
  const player = entity

  // --- פילטרים למסך תשלומים / הכנסה ---
  const [filters, setFilters] = useState({ dueMonth: '', statusId: 'all', typeId: 'all', payerParentId: 'all' })

  // --- נורמליזציה ---
  const itemsAll = useMemo(() => normalizePlayerPayments(player), [player])
  const filterOptions = useMemo(() => buildPaymentsFilterOptions(player, itemsAll), [player, itemsAll])

  const itemsFiltered = useMemo(() => applyPaymentsFilters(itemsAll, filters), [itemsAll, filters])
  const summary = useMemo(() => buildPaymentsSummary(itemsFiltered), [itemsFiltered])

  // --- Firestore Update Action ---
  const entityName = useMemo(() => buildPlayerName(player), [player])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'players', // router group
    snackEntityType: 'player',   // snackbar labels
    id: player?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const handleSaveParents = useCallback(
    async (parentsNext) => {
      const nextArr = Array.isArray(parentsNext) ? parentsNext : []
      await runUpdate({ parents: nextArr }, { section: 'parents' })
    },
    [runUpdate]
  )

  return (
    <SectionPanel title="תשלומים" subtitle="מעקב + הכנסות חודשיות">
      {!player ? (
        <EmptyState title="אין שחקן" desc="לא התקבל אובייקט שחקן." />
      ) : (
        <Box sx={{ width: '100%' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="plain">
            <TabList sx={{ mb: 1 }}>
              <Tab value={0}><Typography level="body-sm">פרטי הורה</Typography></Tab>
              <Tab value={1}><Typography level="body-sm">תשלומים</Typography></Tab>
            </TabList>

            {/* --- הורים --- */}
            <TabPanel value={0} sx={{ p: 0, pt: 1 }}>
              <ParentsTab
                player={player}
                onSaveParents={handleSaveParents}
                saving={pending}
              />
            </TabPanel>

            <TabPanel value={1} sx={{ p: 0, pt: 1 }}>
              <PaymentsFiltersBar
                filters={filters}
                onChange={setFilters}
                options={filterOptions}
              />

              {itemsFiltered.length === 0 ? (
                <Box sx={{ mt: 1 }}>
                  <EmptyState title="אין תשלומים" desc="אין נתוני תשלום בהתאמה לפילטרים." />
                </Box>
              ) : (
                <>
                  <Box sx={{ mt: 1 }}>
                    <PaymentsSummary summary={summary} />
                  </Box>
                  <PaymentsTable items={itemsFiltered} />
                </>
              )}
            </TabPanel>

            <TabPanel value={2} sx={{ p: 0, pt: 1 }}>
              <PaymentsFiltersBar
                filters={filters}
                onChange={setFilters}
                options={filterOptions}
              />
            </TabPanel>
          </Tabs>
        </Box>
      )}
    </SectionPanel>
  )
}
