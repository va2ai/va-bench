import React, { useState } from "react";
import { Agent } from "../types";
import { Copy, Code, ArrowRight, CheckCircle2 } from "lucide-react";

interface AgentCardProps {
  key?: string;
  agent: Agent;
  onSelectPlayground: (agent: Agent) => void;
  onInspectPrompt: (agent: Agent) => void;
}

export default function AgentCard({ agent, onSelectPlayground, onInspectPrompt }: AgentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(agent.systemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  return (
    <div 
      id={`agent-card-${agent.id}`}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
            agent.phase === 1 
              ? "bg-sky-50 text-sky-700 border border-sky-200/60" 
              : "bg-indigo-50 text-indigo-750 border border-indigo-200/60"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              agent.phase === 1 ? "bg-sky-500" : "bg-indigo-600"
            }`}></span>
            Phase {agent.phase}: {agent.phase === 1 ? "Deconstructor" : "Specialist"}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
            {agent.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
          {agent.name}
        </h3>

        {/* Primary Use Subtitle */}
        <p className="text-[11px] font-bold font-mono text-indigo-800 mb-3 bg-indigo-50/50 border border-indigo-100/45 px-2 py-0.5 rounded inline-block">
          Primary Use: {agent.primaryUse}
        </p>

        {/* Short definition */}
        <p className="text-xs text-[#475569] leading-relaxed mb-4 font-normal">
          {agent.definition}
        </p>
      </div>

      {/* Suggested File Path */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <span className="block text-[10px] font-mono text-[#64748b] mb-4 truncate" title={agent.suggestedFile}>
          File: {agent.suggestedFile}
        </span>

        {/* Dynamic Interactive Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Inspect System Prompt */}
          <button
            onClick={() => onInspectPrompt(agent)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            Inspect Code
          </button>

          {/* Load in Playground */}
          <button
            onClick={() => onSelectPlayground(agent)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-indigo-100"
          >
            Playground
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Quick Utility copy */}
        <button
          onClick={handleCopyPrompt}
          className="w-full mt-2 flex items-center justify-center gap-1 py-1 px-2 text-[10px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Prompt Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Full Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
