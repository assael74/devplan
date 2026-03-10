// preview/previewDomainCard/domains/team/videos/components/TeamVideosKpi.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { heroSx as sx } from '../sx/teamVideosKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      {!!subValue && (
        <Typography sx={sx.kpiSubValueSx}>
          {subValue}
        </Typography>
      )}
    </Sheet>
  )
}

export default function TeamVideosKpi({ entity, summary, filteredCount }) {
  const last2 = Array.isArray(summary?.last2MonthsAnalysis) ? summary.last2MonthsAnalysis : []
  const last2Label = last2.length ? last2.map((m) => `${m.label} ${m.count}`).join(' · ') : 'אין נתונים'
  const topTag = Array.isArray(summary?.topTagsAll) ? summary.topTagsAll[0] : null
  const topTagLabel = topTag ? `${topTag?.tag?.tagName || topTag?.tag?.label || 'תג'} · ${topTag?.count || 0}` : 'אין תגים'
  //console.log(summary)
  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              {iconUi({ id: 'video', size: 'md', sx: { color: '#fff' } })}
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {entity?.name || entity?.teamName || 'קבוצה'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                וידאו הקבוצה
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="סה״כ וידאו"
            value={summary?.totalVideos ?? 0}
            subValue={`מתוך ${summary?.totalVideosAll ?? 0}`}
            icon={iconUi({ id: 'video', size: 'sm' })}
          />

          <KpiCard
            label="וידאו מתויג"
            value={summary?.taggedVideos ?? 0}
            subValue={`ללא תיוג ${summary?.untaggedVideos ?? 0}`}
            icon={iconUi({ id: 'tag', size: 'sm' })}
          />

          <KpiCard
            label="ניתוחים בחודשיים האחרונים"
            value={last2Label}
            icon={iconUi({ id: 'videoAnalysis', size: 'sm' })}
            subValue={`חודשים פעילים ${summary?.monthsCount ?? 0}`}
          />

          <KpiCard
            label="תג מוביל"
            value={topTagLabel}
            icon={iconUi({ id: 'tag', size: 'sm' })}
            subValue={`סה״כ תגים ${summary?.totalTags ?? 0}`}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
