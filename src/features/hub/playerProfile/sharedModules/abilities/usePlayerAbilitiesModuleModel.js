// playerProfile/sharedModules/abilities/usePlayerAbilitiesModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import { resolveAbilitiesDomain } from '../../../../../shared/abilities/abilities.domain.logic.js'

import {
  isFilled,
  useAbilitiesSummary,
} from '../../sharedLogic'

import {
  DEFAULT_SELECTED_DOMAINS,
} from './playerAbilitiesModule.constants.js'

export default function usePlayerAbilitiesModuleModel({
  entity,
  abilitiesInsightsRequest = 0,
}) {
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [selectedDomains, setSelectedDomains] = useState(DEFAULT_SELECTED_DOMAINS)
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [invitePending, setInvitePending] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  const player = entity || null

  const domainResult = useMemo(() => {
    return resolveAbilitiesDomain(player || {})
  }, [player])

  const domains = domainResult?.domains || []

  const { total, filled, avgAll } = useAbilitiesSummary(domains)

  const filteredDomains = useMemo(() => {
    const selectedSet = new Set(selectedDomains || [])

    return domains
      .filter(domain => {
        if (!selectedSet.size) return true

        return selectedSet.has(domain?.domain)
      })
      .map(domain => {
        const items = (domain?.items || []).filter(item => {
          return showOnlyFilled ? isFilled(item?.value) : true
        })

        return {
          ...domain,
          items,
        }
      })
      .filter(domain => domain?.items?.length > 0)
  }, [domains, selectedDomains, showOnlyFilled])

  useEffect(() => {
    if (abilitiesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [abilitiesInsightsRequest])

  const indicators = useMemo(() => {
    const next = []

    if (selectedDomains.length) {
      next.push({
        id: 'domains',
        label: `דומיינים: ${selectedDomains.length}`,
        idIcon: 'filter',
        color: 'primary',
      })
    }

    if (showOnlyFilled) {
      next.push({
        id: 'filled-only',
        label: 'רק מלאים',
        idIcon: 'filter',
        color: 'primary',
      })
    }

    return next
  }, [selectedDomains, showOnlyFilled])

  const hasActiveFilters = indicators.length > 0

  const handleOpenInvite = () => {
    setInviteDrawerOpen(true)
  }

  const handleClearIndicator = item => {
    if (!item?.id) return

    if (item.id === 'domains') {
      setSelectedDomains([])
      return
    }

    if (item.id === 'filled-only') {
      setShowOnlyFilled(false)
    }
  }

  const handleResetFilters = () => {
    setSelectedDomains([])
    setShowOnlyFilled(false)
  }

  return {
    player,
    domains,

    total,
    filled,
    avgAll,

    filteredDomains,
    indicators,
    hasActiveFilters,

    inviteDrawerOpen,
    insightsOpen,
    filtersOpen,

    selectedDomains,
    showOnlyFilled,
    invitePending,
    inviteResult,

    setInviteDrawerOpen,
    setInsightsOpen,
    setFiltersOpen,
    setSelectedDomains,
    setShowOnlyFilled,
    setInvitePending,
    setInviteResult,

    handleOpenInvite,
    handleClearIndicator,
    handleResetFilters,
  }
}
