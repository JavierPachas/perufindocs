/**
 * The main PeruFinDocs agent.
 *
 * Model judgment lives here (which tools to call, how to compose the answer).
 * Anything that must ALWAYS run (citation verification) is a workflow, not
 * part of this agent — see ../workflows/verify-citations.ts.
 */
import { Agent } from "@mastra/core/agent";

import { DEFAULT_MODEL, modelRegistry, type ModelKey } from "../models/registry";
import { complianceAnalystInstructions } from "../prompts";
import { searchDocuments } from "../tools/search-documents";
import { refuse } from "../tools/refuse";
// TODO(perufindocs) Week 3+: fetch-full-article, compare-versions,
// extract-table, compute, list-amendments.

export function createComplianceAnalystAgent(modelKey: ModelKey = DEFAULT_MODEL) {
  return new Agent({
    id: "compliance-analyst",
    name: "compliance-analyst",
    instructions: complianceAnalystInstructions,
    model: modelRegistry[modelKey].model,
    tools: {
      searchDocuments,
      refuse,
    },
  });
}
