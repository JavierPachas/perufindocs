# Legal & data-source compliance

> How we use SBS, BCRP, and BVL public documents responsibly.

## Sources & access

All ingested documents are **publicly published** by their respective issuing authorities. No paywalls, no login walls, no terms-of-service prohibitions on access:

- **SBS** — Resolutions and circulars published at https://www.sbs.gob.pe under transparency obligations
- **BCRP** — Reports published at https://www.bcrp.gob.pe as part of the central bank's communication mandate
- **BVL** — Memorias and hechos de importancia published at https://www.bvl.com.pe under disclosure rules

## How we access them

- We respect `robots.txt` on every source domain
- We rate-limit to ≥ 2 seconds between requests per host
- We identify ourselves with a clear `User-Agent` (`PeruFinDocs/x.y (+repo URL)`)
- We cache aggressively — we don't re-download an unchanged PDF
- We never scrape any source with CAPTCHA, anti-bot, or session-required access. **In particular: no SEACE.**
- Manual download (curl/wget) is acceptable for one-off backfill; automated scraping is rate-limited as above

## What we store

- The original PDF (SHA-256 hashed and source-URL annotated)
- Parsed structured representation (chunks, tables, embeddings)
- Document metadata (publication date, issuing authority, amendment links)
- Manifest entries in `data/corpora-manifests/<corpus>.yaml`

We do **not** store any non-public document, customer data, or credentials.

## How we cite

Every response carries citations to primary sources. We **never** paraphrase a regulation in a way that could be confused with the original text without a citation pointing back to it. We **never** reproduce more than short fragments (single sentences with quote marks) — the user is always directed to the source.

## What we are not

PeruFinDocs is **decision-support tooling**, not legal advice. The maintainers are not licensed legal counsel in Peru or elsewhere. Every user-facing response carries a disclaimer.

## If a regulator or rights holder objects

We will respond promptly. Contact: [maintainer email — to add before launch].

If asked to remove a document or class of documents, we will:
1. Stop ingesting from that source immediately
2. Remove indexed content within 48 hours
3. Document the request and our response in this file

## Open questions

- Should we proactively notify SBS / BCRP / BVL of the project? Leaning yes — it builds goodwill and reduces surprise. Decision: before public launch in Week 10.
- Whether to register a Peruvian non-profit or association to formalize stewardship of the corpus. Roadmap consideration.
