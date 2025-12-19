/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
  readonly VITE_SUPABASE_PUBLISHABLE: string;
  readonly VITE_SUPABASE_SECRET: string;
  readonly VITE_ASAAS_API_KEY: string;
  readonly VITE_ASAAS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}