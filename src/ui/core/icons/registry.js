import { actionIcons } from './core/actions.icons';
import { contactIcons } from './core/contact.icons';
import { generalIcons } from './core/general.icons';
import { navigationIcons } from './core/navigation.icons';
import { statusIcons } from './core/status.icons';

import { entitiesIcons } from './entities/entities.icons.js';
import { tasksIcons } from './entities/tasks.icons.js';
import { gameIcons } from './entities/games.icons';
import { meetingIcons } from './entities/meetings.icons';
import { paymentsIcons } from './entities/payments.icons';
import { playerIcons } from './entities/players.icons';
import { roleIcons } from './entities/roles.icons';
import { tagIcons } from './entities/tags.icons';
import { teamIcons } from './entities/teams.icons';
import { videoIcons } from './entities/video.icons';

import { performanceIcons } from './analytics/performance.icons';
import { statsIcons } from './analytics/stats.icons';

import { abilitiesIcon } from './abilities.Icons';

export const appIconMap = {
  ...actionIcons,
  ...contactIcons,
  ...generalIcons,
  ...navigationIcons,
  ...statusIcons,

  ...entitiesIcons,
  ...tasksIcons,
  ...gameIcons,
  ...meetingIcons,
  ...paymentsIcons,
  ...playerIcons,
  ...roleIcons,
  ...tagIcons,
  ...teamIcons,
  ...videoIcons,

  ...statsIcons,
  ...performanceIcons,
  ...abilitiesIcon,
};
