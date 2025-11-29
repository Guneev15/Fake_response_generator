
import React from 'react';
import { Play, Loader2, CheckCircle, Link as LinkIcon, Lock, Terminal, Zap, Search, Wand2, Square, Gauge, MousePointer2, Rocket, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { SimulationStatus, FormField } from '../types';
import { generateConsoleScript } from '../utils/googleFormUtils';

interface SimulationRunnerProps {
  count: number;
  setCount: (n: number) => void;
  status: SimulationStatus;
  onStart: () => void;
  onStop: () => void;
  onAnalyze: () => void;
  progress: number;
  currentLog: string;
  formUrl: string;
  setFormUrl: (url: string) => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  isPaid: boolean;
  speed: 'safe' | 'balanced' | 'fast';
  setSpeed: (s: 'safe' | 'balanced' | 'fast') => void;
  fields: FormField[];
}

export const SimulationRunner: React.FC<SimulationRunnerProps> = ({ 
  count, 
  setCount, 
  status, 
  onStart,
  onStop,
  onAnalyze, 
  progress,
  currentLog,
  formUrl,
  setFormUrl,
  sheetUrl,
  setSheetUrl,
  isPaid,
  speed,
  setSpeed,
  fields
}) => {
  const [copied, setCopied] = React.useState(false);
  const isAnalyzing = status === 'analyzing';
  const isRunning = status === 'running';
  const isBusy = isAnalyzing || isRunning;

  const handleCopyScript = () => {
    if (fields.length === 0) return;
    const script = generateConsoleScript(fields, count);
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Zap className="w-5 h-5" />
         </div>
         <h2 className="text-lg font-bold text-slate-800">Run Simulation</h2>
      </div>

      <div className="space-y-5">
        {/* Form URL Input with Analyze Button */}
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
            Target Google Form
            </label>
            <div className="flex gap-2">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        placeholder="https://docs.google.com/forms/d/e/..."
                        disabled={isBusy}
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </div>
                <button
                    onClick={onAnalyze}
                    disabled={isBusy || !formUrl}
                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm"
                    title="Scan Form Structure"
                >
                    {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{isAnalyzing ? 'Scanning...' : 'Analyze'}</span>
                </button>
            </div>
        </div>

        {/* Google Sheet URL Input (Optional) */}
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
            Link Google Sheet (Optional)
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FileSpreadsheet className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="Paste Google Apps Script / Webhook URL"
                    disabled={isBusy}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400"
                />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                For direct appending, use a deployed Web App URL.
            </p>
        </div>

        {/* Slider */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Profiles Generated
                </label>
                <span className="text-emerald-600 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded text-sm border border-emerald-100">
                    {count}
                </span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="500" 
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                disabled={isBusy}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                <span>1</span>
                <span>250</span>
                <span>500</span>
            </div>
        </div>

        {/* Speed Control */}
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">
            Submission Speed
            </label>
            <div className="grid grid-cols-3 gap-2">
                <button 
                    onClick={() => setSpeed('safe')}
                    disabled={isBusy}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${speed === 'safe' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <MousePointer2 className="w-4 h-4 mb-1" />
                    Safe
                </button>
                <button 
                    onClick={() => setSpeed('balanced')}
                    disabled={isBusy}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${speed === 'balanced' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <Gauge className="w-4 h-4 mb-1" />
                    Normal
                </button>
                <button 
                    onClick={() => setSpeed('fast')}
                    disabled={isBusy}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${speed === 'fast' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <Rocket className="w-4 h-4 mb-1" />
                    Turbo
                </button>
            </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
            {isRunning ? (
                <button 
                    onClick={onStop}
                    className="group w-full py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2.5 transition-all"
                >
                    <Square className="w-5 h-5 fill-current" />
                    Stop Simulation
                </button>
            ) : (
                <button 
                onClick={onStart}
                disabled={isBusy}
                className={`
                    group w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98]
                    ${status === 'completed' || status === 'stopped'
                        ? 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20' 
                        : isPaid 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-slate-700 to-slate-900 hover:shadow-lg hover:shadow-slate-800/30'
                    }
                `}
                >
                {status === 'completed' ? (
                    <>
                    <CheckCircle className="w-5 h-5" />
                    Run Again
                    </>
                ) : !isPaid ? (
                    <>
                    <Lock className="w-4 h-4 text-slate-300" />
                    Unlock Generator
                    </>
                ) : (
                    <>
                    <Play className="w-5 h-5 fill-current" />
                    Start Generation
                    </>
                )}
                </button>
            )}

            {/* Copy Script Fallback */}
            {fields.some(f => f.googleEntryId) && !isRunning && (
                <button 
                    onClick={handleCopyScript}
                    className="w-full py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs font-medium flex items-center justify-center gap-2"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Terminal className="w-3.5 h-3.5" />}
                    {copied ? "Script Copied!" : "Copy Console Script"}
                </button>
            )}
        </div>
        
        {!isPaid && (
             <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                Requires premium activation
             </div>
        )}
        
        {/* Terminal Window */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-slate-900/20 bg-[#1e1e1e] flex flex-col h-48">
             {/* Terminal Header */}
             <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#3e3e3e]">
                 <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-50">
                     <Terminal className="w-3 h-3 text-slate-400" />
                     <span className="text-[10px] font-mono text-slate-400">bash — node</span>
                 </div>
             </div>
             
             {/* Terminal Content */}
             <div className="p-4 font-mono text-xs flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                <div className="space-y-1">
                    {status === 'idle' && <span className="text-slate-500">root@formqa:~# Waiting for target URL...</span>}
                    {status === 'stopped' && <span className="text-red-400">root@formqa:~# Process interrupted by user.</span>}
                    
                    {currentLog && (
                        <div className="flex gap-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
                            <span className="text-emerald-500">➜</span>
                            <span className="text-slate-300">{currentLog}</span>
                        </div>
                    )}
                    
                    {copied && (
                         <div className="flex gap-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
                            <span className="text-emerald-500">➜</span>
                            <span className="text-amber-400">Copied runner script to clipboard.</span>
                        </div>
                    )}
                    
                    <div className="mt-3">
                         <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>PROGRESS</span>
                            <span>{Math.round(progress)}%</span>
                         </div>
                         <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
