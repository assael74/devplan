// src/features/playersDatabase/ui/components/scout/ScoutStoryModal.js

import * as React from 'react'
import {
  Box,
  Divider,
  Typography,
} from '@mui/joy'

import RegularModal from '../modals/RegularModal.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ScoutReliability from './ScoutReliability.js'
import { scoutStoryModalSx as sx } from './sx/scoutStoryModal.sx.js'

export function ScoutStorySection({
  title,
  description = '',
  iconId,
  children,
  emphasis = false,
}) {
  if (!children) return null

  return (
    <Box sx={sx.section({ emphasis })}>
      <Box sx={sx.sectionHeader}>
        {iconId ? (
          <Box sx={sx.sectionIcon}>
            {iconUi({
              id: iconId,
              size: 'sm',
            })}
          </Box>
        ) : null}

        <Box sx={sx.sectionHeading}>
          <Typography
            level='title-sm'
            sx={sx.sectionTitle}
          >
            {title}
          </Typography>

          {description ? (
            <Typography
              level='body-xs'
              sx={sx.sectionDescription}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={sx.sectionContent}>
        {children}
      </Box>
    </Box>
  )
}

export function ScoutStoryText({ children }) {
  if (!children) return null

  return (
    <Typography
      level='body-sm'
      sx={sx.storyText}
    >
      {children}
    </Typography>
  )
}

export function ScoutStoryMetrics({ items = [] }) {
  const safeItems = Array.isArray(items)
    ? items.filter(item => item && item.label)
    : []

  if (!safeItems.length) return null

  return (
    <Box sx={sx.metricsGrid}>
      {safeItems.map((item, index) => (
        <Box
          key={item.id || `${item.label}-${index}`}
          sx={sx.metricItem}
        >
          <Typography
            level='body-xs'
            sx={sx.metricLabel}
          >
            {item.label}
          </Typography>

          <Typography
            level='title-sm'
            sx={sx.metricValue}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export function ScoutStoryList({ items = [] }) {
  const safeItems = Array.isArray(items)
    ? items.filter(Boolean)
    : []

  if (!safeItems.length) return null

  return (
    <Box sx={sx.list}>
      {safeItems.map((item, index) => (
        <Box
          key={item.id || item.label || index}
          sx={sx.listItem}
        >
          <Box
            component='span'
            sx={sx.listMarker}
          />

          <Typography
            level='body-sm'
            sx={sx.listText}
          >
            {item.label || item}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default function ScoutStoryModal({
  open,
  onClose,
  profileLabel = 'פרופיל סקאוט',
  profileDescription = '',
  profileIconId = 'performanceProfile',
  reliability,
  children,
}) {
  return (
    <RegularModal
      open={open}
      title='סיפור סקאוט'
      description='פירוט האיתות, ההקשר והאמינות של פרופיל השחקן.'
      iconId='performanceProfile'
      size='md'
      hideFooter
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <Box sx={sx.profileHeader}>
          <Box sx={sx.profileIcon}>
            {iconUi({
              id: profileIconId,
              size: 'md',
            })}
          </Box>

          <Box sx={sx.profileHeading}>
            <Typography
              level='h3'
              sx={sx.profileTitle}
            >
              {profileLabel}
            </Typography>

            {profileDescription ? (
              <Typography
                level='body-sm'
                sx={sx.profileDescription}
              >
                {profileDescription}
              </Typography>
            ) : null}
          </Box>

          {reliability ? (
            <ScoutReliability
              level={reliability.level}
              score={reliability.score}
              label={reliability.label}
            />
          ) : null}
        </Box>

        <Divider sx={sx.divider} />

        <Box sx={sx.sections}>
          {children}
        </Box>
      </Box>
    </RegularModal>
  )
}
