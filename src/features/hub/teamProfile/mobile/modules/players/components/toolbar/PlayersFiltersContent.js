// teamProfile/mobile/modules/games/components/toolbar/GamesFiltersContent.js

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

export default function PlayersFiltersContent({
  summary,
  filters,
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeGeneralPositionKey,
}) {
  const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
  const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []
  const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets) ? summary.positionCodeBuckets : []
  const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets) ? summary.generalPositionBuckets : []

  const selectedSquadRole = squadRoleBuckets.find((item) => item?.id === filters?.squadRole)
  const selectedProjectStatus = projectStatusBuckets.find((item) => item?.id === filters?.projectStatus)
  const selectedPositionCode = positionCodeBuckets.find((item) => item?.id === filters?.positionCode)
  const selectedGeneralPosition = generalPositionBuckets.find(
    (item) => item?.id === filters?.generalPositionKey
  )

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>חיפוש</FormLabel>
          <Input
            value={filters?.search || ''}
            onChange={(e) => onChangeSearch(e.target.value)}
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

              {squadRoleBuckets.map((item) => (
                <Option key={item.id} value={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <ListItemDecorator>
                      {iconUi({ id: item.idIcon })}
                    </ListItemDecorator>

                    <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
                      {item.label}
                    </Typography>

                    <Chip size="sm" variant="soft" color="warning">
                      {item.count || 0}
                    </Chip>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

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

              {projectStatusBuckets.map((item) => (
                <Option key={item.id} value={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <ListItemDecorator>
                      {iconUi({
                        id: item.idIcon,
                        sx: { color: item.icCol || undefined },
                      })}
                    </ListItemDecorator>

                    <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
                      {item.label}
                    </Typography>

                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        flexShrink: 0,
                        bgcolor: item.color || undefined,
                        color: item.icCol || undefined,
                      }}
                    >
                      {item.count || 0}
                    </Chip>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
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

              {positionCodeBuckets.map((item) => (
                <Option key={item.id} value={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <ListItemDecorator>
                      {iconUi({ id: item.idIcon || 'position' })}
                    </ListItemDecorator>

                    <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
                      {item.label}
                    </Typography>

                    <Chip size="sm" variant="soft" color="primary">
                      {item.count || 0}
                    </Chip>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

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

              {generalPositionBuckets.map((item) => (
                <Option key={item.id} value={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <ListItemDecorator>
                      {iconUi({ id: item.idIcon || 'layers' })}
                    </ListItemDecorator>

                    <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
                      {item.label}
                    </Typography>

                    <Chip size="sm" variant="soft" color="primary">
                      {item.count || 0}
                    </Chip>
                  </Box>
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
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
