import React, { useState } from 'react';
import { FieldType, FormField } from '../types';
import { Plus, Trash2, Settings } from 'lucide-react';

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-600" />
        1. Define Form Schema
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Field Label</label>
            <input 
              type="text" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Full Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value as FieldType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.values(FieldType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          {(newType === FieldType.SELECT || newType === FieldType.CHECKBOX) && (
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Options (comma separated)</label>
              <input 
                type="text" 
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="Red, Green, Blue"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          <div className="md:col-span-1">
            <button 
              onClick={addField}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg flex justify-center items-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Field List */}
      <div className="space-y-2">
        {fields.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-4 italic">No fields defined. Add one above.</p>
        )}
        {fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="font-medium text-slate-700">{field.label}</span>
              <span className="ml-2 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">{field.type}</span>
              {field.options && (
                <p className="text-xs text-slate-500 mt-1">Options: {field.options.join(', ')}</p>
              )}
            </div>
            <button 
              onClick={() => removeField(field.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
