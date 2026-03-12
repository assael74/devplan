//preview/previewDomainCard/domains/player/payments/PlayerPaymentsDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import {
  resolvePlayerPaymentsDomain,
  filterPlayerPayments,
} from './logic/playerPayments.domain.logic.js'
import PlayerPaymentsKpi from './components/PlayerPaymentsKpi.js'
import PlayerPaymentsFilters from './components/PlayerPaymentsFilters.js'
import PlayerPaymentsTable from './components/PlayerPaymentsTable.js'
import EditDrawer from './components/drawer/EditDrawer.js'
import NewFormDrawer from './components/newForm/NewFormDrawer.js'

export default function PlayerPaymentsDomainModal({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const { rows, summary } = useMemo(() => resolvePlayerPaymentsDomain(livePlayer), [livePlayer])

  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activePayment, setActivePayment] = useState(null)
  const [openCreatePayment, setOpenCreatePayment] = useState(false)

  const filtered = useMemo(
    () =>
      filterPlayerPayments(rows, {
        q,
        typeFilter,
        statusFilter,
      }),
    [rows, q, typeFilter, statusFilter]
  )

  const handleReset = () => {
    setQ('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const handleEdit = (payment) => {
    setActivePayment(payment)
  }

  return (
    <>
      <Box sx={{ minWidth: 0, display: 'grid', gap: 1 }}>
        <Box sx={{ position: 'sticky', top: -15, zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
          <PlayerPaymentsKpi entity={livePlayer} summary={summary} filteredCount={filtered.length} />

          <PlayerPaymentsFilters
            q={q}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            onChangeQ={setQ}
            onChangeTypeFilter={setTypeFilter}
            onChangeStatusFilter={setStatusFilter}
            onReset={handleReset}
            onCreatePayment={() => setOpenCreatePayment(true)}
          />
        </Box>

        <PlayerPaymentsTable
          rows={filtered}
          onEditPayment={handleEdit}
        />
      </Box>

      <NewFormDrawer
        open={openCreatePayment}
        onClose={() => setOpenCreatePayment(false)}
        onSaved={() => setOpenCreatePayment(false)}
        context={{ ...context, playerId: entity?.id || '', entity: livePlayer }}
      />

      <EditDrawer
        open={!!activePayment}
        payment={activePayment}
        context={context}
        onClose={() => setActivePayment(null)}
        onSaved={() => setActivePayment(null)}
      />
    </>
  )
}
