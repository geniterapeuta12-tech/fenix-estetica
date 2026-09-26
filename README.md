# Fênix Estética ✦

Sistema de gestão para clínica de estética — **um único arquivo HTML** (funciona offline com cache local), sincronizado na nuvem via **Supabase**, com apps instaláveis:

- 📱 **Android** (APK)
- 💻 **Windows** (EXE com motor próprio — sem depender de navegador)

## Downloads (versão mais recente)

👉 **[Página de Releases](../../releases)** — baixe `FENIX-Estetica-Windows.zip` (PC) e `FENIX-Estetica.apk` (celular).

### Instalação resumida
| App | Passos |
|---|---|
| **Windows** | Extraia o ZIP numa pasta definitiva → 2 cliques em `1 - Instalar e abrir (rode este).bat` → atalho criado na Área de Trabalho |
| **Android** | Envie o `.apk` pro celular → abra → "Instalar mesmo assim" (fonte desconhecida é normal fora da Play Store) |

Login e senha são os mesmos em PC, celular e navegador — tudo sincronizado no mesmo banco.

## Recursos

- 👥 Clientes, 📦 Pacotes, 🧖 Sessões (realizadas/pendentes), 💰 Pagamentos e 💼 Caixa
- 📊 **Relatórios em fluxo de telas** (clínica completa ou por cliente) com exportação em **PDF** e **.txt organizado**
- 🪟 **Fênix Clients** — espaço exclusivo do cliente via link (abas próprias no celular e no PC)
- 📄 Documentos, formulários com respostas, catálogo de procedimentos e agenda
- 🎨 Temas (Dourado, Rosa-Queimado, Amarelo-Mostarda, Terracota, Verde Coral)
- ⚡ **Dados › Sistema**: zoom das telas de 80% a 125%, salvo no dispositivo
- ☁️ Backup local + sincronização Supabase (SQL idempotente em `supabase-completo.sql`)

## Estrutura

```
index.html                → o app completo (site + base dos apps)
fenix-estetica.html       → cópia sincronizada (usada nos testes)
supabase-completo.sql     → banco completo (executar no Supabase)
```

## Testes

Bateria com 419 verificações (jsdom) cobrindo navegação, financeiro, relatórios, link público do cliente e PWA-like behaviors.

---

*Fênix Estética · identidade: escuro + dourado #d4af37, fênix com coroa · Playfair Display + Montserrat*
