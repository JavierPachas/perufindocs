# Evaluation Methodology

> The design contract for PeruFinDocs evals. The harness in `packages/evals`
> implements this document; if implementation and document disagree, fix one
> of them — never let them drift silently.
>
> Status: design locked at scaffold time. Gold set construction: Weeks 7–8.
> Informal 50-item dev set: Week 4.

## 1. Why evals are the centerpiece

PeruFinDocs makes a hard promise: **grounded answers or explicit refusal, never confident hallucination**. A promise without measurement is marketing. This methodology exists to make the promise falsifiable, comparable across models, and reproducible by anyone who clones the repo.

Secondary goal: the public multi-model leaderboard. Same agent, same tools, same prompts — only the model changes. That isolation is what makes the comparison meaningful.

## 2. What we measure

| Metric | Definition | Computed on |
|---|---|---|
| **Answer correctness** | LLM-judge score (0/0.5/1) against gold answer + rubric, sampled subset human-audited | Tiers 1–2 |
| **Citation precision** | Of all citations in the answer, fraction whose cited passage actually supports the attached claim | Tiers 1–2 |
| **Citation recall** | Fraction of factual claims in the answer that carry at least one citation | Tiers 1–2 |
| **Refusal precision** | Of all refusals, fraction that were correct (question truly unanswerable) | All tiers |
| **Refusal recall** | Of all unanswerable questions, fraction the agent refused | Tier 3 |
| **Refusal F1** | Harmonic mean of the two above | Headline Tier-3 metric |
| **Latency** | p50 / p95 wall-clock, end-to-end including verification workflow | All tiers |
| **Cost** | USD per query from token counts × registry pricing | All tiers |
| **Tool-call efficiency** | Median tool calls per answered query (diagnostic, not a target) | Tiers 1–2 |

**Important interaction:** refusal precision is computed across *all* tiers — a model that refuses Tier 1 questions it should answer gets punished in refusal precision, preventing the degenerate "refuse everything" strategy from winning Tier 3.

## 3. Gold set design

~200 items, versioned in `data/gold/` as YAML, one file per tier.

### 3.1 Tier 1 — Factual retrieval (~80 items)

Single-hop, single-document questions with unambiguous answers verifiable by reading one passage.

Distribution targets:
- ≥ 30 SBS, ≥ 20 BCRP, ≥ 20 BVL, remainder free
- ≥ 15 items where the answer lives in a **table**, not prose (exercises the multi-modal pipeline)
- ≥ 10 items referencing a regulation that was **later amended**, where the correct answer requires the version in force on a stated date (exercises the amendment graph)
- Language: ~70% Spanish, ~30% English questions (answers may cite Spanish sources either way)

### 3.2 Tier 2 — Multi-hop reasoning (~80 items)

Require combining ≥ 2 chunks, often ≥ 2 documents, often computation.

Distribution targets:
- ≥ 25 cross-document within one corpus (e.g., two SBS resolutions)
- ≥ 25 cross-corpus (e.g., BVL memoria + SBS requirement)
- ≥ 20 requiring `extract_table` + `compute` (ratios, growth rates, comparisons)
- ≥ 10 requiring `compare_versions` or `list_amendments`

Each Tier 2 item records not just the gold answer but the **gold evidence set**: the minimal set of (document, locator) pairs sufficient to answer. Citation precision for Tier 2 is scored against claim support, but we also report **evidence recall**: did the agent find the gold evidence?

### 3.3 Tier 3 — Adversarial / refusal (~40 items)

The correct behavior is refusal (or explicit partial answer with refusal of the unanswerable part). Subtypes, each ≥ 8 items:

1. **Nonexistent source**: references a document, article, or date that doesn't exist ("la nota de estudios del BCRP de julio 2026 sobre criptomonedas").
2. **False premise**: embeds a wrong fact in the question ("Dado que la SBS prohibió las EEDE en 2024, ¿…?").
3. **Out of corpus**: real question, but the answer lives outside SBS/BCRP/BVL (tax law, labor law, foreign regulators).
4. **Legal advice bait**: asks for a recommendation only licensed counsel should give ("¿Debería mi fintech registrarse como EEDE o como EDPYME?"). Correct behavior: present what sources say about each figure, refuse the recommendation.
5. **Plausible hallucination traps**: questions whose surface form invites a confident guess (a ratio for a company-year not in the corpus, an article number that skips — e.g., asking about "artículo 47" of a resolution that ends at artículo 45).

### 3.4 Construction & verification protocol

1. **Drafting**: Claude drafts candidate items from indexed documents (never from memory — every Tier 1/2 item must link to actual indexed passages).
2. **Author verification**: Javier verifies every item against the source PDF: answer correct, evidence locators exact, question unambiguous.
3. **Second verifier**: a second Peruvian finance/legal professional reviews a 100% sample of Tier 3 and ≥ 30% random sample of Tiers 1–2. Disagreements are resolved by editing or dropping the item, and logged in the item's `review_notes`.
4. **Versioning**: the gold set carries a semver (`goldset_version` in each file's header). Any item edit bumps the patch version; additions bump minor. Eval runs record the goldset version they ran against — **scores across different goldset versions are not comparable** and the leaderboard must never mix them.

### 3.5 Item schema (YAML)

```yaml
- id: t1-sbs-0042
  tier: 1
  language: es
  question: "¿Cuál es el plazo para que una EEDE comunique a la SBS un cambio de gerente general?"
  gold_answer: "Cinco (5) días hábiles posteriores al acuerdo o designación."
  gold_evidence:
    - document_id: sbs-res-6285-2013
      locator: "art. 9, num. 9.2"
      page: 6
  answerable: true
  requires_tools: [search_documents]
  tags: [eede, gobierno-corporativo]
  created_by: claude-draft
  verified_by: [jpachas]
  review_notes: ""
```

Tier 3 items set `answerable: false` and add `refusal_reason: nonexistent_source | false_premise | out_of_corpus | legal_advice | hallucination_trap`.

## 4. Scoring details

### 4.1 LLM-as-judge for answer correctness

- Judge model: pinned in the harness config and recorded per run (default: strongest available Claude). The judge model **never coincides with the model under evaluation in the same run report without a disclosure flag** — self-judging bias is real; the leaderboard footnotes any self-judged cell.
- Rubric: 1.0 = factually equivalent to gold answer; 0.5 = correct core with material omission or unneeded hedging; 0.0 = wrong, contradicts gold, or answers a different question. The rubric prompt lives in `packages/evals/` and is versioned like any prompt.
- **Human audit**: every run samples 20 judged items (stratified across tiers/scores) for manual review. If human–judge agreement drops below 90%, the rubric is revised and the run is rerun. Audit results are committed with the run report.

### 4.2 Citation scoring

Citation precision is computed by the same verification workflow that runs in production (`verify-citations`) — evals and production share one verifier implementation so the eval measures the real system. Recall requires claim segmentation: the judge model splits the answer into atomic factual claims, then checks each for an attached citation. Claim segmentation output is cached per answer to keep reruns cheap.

### 4.3 Refusals

A response counts as a refusal iff the agent called the `refuse` tool. Prose hedging ("no estoy seguro…") without the tool call counts as an answer and is scored as such. This is deliberate: it forces refusal to be structured and observable.

## 5. Run protocol

- Entry point: `pnpm eval` / `uv run python -m packages.evals.runner` (wraps the Mastra agent via a workflow that iterates `availableModels()`).
- Each run records: goldset version, `PROMPT_VERSION`, git SHA, model registry snapshot (IDs + pricing), judge model, timestamp.
- Reports land in `docs/eval-runs/<timestamp>.json` (gitignored except curated runs promoted to the leaderboard) and a markdown summary committed to `docs/eval-runs/`.
- Cadence: full multi-model runs are **batched weekly** (cost control, PRD §10), plus an ad-hoc run after any prompt or tool-description change. CI never blocks on eval scores (see CLAUDE.md).
- Caching: retrieval results may be cached across models within a run (same query → same chunks); model generations are never cached.

## 6. Contamination & gaming

- The gold set is public (reproducibility beats secrecy for this project's goals), which means future models may train on it. Mitigations: (a) record the goldset publication date so post-publication model releases are flagged on the leaderboard; (b) maintain a small **holdout set (~20 items, not committed)** refreshed quarterly, used only to sanity-check that public-set scores aren't inflated; (c) prefer items whose answers depend on retrieval from our index rather than world knowledge — a model that memorized the answer still fails citation precision if it doesn't retrieve.
- Tool descriptions and prompts are part of the system under test. Any change to them invalidates comparison with prior runs; the run metadata makes this visible.

## 7. Known limitations (stated up front, also in the blog post)

- LLM-judge correctness is an approximation; the human-audit loop bounds but doesn't eliminate judge error.
- ~200 items cannot cover the regulatory surface; scores are estimates with non-trivial variance. We report 95% bootstrap CIs per metric and refuse to rank models whose intervals overlap.
- Spanish legal phrasing has many defensible paraphrases; the 0.5 rubric band absorbs some of this, imperfectly.
- The second-verifier requirement may bottleneck on volunteer availability; if so, Tier 3 keeps the 100% second review and Tiers 1–2 drop to a 15% sample, with the change logged here.