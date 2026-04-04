// src/ui/fields/index.js
// Single entry-point for reusable form fields (inputs/selects/date/check/auto).
// Keep this file “dumb”: only re-export defaults.

//// AutoUi
export { default as PlayersSelectorField } from './AutoUi/PlayersSelectorField'
export { default as TagSelectorField } from './AutoUi/TagSelectorField'

//// checkUi
// games
export { default as GameHomeSelector } from './checkUi/games/GameHomeSelector'
export { default as OnSquadSelector } from './checkUi/games/OnSquadSelector'
export { default as OnSquadStart } from './checkUi/games/OnSquadStart'

// meetings
export { default as MeetingStatusSelector } from './checkUi/meetings/MeetingStatusSelector'
export { default as MeetingTypeSelector } from './checkUi/meetings/MeetingTypeSelector'

// payments
export { default as PaymentStatusSelector } from './checkUi/payments/PaymentStatusSelector'
export { default as PaymentTypeSelector } from './checkUi/payments/PaymentTypeSelector'

// players
export { default as PlayerActiveSelector } from './checkUi/players/PlayerActiveSelector'
export { default as PlayerTypeSelector } from './checkUi/players/PlayerTypeSelector'

// teams
export { default as TeamActiveSelector } from './checkUi/teams/TeamActiveSelector'
export { default as TeamProjectSelector } from './checkUi/teams/TeamProjectSelector'

// generic
export { default as GenericCheckSelector } from './checkUi/GenericCheckSelector'

//// dateUi
export { default as DateInputField } from './dateUi/DateInputField'
export { default as MonthYearPicker } from './dateUi/MonthYearPicker'

//// inputUi
// clubs
export { default as ClubIfaLinkField } from './inputUi/clubs/ClubIfaLinkField'
export { default as ClubNameField } from './inputUi/clubs/ClubNameField'

// players
export { default as PlayerFirstNameField } from './inputUi/players/PlayerFirstNameField'
export { default as PlayerIfaLinkField } from './inputUi/players/PlayerIfaLinkField'
export { default as PlayerLastNameField } from './inputUi/players/PlayerLastNameField'
export { default as PlayerShortNameField } from './inputUi/players/PlayerShortNameField'

// teams
export { default as TeamIfaLinkField } from './inputUi/teams/TeamIfaLinkField'
export { default as TeamNameField } from './inputUi/teams/TeamNameField'

/// payments
export { default as PriceField } from './inputUi/payments/PriceField'

// videos
export { default as VideoCommentsField } from './inputUi/videos/VideoCommentsField'
export { default as VideoLinkField } from './inputUi/videos/VideoLinkField'
export { default as VideoNameField } from './inputUi/videos/VideoNameField'

// tags
export { default as TagNameField } from './inputUi/tags/TagNameField'

// generic (root)
//export { default as CoachEditField } from './inputUi/CoachEditField'
export { default as ColorPickerField } from './inputUi/ColorPickerField'
export { default as EmailField } from './inputUi/EmailField'
export { default as GenericInputField } from './inputUi/GenericInputField'
export { default as GenericTripleInputField } from './inputUi/GenericTripleInputField'
export { default as GoalsField } from './inputUi/GoalsField'
export { default as PhoneField } from './inputUi/PhoneField'
export { default as ProManEditField } from './inputUi/ProManEditField'
export { default as RoleFullNameField } from './inputUi/RoleFullNameField'

//// selectUi
// clubs
export { default as ClubSelectField } from './selectUi/clubs/ClubSelectField'

// games
export { default as GameDifficultySelectField } from './selectUi/games/GameDifficultySelectField'
export { default as GameDurationSelectField } from './selectUi/games/GameDurationSelectField'
export { default as GameSelectField } from './selectUi/games/GameSelectField'
export { default as GameTypeSelectField } from './selectUi/games/GameTypeSelectField'
export { default as GameViewGroupSelectField } from './selectUi/games/GameViewGroupSelectField'
export { default as GameViewMultiGroupSelectField } from './selectUi/games/GameViewMultiGroupSelectField'
export { default as GameViewTypeSelectField } from './selectUi/games/GameViewTypeSelectField'

// meetings
export { default as MeetingSelectField } from './selectUi/meetings/MeetingSelectField'
export { default as MeetingTypeSelectField } from './selectUi/meetings/MeetingTypeSelectField'

// players
export { default as PlayerPositionsSelect } from './selectUi/players/PlayerPositionsSelect'
export { default as PlayerPositionsSimpleSelect } from './selectUi/players/PlayerPositionsSimpleSelect'
export { default as PlayerSelectField } from './selectUi/players/PlayerSelectField'
export { default as SquadRoleSelectField } from './selectUi/players/SquadRoleSelectField'
export { default as ProjectStatusSelectField } from './selectUi/players/ProjectStatusSelectField'

// roles
export { default as RoleSelectField } from './selectUi/roles/RoleSelectField'
export { default as RoleTypeSelectField } from './selectUi/roles/RoleTypeSelectField'

// stats
export { default as StatsMultiParmTypeSelectField } from './selectUi/stats/StatsMultiParmTypeSelectField'
export { default as StatsParmTypeFieldSelectField } from './selectUi/stats/StatsParmTypeFieldSelectField'
export { default as StatsParmTypeSelectField } from './selectUi/stats/StatsParmTypeSelectField'

// teams
export { default as TeamSelectField } from './selectUi/teams/TeamSelectField'
