import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  isLanding?: boolean; // New prop to indicate if it's the main landing login
}

const COUNTRIES = [
  "Morocco", "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Japan", "Brazil", "India", "United Arab Emirates", "Saudi Arabia", "Other"
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, isLanding = false }) => {
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);

  // If it's the landing page login, it's always "open" conceptually, 
  // but if used as a modal, check isOpen.
  if (!isOpen && !isLanding) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      onLogin({
        name: email.split('@')[0] || 'User',
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        country: country
      });
      setLoading(false);
      if (!isLanding) onClose();
    }, 1500);
  };

  const containerClasses = isLanding 
    ? "relative z-10 w-full max-w-sm" 
    : "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200";

  const cardClasses = "bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden w-full max-w-sm mx-auto";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLanding ? "Get Started" : "Welcome Back"}
          </h2>
          <p className="text-zinc-400 text-sm">Sign in to continue to RideGenie</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-600"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
             <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Country</label>
             <div className="relative">
               <select
                 value={country}
                 onChange={(e) => setCountry(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
               >
                 {COUNTRIES.map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
               </div>
             </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              defaultValue="password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-zinc-600"
              placeholder="••••••••"
            />
          </div>
          
          <Button variant="primary" type="submit" className="w-full !bg-emerald-500 !hover:bg-emerald-400 !text-black !shadow-emerald-500/20" isLoading={loading}>
            {isLanding ? "Enter RideGenie" : "Sign In"}
          </Button>
          
          {!isLanding && (
            <button type="button" onClick={onClose} className="w-full py-2 text-sm text-zinc-500 hover:text-white transition-colors">
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};