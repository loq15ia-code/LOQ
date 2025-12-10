import React, { useState } from 'react';
import { Header } from './components/Header';
import { RideInterface } from './components/RideInterface';
import { MapView } from './components/MapView';
import { LoginModal } from './components/LoginModal';
import { AppStatus, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.LOCATING);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setAppStatus(AppStatus.LOCATING); // Reset status on logout
  };

  // If user is not logged in, show the Landing Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden font-['Inter']">
        {/* Background Map for Landing */}
        <MapView status="IDLE" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-0"></div>

        <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
          <div className="mb-8 text-center animate-in slide-in-from-top-8 duration-700">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-black mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
             </div>
             <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">RideGenie</h1>
             <p className="text-xl text-zinc-400">The Future of Mobility</p>
          </div>

          <LoginModal 
            isOpen={true} 
            onClose={() => {}} 
            onLogin={handleLogin} 
            isLanding={true}
          />
        </div>

        <footer className="absolute bottom-6 text-center text-zinc-600 text-xs z-10">
          © {new Date().getFullYear()} RideGenie Inc.
        </footer>
      </div>
    );
  }

  // Authenticated App Interface
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col relative overflow-hidden font-['Inter']">
      
      {/* 3D Map Background */}
      <MapView status={appStatus} />
      
      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          user={user} 
          onLoginClick={() => setIsLoginOpen(true)}
          onLogoutClick={handleLogout}
        />
        
        <main className="flex-1 w-full flex flex-col items-center justify-center py-6 px-4 sm:py-10">
          <div className="w-full max-w-md mx-auto perspective-container">
            {/* Introductory Text (Only when idle or locating) */}
            {(appStatus === AppStatus.LOCATING || appStatus === AppStatus.IDLE) && (
              <div className="mb-8 text-center animate-in slide-in-from-top-4 fade-in duration-500 hidden sm:block">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Hello, {user.name}.</h2>
                <p className="text-zinc-400">
                  Ready to go somewhere in {user.country || "your city"}?
                </p>
              </div>
            )}
             
             <RideInterface status={appStatus} setStatus={setAppStatus} user={user} />
             
             {appStatus === AppStatus.IDLE && (
               <div className="mt-8 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <button className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-800/80 hover:border-emerald-500/30 transition-all group active:scale-95">
                     <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</span>
                     <p className="text-white text-sm font-medium">Home</p>
                  </button>
                  <button className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-800/80 hover:border-emerald-500/30 transition-all group active:scale-95">
                     <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</span>
                     <p className="text-white text-sm font-medium">Work</p>
                  </button>
               </div>
             )}
          </div>
        </main>
        
        <footer className="py-6 text-center text-zinc-600 text-xs relative z-20">
          <p>© {new Date().getFullYear()} RideGenie. Future Mobility Demo.</p>
        </footer>
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}

export default App;