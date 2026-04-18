# 3D Lab — Loja Geek 3D

Plataforma de gerenciamento de produtos com catálogo público para uma loja de impressão 3D.

## Tecnologias

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React 18, Vite, Tailwind CSS, Tremor
- **Auth:** JWT

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalação

```bash
# Na raiz do projeto
npm install

# Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais
```

## Executar

```bash
# Backend (porta 3001)
npm run dev:backend

# Frontend (porta 5173)
npm run dev:frontend
```

## Estrutura

```
3dlab/
├── backend/
│   ├── src/
│   │   ├── db/          # Cliente PostgreSQL e migrations
│   │   ├── middleware/  # Auth JWT
│   │   ├── migrations/  # SQL migrations
│   │   └── routes/      # Endpoints da API
│   └── tests/
├── docs/                # Specs e planos de implementação
└── frontend/
    └── src/
        ├── components/  # Componentes reutilizáveis
        ├── lib/         # API client, auth, cart, theme
        └── pages/       # Páginas públicas e admin
```

## Admin padrão

Após rodar o seed (`npm run seed --workspace=backend`), acesse com:
- Email: `admin@lojaGeek3d.com`
- Senha: `admin123`
