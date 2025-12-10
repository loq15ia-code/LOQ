import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogoutClick }) => {
  return (
    <header className="w-full py-4 px-6 border-b border-zinc-800/50 bg-[#18181b]/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">RideGenie</h1>
            <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Future Mobility</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {user ? (
             <div className="flex items-center gap-3 bg-zinc-800/50 pl-4 pr-1 py-1 rounded-full border border-zinc-700/50">
               <span className="text-sm font-medium text-white hidden sm:block">{user.name}</span>
               <button 
                onClick={onLogoutClick}
                className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden ring-2 ring-zinc-600 hover:ring-emerald-500 transition-all"
               >
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
               </button>
             </div>
           ) : (
             <button 
               onClick={onLoginClick}
               className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
             >
               Log In
             </button>
           )}
        </div>
      </div>
    </header>
  );
};
