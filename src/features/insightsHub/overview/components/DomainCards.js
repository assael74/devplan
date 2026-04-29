// features/insightsHub/overview/components/DomainCards.js

import React from 'react'
import { Box, Card, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { domainSx as sx } from './sx/domain.sx'
import { DOMAIN_OPTIONS } from '../data/overview.domains.js'

function DomainCard({ item, active, onClick }) {
  return (
    <Card
      variant={active ? 'soft' : 'outlined'}
      onClick={item.disabled ? undefined : onClick}
      sx={sx.root(item, active)}
    >
      <Box sx={sx.wrapRoot}>
        <Box sx={sx.wrapIcon}>
          {iconUi({ id: item.iconId, size: 'md' })}
        </Box>

        <Chip size="sm" variant="soft" sx={{ bgcolor: item.color, border: '1px solid', borderColor: 'divider' }}>
          {item.disabled ? 'בהמשך' : active ? 'פעיל' : 'פתח'}
        </Chip>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.25 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {item.label}
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.secondary', lineHeight: 1.45 }}>
          {item.subtitle}
        </Typography>
      </Box>
    </Card>
  )
}

export default function DomainCards({
  activeDomain,
  onSelectDomain,
}) {
  const handleClick = (item) => {
    if (item.disabled) return

    if (activeDomain === item.id) {
      onSelectDomain('')
      return
    }

    onSelectDomain(item.id)
  }

  return (
    <Box sx={sx.grid}>
      {DOMAIN_OPTIONS.map((item) => (
        <DomainCard
          key={item.id}
          item={item}
          active={activeDomain === item.id}
          onClick={() => handleClick(item)}
        />
      ))}
    </Box>
  )
}
