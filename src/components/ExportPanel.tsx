import React, { useState } from "react";
import { Agent } from "../types";
import { Copy, Check, FileCode, CheckSquare, Download, CodeXml } from "lucide-react";

interface ExportPanelProps {
  agents: Agent[];
  editedPrompts: Record<string, string>;
}

export default function ExportPanel({ agents, editedPrompts }: ExportPanelProps) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0].id);
  const [copied, setCopied] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const activePrompt = editedPrompts[selectedAgent.id] || selectedAgent.systemPrompt;

  // Format the helper export variable name based on the ID
  const getPromptVarName = (id: string) => {
    // E.g. va-intake-router -> vaIntakeRouterPrompt
    const camelCased = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return `${camelCased}Prompt`;
  };

  const getTSFileOutput = (agent: Agent, promptText: string) => {
    return `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VA Benefits Legal-Tech Intelligence Suite
 * Agent Prompt: ${agent.name}
 * ID: ${agent.id}
 */

export const ${getPromptVarName(agent.id)} = \`
${promptText}
\`;
`;
  };

  const currentTSFileContent = getTSFileOutput(selectedAgent, activePrompt);

  const handleCopyTS = async () => {
    try {
      await navigator.clipboard.writeText(currentTSFileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTS = () => {
    const blob = new Blob([currentTSFileContent], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Download matching Suggested File name
    const pieces = selectedAgent.suggestedFile.split("/");
    const fileName = pieces[pieces.length - 1];
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Compile the completely customized pack as descriptive JSON
  const getFullPackJSON = () => {
    const pack = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      phase: agent.phase,
      primaryUse: agent.primaryUse,
      definition: agent.definition,
      suggestedFile: agent.suggestedFile,
      systemPrompt: editedPrompts[agent.id] || agent.systemPrompt
    }));
    return JSON.stringify({
      schema: "lavern-agent-pack-v1",
      timestamp: new Date().toISOString(),
      agentCount: pack.length,
      agents: pack
    }, null, 2);
  };

  const handleCopyJSONBatch = async () => {
    try {
      await navigator.clipboard.writeText(getFullPackJSON());
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadJSONBatch = () => {
    const blob = new Blob([getFullPackJSON()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "va-agent-pack-lavern-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="export-suite" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      
      {/* SECTION HEADER */}
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CodeXml className="w-5 h-5 text-indigo-600" />
          Prompt Export Station &amp; Roster Compiler
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Deliver the complete agent deck directly into codebase directories. Download single TypeScript module files or copy the entire consolidated JSON package.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SOURCE SELECTION & ACTION CARD */}
        <div className="space-y-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              1. Select Export Target
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 font-sans">
                  Choose Target Agent Prompt:
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-semibold"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="block text-[10px] font-mono text-slate-400">
                  Target Path: <strong className="text-slate-600 font-normal">{selectedAgent.suggestedFile}</strong>
                </span>
                <span className="block text-[10px] font-mono text-slate-400">
                  Variable Name: <strong className="text-slate-600 font-normal">{getPromptVarName(selectedAgent.id)}</strong>
                </span>
              </div>
            </div>

            {/* Individual actions */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyTS}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-none" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy File"}
              </button>

              <button
                onClick={handleDownloadTS}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download TS
              </button>
            </div>
          </div>

          {/* BULK PACKAGE BUILDER CARD */}
          <div className="border border-[#e2e8f0] rounded-xl p-5 bg-indigo-50/10">
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-700 shrink-0" />
              2. Consolidated Export Pack
            </h3>
            <p className="text-[11px] text-indigo-900/80 mb-4 leading-relaxed font-sans">
              Compile the custom configurations of all 20 agents (incorporating your active edits) into a structured manifest.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleCopyJSONBatch}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-indigo-200 bg-white text-[#4f46e5] hover:bg-indigo-50/50 cursor-pointer"
              >
                {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-none" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBatch ? "Full Pack Copied!" : "Copy Full Pack JSON"}
              </button>

              <button
                onClick={handleDownloadJSONBatch}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                Download Pack JSON
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT TWO COLUMNS: LIVE TS FILE CODE PREVIEW */}
        <div className="lg:col-span-2 flex flex-col justify-between border border-slate-200 rounded-xl bg-slate-50 p-4">
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 mb-3 shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                TypeScript Code Output Preview:
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200/50 px-2 py-0.5 rounded leading-none font-semibold">
                {selectedAgent.suggestedFile.split("/").pop()}
              </span>
            </div>

            <textarea
              readOnly
              value={currentTSFileContent}
              className="flex-1 min-h-[420px] w-full p-4 rounded-xl border border-slate-200 bg-slate-950 font-mono text-xs text-indigo-200/90 leading-relaxed focus:outline-none"
              title="Compiled TypeScript export bundle output"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
