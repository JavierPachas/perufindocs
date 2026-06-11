/**
 * verify-citations — deterministic post-generation citation verification.
 *
 * This is a WORKFLOW, not part of the agent, because it must run on every
 * answer without exception. The agent decides how to answer; this workflow
 * decides whether the answer's citations actually hold.
 *
 * Steps (implemented Week 4):
 *   1. parse-citations    — extract [doc, locator, page] citations from the answer
 *   2. fetch-passages     — load each cited passage from Supabase
 *   3. verify-support     — LLM check: does the passage support the claim? (per citation)
 *   4. score-and-flag     — attach verifier scores; flag answer "low confidence"
 *                           if any citation fails or any factual claim is uncited
 *   5. persist            — write verifier results to the answers table
 */
import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

export const verifyCitationsWorkflow = createWorkflow({
  id: "verify-citations",
  inputSchema: z.object({
    answerId: z.string(),
    answerText: z.string(),
  }),
  outputSchema: z.object({
    verified: z.boolean(),
    citationScores: z.array(
      z.object({
        citation: z.string(),
        supported: z.boolean(),
        confidence: z.number(),
      }),
    ),
    uncitedClaims: z.array(z.string()),
  }),
});
// TODO(perufindocs) Week 4: implement steps with .then() chaining and .commit().
