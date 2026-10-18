import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#f97316FF',
    primaryColorHover: '#fb923cFF',
    primaryColorPressed: '#ea580cFF',
    primaryColorSuppl: '#fb923cFF',
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: { color: '#f1f5f9' },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#f97316FF',
    primaryColorHover: '#fb923cFF',
    primaryColorPressed: '#ea580cFF',
    primaryColorSuppl: '#fb923cFF',
  },

  Notification: {
    color: '#333333',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1e1e1e' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#1c1c1c',
    siderColor: '#232323',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#232323',
    borderColor: '#282828',
  },

  Table: {
    tdColor: '#232323',
    thColor: '#353535',
  },
};
