// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceGames.js

import React from 'react'
import { Box, Chip, IconButton, Table, Tooltip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../shared/format/dateUtils.js'
import { typeLabelH } from '../../../../../../shared/games/games.labels.js'
import { formatPerformanceValue } from '../../../sharedLogic/performance/performance.metrics.logic.js'
import PerformanceMetrics from './PerformanceMetrics.js'
import { performanceSx as sx } from '../performance.sx.js'

export default function PerformanceGames({
  games,
  activeGame,
  onSelect,
  onEdit,
  metrics,
  editing = false,
}) {
  const handleRowKeyDown = (event, gameId) => {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onSelect(gameId)
  }

  return (
    <>
      <Box sx={{ ...sx.tableWrap, maxHeight: 265, overflowY: 'auto' }} className="dpScrollThin">
        <Table size="sm" stickyHeader sx={{ ...sx.table, ...sx.gameTable }} aria-label="משחקי השחקן לביצועים">
          <thead>
            <tr>
              <th style={{ width: '34%' }}>משחק</th>
              <th>סוג</th><th>דקות שחקן</th><th>דקות ניתוח</th><th>משך מלא</th><th>נתונים</th>
              <th style={{ width: 55 }}>עריכה</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <Box
                component="tr"
                key={game.id}
                sx={sx.gameRow(game.id === activeGame?.id)}
                tabIndex={0}
                aria-selected={game.id === activeGame?.id}
                onClick={() => onSelect(game.id)}
                onKeyDown={event => handleRowKeyDown(event, game.id)}
              >
                <td>
                  <Box sx={sx.gameIdentity}>
                    <Tooltip title={game.rival}>
                      <Typography component="span" noWrap sx={sx.gameName}>{game.rival}</Typography>
                    </Tooltip>
                    <Typography component="span" noWrap sx={sx.caption}>
                      {game.date ? getFullDateIl(game.date) : 'ללא תאריך'}
                      {typeof game.home === 'boolean' ? ` · ${game.home ? 'בית' : 'חוץ'}` : ''}
                    </Typography>
                  </Box>
                </td>
                <td><Chip size="sm" variant="soft" color={game.type === 'cup' ? 'warning' : 'neutral'}>{typeLabelH(game.type)}</Chip></td>
                <td>{formatPerformanceValue(game.timePlayed)}</td>
                <td>{formatPerformanceValue(game.videoMinutes)}</td>
                <td>{formatPerformanceValue(game.duration)}</td>
                <td><Chip size="sm" variant="soft" color={game.measured ? 'success' : 'neutral'}>{game.measured ? 'נמדד' : 'טרם הוזן'}</Chip></td>
                <td>
                  <Tooltip title={game.canEdit ? 'עריכת סטטיסטיקת המשחק' : 'פרטי המשחק חסרים; יש לבדוק בטאב המשחקים'}>
                    <IconButton
                      size="sm" variant="soft" sx={sx.gameEdit}
                      disabled={editing || !game.canEdit}
                      onClick={event => {
                        event.stopPropagation()
                        onEdit(game.game)
                      }}
                      aria-label={`עריכת סטטיסטיקה נגד ${game.rival}`}
                    >
                      {iconUi({ id: 'edit', size: 'sm' })}
                    </IconButton>
                  </Tooltip>
                </td>
              </Box>
            ))}
          </tbody>
        </Table>
      </Box>

      {activeGame ? (
        <Box sx={sx.section} role="region" aria-label="נתוני המשחק שנבחר">
          <Box sx={sx.sectionHeader}>
            <Box>
              <Typography sx={sx.sectionTitle}>{activeGame.rival}</Typography>
              <Typography sx={sx.caption}>
                {activeGame.date ? getFullDateIl(activeGame.date) : 'ללא תאריך'} · נתונים בפועל בזמן שנותח
              </Typography>
            </Box>
          </Box>
          {activeGame.measured ? <PerformanceMetrics metrics={metrics} game={activeGame} /> : (
            <Typography sx={sx.notice}>טרם נשמרה סטטיסטיקה למשחק הזה. אפשר להזין אותה דרך אייקון העריכה שבסוף שורת המשחק.</Typography>
          )}
        </Box>
      ) : null}
    </>
  )
}
