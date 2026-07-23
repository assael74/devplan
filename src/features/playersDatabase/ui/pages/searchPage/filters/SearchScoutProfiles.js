// features/playersDatabase/ui/pages/searchPage/filters/SearchScoutProfiles.js

import { Box, Option, Select, Typography } from '@mui/joy'

import {
  SEARCH_PROFILE_MATCH_MODES,
  SEARCH_SCOUT_PROFILES,
} from '../logic/search.constants.js'
import SearchFilterSection from './SearchFilterSection.js'
import { searchFiltersSx as sx } from '../sx/searchFilters.sx.js'

export default function SearchScoutProfiles({ filters, onUpdate, onToggle }) {
  return (
    <SearchFilterSection title='פרופילי סקאוט' description='ניתן לבחור פרופיל אחד או לבנות חפיפה.'>
      <Select
        size='sm'
        value={filters.profileMatchMode}
        onChange={(event, value) => onUpdate('profileMatchMode', value)}
      >
        {SEARCH_PROFILE_MATCH_MODES.map(option => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>

      <Box sx={sx.profileGrid}>
        {SEARCH_SCOUT_PROFILES.map(profile => {
          const selected = filters.scoutProfiles.includes(profile.value)

          return (
            <Box
              key={profile.value}
              role='button'
              tabIndex={0}
              sx={[sx.profileCard, selected && sx.profileCardSelected]}
              onClick={() => onToggle('scoutProfiles', profile.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') onToggle('scoutProfiles', profile.value)
              }}
            >
              <Typography level='title-sm' sx={sx.profileTitle}>{profile.label}</Typography>
              <Typography level='body-xs' sx={sx.profileDescription}>{profile.description}</Typography>
            </Box>
          )
        })}
      </Box>
    </SearchFilterSection>
  )
}
