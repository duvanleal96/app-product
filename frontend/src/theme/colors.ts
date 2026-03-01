// Sistema de diseño centralizado - Colores y gradientes

export const gradients = {
  // Gradientes principales para fondos
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd876 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  cool: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  
  // Gradientes suaves para secciones
  lightPurple: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  lightBlue: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  lightPink: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  
  // Gradiente de fondo general
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffd876 100%)',
  
  // Gradientes para cards
  card: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #fff5fb 100%)',
  cardHover: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f093fb 100%)',
} as const;

export const colors = {
  primary: {
    main: '#667eea',
    light: '#8b9cf6',
    dark: '#4a5bcc',
  },
  secondary: {
    main: '#f093fb',
    light: '#f5b1ff',
    dark: '#d76ee6',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
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
