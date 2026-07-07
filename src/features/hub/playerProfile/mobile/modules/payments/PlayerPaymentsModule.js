// playerProfile/mobile/modules/payments/PlayerPaymentsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { MobileFiltersDrawerShell } from '../../../../../../ui/patterns/filters/index.js'
import { profileSx as sx } from './../../sx/profile.sx'

import { usePlayerPaymentsModuleModel } from '../../../sharedModules/payments'

const PaymentsToolbar = React.lazy(() => import('./components/toolbar/PaymentsToolbar.js'))
const PaymentsFiltersContent = React.lazy(() => import('./components/toolbar/PaymentsFiltersContent.js'))
const EditDrawer = React.lazy(() => import('./components/drawer/EditDrawer.js'))
const ParentDrawer = React.lazy(() => import('./components/parentDrawer/parentDrawer.js'))
const PaymentsTabsBar = React.lazy(() => import('./components/PaymentsTabsBar.js'))
const PaymentsList = React.lazy(() => import('./components/PaymentsList.js'))
const ParentsSection = React.lazy(() => import('./components/ParentsSection.js'))

export default function PlayerPaymentsModule({ entity, context }) {
  const model = usePlayerPaymentsModuleModel({ entity })

  const {
    player,
    playerName,

    activeTab,
    filtersOpen,
    filters,
    editingPayment,
    parentDrawerOpen,
    editingParent,

    itemsAll,
    itemsFiltered,
    summary,
    options,
    indicators,
    hasActiveFilters,

    setActiveTab,
    setFiltersOpen,
    setEditingPayment,

    handleChangeFilters,
    handleResetFilters,
    handleClearIndicator,
    handleOpenNewParent,
    handleOpenEditParent,
    handleCloseParentDrawer,
  } = model

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
            onEditPayment={payment => setEditingPayment(payment || null)}
          />
        </>
      ) : (
        <>
          <Box sx={sx.moduleRoot}>
            <PaymentsToolbar
              mode="parents"
              onOpenNewParent={handleOpenNewParent}
              player={player}
            />
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
