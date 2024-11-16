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
      //if (!currentGame) return;
      console.log("Usamos el effect")
      // Suscripción a los cambios del juego actual
      const newSubscription = supabase
         .channel('db-changes')
         .on(
            'postgres_changes',
            {
               event: 'UPDATE',
               schema: 'public',
               table: 'games',
               filter: `id=eq.${currentGame}`,
            },
            (payload: RealtimePostgresChangesPayload<Game>) => {

               console.log('Update received:', payload)

               const game = payload.new as Game;
               if("in_progress" == game.status){

                  setCurrentGame(game.id);
                  navigate(`/game/${game.id}`);
               }
               
            }
         )
         .subscribe();

      setSubscription(newSubscription);

      // Limpiar la suscripción al desmontar
      return () => {
         if (newSubscription) {
            supabase.removeChannel(newSubscription);
            console.log('Removed subscription');
         }
      };
   }, [currentGame]);

   return { setCurrentGame };
};

export default useGameSubscription; 