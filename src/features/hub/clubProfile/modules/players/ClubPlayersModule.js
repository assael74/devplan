// src/features/hub/clubProfile/modules/players/ClubPlayersModule.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, Table, Typography } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel'
import EmptyState from '../../../sharedProfile/EmptyState'

import { buildClubPlayerRows } from './clubPlayers.logic'
import { clubPlayersModuleSx as sx } from './players.sx'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ClubPlayerRow from './components/ClubPlayerRow'

import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

export default function ClubPlayersModule({ entity, context, onOpenPlayer }) {
  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')
  const [mode, setMode] = useState('key') // 'key' | 'all'

  const { rows, summary } = useMemo(
    () => buildClubPlayerRows({ club: entity, context, mode }),
    [entity, context, mode]
  )

  const title = mode === 'all' ? 'שחקנים' : 'שחקני מפתח'

  return (
    <Box sx={sx.root}>
      {/* KPI Row */}
      <Box sx={sx.kpiRow}>
        <Box sx={sx.kpiLeft}>
          <Chip startDecorator={iconUi({ id: 'players' })}>
            {title}: {summary.total}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'active' })} color="success" variant="soft">
            פעילים: {summary.active}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'notActive' })} color="danger" variant="soft">
            לא פעילים: {summary.nonActive}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'time' })} variant="soft">
            דקות: {summary.minutesTotal}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'ball' })} variant="soft">
            שערים: {summary.goalsTotal}
          </Chip>
          <Chip startDecorator={iconUi({ id: 'assist' })} variant="soft">
            בישולים: {summary.assistsTotal}
          </Chip>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          <Chip
            variant={mode === 'key' ? 'solid' : 'soft'}
            color={mode === 'key' ? 'primary' : 'neutral'}
            onClick={() => setMode('key')}
            sx={{ cursor: 'pointer' }}
          >
            שחקני מפתח
          </Chip>
          <Chip
            variant={mode === 'all' ? 'solid' : 'soft'}
            color={mode === 'all' ? 'primary' : 'neutral'}
            onClick={() => setMode('all')}
            sx={{ cursor: 'pointer' }}
          >
            הצג הכל
          </Chip>
        </Box>
      </Box>

      <SectionPanel title={title}>
        {rows.length === 0 ? (
          <EmptyState
            title={mode === 'key' ? 'אין שחקני מפתח' : 'אין שחקנים להצגה'}
            subtitle={mode === 'key' ? 'הגדר שחקני מפתח במועדון או בקבוצות' : 'בדוק נתונים/פילטרים'}
          />
        ) : (
          <Box sx={sx.tableWrap}>
            <Table stickyHeader hoverRow size="sm" sx={sx.table}>
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>שחקן</th>
                  <th style={{ width: '18%' }}>קבוצה</th>
                  <th style={{ width: '10%' }}>פוטנציאל</th>
                  <th style={{ width: '10%' }}>דקות</th>
                  <th style={{ width: '8%' }}>שערים</th>
                  <th style={{ width: '8%' }}>בישולים</th>
                  <th style={{ width: '14%' }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <ClubPlayerRow
                    key={r.id}
                    r={r}
                    sx={sx}
                    onOpenPlayer={onOpenPlayer}
                    onAvatarClick={(row) => {
                      setImgRow(row)
                      setRowPhoto(row.photo || '')
                      setOpenImg(true)
                    }}
                  />
                ))}
              </tbody>
            </Table>
          </Box>
        )}
      </SectionPanel>

      <Box sx={{ pt: 0.5 }}>
        <Typography level="body-xs" sx={{ opacity: 0.65 }}>
          מקור נתונים: {mode === 'key' ? 'club.keyPlayers' : 'context.playersList'}
        </Typography>
      </Box>

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="players"
        id={imgRow?.id}
        entityName={imgRow?.fullName}
        currentPhotoUrl={rowPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          const next = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          setRowPhoto(next)
          const idx = rows.findIndex((x) => x.id === imgRow?.id)
          if (idx !== -1) {
            rows[idx].photo = next
          }
        }}
      />

    </Box>
  )
}
