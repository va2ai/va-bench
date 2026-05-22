export interface Agent {
  id: string;
  name: string;
  suggestedFile: string;
  phase: 1 | 2;
  primaryUse: string;
  definition: string; // Brief summary
  systemPrompt: string;
  sampleInput: string;
  inputLabel: string;
  inputPlaceholder: string;
}

export interface SimulationLog {
  timestamp: string;
  type: "info" | "success" | "error" | "input" | "output";
  message: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  inputText: string;
  targetAgentIds: string[]; // agent IDs compatible with this scenario
}
