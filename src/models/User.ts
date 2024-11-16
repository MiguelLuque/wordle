export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string; // Puedes usar Date si prefieres manejarlo como objeto Date
} 