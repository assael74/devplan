// features/playersDatabase/ui/pages/searchPage/query/SearchModelsQuery.js

import * as React from 'react'
import {
  Box,
  Checkbox,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Button,
  Tooltip,
  Typography,
} from '@mui/joy'

import ScoutBadge from '../../../components/scout/ScoutBadge.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import ScoutProfileTooltip from '../../../components/scout/ScoutProfileTooltip.js'
import {
  SEARCH_SCOUT_PROFILES,
  SEARCH_TEAM_INTERPRETATION_LEVELS,
  SEARCH_TEAM_PERFORMANCE_TABS,
} from '../logic/search.constants.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchModelsQuerySx as sx } from './sx/searchModelsQuery.sx.js'


function SelectableModelCard({ selected, disabled = false, onClick, children, description }) {
  const handleClick = () => {
    if (disabled) return
    onClick()
  }

  return (
    <Box
      role='checkbox'
      tabIndex={disabled ? -1 : 0}
      aria-checked={selected}
      aria-disabled={disabled}
      sx={[sx.card, selected && sx.cardSelected, disabled && sx.cardDisabled]}
      onClick={handleClick}
      onKeyDown={event => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <Checkbox
        checked={selected}
        readOnly
        size='sm'
        variant={selected ? 'solid' : 'outlined'}
        sx={sx.checkbox}
        tabIndex={-1}
      />

      <Box sx={sx.cardContent}>
        {children}
        <Typography level='body-xs' sx={sx.description}>
          {description}
        </Typography>
      </Box>
    </Box>
  )
}

function PlayerModelCard({ option, selected, locked, onToggle }) {
  const handleToggle = () => {
    if (locked) return
    onToggle(option.isCombination ? 'scoutCombinations' : 'scoutProfiles', option.value)
  }

  return (
    <SelectableModelCard
      selected={selected}
      disabled={locked}
      description={option.description}
      onClick={handleToggle}
    >
      <ScoutProfileChip
        label={option.label}
        tooltip={option.isCombination ? option.tooltip : (
          <ScoutProfileTooltip
            profile={option.profile}
            fields={[
              'parameters',
              'group',
              'interest',
              'teamFilter',
              'positionContext',
              'positionDependency',
              'reviews',
            ]}
          />
        )}
        iconId={option.iconId}
        fontSize={11}
        variant={option.variant || 'default'}
      />
    </SelectableModelCard>
  )
}

function TeamInterpretationSide({ title, field, values, help, onToggle }) {
  return (
    <Box sx={sx.teamSideSection}>
      <Typography level='title-sm' sx={sx.teamSideTitle}>
        {title}
      </Typography>

      <Box sx={sx.levelsGrid}>
        {SEARCH_TEAM_INTERPRETATION_LEVELS.map(option => (
          <SelectableModelCard
            key={`${field}-${option.value}`}
            selected={values.includes(option.value)}
            description={option.summary}
            onClick={() => onToggle(field, option.value)}
          >
            <ScoutBadge
              value={option.tone}
              label={option.label}
              tooltip={option.description}
              fontSize={11}
            />
          </SelectableModelCard>
        ))}
      </Box>
    </Box>
  )
}

function TeamPerformanceTabs({ filters, onToggle, onReset }) {
  const hasSelections = SEARCH_TEAM_PERFORMANCE_TABS.some(option => (
    (filters[option.attackField] || []).length > 0 ||
    (filters[option.defenseField] || []).length > 0
  ))
  const [tab, setTab] = React.useState('performance')

  return (
    <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={sx.tabs}>
      <TabList sx={sx.tabList}>
        {SEARCH_TEAM_PERFORMANCE_TABS.map(option => (
          <Tooltip
            key={option.value}
            title={option.help}
            arrow

          >
            <Tab value={option.value} sx={sx.tab}>
              {option.label}
            </Tab>
          </Tooltip>
        ))}
      </TabList>

      {SEARCH_TEAM_PERFORMANCE_TABS.map(option => (
        <TabPanel key={option.value} value={option.value} sx={sx.tabPanel}>
          <Box sx={sx.teamSidesGrid}>
            <TeamInterpretationSide
              title='התקפה'
              field={option.attackField}
              values={filters[option.attackField] || []}
              onToggle={onToggle}
            />

            <TeamInterpretationSide
              title='הגנה'
              field={option.defenseField}
              values={filters[option.defenseField] || []}
              onToggle={onToggle}
            />
          </Box>
        </TabPanel>
      ))}

      <Button
        size='sm'
        variant='plain'
        color='neutral'
        sx={sx.resetButton}
        disabled={!hasSelections}
        onClick={onReset}
      >
        איפוס ביצוע קבוצתי
      </Button>
    </Tabs>
  )
}

export default function SearchModelsQuery({ filters, onToggle, onResetTeamPerformance }) {
  const isTeam = filters.searchContext === 'team'
  const isPlayer = filters.searchContext === 'player'
  const selectedCombinations = filters.scoutCombinations || []
  const lockedProfileIds = new Set(
    SEARCH_SCOUT_PROFILES
      .filter(option => option.isCombination && selectedCombinations.includes(option.value))
      .flatMap(option => option.profileIds || [])
  )
  const title = isTeam ? 'ביצוע קבוצתי' : 'פרופילי סקאוט'

  return (
    <SearchQuerySection
      title={title}
      step='02'
      contentSx={isTeam ? sx.teamContent : sx.playerContent}
    >
      {!isPlayer && !isTeam ? (
        <Box sx={sx.placeholder}>
          <Typography level='body-sm'>יש לבחור הקשר חיפוש</Typography>
        </Box>
      ) : isTeam ? (
        <TeamPerformanceTabs
          filters={filters}
          onToggle={onToggle}
          onReset={onResetTeamPerformance}
        />
      ) : (
        <Box sx={sx.grid}>
          {SEARCH_SCOUT_PROFILES.map(option => {
            const selected = option.isCombination
              ? selectedCombinations.includes(option.value)
              : filters.scoutProfiles.includes(option.value) || lockedProfileIds.has(option.value)
            const locked = !option.isCombination && lockedProfileIds.has(option.value)

            return (
              <PlayerModelCard
                key={option.value}
                option={option}
                selected={selected}
                locked={locked}
                onToggle={onToggle}
              />
            )
          })}
        </Box>
      )}
    </SearchQuerySection>
  )
}
