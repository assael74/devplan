// src/features/players/components/preview/PreviewDomainCard/domainRegistry.js

import InfoDomainSummary from './domains/player/info/InfoDomainSummary'
import InfoDomainModal from './domains/player/info/InfoDomainModal'
import PlayerMeetingsDomainSummary from './domains/player/meetings/PlayerMeetingsDomainSummary'
import PlayerMeetingsDomainModal from './domains/player/meetings/PlayerMeetingsDomainModal'
import PaymentsDomainSummary from './domains/player/payments/PaymentsDomainSummary'
import PaymentsDomainModal from './domains/player/payments/PaymentsDomainModal'
import PerformanceDomainSummary from './domains/player/performance/performanceDomainSummary.js'
import PerformanceDomainModal from './domains/player/performance/performanceDomainModal.js'
import PlayerAbilitiesDomainSummary from './domains/player/abilities/PlayerAbilitiesDomainSummary.js'
import PlayerAbilitiesDomainModal from './domains/player/abilities/PlayerAbilitiesDomainModal.js'
import PlayerVideosDomainSummary from './domains/player/videos/PlayerVideosDomainSummary.js'
import PlayerVideosDomainModal from './domains/player/videos/PlayerVideosDomainModal.js'

import TeamStaffDomainSummary from './domains/team/staff_trainings/TeamStaffDomainSummary'
import TeamStaffDomainModal from './domains/team/staff_trainings/TeamStaffDomainModal'
import TeamPlayersDomainSummary from './domains/team/players/TeamPlayersDomainSummary'
import TeamPlayersDomainModal from './domains/team/players/TeamPlayersDomainModal'
import TeamGamesDomainModal from './domains/team/games/TeamGamesDomainModal'
import TeamGamesDomainSummary from './domains/team/games/TeamGamesDomainSummary'
import TeamAbilitiesDomainModal from './domains/team/abilities/TeamAbilitiesDomainModal'
import TeamAbilitiesDomainSummary from './domains/team/abilities/TeamAbilitiesDomainSummary'
import TeamPerformanceDomainModal from './domains/team/performance/TeamPerformanceDomainModal'
import TeamPerformanceDomainSummary from './domains/team/performance/TeamPerformanceDomainSummary'
import TeamVideosDomainModal from './domains/team/videos/TeamVideosDomainModal'
import TeamVideosDomainSummary from './domains/team/videos/TeamVideosDomainSummary'

import ClubStaffDomainSummary from './domains/club/staff/ClubStaffDomainSummary'
import ClubStaffDomainModal from './domains/club/staff/ClubStaffDomainModal'
import ClubTeamsDomainSummary from './domains/club/teams/ClubTeamsDomainSummary'
import ClubTeamsDomainModal from './domains/club/teams/ClubTeamsDomainModal'
import ClubPlayersDomainSummary from './domains/club/players/ClubPlayersDomainSummary'
import ClubPlayersDomainModal from './domains/club/players/ClubPlayersDomainModal'

// Images (התאם נתיבים לפי מיקום התמונות אצלך)
import infoImg from '../../../../../ui/core/images/info.png'
import meetingsImg from '../../../../../ui/core/images/meetings.png'
import abilitiesImg from '../../../../../ui/core/images/abilities.png'
import performanceImg from '../../../../../ui/core/images/performance.png'
import paymentsImg from '../../../../../ui/core/images/payments.png'
import videoImg from '../../../../../ui/core/images/video2.png'
import playersImg from '../../../../../ui/core/images/players.png'
import staffImg from '../../../../../ui/core/images/staff.png'
import teamsImg from '../../../../../ui/core/images/teams.png'
import gamesImg from '../../../../../ui/core/images/games.png'

export const DOMAIN_REGISTRY = {
  // --- Player Domains ---
  player: {
    info: {
      key: 'info',
      image: infoImg,
      iconId: 'info',
      Summary: InfoDomainSummary,
      Modal: InfoDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    meetings: {
      key: 'meetings',
      image: meetingsImg,
      iconId: 'meetings',
      Summary: PlayerMeetingsDomainSummary,
      Modal: PlayerMeetingsDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    payments: {
      key: 'payments',
      image: paymentsImg,
      iconId: 'payments',
      Summary: PaymentsDomainSummary,
      Modal: PaymentsDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    performance: {
      key: 'performance',
      image: performanceImg,
      iconId: 'performance',
      Summary: PerformanceDomainSummary,
      Modal: PerformanceDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    abilities: {
      key: 'abilities',
      image: abilitiesImg,
      iconId: 'abilities',
      Summary: PlayerAbilitiesDomainSummary,
      Modal: PlayerAbilitiesDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    video: {
      key: 'video',
      image: videoImg,
      iconId: 'video',
      Summary: PlayerVideosDomainSummary,
      Modal: PlayerVideosDomainModal,
      container: 'modal',
      visualType: 'image',
    },
  },

  // --- Team Domains ---
  team: {
    roles: {
      key: 'roles',
      image: staffImg,
      iconId: 'staff',
      Summary: TeamStaffDomainSummary,
      Modal: TeamStaffDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    games: {
      key: 'games',
      image: gamesImg,
      iconId: 'games',
      Summary: TeamGamesDomainSummary,
      Modal: TeamGamesDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    players: {
      key: 'players',
      image: playersImg,
      iconId: 'players',
      Summary: TeamPlayersDomainSummary,
      Modal: TeamPlayersDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    performance: {
      key: 'performance',
      image: performanceImg,
      iconId: 'performance',
      Summary: TeamPerformanceDomainSummary,
      Modal: TeamPerformanceDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    video: {
      key: 'video',
      image: videoImg,
      iconId: 'video',
      Summary: TeamVideosDomainSummary,
      Modal: TeamVideosDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    abilities: {
      key: 'abilities',
      image: abilitiesImg,
      iconId: 'abilities',
      Summary: TeamAbilitiesDomainSummary,
      Modal: TeamAbilitiesDomainModal,
      container: 'modal',
      visualType: 'image',
    },
  },

  // --- Club Domains (מוכן להרחבה) ---
  club: {
    teams: {
      key: 'teams',
      image: teamsImg,
      iconId: 'teams',
      Summary: ClubTeamsDomainSummary,
      Modal: ClubTeamsDomainModal,
      container: 'modal',
      visualType: 'image',
    },

    roles: {
      key: 'staff',
      image: staffImg,
      iconId: 'staff',
      Summary: ClubStaffDomainSummary,
      Modal: ClubStaffDomainModal,
      container: 'Modal',
      visualType: 'image',
    },

    players: {
      key: 'players',
      image: playersImg,
      iconId: 'players',
      Summary: ClubPlayersDomainSummary,
      Modal: ClubPlayersDomainModal,
      container: 'modal',
      visualType: 'image',
    },
  },
}

export const getDomainDef = (entityKindOrKey, maybeKey) => {
  const has2Args = typeof maybeKey === 'string' && maybeKey
  const entityKind = has2Args ? entityKindOrKey : 'player'
  const key = has2Args ? maybeKey : entityKindOrKey
  return DOMAIN_REGISTRY?.[entityKind]?.[key] || null
}
