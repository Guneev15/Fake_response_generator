
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { GeneratedRecord, FormField, FieldType } from '../types';
import { Download, Users, CheckCircle2, LayoutList, FileJson, FileSpreadsheet, Activity } from 'lucide-react';

interface DashboardProps {
  data: GeneratedRecord[];
  fields: FormField[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ data, fields }) => {
  
  const downloadJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "generated_profiles.json";
    link.click();
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const headers = fields.map(f => f.label).join(',');
    const fieldIds = fields.map(f => f.id);
    const rows = data.map(record => {
      return fieldIds.map(id => {
        let val = record[id];
        if (Array.isArray(val)) val = val.join('; ');
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(',');
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "generated_profiles.csv";
    link.click();
  };

  const getChartData = (field: FormField) => {
    if (![FieldType.SELECT, FieldType.CHECKBOX, FieldType.LINEAR_SCALE].includes(field.type)) return null;

    const counts: Record<string, number> = {};
    data.forEach(record => {
      const value = record[field.id];
      if (Array.isArray(value)) {
        value.forEach(v => counts[v] = (counts[v] || 0) + 1);
      } else {
        const vStr = String(value);
        counts[vStr] = (counts[vStr] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const chartableFields = fields.filter(f => 
    [FieldType.SELECT, FieldType.CHECKBOX, FieldType.LINEAR_SCALE].includes(f.type)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time insights from your synthetic data generation run.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={downloadCSV} disabled={data.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-all text-sm font-medium">
                <FileSpreadsheet className="w-4 h-4" /> CSV
            </button>
            <button onClick={downloadJSON} disabled={data.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/20 text-sm font-medium">
                <FileJson className="w-4 h-4" /> JSON
            </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <LayoutList className="w-8 h-8 text-slate-300" />
           </div>
           <p className="text-lg font-medium text-slate-500">No data generated yet</p>
           <p className="text-sm text-slate-400">Run the simulation to visualize results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Col: Stats & Charts */}
          <div className="lg:col-span-2 space-y-6">
             {/* KPI Cards */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Records</div>
                   <div className="text-3xl font-bold text-indigo-600">{data.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Success Rate</div>
                   <div className="text-3xl font-bold text-emerald-600">100%</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Fields</div>
                   <div className="text-3xl font-bold text-amber-600">{fields.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Format</div>
                   <div className="text-xl font-bold text-slate-700 truncate">JSON/CSV</div>
                </div>
             </div>

             {/* Charts Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {chartableFields.map((field, idx) => {
                 const chartData = getChartData(field);
                 if (!chartData) return null;
                 return (
                   <div key={field.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wide">{field.label}</h3>
                     <div className="h-48">
                       <ResponsiveContainer width="100%" height="100%">
                         {idx % 2 === 0 ? (
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis dataKey="name" hide />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         ) : (
                            <PieChart>
                               <Pie data={chartData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                 {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                               </Pie>
                               <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            </PieChart>
                         )}
                       </ResponsiveContainer>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

          {/* Right Col: Recent Activity Feed */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                   <Activity className="w-4 h-4 text-slate-400" />
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Live Feed</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[600px] custom-scrollbar">
                   {data.slice().reverse().map((record, i) => (
                      <div key={record.id} className="p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs border border-transparent hover:border-slate-100">
                         <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-slate-400 text-[10px]">{record.id}</span>
                            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Sent</span>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            {fields.slice(0, 3).map(f => (
                               <div key={f.id} className="truncate">
                                  <span className="text-slate-400 mr-1">{f.label}:</span>
                                  <span className="text-slate-700 font-medium">
                                      {Array.isArray(record[f.id]) ? '[Array]' : record[f.id]}
                                  </span>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
