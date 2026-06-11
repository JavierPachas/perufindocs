# PeruFinDocs — Product Requirements Document

**Version:** 0.1
**Owner:** Javier Pachas
**Status:** Draft for v1 build
**Target launch:** T + 10 weeks
**Repo:** `perufindocs` (open source, MIT)

---

## 1. Executive Summary

**PeruFinDocs** is an open-source, multi-model document intelligence agent for Peruvian financial regulation, central-bank publications, and public-company disclosures. It produces grounded, citation-backed answers to compliance and analytical questions in Spanish or English, with audit-ready evals and a public leaderboard across Claude, GPT, and open-source models.

**One-liner:**
> *The fastest way for a Peruvian fintech or bank compliance team to answer regulatory questions with source-cited evidence.*

**Why this matters:** Peruvian fintech compliance is a structural pain point. A Series A fintech has two to three people covering SBS, BCRP, UIF, and PLAFT obligations while also shipping product. PeruFinDocs compresses a multi-hour research task into seconds, with the kind of citation trail a regulator or auditor will accept.

**Anchor persona:** Compliance & risk analyst at a Peruvian fintech or mid-market bank.
**Secondary personas:** Equity research analyst (BVL memorias), financial journalist, regulatory consultant.

---

## 2. Problem Statement

Peruvian financial professionals work across three disjoint document corpora:

The **SBS** (Superintendencia de Banca, Seguros y AFP) publishes hundreds of circulars, resolutions, and reglamentos annually, covering operational risk, credit risk, market risk, PLAFT, and fintech-specific regulation. These are PDFs with dense legal Spanish, nested articles, and frequent amendments.

The **BCRP** (Banco Central de Reserva del Perú) publishes monetary policy reports, notas de estudios, inflation reports, and financial stability reports. Rich in tables, charts, and time-series data that matter for risk modeling and macro analysis.

The **BVL** (Bolsa de Valores de Lima) hosts memorias anuales, hechos de importancia, and audited financial statements for listed companies. Useful for competitor benchmarking, credit analysis, and equity research.

A compliance lead today opens five browser tabs, Ctrl-Fs through scanned PDFs in Spanish legal prose, manually cross-references amendments, and produces a memo. Error rates are high, junior analyst onboarding takes months, and nothing is auditable.

**Existing tools fall short:**
- Generic LLM chat tools hallucinate citations and don't cover Peruvian sources.
- Legal-tech platforms (vLex, La Ley) are search engines, not reasoning agents, and are expensive.
- Bank-internal GenAI pilots exist but aren't shared, evaluated, or benchmarked publicly.

---

## 3. Goals & Non-Goals

### 3.1 Goals (v1)

1. Ingest and index three public corpora: SBS (circulars + resolutions from 2015–present), BCRP (reportes de inflación, notas de estudios, reporte de estabilidad financiera), and BVL (memorias anuales + hechos de importancia for top 20 listed companies).
2. Answer natural-language questions in Spanish and English with inline citations down to page and paragraph level.
3. Support agentic tool use: the agent can compare versions of a regulation, extract and compute on tables, cross-reference across corpora, and refuse when unsupported.
4. Publish a reproducible eval harness with ~200 gold Q&A pairs across three difficulty tiers, benchmarking at least three model families (Claude, GPT, open-source).
5. Ship a production-grade web app: auth, rate limiting, usage tracking, and a public demo at `perufindocs.vercel.app`.
6. Release as open source (MIT) with English + Spanish documentation, inviting community contributions.

### 3.2 Non-Goals (v1)

1. Commercial / paid tier (possible v2 — see roadmap).
2. Real-time document ingestion (v1 does weekly batch updates).
3. Quechua language support (stretch, roadmap).
4. Private document upload for customer corpora (v2).
5. Integrations with core-banking or GRC platforms (v2).
6. Legal advice — the product is explicitly decision-support, not a replacement for licensed legal counsel.

---

## 4. Users & Use Cases

### 4.1 Primary: Fintech Compliance Analyst

**"María, 29, Compliance Lead at a Series A Lima fintech."**
María needs to know whether a new product feature (e.g., enabling cross-border remittances under USD 10k) triggers additional SBS or UIF reporting. Today she spends three hours reading SBS resolutions and asking peers on WhatsApp. With PeruFinDocs she asks: *"¿Qué obligaciones de reporte aplica SBS a una EEDE que procesa remesas por montos menores a USD 10,000?"* and gets a cited, structured answer in 15 seconds.

### 4.2 Secondary: Bank Risk Analyst

**"Carlos, 34, Risk Analyst at a mid-market bank."**
Carlos is preparing a memo comparing operational-risk capital requirements across three SBS resolution versions (2009, 2016, 2021). PeruFinDocs runs a `compare_versions` tool call and returns a structured diff with citations.

### 4.3 Tertiary: Equity Research / Financial Journalist

**"Lucía, 31, Equity Analyst covering BVL-listed banks."**
Lucía asks: *"How did Credicorp's and Intercorp Financial Services' efficiency ratios evolve 2020–2024, and what did each CEO say in the memoria's carta a los accionistas about digital transformation?"* The agent pulls data from memorias, extracts tables, computes the ratio, and quotes (short, cited) the relevant carta sections.

---

## 5. Functional Requirements

### 5.1 Document Ingestion

The ingestion pipeline parses PDFs into structured JSON with page/paragraph anchors preserved. It must handle:

- Native-text PDFs (most SBS, BCRP recent)
- Scanned PDFs with OCR (older SBS, some BVL)
- Complex tables (BCRP statistical annexes, BVL financial statements)
- Embedded charts (extract as images, generate captions via vision model, make searchable)
- Document structure: título, capítulo, artículo, numeral, literal (Peruvian legal hierarchy)
- Amendment chains: when resolution X modifies resolution Y, link them

**Tooling evaluation:** Benchmark Docling, Reducto, and Unstructured on a held-out set of 30 representative PDFs. Select based on table-extraction F1 and cost per page. Document the decision in `docs/ingestion-eval.md`.

### 5.2 Retrieval

Hybrid retrieval combining BM25 (Spanish analyzer, legal-term synonyms) with dense embeddings (e5-multilingual or jina-v3 — benchmark both). Results fused via reciprocal rank fusion and reranked with a cross-encoder (bge-reranker-v2-m3). Retrieval returns chunks with full metadata: source corpus, document ID, page, paragraph, publication date, amendment chain.

Chunking strategy preserves article-level boundaries for SBS (never split an artículo), section-level boundaries for BCRP, and semantic chunks for BVL narrative sections. Target chunk size 400–800 tokens with 100-token overlap.

### 5.3 Agent Layer

The agent layer is built on Mastra (TypeScript-native agents/tools/workflows). The agent exposes these tools to the LLM:

- `search_documents(query, corpus_filter, date_range)` — hybrid retrieval over the index.
- `fetch_full_article(document_id, article_number)` — retrieve full text when a chunk isn't enough.
- `compare_versions(document_id_a, document_id_b)` — structured diff of two regulation versions.
- `extract_table(document_id, page)` — pull a table as structured JSON for computation.
- `compute(expression)` — safe calculator for ratios, growth rates, etc.
- `list_amendments(document_id)` — walk the amendment graph.
- `refuse(reason)` — explicit refusal when the corpus doesn't support the question.

The agent is instructed to **always cite** and to **refuse rather than hallucinate**. System prompt includes few-shot examples of each behavior.

### 5.4 Grounding & Citations

Every factual claim in the response must carry a citation of the form `[SBS-Res-11356-2008, art. 12, p. 4]`. Citations render as clickable footnotes linking to the source PDF at the exact page. The UI highlights the source passage when hovered.

A post-generation verifier — implemented as a deterministic Mastra workflow that runs on every answer — re-checks each citation: does the cited passage actually support the claim? Unverified citations are flagged and the user sees a "low confidence" warning.

### 5.5 Multi-Model Benchmarking

All queries can be routed to any of: Claude Sonnet 4.6, Claude Opus 4.7, GPT (current flagship), Llama 3.1 70B (or current open-source leader), Qwen 2.5 72B. The `/benchmark` page runs the same query across all models and shows: answer, citations, latency, cost, and eval scores.

### 5.6 Evaluation Harness

A gold set of ~200 Q&A pairs across three tiers:

**Tier 1 — Factual retrieval (~80 items):** single-hop, single-document questions with unambiguous answers. Example: *"¿Cuál es el requerimiento mínimo de capital por riesgo operacional según SBS Resolución 2116-2009?"*

**Tier 2 — Multi-hop reasoning (~80 items):** require combining multiple chunks or documents, often computation. Example: *"Compara el ratio de eficiencia de BCP e Interbank en 2023 usando datos de sus memorias anuales."*

**Tier 3 — Adversarial / refusal (~40 items):** questions that sound answerable but aren't supported by the corpus, or that mix true and false premises. The correct behavior is refusal with explanation. Example: *"¿Qué dijo el presidente del BCRP sobre criptomonedas en la nota de estudio de julio 2026?"* (if no such nota exists).

**Metrics:**
- Answer correctness (LLM-as-judge with human-verified rubric)
- Citation precision (cited passage supports claim — binary, per citation)
- Citation recall (all claims have citations — binary, per answer)
- Refusal accuracy on Tier 3 (precision and recall of refusals)
- Latency p50 / p95
- Cost per query

Gold set construction: use Claude to draft candidate Q&A, then manual verification by Javier (and ideally one other Peruvian finance professional) of every item. Pairs are versioned in the repo.

### 5.7 User-Facing Features

Web app with: question input, source filter (SBS / BCRP / BVL / all), model selector, answer with inline citations, source panel with highlighted passages, "explain your reasoning" toggle showing the agent's tool calls, and export to PDF/Markdown. Spanish and English UI locales.

Rate limiting: 20 queries/day for unauthenticated users, 100/day for signed-in. API access (read-only) with keys for collaborators.

---

## 6. Non-Functional Requirements

**Performance:** p95 latency under 8 seconds for Tier 1 queries, under 20 seconds for agentic Tier 2 queries. Ingestion pipeline processes the full corpus nightly in under 4 hours.

**Cost:** Target < USD 100/month for demo hosting at 1,000 queries/day across all models. Aggressive Redis caching of query embeddings and frequent retrieval results.

**Reliability:** 99% uptime on the demo. Graceful degradation when a model provider is down (fall back to next in priority).

**Privacy:** No query logging in personally identifiable form. Eval queries and model outputs are logged (anonymized) to a public dataset for reproducibility.

**Internationalization:** Spanish-first UI, English secondary. All legal citations render with Peruvian conventions.

**Accessibility:** WCAG 2.1 AA on the web app.

---

## 7. Technical Architecture

### 7.1 Stack

- **Frontend:** Next.js 14 (App Router), Tailwind, shadcn/ui, deployed on Vercel.
- **Agent orchestration:** Mastra — TypeScript-native agents, tools (Zod-schema'd), and deterministic workflows. Agent handles judgment (tool selection, answer composition); workflows handle must-always-run steps (citation verification, reindexing).
- **Auth & DB:** Supabase (Postgres + pgvector + Auth).
- **Cache & rate limiting:** Upstash Redis.
- **Ingestion:** Python workers on Render or Modal, scheduled via GitHub Actions or Supabase Cron.
- **LLM routing:** Mastra model registry over Vercel AI SDK providers (Anthropic, OpenAI, Together/Groq) — model swap is a config change, powering the multi-model leaderboard.
- **Embeddings:** e5-multilingual-large or jina-v3 (final choice from benchmark), hosted via Modal or a managed API.
- **Reranker:** bge-reranker-v2-m3 self-hosted or via API.
- **PDF parsing:** Docling (primary candidate), fallback Unstructured.
- **Observability:** Langfuse or Helicone for LLM traces, PostHog for product analytics.

### 7.2 Data Model (high level)

```
documents         (id, corpus, title, publication_date, source_url, amendment_chain_id, language, raw_pdf_url)
document_chunks   (id, document_id, page, paragraph_path, text, embedding, chunk_type)
amendments        (from_document_id, to_document_id, relationship_type, effective_date)
queries           (id, user_id, question, model, corpus_filter, latency_ms, cost_usd, created_at)
answers           (id, query_id, text, citations_json, tool_calls_json, verifier_score)
eval_items        (id, tier, question, gold_answer, required_citations, created_by, verified_by)
eval_runs         (id, eval_item_id, model, answer_id, scores_json, run_at)
```

### 7.3 Repo Structure

```
perufindocs/
├── apps/
│   └── web/                 # Next.js app
├── packages/
│   ├── agent/               # Mastra project: agents, tools, workflows, prompts
│   ├── retrieval/           # Hybrid search, reranker
│   ├── ingestion/           # PDF parsing, chunking, embedding
│   ├── evals/               # Eval harness, gold set, scorers
│   └── shared/              # Types, config
├── data/
│   ├── gold/                # Versioned eval Q&A pairs (YAML)
│   └── corpora-manifests/   # Which docs are indexed
├── docs/
│   ├── architecture.md
│   ├── ingestion-eval.md
│   ├── eval-methodology.md
│   └── contributing.md
├── CLAUDE.md
├── README.md                # English
├── README.es.md             # Spanish
└── PRD.md
```

---

## 8. Roadmap & Milestones

### Weeks 1–2: Foundations & Ingestion v1
- Repo scaffolding, CI, Supabase + Vercel + Upstash wired.
- Ingestion eval on 30 held-out PDFs, parser selected.
- SBS corpus ingested (circulars + resolutions, 2015–present).
- Basic keyword + vector search working in a CLI.

**Exit criterion:** can answer *"¿Qué dice el artículo 12 de la Resolución SBS N° 2116-2009?"* from the CLI with correct citation.

### Weeks 3–4: Retrieval & Citations
- BCRP corpus ingested.
- Hybrid retrieval + reranker in place.
- Citation verifier implemented.
- First web UI: question box, answer with citations, source panel.

**Exit criterion:** 50-item informal Q&A set, ≥85% citation precision on Claude Sonnet.

### Weeks 5–6: Agent Layer & Multi-Modal
- BVL corpus ingested (top 20 memorias).
- Agent with tool calling wired (search, fetch, compare, extract_table, compute, refuse).
- Table extraction working for BCRP statistical annexes and BVL financial statements.
- Multi-corpus queries work end-to-end.

**Exit criterion:** can answer Lucía's cross-corpus BCP vs. Interbank efficiency-ratio question correctly.

### Weeks 7–8: Eval Harness & Gold Set
- 200-item gold Q&A set drafted (Claude-assisted) and manually verified.
- Eval harness running all three tiers across Claude / GPT / open-source.
- Public leaderboard page live.
- First blog post draft.

**Exit criterion:** reproducible eval run, scores published in `docs/eval-methodology.md`.

### Week 9: Production Hardening
- Auth, rate limiting, usage dashboard.
- Spanish + English locales.
- Accessibility audit.
- Load test at 50 concurrent users.

### Week 10: Launch
- Blog post published on LinkedIn and personal site.
- 3-minute Loom demo.
- Launch in Peru tech communities (LATAM in Tech, PeruAI, etc.) and tag fintech compliance leads.
- Submit to Hacker News "Show HN" and Product Hunt (optional).

---

## 9. Success Metrics

**Technical:**
- Tier 1 correctness ≥ 90% on best model, ≥ 80% on open-source.
- Tier 2 correctness ≥ 75% on best model.
- Tier 3 refusal F1 ≥ 0.85.
- Citation precision ≥ 95%.
- p95 latency < 20s.

**Adoption (8 weeks post-launch):**
- 500+ GitHub stars.
- 200+ unique demo users.
- 5+ external contributors (PRs merged).
- 3+ inbound messages from Peruvian fintechs or banks.

**Career:**
- 2+ qualified interview invitations citing PeruFinDocs specifically.
- 1+ speaking opportunity (meetup, podcast, conference).

---

## 10. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| SBS/BVL ToS prohibits scraping | Medium | Use only publicly published PDFs with clear public-domain/open-data status; document compliance in `docs/legal.md`; respect `robots.txt`; rate-limit scrapers. |
| PDF parsing quality tanks on older scanned docs | High | Ingestion eval up front (Week 1); fall back to OCR (Tesseract + Spanish language pack) for scanned docs; flag low-confidence extractions in the UI. |
| Eval gold set is subjective or low-quality | High | Two-person verification rule; publish the rubric; version the set; invite community corrections via PRs. |
| Cost explosion from multi-model benchmarking | Medium | Cache aggressively; benchmark runs are batched weekly, not per-query; use Groq for open-source speed/price; cap per-day spend. |
| Regulators complain about the tool | Low | Position explicitly as decision-support, not legal advice; prominent disclaimer; offer to brief SBS if asked. |
| Scope creep (I added 6 capabilities and 3 personas) | High | This PRD is the scope contract. Features beyond §5 go to `docs/roadmap.md`, not v1. |

---

## 11. Open Questions

1. Host embeddings self-serve (Modal) or managed (Voyage, Cohere)? Decision by end of Week 1.
2. Is a Python SDK worth shipping in v1 or v1.1? Leaning v1.1.
3. Should hechos de importancia be continuously ingested (real-time-ish) as a differentiator? Probably v2.
4. Partnership with a Peruvian law school or fintech association for gold-set validation — worth pursuing?

---

## 12. Appendix: Post-v1 Roadmap (not in scope)

- Private corpus upload (bring-your-own-policies, customer compliance manuals).
- Quechua support for inclusion/accessibility positioning.
- Real-time ingestion of hechos de importancia with alerting.
- Integration with GRC platforms (e.g., a hypothetical local Archer or LogicGate competitor).
- Paid tier: team workspaces, audit log exports, SLA. This is where a commercial spin-off could live.
- Expansion to other Andean regulators (Chile CMF, Colombia SFC) — "AndeanFinDocs".

---
