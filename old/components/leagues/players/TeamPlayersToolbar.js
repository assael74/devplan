// features/playersDatabase/components/leagues/players/TeamPlayersToolbar.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
} from '@mui/joy'
import BarChartIcon from '@mui/icons-material/BarChart'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import UploadFileIcon from '@mui/icons-material/UploadFile'

import { formatLtrNumber } from '../../../../../shared/format/direction.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function TeamPlayersToolbar({
  viewLabel,
  fullRosterCount,
  profileRosterCount,
  statsRosterCount,
  visibleRowsCount,
  effectiveViewMode,
  fullRosterVisible,
  loading,
  deleting,
  delMode,
  selectedRowsCount,
  activeSearch,
  onShowProfilesOnly,
  onOpenImport,
  onOpenStats,
  onOpenDelete,
}) {
  return (
    <Box sx={sx.actionBar}>
      <Chip size="sm" color="primary" variant="soft" sx={sx.viewChip}>
        {viewLabel}
      </Chip>

      <Chip size="sm" color="neutral" variant="soft" sx={sx.viewChip}>
        {formatLtrNumber(fullRosterCount)} שחקנים
      </Chip>

      <Chip size="sm" color="success" variant="soft" sx={sx.viewChip}>
        {formatLtrNumber(profileRosterCount)} פרופילים
      </Chip>

      <Chip size="sm" color="neutral" variant="soft" sx={sx.viewChip}>
        {formatLtrNumber(statsRosterCount)} סטטס
      </Chip>

      {visibleRowsCount ? (
        <Chip size="sm" color="primary" variant="outlined" sx={sx.viewChip}>
          נטענו {formatLtrNumber(visibleRowsCount)}
          {effectiveViewMode === 'profiles' && fullRosterCount
            ? ` מתוך ${formatLtrNumber(fullRosterCount)}`
            : ''}
        </Chip>
      ) : null}

      {!activeSearch && fullRosterVisible ? (
        <Button
          size="sm"
          color="neutral"
          variant="soft"
          disabled={loading}
          onClick={onShowProfilesOnly}
        >
          פרופילים בלבד
        </Button>
      ) : null}

      <Box sx={sx.spacer} />

      <Button
        size="sm"
        color="primary"
        variant="soft"
        startDecorator={<UploadFileIcon fontSize="small" />}
        onClick={onOpenImport}
      >
        טען שחקנים
      </Button>

      <Button
        size="sm"
        color="neutral"
        variant="soft"
        disabled={!visibleRowsCount || loading}
        startDecorator={<BarChartIcon fontSize="small" />}
        onClick={onOpenStats}
      >
        טען סטטיסטיקה
      </Button>

      <Button
        size="sm"
        color="danger"
        variant="soft"
        disabled={!visibleRowsCount || loading || deleting || delMode}
        loading={deleting}
        startDecorator={<DeleteOutlineIcon fontSize="small" />}
        onClick={onOpenDelete}
      >
        {selectedRowsCount ? `מחק נבחרים (${selectedRowsCount})` : 'מחק שחקנים'}
      </Button>
    </Box>
  )
}
