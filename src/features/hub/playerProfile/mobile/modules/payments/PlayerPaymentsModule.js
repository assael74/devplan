// playerProfile/mobile/modules/payments/PlayerPaymentsModule.js

import React, { useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import {
  createInitialPaymentsFilters,
  clearPaymentsIndicator,
  resolvePlayerPaymentsDomain,
} from './../../../sharedLogic'

import PaymentsToolbar from './components/toolbar/PaymentsToolbar.js'
import PaymentsFiltersContent from './components/toolbar/PaymentsFiltersContent.js'

import EditDrawer from './components/drawer/EditDrawer.js'
import ParentDrawer from './components/parentDrawer/parentDrawer.js'

import PaymentsTabsBar from './components/PaymentsTabsBar.js'
import PaymentsList from './components/PaymentsList.js'
import ParentsSection from './components/ParentsSection.js'
import PermissionNotice from './components/PermissionNotice.js'

import { MobileFiltersDrawerShell } from '../../../../../../ui/patterns/filters/index.js'
import { profileSx as sx } from './../../sx/profile.sx'

function buildPlayerName(player) {
  const first = String(player?.playerFirstName || '').trim()
  const last = String(player?.playerLastName || '').trim()
  const full = `${first} ${last}`.trim()
  return full || String(player?.playerShortName || '').trim() || 'שחקן'
}

export default function PlayerPaymentsModule({ entity, context }) {
  const player = entity || null

  const [activeTab, setActiveTab] = useState('payments')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState(createInitialPaymentsFilters())
  const [editingPayment, setEditingPayment] = useState(null)
  const [parentDrawerOpen, setParentDrawerOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)

  const canViewPayments = true
  const canManageParents = true

  const {
    itemsAll,
    itemsFiltered,
    summary,
    options,
    indicators,
    hasActiveFilters,
  } = useMemo(() => {
    return resolvePlayerPaymentsDomain(player, filters)
  }, [player, filters])

  const handleChangeFilters = useCallback((patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(createInitialPaymentsFilters())
  }, [])

  const handleClearIndicator = useCallback((item) => {
    if (!item?.id) return
    setFilters((prev) => clearPaymentsIndicator(prev, item.id))
  }, [])

  const handleOpenNewParent = useCallback(() => {
    setEditingParent(null)
    setParentDrawerOpen(true)
  }, [])

  const handleOpenEditParent = useCallback((parent) => {
    setEditingParent(parent || null)
    setParentDrawerOpen(true)
  }, [])

  const handleCloseParentDrawer = useCallback(() => {
    setParentDrawerOpen(false)
    setEditingParent(null)
  }, [])

  const playerName = useMemo(() => buildPlayerName(player), [player])

  if (!player) {
    return (
      <SectionPanelMobile>
        <EmptyState
          title="אין שחקן"
          subtitle="לא התקבל אובייקט שחקן עבור אזור התשלומים"
        />
      </SectionPanelMobile>
    )
  }

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <PaymentsTabsBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      </Box>

      {activeTab === 'payments' ? (
        <>
          <Box sx={sx.moduleRoot}>
            <PaymentsToolbar
              mode="payments"
              filteredCount={itemsFiltered.length}
              totalCount={itemsAll.length}
              indicators={indicators}
              summary={summary}
              hasActiveFilters={hasActiveFilters}
              onOpenFilters={() => setFiltersOpen(true)}
              onClearIndicator={handleClearIndicator}
            />

          </Box>
          <PaymentsList
            items={itemsFiltered}
            onEditPayment={(payment) => setEditingPayment(payment || null)}
          />
        </>
      ) : (
        <>
          <Box sx={sx.moduleRoot}>
            <PaymentsToolbar mode="parents" onOpenNewParent={handleOpenNewParent} player={player} />
          </Box>
          <ParentsSection
            player={player}
            parent={editingParent}
            onEditParent={handleOpenEditParent}
            playerName={playerName}
            context={context}
          />
        </>
      )}

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="player"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לתשלומים"
        subtitle="סינון רשימת התשלומים"
        resultsText={`${itemsFiltered.length} מתוך ${itemsAll.length} תשלומים`}
        onReset={handleResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <PaymentsFiltersContent
          filters={filters}
          options={options}
          onChangeFilters={handleChangeFilters}
        />
      </MobileFiltersDrawerShell>

      <EditDrawer
        open={!!editingPayment}
        payment={editingPayment}
        context={{ ...context, player }}
        onClose={() => setEditingPayment(null)}
        onSaved={() => setEditingPayment(null)}
      />

      <ParentDrawer
        open={parentDrawerOpen}
        onClose={handleCloseParentDrawer}
        player={player}
        parent={editingParent}
        onSaved={handleCloseParentDrawer}
      />
    </SectionPanelMobile>
  )
}
