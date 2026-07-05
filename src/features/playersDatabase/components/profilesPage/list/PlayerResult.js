// features/playersDatabase/components/profilesPage/list/PlayerResult.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  ChipDelete,
  CircularProgress,
  IconButton,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { clean, listText, valueOrDash } from '../logic/utils.js'
import { usePlayerPosition } from './hooks/usePlayerPosition.js'
import {
  getPlayerProfileChips,
  getPlayerProfileInfo,
} from './logic/scout.logic.js'
import {
  getPlayerUrls,
  PLAYER_LAYER_OPTIONS,
} from './logic/player.logic.js'
import ProfileTooltip from './ProfileTooltip.js'
import { playerSx as sx } from './sx/player.sx.js'

const resolveValue = (value, fallback) =>
  value !== undefined && value !== null ? value : fallback

function InlineEntityLink({ href, children, level = 'body-xs' }) {
  if (!href) return <span>{children}</span>

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={sx.entityLink}
      onClick={event => event.stopPropagation()}
    >
      <Typography level={level} sx={level === 'title-sm' ? sx.rowTitle : null}>
        {children}
      </Typography>
    </Box>
  )
}

function StatCell({ label, value }) {
  return (
    <Box sx={sx.statCell}>
      <Typography level="body-xs" sx={sx.statLabel}>
        {label}
      </Typography>
      <Typography level="body-sm" sx={sx.statValue}>
        {valueOrDash(value)}
      </Typography>
    </Box>
  )
}

export default function PlayerResult({
  player,
  result,
  removingProfileId,
  onEditLink,
  onRemoveProfile,
}) {
  const current = player.current || {}
  const games = resolveValue(current.games, player.games)
  const starts = resolveValue(current.starts, player.starts)
  const minutes = resolveValue(current.minutes, player.minutes)
  const goals = resolveValue(current.goals, player.goals)
  const yellowCards = resolveValue(current.yellowCards, player.yellowCards)
  const profile = getPlayerProfileInfo(player)
  const profileChips = getPlayerProfileChips(player)
  const score = resolveValue(profile.score, player.bestScoutScore)
  const reliability =
    profile.reliabilityLevel ||
    player.bestScoutReliabilityLevel ||
    profile.reliabilityScore ||
    player.bestScoutReliabilityScore
  const urls = getPlayerUrls(player)
  const positionModel = usePlayerPosition(player)
  const rowKey = clean(player.searchDocId || player.id)

  return (
    <Box sx={sx.row}>
      <Box sx={sx.main}>
        <Box sx={sx.identityCell}>
          <InlineEntityLink href={urls.playerUrl} level="title-sm">
            {player.fullName || player.playerName || player.name || '-'}
          </InlineEntityLink>

          <Typography level="body-xs" sx={sx.subtext}>
            <InlineEntityLink href={urls.leagueUrl}>
              {valueOrDash(player.leagueName)}
            </InlineEntityLink>

            <Box component="span" sx={sx.subtextDivider}>
              |
            </Box>

            <InlineEntityLink href={urls.teamUrl}>
              {valueOrDash(player.clubName || player.teamName)}
            </InlineEntityLink>

            <Box component="span" sx={sx.subtextDivider}>
              |
            </Box>

            <Box component="span">
              {valueOrDash(player.birthYear || player.teamBirthYear)}
            </Box>
          </Typography>
        </Box>

        <Box sx={sx.positionCell}>
          <Select
            size="sm"
            variant="plain"
            value={positionModel.selectedLayer || null}
            placeholder="חוליה"
            sx={sx.select}
            onClick={event => event.stopPropagation()}
            onChange={(event, value) => {
              event?.stopPropagation()
              positionModel.changeLayer(value)
            }}
          >
            {PLAYER_LAYER_OPTIONS.map(option => (
              <Option key={option.id} value={option.id}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            variant="plain"
            value={positionModel.selectedPosition || null}
            placeholder="עמדה"
            disabled={!positionModel.selectedLayer}
            sx={sx.select}
            onClick={event => event.stopPropagation()}
            onChange={(event, value) => {
              event?.stopPropagation()
              positionModel.setSelectedPosition(clean(value))
            }}
          >
            {positionModel.positionOptions.map(option => (
              <Option key={option.code} value={option.code}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.statsTable}>
          <StatCell label="מש'" value={games} />
          <StatCell label="דק'" value={minutes} />
          <StatCell label="שערים" value={goals} />
          <StatCell label="צהובים" value={yellowCards} />
          <StatCell
            label="פתח"
            value={`${valueOrDash(starts)}/${valueOrDash(games)}`}
          />
        </Box>
      </Box>

      <Box sx={sx.statusRow}>
        <Box sx={sx.statusLeft}>
          {positionModel.showStatus ? (
            <Chip
              size="sm"
              variant="soft"
              color={positionModel.position.sourceColor}
            >
              {positionModel.hasDraft
                ? 'ממתין לאישור עמדה'
                : positionModel.position.sourceLabel}
            </Chip>
          ) : null}

          {profileChips.map(item => {
            const isRemovingThisChip =
              result?.removingProfileIds?.[rowKey] === item.id
            const isDeleteLocked =
              Boolean(removingProfileId) && !isRemovingThisChip

            return (
              <Tooltip
                key={item.id || item.label}
                title={<ProfileTooltip profileId={item.id} />}
                variant="soft"
              >
                <Chip
                  size="sm"
                  variant="soft"
                  color="primary"
                  startDecorator={
                    item.idIcon
                      ? iconUi({ id: item.idIcon, size: 'small' })
                      : null
                  }
                  endDecorator={
                    onRemoveProfile ? (
                      isRemovingThisChip ? (
                        <CircularProgress
                          size="sm"
                          thickness={3}
                          sx={{ '--CircularProgress-size': '16px' }}
                        />
                      ) : (
                        <ChipDelete
                          color="danger"
                          variant="plain"
                          aria-label="הסר פרופיל"
                          disabled={isDeleteLocked}
                          onClick={event => {
                            event.preventDefault()
                            event.stopPropagation()
                            onRemoveProfile(player, item.id)
                          }}
                        >
                          {iconUi({ id: 'close', size: 'sm' })}
                        </ChipDelete>
                      )
                    ) : null
                  }
                >
                  {item.label}
                </Chip>
              </Tooltip>
            )
          })}

          {positionModel.position.positions.length ? (
            <Typography level="body-xs" sx={sx.rowMeta}>
              עמדות מקור: {listText(positionModel.position.positions)}
            </Typography>
          ) : null}
        </Box>

        <Box sx={sx.statusActions}>
          {positionModel.error ? (
            <Typography level="body-xs" sx={sx.errorInline}>
              {positionModel.error}
            </Typography>
          ) : null}

          {positionModel.hasDraft ? (
            <Button
              size="sm"
              color="success"
              variant="soft"
              loading={positionModel.saving}
              disabled={!clean(positionModel.selectedLayer)}
              onClick={positionModel.savePosition}
            >
              אשר בחירה
            </Button>
          ) : null}

          {reliability ? (
            <Chip size="sm" variant="soft" color="neutral" sx={sx.fixedChip}>
              ודאות {reliability}
            </Chip>
          ) : null}

          {score !== undefined && score !== null ? (
            <Chip size="sm" variant="soft" color="neutral" sx={sx.fixedChip}>
              ציון {score}
            </Chip>
          ) : null}

          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            sx={sx.editButton}
            title="עריכה"
            onClick={() => onEditLink(player)}
          >
            {iconUi({ id: 'edit', size: 'small' })}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
