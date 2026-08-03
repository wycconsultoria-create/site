-- ============================================================
-- Sistema de Controle de Transporte - Paulistão Atacadista
-- Rode este script inteiro no SQL Editor de um projeto Supabase
-- EXISTENTE (pncp-db ou wyc-funil). Cria um schema próprio
-- "transporte" pra não misturar com as tabelas de outros produtos.
-- ============================================================

create schema if not exists transporte;

-- Expõe o schema "transporte" pra API REST do Supabase
-- (necessário: em Project Settings > API > Exposed schemas, adicione "transporte")

set search_path to transporte, public;

-- Tabela de colaboradores (importados via planilha)
create table if not exists colaboradores (
  id text primary key,                 -- ID vindo da planilha
  nome text not null,
  equipe text,
  loja text,                           -- destino: Campinas / Santa Bárbara do Oeste / etc
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Tabela de operações (uma por tipo/dia)
create table if not exists operacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('saida_indaiatuba','retorno_campinas','retorno_santa_barbara')),
  data date not null default current_date,
  status text not null default 'aberta' check (status in ('aberta','finalizada')),
  criado_em timestamptz not null default now(),
  finalizada_em timestamptz
);

-- Evita duas operações abertas do mesmo tipo no mesmo dia
create unique index if not exists uniq_operacao_aberta
  on operacoes (tipo, data);

-- Tabela de presenças (um registro por colaborador por operação)
create table if not exists presencas (
  id uuid primary key default gen_random_uuid(),
  operacao_id uuid not null references operacoes(id) on delete cascade,
  colaborador_id text not null references colaboradores(id) on delete cascade,
  status text not null default 'pendente'
    check (status in ('pendente','confirmado','atestado','ficou_indaiatuba','faltou','outro')),
  observacao text,
  atualizado_em timestamptz not null default now(),
  unique (operacao_id, colaborador_id)
);

-- ============================================================
-- RLS: liberado para o anon key (login é feito por senha na tela,
-- não via Supabase Auth). Se quiser reforçar depois, dá pra trocar
-- por Supabase Auth + políticas por usuário.
-- ============================================================
alter table colaboradores enable row level security;
alter table operacoes enable row level security;
alter table presencas enable row level security;

create policy "allow all colaboradores" on colaboradores
  for all using (true) with check (true);

create policy "allow all operacoes" on operacoes
  for all using (true) with check (true);

create policy "allow all presencas" on presencas
  for all using (true) with check (true);
