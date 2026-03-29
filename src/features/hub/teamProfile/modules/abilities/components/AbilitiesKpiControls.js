// teamProfile/modules/abilities/components/AbilitiesKpiControls.js

import React from 'react'
import { Box, Chip, Option, Select, Sheet, Tooltip } from '@mui/joy'

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function AbilitiesKpiControls(props) {
  const { sx, slice, minUsedCount, setMinUsedCount } = props

  const level = slice?.level || {}
  const potential = slice?.levelPotential || {}

  const total = num(level?.total)
  const used = num(level?.usedCount)
  const usedPotential = num(potential?.usedCount)
  const coveragePct = total ? Math.round((used / total) * 100) : 0

  return (
    <Sheet variant="soft" sx={sx.kpiSheet}>
      <Box sx={sx.kpiGrid}>
        <Box sx={sx.kpiLeft}>
          <Chip size="sm">רמה: {level?.avg ?? '—'}</Chip>
          <Chip size="sm">פוטנציאל: {potential?.avg ?? '—'}</Chip>
          <Chip size="sm" variant="soft">
            כיסוי איכות: {coveragePct}%
          </Chip>

          <Tooltip title="על בסיס כמה שחקנים נקבעה רמת הקבוצה">
            <Chip size="sm" variant="soft">
              איכות נקבעה על בסיס {used}/{total}
            </Chip>
          </Tooltip>

          <Tooltip title="על בסיס כמה שחקנים נקבע הפוטנציאל">
            <Chip size="sm" variant="soft">
              פוטנציאל נקבע על בסיס {usedPotential}/{total}
            </Chip>
          </Tooltip>
        </Box>

        <Box sx={sx.kpiRight}>
          <Tooltip title="סף מינימום usedCount להצגת תוצאות">
            <Select
              size="sm"
              value={String(minUsedCount)}
              onChange={(e, value) => setMinUsedCount?.(Number(value || 0))}
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
