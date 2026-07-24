// features/playersDatabase/ui/pages/searchPage/query/SearchModelsQuery.js

import { Box, Checkbox, Typography } from '@mui/joy'

import ScoutBadge from '../../../components/scout/ScoutBadge.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import {
  SEARCH_SCOUT_PROFILES,
  SEARCH_TEAM_SCOUT_PRIORITIES,
} from '../logic/search.constants.js'
import SearchQuerySection from './SearchQuerySection.js'
import { searchModelsQuerySx as sx } from './sx/searchModelsQuery.sx.js'

function SelectableModelCard({ selected, onClick, children, description }) {
  return (
    <Box
      role='checkbox'
      tabIndex={0}
      aria-checked={selected}
      sx={[sx.card, selected && sx.cardSelected]}
      onClick={onClick}
      onKeyDown={event => {
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

function PlayerModelCard({ option, selected, onToggle }) {
  return (
    <SelectableModelCard
      selected={selected}
      description={option.description}
      onClick={() => onToggle('scoutProfiles', option.value)}
    >
      <ScoutProfileChip
        label={option.label}
        tooltip={option.description}
        iconId={option.iconId}
        fontSize={11}
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
        tooltip={option.description}
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
            const selected = selectedValues.includes(option.value)

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
                onToggle={onToggle}
              />
            )
          })}
        </Box>
      )}
    </SearchQuerySection>
  )
}
