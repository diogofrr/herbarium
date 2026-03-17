# Herbarium Uberlândia

Aplicação mobile-first com Next.js + BFF para mapear ervas colaborativamente em Uberlândia - MG.

## Stack

- Next.js (App Router)
- API Routes como BFF
- Leaflet + React-Leaflet + OpenStreetMap (gratuito, sem chave de API)
- Persistência local em arquivo JSON (`data/herbs.json`)

## Requisitos

- Node.js 20+

## Configuração

1. Instale dependências:

```bash
npm install
```

1. Rode em desenvolvimento:

```bash
npm run dev
```

1. Acesse `http://localhost:3000`

## Funcionalidades

- Busca por nome/observação da erva
- Filtro por status: `muita` ou `pouca`
- Marcação no mapa com clique/touch
- Edição de status direto no marcador
- Remoção de marcador quando não houver erva no local
- Restrição geográfica no front e no back: somente Uberlândia - MG

## Endpoints BFF

- `GET /api/herbs?q=&status=`: lista marcações
- `POST /api/herbs`: cria nova marcação
- `PATCH /api/herbs/:id`: atualiza status
- `DELETE /api/herbs/:id`: remove marcação

## Observações

- O armazenamento atual é local (arquivo JSON), ideal para MVP/protótipo.
- Para produção, substitua por banco de dados e autenticação de usuários.
