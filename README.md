# Herbarium

Guia de ervas da Umbanda e mapa colaborativo de marcações (Uberlândia, MG). Mobile-first.

- **Mapa** (`/`): marcações de ervas com erva, orixás, povos, temperatura e função de cada uma.
- **Identificar planta** (`/identificar`): foto da planta identificada pelo Pl@ntNet (exige login); se a espécie estiver no guia, leva à página da erva.
- **Guia de ervas** (`/ervas`): wiki com busca (sem acento) e filtros por orixá, povo, temperatura e função.
- **Página da erva** (`/ervas/[slug]`): texto da wiki, fotos reais com crédito, cuidados e fontes.

O backend é a **`herbarium-api`** (pasta irmã `../herbarium-api`), com banco próprio.

## Stack

- Next.js 16 (App Router) + React 19, Server Components com cache (ISR) para o guia
- Leaflet + React-Leaflet (OpenStreetMap, sem chave)
- TanStack Query, React Hook Form + Zod, Radix UI (diálogos)
- BFF em `src/app/api/*`: guarda o JWT em cookie `httpOnly` e repassa as chamadas para a API

## Rodando

```bash
cp .env.example .env.local   # HERBARIUM_API_URL e JWT_SECRET (igual ao da API)
npm install
npm run dev                  # http://localhost:3000
```

Suba antes a `herbarium-api` (veja o README dela).

## Fotos

As fotos ficam em `public/herbs/<slug>-N.webp` (até 300 KB cada, geralmente 40 a 150 KB) e
`<slug>-N-thumb.webp` para listas e mapa. Todas vêm do Wikimedia Commons com licença livre;
crédito e licença aparecem na página de cada erva.

## Variáveis de ambiente

| Variável | Padrão | Função |
|----------|--------|--------|
| `HERBARIUM_API_URL` | `http://localhost:8081` | URL da herbarium-api |
| `JWT_SECRET` | (obrigatória) | Mesmo segredo da API; usado para validar a assinatura da sessão |
| `PLANTNET_API_KEY` | (opcional) | Chave do Pl@ntNet; só no servidor. A cota diária (20 por usuário e 450 no total) fica na API, em `IDENTIFY_USER_LIMIT` e `PLANTNET_DAILY_BUDGET` |
| `BFF_SECRET` | (recomendada) | Mesmo valor da API; faz a API contar o limite de requisições por usuário e não pelo IP deste servidor |

## App instalável (PWA)

O site é um PWA: no Android/Chrome aparece o botão **Instalar app** no cabeçalho; no iPhone o botão mostra o caminho
(Compartilhar > Adicionar à Tela de Início). O service worker (`public/sw.js`, ativo só em produção) guarda páginas,
fotos e o catálogo já abertos para uso offline; mapa, login e identificação exigem internet.
