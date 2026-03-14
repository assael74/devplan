import * as React from 'react';
import {
  Analytics,
  AttachMoney,
  BarChart,
  Calculate,
  CheckBox,
  Comment,
  DashboardCustomize,
  DateRange,
  ExpandLess,
  ExpandMore,
  Filter3,
  HowToVote,
  ImportExport,
  MenuBook,
  MoreVert,
  Photo,
  PlayCircle,
  PlaylistAddCircle,
  Print,
  Save,
  Sort,
  Upcoming,
} from '@mui/icons-material';

import { appIconMap as registryIconMap } from './registry';

const legacyOnlyIcons = {
  actionButton: <MoreVert />,
  analysis: <Analytics />,
  boolean: <CheckBox />,
  comments: <Comment />,
  day: <DateRange />,
  done: <Done />,
  expandLess: <ExpandLess />,
  expandMore: <ExpandMore />,
  generalParm: <BarChart />,
  incomeTab: <BarChart />,
  isDefault: <HowToVote />,
  moreStats: <PlaylistAddCircle />,
  number: <Calculate />,
  order: <Sort />,
  photo: <Photo />,
  print: <Print />,
  proMan: <Filter3 />,
  requestsTab: <AttachMoney />,
  saveStandart: <Save />,
  sort: <ImportExport />,
  star: <PlayCircle />,
  text: <MenuBook />,
  triplet: <Filter3 />,
};

const aliasIcons = {
  // תאימות לאחור לכתיב ישן / כפילויות מעבר
  paymentRequst: registryIconMap.paymentRequest ?? registryIconMap.paymentRequst,
  teamMeetting: registryIconMap.teamMeeting ?? registryIconMap.teamMeetting,
  upComing: registryIconMap.upComing,
};

export const appIconMap = {
  ...registryIconMap,
  ...legacyOnlyIcons,
  ...aliasIcons,
};

export function iconUi({ id, size = 'md', style = {}, sx = {} }) {
  const icon = appIconMap[id];

  if (!icon) return null;

  return React.cloneElement(icon, {
    fontSize: size,
    style,
    sx,
  });
}

export function getAppIconList() {
  return Object.keys(appIconMap).sort((a, b) => a.localeCompare(b));
}
