import crypto from 'crypto';

// Calculate deterministic seed
const projectName = "FHE2048";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "FHE2048Game.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');

// Based on seed, select design dimensions
const seedNum = parseInt(seed.substring(0, 8), 16);

export const designTokens = {
  system: "Glassmorphism",
  seed: seed,
  
  colors: {
    light: {
      primary: '#14B8A6',      // Teal
      secondary: '#10B981',    // Green
      accent: '#06B6D4',       // Cyan
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceGlass: 'rgba(248, 250, 252, 0.7)',
      text: '#0F172A',
      textSecondary: '#64748B',
      border: 'rgba(148, 163, 184, 0.2)',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    dark: {
      primary: '#2DD4BF',      // Teal bright
      secondary: '#34D399',    // Green bright
      accent: '#22D3EE',       // Cyan bright
      background: '#0F172A',
      surface: '#1E293B',
      surfaceGlass: 'rgba(30, 41, 59, 0.7)',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: 'rgba(148, 163, 184, 0.1)',
      success: '#34D399',
      error: '#F87171',
      warning: '#FBBF24',
    },
  },
  
  // 2048 game tile colors (Glassmorphic style with transparency)
  tileColors: {
    light: {
      0: 'rgba(255, 255, 255, 0.1)',
      2: 'rgba(20, 184, 166, 0.3)',     // Teal
      4: 'rgba(16, 185, 129, 0.4)',     // Green
      8: 'rgba(6, 182, 212, 0.5)',      // Cyan
      16: 'rgba(20, 184, 166, 0.6)',    // Teal stronger
      32: 'rgba(16, 185, 129, 0.7)',    // Green stronger
      64: 'rgba(6, 182, 212, 0.8)',     // Cyan stronger
      128: 'rgba(45, 212, 191, 0.85)',  // Bright teal
      256: 'rgba(52, 211, 153, 0.87)',  // Bright green
      512: 'rgba(34, 211, 238, 0.9)',   // Bright cyan
      1024: 'rgba(45, 212, 191, 0.93)', // Brightest teal
      2048: 'rgba(16, 185, 129, 0.95)', // Brightest green - WIN!
    },
    dark: {
      0: 'rgba(30, 41, 59, 0.3)',
      2: 'rgba(45, 212, 191, 0.3)',
      4: 'rgba(52, 211, 153, 0.4)',
      8: 'rgba(34, 211, 238, 0.5)',
      16: 'rgba(45, 212, 191, 0.6)',
      32: 'rgba(52, 211, 153, 0.7)',
      64: 'rgba(34, 211, 238, 0.8)',
      128: 'rgba(45, 212, 191, 0.85)',
      256: 'rgba(52, 211, 153, 0.87)',
      512: 'rgba(34, 211, 238, 0.9)',
      1024: 'rgba(45, 212, 191, 0.93)',
      2048: 'rgba(52, 211, 153, 0.95)',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    scale: 1.25,
    sizes: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit: 8px
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  backdropBlur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
  },
  
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  layout: 'grid', // 12-column responsive grid
  
  // Density variants for compact/comfortable modes
  density: {
    compact: {
      padding: {
        sm: '0.25rem 0.5rem',   // 4px 8px
        md: '0.5rem 1rem',      // 8px 16px
        lg: '0.75rem 1.5rem',   // 12px 24px
      },
      gap: '0.5rem',  // 8px
    },
    comfortable: {
      padding: {
        sm: '0.5rem 1rem',      // 8px 16px
        md: '1rem 1.5rem',      // 16px 24px
        lg: '1.25rem 2rem',     // 20px 32px
      },
      gap: '1rem',  // 16px
    },
  },
  
  breakpoints: {
    mobile: '0px',        // < 768px
    tablet: '768px',      // 768px - 1024px
    desktop: '1024px',    // > 1024px
  },
  
  // WCAG AA compliance
  accessibility: {
    minContrastRatio: {
      normal: 4.5,
      large: 3.0,
      ui: 3.0,
    },
    focusOutline: {
      width: '2px',
      offset: '2px',
      color: '#14B8A6',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;

