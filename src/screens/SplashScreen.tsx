import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/styleUtils';
import { styles } from '../styles/theme';

export default function SplashScreen() {
  const navigate = useNavigate();
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/menu' : '/auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className={`h-[100dvh] ${styles.layout.page}`}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b4513]/10 to-[#6b46c1]/10" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-[#8b4513]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-[#6b46c1]/20 rounded-full blur-3xl" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Logo animado */}
          <div className="animate-bounce mb-8">
            <div className={cn(
              "p-6 rounded-full",
              styles.effects.glow,
              "bg-gradient-to-br from-[#8b4513] to-[#723a0f]"
            )}>
              <Trophy className="w-24 h-24 text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className={cn(
            styles.text.heading.h1,
            "text-center mb-4 text-[#2c1810] text-5xl"
          )}>
            Wordle Battle
          </h1>

          {/* Subtítulo */}
          <p className={cn(
            styles.text.body.large,
            "text-center mb-8 text-[#2c1810]/75"
          )}>
            ¡Prepárate para competir!
          </p>

          {/* Spinner de carga */}
          <div className="mt-4">
            <div className={cn(
              "w-8 h-8 border-4 rounded-full animate-spin",
              "border-[#8b4513] border-t-transparent"
            )} />
          </div>
        </div>
      </div>
    </div>
  );
}