// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainModal.js
import React, { useMemo, useState } from 'react'
import { Box, Chip, Divider, Input, Option, Select, Sheet, Switch, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveClubPlayersDomain } from './clubPlayers.domain.logic'
import { modalSx } from './clubPlayers.sx'

export default function ClubPlayersDomainModal({ entity }) {
  const [q, setQ] = useState('')
  const [teamId, setTeamId] = useState('all')
  const [onlyManual, setOnlyManual] = useState(false)

  const { summary, rows, options } = useMemo(
    () => resolveClubPlayersDomain(entity, { q, teamId, onlyManual }),
    [entity, q, teamId, onlyManual]
  )

  if (!entity) {
    return (
      <Box sx={{ py: 2, px: 1, opacity: 0.8 }}>
        <Typography level="body-sm">טוען נתונים…</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Sheet variant="soft" sx={modalSx.kpiStrip}>
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'star', size: 'sm' })}>
          שחקני מפתח: {summary?.keyCount ?? 0}
        </Chip>
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'pin', size: 'sm' })}>
          ידני: {summary?.manualKeyCount ?? 0}
        </Chip>
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'chart', size: 'sm' })}>
          זכאות אוטומטית: {summary?.autoEligibleCount ?? 0}
        </Chip>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Sheet variant="soft" sx={modalSx.filters}>
        <Input
          size="sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש שחקן / קבוצה"
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
        />

        <Select size="sm" value={teamId} onChange={(e, v) => setTeamId(v ?? 'all')}>
          <Option value="all">כל הקבוצות</Option>
          {(options?.teamOptions || []).map((t) => (
            <Option key={t.id} value={t.id}>
              {t.name}
            </Option>
          ))}
        </Select>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography level="body-sm" sx={{ opacity: 0.85 }}>
            רק ידני
          </Typography>
          <Switch checked={onlyManual} onChange={(e) => setOnlyManual(e.target.checked)} />
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Sheet variant="soft" sx={modalSx.table}>
        <Box sx={{ ...modalSx.row, ...modalSx.headRow }}>
          <Typography level="title-xs">שחקן</Typography>
          <Typography level="title-xs">קבוצה</Typography>
          <Typography level="title-xs">סטטוס</Typography>
        </Box>

        {rows.length === 0 ? (
          <Box sx={{ py: 2, px: 1 }}>
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              אין שחקני מפתח להצגה.
            </Typography>
          </Box>
        ) : (
          rows.map((r) => (
            <Box key={r.id} sx={modalSx.row}>
              <Box sx={modalSx.nameCell}>
                {iconUi({ id: 'player', size: 'sm' })}
                <Typography level="body-sm" sx={modalSx.nameText}>
                  {r.name}
                </Typography>
              </Box>

              <Typography level="body-sm">{r.teamName || '—'}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {r.isKey ? (
                  <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'pin', size: 'sm' })}>
                    ידני
                  </Chip>
                ) : null}
                {r.isAutoEligible ? (
                  <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'chart', size: 'sm' })}>
                    אוטומטי
                  </Chip>
                ) : null}
              </Box>
            </Box>
          ))
        )}
      </Sheet>
    </Box>
  )
}
