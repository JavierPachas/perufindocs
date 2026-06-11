# Architecture

> Living document. Last updated: project kickoff.

This document describes the technical architecture of PeruFinDocs. For product context, see [PRD.md](../PRD.md). For coding conventions, see [CLAUDE.md](../CLAUDE.md).

## High-level flow

```
User query
  ↓
Next.js app (apps/web)
  ↓
Mastra agent (packages/agent) — agent loop, tool selection, model routing
  ↓
Mastra tools:
  • search_documents     → Retrieval (packages/retrieval) → Supabase pgvector + BM25
  • fetch_full_article   → Supabase
  • compare_versions     → Supabase + diff engine
  • extract_table        → Cached structured tables from ingestion
  • compute              → Safe expression evaluator
  • list_amendments      → Supabase (amendment graph)
  • refuse               → Returns structured refusal
  ↓
Mastra workflow: citation verification (deterministic, always runs)
  ↓
Response with grounded citations
```

Ingestion runs out-of-band on Render/Modal (Python), populating Supabase nightly. A Mastra workflow handles post-ingestion reindex notifications.

### Agent vs. workflow boundary

| Concern | Primitive | Why |
|---|---|---|
| Answering a user question (tool selection, composition) | **Agent** | Requires model judgment per query |
| Citation verification after generation | **Workflow** | Must run on every answer, deterministically |
| Post-ingestion reindex + cache invalidation | **Workflow** | Sequenced steps, no judgment needed |
| Eval harness runs | **Workflow** wrapping the agent | Same agent, iterated across the model registry |

## Why these choices

**Mastra for agent orchestration:** TypeScript-native (no Python bridge in the serving path), first-class agents + tools + workflows, model-agnostic via Vercel AI SDK providers (essential for the multi-model leaderboard), built-in OpenTelemetry tracing that exports to Langfuse. Also consistent with the maintainer's other production agentic work, so patterns transfer. Trade-off acknowledged: framework dependency and version churn — accepted because the project's complexity budget is deliberately spent on evals and citation grounding, not orchestration plumbing. The citation verifier remains fully custom.

**Supabase over standalone Postgres + auth + storage:** one provider, pgvector available, familiar to Javier from EdBot.

**Hybrid retrieval (BM25 + dense + reranker):** dense alone misses legal-term-exact matches; BM25 alone misses semantic paraphrase. Reranker is cheap insurance on top-k quality.

**Multi-model via Mastra's model registry:** the eval harness must run the same agent against Claude, GPT, and open-source. Mastra's provider abstraction plus a single registry file (`packages/agent/src/models/registry.ts`) makes a model swap a config change.

**Python for ingestion, TypeScript for everything else:** PDF parsing ecosystem is much stronger in Python (Docling, Unstructured). The web app and agent layer are TypeScript-native.

**Langfuse for observability:** every model call gets a trace. Critical when debugging why a citation came out wrong, and for the eval leaderboard.

## Decisions deferred

These are tracked here so we don't forget to close them out:

| Decision | Deadline | Owner | Status |
|---|---|---|---|
| Docling vs Unstructured vs Reducto | End of Week 1 | Javier | open |
| e5-multilingual vs jina-v3 embeddings | End of Week 2 | Javier | open |
| Self-host reranker (Modal) vs API | End of Week 2 | Javier | open |
| Python SDK in v1 vs v1.1 | End of Week 8 | Javier | leaning v1.1 |

## Diagrams

> To add: sequence diagram of an agentic Tier-2 query, ER diagram of the Supabase schema.
