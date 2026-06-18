import React from 'react'
import {
  Box,
  Chip,
  Option,
  Select,
  Typography,
} from '@mui/joy'

export default function UsageFilters({
  features = [],
  selectedFeature = 'all',
  onFeatureChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm">
          Feature
        </Typography>

        <Select
          size="sm"
          variant="soft"
          value={selectedFeature}
          onChange={(_, value) => onFeatureChange?.(value || 'all')}
          sx={{ minWidth: 180 }}
        >
          {features.map(feature => (
            <Option key={feature.id} value={feature.id}>
              {feature.label}
            </Option>
          ))}
        </Select>
      </Box>

      {selectedFeature !== 'all' ? (
        <Chip
          size="sm"
          variant="soft"
          color="primary"
          onClick={() => onFeatureChange?.('all')}
        >
          מסנן פעיל: {selectedFeature}
        </Chip>
      ) : null}
    </Box>
  )
}
