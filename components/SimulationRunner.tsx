import React from 'react';
import { Play, Loader2, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { SimulationStatus } from '../types';

interface SimulationRunnerProps {
  count: number;
  setCount: (n: number) => void;
  status: SimulationStatus;
  onStart: () => void;
  progress: number;
  currentLog: string;
  formUrl: string;
  setFormUrl: (url: string) => void;
}

export const SimulationRunner: React.FC<SimulationRunnerProps> = ({ 
  count, 
  setCount, 
  status, 
  onStart, 
  progress,
  currentLog,
  formUrl,
  setFormUrl
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Play className="w-5 h-5 text-emerald-600" />
        2. Link & Run Simulation
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Target Google Form URL
        </label>
        <div className="flex items-center gap-2">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/..."
                    disabled={status === 'running'}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
            Paste the Google Form URL to link generated responses to this survey context.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Number of User Profiles to Generate
        </label>
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="1" 
            max="500" 
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            disabled={status === 'running'}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="font-mono text-lg font-bold text-emerald-600 w-16 text-right">{count}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={onStart}
          disabled={status === 'running' || !formUrl}
          className={`
            w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all
            ${status === 'running' || !formUrl ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'}
          `}
        >
          {status === 'running' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : status === 'completed' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Run Again
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Generation
            </>
          )}
        </button>
        {!formUrl && (
            <p className="text-xs text-amber-600 text-center">Please enter a Google Form URL to start.</p>
        )}

        {/* Terminal/Log Window */}
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto flex flex-col-reverse">
          <div className="text-emerald-400">
             {status === 'idle' && <span className="text-slate-500"># Waiting for form URL configuration...</span>}
             {currentLog && <span>{`> ${currentLog}`}</span>}
             <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
             </div>
             {status === 'running' && <p className="text-slate-400 mt-1 text-center">{Math.round(progress)}%</p>}
          </div>
        </div>
      </div>
    </div>
  );
};