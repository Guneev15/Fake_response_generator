import React from 'react';
import { LayoutDashboard, Zap, BarChart3, Settings, ShieldAlert, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPaid: boolean;
  onUnlock: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isPaid, onUnlock }) => {
  const navItems = [
    { id: 'generator', label: 'Generator', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 transition-all duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">FormQA</h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pro Console</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800/50 space-y-4">
        {!isPaid && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-2 mb-2">
               <ShieldAlert className="w-4 h-4 text-amber-400" />
               <span className="text-xs font-bold text-slate-200">Free Plan</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              Limited to 50 records per run. Unlock unlimited generation.
            </p>
            <button 
              onClick={onUnlock}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        {isPaid && (
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">Pro Active</div>
                  <div className="text-[10px] text-emerald-400">License Valid</div>
              </div>
           </div>
        )}

        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
           <LogOut className="w-3.5 h-3.5" />
           Sign Out
        </button>
      </div>
    </div>
  );
};