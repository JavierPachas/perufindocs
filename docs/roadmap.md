# Roadmap (post-v1)

> If a feature isn't in [PRD.md §5](../PRD.md), it lives here.
> This is the firewall against scope creep.

## v1.1 (1–3 months after launch)

- **Python SDK** for programmatic access to the corpus
- **Hechos de importancia real-time ingestion** (currently weekly batch)
- **Slack / Discord bot** wrapper for compliance teams
- **More BVL companies** (top 50 vs. top 20)

## v2 (3–9 months after launch)

- **Customer corpus upload** — bring-your-own internal policies, manuals
- **Team workspaces** with shared queries and saved searches
- **Audit log exports** (CSV/JSON) for compliance review
- **Paid tier** — usage-based or seat-based, TBD
- **Quechua support** — UI + targeted corpus

## v3 / exploratory

- **AndeanFinDocs** — expand to Chile (CMF), Colombia (SFC), maybe Ecuador
- **GRC platform integrations** — Archer, LogicGate, or local Peruvian equivalents
- **Regulatory change alerts** — diff a new SBS resolution against the user's saved compliance posture
- **Voice / WhatsApp interface** — Peruvian fintechs already operate on WhatsApp; an enterprise WhatsApp Business API integration could be transformative

## Killed ideas

> Things considered and explicitly rejected — useful so we don't revisit.

- *Auto-submit regulatory filings on behalf of the user.* Existential legal risk; never.
- *Train a custom Peruvian legal Spanish LLM.* Cost-prohibitive; managed models are good enough with good retrieval.
- *Scrape SEACE for procurement data.* Out of scope for this product; that's what `gov-ai-scout` is for.
