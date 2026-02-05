 export const emeraldPalette = {
   // PRIMARY: Emerald Green (Brand Identity)
   primary: {
     50: '#ecfdf5',   // Lightest mint
     100: '#d1fae5',
     200: '#a7f3d0',
     300: '#6ee7b7',
     400: '#34d399',  // Vibrant emerald
     500: '#10b981',  // Base emerald
     600: '#059669',  // Deep emerald
     700: '#047857',
     800: '#065f46',
     900: '#064e3b',  // Darkest emerald
   },
   
   // ACCENT: Complementary colors
   accent: {
     teal: '#14b8a6',
     mint: '#5eead4',
     sage: '#86efac',
   },
   
   // NEUTRAL: White + Emerald-tinted grays
   neutral: {
     0: '#ffffff',
     50: '#f0fdf4',   // Emerald tint
     100: '#dcfce7',
     200: '#bbf7d0',
     300: '#86efac',
     400: '#4ade80',
     500: '#6b7280',  // Standard gray
     600: '#4b5563',
     700: '#374151',
     800: '#1f2937',
     900: '#111827',
     950: '#030712',
   },
   
   // GLASSMORPHISM
   glass: {
     light: 'rgba(255, 255, 255, 0.7)',
     medium: 'rgba(255, 255, 255, 0.5)',
     dark: 'rgba(16, 185, 129, 0.1)',     // Emerald tint
     emerald: 'rgba(16, 185, 129, 0.15)',
   },
 };
 
 // HSL versions for Tailwind CSS compatibility
 export const emeraldHSL = {
   primary: {
     50: '152 81% 96%',
     100: '149 80% 90%',
     200: '152 76% 80%',
     300: '156 72% 67%',
     400: '158 64% 52%',
     500: '160 84% 39%',
     600: '161 94% 30%',
     700: '163 94% 24%',
     800: '163 88% 20%',
     900: '164 86% 16%',
   },
   accent: {
     teal: '173 80% 40%',
     mint: '172 80% 64%',
     sage: '142 77% 73%',
   },
 };
 
 export default emeraldPalette;