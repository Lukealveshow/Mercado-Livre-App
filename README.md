# Meli Manager

> Aplicação fullstack para publicação e gerenciamento de anúncios no Mercado Livre.

**Frontend (produção):** [https://mercado-livre-site.vercel.app](https://mercado-livre-site.vercel.app)
**Backend (produção):** [https://api-mercado-livre-jc8i.onrender.com](https://api-mercado-livre-jc8i.onrender.com)

---

## Sobre o projeto

Aplicação desenvolvida como desafio técnico, permitindo que vendedores do Mercado Livre autentiquem sua conta e gerenciem seus anúncios de forma centralizada, incluindo criação, listagem, edição de preço/estoque e sincronização com o marketplace.

---

## Funcionalidades

- Autenticação via OAuth 2.0 com o Mercado Livre
- Refresh automático de token (a cada 5h50min via cron)
- Criação de anúncios diretamente no ML
- Listagem de anúncios com filtros por status e busca por título
- Edição inline de preço e estoque
- Atualização de status (ativo/pausado)
- Sincronização manual e automática com o marketplace
- Sugestão automática de categorias pelo ML
- Tratamento de duplicidade, atualizações concorrentes e falhas de comunicação

---

## Tecnologias

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticação interna
- node-cron para jobs de sincronização
- Axios para comunicação com a API do ML

**Frontend**
- Angular 17 (standalone components)
- Angular Signals
- SCSS

---

## Estrutura do projeto

```
meli-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── listingsController.js
│   │   ├── middlewares/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Listing.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── listings.js
│   │   ├── services/
│   │   │   ├── meliService.js
│   │   │   └── syncService.js
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    └── src/
        └── app/
            ├── core/
            │   ├── guards/
            │   ├── interceptors/
            │   └── services/
            ├── pages/
            │   ├── login/
            │   ├── auth-success/
            │   ├── auth-error/
            │   ├── listings/
            │   └── listings-form/
            └── shared/
                └── components/
```

---

## Decisões técnicas

**ML é a fonte da verdade** — toda operação de escrita (criar, atualizar) passa primeiro pela API do ML e só depois persiste no MongoDB, garantindo consistência.

**Upsert para evitar duplicidade** — a sincronização usa `findOneAndUpdate` com `upsert: true` no campo `meliItemId` (único), evitando registros duplicados mesmo em chamadas concorrentes.

**Refresh automático de token** — o job de cron renova o `access_token` antes de expirar usando o `refresh_token`, sem interação do usuário.

**JWT próprio** — o backend gera um JWT interno após o OAuth para não expor o token do ML ao frontend.

**Tratamento de falhas** — toda chamada à API do ML está em try/catch com retorno 502 e mensagem descritiva, sem derrubar o servidor.

---

## Pré-requisitos

- Node.js 18+
- MongoDB 7.0+
- Conta no Mercado Livre com aplicação criada no [Dev Center](https://developers.mercadolivre.com.br/devcenter)
- Angular CLI (`npm install -g @angular/cli`)

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Lukealveshow/Mercado-Livre-App.git
cd meli-manager
```

### 2. Configure o backend

```bash
cd backend
npm install
```

Crie o `.env` com suas credenciais:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/meli-manager
FRONTEND_URL=http://localhost:4200

MELI_CLIENT_ID=SEU_APP_ID
MELI_CLIENT_SECRET=SEU_CLIENT_SECRET
MELI_REDIRECT_URI=https://SEU_BACKEND.onrender.com/auth/callback

JWT_SECRET=SUA_CHAVE_JWT
```

> Para gerar o JWT_SECRET rode: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Inicie o MongoDB

```bash
sudo systemctl start mongod
```

### 4. Rode o backend

```bash
npm run dev
```

Acesse `http://localhost:3000/health` — deve retornar `{"status":"ok"}`.

### 5. Configure o frontend

```bash
cd ../frontend
npm install
```

Edite `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

### 6. Rode o frontend

```bash
ng serve
```

Acesse `http://localhost:4200`.

---

## Configuração do Dev Center do Mercado Livre

1. Acesse [developers.mercadolivre.com.br/devcenter](https://developers.mercadolivre.com.br/devcenter)
2. Crie uma aplicação com:
   - **URI de redirect:** `https://api-mercado-livre-jc8i.onrender.com/auth/callback`
   - **Escopos:** `read`, `write`, `offline_access`
   - **Permissões:** Usuários, Publicação e sincronização
3. Copie o `App ID` e `Client Secret` para o `.env`

> O Mercado Livre exige `https://` nas URIs de redirect. O fluxo OAuth completo só funciona em produção.

---

## Rotas da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/health` | Status do servidor | Não |
| GET | `/auth/login` | Retorna URL de login do ML | Não |
| GET | `/auth/callback` | Callback OAuth | Não |
| GET | `/auth/me` | Dados do usuário logado | Sim |
| GET | `/listings` | Lista anúncios com filtros | Sim |
| GET | `/listings/sync` | Sincroniza anúncios do ML | Sim |
| GET | `/listings/categories?q=` | Sugere categorias | Sim |
| GET | `/listings/:id` | Detalhe de um anúncio | Sim |
| POST | `/listings` | Cria anúncio no ML | Sim |
| PATCH | `/listings/:id` | Atualiza preço/estoque/status | Sim |

### Filtros disponíveis em `GET /listings`

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `status` | Filtra por status | `active`, `paused`, `closed` |
| `search` | Busca por título | `camiseta` |
| `page` | Página atual | `1` |
| `limit` | Itens por página | `20` |

---

## Variáveis de ambiente

### Backend

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (padrão: 3000) |
| `MONGODB_URI` | Connection string do MongoDB |
| `FRONTEND_URL` | URL do frontend (para CORS e redirect) |
| `MELI_CLIENT_ID` | App ID do Dev Center do ML |
| `MELI_CLIENT_SECRET` | Client Secret do Dev Center do ML |
| `MELI_REDIRECT_URI` | URI de callback OAuth |
| `JWT_SECRET` | Chave secreta para assinar JWTs |

---

## Deploy

### Backend — Render

1. Crie um novo **Web Service** no [Render](https://render.com)
2. Conecte o repositório GitHub
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Adicione as variáveis de ambiente
5. Use o MongoDB Atlas como banco em produção

### Frontend — Vercel

1. Importe o repositório no [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `ng build`
   - **Output Directory:** `dist/frontend/browser`
3. Adicione a variável:
   - `apiUrl` → URL do backend no Render

---

## Observações

- Para criar anúncios é necessário ter endereço e cadastro de vendedor completo na conta do Mercado Livre
- O token de acesso do ML expira em 6 horas — o sistema renova automaticamente via refresh token
- A sincronização com o ML busca até 50 anúncios por vez (limite da API)
- Contas sem anúncios retornarão lista vazia na sincronização