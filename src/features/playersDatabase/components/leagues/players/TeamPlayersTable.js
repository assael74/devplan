// features/playersDatabase/components/leagues/players/TeamPlayersTable.js

import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Option,
  Select,
  Sheet,
  Table,
  Tooltip,
} from '@mui/joy'
import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import { formatLtr, formatLtrNumber } from '../../../../../shared/format/direction.js'
import { playerIcons } from '../../../../../ui/core/icons/entities/players.icons.js'
import { clean } from '../../../sharedLogic/index.js'
import {
  CLEAR_POSITIONS,
  getPositionOptions,
  layerOptions,
} from './logic/teamPlayersPosition.logic.js'
import { formatLineupText } from './logic/teamPlayersRows.logic.js'
import { getScoutProfilesView } from './logic/teamPlayersScoutView.logic.js'
import { tableSx as sx } from './sx/table.sx.js'

export default function TeamPlayersTable({
  rows,
  teamCtx,
  loading,
  error,
  delMode,
  selected,
  selectedRowsCount,
  allChecked,
  colSpan,
  activeSearch,
  effectiveViewMode,
  activeProfileFilterId,
  savingPos,
  getDraftLayerValue,
  getDraftPositionValue,
  hasPositionDraft,
  onToggleAll,
  onToggleRow,
  onChangeLayer,
  onChangePosition,
  onSavePosition,
  onLoadFull,
}) {
  return (
    <Sheet variant="outlined" className="dpScrollThin" sx={sx.tableWrap}>
      <Table
        size="sm"
        stickyHeader
        className={delMode ? 'isDeleteMode' : ''}
        sx={sx.table}
      >
        <colgroup>
          {delMode ? <col style={{ width: 34 }} /> : null}
          <col style={{ width: 46 }} />
          <col style={{ width: 132 }} />
          <col style={{ width: 84 }} />
          <col style={{ width: 92 }} />
          <col style={{ width: 34 }} />
          <col style={{ width: 144 }} />
          <col style={{ width: 146 }} />
          <col style={{ width: 72 }} />
          <col style={{ width: 78 }} />
          <col style={{ width: 50 }} />
          <col style={{ width: 54 }} />
          <col style={{ width: 54 }} />
          <col style={{ width: 58 }} />
        </colgroup>

        <thead>
          <tr>
            {delMode ? (
              <th>
                <Checkbox
                  size="sm"
                  checked={allChecked}
                  indeterminate={Boolean(selectedRowsCount) && !allChecked}
                  onClick={event => event.stopPropagation()}
                  onChange={event => onToggleAll(event.target.checked)}
                />
              </th>
            ) : null}

            <th>מספר סידורי</th>
            <th>שם שחקן</th>
            <th>חוליה</th>
            <th>עמדה</th>
            <th />
            <th>קבוצה</th>
            <th>פרופילי סקאוט</th>
            <th>ודאות</th>
            <th>משחקים/הרכב</th>
            <th>שערים</th>
            <th>צהובים</th>
            <th>הוחלף</th>
            <th>דקות</th>
          </tr>
        </thead>

        <tbody>
          {error ? (
            <tr>
              <td colSpan={colSpan}>{error}</td>
            </tr>
          ) : !rows.length ? (
            <tr>
              <td colSpan={colSpan}>
                <Box sx={sx.emptyState}>
                  <Box sx={sx.emptyTitle}>
                    {loading
                      ? effectiveViewMode === 'profiles'
                        ? 'טוען שחקנים עם פרופיל'
                        : 'טוען שחקנים'
                      : activeProfileFilterId
                        ? 'אין שחקנים לפרופיל שנבחר'
                        : effectiveViewMode === 'profiles'
                          ? 'אין שחקנים עם פרופיל בקבוצה הזאת'
                          : 'אין שחקנים במאגר לקבוצה הזאת'}
                  </Box>

                  {!loading ? (
                    <Box sx={sx.emptySub}>
                      {activeProfileFilterId
                        ? 'בחר פרופיל אחר או חזור לכל הפרופילים.'
                        : effectiveViewMode === 'profiles'
                          ? 'אפשר לטעון סגל מלא כדי לראות את יתר שחקני הקבוצה.'
                          : 'לאחר טעינת סגל, השחקנים יוצגו כאן ויקושרו לקבוצה, לליגה ולעונה.'}
                    </Box>
                  ) : null}
                </Box>
              </td>
            </tr>
          ) : rows.map((row, index) => {
            const scoutView = getScoutProfilesView(row)
            const teamName = clean(
              row.sourceTeamName ||
                teamCtx.sourceTeamName ||
                row.teamName ||
                teamCtx.teamName ||
                row.clubName ||
                row.clubDisplayName ||
                teamCtx.clubName
            )

            return (
              <tr key={row.id}>
                {delMode ? (
                  <td>
                    <Checkbox
                      size="sm"
                      checked={Boolean(selected[row.id])}
                      onClick={event => event.stopPropagation()}
                      onChange={event => onToggleRow(row.id, event.target.checked)}
                    />
                  </td>
                ) : null}

                <td className="serialCell">
                  {formatLtrNumber(index + 1)}
                </td>

                <td>{clean(row.fullName || row.playerName) || '-'}</td>

                <td className="layerCell">
                  <Select
                    size="sm"
                    variant="plain"
                    value={getDraftLayerValue(row) || null}
                    placeholder="-"
                    sx={sx.layerSelect}
                    onClick={event => event.stopPropagation()}
                    onChange={(event, value) => {
                      event?.stopPropagation()
                      onChangeLayer(row, value)
                    }}
                  >
                    <Option value={CLEAR_POSITIONS}>
                      <Box sx={sx.layerOption}>
                        <Box sx={sx.layerIcon}>
                          <DeleteOutlineIcon fontSize="small" />
                        </Box>

                        <span>נקה עמדות</span>
                      </Box>
                    </Option>

                    {layerOptions.map(option => (
                      <Option key={option.id} value={option.id}>
                        <Box sx={sx.layerOption}>
                          <Box sx={sx.layerIcon}>{option.icon}</Box>
                          <span>{option.label}</span>
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </td>

                <td className="positionCell">
                  <Select
                    size="sm"
                    variant="plain"
                    value={getDraftPositionValue(row) || null}
                    placeholder="-"
                    disabled={!getDraftLayerValue(row)}
                    sx={sx.positionSelect}
                    onClick={event => event.stopPropagation()}
                    onChange={(event, value) => {
                      event?.stopPropagation()
                      onChangePosition(row, value)
                    }}
                  >
                    {getPositionOptions(getDraftLayerValue(row)).map(option => (
                      <Option key={option.code} value={option.code}>
                        <Box sx={sx.layerOption}>
                          <Box sx={sx.layerIcon}>
                            {playerIcons[option.code] || playerIcons.position}
                          </Box>

                          <span>{option.label}</span>
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </td>

                <td>
                  {hasPositionDraft(row) || savingPos[row.id] ? (
                    <IconButton
                      size="sm"
                      variant="soft"
                      color="success"
                      disabled={savingPos[row.id]}
                      aria-label="אשר עמדה"
                      onClick={event => {
                        event.stopPropagation()
                        onSavePosition(row)
                      }}
                      sx={sx.confirmButton}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </td>

                <td>{teamName || '-'}</td>

                <td>
                  <Tooltip title={scoutView.title} disableHoverListener={!scoutView.title}>
                    <Chip
                      size="sm"
                      color={scoutView.color}
                      variant={scoutView.variant}
                      sx={sx.scoutChip}
                    >
                      {scoutView.label}
                    </Chip>
                  </Tooltip>
                </td>

                <td>
                  <Tooltip
                    title={scoutView.reliabilityTitle}
                    disableHoverListener={!scoutView.reliabilityTitle}
                  >
                    <Chip
                      size="sm"
                      color={scoutView.reliabilityColor}
                      variant={scoutView.reliabilityLabel === '-' ? 'plain' : 'soft'}
                      sx={sx.reliabilityChip}
                    >
                      {scoutView.reliabilityLabel}
                    </Chip>
                  </Tooltip>
                </td>

                <td>{formatLtr(formatLineupText(row))}</td>
                <td>{formatLtrNumber(row.goals)}</td>
                <td>{formatLtrNumber(row.yellowCards)}</td>
                <td>{formatLtrNumber(row.subOut)}</td>
                <td>{formatLtrNumber(row.minutes)}</td>
              </tr>
            )
          })}

          {!activeSearch && effectiveViewMode !== 'full' ? (
            <tr>
              <td colSpan={colSpan}>
                <Box sx={sx.loadFullRow}>
                  <Box sx={sx.loadFullText}>
                    מוצגים כרגע שחקנים עם פרופיל בלבד.
                  </Box>

                  <Button
                    size="sm"
                    color="primary"
                    variant="soft"
                    disabled={loading}
                    onClick={event => {
                      event.stopPropagation()
                      onLoadFull()
                    }}
                  >
                    טען סגל מלא
                  </Button>
                </Box>
              </td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </Sheet>
  )
}
