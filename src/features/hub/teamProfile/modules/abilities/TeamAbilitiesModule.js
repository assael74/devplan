// teamProfile/modules/abilities/TeamAbilitiesModule.js

import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider, Card, CardContent } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import TeamAbilityHeader from './TeamAbilityHeader'
import TeamAbilityDomainCard from './TeamAbilityDomainCard'

import { isFilled } from './logic/abilities.logic.js'
import { buildTeamAbilityDomains, buildTeamAbilitiesKpi } from './logic/teamAbilities.logic.js'
import {
  buildAbilityPlayersRows,
  buildDomainPlayersRows,
} from './logic/abilities.drilldown.logic.js'
import { buildTeamAbilitiesBreakdown } from '../../../../../shared/abilities/teamAbilities.breakdown.js'
import * as abilitySx from './Ability.module.sx'

import AbilitiesFiltersBar from './components/AbilitiesFiltersBar'
import AbilitiesKpiControls from './components/AbilitiesKpiControls'
import DrilldownModal, { renderPlayerCell } from './components/DrilldownModal'

export const LAYER_ORDER = ['goalkeeper', 'defense', 'dmMid', 'midfield', 'atMidfield', 'attack']
export const LAYER_LABELS = {
  goalkeeper: 'קו שוער',
  defense: 'קו הגנה',
  dmMid: 'קו קישור אחורי',
  midfield: 'קו קישור',
  atMidfield: 'קו קישור התקפי',
  attack: 'קו התקפה',
}

const parseMode = (value) => {
  const safe = String(value || 'all')
  if (safe === 'all') return { type: 'all', key: null }

  const [type, key] = safe.split(':')
  return { type, key: key || null }
}

const resolveSlice = (breakdown, layerMode, posMode) => {
  const pos = parseMode(posMode)
  if (pos.type === 'pos' && pos.key) return breakdown?.byPosition?.[pos.key] || null

  const layer = parseMode(layerMode)
  if (layer.type === 'layer' && layer.key) return breakdown?.byLayer?.[layer.key] || null

  return null
}

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function TeamAbilitiesModule({ entity, context, onUpdate, sx }) {
  const team = entity || null
  const teamPlayers = Array.isArray(team?.players) ? team.players : []

  const [q, setQ] = useState('')
  const [layerMode, setLayerMode] = useState('all')
  const [posMode, setPosMode] = useState('all')
  const [onlyUsable, setOnlyUsable] = useState(false)
  const [minUsedCount, setMinUsedCount] = useState(0)
  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const [drill, setDrill] = useState(null)

  const breakdown = useMemo(() => {
    return buildTeamAbilitiesBreakdown(teamPlayers)
  }, [teamPlayers])

  const presentLayers = useMemo(() => {
    return new Set(Object.keys(breakdown?.byLayer || {}))
  }, [breakdown])

  const presentCodes = useMemo(() => {
    return new Set(Object.keys(breakdown?.byPosition || {}))
  }, [breakdown])

  const codeToLabel = useMemo(() => ({}), [])

  const selectedSlice = useMemo(() => {
    return resolveSlice(breakdown, layerMode, posMode)
  }, [breakdown, layerMode, posMode])

  const baseSlice = useMemo(() => {
    if (selectedSlice) return selectedSlice

    return {
      playersRaw: teamPlayers.length,
      weight: team?.squadStrength?.totalWeight || teamPlayers.length || 0,
      level: team?.squadStrength?.level || null,
      levelPotential: team?.squadStrength?.levelPotential || null,
      byAbilityId: {},
    }
  }, [selectedSlice, teamPlayers.length, team, breakdown])

  const sliceUsedCount = safeNum(baseSlice?.level?.usedCount)
  const sliceTotal = safeNum(baseSlice?.level?.total || baseSlice?.playersRaw)
  const slicePassUsable = onlyUsable ? sliceUsedCount > 0 : true
  const slicePassMin = minUsedCount ? sliceUsedCount >= minUsedCount : true
  const sliceOk = !!baseSlice && slicePassUsable && slicePassMin

  const posCode = posMode?.startsWith('pos:') ? posMode.split(':')[1] : 'all'

  const domainsRaw = useMemo(() => {
    if (!selectedSlice || !sliceOk) return []
    return buildTeamAbilityDomains(baseSlice, { scale: 1 })
  }, [selectedSlice, baseSlice, sliceOk])

  const kpi = useMemo(() => {
    if (!selectedSlice || !sliceOk) {
      return {
        totalAbilities: 0,
        filledAbilities: 0,
        avgAll: NaN,
        totalPlayers: sliceTotal || teamPlayers.length,
        usedPlayers: safeNum(baseSlice?.level?.usedCount),
        usedPlayersPotential: safeNum(baseSlice?.levelPotential?.usedCount),
      }
    }

    return buildTeamAbilitiesKpi(baseSlice, domainsRaw)
  }, [selectedSlice, sliceOk, baseSlice, domainsRaw, sliceTotal, teamPlayers.length])

  const query = q.trim().toLowerCase()

  const filteredDomains = useMemo(() => {
    const base = domainsRaw || []

    return base
      .map((domain) => {
        const items = (domain?.items || []).filter((item) => {
          const passFilled = showOnlyFilled ? isFilled(item?.value) : true
          const passQuery = query
            ? (
                String(item?.label || '').toLowerCase().includes(query) ||
                String(item?.id || '').toLowerCase().includes(query)
              )
            : true

          return passFilled && passQuery
        })

        return { ...domain, items }
      })
      .filter((domain) => (domain?.items || []).length > 0)
  }, [domainsRaw, showOnlyFilled, query])

  const levelAvg = baseSlice?.level?.avg ?? team?.level?.avg ?? null
  const levelPotentialAvg = baseSlice?.levelPotential?.avg ?? team?.levelPotential?.avg ?? null

  function onOpenAbility(abilityItem) {
    const abilityLabel = abilityItem?.label || 'יכולת'
    const rows = buildAbilityPlayersRows(teamPlayers, abilityItem?.id, { posCode })

    setDrill({
      title: abilityItem?.label,
      subtitle: 'פירוט שחקנים לפי יכולת',
      rows,
      idIcon: abilityItem?.id,
      columns: [
        { key: 'name', title: 'שחקן', render: (row) => renderPlayerCell(row), sortValue: (row) => row?.name || '' },
        { key: 'pos', title: 'עמדה' },
        { key: 'value', title: `${abilityLabel}`, width: 140, align: 'center', sortValue: (row) => row?.value || 0 },
      ],
      initialSort: { key: 'value', dir: 'desc' },
    })
  }

  function onOpenDomain(domain) {
    const abilityIds = (domain?.items || []).map((item) => item?.id)
    const domainLabel = domain?.domainLabel || 'דומיין'
    const rows = buildDomainPlayersRows(teamPlayers, abilityIds, { posCode })

    setDrill({
      title: domain?.domainLabel,
      subtitle: 'פירוט שחקנים לפי דומיין',
      rows,
      idIcon: domain?.domain,
      columns: [
        { key: 'name', title: 'שחקן', render: (row) => renderPlayerCell(row), sortValue: (row) => row?.name || '' },
        { key: 'pos', title: 'עמדה' },
        { key: 'avg', title: `ממוצע ${domainLabel}`, width: 140, align: 'center', sortValue: (row) => row?.avg || 0 },
      ],
      initialSort: { key: 'avg', dir: 'desc' },
    })
  }

  return (
    <SectionPanel>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.6, flex: 1, minHeight: 0, mt: -2 }}>
        <TeamAbilityHeader
          levelAvg={levelAvg}
          levelPotentialAvg={levelPotentialAvg}
          totalAbilities={kpi?.totalAbilities}
          filledAbilities={kpi?.filledAbilities}
          avgAll={kpi?.avgAll}
          totalPlayers={kpi?.totalPlayers || teamPlayers.length}
          usedPlayers={kpi?.usedPlayers}
          usedPlayersPotential={kpi?.usedPlayersPotential}
          query={q}
          onChangeQuery={setQ}
          showOnlyFilled={showOnlyFilled}
          onToggleShowOnlyFilled={setShowOnlyFilled}
        />

        <AbilitiesFiltersBar
          sx={abilitySx}
          q={q}
          setQ={setQ}
          layerMode={layerMode}
          setLayerMode={setLayerMode}
          posMode={posMode}
          setPosMode={setPosMode}
          onlyUsable={onlyUsable}
          setOnlyUsable={setOnlyUsable}
          presentLayers={presentLayers}
          presentCodes={presentCodes}
          layerOrder={LAYER_ORDER}
          layerLabels={LAYER_LABELS}
          codeToLabel={codeToLabel}
        />

        <AbilitiesKpiControls
          sx={abilitySx}
          slice={baseSlice}
          minUsedCount={minUsedCount}
          setMinUsedCount={setMinUsedCount}
        />

        <Divider sx={{ mb: 1, mt: 0 }} />

        {!selectedSlice && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                בחר חתך לפי שכבה או עמדה כדי לראות פירוט דומיינים ויכולות.
              </Typography>
            </CardContent>
          </Card>
        )}

        {selectedSlice && !sliceOk && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                אין מספיק נתונים להצגה לפי הסינון הנוכחי — נסה להוריד את סף הכיסוי או לבטל “רק עם נתונים”.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={2}>
          {filteredDomains.map((domain) => (
            <Grid key={domain?.domain} xs={12} sm={6} lg={3}>
              <TeamAbilityDomainCard
                domain={domain}
                onOpenDomain={onOpenDomain}
                onOpenAbility={onOpenAbility}
              />
            </Grid>
          ))}
        </Grid>

        {selectedSlice && sliceOk && filteredDomains.length === 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                אין תוצאות לתצוגה — נסה לבטל “הצג רק מלאים” או נקה את החיפוש.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <DrilldownModal
        open={!!drill}
        idIcon={drill?.idIcon}
        onClose={() => setDrill(null)}
        title={drill?.title}
        subtitle={drill?.subtitle}
        rows={drill?.rows || []}
        columns={drill?.columns || []}
        initialSort={drill?.initialSort}
      />
    </SectionPanel>
  )
}
