// Paleta de colores principal
export const colors = {
  primary: {
    main: '#8b4513',
    hover: '#723a0f',
    light: '#c4a484',
    dark: '#2c1810',
    text: '#5c392c',
  },
  secondary: {
    main: '#6b46c1',
    hover: '#553c9a',
    light: '#9f7aea',
    dark: '#44337a',
  },
  background: {
    main: '#f4e9de',
    card: 'white/95',
    overlay: '#2c1810/40',
    pattern: 'url("/paper-texture.png")',
  },
  state: {
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
      text: 'white',
    },
    warning: {
      main: '#eab308',
      light: '#facc15',
      dark: '#ca8a04',
      text: 'white',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
      text: 'white',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      text: 'white',
    },
  },
  text: {
    primary: '#2c1810',
    secondary: '#5c392c',
    disabled: '#9ca3af',
    inverse: 'white',
  },
};

// Estilos de componentes
export const styles = {
  // Contenedores
  layout: {
    page: "min-h-screen bg-[#f4e9de] bg-paper-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden",
    header: "w-full px-6 py-4 flex items-center justify-between backdrop-blur-sm bg-white/80 border-b border-[#8b4513]/20",
    main: "container mx-auto px-4 py-6 flex flex-col gap-6",
  },
  
  // Componentes base
  card: {
    base: "relative overflow-hidden",
    sizes: {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    variants: {
      primary: "bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#8b4513]/20",
      game: "bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-[#8b4513]/10",
      glass: "bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20",
    },
  },
  
  button: {
    base: "relative overflow-hidden transition-all duration-300 font-medium tracking-wide",
    sizes: {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3",
      lg: "px-8 py-4 text-lg",
    },
    variants: {
      primary: `
        bg-gradient-to-br from-[#8b4513] to-[#723a0f]
        text-white rounded-xl shadow-lg
        hover:shadow-xl hover:scale-[1.02]
        active:scale-[0.98] active:shadow-md
        disabled:opacity-50 disabled:pointer-events-none
      `,
      secondary: `
        bg-white/80 backdrop-blur-sm
        text-[#2c1810] rounded-xl
        border-2 border-[#8b4513]/20
        hover:bg-[#8b4513]/10 hover:border-[#8b4513]/30
        active:bg-[#8b4513]/20
        disabled:opacity-50 disabled:pointer-events-none
      `,
      ghost: `
        bg-transparent text-[#2c1810]
        hover:bg-[#8b4513]/10 rounded-xl
        active:bg-[#8b4513]/20
      `,
      icon: `
        p-2 rounded-full
        hover:bg-[#8b4513]/10
        active:bg-[#8b4513]/20
      `,
    },
  },

  input: {
    base: "w-full transition-all duration-300",
    variants: {
      primary: `
        bg-white/80 backdrop-blur-sm rounded-xl
        border-2 border-[#8b4513]/20
        focus:border-[#8b4513] focus:ring-2 focus:ring-[#8b4513]/20
        placeholder:text-[#5c392c]/50
      `,
      search: `
        bg-white/60 backdrop-blur-sm rounded-full
        border border-[#8b4513]/10
        focus:border-[#8b4513] focus:ring-2 focus:ring-[#8b4513]/20
        pl-10 pr-4
      `,
    },
  },

  // Tipografía
  text: {
    heading: {
      h1: "text-4xl font-serif font-bold tracking-tight",
      h2: "text-3xl font-serif font-bold tracking-tight",
      h3: "text-2xl font-serif font-semibold",
      h4: "text-xl font-serif font-semibold",
    },
    body: {
      base: "text-base leading-relaxed text-[#2c1810]",
      small: "text-sm leading-relaxed text-[#5c392c]",
    },
  },

  // Iconos
  icon: {
    sizes: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    },
    variants: {
      primary: "text-[#8b4513]",
      secondary: "text-[#5c392c]",
      white: "text-white",
    },
  },

  effects: {
    hover: "transition-all duration-300 hover:scale-[1.02]",
    press: "active:scale-[0.98]",
    glow: "shadow-[0_0_15px_rgba(139,69,19,0.3)]",
    glass: "backdrop-blur-sm bg-white/80",
  },
};

// Estilos específicos del juego
export const gameStyles = {
  tile: {
    base: "flex items-center justify-center font-bold font-serif uppercase transition-all duration-300",
    sizes: {
      sm: "w-12 h-12 text-xl",
      md: "w-16 h-16 text-2xl",
    },
    variants: {
      empty: "border-2 border-[#c4a484]/50 rounded-xl bg-white/40 backdrop-blur-sm",
      filled: "border-2 border-[#8b4513] rounded-xl bg-white/90 backdrop-blur-sm shadow-md",
      correct: "bg-gradient-to-br from-[#8b4513] to-[#723a0f] border-none rounded-xl text-white shadow-lg",
      present: "bg-gradient-to-br from-[#c4a484] to-[#a67b5b] border-none rounded-xl text-white shadow-md",
      absent: "bg-gradient-to-br from-[#2c1810] to-[#1a0f0a] border-none rounded-xl text-white/80",
    },
  },

  keyboard: {
    container: "w-full max-w-[600px] mx-auto px-2 py-4",
    row: "flex gap-1.5 w-full justify-center mb-1.5",
    key: {
      base: "font-medium rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm",
      sizes: {
        default: "h-14 min-w-[2.5rem] text-base",
        special: "h-14 min-w-[4rem] text-sm",
      },
      variants: {
        default: "bg-white/80 backdrop-blur-sm hover:bg-white/90 active:bg-white/70",
        correct: "bg-gradient-to-br from-[#8b4513] to-[#723a0f] text-white",
        present: "bg-gradient-to-br from-[#c4a484] to-[#a67b5b] text-white",
        absent: "bg-gradient-to-br from-[#2c1810] to-[#1a0f0a] text-white/80",
        special: "bg-[#8b4513]/10 text-[#8b4513] font-semibold",
      },
    },
  },
};

// Utilidades
export const utils = {
  animation: {
    shake: "animate-shake",
    spin: "animate-spin",
    bounce: "animate-bounce",
  },
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  },
  rounded: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  },
}; 