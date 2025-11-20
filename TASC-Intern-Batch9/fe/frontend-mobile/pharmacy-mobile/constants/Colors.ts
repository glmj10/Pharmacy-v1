export const Colors = {
  primary: '#00A86B', // Xanh lá - màu y tế
  primaryDark: '#008556',
  primaryLight: '#4FD1A0',
  secondary: '#FF6B6B',
  accent: '#4ECDC4',
  
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  border: '#E1E8ED',
  divider: '#ECF0F1',
  
  placeholder: '#95A5A6',
  disabled: '#BDC3C7',
  
  // Gradients
  gradientStart: '#00A86B',
  gradientEnd: '#4FD1A0',
  
  // Shadows
  shadow: '#000000',
};

export const LightTheme = {
  dark: false,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.error,
  },
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: Colors.primaryLight,
    background: '#1A1A1A',
    card: '#2C2C2C',
    text: '#FFFFFF',
    border: '#3C3C3C',
    notification: Colors.error,
  },
};
