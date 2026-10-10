# 🧭 MESA DE PLANEJAMENTO & ROADMAP — FÊNIX ESTÉTICA
> **Documento Vivo de Estratégia, Arquitetura e Decisões de Produto**  
> *Criado em 10/10/2026 · Mesa Oficial de Planejamento*

---

## 1. O PAPEL DA MESA
A **Mesa de Planejamento** é o centro de comando onde todas as ideias, novos módulos e melhorias são:
1. **Debatidos e Refinados**: Avaliação de utilidade real para donas de clínicas de estética no Brasil.
2. **Aprovados**: Definição da regra de negócio, comportamento na tela e arquitetura não destrutiva.
3. **Formatados para Execução**: Transformação em prompts cirúrgicos para a I.A de desenvolvimento aplicar no código (`index.html`), rodar testes e publicar (APK/EXE/GitHub).

---

## 2. STATUS DAS FUNCIONALIDADES

### 🟢 CONCLUÍDAS & EM PRODUÇÃO (R110 → R113)
* [x] **Modo Local Real (R110)**: 1º acesso offline cria conta no aparelho, login instantâneo, blindagem contra ausência de conexão.
* [x] **Financeiro Inteligente (R109)**: Soma automática no modal de venda, status honestos unificados (✓ Quitado, ⏳ Em aberto, ⚠ Conferir se pagou) e Análise I.A.
* [x] **Token para I.A Externa (R108)**: Geração de chave `fkia_` com hash SHA-256 e endpoint de leitura segura.
* [x] **Limpeza de Aparência**: Remoção dos seletores de UI clássica/moderna e cores de tema em `Dados > Aparência`, unificando a identidade visual.
* [x] **Redesign Apple Luxury**: Camada aditiva com materiais de vidro jateado (*frosted glass*), tipografia de alta precisão (*SF Pro*) e física de animação de mola (*Apple Spring*).

---

### 🟡 APROVADAS NA MESA (RODADA ATUAL — EM EXECUÇÃO)

#### 1. 🎟️ Gerador de Vouchers & Vales-Presente Digitais (`#viewExtras`)
* **Objetivo**: Permitir que a clínica venda ou emita vales-presente para datas comemorativas e presentes entre amigas/família.
* **Campos**: Nome de quem presenteia, Nome da presenteada, Serviço ou Valor (R$), Validade e Código Único gerado na hora (ex: `VALE-7X9A`).
* **Entrega Visual**: Card visual sofisticado em vidro translúcido com botão de *Copiar Imagem/Texto* e *Enviar pelo WhatsApp*.

#### 2. 💡 Gerador Diário de Ideias de Conteúdo para Stories (`#viewExtras`)
* **Objetivo**: Eliminar o bloqueio criativo da dona da clínica na hora de produzir conteúdo para o Instagram.
* **Dinâmica**: Botão "🎲 Sortear Ideia para Hoje" navegando por categorias (Mitos & Verdades, Bastidores, Enquetes, Prova Social, CTA Direto).
* **Entrega**: Texto pronto do roteiro para gravar ou postar, com botão "Copiar Texto".

#### 3. 🔍 Analisador de Perfil do Instagram (`#viewExtras` / Studio)
* **Objetivo**: Auditar o perfil da clínica para transformar seguidores em clientes que agendam no WhatsApp.
* **Componentes**:
  1. *Termômetro de Conversão (Score 0 a 100)*: Checklist dos 5 pilares (Foto com rosto, Nome com SEO de cidade/bairro, Bio com promessa clara, Link direto pro WhatsApp, 4 Destaques obrigatórios).
  2. *Gerador de Biografia Magnética*: 3 modelos prontos e formatados com quebras de linha e emojis elegantes para copiar.
  3. *Roteiro dos 4 Destaques*: Guia visual com o script de cada destaque (Comece Aqui, Resultados, O Espaço, Dúvidas).
  4. *Auditoria com Fênix I.A*: Campo para colar a bio atual e receber parecer cirúrgico da I.A interna.

---

### 🔵 BACKLOG & EM ESTUDO PARA PRÓXIMAS RODADAS
* [ ] **Calculadora Técnica de Diluição de Toxina & Ativos**: Guia de reconstituição de frascos (50U, 100U) para seringa de insulina.
* [ ] **Multi-Timer de Cabine**: Cronômetros com alarme para controle de anestésico e neutralização de peelings químicos.
* [ ] **Prescritor Visual de Skincare Home Care**: Lâmina digital com ordem dos passos diários da paciente.

---

## 3. RITUAL PERMANENTE DE EXECUÇÃO
1. **Zero perda de funções**: Modos, arquivos, dados de clientes e regras financeiras intocáveis.
2. **Arquivo Único Sagrado**: Edições centralizadas no `index.html` (e sincronizadas no `index-ui.html`).
3. **Validação Rigorosa**: Script testado com `node --check` (0 erros).
4. **Ciclo Completo de Publicação**:
   * Bump de versão no `index.html` e `versao.json` (5 melhorias).
   * Registro histórico no `OPERACAO.md`.
   * Push na branch `main` (alimenta o auto-update nativo via GitHub Pages).
   * Compilação do APK assinado (`versionCode + 1`).
   * Empacotamento do ZIP Windows.
   * Criação da Release oficial no GitHub com os 6 assets canônicos e hashes SHA-256.
