import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/gameStore';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Game } from '../models/Game';
import { useNavigate } from 'react-router-dom';

const useGameSubscription = () => {
   const { currentGame, setCurrentGame } = useGameStore();
   const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
   const navigate = useNavigate();


   useEffect(() => {
      const channel = supabase
        .channel('db-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'games' },
          (payload: RealtimePostgresChangesPayload<Game>) => {
            const game = payload.new as Game;
    
            // Navegar solo si el juego está en progreso
            if (game.status === 'in_progress') {
              setCurrentGame(game.id.toString());
              navigate(`/game/${game.id}`);
            }
          }
        )
        .subscribe();
    
      setSubscription(channel);
    
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }, [currentGame]);

   return { setCurrentGame };
};

export default useGameSubscription; 