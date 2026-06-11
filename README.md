# PeruFinDocs

> Open-source document intelligence agent for Peruvian financial regulation, central-bank publications, and public-company disclosures — with grounded citations and multi-model evals.

🚧 **Under active development.** Targeting v1 launch ~10 weeks from project start. [Read the PRD →](./PRD.md)

🇪🇸 **[Español →](./README.es.md)**

---

## What it does

PeruFinDocs answers compliance and analytical questions about Peruvian finance with audit-ready citations:

> **Q:** *¿Qué obligaciones de reporte aplica SBS a una EEDE que procesa remesas por montos menores a USD 10,000?*
>
> **A:** Las EEDE están sujetas a las obligaciones de reporte establecidas en [SBS Res. N° 6285-2013, art. 14, p. 7] y, para operaciones transfronterizas, en [SBS Circular G-184-2015, num. 3.2, p. 4]. Las operaciones bajo USD 10,000 individuales pueden estar sujetas a reporte agregado bajo [UIF-Perú Res. SBS N° 369-2018]…

Three corpora:
- **SBS** — circulars, resolutions, reglamentos
- **BCRP** — reportes de inflación, notas de estudios, reporte de estabilidad financiera
- **BVL** — memorias anuales and hechos de importancia for top 20 listed companies

## Who it's for

- **Fintech compliance teams** drowning in regulatory complexity with small headcount
- **Bank risk and compliance analysts** doing cross-version regulation comparisons
- **Equity research analysts** benchmarking BVL-listed companies
- **Financial journalists** needing cited primary sources fast

## What makes it different

- **Citations down to article/paragraph level**, with hover-to-highlight on the source PDF
- **Refuses rather than hallucinates** — explicit guardrails and a citation verifier
- **Multi-model leaderboard** — Claude, GPT, and open-source models scored on the same eval set
- **Audit-ready evals** — 200+ gold Q&A pairs across factual, multi-hop, and adversarial tiers
- **Spanish-first** — built for Peruvian legal Spanish, not retrofitted from English

## Status

| Milestone | Status |
|---|---|
| PRD finalized | ✅ |
| Repo scaffolding | 🚧 in progress |
| SBS ingestion | ⏳ Week 1–2 |
| Hybrid retrieval | ⏳ Week 3–4 |
| Agent + multi-modal | ⏳ Week 5–6 |
| Eval harness + gold set | ⏳ Week 7–8 |
| Production hardening | ⏳ Week 9 |
| Public launch | ⏳ Week 10 |

## Getting started

> Setup instructions land at end of Week 1 once the scaffold is stable.

```bash
git clone https://github.com/JavierPachas/perufindocs.git
cd perufindocs
pnpm install
cp .env.example .env.local  # fill in keys
pnpm dev
```

## Contributing

Contributions welcome once the scaffold lands. Areas where help is especially appreciated:
- Adding gold Q&A pairs (Peruvian finance expertise highly valued)
- Spanish UX copy and a11y review
- Coverage of additional regulators or BVL companies
- Bug reports from real compliance/research workflows

See `docs/contributing.md` (coming soon).

## License

MIT — see [LICENSE](./LICENSE).

## Disclaimer

PeruFinDocs is decision-support tooling, **not legal advice**. Citations are provided for verification, but users are responsible for confirming source authority and applicability to their situation. The maintainers are not licensed legal counsel in Peru or any jurisdiction.

## Author

Built by [Javier Pachas](https://linkedin.com/in/javierpachas) — Senior AI/Data Scientist, Lima.
