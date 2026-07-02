// src/features/playersDatabase/components/scan/ScanPlayerResult.js

import React from 'react'
import { Box, Button, Chip, ChipDelete, IconButton, Option, Select, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { useScanPlayerPosition } from './hooks/useScanPlayerPosition.js'
import { getPlayerProfileChips, getPlayerProfileInfo } from './logic/scout.logic.js'
import { getPlayerUrls, SCAN_LAYER_OPTIONS } from './logic/player.logic.js'
import { clean, listText, valueOrDash } from './logic/utils.js'
import ScanProfileTooltip from './ScanProfileTooltip.js'
import { scanPlayerSx as sx } from './sx/player.sx.js'

function InlineEntityLink({ href, children, level = 'body-xs' }) {
  if (!href) return <span>{children}</span>

  return (
    <Box component="a" href={href} target="_blank" rel="noreferrer" sx={sx.entityLink} onClick={event => event.stopPropagation()}>
      <Typography level={level} sx={level === 'title-sm' ? sx.rowTitle : null}>{children}</Typography>
    </Box>
  )
}

function StatCell({ label, value }) {
  return (
    <Box sx={sx.statCell}>
      <Typography level="body-xs" sx={sx.statLabel}>{label}</Typography>
      <Typography level="body-sm" sx={sx.statValue}>{valueOrDash(value)}</Typography>
    </Box>
  )
}

export default function ScanPlayerResult({ player, onEditLink, onRemoveProfile }) {
  const current = player.current || {}
  const games = current.games ?? player.games
  const starts = current.starts ?? player.starts
  const profile = getPlayerProfileInfo(player)
  const profileChips = getPlayerProfileChips(player)
  const score = profile.score ?? player.bestScoutScore
  const reliability = profile.reliabilityLevel || player.bestScoutReliabilityLevel || profile.reliabilityScore || player.bestScoutReliabilityScore
  const urls = getPlayerUrls(player)
  const positionModel = useScanPlayerPosition(player)

  return (
    <Box sx={sx.row}>
      <Box sx={sx.main}>
        <Box sx={sx.identityCell}>
          <InlineEntityLink href={urls.playerUrl} level="title-sm">{player.fullName || player.playerName || player.name || '-'}</InlineEntityLink>
          <Typography level="body-xs" sx={sx.subtext}>
            <InlineEntityLink href={urls.leagueUrl}>{valueOrDash(player.leagueName)}</InlineEntityLink>
            <Box component="span" sx={sx.subtextDivider}>|</Box>
            <InlineEntityLink href={urls.teamUrl}>{valueOrDash(player.clubName || player.teamName)}</InlineEntityLink>
            <Box component="span" sx={sx.subtextDivider}>|</Box>
            <Box component="span">{valueOrDash(player.birthYear || player.teamBirthYear)}</Box>
          </Typography>
        </Box>

        <Box sx={sx.positionCell}>
          <Select size="sm" variant="plain" value={positionModel.selectedLayer || null} placeholder="חוליה" sx={sx.select} onClick={event => event.stopPropagation()} onChange={(event, value) => { event?.stopPropagation?.(); positionModel.changeLayer(value) }}>
            {SCAN_LAYER_OPTIONS.map(option => <Option key={option.id} value={option.id}>{option.label}</Option>)}
          </Select>

          <Select size="sm" variant="plain" value={positionModel.selectedPosition || null} placeholder="עמדה" disabled={!positionModel.selectedLayer} sx={sx.select} onClick={event => event.stopPropagation()} onChange={(event, value) => { event?.stopPropagation?.(); positionModel.setSelectedPosition(clean(value)) }}>
            {positionModel.positionOptions.map(option => <Option key={option.code} value={option.code}>{option.label}</Option>)}
          </Select>
        </Box>

        <Box sx={sx.statsTable}>
          <StatCell label="מש׳" value={games} />
          <StatCell label="דק׳" value={current.minutes ?? player.minutes} />
          <StatCell label="שערים" value={current.goals ?? player.goals} />
          <StatCell label="צהוב" value={current.yellowCards ?? player.yellowCards} />
          <StatCell label="פתח" value={`${valueOrDash(starts)}/${valueOrDash(games)}`} />
        </Box>
      </Box>

      <Box sx={sx.statusRow}>
        <Box sx={sx.statusLeft}>
          {positionModel.showStatus ? <Chip size="sm" variant="soft" color={positionModel.position.sourceColor}>{positionModel.hasDraft ? 'ממתין לאישור עמדה' : positionModel.position.sourceLabel}</Chip> : null}

          {profileChips.map(item => (
            <Tooltip key={item.id || item.label} title={<ScanProfileTooltip profileId={item.id} />} variant="soft">
              <Chip size="sm" variant="soft" color="primary" startDecorator={item.idIcon ? iconUi({ id: item.idIcon, size: 'small' }) : null} endDecorator={onRemoveProfile ? (
                <ChipDelete color="danger" variant="plain" aria-label="הסר פרופיל" onClick={event => { event.preventDefault(); event.stopPropagation(); onRemoveProfile?.(player, item.id) }}>{iconUi({ id: 'close', size: 'sm' })}</ChipDelete>
              ) : null}>{item.label}</Chip>
            </Tooltip>
          ))}

          {positionModel.position.positions.length ? <Typography level="body-xs" sx={sx.rowMeta}>עמדות מקור: {listText(positionModel.position.positions)}</Typography> : null}
        </Box>

        <Box sx={sx.statusActions}>
          {positionModel.error ? <Typography level="body-xs" sx={sx.errorInline}>{positionModel.error}</Typography> : null}
          {positionModel.hasDraft ? <Button size="sm" color="success" variant="soft" loading={positionModel.saving} disabled={!clean(positionModel.selectedLayer)} onClick={positionModel.savePosition}>אשר בחירה</Button> : null}
          {reliability ? <Chip size="sm" variant="soft" color="neutral" sx={sx.fixedChip}>ודאות {reliability}</Chip> : null}
          {score != null ? <Chip size="sm" variant="soft" color="neutral" sx={sx.fixedChip}>ציון {score}</Chip> : null}
          <IconButton size="sm" variant="soft" color="neutral" sx={sx.editButton} title="עריכה" onClick={() => onEditLink?.(player)}>{iconUi({ id: 'edit', size: 'small' })}</IconButton>
        </Box>
      </Box>
    </Box>
  )
}
