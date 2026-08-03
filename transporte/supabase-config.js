// ============================================================
// Configuração do Supabase - Sistema de Controle de Transporte
// Preencha com os dados do SEU projeto Supabase (Project Settings > API)
// SUPABASE_URL: a URL "bare", sem /rest/v1/ no final
//   ex: https://xxxxxxxxxxxx.supabase.co
// SUPABASE_ANON_KEY: a chave "anon public" completa (não truncar)
// ============================================================

const SUPABASE_URL = 'https://ayissdubhjdbhlyzkjrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aXNzZHViaGpkYmhseXpranJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTUzNTcsImV4cCI6MjA5NTg5MTM1N30.llGAxqfnaBpkQ_kCk1bYcsmoviNv4hgmB-wIpdBP0Ws';

// Usa o schema "transporte" dentro do projeto (não o "public"),
// pra conviver com as tabelas do pncp-db ou wyc-funil sem conflito.
const SUPABASE_SCHEMA = 'transporte';

// Senha de acesso ao sistema (login único de operador)
const SENHA_ACESSO = 'Preto01@';
