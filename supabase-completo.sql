-- ============================================================================
--  FÊNIX ESTÉTICA — SUPABASE COMPLETO
--  Execute este script UMA VEZ no SQL Editor do Supabase → Run
--  Pode rodar mesmo com dados já existentes: nada é apagado ou recriado
--  (todos os comandos são "if not exists" / políticas substituídas por nome)
--
--  Cobre: 19 tabelas já em uso + Catálogo (itens, kits, prontos) + Usuários + Formulários/Respostas/Link
--  E ativa RLS (segurança por clínica) em TODAS as tabelas.
-- ============================================================================


-- ============================================================================
-- PARTE 1 · TABELAS
-- ============================================================================

-- Clínicas (1 linha = 1 conta; id = auth.uid() do login do app)
create table if not exists public.clinics (
  id         uuid primary key,
  key        text not null,
  nome       text not null,
  criado_em  timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clientes (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  nome      text not null,
  cpf       text default ''::text,
  nasc      date,
  tel       text default ''::text,
  email     text default ''::text,
  "end"     text default ''::text,
  obs       text default ''::text,
  criado_em text default ''::text
);

create table if not exists public.pacotes (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nome      text not null,
  valor     numeric not null default 0,
  sessoes   integer not null default 1,
  criado_em text default ''::text
);

create table if not exists public.sessoes (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid not null references public.clinics(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  pacote_id  uuid references public.pacotes(id) on delete set null,
  num        integer not null,
  feita      boolean not null default false,
  data       text default ''::text,
  obs        text default ''::text,
  valor      numeric not null default 0,
  pago       boolean not null default false,
  metodo     text default ''::text,
  data_pagto text default ''::text
);

create table if not exists public.pagamentos (
  id         uuid primary key default gen_random_uuid(),
  clinic_id  uuid not null references public.clinics(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  pacote_id  uuid references public.pacotes(id) on delete set null,
  valor      numeric not null default 0,
  data       text default ''::text,
  metodo     text default ''::text,
  obs        text default ''::text,
  sessao_id  uuid references public.sessoes(id) on delete set null
);

create table if not exists public.agenda (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  cliente_id   uuid references public.clientes(id) on delete set null,
  cliente_nome text default ''::text,
  data         text not null,
  hora         text not null,
  proc         text default ''::text,
  pacote_id    uuid references public.pacotes(id) on delete set null,
  sessao_id    uuid references public.sessoes(id) on delete set null,
  obs          text default ''::text
);

create table if not exists public.financeiro (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  tipo      text not null,
  descr     text not null,
  valor     numeric not null default 0,
  data      text default ''::text,
  link      jsonb,
  obs       text default ''::text
);

create table if not exists public.arquivos (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  cliente_id   uuid references public.clientes(id) on delete cascade,
  nome         text not null,
  tamanho      bigint not null default 0,
  data         text default ''::text,
  url          text not null default ''::text,
  link         jsonb,
  topico       text default ''::text,
  ambito       text not null default 'clinica'::text,
  workspace_id uuid,
  ts           bigint not null default 0
);

create table if not exists public.documentos (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  cliente_id    uuid references public.clientes(id) on delete cascade,
  titulo        text not null default ''::text,
  texto         text not null default ''::text,
  criado_em     text default ''::text,
  atualizado_em text default ''::text,
  ts            bigint not null default 0,
  pacote_id     uuid references public.pacotes(id) on delete set null,
  sessao_id     uuid references public.sessoes(id) on delete set null,
  workspace_id  uuid
);

create table if not exists public.alarmes (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  hora         text not null,
  label        text default ''::text,
  ativa        boolean not null default true,
  ts           bigint not null default 0,
  som          text default 'classico'::text,
  workspace_id uuid,
  data         text default ''::text
);

create table if not exists public.ia_conversas (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  titulo    text not null default 'Nova conversa'::text,
  criado_em text default ''::text,
  ts        bigint not null default 0
);

create table if not exists public.ia_mensagens (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  conversa_id uuid not null references public.ia_conversas(id) on delete cascade,
  papel       text not null default 'user'::text,
  texto       text not null default ''::text,
  ts          bigint not null default 0
);

create table if not exists public.backups (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  nome      text not null default ''::text,
  tipo      text not null default 'manual'::text,
  hash      text default ''::text,
  payload   jsonb not null,
  bytes     bigint not null default 0,
  criado_em text default ''::text,
  ts        bigint not null default 0
);

-- Tabelas reservadas para módulos futuros (já existem no seu banco)
create table if not exists public.workspaces (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  nome      text not null,
  descr     text default ''::text,
  criado_em text default ''::text
);

create table if not exists public.tarefas (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references public.clinics(id) on delete cascade,
  titulo       text not null,
  data         text default ''::text,
  hora         text default ''::text,
  notas        text default ''::text,
  feita        boolean not null default false,
  ts           bigint not null default 0,
  workspace_id uuid
);

create table if not exists public.ia_keys (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  nome      text not null,
  chave     text not null,
  modelo    text not null default 'nvidia/nemotron-3-nano-30b-a3b'::text,
  ativa     boolean not null default false,
  criado_em text,
  ts        bigint not null default 0
);

create table if not exists public.relatorios_ia (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  tipo        text not null default 'financeiro'::text,
  titulo      text,
  periodo_ini text,
  periodo_fim text,
  dados       jsonb,
  analise     jsonb,
  modelo      text,
  origem      text default 'ia'::text,
  criado_em   text,
  ts          bigint not null default 0
);

-- MÓDULO FORMULÁRIOS
create table if not exists public.formularios (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  titulo        text not null default ''::text,
  descr         text default ''::text,
  estrutura     jsonb not null default '[]'::jsonb,
  criado_em     text default ''::text,
  atualizado_em text default ''::text,
  ts            bigint not null default 0
);

-- MÓDULO RESPOSTAS
create table if not exists public.formulario_respostas (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  formulario_id uuid not null references public.formularios(id) on delete cascade,
  pessoa        text not null default ''::text,
  respostas     jsonb not null default '[]'::jsonb,
  criado_em     text default ''::text,
  ts            bigint not null default 0
);

-- CATÁLOGO (produtos e procedimentos — item particular da clínica)
create table if not exists public.catalogo_itens (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  tipo          text not null default 'produto'::text,  -- 'produto' | 'procedimento'
  nome          text not null,
  descr         text default ''::text,
  preco         numeric,                                -- null = sem preço
  criado_em     text default ''::text,
  atualizado_em text default ''::text,
  ts            bigint not null default 0
);

-- FOTO dos itens do catálogo (imagem comprimida em base64 ou URL)
alter table public.catalogo_itens add column if not exists foto text;

-- ORIGEM da entrada no financeiro ('cat' = venda registrada pelo catálogo)
alter table public.financeiro add column if not exists origem text;

-- KITS do catálogo (combinam itens existentes; preco null = soma dos itens)
create table if not exists public.catalogo_kits (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references public.clinics(id) on delete cascade,
  nome          text not null,
  descr         text default ''::text,
  preco         numeric,                                -- null = soma dos itens do kit
  itens         jsonb not null default '[]'::jsonb,     -- ids dos catalogo_itens
  foto          text,
  criado_em     text default ''::text,
  atualizado_em text default ''::text,
  ts            bigint not null default 0
);

-- USUÁRIOS do app (cada pessoa se identifica 1x ao entrar; sem criar multi-contas)
create table if not exists public.usuarios (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  username  text not null,
  nome      text not null,
  info      text,
  criado_em text default ''::text,
  visto_em  text default ''::text,
  ts        bigint not null default 0
);

-- STATUS do usuário: ativo | pendente (pediu retorno) | bloqueado (removido pelo admin)
alter table public.usuarios add column if not exists status text default 'ativo'::text;
alter table public.usuarios add column if not exists pediu_em text;

-- CONTA INDIVIDUAL: user_id (auth do Supabase) + e-mail de cada membro da equipe
alter table public.usuarios add column if not exists user_id uuid unique;
alter table public.usuarios add column if not exists email text;
create index if not exists idx_usuarios_user on public.usuarios (user_id);

-- CARGO do usuário: 'admin' administra a Equipe (cargo, senha, bloqueios e caixa de entrada) — testador/trabalhador = acesso comum
alter table public.usuarios add column if not exists cargo text default ''::text;

-- SENHA dos usuários (guardada para poder ser vista pelo próprio dono/admin; quem já existe digita a sua ao entrar)
alter table public.usuarios add column if not exists senha text;

-- GUIAS dos documentos (abas dentro do mesmo documento, estilo Docs)
alter table public.documentos add column if not exists guias jsonb default '[]'::jsonb;
alter table public.documentos add column if not exists fav boolean default false;

-- MENSAGENS da equipe (chat leve entre usuários; o app apaga o que passa de 24h)
create table if not exists public.mensagens (
  id        uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  de        text not null,
  para      text not null,
  texto     text default ''::text,
  url       text,
  nome      text,
  tamanho   bigint not null default 0,
  criado_em text default ''::text,
  ts        bigint not null default 0
);

-- LINK PÚBLICO (coluna nova + índice único; null = link desativado)
alter table public.formularios add column if not exists link_token text;
create unique index if not exists formularios_link_token_idx
  on public.formularios (link_token) where link_token is not null;

-- BLOQUEIO DE RESPOSTA DUPLICADA: cada pessoa responde 1x por formulário
-- (vale para o link público E para o preenchimento na clínica)
create or replace function public.block_duplicate_resp() returns trigger as $fn$
begin
  if exists (
    select 1 from public.formulario_respostas r
    where r.formulario_id = new.formulario_id
      and lower(btrim(r.pessoa)) = lower(btrim(new.pessoa))
  ) then
    raise exception 'Esta pessoa já respondeu este formulário.';
  end if;
  return new;
end
$fn$ language plpgsql security definer;

drop trigger if exists trg_block_duplicate_resp on public.formulario_respostas;
create trigger trg_block_duplicate_resp
  before insert on public.formulario_respostas
  for each row execute function public.block_duplicate_resp();


-- ============================================================================
-- PARTE 2 · ÍNDICES (desempenho)
-- ============================================================================

create index if not exists idx_clientes_clinic   on public.clientes (clinic_id);
create index if not exists idx_pacotes_clinic    on public.pacotes (clinic_id);
create index if not exists idx_pacotes_cliente   on public.pacotes (cliente_id);
create index if not exists idx_sessoes_clinic    on public.sessoes (clinic_id);
create index if not exists idx_sessoes_cliente   on public.sessoes (cliente_id);
create index if not exists idx_pagamentos_clinic on public.pagamentos (clinic_id);
create index if not exists idx_agenda_clinic     on public.agenda (clinic_id);
create index if not exists idx_financeiro_clinic on public.financeiro (clinic_id);
create index if not exists idx_arquivos_clinic   on public.arquivos (clinic_id);
create index if not exists idx_documentos_clinic on public.documentos (clinic_id);
create index if not exists idx_alarmes_clinic    on public.alarmes (clinic_id);
create index if not exists idx_ia_conversas_clinic on public.ia_conversas (clinic_id);
create index if not exists idx_ia_mensagens_clinic on public.ia_mensagens (clinic_id);
create index if not exists idx_ia_mensagens_conv   on public.ia_mensagens (conversa_id);
create index if not exists idx_backups_clinic    on public.backups (clinic_id);
create index if not exists idx_tarefas_clinic    on public.tarefas (clinic_id);
create index if not exists idx_ia_keys_clinic    on public.ia_keys (clinic_id);
create index if not exists idx_relatorios_clinic on public.relatorios_ia (clinic_id);
create index if not exists idx_workspaces_clinic on public.workspaces (clinic_id);
create index if not exists formularios_clinic_id_idx on public.formularios (clinic_id);
create index if not exists idx_catalogo_clinic on public.catalogo_itens (clinic_id);
create index if not exists idx_catalogo_tipo on public.catalogo_itens (clinic_id, tipo);
create index if not exists idx_catalogo_kits_clinic on public.catalogo_kits (clinic_id);
create index if not exists idx_usuarios_clinic on public.usuarios (clinic_id);
create index if not exists idx_mensagens_clinic on public.mensagens (clinic_id);
create index if not exists formulario_respostas_clinic_idx on public.formulario_respostas (clinic_id);
create index if not exists formulario_respostas_form_idx  on public.formulario_respostas (formulario_id);


-- ============================================================================
-- PARTE 3 · SEGURANÇA (RLS) — cada clínica só acessa o que é dela
-- O app sempre faz login, então auth.uid() = clinics.id
-- ============================================================================

-- ---- clinics: dono vê/edita a própria linha; outras clínicas não veem nada
alter table public.clinics enable row level security;
drop policy if exists "clinics_own_all" on public.clinics;
create policy "clinics_own_all" on public.clinics
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---- Funções auxiliares (security definer = enxergam sem tropeçar no RLS) ----
-- Membro ATIVO da clínica c (donos não passam aqui; tratados à parte)
create or replace function public.fenix_member(c uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.usuarios u
    where u.clinic_id = c and u.user_id = auth.uid()
      and coalesce(u.status,'ativo') = 'ativo');
$$;

-- Admin da clínica c (ou o próprio dono)
create or replace function public.fenix_admin(c uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select c = auth.uid() or exists (select 1 from public.usuarios u
    where u.clinic_id = c and u.user_id = auth.uid()
      and u.cargo = 'admin' and coalesce(u.status,'ativo') = 'ativo');
$$;

-- Nome da clínica (a equipe precisa mostrar sem ler a linha inteira)
create or replace function public.fenix_nome_clinica(c uuid) returns text
language sql security definer stable set search_path = public as $$
  select nome from public.clinics where id = c;
$$;

-- Encontrar clínica pelo nome (para a equipe pedir entrada)
create or replace function public.fenix_clinica_por_nome(p_nome text)
returns table (id uuid, nome text)
language sql security definer stable set search_path = public as $$
  select c.id, c.nome from public.clinics c where lower(c.nome) = lower(p_nome) limit 1;
$$;

-- ---- Tabelas de dados: DONO ou MEMBRO ATIVO da clínica ----
-- (lista completa, inclusive as reservadas para módulos futuros)
do $$
declare t text;
begin
  foreach t in array array[
    'clientes','pacotes','sessoes','pagamentos','agenda','financeiro',
    'arquivos','documentos','alarmes','ia_conversas','ia_mensagens','backups',
    'workspaces','tarefas','ia_keys','relatorios_ia','catalogo_itens',
    'catalogo_kits','mensagens'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "clinic_own_all" on public.%I', t);
    execute format('drop policy if exists "clinic_access" on public.%I', t);
    execute format(
      'create policy "clinic_access" on public.%I for all to authenticated
         using (clinic_id = auth.uid() or public.fenix_member(clinic_id))
         with check (clinic_id = auth.uid() or public.fenix_member(clinic_id))', t);
  end loop;
end $$;

-- ---- usuarios: políticas próprias (membros veem a equipe; admin gerencia) ----
alter table public.usuarios enable row level security;
drop policy if exists "clinic_own_all" on public.usuarios;
drop policy if exists "clinic_access" on public.usuarios;
drop policy if exists "usu_select" on public.usuarios;
drop policy if exists "usu_insert" on public.usuarios;
drop policy if exists "usu_update" on public.usuarios;
drop policy if exists "usu_delete" on public.usuarios;
create policy "usu_select" on public.usuarios for select to authenticated
  using (user_id = auth.uid() or clinic_id = auth.uid() or public.fenix_member(clinic_id));
create policy "usu_insert" on public.usuarios for insert to authenticated
  with check (clinic_id = auth.uid() or (user_id = auth.uid() and status = 'pendente'));
create policy "usu_update" on public.usuarios for update to authenticated
  using (user_id = auth.uid() or clinic_id = auth.uid() or public.fenix_admin(clinic_id))
  with check (user_id = auth.uid() or clinic_id = auth.uid() or public.fenix_admin(clinic_id));
create policy "usu_delete" on public.usuarios for delete to authenticated
  using (clinic_id = auth.uid() or public.fenix_admin(clinic_id));

-- ---- VÍNCULO AUTOMÁTICO: conta nova com e-mail convidado vira membro ativo ----
create or replace function public.fenix_link_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is not null then
    update public.usuarios
      set user_id = new.id, status = 'ativo', pediu_em = ''
      where lower(email) = lower(new.email) and user_id is null and status = 'pendente';
  end if;
  return new;
end $$;
drop trigger if exists trg_fenix_link on auth.users;
create trigger trg_fenix_link after insert on auth.users
  for each row execute function public.fenix_link_usuario();

-- ---- formularios: clínica dona + LEITURA PÚBLICA somente com link ativo
alter table public.formularios enable row level security;
drop policy if exists "form_own_all" on public.formularios;
create policy "form_own_all" on public.formularios
  for all to authenticated
  using (clinic_id = auth.uid()) with check (clinic_id = auth.uid());

drop policy if exists "form_public_read" on public.formularios;
create policy "form_public_read" on public.formularios
  for select to anon
  using (link_token is not null);

-- ---- formulario_respostas: clínica dona + VISITANTE só INSERE
--      (e apenas em formulário com link ativo, caindo na clínica certa)
alter table public.formulario_respostas enable row level security;
drop policy if exists "resp_own_all" on public.formulario_respostas;
create policy "resp_own_all" on public.formulario_respostas
  for all to authenticated
  using (clinic_id = auth.uid()) with check (clinic_id = auth.uid());

drop policy if exists "resp_public_insert" on public.formulario_respostas;
create policy "resp_public_insert" on public.formulario_respostas
  for insert to anon
  with check (
    exists (
      select 1 from public.formularios f
      where f.id = formulario_id
        and f.link_token is not null
        and f.clinic_id = clinic_id
    )
  );

-- ============================================================================
-- RESUMO
-- ✅ 26 tabelas criadas/atualizadas sem tocar nos dados existentes
-- ✅ Catálogo: itens (agora com foto) + kits (combinam itens) + 10 prontos no app
-- ✅ Usuários: identificação com senha própria (sem criar contas novas)
-- ✅ Documentos com guias (abas dentro do documento) + favorito
-- ✅ Mensagens da equipe: chat leve com arquivos — tudo apagado em 24 horas
-- ✅ Conta individual da equipe: e-mail + senha próprios (Supabase Auth)
-- ✅ Convite por e-mail vira membro automático; pedido por nome da clínica na caixa de entrada
-- ✅ Bloqueio REAL: removido pelo admin perde o acesso na hora (RLS)
-- ✅ RLS ativo em tudo: sem login ninguém lê nada; logado, só a própria clínica
-- ✅ Link público: visitante lê 1 formulário (se link ativo) e só insere resposta
-- ============================================================================

-- ============================================================
-- v7 — FÊNIX CLIENTS: consulta pública do cliente (por link)
-- O cliente abre o link (#cli=<id>) e o app chama esta função.
-- Retorna só os dados daquele cliente: pacotes, próximas sessões
-- e últimos pagamentos. Sem expor as tabelas ao público.
-- ============================================================

-- ============================================================
-- v8 — FÊNIX CLIENTS: controle de acesso por cliente
-- clientes.acesso = true → o link do cliente funciona.
-- clientes.acesso = false → a clínica pausou o acesso.
-- ============================================================
alter table public.clientes add column if not exists acesso boolean not null default true;

create or replace function public.fenix_cliente_pub(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  result json;
begin
  select * into c from clientes where id = p_id;
  if c.id is null then
    return null;
  end if;
  if not coalesce(c.acesso, true) then
    return json_build_object('erro', 'sem_acesso');
  end if;
  select json_build_object(
    'cliente', json_build_object('nome', c.nome),
    'clinica', (select cl.nome from clinics cl where cl.id = c.clinic_id),
    'pago_total', coalesce((select sum(pg.valor) from pagamentos pg where pg.cliente_id = c.id), 0),
    'pacotes', coalesce((
      select json_agg(json_build_object(
        'nome', p.nome, 'valor', p.valor, 'qtd', p.sessoes,
        'feitas', (select count(*) from sessoes s where s.pacote_id = p.id and s.feita = true),
        'pago', (select coalesce(sum(pg.valor), 0) from pagamentos pg where pg.pacote_id = p.id)
      ) order by p.criado_em)
      from pacotes p where p.cliente_id = c.id
    ), '[]'::json),
    'proximas', coalesce((
      select json_agg(json_build_object(
        'data', s.data, 'num', s.num, 'obs', s.obs,
        'pacote', (select p.nome from pacotes p where p.id = s.pacote_id)
      ) order by s.data)
      from sessoes s
      where s.cliente_id = c.id and s.feita = false and coalesce(s.data, '') <> ''
    ), '[]'::json),
    'realizadas', coalesce((
      select json_agg(json_build_object(
        'data', s.data, 'num', s.num, 'obs', s.obs,
        'pacote', (select p.nome from pacotes p where p.id = s.pacote_id)
      ) order by s.data desc)
      from sessoes s
      where s.cliente_id = c.id and s.feita = true and coalesce(s.data, '') <> ''
    ), '[]'::json),
    'pagamentos', coalesce((
      select json_agg(json_build_object('valor', pg.valor, 'data', pg.data, 'metodo', pg.metodo) order by pg.data)
      from pagamentos pg where pg.cliente_id = c.id
    ), '[]'::json)
  ) into result;
  return result;
end;
$$;

grant execute on function public.fenix_cliente_pub(uuid) to anon, authenticated;
