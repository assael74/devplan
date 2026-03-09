// preview/previewDomainCard/domains/club/teams/ClubTeamsDomainModal.js
import React, { useMemo, useState } from 'react'
import { Box, Chip, Divider, Input, Option, Select, Sheet, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveClubTeamsDomain } from './clubTeams.domain.logic'
import { modalSx } from './clubTeams.sx'

export default function ClubTeamsDomainModal({ entity, onClose, isMobile }) {
  const [q, setQ] = useState('')
  const [year, setYear] = useState('all')
  const [active, setActive] = useState('all')
  const [project, setProject] = useState('all')

  const { summary, rows, options } = useMemo(
    () => resolveClubTeamsDomain(entity, { q, year, active, project }),
    [entity, q, year, active, project]
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
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'team', size: 'sm' })}>
          סה״כ קבוצות: {summary?.totalTeams ?? 0}
        </Chip>

        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'check', size: 'sm' })}>
          פעילות: {summary?.activeTeams ?? 0}
        </Chip>

        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'player', size: 'sm' })}>
          שחקנים: {summary?.totalPlayers ?? 0}
        </Chip>

        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'staff', size: 'sm' })}>
          צוות מועדון: {summary?.clubRoles ?? 0}
        </Chip>

        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'chart', size: 'sm' })}>
          רמה ממוצעת: {summary?.avgLevel ?? '—'}
        </Chip>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Sheet variant="soft" sx={modalSx.filters}>
        <Input
          size="sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש קבוצה / שנתון"
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
        />

        <Select size="sm" value={year} onChange={(e, v) => setYear(v ?? 'all')}>
          <Option value="all">כל השנתונים</Option>
          {(options?.yearOptions || []).map((y) => (
            <Option key={String(y)} value={String(y)}>
              שנתון {y}
            </Option>
          ))}
        </Select>

        <Select size="sm" value={active} onChange={(e, v) => setActive(v ?? 'all')}>
          <Option value="all">סטטוס</Option>
          <Option value="true">פעילה</Option>
          <Option value="false">לא פעילה</Option>
        </Select>

        <Select size="sm" value={project} onChange={(e, v) => setProject(v ?? 'all')}>
          <Option value="all">פרויקט</Option>
          <Option value="true">פרויקט</Option>
          <Option value="false">לא פרויקט</Option>
        </Select>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Sheet variant="soft" sx={modalSx.table}>
        <Box sx={{ ...modalSx.row, ...modalSx.headRow }}>
          <Typography level="title-xs">קבוצה</Typography>
          <Typography level="title-xs">שנתון</Typography>
          <Typography level="title-xs">שחקנים</Typography>
          <Typography level="title-xs">צוות</Typography>
          <Typography level="title-xs">רמה</Typography>
        </Box>

        {rows.length === 0 ? (
          <Box sx={{ py: 2, px: 1 }}>
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              אין תוצאות למסננים הנוכחיים.
            </Typography>
          </Box>
        ) : (
          rows.map((r) => (
            <Box key={r.id} sx={modalSx.row}>
              <Box sx={modalSx.nameCell}>
                {iconUi({ id: 'team', size: 'sm' })}
                <Typography level="body-sm" sx={modalSx.nameText}>
                  {r.name}
                </Typography>
                {r.isProject === true ? (
                  <Chip size="sm" variant="soft">
                    פרויקט
                  </Chip>
                ) : null}
                {r.active === false ? (
                  <Chip size="sm" variant="soft" color="neutral">
                    לא פעילה
                  </Chip>
                ) : null}
              </Box>

              <Typography level="body-sm">{r.year ?? '—'}</Typography>
              <Typography level="body-sm">{r.playersCount ?? 0}</Typography>
              <Typography level="body-sm">{r.rolesCount ?? 0}</Typography>
              <Typography level="body-sm">{r.levelAvg ?? '—'}</Typography>
            </Box>
          ))
        )}
      </Sheet>
    </Box>
  )
}
