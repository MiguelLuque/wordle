export interface Attempt {
  id: number;
  game_id: number;
  user_id: number;
  attempt: string;
  created_at: string; // Puedes usar Date si prefieres manejarlo como objeto Date
} 