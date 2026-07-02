// src/features/playersDatabase/components/scan/ScanProfileDetails.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { SCAN_SCOPE_LABELS } from './logic/constants.js'
import { getProfileBreakdownRows, getScanStatusColor, getScanStatusLabel } from './logic/profiles.logic.js'
import { scanDetailsSx as sx } from './sx/details.sx.js'

function ProfileStats({ row }) {
  return (
    <Box sx={sx.stats}>
      <Chip size="sm" variant="soft" color={getScanStatusColor(row.status)}>{getScanStatusLabel(row.status)}</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.leaguesCount || 0} ליגות</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.loadedTeamsCount || 0} קבוצות נטענו</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.loadedPlayersCount || 0} שחקנים נטענו</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.scoutProfilesCount || 0} פרופילים</Chip>
      <Chip size="sm" variant="soft" color={row.riskCount ? 'warning' : 'neutral'}>{row.riskCount || 0} בסיכון</Chip>
    </Box>
  )
}

function Fact({ label, value }) {
  return (
    <Box sx={sx.fact}>
      <Typography sx={sx.factLabel}>{label}</Typography>
      <Typography sx={sx.factValue}>{value || '-'}</Typography>
    </Box>
  )
}

export default function ScanProfileDetails({ profile, onOpen }) {
  if (!profile) return <Box className="dpScrollThin" sx={sx.root}><Typography level="body-sm">אין פרופיל נבחר.</Typography></Box>
  const children = profile.children || []
  const profileBreakdown = getProfileBreakdownRows(profile.profileCounts)

  return (
    <Box className="dpScrollThin" sx={sx.root}>
      <Typography level="title-lg" sx={sx.title}>{profile.title}</Typography>
      <Typography level="body-sm" sx={sx.meta}>{profile.subtitle || SCAN_SCOPE_LABELS[profile.scope]}</Typography>
      <Box sx={sx.statsWrap}><ProfileStats row={profile} /></Box>

      <Box sx={sx.facts}>
        <Fact label="ליגות" value={profile.leaguesCount} />
        <Fact label="קבוצות נטענו" value={`${profile.loadedTeamsCount || 0}/${profile.expectedTeamsCount || 0}`} />
        <Fact label="שחקנים נטענו" value={profile.loadedPlayersCount} />
        <Fact label="פרופילי סקאוט" value={profile.scoutProfilesCount} />
        <Fact label="בסיכון" value={profile.riskCount} />
        <Fact label="צילומים אחרונים" value={profile.snapshotsCount} />
        <Fact label="עדכון אחרון" value={profile.latestSnapshotAt} />
        <Fact label="סוג פרופיל" value={SCAN_SCOPE_LABELS[profile.scope]} />
      </Box>

      {profile.scope === 'league' ? <Button size="sm" color="primary" sx={sx.openButton} onClick={() => onOpen(profile)}>פתח בחירת פרופילים</Button> : null}

      {profileBreakdown.length ? (
        <Box sx={sx.children}>
          <Typography level="title-sm" sx={sx.title}>חלוקה לפי פרופיל</Typography>
          {profileBreakdown.map(item => <Box key={item.profileId} sx={sx.breakdownRow}><Typography level="body-sm" sx={sx.rowTitle}>{item.label}</Typography><Chip size="sm" variant="soft" color="neutral">{item.count} שחקנים</Chip></Box>)}
        </Box>
      ) : null}

      {children.length ? (
        <Box sx={sx.children}>
          <Typography level="title-sm" sx={sx.title}>פרופילים כלולים</Typography>
          {children.slice(0, 10).map(child => <Box key={child.id} sx={sx.childRow}><Typography level="body-sm" sx={sx.rowTitle}>{child.title}</Typography><Typography level="body-xs" sx={sx.meta}>{child.subtitle}</Typography></Box>)}
          {children.length > 10 ? <Typography level="body-xs" sx={sx.meta}>מציג 10 מתוך {children.length}</Typography> : null}
        </Box>
      ) : null}
    </Box>
  )
}
