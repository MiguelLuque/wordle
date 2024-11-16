export interface Game {
  id: number;
  status: string;
  created_at: string; // Puedes usar Date si prefieres manejarlo como objeto Date
  finished_at?: string; // Puede ser nulo
  name?: string; // Puede ser nulo
  //created_by?: number; // Puede ser nulo
} 