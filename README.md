# 🚀 IndicaFlow

**Transforme clientes em promotores do seu negócio.**

IndicaFlow é uma plataforma completa de automação de indicações que ajuda pequenos negócios (salões, clínicas, barbearias, pet shops, estúdios de estética e profissionais autônomos) a gerar novos clientes através da própria base de clientes.

O sistema registra clientes, acompanha compras ou serviços realizados e envia mensagens automáticas incentivando indicações, aumentando as vendas sem investimento constante em anúncios.

---

## ✨ Funcionalidades

- 🔐 **Autenticação** - Login e cadastro de usuários
- 📊 **Dashboard** - Visão geral com estatísticas e gráficos
- 👥 **Clientes** - Cadastro, edição e exclusão de clientes
- 🔄 **Indicações** - Registro e acompanhamento de indicações
- 🤖 **Marketing com IA** - Geração automática de textos e imagens para campanhas
- 💬 **WhatsApp** - Link direto com mensagem pré-preenchida
- 📱 **Responsivo** - Funciona em desktop, tablet e celular

---

## 🛠️ Tecnologias

| Frontend | Backend | IA |
|----------|---------|-----|
| React 18 | Firebase Auth | Groq (texto) |
| TypeScript | Firestore | Pollinations (imagem) |
| Styled Components | Firebase Functions (futuro) | - |
| React Router DOM | - | - |
| Chart.js | - | - |

---

## 📸 Screenshots

*Adicione aqui prints do sistema*

---

## 🚀 Começando

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Conta no [Firebase](https://console.firebase.google.com)
- Conta no [Groq](https://console.groq.com) (para IA)

env
REACT_APP_FIREBASE_API_KEY=seu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
REACT_APP_GROQ_API_KEY=sua_groq_api_key
Configure o Firebase

Crie um projeto no Firebase Console

Ative Authentication → Email/Senha

Crie Firestore Database em modo de teste

Copie as credenciais para o arquivo .env

Configure o Groq

Crie uma conta no Groq Console

Gere uma API Key

Adicione no arquivo .env

Inicie o servidor de desenvolvimento

bash
npm start
Acesse o sistema

text
http://localhost:3000


📊 Como usar
1. Cadastrar Clientes
Acesse a tela Clientes

Clique em "+ Novo Cliente"

Preencha nome, WhatsApp, serviço e valor

Salve o cliente

2. Registrar Indicações
Acesse a tela Indicações

Selecione o cliente que indicou

Informe o nome do indicado

Marque se já converteu em venda

Registre a indicação

3. Criar Campanhas com IA
Acesse a tela Marketing IA

Descreva detalhadamente o que quer gerar

Clique em "Gerar Mensagem WhatsApp" ou "Gerar Post"

Copie o texto e compartilhe

4. Enviar via WhatsApp
Gere uma mensagem

Digite o número do cliente

Clique em "Enviar via WhatsApp"

O link abrirá com a mensagem pronta

🔮 Próximas funcionalidades
Envio automático de mensagens (n8n)

Agendamento de campanhas

Templates personalizáveis

Exportação de relatórios

Multiempresa (SaaS)

Integração com WhatsApp Business API

📄 Licença
Este projeto é open source e está disponível sob a licença MIT.

👨‍💻 Autor
Seu Nome


LinkedIn: [Nahin Moreira](https://www.linkedin.com/in/nahin-moreira-752b9a246/)

🙏 Agradecimentos
Groq pela API de IA gratuita

Pollinations pela geração de imagens gratuita

Firebase pela infraestrutura

Inter pela fonte