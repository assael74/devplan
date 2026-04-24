import React from 'react'
import {
  Badge,
  ElectricBolt,
  Hub,
  SportsSoccer,
  Star,
  Security,
  SportsHandball,
  RocketLaunch,
  Radar,
  Layers,
  Box,
} from '@mui/icons-material'

function PositionLetterIcon({ text, fontSize = 'md', sx = {} }) {
  const sizeMap = { sm: 16, md: 18, lg: 22 }
  const base = sizeMap[fontSize] || 18
  const len = String(text || '').length

  const px = len >= 3 ? base + 8 : base + 2
  const borderColor = sx?.color || '#64748B'

  return (
    <span
      style={{
        width: px,
        height: base,
        minWidth: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        backgroundColor: '#fff',
        color: '#111827',
        fontSize: len >= 3 ? base * 0.42 : base * 0.5,
        fontWeight: 800,
        letterSpacing: len >= 3 ? -0.4 : -0.2,
        lineHeight: 1,
        transform: 'translateY(1px)',
      }}
    >
      {text}
    </span>
  )
}

export const playerIcons = {
  level: <Star />,
  potential: <ElectricBolt />,
  position: <SportsSoccer />,
  positions: <SportsSoccer />,
  layers: <Layers />,
  shortName: <Badge />,

  defense: <Security />,
  midfield: <Radar />,
  dmMid: <Security />,
  atMidfield: <Hub />,
  attack: <RocketLaunch />,
  goalkeeper: <SportsHandball />,

  // Position codes
  GK: <PositionLetterIcon text="GK" />,
  S: <PositionLetterIcon text="S" />,
  AL: <PositionLetterIcon text="AL" />,
  AC: <PositionLetterIcon text="AC" />,
  AR: <PositionLetterIcon text="AR" />,
  MCL: <PositionLetterIcon text="MCL" />,
  MCR: <PositionLetterIcon text="MCR" />,
  DML: <PositionLetterIcon text="DML" />,
  DM: <PositionLetterIcon text="DM" />,
  DMR: <PositionLetterIcon text="DMR" />,
  DL: <PositionLetterIcon text="DL" />,
  DCL: <PositionLetterIcon text="DCL" />,
  DCR: <PositionLetterIcon text="DCR" />,
  DR: <PositionLetterIcon text="DR" />,
}
