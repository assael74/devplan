import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/playerPaymentsKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function PlayerPaymentsKpi({ entity, summary, filteredCount }) {
  const nextPayment = summary?.nextPayment || null
  const playerName =  `${entity?.playerFirstName} ${entity?.playerLastName}`.trim()
  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              <Avatar src={entity?.photo || playerImage} />
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {playerName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                תשלומי שחקן
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label='סה"כ תשלומים'
            value={summary?.total ?? 0}
            icon={iconUi({ id: 'payments', size: 'md' })}
          />

          <KpiCard
            label="שולמו"
            value={summary.doneCount || 0}
            icon={iconUi({ id: 'paymentRequst', size: 'md', sx: { color: '#6aa84f' } })}
          />

          <KpiCard
            label="פתוחים"
            value={summary.openCount || 0}
            icon={iconUi({ id: 'isNotPaid', size: 'md', sx: { color: '#f44336' } })}
          />

          <KpiCard
            label='סה"כ שולם'
            value={`${summary?.doneAmount ?? 0} ₪`}
            subValue={`ללא מע"מ ${summary?.doneAmountNoVat ?? 0} ₪`}
            icon={iconUi({ id: 'isInvoice', size: 'md', sx: { color: '#6aa84f' } })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
