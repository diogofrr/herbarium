# Herbarium Uberlândia

Aplicação Next.js mobile-first para mapear ervas colaborativamente em Uberlândia - MG.

## Stack

- Next.js (App Router) + React 19
- Leaflet + React-Leaflet (OpenStreetMap, sem chave de API)
- TanStack Query + TanStack Virtual
- Radix UI (Dialog, AlertDialog, Popover, Select)
- React Hook Form + Zod
- BFF (rotas `src/app/api/*`) faz proxy autenticado para a API NestJS (`api-crm`).
- Catálogo de ervas vive no banco do `api-crm` e é consultado via `GET /api/herbs/catalog`.

## Requisitos

- Node.js 20+
- API NestJS rodando (ver `../api-crm/README.md`) e variável `HERBARIUM_API_URL` apontando para ela (default `http://localhost:8080`).

## Configuração

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Funcionalidades

- Busca por erva, observação, endereço ou orixá (debounce automático)
- Filtro por status (`muita` ou `pouca`)
- Marcação no mapa por clique/touch dentro dos limites de Uberlândia
- Edição e remoção via popup do marcador
- Catálogo virtualizado de 200+ ervas com keyboard nav (↑/↓/Enter)
- Geolocalização do usuário (rejeita coordenadas fora de Uberlândia)

## Rotas BFF

- `GET /api/herbs?q=&status=` — lista marcações (proxy)
- `POST /api/herbs` — cria marcação (requer cookie de sessão)
- `PATCH /api/herbs/:id` — atualiza marcação
- `DELETE /api/herbs/:id` — remove marcação
- `GET /api/herbs/catalog` — catálogo (cacheável)

## Variáveis de ambiente

| Variável | Default | Função |
|----------|---------|--------|
| `HERBARIUM_API_URL` | `http://localhost:8080` | URL da API NestJS |
