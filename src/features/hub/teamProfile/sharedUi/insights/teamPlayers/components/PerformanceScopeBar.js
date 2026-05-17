// teamProfile/sharedUi/insights/teamPlayers/components/PerformanceScopeBar.js

import React from 'react'
import { Box, Chip, Option, Select, Sheet, Typography } from '@mui/joy'

import {
  getGameKey,
  getGameLabel,
  getRangeCount,
  getScopeGames,
} from './playerPerformance.helpers.js'

import { performanceSx as sx } from './sx/performance.sx.js'

const MIN_SCOPE_GAMES = 5

const getScopeChipText = ({
  mode,
  scopeGames,
  rangeCount,
}) => {
  if (mode === 'range') {
    return `${rangeCount || 0} משחקים`
  }

  return `${scopeGames.length} משחקים`
}

export default function PerformanceScopeBar({
  games = [],
  value,
  onChange,
}) {
  const scopeGames = React.useMemo(() => {
    return getScopeGames(games)
  }, [games])

  const mode = value?.mode || 'season'
  const fromGameKey = value?.fromGameKey || ''
  const toGameKey = value?.toGameKey || ''

  const rangeCount = getRangeCount({
    games: scopeGames,
    fromGameKey,
    toGameKey,
  })

  const isRangeTooSmall =
    mode === 'range' &&
    rangeCount > 0 &&
    rangeCount < MIN_SCOPE_GAMES

  const updateScope = (patch) => {
    if (typeof onChange !== 'function') return

    onChange({
      mode,
      fromGameKey: null,
      toGameKey: null,
      ...value,
      ...patch,
    })
  }

  return (
    <Sheet variant="soft" sx={sx.scopeBar}>
      <Box sx={sx.scopeHeader}>
        <Box sx={sx.scopeTitleWrap}>
          <Typography level="title-sm" sx={sx.scopeTitle}>
            סקופ ביצוע
          </Typography>

          <Typography level="body-xs" sx={sx.scopeSub}>
            שינוי טווח המשחקים משנה את פרופילי הביצוע, TVA והמדדים האישיים.
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={isRangeTooSmall ? 'warning' : 'neutral'}
          sx={sx.scopeCountChip}
        >
          {getScopeChipText({
            mode,
            scopeGames,
            rangeCount,
          })}
        </Chip>
      </Box>

      <Box sx={sx.scopeControls}>
        <Select
          size="sm"
          value={mode}
          onChange={(event, nextMode) => {
            if (!nextMode) return

            if (nextMode === 'season') {
              updateScope({
                mode: 'season',
                fromGameKey: null,
                toGameKey: null,
              })
              return
            }

            updateScope({
              mode: 'range',
              fromGameKey: fromGameKey || getGameKey(scopeGames[0]),
              toGameKey: toGameKey || getGameKey(scopeGames[scopeGames.length - 1]),
            })
          }}
          sx={sx.scopeSelect}
        >
          <Option value="season">כל השנה</Option>
          <Option value="range">ממשחק עד משחק</Option>
        </Select>

        {mode === 'range' ? (
          <>
            <Select
              size="sm"
              value={fromGameKey}
              placeholder="ממשחק"
              onChange={(event, nextValue) => {
                if (!nextValue) return

                updateScope({
                  mode: 'range',
                  fromGameKey: nextValue,
                })
              }}
              sx={sx.gameSelect}
            >
              {scopeGames.map((game) => {
                const key = getGameKey(game)

                const nextRangeCount = getRangeCount({
                  games: scopeGames,
                  fromGameKey: key,
                  toGameKey,
                })

                return (
                  <Option
                    key={key}
                    value={key}
                    disabled={!!toGameKey && nextRangeCount < MIN_SCOPE_GAMES}
                  >
                    {getGameLabel(game)}
                  </Option>
                )
              })}
            </Select>

            <Select
              size="sm"
              value={toGameKey}
              placeholder="עד משחק"
              onChange={(event, nextValue) => {
                if (!nextValue) return

                updateScope({
                  mode: 'range',
                  toGameKey: nextValue,
                })
              }}
              sx={sx.gameSelect}
            >
              {scopeGames.map((game) => {
                const key = getGameKey(game)

                const nextRangeCount = getRangeCount({
                  games: scopeGames,
                  fromGameKey,
                  toGameKey: key,
                })

                return (
                  <Option
                    key={key}
                    value={key}
                    disabled={!!fromGameKey && nextRangeCount < MIN_SCOPE_GAMES}
                  >
                    {getGameLabel(game)}
                  </Option>
                )
              })}
            </Select>
          </>
        ) : null}
      </Box>

      {isRangeTooSmall ? (
        <Typography level="body-xs" sx={sx.scopeWarning}>
          ניתן לבחור טווח של לפחות 5 משחקים.
        </Typography>
      ) : null}
    </Sheet>
  )
}
