# @perufindocs/retrieval

Hybrid retrieval (BM25 + dense + reranker) over the indexed corpora.

## Responsibilities

- Query Supabase pgvector for dense retrieval
- BM25 with Spanish analyzer (Postgres full-text or external index — TBD)
- Reciprocal rank fusion of dense + lexical results
- Cross-encoder reranking (bge-reranker-v2-m3)
- Return chunks with full metadata (corpus, doc id, page, paragraph path, amendment chain)

## Status

Scaffold only. Implementation Week 3–4.
