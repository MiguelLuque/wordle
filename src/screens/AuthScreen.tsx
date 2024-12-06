import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/styleUtils';
import { styles } from '../styles/theme';

export default function AuthScreen() {
  const navigate = useNavigate();
  const setAuthenticated = useGameStore((state) => state.setAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthenticated(true);
        navigate('/menu');
      }
    };

    checkSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');

    if (!isLogin && password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      setAuthenticated(true);
      navigate('/menu');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setAuthenticated(true);
    useGameStore.setState({ isGuest: true }); // Marca al usuario como invitado
    navigate('/menu');
  };

  return (
    <div className={styles.layout.page}>
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8b4513]/10 to-[#6b46c1]/10" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-[#8b4513]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-[#6b46c1]/20 rounded-full blur-3xl" />

      <div className={cn(
        styles.card.variants.glass,
        "w-full max-w-md p-8 relative z-10"
      )}>
        <div className="flex justify-center mb-8">
          <div className={cn(
            "p-4 rounded-full",
            styles.effects.glow,
            "bg-gradient-to-br from-[#8b4513] to-[#723a0f]"
          )}>
            <KeyRound className="w-16 h-16 text-white" />
          </div>
        </div>

        <h2 className={cn(
          styles.text.heading.h1,
          "text-center mb-8 text-[#2c1810]"
        )}>
          {isLogin ? '¡Bienvenido!' : 'Crear Cuenta'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className={cn(
              styles.text.body.small,
              "block mb-2"
            )}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                styles.input.variants.primary,
                "w-full px-4 py-3"
              )}
              required
            />
          </div>

          <div>
            <label className={cn(
              styles.text.body.small,
              "block mb-2"
            )}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!isLogin && passwordError) {
                  setPasswordError('');
                }
              }}
              className={cn(
                styles.input.variants.primary,
                "w-full px-4 py-3",
                passwordError && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              required
            />
            {passwordError && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              styles.button.base,
              styles.button.variants.primary,
              "w-full h-12 flex items-center justify-center gap-3"
            )}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#8b4513]/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={cn(
              styles.button.base,
              styles.button.variants.secondary,
              "w-full h-12 flex items-center justify-center"
            )}
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : '¿Ya tienes cuenta? Inicia sesión'}
          </button>

          <button
            onClick={handleGuestLogin}
            className={cn(
              styles.button.base,
              styles.button.variants.ghost,
              "w-full h-12 flex items-center justify-center gap-3"
            )}
          >
            <User className="w-5 h-5" />
            <span>Continuar como Invitado</span>
          </button>
        </div>
      </div>
    </div>
  );
}