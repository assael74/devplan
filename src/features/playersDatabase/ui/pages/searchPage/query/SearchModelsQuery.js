// features/playersDatabase/ui/pages/searchPage/query/SearchModelsQuery.js

import { Box, Checkbox, Typography } from '@mui/joy'

import ScoutBadge from '../../../components/scout/ScoutBadge.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import ScoutProfileTooltip from '../../../components/scout/ScoutProfileTooltip.js'
import {
  SEARCH_SCOUT_PROFILES,
  SEARCH_TEAM_SCOUT_PRIORITIES,
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

    onToggle(
      option.isCombination ? 'scoutCombinations' : 'scoutProfiles',
      option.value
    )
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
        tooltip={option.isCombination
          ? option.tooltip
          : (
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

function TeamModelCard({ option, selected, onToggle }) {
  return (
    <SelectableModelCard
      selected={selected}
      description={option.description}
      onClick={() => onToggle('teamScoutPriorities', option.value)}
    >
      <ScoutBadge
        value={option.value}
        label={option.label}
        tooltip={option.tooltip || option.description}
        short={false}
        fontSize={11}
      />
    </SelectableModelCard>
  )
}

export default function SearchModelsQuery({ filters, onToggle }) {
  const isTeam = filters.searchContext === 'team'
  const isPlayer = filters.searchContext === 'player'
  const options = isTeam ? SEARCH_TEAM_SCOUT_PRIORITIES : SEARCH_SCOUT_PROFILES
  const selectedValues = isTeam
    ? filters.teamScoutPriorities || []
    : filters.scoutProfiles || []
  const selectedCombinations = filters.scoutCombinations || []
  const lockedProfileIds = new Set(
    SEARCH_SCOUT_PROFILES
      .filter(option => option.isCombination && selectedCombinations.includes(option.value))
      .flatMap(option => option.profileIds || [])
  )
  const title = isTeam ? 'ביצוע קבוצתי' : 'פרופילי סקאוט'

  return (
    <SearchQuerySection title={title} step='02'>
      {!isPlayer && !isTeam ? (
        <Box sx={sx.placeholder}>
          <Typography level='body-sm'>יש לבחור הקשר חיפוש</Typography>
        </Box>
      ) : (
        <Box sx={sx.grid}>
          {options.map(option => {
            const selected = isTeam
              ? selectedValues.includes(option.value)
              : option.isCombination
                ? selectedCombinations.includes(option.value)
                : selectedValues.includes(option.value) || lockedProfileIds.has(option.value)
            const locked = !isTeam && !option.isCombination && lockedProfileIds.has(option.value)

            return isTeam ? (
              <TeamModelCard
                key={option.value}
                option={option}
                selected={selected}
                onToggle={onToggle}
              />
            ) : (
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
