import React, { useState, useCallback } from 'react';
import { SchemaBuilder } from './components/SchemaBuilder';
import { SimulationRunner } from './components/SimulationRunner';
import { Dashboard } from './components/Dashboard';
import { FormField, GeneratedRecord, SimulationStatus, FieldType } from './types';
import { generateFakeRecord, sleep } from './utils/generator';
import { Layout, ShieldAlert } from 'lucide-react';

export default function App() {
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f1', label: 'Full Name', type: FieldType.TEXT },
    { id: 'f2', label: 'Email Address', type: FieldType.EMAIL },
    { id: 'f3', label: 'City', type: FieldType.TEXT },
    { id: 'f4', label: 'Age Group', type: FieldType.SELECT, options: ['18-24', '25-34', '35-44', '45+'] },
  ]);
  
  const [count, setCount] = useState<number>(50);
  const [formUrl, setFormUrl] = useState<string>('');
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [generatedData, setGeneratedData] = useState<GeneratedRecord[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('');

  const runSimulation = useCallback(async () => {
    if (fields.length === 0) {
      alert("Please define at least one field.");
      return;
    }

    if (!formUrl.includes('google.com/forms')) {
        if (!confirm("The URL does not look like a standard Google Form URL. Continue anyway?")) {
            return;
        }
    }

    setStatus('running');
    setGeneratedData([]);
    setProgress(0);
    setCurrentLog(`Connecting to form: ${formUrl.substring(0, 30)}...`);
    await sleep(1000);

    const newData: GeneratedRecord[] = [];
    
    for (let i = 0; i < count; i++) {
      // Simulate network/processing delay
      await sleep(Math.random() * 50 + 20); 
      
      const record = generateFakeRecord(fields);
      newData.push(record);
      
      // Update progress
      const percent = ((i + 1) / count) * 100;
      setProgress(percent);
      
      const nameField = fields.find(f => f.type === FieldType.TEXT && f.label.toLowerCase().includes('name'));
      const displayLog = nameField ? `Submitted response for: ${record[nameField.id]}` : `Submitted record ${record.id}`;
      setCurrentLog(displayLog);
    }

    setGeneratedData(newData);
    setStatus('completed');
    setCurrentLog(`Successfully generated ${count} responses linked to survey.`);
  }, [count, fields, formUrl]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Layout className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">FormQA <span className="font-normal text-slate-500 text-sm">Synthetic Data Generator</span></h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            <ShieldAlert className="w-3 h-3" />
            QA Testing Mode Only
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <SchemaBuilder fields={fields} setFields={setFields} />
            <SimulationRunner 
              count={count} 
              setCount={setCount} 
              status={status} 
              onStart={runSimulation}
              progress={progress}
              currentLog={currentLog}
              formUrl={formUrl}
              setFormUrl={setFormUrl}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <Dashboard data={generatedData} fields={fields} />
          </div>

        </div>
      </main>
    </div>
  );
}