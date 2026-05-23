// teamProfile/mobile/modules/players/components/toolbar/PlayersFiltersContent.js

import React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  Input,
  ListItemDecorator,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'
import SelectValue from './SelectValue.js'

const c = getEntityColors('players')

const safeArray = value => (Array.isArray(value) ? value : [])

function SelectOption({ item, fallbackIcon, color = 'primary' }) {
  return (
    <Option key={item.id} value={item.id}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <ListItemDecorator>
          {iconUi({ id: item.idIcon || fallbackIcon })}
        </ListItemDecorator>

        <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {item.label}
        </Typography>

        <Chip size="sm" variant="soft" color={item.color || color}>
          {item.count || 0}
        </Chip>
      </Box>
    </Option>
  )
}

export default function PlayersFiltersContent({
  summary,
  filters,
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeGeneralPositionKey,
  onChangePerformanceProfile,
}) {
  const squadRoleBuckets = safeArray(summary?.squadRoleBuckets)
  const projectStatusBuckets = safeArray(summary?.projectStatusBuckets)
  const positionCodeBuckets = safeArray(summary?.positionCodeBuckets)
  const generalPositionBuckets = safeArray(summary?.generalPositionBuckets)
  const performanceProfileBuckets = safeArray(summary?.performanceProfileBuckets)

  const selectedSquadRole = squadRoleBuckets.find(item => item?.id === filters?.squadRole)
  const selectedProjectStatus = projectStatusBuckets.find(item => item?.id === filters?.projectStatus)
  const selectedPositionCode = positionCodeBuckets.find(item => item?.id === filters?.positionCode)
  const selectedGeneralPosition = generalPositionBuckets.find(
    item => item?.id === filters?.generalPositionKey
  )
  const selectedPerformanceProfile = performanceProfileBuckets.find(
    item => item?.id === filters?.performanceProfile
  )

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>חיפוש</FormLabel>
          <Input
            value={filters?.search || ''}
            onChange={event => onChangeSearch(event.target.value)}
            startDecorator={iconUi({ id: 'search' })}
            placeholder="חיפוש לפי שם / שנתון / עמדה"
            size="sm"
            sx={{ width: '100%', minWidth: 0 }}
          />
        </FormControl>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>מעמד</FormLabel>
            <Select
              size="sm"
              value={filters?.squadRole || ''}
              onChange={(_, value) => onChangeSquadRole(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedSquadRole?.label || 'כל המעמדות'}
                  icon={selectedSquadRole?.idIcon || 'star'}
                  count={selectedSquadRole?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל המעמדות"
                  icon="star"
                  count={summary?.total ?? 0}
                />
              </Option>

              {squadRoleBuckets.map(item => (
                <SelectOption
                  key={item.id}
                  item={item}
                  fallbackIcon="star"
                  color="warning"
                />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>פרופיל תפקוד</FormLabel>
            <Select
              size="sm"
              value={filters?.performanceProfile || ''}
              onChange={(_, value) => onChangePerformanceProfile(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedPerformanceProfile?.label || 'כל פרופילי התפקוד'}
                  icon={selectedPerformanceProfile?.idIcon || 'insights'}
                  count={selectedPerformanceProfile?.count ?? summary?.total ?? 0}
                  color={selectedPerformanceProfile?.color}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל פרופילי התפקוד"
                  icon="insights"
                  count={summary?.total ?? 0}
                />
              </Option>

              {performanceProfileBuckets.map(item => (
                <SelectOption
                  key={item.id}
                  item={item}
                  fallbackIcon="insights"
                  color="primary"
                />
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סטטוס פרויקט</FormLabel>
            <Select
              size="sm"
              value={filters?.projectStatus || ''}
              onChange={(_, value) => onChangeProjectStatus(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedProjectStatus?.label || 'כל הסטטוסים'}
                  icon={selectedProjectStatus?.idIcon || 'project'}
                  count={selectedProjectStatus?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל הסטטוסים"
                  icon="project"
                  count={summary?.total ?? 0}
                />
              </Option>

              {projectStatusBuckets.map(item => (
                <SelectOption
                  key={item.id}
                  item={item}
                  fallbackIcon="project"
                  color="danger"
                />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>עמדה</FormLabel>
            <Select
              size="sm"
              value={filters?.positionCode || ''}
              onChange={(_, value) => onChangePositionCode(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedPositionCode?.label || 'כל העמדות'}
                  icon={selectedPositionCode?.idIcon || 'position'}
                  count={selectedPositionCode?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל העמדות"
                  icon="position"
                  count={summary?.total ?? 0}
                />
              </Option>

              {positionCodeBuckets.map(item => (
                <SelectOption
                  key={item.id}
                  item={item}
                  fallbackIcon="position"
                  color="primary"
                />
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>עמדה כללית</FormLabel>
            <Select
              size="sm"
              value={filters?.generalPositionKey || ''}
              onChange={(_, value) => onChangeGeneralPositionKey(value || '')}
              sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
              slotProps={{ listbox: { sx: { '--ListItemDecorator-size': '28px' } } }}
              renderValue={() => (
                <SelectValue
                  label={selectedGeneralPosition?.label || 'כל העמדות הכלליות'}
                  icon={selectedGeneralPosition?.idIcon || 'layers'}
                  count={selectedGeneralPosition?.count ?? summary?.total ?? 0}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל העמדות הכלליות"
                  icon="layers"
                  count={summary?.total ?? 0}
                />
              </Option>

              {generalPositionBuckets.map(item => (
                <SelectOption
                  key={item.id}
                  item={item}
                  fallbackIcon="layers"
                  color="primary"
                />
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>פעילות</FormLabel>
            <Chip
              size="md"
              variant={filters?.onlyActive ? 'solid' : 'outlined'}
              color={filters?.onlyActive ? 'success' : 'neutral'}
              onClick={onToggleOnlyActive}
              sx={{
                ...sx.filterChip,
                ...(filters?.onlyActive
                  ? {}
                  : {
                      bgcolor: c.bg,
                      color: c.text,
                    }),
              }}
              startDecorator={iconUi({ id: 'done' })}
            >
              פעילים בלבד ({summary?.active ?? 0})
            </Chip>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ pt: 1, px: 2 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          כל שינוי מוחל מיידית על רשימת שחקני הקבוצה
        </Typography>
      </Box>
    </Box>
  )
}
