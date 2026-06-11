# perufindocs.ingestion (Python)

PDF ingestion, parsing, chunking, and embedding pipeline.

## Responsibilities

- Download PDFs from SBS, BCRP, BVL (rate-limited, robots-respecting — see `docs/legal.md`)
- Parse with Docling / Unstructured (final choice pending Week 1 eval)
- Extract structured tables and chart captions (multi-modal)
- Chunk preserving article-level boundaries for SBS, section-level for BCRP, semantic for BVL
- Generate embeddings (e5-multilingual or jina-v3 — TBD)
- Upsert into Supabase with full metadata
- Maintain amendment graph (which resolutions modify which)
- Emit manifests to `data/corpora-manifests/<corpus>.yaml`

## Status

Scaffold only. Parser eval begins Week 1.

## Constraints

- Never scrape SEACE or any CAPTCHA-protected source
- Always rate-limit to ≥ 2s between requests per host
- Identify with `INGESTION_USER_AGENT` env var
- Cache PDFs by SHA-256; never re-download unchanged content
