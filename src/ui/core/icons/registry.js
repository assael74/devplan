import { navigationIcons } from './core/navigation.icons';
import { statusIcons } from './core/status.icons';
import { contactIcons } from './core/contact.icons';
import { actionIcons } from './core/actions.icons';
import { genralIcons } from './core/genral.icons';

import { playerIcons } from './entities/players.icons';
import { gameIcons } from './entities/games.icons';
import { teamIcons } from './entities/teams.icons';
import { meetingIcons } from './entities/meetings.icons';
import { paymentIcon } from './entities/payments.icons';
import { videoIcons } from './entities/video.icons';
import { tagIcons } from './entities/tags.icons';
import { entitiesIcons } from './entities/entities.icons.js'

import { statsIcons } from './analytics/stats.icons';
import { performanceIcons } from './analytics/performance.icons';

import { abilitiesIcon } from './abilities.Icons'

export const appIconMap = {
  ...navigationIcons,
  ...statusIcons,
  ...contactIcons,
  ...genralIcons,
  ...actionIcons,
  ...playerIcons,
  ...teamIcons,
  ...videoIcons,
  ...tagIcons,
  ...statsIcons,
  ...performanceIcons,
  ...abilitiesIcon,
  ...entitiesIcons,
  ...gameIcons,
  ...meetingIcons,
  ...paymentIcon
};
