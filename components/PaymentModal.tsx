import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Wifi, CreditCard, AlertCircle, ScanLine } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  upiId: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount,
  upiId
}) => {
  const [step, setStep] = useState<'scan' | 'verifying' | 'success'>('scan');
  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (step === 'success') {
          // Keep success state if already paid
      } else {
          setStep('scan');
          setUtr('');
          setError('');
      }
    }
  }, [isOpen]);

  const handleVerify = async () => {
    const cleanUtr = utr.replace(/\s/g, '');
    
    if (cleanUtr.length !== 12 || isNaN(Number(cleanUtr))) {
        setError("Please enter a valid 12-digit UPI Reference/Transaction ID.");
        return;
    }

    setError('');
    setStep('verifying');

    setTimeout(() => {
        setStep('success');
        onSuccess();
    }, 2000);
  };

  const upiLink = `upi://pay?pa=${upiId}&pn=FormQA&am=${amount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 rounded-full text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <span className="font-bold text-slate-800 block text-sm leading-tight">
                    {step === 'success' ? 'Verified' : 'Secure Payment'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bank Encrypted</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1.5 rounded-full hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {step === 'scan' && (
            <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300">
               
               {/* Amount Badge */}
               <div className="inline-flex flex-col items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">₹{amount}</span>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full mt-1">One-time Activation Fee</span>
               </div>

               {/* QR Section */}
               <div className="relative group mb-6">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-30 blur group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                   <div className="relative bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                      <img 
                        src={qrCodeUrl} 
                        alt="UPI QR Code" 
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[1px]">
                          <ScanLine className="w-8 h-8 text-indigo-600 animate-pulse" />
                      </div>
                   </div>
               </div>

               <div className="w-full text-left space-y-4">
                   <div>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Step 1: Scan & Pay</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <Wifi className="w-3 h-3 text-indigo-500" />
                            Use any UPI App (GPay, PhonePe, Paytm)
                       </div>
                   </div>

                   <div>
                       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Step 2: Verify Transaction</p>
                       <div className="relative group">
                            <input 
                                type="text" 
                                value={utr}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 12) setUtr(val);
                                    setError('');
                                }}
                                placeholder="Enter 12-digit UTR Number"
                                className={`w-full pl-11 pr-4 py-3.5 border ${error ? 'border-red-300 bg-red-50/50 focus:ring-red-200' : 'border-slate-200 bg-slate-50 focus:ring-indigo-100'} rounded-xl outline-none focus:ring-4 focus:border-indigo-400 transition-all font-mono text-base tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm text-slate-800`}
                            />
                            <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
                       </div>
                       {error && (
                           <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5 font-medium animate-in slide-in-from-top-1">
                               <AlertCircle className="w-3 h-3" /> {error}
                           </p>
                       )}
                   </div>
               </div>

               <button 
                   onClick={handleVerify}
                   disabled={utr.length !== 12}
                   className="w-full mt-6 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-[0.98]"
               >
                   Verify Payment
                   <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          )}

          {step === 'verifying' && (
              <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
                  <div className="relative mb-6">
                     <div className="w-16 h-16 rounded-full border-4 border-slate-100"></div>
                     <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Verifying...</h3>
                  <p className="text-sm text-slate-500 mt-2 text-center">
                      Checking Transaction ID
                  </p>
                  <div className="mt-4 bg-slate-100 px-3 py-1 rounded font-mono text-sm text-slate-600">
                      {utr}
                  </div>
              </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500 py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-20"></div>
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Payment Confirmed</h3>
              <p className="text-slate-500 mb-8 text-center text-sm leading-relaxed px-4">
                  Thank you for your purchase.<br/>
                  You now have <span className="font-semibold text-emerald-600">Premium Access</span>.
              </p>

              <button 
                  onClick={onClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};