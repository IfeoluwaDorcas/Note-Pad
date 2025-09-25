import type { Theme as NavTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

type Tokens = {
  colors: {
    bg: string;
    card: string;
    text: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
    border: string;
    placeholder: string;
  };
  fonts: {
    brand: string;
    heading: string;
    body: string;
  };
  radius: number;
  spacing: (n: number) => number;
};

export type AppTheme = {
  name: string;
  tokens: Tokens;
  nav: NavTheme;
};

const baseTokens = {
  fonts: {
    brand: 'GreatVibes_400Regular',
    heading: 'PlayfairDisplay_700Bold',
    body: 'Inter_400Regular',
  },
  radius: 16,
  spacing: (n: number) => n * 4,
};

const navFonts: NavTheme['fonts'] = Platform.select({
  default: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
    heavy: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
  },
});

export const allThemes: AppTheme[] = [
  {
    name: 'Rosewood Blush',
    tokens: {
      colors: {
        bg: '#f7dae7',
        card: '#e2b4c1',
        text: '#3a3a3a',
        textMuted: '#b77e93',
        accent: '#d3819d',
        accentMuted: '#a55166',
        border: '#d8aabe',
        placeholder: '#a0798e',
      },
      ...baseTokens,
    },
    nav: {
      dark: false,
      colors: {
        primary: '#d3819d',
        background: '#f7dae7',
        card: '#e2b4c1',
        text: '#3a3a3a',
        border: '#d8aabe',
        notification: '#a55166',
      },
      fonts: navFonts,
    },
  },
  {
    name: 'Rustic Cream',
    tokens: {
      colors: {
        bg: '#fff2df',
        card: '#ffe082',
        text: '#3e2522',
        textMuted: '#a88f81',
        accent: '#d3a376',
        accentMuted: '#8c6e63',
        border: '#c3b0a2',
        placeholder: '#a38c7b',
      },
      ...baseTokens,
    },
    nav: {
      dark: false,
      colors: {
        primary: '#d3a376',
        background: '#fff2df',
        card: '#ffe082',
        text: '#3e2522',
        border: '#c3b0a2',
        notification: '#8c6e63',
      },
      fonts: navFonts,
    },
  },
  {
    name: 'Moss Depth',
    tokens: {
      colors: {
        bg: '#0f2a1d',
        card: '#375534',
        text: '#e3eed4',
        textMuted: '#a3b9a2',
        accent: '#6b9071',
        accentMuted: '#aec380',
        border: '#738f6e',
        placeholder: '#a3bfa2',
      },
      ...baseTokens,
    },
    nav: {
      dark: false,
      colors: {
        primary: '#6b9071',
        background: '#0f2a1d',
        card: '#375534',
        text: '#e3eed4',
        border: '#738f6e',
        notification: '#aec380',
      },
      fonts: navFonts,
    },
  },
  {
    name: 'Midnight Fjord',
    tokens: {
      colors: {
        bg: '#0a1931',
        card: '#1a3d63',
        text: '#f6fafd',
        textMuted: '#92a6b8',
        accent: '#4a7fa7',
        accentMuted: '#b3cfe5',
        border: '#6289a8',
        placeholder: '#92a6b8',
      },
      ...baseTokens,
    },
    nav: {
      dark: false,
      colors: {
        primary: '#4a7fa7',
        background: '#0a1931',
        card: '#1a3d63',
        text: '#f6fafd',
        border: '#6289a8',
        notification: '#b3cfe5',
      },
      fonts: navFonts,
    },
  },
  {
  name: 'Sunbeam Yellow',
  tokens: {
    colors: {
      bg: '#fffbe6',
      card: '#fff0b3',
      text: '#3e3e00',
      textMuted: '#bfae6b',
      accent: '#fcd34d',
      accentMuted: '#ffeaa7',
      border: '#e2c044',
      placeholder: '#cabf84',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#fcd34d',
      background: '#fffbe6',
      card: '#fff0b3',
      text: '#3e3e00',
      border: '#e2c044',
      notification: '#ffeaa7',
    },
    fonts: navFonts,
  },
},
{
  name: 'Velvet Purple',
  tokens: {
    colors: {
      bg: '#f3e8ff',
      card: '#d8b4fe',
      text: '#2c1435',
      textMuted: '#a678af',
      accent: '#a855f7',
      accentMuted: '#dcd2f6',
      border: '#8b5cf6',
      placeholder: '#caa7dd',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#a855f7',
      background: '#f3e8ff',
      card: '#d8b4fe',
      text: '#2c1435',
      border: '#8b5cf6',
      notification: '#dcd2f6',
    },
    fonts: navFonts,
  },
},
{
  name: 'Clean White',
  tokens: {
    colors: {
      bg: '#ffffff',
      card: '#f4f4f4',
      text: '#1a1a1a',
      textMuted: '#888888',
      accent: '#d1d5db',
      accentMuted: '#e5e7eb',
      border: '#cccccc',
      placeholder: '#aaaaaa',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#d1d5db',
      background: '#ffffff',
      card: '#f4f4f4',
      text: '#1a1a1a',
      border: '#cccccc',
      notification: '#e5e7eb',
    },
    fonts: navFonts,
  },
},
{
  name: 'Mocha Brown',
  tokens: {
    colors: {
      bg: '#f6f0e8',
      card: '#c9a17d',
      text: '#3b2f2f',
      textMuted: '#947b64',
      accent: '#a9746e',
      accentMuted: '#b59a85',
      border: '#826e5d',
      placeholder: '#a38a77',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#a9746e',
      background: '#f6f0e8',
      card: '#c9a17d',
      text: '#3b2f2f',
      border: '#826e5d',
      notification: '#b59a85',
    },
    fonts: navFonts,
  },
},
{
  name: 'Deep Teal',
  tokens: {
    colors: {
      bg: '#e6f2f1',
      card: '#c2e4e3',
      text: '#003f3f',
      textMuted: '#669999',
      accent: '#2a9d8f',
      accentMuted: '#94d8c4',
      border: '#5cb1a1',
      placeholder: '#81c3ba',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#2a9d8f',
      background: '#e6f2f1',
      card: '#c2e4e3',
      text: '#003f3f',
      border: '#5cb1a1',
      notification: '#94d8c4',
    },
    fonts: navFonts,
  },
},
{
  name: 'Ice Blue',
  tokens: {
    colors: {
      bg: '#eaf7ff',
      card: '#d0e9f5',
      text: '#1d3b4f',
      textMuted: '#7a9cae',
      accent: '#94cfff',
      accentMuted: '#bde4f4',
      border: '#a3cde3',
      placeholder: '#8eb8ce',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#94cfff',
      background: '#eaf7ff',
      card: '#d0e9f5',
      text: '#1d3b4f',
      border: '#a3cde3',
      notification: '#bde4f4',
    },
    fonts: navFonts,
  },
},
{
  name: 'Sunset Orange',
  tokens: {
    colors: {
      bg: '#fff5ed',
      card: '#ffdcc0',
      text: '#4a2c1d',
      textMuted: '#cc7a52',
      accent: '#ff6b35',
      accentMuted: '#ffa16a',
      border: '#ff9b73',
      placeholder: '#d7865f',
    },
    ...baseTokens,
  },
  nav: {
    dark: false,
    colors: {
      primary: '#ff6b35',
      background: '#fff5ed',
      card: '#ffdcc0',
      text: '#4a2c1d',
      border: '#ff9b73',
      notification: '#ffa16a',
    },
    fonts: navFonts,
  },
},
];
