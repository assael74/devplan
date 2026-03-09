import * as React from 'react';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TimelineIcon from '@mui/icons-material/Timeline';

import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';

import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SportsMmaIcon from '@mui/icons-material/SportsMma';

import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SchoolIcon from '@mui/icons-material/School';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import GroupIcon from '@mui/icons-material/Group';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ForumIcon from '@mui/icons-material/Forum';

import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import ChildCareIcon from '@mui/icons-material/ChildCare';

export const abilitiesIcon = {
  // קטגוריה
  physical: <FitnessCenterIcon />,
  technical: <SportsSoccerIcon />,
  gameUnderstanding: <VisibilityIcon />,
  mental: <PsychologyIcon />,
  cognitive: <PsychologyIcon />,
  development: <TimelineIcon />,

  // פיזי
  agility: <BoltIcon />,
  speed: <DirectionsRunIcon />,
  coordination: <CenterFocusStrongIcon />,
  endurance: <FavoriteIcon />,
  explosiveness: <FlashOnIcon />,

  // טכני
  ballComfort: <PanToolAltIcon />,
  firstTouch: <TouchAppIcon />,
  passingSkill: <SwapHorizIcon />,
  dribbleConfidence: <SportsMmaIcon />,
  ballStriking: <SportsSoccerIcon />,

  // הבנת משחק
  spatialAwareness: <ThreeSixtyIcon />,
  vision: <VisibilityIcon />,
  basicPositioning: <PlaceIcon />,
  offBallMovement: <DirectionsWalkIcon />,

  // מנטלי וחברתי
  effort: <BatteryChargingFullIcon />,
  coachability: <SchoolIcon />,
  emotionalControl: <SelfImprovementIcon />,
  teamPlay: <GroupIcon />,
  confidenceLevel: <ThumbUpIcon />,
  aggressiveness: <WhatshotIcon />,
  communication: <ForumIcon />,

  // קוגניטיבי
  decisionSpeed: <SpeedIcon />,
  learningCurve: <TrendingUpIcon />,
  adaptability: <AutorenewIcon />,

  // שלב התפתחות
  growthStage: <ChildCareIcon />,
};
