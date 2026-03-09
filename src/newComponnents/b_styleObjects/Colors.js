import { extendTheme } from '@mui/joy/styles';

export const typeBackground = {
  clubs: { bgc: '#c6e2ff', text: '#003366', softBg: '#ffe89f', darkBg: '#637da1' },
  teams: { bgc: '#c7c6ff', text: '#2b2b66', softBg: '#d3b873', darkBg: '#656495' },
  players: { bgc: '#bddecc', text: '#1e4835', softBg: '#f0f0f0', darkBg: '#5e8472' },
  scouting: { bgc: '#bddecc', text: '#1e4835', softBg: '#f0f0f0', darkBg: '#5e8472' },
  payments: { bgc: '#ffffb5', text: '#3a3a6e', softBg: '', darkBg: '#8c7e38' },
  meetings: { bgc: '#ffecb7', text: '#333333', softBg: '', darkBg: '#a67c00' },
  project: { bgc: '#00ff00', text: '#050505', softBg: '', darkBg: '#008000' },
  videos: { bgc: '#90caf9', text: '#0d47a1', softBg: '', darkBg: '#4a82aa' },
  games: { bgc: '#35e35b', text: '#000000', softBg: '', darkBg: '#1a7030' },
  statsParm: { bgc: '#c27ba0', text: '#fff', softBg: '', darkBg: '#613c53' },
  videoAnalysis: { bgc: '#a5d6a7', text: '#1b5e20', softBg: '', darkBg: '#547d56' },
  tags: { bgc: '#ffcc5c', text: '#fff', softBg: '', darkBg: '#000c1f' },
  gameStats: { bgc: '#9af1ad', text: '#000000', softBg: '', darkBg: '#4d8660' },
  abilities: { bgc: '#e0ac69', text: '#000000', softBg: '', darkBg: '#9c7849' },
  performance: { bgc: '#68ea84', text: '#333333', softBg: '', darkBg: '#4d8660' },
  roles: { bgc: '#e69138', text: '#333333', softBg: '', darkBg: '#e69138' },
  success: {
    main: { bgc: '#2e7d32', text: '#fff' },
    light: { bgc: '#81c784', text: '#fff' },
    dark: { bgc: '#1b5e20', text: '#fff' },
  },
  danger: {
    main: { bgc: '#d32f2f', text: '#ffffff' },
    light: { bgc: '#e57373', text: '#ffffff' },
    dark: { bgc: '#c62828', text: '#ffffff' },
  },
  warning: {
    main: { bgc: '#ed6c02', text: '#ffffff' },
    light: { bgc: '#ff9800', text: '#ffffff' },
    dark: { bgc: '#e65100', text: '#ffffff' },
  }
};

export const chipColorTheme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        teams: {
          solidColor: typeBackground['teams'].text,
          solidBg: typeBackground['teams'].bgc,
          plainColor: '#000',
          plainHoverBg: '#b6b5ee',
        },
        players: {
          solidColor: typeBackground['players'].text,
          solidBg: typeBackground['players'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        clubs: {
          solidColor: typeBackground['clubs'].text,
          solidBg: typeBackground['clubs'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        payments: {
          solidColor: typeBackground['payments'].text,
          solidBg: typeBackground['payments'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        meetings: {
          solidColor: typeBackground['meetings'].text,
          solidBg: typeBackground['meetings'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        videos: {
          solidColor: typeBackground['videos'].text,
          solidBg: typeBackground['videos'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        games: {
          solidColor: typeBackground['games'].text,
          solidBg: typeBackground['games'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
        gameStats: {
          solidColor: typeBackground['gameStats'].text,
          solidBg: typeBackground['gameStats'].bgc,
          plainColor: '#000',
          plainHoverBg: '#a8c8b8',
        },
      },
    },
  },
});
