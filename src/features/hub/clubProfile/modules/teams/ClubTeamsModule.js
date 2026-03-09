// clubProfile/modules/teams/ClubTeamsModule.js
import React, { useMemo, useState } from 'react'
import { Box, Chip, Typography, IconButton, Tooltip, Table } from '@mui/joy'
import EditRounded from '@mui/icons-material/EditRounded'
import ArrowDropUpRounded from '@mui/icons-material/ArrowDropUpRounded'
import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded'
import DragHandleRounded from '@mui/icons-material/DragHandleRounded'

import SectionPanel from '../../../sharedProfile/SectionPanel'
import EmptyState from '../../../sharedProfile/EmptyState'

import { buildClubTeamRows } from './clubTeams.logic'
import { useClubTeamsCrud } from './useClubTeamsCrud'
import ClubTeamEditModal from './components/ClubTeamEditModal'
import EntityActionsMenu from '../../../sharedProfile/EntityActionsMenu.js'
import { clubTeamsModuleSx as sx } from './teams.sx'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

const fmt = (v) => (v == null ? '—' : String(v))

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <ArrowDropUpRounded />
  if (trend === 'down') return <ArrowDropDownRounded />
  if (trend === 'flat') return <DragHandleRounded />
  return null
}

export default function ClubTeamsModule({ entity, context, onEntityChange }) {
  const { rows, summary } = useMemo(
    () => buildClubTeamRows({ club: entity, context }),
    [entity, context]
  )

  const crud = useClubTeamsCrud(entity, onEntityChange)

  // פילטרים (MVP): keyOnly, year, league, bucket
  const [keyOnly, setKeyOnly] = useState(false)

  const filtered = useMemo(() => {
    let out = rows
    if (keyOnly) out = out.filter((r) => (r.keyPlayersCount || 0) > 0)
    return out
  }, [rows, keyOnly])

  return (
    <Box sx={sx.root}>
      {/* KPI Row */}
      <Box sx={sx.kpiRow}>
        <Box sx={sx.kpiLeft}>
          <Chip startDecorator={iconUi({ id: 'team' })}>קבוצות: {summary.teamsTotal}</Chip>
          <Chip startDecorator={iconUi({ id: 'players' })}>שחקנים: {summary.playersTotal}</Chip>
          <Chip startDecorator={iconUi({ id: 'star' })} color="warning" variant="soft">
            שחקני מפתח: {summary.keyPlayersTotal}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'ball' })} variant="soft">
            שערים: {summary.gfTotal}–{summary.gaTotal}
          </Chip>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          <Chip
            variant={keyOnly ? 'solid' : 'soft'}
            color={keyOnly ? 'primary' : 'neutral'}
            onClick={() => setKeyOnly((v) => !v)}
            sx={{ cursor: 'pointer' }}
          >
            רק קבוצות עם שחקני מפתח
          </Chip>
        </Box>
      </Box>

      <SectionPanel title="קבוצות">
        {filtered.length === 0 ? (
          <EmptyState title="אין קבוצות להצגה" subtitle="בדוק פילטרים או שאין נתונים במועדון" />
        ) : (
          <Box sx={sx.tableWrap}>
            <Table
              stickyHeader
              hoverRow
              size="sm"
              sx={sx.table}
            >
              <thead>
                <tr>
                  <th style={{ width: '26%' }}>קבוצה</th>
                  <th style={{ width: '9%' }}>שחקנים</th>
                  <th style={{ width: '11%' }}>שחקני מפתח</th>
                  <th style={{ width: '18%' }}>ליגה</th>
                  <th style={{ width: '10%' }}>מיקום</th>
                  <th style={{ width: '12%' }}>שערים</th>
                  <th style={{ width: '6%' }}>מגמה</th>
                  <th style={{ width: '8%' }} />
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Box sx={{ display: 'grid', gap: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                          <Typography level="title-sm">{r.teamName}</Typography>
                          <Chip size="sm" variant="soft">{r.teamYear}</Chip>
                          <Chip size="sm" variant="soft" color={r.active ? 'success' : 'neutral'}>
                            {r.active ? 'פעיל' : 'לא פעיל'}
                          </Chip>
                        </Box>
                      </Box>
                    </td>

                    <td><Typography level="body-sm">{fmt(r.playersCount)}</Typography></td>
                    <td>
                      <Chip size="sm" variant="soft" color={(r.keyPlayersCount || 0) > 0 ? 'warning' : 'neutral'}>
                        {fmt(r.keyPlayersCount)}
                      </Chip>
                    </td>
                    <td><Typography level="body-sm">{fmt(r.leagueName)}</Typography></td>
                    <td><Typography level="body-sm">{fmt(r.leaguePosition)}</Typography></td>
                    <td><Typography level="body-sm">{fmt(r.goalsFor)}–{fmt(r.goalsAgainst)}</Typography></td>

                    <td>
                      <Tooltip title={r.trend === 'up' ? 'שיפור' : r.trend === 'down' ? 'החמרה' : r.trend === 'flat' ? 'יציב' : 'אין נתון'}>
                        <span>
                          <IconButton size="sm" variant="plain" disabled={r.trend === '—'}>
                            <TrendIcon trend={r.trend} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </td>

                    <td>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="עריכה">
                          <IconButton size="sm" onClick={() => crud.openEdit(r)}>
                            <EditRounded />
                          </IconButton>
                        </Tooltip>

                        <EntityActionsMenu
                          entityType="team"
                          entityId={r.id}
                          entityName={r.teamName}
                          metaCounts={r?.metaCounts || null}
                          disabled={false}
                        />
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        )}
      </SectionPanel>

      <ClubTeamEditModal
        open={crud.editOpen}
        row={crud.editRow}
        onClose={crud.closeEdit}
        onSave={crud.upsert}
      />
    </Box>
  )
}
