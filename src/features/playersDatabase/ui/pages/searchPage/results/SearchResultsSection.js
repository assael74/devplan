// features/playersDatabase/ui/pages/searchPage/results/SearchResultsSection.js

import * as React from 'react'
import { Box, Card, CircularProgress, Typography } from '@mui/joy'

import DataTable from '../../../components/tables/DataTable.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'
import { buildSearchColumns } from '../logic/search.columns.js'
import SearchResultNotes from './SearchResultNotes.js'
import SearchResultRole from './SearchResultRole.js'
import SearchResultScoutProfiles from './SearchResultScoutProfiles.js'
import SearchResultTeamUrl from './SearchResultTeamUrl.js'
import { searchResultsSectionSx as sx } from './sx/searchResultsSection.sx.js'

const renderExpandedRow = ({ row, onNotesSave, onRoleEdit, onScoutProfileRemove, onTeamUrlEdit }) => {
  const isPlayer = row?.entityType !== 'birthTeamSeason'

  return (
    <Box sx={[
      sx.expandedDetails,
      !isPlayer && sx.expandedNotesOnly,
    ]}>
      {isPlayer ? (
        <Box sx={sx.expandedScoutProfiles}>
          <SearchResultScoutProfiles
            row={row}
            onRemove={onScoutProfileRemove}
          />
        </Box>
      ) : null}

      {isPlayer ? (
        <>
          <SearchResultNotes row={row} onSave={onNotesSave} />
          <SearchResultRole row={row} onEdit={onRoleEdit} />
        </>
      ) : (
        <SearchResultTeamUrl row={row} onEdit={onTeamUrlEdit} />
      )}
    </Box>
  )
}

export default function SearchResultsSection({
  rows = [],
  loading = false,
  error = null,
  entityType = 'player',
  onEntityOpen,
  onFavoriteToggle,
  onNotesSave,
  onRoleEdit,
  onScoutProfileRemove,
  onTeamUrlEdit,
}) {
  const columns = React.useMemo(() => buildSearchColumns({
    entityType,
    onFavoriteToggle: row => {
      Promise.resolve(onFavoriteToggle?.(row)).catch(() => {})
    },
  }), [entityType, onFavoriteToggle])
  const entityLabel = entityType === 'team' ? 'קבוצות' : 'שחקנים'
  const entityColors = getEntityColors(entityType)

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box sx={sx.headerIdentity}>
          <Box sx={sx.headerIcon(entityColors)}>
            {iconUi({ id: 'view', size: 'sm' })}
          </Box>

          <Box sx={sx.headerCopy}>
            <Typography level='title-lg' sx={sx.title}>
              תוצאות חיפוש
            </Typography>
            <Typography level='body-xs' sx={sx.subtitle}>
              המסמכים שנטענו לפי השאילתה האחרונה.
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.count(entityColors)}>
          {loading ? <CircularProgress size='sm' /> : `${rows.length} ${entityLabel}`}
        </Box>
      </Box>

      {error ? (
        <Box sx={sx.state}>
          <Typography color='danger'>טעינת המסמכים נכשלה.</Typography>
        </Box>
      ) : (
        <DataTable
          className='dpScrollThin'
          columns={columns}
          rows={rows}
          getRowKey={row => `${row.entityType}-${row.id}-${row.seasonKey}-${row.teamName}`}
          wrapSx={sx.tableWrap}
          tableSx={sx.table}
          defaultSort={{
            key: entityType === 'team' ? 'teamName' : 'playerName',
            direction: 'asc',
          }}
          renderExpandedRow={row => renderExpandedRow({
            row,
            onNotesSave,
            onRoleEdit,
            onScoutProfileRemove,
            onTeamUrlEdit,
          })}
        />
      )}
    </Card>
  )
}
