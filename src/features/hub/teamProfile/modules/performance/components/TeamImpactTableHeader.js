// src/features/teams/teamProfile/modules/performance/components/table/TeamImpactTableHeader.js
import React from 'react'
import { Typography } from '@mui/joy'

import { TRIPLET_GROUP_LABELS } from './performance.table.meta'
import { Th } from './performance.table.ui'

export default function TeamImpactTableHeader({ cols, sortKey, sortDir, onSort, sx }) {
  return (
    <>
      <tr>
        {(() => {
          const out = []
          let i = 0

          while (i < cols.length) {
            const c = cols[i]

            if (c.kind !== 'stat' || !c.group) {
              out.push(
                <Th
                  key={`g:${c.key}`}
                  col={c}
                  active={!!c.sortKey && sortKey === c.sortKey}
                  dir={sortDir}
                  onClick={c.sortKey ? () => onSort(c.sortKey) : undefined}
                  thInlineSx={sx?.thInline}
                  rowSpan={2}
                />
              )
              i += 1
              continue
            }

            const groupId = c.group
            let j = i
            while (j < cols.length && cols[j].kind === 'stat' && cols[j].group === groupId) j += 1
            const span = j - i
            const label = TRIPLET_GROUP_LABELS[groupId] || groupId

            out.push(
              <th
                key={`group:${groupId}:${i}`}
                colSpan={span}
                style={{ textAlign: 'center', verticalAlign: 'middle' }}
              >
                <Typography level="body-xs" sx={{ fontWeight: 900 }}>
                  {label}
                </Typography>
              </th>
            )

            i = j
          }

          return out
        })()}
      </tr>

      <tr>
        {cols
          .filter((c) => c.kind === 'stat' && !!c.group)
          .map((c) => (
            <Th
              key={c.key}
              col={c}
              active={!!c.sortKey && sortKey === c.sortKey}
              dir={sortDir}
              onClick={c.sortKey ? () => onSort(c.sortKey) : undefined}
              thInlineSx={sx?.thInline}
            />
          ))}
      </tr>
    </>
  )
}
