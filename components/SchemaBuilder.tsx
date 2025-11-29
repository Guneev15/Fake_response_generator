
import React, { useState } from 'react';
import { FieldType, FormField } from '../types';
import { Plus, Trash2, Settings2, Sparkles, Layers, Link2, Edit3 } from 'lucide-react';

interface SchemaBuilderProps {
  fields: FormField[];
  setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ fields, setFields }) => {
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FieldType>(FieldType.TEXT);
  const [newOptions, setNewOptions] = useState(''); // Comma separated for UI simplicity

  const addField = () => {
    if (!newLabel.trim()) return;

    const field: FormField = {
      id: `field_${Date.now()}`,
      label: newLabel,
      type: newType,
      options: (newType === FieldType.SELECT || newType === FieldType.CHECKBOX) 
        ? newOptions.split(',').map(s => s.trim()).filter(Boolean) 
        : undefined
    };

    setFields([...fields, field]);
    setNewLabel('');
    setNewOptions('');
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };
  
  const updateFieldType = (id: string, newType: FieldType) => {
    setFields(fields.map(f => {
        if (f.id === id) {
            return { ...f, type: newType };
        }
        return f;
    }));
  };

  const hasLinkedFields = fields.some(f => f.googleEntryId);

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Settings2 className="w-5 h-5" />
          </div>
          Form Schema
        </h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-md border ${hasLinkedFields ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
          {fields.length} Fields {hasLinkedFields ? '(Linked)' : ''}
        </span>
      </div>
      
      {/* Input Area */}
      <div className="space-y-4 mb-8 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/60">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Field Label</label>
            <input 
              type="text" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Full Name"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Data Type</label>
                <div className="relative">
                    <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as FieldType)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none text-sm cursor-pointer transition-all hover:border-indigo-300"
                    >
                    {Object.values(FieldType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                    </select>
                    <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
            </div>
            
            {(newType === FieldType.SELECT || newType === FieldType.CHECKBOX) && (
                <div className="col-span-2 sm:col-span-1 animate-in fade-in zoom-in duration-200">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Options</label>
                    <input 
                        type="text" 
                        value={newOptions}
                        onChange={(e) => setNewOptions(e.target.value)}
                        placeholder="Red, Green, Blue"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    />
                </div>
            )}
          </div>

          <button 
            onClick={addField}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white p-2.5 rounded-xl font-medium text-sm flex justify-center items-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:shadow-indigo-600/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Field to Schema
          </button>
        </div>
      </div>

      {/* Field List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {fields.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
             <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
             <p className="text-slate-400 text-sm">Start by adding a field or analyze a URL</p>
          </div>
        )}
        {fields.map((field) => (
          <div key={field.id} className={`group flex items-center justify-between p-3.5 bg-white rounded-xl border ${field.googleEntryId ? 'border-emerald-100 shadow-emerald-100/50' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${field.googleEntryId ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {field.googleEntryId ? <Link2 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1 grid grid-cols-2 gap-2">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-700 text-sm truncate" title={field.label}>{field.label}</h4>
                        {field.googleEntryId && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-medium text-emerald-600 shrink-0">Linked</span>
                        )}
                    </div>
                    {field.options && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">• {field.options.join(', ')}</span>
                    )}
                </div>
                
                {/* Type Selector */}
                <div className="relative">
                    <select 
                        value={field.type}
                        onChange={(e) => updateFieldType(field.id, e.target.value as FieldType)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 font-medium outline-none focus:border-indigo-400 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                         {Object.values(FieldType).map(t => (
                            <option key={t} value={t}>{t}</option>
                         ))}
                    </select>
                    <Edit3 className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <button 
              onClick={() => removeField(field.id)}
              className="p-2 ml-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
