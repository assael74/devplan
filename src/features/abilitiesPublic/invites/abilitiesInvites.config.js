export const ABILITIES_PUBLIC_INVITES_CONFIG = {
  mode: 'mock', // mock | live

  endpoints: {
    getByToken: '/api/public/abilities/invite',
    markOpened: '/api/public/abilities/invite/opened',
    submit: '/api/public/abilities/submit',
  },

  requestTimeoutMs: 12000,
}
