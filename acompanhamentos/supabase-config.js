// ============================================================
// Configuração do Supabase para o SCL (Acompanhamento de Licitações)
// Preencha os 3 valores abaixo com os dados do SEU projeto Supabase:
//   Supabase Dashboard > Project Settings > API
//   - "Project URL"       -> SUPABASE_URL
//   - "anon public" key   -> SUPABASE_ANON_KEY
// O ADMIN_EMAIL é o e-mail que você cadastrou manualmente em
// Authentication > Users (pode ser qualquer e-mail, não precisa existir de verdade).
// ============================================================
const SUPABASE_URL = 'https://ayissdubhjdbhlyzkjrc.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aXNzZHViaGpkYmhseXpranJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTUzNTcsImV4cCI6MjA5NTg5MTM1N30.llGAxqfnaBpkQ_kCk1bYcsmoviNv4hgmB-wIpdBP0Ws';
const ADMIN_EMAIL = 'admin@wycconsultoria.com.br';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
