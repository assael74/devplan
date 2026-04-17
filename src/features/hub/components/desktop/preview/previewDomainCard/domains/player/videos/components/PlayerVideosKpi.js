// preview/previewDomainCard/domains/player/videos/components/PlayerVideosKpi.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { heroSx as sx } from '../sx/playerVideosKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography level='title-sm' sx={sx.kpiValueSx}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function PlayerVideosKpi({ entity, summary, filteredCount }) {
  const last2 = Array.isArray(summary?.last2MonthsAnalysis) ? summary.last2MonthsAnalysis : []
  const last2Label = last2.length ? last2.map((m) => `${m.label} ${m.count}`).join(' · ') : 'אין נתונים'
  const topTag = Array.isArray(summary?.topTagsAll) ? summary.topTagsAll[0] : null
  const topTagLabel = topTag   ? `${topTag?.tag?.tagName || topTag?.tag?.label || 'תג'} · ${topTag?.count || 0}` : 'אין תגים'
  const playerName =  `${entity?.playerFirstName} ${entity?.playerLastName}`.trim()

  const topCategory = summary?.topCategories[0] || null
  const topTopic = summary?.topTopics[0] || null

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
                {entity.playerFullName || 'שחקן'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                וידאו שחקן
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="חודשים פעילים"
            value={summary?.activeMonths ?? 0}
            subValue={`מתוך ${summary?.seasonMonths ?? 0} חודשי עונה`}
            icon={iconUi({ id: 'video', size: 'sm' })}
          />

          <KpiCard
            label="קצב עבודה"
            value={summary?.avgVideosPerActiveMonth ?? 0}
            subValue="ממוצע לחודש פעיל"
            icon={iconUi({ id: 'speed', size: 'sm' })}
          />

          <KpiCard
            label="קטגוריה מובילה"
            value={topCategory?.label || 'ללא תיוג'}
            subValue={topCategory ? `${topCategory.total} וידאו · ${topCategory.pct}%` : ''}
            icon={iconUi({ id: 'parents', size: 'sm' })}
          />

          <KpiCard
            label="נושא מוביל"
            value={topTopic?.label || 'ללא תיוג'}
            subValue={topTopic? `${topTopic.total} וידאו · ${topTopic.pct}%`: ''}
            icon={iconUi({ id: 'children', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
