/**
 * search_documents — hybrid retrieval over the indexed corpora.
 *
 * NOTE: tool descriptions are prompt surface. The model decides whether and
 * how to call this tool based on the `description` strings below. Edit them
 * with the same care as the system prompt, and re-run evals after changes.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const searchDocuments = createTool({
  id: "search_documents",
  description:
    "Search the indexed Peruvian financial corpora (SBS regulations, BCRP reports, BVL company disclosures) " +
    "using hybrid lexical + semantic retrieval. Returns the most relevant passages with full citation metadata. " +
    "Use this FIRST for almost every question. Prefer multiple focused searches over one broad search.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query in Spanish (preferred — the corpora are in Spanish) or English. " +
          "Use precise legal/financial terminology when possible.",
      ),
    corpus: z
      .enum(["sbs", "bcrp", "bvl", "all"])
      .default("all")
      .describe("Restrict to one corpus, or 'all'."),
    dateFrom: z
      .string()
      .optional()
      .describe("ISO date — only documents published on/after this date."),
    dateTo: z
      .string()
      .optional()
      .describe("ISO date — only documents published on/before this date."),
    topK: z.number().int().min(1).max(20).default(8),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        chunkId: z.string(),
        documentId: z.string(),
        documentTitle: z.string(),
        corpus: z.enum(["sbs", "bcrp", "bvl"]),
        page: z.number(),
        paragraphPath: z
          .string()
          .describe("Hierarchical location, e.g. 'art. 12, num. 3, lit. b'"),
        publicationDate: z.string(),
        text: z.string(),
        score: z.number(),
      }),
    ),
  }),
  execute: async ({ context }) => {
    // TODO(perufindocs): wire to @perufindocs/retrieval in Week 3.
    // Placeholder so the package typechecks during scaffold phase.
    void context;
    return { results: [] };
  },
});
