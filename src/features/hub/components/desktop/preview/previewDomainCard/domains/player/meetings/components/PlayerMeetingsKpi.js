import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/playerMeetingsKpi.sx.js'

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

export default function PlayerMeetingsKpi({ entity, summary, filteredCount }) {
  const nextMeeting = summary?.nextMeeting || null
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
                מפגשי השחקן
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="סה״כ מפגשים"
            value={summary?.total ?? 0}
            icon={iconUi({ id: 'meetingDone', size: 'sm' })}
          />

          <KpiCard
            label="עתידיים"
            value={summary?.upcomingCount ?? 0}
            icon={iconUi({ id: 'meetingReminder', size: 'sm' })}
            subValue={nextMeeting ? `${nextMeeting.dateLabel}${nextMeeting.hourRaw ? ` • ${nextMeeting.hourRaw}` : ''}` : 'אין מפגש קרוב'}
          />

          <KpiCard
            label="עם וידאו"
            value={summary?.withVideo ?? 0}
            icon={iconUi({ id: 'video', size: 'sm' })}
          />

          <KpiCard
            label="עם הערות"
            value={summary?.withNotes ?? 0}
            icon={iconUi({ id: 'notes', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
