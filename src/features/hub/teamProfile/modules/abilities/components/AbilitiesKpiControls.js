// teamProfile/modules/abilities/components/AbilitiesKpiControls.js
import React from 'react'
import { Box, Chip, Option, Select, Sheet, Tooltip } from '@mui/joy'

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

export default function AbilitiesKpiControls(props) {
  const { sx, slice, minUsedCount, setMinUsedCount } = props

  const lvl = slice?.level || {}
  const pot = slice?.levelPotential || {}

  const total = num(lvl.total)
  const used = num(lvl.usedCount)
  const usedPot = num(pot.usedCount)
  const coveragePct = total ? Math.round((used / total) * 100) : 0

  return (
    <Sheet variant="soft" sx={sx.kpiSheet}>
      <Box sx={sx.kpiGrid}>
        <Box sx={sx.kpiLeft}>
          <Chip size="sm">רמה: {lvl.avg ?? '—'}</Chip>
          <Chip size="sm">פוטנציאל: {pot.avg ?? '—'}</Chip>
          <Chip size="sm" variant="soft">
            כיסוי איכות: {coveragePct}%
          </Chip>
          <Tooltip title="על בסיס כמה שחקנים נקבעה רמת הקבוצה (usedCount)">
            <Chip size="sm" variant="soft">
              איכות נקבעה על בסיס {used}/{total}
            </Chip>
          </Tooltip>
          <Tooltip title="על בסיס כמה שחקנים נקבע הפוטנציאל (usedCount)">
            <Chip size="sm" variant="soft">
              פוטנציאל נקבע על בסיס {usedPot}/{total}
            </Chip>
          </Tooltip>
        </Box>

        <Box sx={sx.kpiRight}>
          <Tooltip title="סף מינימום כיסוי איכות (usedCount) להצגת תוצאות">
            <Select
              size="sm"
              value={String(minUsedCount)}
              onChange={(e, v) => setMinUsedCount(Number(v || 0))}
              sx={{ minWidth: 140 }}
            >
              <Option value="0">ללא סף</Option>
              <Option value="3">לפחות 3</Option>
              <Option value="5">לפחות 5</Option>
              <Option value="8">לפחות 8</Option>
              <Option value="11">לפחות 11</Option>
            </Select>
          </Tooltip>
        </Box>
      </Box>
    </Sheet>
  )
}
