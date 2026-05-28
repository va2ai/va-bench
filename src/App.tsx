import { useState } from "react";
import { AGENTS_LIST } from "./data/agents";
import { Agent } from "./types";
import AgentCard from "./components/AgentCard";
import Playground from "./components/Playground";
import ExportPanel from "./components/ExportPanel";
import { 
  Sparkles, 
  Search, 
  Filter, 
  X,
  Sliders,
  Scale,
  Shield,
  FileCode,
  Lightbulb,
  BookOpen
} from "lucide-react";

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS_LIST);
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  const [selectedAgentId, setSelectedAgentId] = useState<string>("va-intake-router");
  const [searchTerm, setSearchTerm] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<"all" | "1" | "2">("all");
  const [useFilter, setUseFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"dashboard" | "playground" | "export">("dashboard");
  const [inspectingAgent, setInspectingAgent] = useState<Agent | null>(null);

  // Prompt edits handler
  const handlePromptEdit = (agentId: string, newPrompt: string) => {
    setEditedPrompts((prev) => ({
      ...prev,
      [agentId]: newPrompt,
    }));
  };

  const handlePromptReset = (agentId: string) => {
    setEditedPrompts((prev) => {
      const copy = { ...prev };
      delete copy[agentId];
      return copy;
    });
  };

  // Route catalog click to active playground tab
  const handleSelectPlayground = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setActiveTab("playground");
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Router catalog click to code inspector
  const handleInspectPrompt = (agent: Agent) => {
    setInspectingAgent(agent);
  };

  // Extract unique Primary Use values for filtration
  const uniqueUses = Array.from(new Set(agents.map((a) => a.primaryUse)));

  // Filter Catalog agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPhase = 
      phaseFilter === "all" || agent.phase.toString() === phaseFilter;

    const matchesUse = 
      useFilter === "all" || agent.primaryUse === useFilter;

    return matchesSearch && matchesPhase && matchesUse;
  });

  return (
    <div id="va-bench-container" className="min-h-screen flex flex-col bg-slate-50/50">
      
      {/* PROFESSIONAL EXECUTIVE HEADER */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="h-5 w-px bg-slate-200"></div>
          <span className="text-xs sm:text-sm font-medium text-slate-500">va-bench</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-900 hidden sm:inline">VA Legal-Research Agent Catalog</span>
        </div>

        {/* Tab Navigation Bars */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-slate-950 font-sans shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Agent Catalog
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "playground"
                ? "bg-white text-slate-950 font-sans shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sandbox Playground
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "export"
                ? "bg-white text-slate-950 font-sans shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Export Station
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex -space-x-2 mr-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] text-slate-600 font-bold">JD</div>
            <div className="w-7 h-7 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[9px] text-indigo-700 font-bold">L2</div>
            <div className="w-7 h-7 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-[9px] text-emerald-700 font-bold">VA</div>
          </div>
          <button 
            onClick={() => {
              setActiveTab("export");
              setTimeout(() => {
                const trigger = document.querySelector('[title="Compiled TypeScript export bundle output"]') || document.getElementById("export-suite");
                if (trigger) {
                  trigger.scrollIntoView({ behavior: "smooth" });
                }
              }, 150);
            }}
            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Export
          </button>
        </div>
      </nav>

      {/* CORE INFORMATION BANNER */}
      <section className="bg-slate-50/50 border-b border-slate-200 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 leading-relaxed font-sans">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>
              <strong>20 agent prompts</strong> for VA legal research — editable, runnable in the sandbox, exportable as JSON or a TypeScript bundle.
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg shrink-0 w-fit">
            <span>20 / 20 prompts</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER CONTENT PAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* TAB VIEW 1: AGENT PORTAL CATALOG */}
        {activeTab === "dashboard" && (
          <div id="catalog-tab-content" className="space-y-6 fade-in">
            
            {/* SEARCH AND FILTER SHEET */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Left filter options */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
                {/* Search Text */}
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by agent name, phase, use or objective..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-950 focus:outline-none"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Phase Selection */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={phaseFilter}
                    onChange={(e: any) => setPhaseFilter(e.target.value)}
                    className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer outline-none"
                  >
                    <option value="all">All Phases</option>
                    <option value="1">Phase 1 (Deconstructor)</option>
                    <option value="2">Phase 2 (Specialist)</option>
                  </select>
                </div>
              </div>

              {/* Unique Primary Use filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-semibold font-sans">Primary Use:</span>
                <select
                  value={useFilter}
                  onChange={(e) => setUseFilter(e.target.value)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer outline-none"
                >
                  <option value="all">All Uses</option>
                  {uniqueUses.map((use) => (
                    <option key={use} value={use}>{use}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* RESULTS METADATA & GRID CONTAINER */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#475569] font-bold font-sans">
                  Found <span className="text-slate-900">{filteredAgents.length}</span> of 20 agents
                </span>
                
                {/* Reset filters helper link */}
                {(searchTerm || phaseFilter !== "all" || useFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPhaseFilter("all");
                      setUseFilter("all");
                    }}
                    className="text-xs text-indigo-600 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onSelectPlayground={handleSelectPlayground}
                      onInspectPrompt={handleInspectPrompt}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-sm mx-auto">
                  <div className="text-slate-300 mb-3 flex justify-center">
                    <Sliders className="w-12 h-12" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Matching Prompts Found</h4>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                    Adjust your active search or filters to review elements of the 20-agent deck.
                  </p>
                </div>
              )}
            </div>

            {/* QUICK TECHNICAL FOOTNOTE */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-4">
              <span className="text-lg leading-none mt-0.5">ℹ️</span>
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                  Procedural Lane Routing Guideline:
                </h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Before launching appellate lanes (HLR, Supplemental or CAVC), ensure the <strong>VA Intake Router</strong> and <strong>VA Decision Normalizer</strong> have fully registered the procedural posture of the rating decision. This is critical to avoid jurisdiction risk.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB VIEW 2: INTERACTIVE PLAYGROUND */}
        {activeTab === "playground" && (
          <div id="playground-tab-content" className="fade-in">
            <Playground
              agents={agents}
              selectedAgentId={selectedAgentId}
              onAgentChange={setSelectedAgentId}
              editedPrompts={editedPrompts}
              onPromptEdit={handlePromptEdit}
              onPromptReset={handlePromptReset}
            />
          </div>
        )}

        {/* TAB VIEW 3: CODE EXPORT PANELS */}
        {activeTab === "export" && (
          <div id="export-tab-content" className="fade-in">
            <ExportPanel
              agents={agents}
              editedPrompts={editedPrompts}
            />
          </div>
        )}

      </main>

      {/* CODE VIEW MODAL DETAILED PANEL */}
      {inspectingAgent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 block mb-1">
                  Active Instruction File: {inspectingAgent.suggestedFile}
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {inspectingAgent.name} System Instructions
                </h3>
              </div>
              <button 
                onClick={() => setInspectingAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 leading-none">
                  Core Objective Description
                </span>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {inspectingAgent.definition}
                </p>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 leading-none">
                  Exact System Prompt instructions
                </span>
                <textarea
                  readOnly
                  value={editedPrompts[inspectingAgent.id] || inspectingAgent.systemPrompt}
                  className="w-full h-80 p-4 border border-slate-200 rounded-xl bg-slate-950 font-mono text-xs text-indigo-200/90 leading-relaxed focus:outline-none"
                  title="ReadOnly detailed view of agent system prompt instructions"
                />
              </div>

              {/* Code footprint and file placement info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-100 rounded-lg p-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Suggested File Deployment
                  </span>
                  <span className="font-mono text-slate-700 leading-normal block">{inspectingAgent.suggestedFile}</span>
                </div>
                <div className="border border-slate-100 rounded-lg p-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">
                    Filing Phase Level
                  </span>
                  <span className="font-semibold text-[#1e293b] leading-normal block">
                    Phase {inspectingAgent.phase} - {inspectingAgent.phase === 1 ? "Decision Deconstructor" : "Specialist Expansion"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer triggers */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Variables are named <code>{inspectingAgent.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Prompt</code> in TS files.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInspectingAgent(null);
                    handleSelectPlayground(inspectingAgent);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold cursor-pointer"
                >
                  Load in Playground Sandbox
                </button>
                <button
                  onClick={() => setInspectingAgent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 px-6 shrink-0 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <p className="font-bold text-white text-xs">va-bench</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              Reference catalog of 20 prompts for a multi-agent VA legal-research pipeline. Educational use only — not legal advice and not legal representation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>MIT licensed</span>
            <span>•</span>
            <a href="https://github.com/va2ai/va-bench" className="hover:text-slate-300">github.com/va2ai/va-bench</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
