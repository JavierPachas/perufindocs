# perufindocs.evals

Evaluation harness for measuring answer quality, citation grounding, and refusal behavior across models.

## Responsibilities

- Load gold Q&A pairs from `data/gold/`
- Run each item against configured models (Claude, GPT, open-source)
- Score on: answer correctness (LLM-judge with rubric), citation precision, citation recall, refusal F1 (Tier 3), latency, cost
- Emit reports to `docs/eval-runs/<timestamp>.json`
- Power the public leaderboard page in the web app

## Status

Scaffold only. Eval methodology design begins Week 5; gold set construction Weeks 7–8.

## Why this is the centerpiece

Most portfolio GenAI projects skip rigorous evals. Doing this well is the single highest-signal differentiator for senior AI roles. See [PRD §5.6](../../PRD.md) for design.
