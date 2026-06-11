# CLAUDE.md — PeruFinDocs

> Instructions for Claude (and other coding agents) working in this repository.
> Humans: this file is also a good orientation read. See `PRD.md` for the full product spec.

## Project at a glance

**PeruFinDocs** is an open-source document intelligence agent for Peruvian financial regulation, central-bank publications, and public-company disclosures. It answers compliance and analytical questions in Spanish/English with grounded citations, agentic tool use, and audit-ready evals across Claude, GPT, and open-source models.

**Anchor user:** compliance & risk analyst at a Peruvian fintech or mid-market bank.
**Scope contract:** `PRD.md`. Anything not in PRD §5 belongs in `docs/roadmap.md`, not v1.

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn/ui, deployed on Vercel.
- **Agent orchestration:** Mastra (TypeScript-native agents, tools, workflows). The agent loop, tool definitions, and deterministic workflows are Mastra primitives.
- **Backend / DB:** Supabase (Postgres + pgvector + Auth).
- **Cache / rate limiting:** Upstash Redis.
- **Ingestion:** Python on Render or Modal, scheduled via GitHub Actions.
- **LLMs:** Anthropic, OpenAI, and Together/Groq (open-source) via Mastra's model abstraction (Vercel AI SDK providers underneath). Model swap = config change, which powers the benchmark leaderboard.
- **Embeddings:** e5-multilingual-large or jina-v3 (decision pending — see `docs/ingestion-eval.md`).
- **Reranker:** bge-reranker-v2-m3.
- **PDF parsing:** Docling (primary), Unstructured (fallback). Decision pending Week 1 eval.
- **Observability:** Langfuse for LLM traces, PostHog for product analytics.
- **Package manager:** pnpm (monorepo with workspaces).
- **Python deps:** uv (fast pip replacement, locked via `uv.lock`).

## Repo structure

```
perufindocs/
├── apps/web/                # Next.js app (TypeScript)
├── packages/
│   ├── agent/               # Mastra project: agents, tools, workflows, prompts (TS)
│   │   └── src/
│   │       ├── agents/      # Agent definitions (compliance-analyst agent)
│   │       ├── tools/       # One file per tool (search, compare, extract, compute…)
│   │       ├── workflows/   # Deterministic flows (citation verification, reindex)
│   │       ├── prompts/     # Versioned prompt exports
│   │       └── models/      # Model registry + routing config
│   ├── retrieval/           # Hybrid search + reranker (TS, calls Supabase + reranker API)
│   ├── ingestion/           # PDF parsing, chunking, embedding (Python)
│   ├── evals/               # Eval harness, scorers, leaderboard (Python + TS)
│   └── shared/              # Cross-package types & config (TS)
├── data/
│   ├── gold/                # Eval Q&A pairs (YAML, versioned, two-person verified)
│   └── corpora-manifests/   # Which SBS/BCRP/BVL docs are indexed
├── docs/                    # Architecture, eval methodology, contributing, legal
├── scripts/                 # One-off ops scripts (corpus refresh, db migrations)
├── CLAUDE.md                # ← this file
├── PRD.md                   # Product spec (scope contract)
├── README.md                # English landing
└── README.es.md             # Spanish landing
```

## Working agreements for Claude

### Before you write code

1. **Read `PRD.md` §5 to confirm the feature is in v1 scope.** If it isn't, stop and ask before adding it. Scope creep is the #1 risk on this project.
2. **Check `docs/architecture.md` and the package's own `README.md`** for established patterns. Match existing conventions.
3. **For ingestion or eval work, check `data/corpora-manifests/` and `data/gold/` schemas** before adding new entries.

### Code style

- **TypeScript:** strict mode, no `any` without an explanatory comment, prefer `type` over `interface` for data shapes, `interface` for extensibility.
- **Python:** type hints everywhere, `ruff` + `black` enforced via pre-commit, `pyright` strict.
- **Naming:** Spanish domain terms (artículo, circular, memoria) stay in Spanish in code. English everywhere else.
- **Comments:** explain *why*, not *what*. Code should be self-explanatory; comments justify non-obvious decisions or link to PRD/regs.
- **No premature abstraction.** Two concrete implementations before extracting a helper.

### Testing

- **TypeScript:** Vitest for unit, Playwright for e2e on the web app.
- **Python:** Pytest, with `pytest-asyncio` for ingestion pipelines.
- **Evals are not tests.** Eval failures don't block CI. They produce a report committed to `docs/eval-runs/`. CI only blocks on unit/integration tests passing.

### Commits & PRs

- **Conventional commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`, `test:`).
- **Branch naming:** `<type>/<short-slug>` (e.g. `feat/sbs-ingestion`, `fix/citation-verifier-edge-case`).
- **PR titles** mirror the squash-merge commit. Include the relevant PRD section in the description (e.g. "Implements PRD §5.3 — tool `compare_versions`").
- **No PRs to `main` without:** passing CI, updated relevant docs, and (for non-trivial changes) a brief Loom or screenshot.

### Secrets & config

- **Never** commit `.env`, API keys, or any token. `.env.example` only.
- Production secrets live in Vercel/Supabase/Upstash dashboards. Local dev uses `.env.local`.
- The eval harness reads model API keys from env. If a key is missing, that model is skipped (don't fail the run).

### Working with corpora

- SBS, BCRP, and BVL documents are public, but **always respect `robots.txt`, rate-limit scrapers (≥ 2s between requests), and cache aggressively**. See `docs/legal.md`.
- **Never** scrape SEACE or any platform with CAPTCHA/anti-bot. If a source isn't accessible respectfully, document it and skip.
- Every ingested document is recorded in `data/corpora-manifests/<corpus>.yaml` with source URL, publication date, SHA-256 of the PDF, and ingestion run ID.

### LLM & Mastra usage in the codebase

- All model calls go through Mastra agents or workflows defined in `packages/agent` — never call provider SDKs directly from feature code. This keeps benchmarking and observability consistent.
- **Tools:** one file per tool in `packages/agent/src/tools/`, defined with `createTool` and Zod input/output schemas. Tool descriptions are prompt surface — write them as carefully as prompts.
- **Agent vs. workflow boundary:** use a Mastra *agent* where model judgment is required (deciding which tools to call, composing answers). Use a Mastra *workflow* where determinism is required (citation verification, ingestion-triggered reindexing). Don't let the agent own steps that must always run.
- **Model selection** lives in `packages/agent/src/models/registry.ts` — a single map from model key (`claude-sonnet`, `gpt`, `llama-70b`, `qwen-72b`) to provider config. The eval harness and the `/benchmark` page iterate this registry. Never hardcode a model string elsewhere.
- **Always set `maxTokens` explicitly.** Provider defaults differ and have bitten us before.
- **Tracing:** Mastra's OpenTelemetry tracing must stay enabled; spans export to Langfuse. Every agent run gets a trace ID propagated to the answer record in Supabase.
- Prompts live in `packages/agent/src/prompts/` as named exports, never inline as string literals. This lets the eval harness diff prompts across runs.

### When you're uncertain

- If a decision affects architecture, evals, or user-facing behavior: **stop and ask**, don't guess.
- If a decision is reversible and contained to one file: make the call, leave a `// TODO(perufindocs): revisit if X` comment.
- If you find yourself wanting to do something not described here: propose it in the PR description.

## Domain glossary (Spanish → English context)

| Term | Meaning |
|------|---------|
| SBS | Superintendencia de Banca, Seguros y AFP — Peruvian banking regulator |
| BCRP | Banco Central de Reserva del Perú — central bank |
| BVL | Bolsa de Valores de Lima — stock exchange |
| UIF | Unidad de Inteligencia Financiera — financial intelligence unit (AML) |
| PLAFT | Prevención de Lavado de Activos y Financiamiento del Terrorismo — AML/CFT framework |
| EEDE | Empresa Emisora de Dinero Electrónico — e-money issuer (fintech category) |
| Circular | SBS instruction document, generally interpretive |
| Resolución | Binding SBS regulation |
| Reglamento | Detailed implementing rules |
| Memoria anual | Annual report (BVL-listed companies) |
| Hecho de importancia | Material event disclosure |
| Artículo / Numeral / Literal | Hierarchical legal text divisions |

## Non-goals (do not implement in v1)

- Quechua language support (roadmap)
- Private/customer document upload (v2)
- Real-time hechos-de-importancia alerts (v2)
- Paid tier, team workspaces, SLAs (v2)
- Integration with core-banking or GRC platforms (v2)
- Anything in `docs/roadmap.md`

## Tone for user-facing copy

Professional, direct, bilingual when possible. Spanish copy uses formal "usted" register. Never give legal advice — the product is decision-support. Disclaimers in every answer footer.

## When in doubt, ask Javier

This is an open-source flagship for Javier Pachas's job search and a real tool for the Peruvian fintech community. Quality matters more than speed. If a corner-cutting decision saves an hour but undermines the eval rigor or the citation guarantee, don't take it.
