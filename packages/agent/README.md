# @perufindocs/agent

Mastra-based agent orchestration: agents, tools, workflows, prompts, and citation verification.

## Structure

```
src/
├── agents/
│   └── compliance-analyst.ts   # The main agent: instructions, tools, model from registry
├── tools/                      # One file per tool, createTool + Zod schemas
│   ├── search-documents.ts
│   ├── fetch-full-article.ts
│   ├── compare-versions.ts
│   ├── extract-table.ts
│   ├── compute.ts
│   ├── list-amendments.ts
│   └── refuse.ts
├── workflows/
│   ├── verify-citations.ts     # Deterministic post-generation verification (always runs)
│   └── post-ingestion.ts       # Reindex + cache invalidation after nightly ingestion
├── prompts/
│   └── index.ts                # Versioned prompt exports (never inline strings)
└── models/
    └── registry.ts             # Single source of truth: model key → provider config
```

## Design rules

- **Agent vs. workflow:** agents where model judgment is needed; workflows where determinism is required. Citation verification is a workflow — it must run on every answer.
- **Tool descriptions are prompt surface.** Write them as carefully as the system prompt; the model decides tool usage based on them.
- **No provider SDK calls outside this package.** Everything routes through the Mastra model registry so the eval harness can iterate models.
- **Tracing always on.** Mastra OpenTelemetry spans export to Langfuse; trace IDs persist to the `answers` table.

## Status

Scaffold + skeleton files only. Implementation begins Week 3 (after retrieval is working).
