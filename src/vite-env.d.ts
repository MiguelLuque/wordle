/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: "https://qreyzlrsuyxlzinmskbb.supabase.co"
  readonly VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZXl6bHJzdXl4bHppbm1za2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI0MDk1MzIsImV4cCI6MjAxNzk4NTUzMn0.YMPoEOk0iNE3KK6GAlRdoocbGWkKVh42986HYIx4u2k"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}