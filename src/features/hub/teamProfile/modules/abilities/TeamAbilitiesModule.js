// teamProfile/modules/abilities/TeamAbilitiesModule.js
import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Divider } from '@mui/joy'
import { Card, CardContent } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import TeamAbilityHeader from './TeamAbilityHeader'
import TeamAbilityDomainCard from './TeamAbilityDomainCard'

import { isFilled } from './logic/abilities.logic'
import { buildTeamAbilityDomains, buildTeamAbilitiesKpi } from './logic/teamAbilities.logic'
import {
  buildAbilityPlayersRows,
  buildDomainPlayersRows,
} from './logic/abilities.drilldown.logic'
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

const parseMode = (v) => {
  const s = String(v || 'all')
  if (s === 'all') return { type: 'all', key: null }
  const [type, key] = s.split(':')
  return { type, key: key || null }
}

const resolveSlice = (abilitiesTeam, layerMode, posMode) => {
  const pos = parseMode(posMode)
  if (pos.type === 'pos' && pos.key) return abilitiesTeam?.byPosition[pos.key] || null

  const layer = parseMode(layerMode)
  if (layer.type === 'layer' && layer.key) return abilitiesTeam?.byLayer[layer.key] || null

  return abilitiesTeam || null
}

const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

export default function TeamAbilitiesModule({ entity, context, onUpdate, sx }) {
  const team = entity
  const abilitiesTeam = team?.abilitiesTeam || {}

  const [q, setQ] = useState('')
  const [layerMode, setLayerMode] = useState('all')
  const [posMode, setPosMode] = useState('all')
  const [onlyUsable, setOnlyUsable] = useState(false)
  const [minUsedCount, setMinUsedCount] = useState(0)
  const [drill, setDrill] = useState(null)

  const presentLayers = useMemo(() => new Set(Object.keys(abilitiesTeam?.byLayer || {})), [abilitiesTeam])
  const presentCodes = useMemo(() => new Set(Object.keys(abilitiesTeam?.byPosition || {})), [abilitiesTeam])

  const codeToLabel = useMemo(() => ({}), [])

  const slice = useMemo(() => resolveSlice(abilitiesTeam, layerMode, posMode), [abilitiesTeam, layerMode, posMode])

  const sliceUsedCount = safeNum(slice?.level?.usedCount)
  const sliceTotal = safeNum(slice?.level?.total)
  const slicePassUsable = onlyUsable ? sliceUsedCount > 0 : true
  const slicePassMin = minUsedCount ? sliceUsedCount >= minUsedCount : true
  const sliceOk = !!slice && slicePassUsable && slicePassMin
  const posCode = posMode?.startsWith('pos:') ? posMode.split(':')[1] : 'all'

  const onOpenAbility = (abilityItem) => {
    const abilityLabel = abilityItem?.label || 'יכולת'
    const rows = buildAbilityPlayersRows(
      team?.players,
      abilityItem.id,
      { posCode }
    )

    setDrill({
      title: abilityItem.label,
      subtitle: 'פירוט שחקנים לפי יכולת',
      rows,
      idIcon: abilityItem.id,
      columns: [
        { key: 'name', title: 'שחקן', render: (r) => renderPlayerCell(r), sortValue: (r) => r.name || '' },
        { key: 'pos', title: 'עמדה' },
        { key: 'avg', title: `ממוצע ${abilityLabel}`, width: 140, align: 'center', sortValue: (r) => r.avg || 0 },
      ],
      initialSort: { key: 'avg', dir: 'desc' },
    })
  }

  const onOpenDomain = (domain) => {
    const abilityIds = domain.items.map((i) => i.id)
    const domainLabel = domain?.domainLabel || 'דומיין'
    const rows = buildDomainPlayersRows(
      team?.players,
      abilityIds,
      { posCode }
    )

    setDrill({
      title: domain.domainLabel,
      subtitle: 'פירוט שחקנים לפי דומיין',
      rows,
      idIcon: domain.domain,
      columns: [
        { key: 'name', title: 'שחקן', render: (r) => renderPlayerCell(r), sortValue: (r) => r.name || '' },
        { key: 'pos', title: 'עמדה' },
        { key: 'avg', title: `ממוצע ${domainLabel}`, width: 140, align: 'center', sortValue: (r) => r.avg || 0 },
      ],
      initialSort: { key: 'avg', dir: 'desc' },
    })
  }

  const domainsRaw = useMemo(() => {
    if (!sliceOk) return []
    return buildTeamAbilityDomains(
      { ...abilitiesTeam, ...slice, totalPlayers: sliceTotal || abilitiesTeam?.totalPlayers || 0 },
      { scale: 1 }
    )
  }, [sliceOk, slice, abilitiesTeam, sliceTotal])

  const kpi = useMemo(() => {
    if (!sliceOk) {
      return {
        totalAbilities: 0,
        filledAbilities: 0,
        avgAll: NaN,
        totalPlayers: sliceTotal || abilitiesTeam?.totalPlayers || 0,
        usedPlayers: sliceUsedCount,
        usedPlayersPotential: safeNum(slice?.levelPotential?.usedCount),
      }
    }
    return buildTeamAbilitiesKpi(
      { ...abilitiesTeam, ...slice, totalPlayers: sliceTotal || abilitiesTeam?.totalPlayers || 0 },
      domainsRaw
    )
  }, [sliceOk, slice, abilitiesTeam, domainsRaw, sliceTotal, sliceUsedCount])

  const [showOnlyFilled, setShowOnlyFilled] = useState(false)
  const query = q.trim().toLowerCase()

  const filteredDomains = useMemo(() => {
    const base = domainsRaw || []
    return base
      .map((d) => {
        const items = (d.items || []).filter((i) => {
          const passFilled = showOnlyFilled ? isFilled(i.value) : true
          const passQuery = query
            ? (i.label?.toLowerCase().includes(query) || i.id?.toLowerCase().includes(query))
            : true
          return passFilled && passQuery
        })
        return { ...d, items }
      })
      .filter((d) => (d.items || []).length > 0)
  }, [domainsRaw, showOnlyFilled, query])

  const levelAvg = sliceOk ? slice?.level?.avg : null
  const levelPotentialAvg = sliceOk ? slice?.levelPotential?.avg : null

  return (
    <SectionPanel>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.6, flex: 1, minHeight: 0, mt: -2 }}>
        <TeamAbilityHeader
          levelAvg={levelAvg}
          levelPotentialAvg={levelPotentialAvg}
          totalAbilities={kpi.totalAbilities}
          filledAbilities={kpi.filledAbilities}
          avgAll={kpi.avgAll}
          totalPlayers={kpi.totalPlayers}
          usedPlayers={kpi.usedPlayers}
          usedPlayersPotential={kpi.usedPlayersPotential}
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
          slice={slice}
          minUsedCount={minUsedCount}
          setMinUsedCount={setMinUsedCount}
        />

        <Divider sx={{ mb: 1, mt: 0 }} />

        {!sliceOk && (
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
            <Grid key={domain.domain} xs={12} sm={6} lg={3}>
              <TeamAbilityDomainCard
                domain={domain}
                onOpenDomain={onOpenDomain}
                onOpenAbility={onOpenAbility}
              />
            </Grid>
          ))}
        </Grid>

        {sliceOk && filteredDomains.length === 0 && (
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
      />
    </SectionPanel>
  )
}
