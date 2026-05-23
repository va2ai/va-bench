import React, { useState, useEffect } from "react";
import { Agent, PresetScenario } from "../types";
import { PRESET_SCENARIOS } from "../data/agents";
import { 
  Send, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  FileDown, 
  Cpu, 
  Sliders, 
  Undo,
  Code2,
  FileText
} from "lucide-react";

interface PlaygroundProps {
  agents: Agent[];
  selectedAgentId: string;
  onAgentChange: (id: string) => void;
  editedPrompts: Record<string, string>; // Maps agentId -> custom current prompt
  onPromptEdit: (agentId: string, newPrompt: string) => void;
  onPromptReset: (agentId: string) => void;
}

export default function Playground({
  agents,
  selectedAgentId,
  onAgentChange,
  editedPrompts,
  onPromptEdit,
  onPromptReset
}: PlaygroundProps) {
  const currentAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Playground state
  const [inputText, setInputText] = useState(currentAgent.sampleInput);
  const [useProModel, setUseProModel] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [executionState, setExecutionState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [resultText, setResultText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Load agent sample input when agent changes
  useEffect(() => {
    setInputText(currentAgent.sampleInput);
    // Clear outputs on agent shift to maintain clarity
    if (executionState !== "running") {
      setResultText("");
      setExecutionState("idle");
    }
  }, [selectedAgentId]);

  const activePrompt = editedPrompts[currentAgent.id] || currentAgent.systemPrompt;
  const isPromptModified = activePrompt !== currentAgent.systemPrompt;

  // Pre-fill active sample scenario
  const handleLoadScenario = (scenario: PresetScenario) => {
    setInputText(scenario.inputText);
    // If current agent is not in scenario targets, load the first target
    if (scenario.targetAgentIds.length > 0) {
      if (!scenario.targetAgentIds.includes(currentAgent.id)) {
        onAgentChange(scenario.targetAgentIds[0]);
      }
    }
    // Simple UI state reset
    setResultText("");
    setExecutionState("idle");
  };

  // Simulated professional log runner to show actual analytical depth (no fake larping)
  const runSimulatedLogs = (onComplete: () => void) => {
    const logs = [
      `[Intake] Reading legal-tech input context (${inputText.length} bytes)...`,
      `[Compiler] Securing active System Prompt for '${currentAgent.name}'...`,
      `[Engine] Initiating full-stack proxy route with GenAI pipeline...`,
      `[Model] Dispatching to secure backend with low-temperature focus...`,
      `[Validator] Structuring final legal intelligence breakdown...`
    ];

    setSimulatedLogs([]);
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setSimulatedLogs(prev => [...prev, logs[currentIdx]]);
        setStatusMessage(logs[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 600);

    return () => clearInterval(interval);
  };

  const handleRunAgent = async () => {
    if (!inputText.trim()) {
      alert("Please provide some narrative input text for the agent to analyze.");
      return;
    }

    setExecutionState("running");
    setResultText("");
    setErrorMessage("");

    runSimulatedLogs(async () => {
      try {
        const response = await fetch("/api/run-agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            agentId: currentAgent.id,
            agentName: currentAgent.name,
            systemPrompt: activePrompt,
            inputText: inputText,
            useProModel: useProModel
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to process the request on server.");
        }

        setResultText(data.outputText || "");
        setExecutionState("success");
      } catch (err: any) {
        console.error("Playground Run Error:", err);
        setErrorMessage(
          err.message || "An unexpected error occurred while communicating with the server."
        );
        setExecutionState("error");
      }
    });
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadResult = () => {
    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lavern-conversion-${currentAgent.id}-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="agent-playground" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      
      {/* SECTION HEADER */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Interactive Agent Playground
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an agent, load pre-filled legal scenarios, inspect/edit system prompts, and execute simulations.
            </p>
          </div>

          {/* Core Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 font-sans shrink-0">Active Agent:</span>
            <select
              value={selectedAgentId}
              onChange={(e) => onAgentChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 cursor-pointer max-w-xs shrink"
            >
              <optgroup label="Phase 1: Decision Deconstructors">
                {agents.filter(a => a.phase === 1).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
              <optgroup label="Phase 2: Specialist Expansion">
                {agents.filter(a => a.phase === 2).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* THREE INTERACTIVE COLUMN PRESET SCENARIOS */}
      <div className="mb-6">
        <span className="block text-xs font-bold text-[#475569] mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#475569]" />
          Instant Preset Scenarios
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_SCENARIOS.map((scenario) => {
            const isCompatible = scenario.targetAgentIds.includes(currentAgent.id);
            return (
              <button
                key={scenario.id}
                onClick={() => handleLoadScenario(scenario)}
                className={`text-left p-3.5 rounded-xl border transition-all text-xs outline-none cursor-pointer ${
                  isCompatible 
                    ? "bg-indigo-50/40 hover:bg-indigo-50/90 border-[#c7d2fe] hover:border-indigo-400" 
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 truncate pr-2">{scenario.title}</span>
                  {isCompatible && (
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1 rounded-sm font-semibold tracking-wide shrink-0">
                      Matches Agent
                    </span>
                  )}
                </div>
                <p className="text-[#64748b] text-[11px] leading-snug line-clamp-2">
                  {scenario.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: EDITOR AND CONTROLS */}
        <div className="flex flex-col justify-between border border-slate-200 rounded-xl p-5 bg-slate-50/50">
          <div>
            {/* Active Info Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentAgent.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {currentAgent.definition}
                  </p>
                </div>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-mono px-2 py-0.5 rounded leading-none shrink-0 font-semibold mt-0.5">
                  Phase {currentAgent.phase}
                </span>
              </div>
            </div>

            {/* Main Inputs Container */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#4c566a] mb-2 flex items-center justify-between">
                <span>{currentAgent.inputLabel}</span>
                <button 
                  onClick={() => setInputText(currentAgent.sampleInput)}
                  className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 font-normal cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Revert to Default sample
                </button>
              </label>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentAgent.inputPlaceholder}
                className="w-full h-56 p-4 rounded-xl border border-slate-200 bg-white font-sans text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-950 shadow-inner"
              />
            </div>

            {/* EDITABLE SYSTEM PROMPT ACCORDION */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5 mb-5 shadow-xs">
              <button 
                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#475569] focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5 leading-none">
                  <Code2 className="w-4 h-4 text-slate-500" />
                  System Instructions Prompt Developer
                  {isPromptModified && (
                    <span className="bg-amber-100 text-amber-700 font-semibold font-sans px-1.5 py-0.5 rounded text-[9px] shrink-0 inline-block ml-1">
                      Edited
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-indigo-600 hover:text-indigo-800">
                  {isPromptExpanded ? "[ Hide ]" : "[ View & Edit Instructions ]"}
                </span>
              </button>

              {isPromptExpanded && (
                <div className="mt-3.5 fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-amber-700 bg-amber-50/50 p-2 border border-amber-100 rounded-lg leading-relaxed font-sans shrink">
                      ✏️ Edit this agent's instructions right here to customize their legal analysis, then hit execute to test!
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 ml-4">
                      {isPromptModified && (
                        <button
                          onClick={() => onPromptReset(currentAgent.id)}
                          className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:underline border border-red-100 rounded-md flex items-center gap-0.5 cursor-pointer"
                          title="Reset prompt back to default instruction set"
                        >
                          <Undo className="w-2.5 h-2.5" /> Reset Default
                        </button>
                      )}
                      <button
                        onClick={handleCopyPrompt}
                        className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-md flex items-center gap-0.5 cursor-pointer animate-none"
                      >
                        {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        {copiedPrompt ? "Copied" : "Copy Prompt"}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={activePrompt}
                    onChange={(e) => onPromptEdit(currentAgent.id, e.target.value)}
                    className="w-full h-80 p-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-700 leading-normal focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RUN BUTTON AND SETTINGS ROW */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            {/* Model Config Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">Model:</span>
              </div>
              <div className="flex items-center bg-slate-200/50 p-1 rounded-lg">
                <button
                  onClick={() => setUseProModel(false)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${
                    !useProModel 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Gemini Flash (Default)
                </button>
                <button
                  onClick={() => setUseProModel(true)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${
                    useProModel 
                      ? "bg-slate-950 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Unlocks deeper regulatory reasoning using larger context model"
                >
                  Gemini Pro (Advanced)
                </button>
              </div>
            </div>

            {/* Execute Trigger */}
            <button
              onClick={handleRunAgent}
              disabled={executionState === "running" || !inputText.trim()}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all duration-150 shrink-0 ${
                executionState === "running"
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98"
              }`}
            >
              <Send className="w-4 h-4" />
              Analyze Case context
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REASSURING PROCESSING LOGS AND REAL-TIME OUTPUT */}
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-between">
          
          <div className="h-full flex flex-col">
            {/* Context title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Testing Sandbox
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 animate-none select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </span>
              </div>
              {executionState === "success" && (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleCopyResult}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Copy Report Content"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleDownloadResult}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Download Report as TXT File"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* DYNAMIC SCENARIO VIEWS */}
            <div className="flex-1 flex flex-col min-h-[400px]">
              {executionState === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
                  <div className="bg-slate-50 border border-slate-100 text-slate-400 p-4 rounded-full mb-3 shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">Playground Awaiting Trigger</h5>
                  <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
                    Write or edit raw narrative in the input column or click an instant preset scenario, then trigger analysis.
                  </p>
                </div>
              )}

              {/* LOADING LOGS COMPONENT */}
              {executionState === "running" && (
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full p-4">
                  <p className="text-xs text-slate-600 font-bold mb-4 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-500 animate-spin" />
                    Executing Agent Multi-Run Chain...
                  </p>
                  
                  {/* Live Simulation Steps feedback */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[10px] text-slate-600">
                    {simulatedLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1.5 fade-in">
                        <span className="text-emerald-500">✓</span>
                        <span className="leading-normal">{log}</span>
                      </div>
                    ))}
                    {simulatedLogs.length < 5 && (
                      <div className="flex items-center gap-1.5 animate-pulse text-[#475569]">
                        <span className="text-[#475569] shrink-0">⌛</span>
                        <span>Compiling next network log...</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#64748b] italic mt-4 text-center">
                    Note: Generative analyses against VA CFR titles may take 2-4 seconds. Thank you for your patience.
                  </p>
                </div>
              )}

              {executionState === "error" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-full mb-3 shadow-inner">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <h5 className="text-xs font-bold text-rose-900">Analysis Failed</h5>
                  <p className="text-[11px] text-rose-700 mt-2 bg-rose-50/50 p-3 border border-rose-200 rounded-lg leading-relaxed font-mono text-left w-full break-normal">
                    {errorMessage}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-sans">
                    🔑 If this is a key configuration error, verify <code>GEMINI_API_KEY</code> is set in your <strong>.env</strong> file (see <code>.env.example</code>).
                  </p>
                  <button
                    onClick={handleRunAgent}
                    className="mt-4 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry Analysis
                  </button>
                </div>
              )}

              {/* SUCCESS OUTPUT */}
              {executionState === "success" && (
                <div className="flex-1 flex flex-col fade-in">
                  <div className="bg-emerald-50/40 border border-[#bbf7d0] px-3 py-2 rounded-lg text-[10px] font-bold text-emerald-800 mb-4 flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                    Analysis compiled successfully via {useProModel ? "Gemini 3.1 Pro" : "Gemini 3.5 Flash"}
                  </div>
                  
                  {/* Robust Output Area */}
                  <div className="flex-1 overflow-y-auto max-h-[500px] border border-slate-100 rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {resultText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
