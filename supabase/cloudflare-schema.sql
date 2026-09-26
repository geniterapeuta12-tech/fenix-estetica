-- ============================================================

-- FÊNIX ESTÉTICA — SCHEMA DA NUVEM CLOUDFLARE (D1)

-- Gerado a partir da nuvem real em 26/09/2026 (R17)

-- Aplicar com: npx wrangler d1 execute fenix-estetica --file=cloudflare-schema.sql --remote

-- ============================================================



CREATE TABLE agenda (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, cliente_nome TEXT, data TEXT, hora TEXT, proc TEXT, pacote_id TEXT, sessao_id TEXT, obs TEXT);

CREATE TABLE alarmes (id TEXT PRIMARY KEY, clinic_id TEXT, hora TEXT, label TEXT, ativa BOOLEAN, ts INTEGER, som TEXT, workspace_id TEXT, data TEXT);

CREATE TABLE arquivos (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, nome TEXT, tamanho REAL, data TEXT, url TEXT, link TEXT, topico TEXT, ambito TEXT, workspace_id TEXT, ts INTEGER);

CREATE TABLE backups (id TEXT PRIMARY KEY, clinic_id TEXT, nome TEXT, tipo TEXT, hash TEXT, bytes REAL, criado_em TEXT, ts INTEGER, payload TEXT);

CREATE TABLE catalogo_itens (id TEXT PRIMARY KEY, clinic_id TEXT, tipo TEXT, nome TEXT, descr TEXT, preco TEXT, criado_em TEXT, atualizado_em TEXT, ts INTEGER, foto TEXT);

CREATE TABLE catalogo_kits (id TEXT PRIMARY KEY, clinic_id TEXT, nome TEXT, descr TEXT, preco TEXT, itens TEXT, foto TEXT, criado_em TEXT, atualizado_em TEXT, ts INTEGER);

CREATE TABLE clientes (id TEXT PRIMARY KEY, clinic_id TEXT, nome TEXT, cpf TEXT, nasc TEXT, tel TEXT, email TEXT, "end" TEXT, obs TEXT, criado_em TEXT, acesso BOOLEAN);

CREATE TABLE clinics (id TEXT PRIMARY KEY, key TEXT, nome TEXT, criado_em TEXT, updated_at TEXT);

CREATE TABLE documentos (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, titulo TEXT, texto TEXT, criado_em TEXT, atualizado_em TEXT, ts INTEGER, pacote_id TEXT, sessao_id TEXT, workspace_id TEXT, guias TEXT, fav BOOLEAN);

CREATE TABLE financeiro (id TEXT PRIMARY KEY, clinic_id TEXT, tipo TEXT, descr TEXT, valor REAL, data TEXT, link TEXT, obs TEXT, origem TEXT);

CREATE TABLE formulario_respostas (id TEXT PRIMARY KEY, clinic_id TEXT, formulario_id TEXT, pessoa TEXT, respostas TEXT, criado_em TEXT, ts INTEGER);

CREATE TABLE formularios (id TEXT PRIMARY KEY, clinic_id TEXT, titulo TEXT, descr TEXT, estrutura TEXT, criado_em TEXT, atualizado_em TEXT, ts INTEGER, link_token TEXT);

CREATE TABLE ia_conversas (id TEXT PRIMARY KEY, clinic_id TEXT, titulo TEXT, criado_em TEXT, ts INTEGER);

CREATE TABLE ia_mensagens (id TEXT PRIMARY KEY, clinic_id TEXT, conversa_id TEXT, papel TEXT, texto TEXT, ts INTEGER);

CREATE TABLE mensagens (id TEXT PRIMARY KEY, clinic_id TEXT, de TEXT, para TEXT, texto TEXT, url TEXT, nome TEXT, tamanho INTEGER, criado_em TEXT, ts INTEGER);

CREATE TABLE pacotes (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, nome TEXT, valor REAL, sessoes INTEGER, criado_em TEXT);

CREATE TABLE pagamentos (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, pacote_id TEXT, valor REAL, data TEXT, metodo TEXT, obs TEXT, sessao_id TEXT);

CREATE TABLE sessoes (id TEXT PRIMARY KEY, clinic_id TEXT, cliente_id TEXT, pacote_id TEXT, num INTEGER, feita BOOLEAN, data TEXT, obs TEXT, valor REAL, pago BOOLEAN, metodo TEXT, data_pagto TEXT);

CREATE TABLE usuarios (id TEXT PRIMARY KEY, clinic_id TEXT, username TEXT, nome TEXT, info TEXT, criado_em TEXT, visto_em TEXT, ts INTEGER, senha TEXT, cargo TEXT, status TEXT, pediu_em TEXT, user_id TEXT, email TEXT);

CREATE TABLE workspaces (id TEXT PRIMARY KEY, clinic_id TEXT, nome TEXT, descr TEXT, criado_em TEXT);

CREATE TABLE auth_users (id TEXT PRIMARY KEY, email TEXT UNIQUE, pw TEXT, meta TEXT, criado_em TEXT);

CREATE TABLE fotos (path TEXT PRIMARY KEY, mime TEXT, bytes INTEGER, data TEXT);
