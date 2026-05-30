// playerProfile/sharedModules/payments/usePlayerPaymentsModuleModel.js

import { useCallback, useMemo, useState } from 'react'

import {
  createInitialPaymentsFilters,
  clearPaymentsIndicator,
  resolvePlayerPaymentsDomain,
} from '../../sharedLogic'

import { buildPlayerName } from './playerPaymentsModule.helpers.js'

export default function usePlayerPaymentsModuleModel({ entity }) {
  const player = entity || null

  const [activeTab, setActiveTab] = useState('payments')
  const [desktopTab, setDesktopTab] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState(createInitialPaymentsFilters())
  const [editingPayment, setEditingPayment] = useState(null)
  const [parentDrawerOpen, setParentDrawerOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)

  const domain = useMemo(() => {
    return resolvePlayerPaymentsDomain(player, filters)
  }, [player, filters])

  const {
    itemsAll = [],
    itemsFiltered = [],
    summary,
    options,
    indicators = [],
    hasActiveFilters = false,
  } = domain || {}

  const handleChangeFilters = useCallback(patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(createInitialPaymentsFilters())
  }, [])

  const handleClearIndicator = useCallback(item => {
    if (!item?.id) return

    setFilters(prev => clearPaymentsIndicator(prev, item.id))
  }, [])

  const handleOpenNewParent = useCallback(() => {
    setEditingParent(null)
    setParentDrawerOpen(true)
  }, [])

  const handleOpenEditParent = useCallback(parent => {
    setEditingParent(parent || null)
    setParentDrawerOpen(true)
  }, [])

  const handleCloseParentDrawer = useCallback(() => {
    setParentDrawerOpen(false)
    setEditingParent(null)
  }, [])

  const playerName = useMemo(() => {
    return buildPlayerName(player)
  }, [player])

  return {
    player,
    playerName,

    activeTab,
    desktopTab,
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
    setDesktopTab,
    setFiltersOpen,
    setFilters,
    setEditingPayment,
    setParentDrawerOpen,
    setEditingParent,

    handleChangeFilters,
    handleResetFilters,
    handleClearIndicator,
    handleOpenNewParent,
    handleOpenEditParent,
    handleCloseParentDrawer,
  }
}
