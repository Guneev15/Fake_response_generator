import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { GeneratedRecord, FormField, FieldType } from '../types';
import { Download } from 'lucide-react';

interface DashboardProps {
  data: GeneratedRecord[];
  fields: FormField[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ data, fields }) => {
  
  const downloadJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "generated_profiles.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartData = (field: FormField) => {
    if (field.type !== FieldType.SELECT && field.type !== FieldType.CHECKBOX) return null;

    const counts: Record<string, number> = {};
    
    data.forEach(record => {
      const value = record[field.id];
      if (Array.isArray(value)) {
        value.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
      } else {
        const vStr = String(value);
        counts[vStr] = (counts[vStr] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Only show charts for categorical data
  const categoricalFields = fields.filter(f => f.type === FieldType.SELECT || f.type === FieldType.CHECKBOX);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">3. Results & Analytics</h2>
        <button 
          onClick={downloadJSON}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Download JSON
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <p>No data generated yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-indigo-600 text-sm font-medium">Total Profiles</p>
              <p className="text-2xl font-bold text-indigo-900">{data.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-emerald-600 text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-emerald-900">100%</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-amber-600 text-sm font-medium">Fields Per Profile</p>
              <p className="text-2xl font-bold text-amber-900">{fields.length}</p>
            </div>
             <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Format</p>
              <p className="text-xl font-bold text-slate-900">JSON</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoricalFields.map(field => {
              const chartData = getChartData(field);
              if (!chartData || chartData.length === 0) return null;

              return (
                <div key={field.id} className="p-4 border border-slate-100 rounded-lg shadow-sm">
                  <h3 className="text-md font-semibold text-slate-700 mb-4">{field.label} Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Preview Table */}
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-md font-semibold text-slate-700 mb-4">Data Preview (First 10 Records)</h3>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {fields.map(f => (
                    <th key={f.id} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    {fields.map(f => (
                      <td key={`${record.id}-${f.id}`} className="px-6 py-4 whitespace-nowrap text-slate-700">
                        {Array.isArray(record[f.id]) 
                          ? (record[f.id] as string[]).join(', ') 
                          : String(record[f.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
