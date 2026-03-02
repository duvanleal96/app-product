// Sistema de diseño centralizado - Paleta Minimalista

export const gradients = {
  // Gradientes sutiles para fondos
  primary: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  secondary: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warm: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
  cool: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
  
  // Gradientes neutros para secciones
  lightGray: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
  lightBlue: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  lightMint: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  
  // Gradiente de fondo general - minimalista
  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
  
  // Gradientes sutiles para cards
  card: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
  cardHover: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
} as const;

export const colors = {
  primary: {
    main: '#1a1a1a',
    light: '#404040',
    dark: '#0a0a0a',
  },
  secondary: {
    main: '#737373',
    light: '#a3a3a3',
    dark: '#525252',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
} as const;

// Función helper para aplicar gradientes como style object
export const applyGradient = (gradient: keyof typeof gradients) => ({
  background: gradients[gradient],
});
