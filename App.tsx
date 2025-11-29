
import React, { useState, useCallback, useRef } from 'react';
import { SchemaBuilder } from './components/SchemaBuilder';
import { SimulationRunner } from './components/SimulationRunner';
import { Dashboard } from './components/Dashboard';
import { PaymentModal } from './components/PaymentModal';
import { Sidebar } from './components/Sidebar';
import { FormField, GeneratedRecord, SimulationStatus, FieldType } from './types';
import { generateFakeRecord, sleep } from './utils/generator';
import { analyzeGoogleForm, submitToGoogleForm, submitToGoogleSheet } from './utils/googleFormUtils';
import { Zap, BarChart3, Bell, UserCircle } from 'lucide-react';

// CONFIGURATION
const UPI_ID = "guneevt-1@oksbi"; 
const ACCESS_PRICE = 99; 

export default function App() {
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f1', label: 'Full Name', type: FieldType.TEXT },
    { id: 'f2', label: 'Roll Number', type: FieldType.NUMBER },
    { id: 'f3', label: 'Hostel', type: FieldType.TEXT },
    { id: 'f4', label: 'Email Address', type: FieldType.EMAIL },
    { id: 'f5', label: 'City', type: FieldType.TEXT },
  ]);
  
  const [count, setCount] = useState<number>(50);
  const [formUrl, setFormUrl] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [generatedData, setGeneratedData] = useState<GeneratedRecord[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState('');
  const [speed, setSpeed] = useState<'safe' | 'balanced' | 'fast'>('balanced');
  
  // Refs for control
  const stopSimulationRef = useRef(false);

  // UI State
  const [activeTab, setActiveTab] = useState('generator');
  const [isPaid, setIsPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleStartClick = () => {
    if (!isPaid) {
      setShowPayment(true);
      return;
    }
    runSimulation();
  };

  const handleStopClick = () => {
    stopSimulationRef.current = true;
    setStatus('stopped');
    setCurrentLog('Stopping simulation...');
  };

  const handleAnalyzeClick = async () => {
    if (!formUrl.includes('docs.google.com/forms')) {
        alert("Please enter a valid Google Form URL");
        return;
    }

    setStatus('analyzing');
    setCurrentLog("Fetching form structure via proxy...");
    setProgress(10);

    try {
        await sleep(800); // UI feel
        const analyzedFields = await analyzeGoogleForm(formUrl);
        setFields(analyzedFields);
        setCurrentLog(`Success! Found ${analyzedFields.length} fields in the form.`);
        setProgress(100);
        await sleep(500);
        setStatus('idle');
    } catch (error) {
        console.error(error);
        setCurrentLog(`Error: Could not analyze form. Check URL permissions.`);
        setStatus('idle');
        alert("Failed to analyze the form. Ensure it is publicly accessible.");
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
  };

  const runSimulation = useCallback(async () => {
    if (fields.length === 0) {
      alert("Please define at least one field.");
      return;
    }

    if (!formUrl) {
      alert("Please enter a Google Form URL.");
      return;
    }

    if (!formUrl.includes('google.com/forms')) {
        if (!confirm("The URL does not look like a standard Google Form URL. Continue anyway?")) {
            return;
        }
    }

    stopSimulationRef.current = false;
    setStatus('running');
    setGeneratedData([]);
    setProgress(0);
    setCurrentLog(`Initializing injection engine for: ${formUrl.substring(0, 30)}...`);
    await sleep(1000);

    const newData: GeneratedRecord[] = [];
    let successCount = 0;
    
    // Speed settings (ms)
    let delayBase = 1500; 
    if (speed === 'safe') delayBase = 3000;
    if (speed === 'fast') delayBase = 500;

    for (let i = 0; i < count; i++) {
      if (stopSimulationRef.current) {
          break;
      }

      // Generate Data
      const record = generateFakeRecord(fields);
      newData.push(record);
      
      // Submit if mapped
      const hasMappings = fields.some(f => f.googleEntryId);
      
      if (hasMappings) {
          setCurrentLog(`Submitting record ${i+1}/${count} to Google...`);
          
          // Calculate dynamic delay based on speed setting + random variance
          const variance = Math.random() * 500;
          await sleep(delayBase + variance); 

          await submitToGoogleForm(formUrl, record, fields);
          successCount++;
      }

      // Optional: Submit to Google Sheet / Webhook
      // We run this even if no mapping exists, provided the user gave a URL.
      // But typically it runs in tandem.
      if (sheetUrl) {
        if (!hasMappings) await sleep(200); // specific delay if not submitting to form
        submitToGoogleSheet(sheetUrl, record).catch(err => console.warn("Sheet sync warning:", err));
      } else if (!hasMappings) {
          await sleep(50); // Simulation only
      }
      
      // Update progress
      const percent = ((i + 1) / count) * 100;
      setProgress(percent);
      
      if (!hasMappings && !sheetUrl) {
        const nameField = fields.find(f => f.type === FieldType.TEXT && f.label.toLowerCase().includes('name'));
        const displayLog = nameField ? `Generated: ${record[nameField.id]}` : `Generated record ${record.id}`;
        setCurrentLog(displayLog);
      }
      
      // Live update the table every 5 records to show progress
      if (i % 5 === 0) {
        setGeneratedData([...newData]);
      }
    }

    setGeneratedData(newData);
    if (!stopSimulationRef.current) {
        setStatus('completed');
        setCurrentLog(`Successfully processed ${count} records. Sync complete.`);
    } else {
        setCurrentLog(`Simulation stopped by user. Processed ${newData.length} records.`);
    }
  }, [count, fields, formUrl, sheetUrl, speed]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-inter">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isPaid={isPaid} 
        onUnlock={() => setShowPayment(true)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">
                    {activeTab === 'generator' && 'Data Generator'}
                    {activeTab === 'analytics' && 'Analytics Dashboard'}
                    {activeTab === 'settings' && 'Settings'}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-[1px] bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-slate-700">Admin User</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">Workspace Owner</div>
                    </div>
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
                        <UserCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
                
                {/* Generator Tab */}
                <div className={`${activeTab === 'generator' ? 'block' : 'hidden'} h-full flex flex-col`}>
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                         {/* Configuration Panel */}
                         <div className="lg:col-span-7 space-y-6">
                             <SchemaBuilder fields={fields} setFields={setFields} />
                         </div>
                         
                         {/* Execution Panel */}
                         <div className="lg:col-span-5 space-y-6 sticky top-0">
                             <SimulationRunner 
                                count={count} 
                                setCount={setCount} 
                                status={status} 
                                onStart={handleStartClick}
                                onStop={handleStopClick}
                                onAnalyze={handleAnalyzeClick}
                                progress={progress}
                                currentLog={currentLog}
                                formUrl={formUrl}
                                setFormUrl={setFormUrl}
                                sheetUrl={sheetUrl}
                                setSheetUrl={setSheetUrl}
                                isPaid={isPaid}
                                speed={speed}
                                setSpeed={setSpeed}
                                fields={fields}
                             />
                         </div>
                     </div>
                </div>

                {/* Analytics Tab */}
                <div className={`${activeTab === 'analytics' ? 'block' : 'hidden'} h-full`}>
                    <Dashboard data={generatedData} fields={fields} />
                </div>

                {/* Settings Tab (Placeholder) */}
                {activeTab === 'settings' && (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
                         <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <Settings className="w-8 h-8 text-slate-300" />
                         </div>
                         <h3 className="text-lg font-semibold text-slate-600">Global Settings</h3>
                         <p className="text-sm max-w-md text-center mt-2">Configure proxy servers, default delay intervals, and export preferences here.</p>
                    </div>
                )}

            </div>
        </main>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        onSuccess={handlePaymentSuccess}
        amount={ACCESS_PRICE}
        upiId={UPI_ID}
      />
    </div>
  );
}

function Settings(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
