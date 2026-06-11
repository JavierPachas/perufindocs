/**
 * refuse — explicit structured refusal when the corpus cannot support an answer.
 *
 * This tool exists so that "I can't answer this" is a first-class, observable
 * outcome rather than a hallucinated guess. Tier 3 evals measure refusal F1.
 */
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const refuse = createTool({
  id: "refuse",
  description:
    "Call this when the indexed corpora do NOT contain enough information to answer the question reliably, " +
    "or when the question contains a false premise (e.g., references a document that does not exist), " +
    "or when answering would require legal advice rather than document lookup. " +
    "Calling this tool is ALWAYS better than guessing or answering without citations.",
  inputSchema: z.object({
    reason: z.enum([
      "not_in_corpus",
      "false_premise",
      "requires_legal_advice",
      "ambiguous_question",
    ]),
    explanation: z
      .string()
      .describe(
        "User-facing explanation in the language of the question. " +
          "If partially answerable, say which part can be answered and offer it.",
      ),
    suggestedReformulation: z
      .string()
      .optional()
      .describe("If the question could be reformulated to be answerable, suggest how."),
  }),
  outputSchema: z.object({ acknowledged: z.boolean() }),
  execute: async () => ({ acknowledged: true }),
});
