# va-bench

**A 20-agent prompt catalog for VA legal-research support, with first-class hallucination control.**

This repo is a working bench for a multi-agent system that deconstructs VA disability rating decisions, maps them to controlling 38 CFR authority, and produces structured handoff memos. Every agent has an explicit hard-rules section, a JSON output contract, and is gated by a separate **Citation & Authority Validator** agent that fails any unsupported citation before it reaches a user-facing report.

## What it demonstrates

- **Multi-agent orchestration** — 20 specialist prompts split across two phases: Phase 1 deconstructors (intake routing, decision normalization, case-graph building, authority mapping, denial-logic analysis, evidence-gap analysis, nexus review, rating math, appeal-lane strategy) and Phase 2 specialists (CAVC error analysis, claim strategy synthesis, red-team adversarial review).
- **Hallucination control as a system component** — citation validation is a discrete agent with PASS/WARN/FAIL semantics. BVA cannot be cited as binding; M21-1 cannot be cited as controlling law; unsupported citations are stripped from the safe-citation list rather than rewritten.
- **Deterministic math kept out of the LLM** — combined-rating calculations, bilateral factor, TDIU schedular thresholds, and effective-date arithmetic are isolated in the Rating Math Specialist with hard rules forbidding LLM "estimation" when deterministic computation is available.
- **Adversarial gating** — the Red Team / Secretary Defense agent runs before synthesis with explicit attack personas (rater, HLR reviewer, Board judge, examiner, Secretary's counsel) and severity grading (GREEN / YELLOW / RED). RED findings must specify the exact vulnerable claim, the attacker, the attack scenario, and the repair action — not vibes.
- **Editable prompt UX** — every system prompt is inspectable, editable in-browser, and exportable to a typed TypeScript module or a versioned JSON manifest.

## Stack

- **Frontend** — React 19, TypeScript, Tailwind v4, Vite 6, lucide-react, motion
- **Backend** — Express + Node, lazy `@google/genai` (Gemini) client, model switch between `gemini-3.5-flash` and `gemini-3.1-pro-preview`, low-temperature inference for analytical determinism
- **Build** — Vite for client, esbuild for the server bundle, single-server deployment serving both the SPA and the `/api/run-agent` endpoint

## Run locally

**Prerequisites:** Node.js 20+, a Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey).

```bash
npm install
cp .env.example .env
# edit .env and set GEMINI_API_KEY=...
npm run dev
```

Open `http://localhost:3000`. The Express server mounts Vite in middleware mode in dev and serves the built bundle in production (`npm run build && npm start`).

## Repo layout

```
server.ts                       # Express + Gemini proxy
src/
  App.tsx                       # Catalog / Playground / Export tabs
  data/agents.ts                # 20 agent definitions (~2200 lines of prompts + sample inputs)
  components/
    AgentCard.tsx
    Playground.tsx              # System-prompt editor + live execution
    ExportPanel.tsx             # TS module + JSON manifest export
  types.ts
templates/                      # n/a
```

## Design notes

The 20 prompts are not a brainstorm — they're factored to mirror how a VA case actually fails. Most "AI agent" demos collapse into one mega-prompt that hallucinates citations. The split here is deliberate: extraction agents quote exact decision language; mapping agents rank authorities by weight; analysis agents read those extractions; synthesis only runs after the validator has stripped unsupported citations. The same pattern (extract → map → analyze → validate → synthesize, with hard rules at each layer) is what reliably brings hallucinated regulatory citations to near-zero in production legal-tech systems.

This repo is one of several public artifacts behind that work. The production system using these patterns is [vaclaims.net](https://vaclaims.net).

## Author

**Chris Combs** — Software engineer focused on multi-agent systems and hallucination control in regulated domains.
[LinkedIn](https://www.linkedin.com/in/va2ai) · [GitHub](https://github.com/va2ai) · chris@vaclaims.net

## License

Apache-2.0.
