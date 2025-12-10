import React, { useState } from 'react';
import { Button } from './Button';
import { RideOption } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  ride: RideOption | undefined;
  onCancel: () => void;
  onConfirm: () => void;
  formattedPrice?: string; // Add formatted price prop
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, ride, onCancel, onConfirm, formattedPrice }) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !ride) return null;

  const displayPrice = formattedPrice || `$${ride.price.toFixed(2)}`;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onConfirm();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
          <button onClick={onCancel} className="text-zinc-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Credit Card Preview */}
        <div className="relative h-48 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl mb-6 overflow-hidden transform transition-transform hover:scale-[1.02]">
           <div className="absolute top-0 right-0 p-4 opacity-20">
             <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
           </div>
           <div className="flex flex-col h-full justify-between relative z-10">
             <div className="flex justify-between items-start">
               <span className="font-mono text-sm opacity-80">Universal Bank</span>
               <span className="font-bold tracking-wider italic">VISA</span>
             </div>
             <div className="font-mono text-xl tracking-widest my-4">
               •••• •••• •••• 4242
             </div>
             <div className="flex justify-between items-end">
               <div className="text-xs">
                 <div className="opacity-70 uppercase">Card Holder</div>
                 <div className="font-semibold tracking-wide">JOHN DOE</div>
               </div>
               <div className="text-xs text-right">
                 <div className="opacity-70 uppercase">Expires</div>
                 <div className="font-semibold">12/28</div>
               </div>
             </div>
           </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Service</span>
            <span className="text-white font-medium">{ride.name}</span>
          </div>
           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Total Price</span>
            <span className="text-2xl font-bold text-white">{displayPrice}</span>
          </div>
        </div>

        <Button 
          variant="primary" 
          onClick={handlePay} 
          isLoading={processing}
          className="w-full py-4 text-lg !bg-emerald-500 !hover:bg-emerald-400 !text-black"
        >
          {processing ? "Processing..." : `Pay ${displayPrice}`}
        </Button>
      </div>
    </div>
  );
};