// ui/patterns/insights/ui/Takeaway.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import Accordion from '@mui/joy/Accordion'
import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionGroup from '@mui/joy/AccordionGroup'
import AccordionSummary from '@mui/joy/AccordionSummary'

import { iconUi } from '../../../core/icons/iconUi.js'

import MenuInfo from './MenuInfo.js'
import { takeawaySx as sx } from './sx/takeaway.sx.js'

import {
  buildMenuItems,
  getDetailItems,
  normalizeTone,
} from '../utils/index.js'

export default function Takeaway({
  item,
  items = [],
  details = null,
  icon = 'insights',
  value,
  withMenu = false,
  emptyText = 'אין תובנה זמינה כרגע.',
}) {
  if (!item) return null

  const color = normalizeTone(item?.tone)

  const detailItems = Array.isArray(details)
    ? details.filter(Boolean)
    : getDetailItems(items, item)

  const menuItems = withMenu
    ? buildMenuItems(items, item)
    : []

  const hasDetails = detailItems.length > 0
  const hasMenu = withMenu && menuItems.length > 0

  return (
    <AccordionGroup variant="plain" sx={sx.group}>
      <Accordion>
        <AccordionSummary>
          <Box sx={sx.box}>
            <Box sx={sx.head}>
              <Box sx={sx.titleWrap}>
                <Box sx={sx.mark(color)} />

                <Typography level="body-sm" sx={sx.title}>
                  {item?.actionLabel || item?.label || 'תובנה'}
                </Typography>
              </Box>

              <Chip
                size="sm"
                variant="soft"
                color={color}
                startDecorator={iconUi({ id: icon, size: 'sm' })}
                sx={sx.chip}
              >
                {value || item?.value || item?.label || '—'}
              </Chip>
            </Box>

            <Typography level="body-xs" sx={sx.text}>
              {item?.text || emptyText}
            </Typography>
          </Box>
        </AccordionSummary>

        {hasDetails || hasMenu ? (
          <AccordionDetails>
            <Box sx={sx.details}>
              {detailItems.map((detail) => (
                <Box key={detail.id || detail.label} sx={sx.detail}>
                  <Typography level="body-sm" sx={sx.detailLabel}>
                    {detail.label}
                  </Typography>

                  <Typography level="body-xs" sx={sx.detailText}>
                    {detail.text}
                  </Typography>
                </Box>
              ))}

              {hasMenu ? (
                <MenuInfo
                  items={menuItems}
                  color={color}
                />
              ) : null}
            </Box>
          </AccordionDetails>
        ) : null}
      </Accordion>
    </AccordionGroup>
  )
}
