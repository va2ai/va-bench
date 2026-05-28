# va-bench

A 20-agent prompt catalog for VA legal-research support, with an interactive sandbox to run any single agent against the Gemini API and an export tool that bundles the catalog into a TypeScript module or JSON pack for use in another codebase.

The agents are organized in two phases — Phase 1 deconstructors that normalize a VA decision, identify denial logic, and map regulations; Phase 2 specialists that strategize lanes, analyze appellate doctrine, validate citations, and produce a veteran-facing plain-English summary. Three preset scenarios show how the prompts are intended to chain together end to end.

> **Scope note.** This is a prompt-engineering catalog with a single-agent sandbox runtime, not a production multi-agent orchestrator. The orchestration is encoded in the prompts and the preset target-agent chains, not in server code. See [Limitations](#limitations) for the honest boundary on what this repo does and does not do.
>
> **Not legal advice.** Educational reference only. Output is intended to assist research by a licensed attorney or VA-accredited representative — it is not a substitute for one. The author is not an accredited VA representative or attorney.

## What's In the Catalog

| Phase | Agent ID | Primary use |
| ----- | -------- | ----------- |
| 1 | `va-intake-router` | Routes the user's request to the correct VA workflow (Supplemental, HLR, Board, CAVC, etc.) |
| 1 | `va-decision-normalizer` | Parses a rating decision or Board decision into structured findings, denial reasons, and conceded elements |
| 1 | `va-case-graph-builder` | Builds a relational graph of issues, evidence, ratings, and procedural posture |
| 1 | `va-denial-logic-analyst` | Identifies the precise denial logic VA used and its weak points |
| 1 | `va-evidence-gap-analyst` | Maps the gap between the record and what the regulation requires |
| 1 | `va-regulatory-mapper` | Maps the case to controlling CFR sections, M21-1 procedures, and statutory authority |
| 2 | `va-claim-strategist` | Builds an end-to-end claim development strategy across lanes |
| 2 | `va-appeal-lane-strategist` | Compares Supplemental / HLR / Board / CAVC tradeoffs for the specific posture |
| 2 | `va-nexus-opinion-reviewer` | Critiques medical nexus opinions for probative weight and 38 CFR 3.310 alignment |
| 2 | `va-rating-math-specialist` | Computes combined ratings and identifies SMC, TDIU, bilateral factor, and pyramiding issues |
| 2 | `va-citation-authority-validator` | Reviews legal citations in generated output for accuracy and authority |
| 2 | `va-red-team-secretary-defense` | Plays Secretary's counsel — finds the strongest VA counterargument to the claim |
| 2 | `va-claimant-favorable-framer` | Frames ambiguous law and mixed evidence in the claimant's strongest lawful position |
| 2 | `va-retired-cavc-judge` | Judicial devil's advocate — applies appellate reasoning to test the strategy |
| 2 | `cavc-precedent-specialist` | Maps appellate CAVC and Federal Circuit doctrine relevant to the issue |
| 2 | `cavc-brief-miner` | Pulls usable argument patterns from prior CAVC briefs and decisions |
| 2 | `va-cavc-error-analyst` | Identifies CAVC-cognizable error in a Board decision (reasons-or-bases, Stegall, etc.) |
| 1 | `va-synthesis-handoff-writer` | Compiles the full chain's outputs into the final research report for human review |
| 2 | `va-research-expert` | Finds and ranks supporting authority across CFR, M21-1, BVA, and CAVC sources |
| 2 | `va-veteran-facing-explainer` | Translates the technical output into clear, calm, plain-English next steps |

## Architecture

```
                                  ┌──────────────────────────┐
                                  │ Browser (React + Vite)   │
                                  │  - Agent Catalog tab     │
                                  │  - Sandbox Playground    │
                                  │  - Export tab            │
                                  └──────────┬───────────────┘
                                             │ POST /api/run-agent
                                             │ { agentId, systemPrompt,
                                             │   inputText, useProModel }
                                             ▼
                                  ┌──────────────────────────┐
                                  │ Express server (server.ts)│
                                  │  - Lazy Gemini client     │
                                  │  - Single agent execution │
                                  └──────────┬───────────────┘
                                             │
                                             ▼
                                  ┌──────────────────────────┐
                                  │ Google Gemini API         │
                                  │  - gemini-2.5-flash       │
                                  │  - gemini-2.5-pro (opt-in)│
                                  └──────────────────────────┘
```

Each preset scenario in `src/data/agents.ts` declares a `targetAgentIds` array — the prompts are written to compose, but the composition is currently caller-driven. A full orchestrator (chain runner, validator gating, red-team gating) is not implemented in the server — that is the next step, not what ships today.

## Run Locally

**Prerequisites:** Node.js ≥ 20, a Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/va2ai/va-bench.git
cd va-bench
npm install

# Add your key
echo "GEMINI_API_KEY=your-key-here" > .env

npm run dev
# Open http://localhost:3000
```

The dev server runs Vite in middleware mode behind Express, so the React frontend and the `/api/run-agent` endpoint share one port. Set `PORT=3100` in `.env` to use a different port.

## Sandbox Playground

The Playground tab lets you:

* select any of the 20 agents from a dropdown
* see the agent's system prompt, definition, sample input, and JSON output schema
* edit the input and run it against Gemini 2.5 Flash (or toggle to Pro)
* save the run output as a `.txt` report

A real network call goes out per run — the loading spinner reports the actual model being called, not a scripted timeline.

## Export

The Export tab compiles the entire catalog (or any user-edited subset) into:

* a self-contained JSON pack (`va-bench-prompts-export.json`) with schema `va-bench-prompts-v1`
* a TypeScript module suitable for dropping into another project

Use this if you want to consume the prompts in your own application without depending on this repo's UI.

## Design Notes

The 20 prompts are factored to mirror how a VA case actually fails. Most "AI agent" demos collapse into one mega-prompt that hallucinates citations. The split here is deliberate: extraction agents quote exact decision language; mapping agents rank authorities by weight; analysis agents read those extractions; synthesis is meant to run only after a validator has stripped unsupported citations. The same pattern (extract → map → analyze → validate → synthesize, with hard rules at each layer) is what reliably brings hallucinated regulatory citations toward zero in production legal-tech systems — see the related [citation-validator](https://github.com/va2ai/citation-validator) repo for a worked example of the validator layer.

## Limitations

This repo is honest about what's missing — readers can rely on this list rather than digging.

* **No multi-agent orchestrator.** `/api/run-agent` runs exactly one agent per request. The preset `targetAgentIds` chains are intended-flow metadata, not a runtime contract. Chaining must be done by the caller (or in a follow-up project).
* **No runtime citation validator or red-team gate.** `va-citation-authority-validator` and `va-red-team-secretary-defense` exist as prompts, not as middleware that blocks downstream agents. Wiring them in is the obvious next step.
* **Single sample size per preset.** Three preset scenarios cover migraines / sleep apnea secondary / BVA stressor denial. These exercise the prompts but are not a benchmark.
* **No deployed live demo.** Requires a caller-supplied Gemini API key.
* **No automated tests.** `npm run lint` runs `tsc --noEmit`. Adding agent-level snapshot or schema tests is open work.
* **Model IDs are pinned to a known-stable family** (`gemini-2.5-flash` and `gemini-2.5-pro`). Swap to newer models in `server.ts` as they reach general availability.

## What This Demonstrates

* prompt engineering for a regulated, high-stakes domain (VA disability law)
* explicit role decomposition for a multi-agent system (intake → normalization → analysis → strategy → critic → translation)
* structured JSON output contracts for downstream programmatic use
* a "red-team / devil's advocate / favorable-framing" trio as a critic pattern
* an editable-prompt sandbox + export pipeline so the prompts are usable outside this repo
* clean separation of educational tooling from representation — no role in this catalog claims to be a VA-accredited representative or attorney

## Tech Stack

* React 19, Vite 6, TypeScript 5.8, Tailwind CSS 4 — frontend
* Express 4 + tsx — backend
* `@google/genai` 2.x — Gemini SDK
* esbuild — production server bundle

## License

MIT — see [LICENSE](LICENSE).
