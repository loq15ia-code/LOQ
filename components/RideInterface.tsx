import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { searchDestination } from '../services/geminiService';
import { AppStatus, Destination, RideOption, RideType, Location, User } from '../types';
import { PaymentModal } from './PaymentModal';

interface RideInterfaceProps {
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
  user: User;
}

// Helper to determine currency settings based on country
const getCurrencySettings = (country?: string) => {
  switch (country) {
    case 'Morocco':
      return { code: 'MAD', symbol: 'DH', rate: 10 }; // Approx rate
    case 'United Kingdom':
      return { code: 'GBP', symbol: '£', rate: 0.8 };
    case 'Germany':
    case 'France':
      return { code: 'EUR', symbol: '€', rate: 0.9 };
    case 'Japan':
      return { code: 'JPY', symbol: '¥', rate: 150 };
    default:
      return { code: 'USD', symbol: '$', rate: 1 };
  }
};

export const RideInterface: React.FC<RideInterfaceProps> = ({ status, setStatus, user }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideType>(RideType.ECONOMY);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [etaCountdown, setEtaCountdown] = useState(0);

  const currency = useMemo(() => getCurrencySettings(user.country), [user.country]);

  // Reliable Wikimedia Commons images with dynamic prices
  const rideOptions: RideOption[] = useMemo(() => [
    { 
      id: RideType.ECONOMY, 
      name: 'Genie Eco', 
      price: 12.50 * currency.rate, 
      eta: 4, 
      icon: '🚗',
      carModel: 'Toyota Corolla Hybrid',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2019_Toyota_Corolla_Icon_Tech_HEV_CVT_1.8.jpg/800px-2019_Toyota_Corolla_Icon_Tech_HEV_CVT_1.8.jpg'
    },
    { 
      id: RideType.PREMIUM, 
      name: 'Genie Premium', 
      price: 28.00 * currency.rate, 
      eta: 7, 
      icon: '🚙',
      carModel: 'Mercedes-Benz S-Class',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mercedes-Benz_W223_IMG_6839.jpg/800px-Mercedes-Benz_W223_IMG_6839.jpg'
    },
    { 
      id: RideType.XL, 
      name: 'Genie XL', 
      price: 35.00 * currency.rate, 
      eta: 9, 
      icon: '🚐',
      carModel: 'Mercedes-Benz V-Class',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mercedes-Benz_V_250_d_Avantgarde_Edition_lang_%28447%29_%E2%80%93_Heckansicht%2C_28._Februar_2015%2C_D%C3%BCsseldorf.jpg/800px-Mercedes-Benz_V_250_d_Avantgarde_Edition_lang_%28447%29_%E2%80%93_Heckansicht%2C_28._Februar_2015%2C_D%C3%BCsseldorf.jpg'
    },
  ], [currency.rate]);

  const selectedOption = rideOptions.find(r => r.id === selectedRide);
  const formattedPrice = selectedOption ? `${currency.symbol} ${selectedOption.price.toFixed(2)}` : '';

  useEffect(() => {
    // Simulate getting user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Ensure we transition from LOCATING to IDLE
          setStatus(AppStatus.IDLE);
        },
        (err) => {
          console.error("Location error:", err.message);
          // Fallback to San Francisco on error
          setLocation({ lat: 37.7749, lng: -122.4194 });
          setStatus(AppStatus.IDLE);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setLocation({ lat: 37.7749, lng: -122.4194 });
      setStatus(AppStatus.IDLE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === AppStatus.ON_RIDE && selectedOption) {
      setEtaCountdown(selectedOption.eta * 60);
      const timer = setInterval(() => {
        setEtaCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, selectedOption]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus(AppStatus.SEARCHING);
    setError(null);
    setDestination(null);

    try {
      const result = await searchDestination(query, location || undefined);
      if (result) {
        setDestination(result);
        setStatus(AppStatus.SELECTING_RIDE);
      } else {
        setError("Could not find that destination. Please try being more specific.");
        setStatus(AppStatus.IDLE);
      }
    } catch (err) {
      setError("Failed to search destination. Please try again.");
      setStatus(AppStatus.IDLE);
    }
  };

  const handleRequestClick = () => {
    setShowPayment(true);
  };

  const handlePaymentConfirm = () => {
    setShowPayment(false);
    setStatus(AppStatus.REQUESTING);
    // Simulate API call to book ride
    setTimeout(() => {
      setStatus(AppStatus.ON_RIDE);
    }, 2000);
  };

  const resetRide = () => {
    setStatus(AppStatus.IDLE);
    setQuery('');
    setDestination(null);
    setShowPayment(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === AppStatus.LOCATING) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-500 animate-pulse backdrop-blur-sm bg-black/20 rounded-2xl w-full">
        <div className="relative">
           <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="M12 2a10 10 0 1 0 10 10 10.011 10.011 0 0 0-10-10Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <p className="mt-4 font-medium tracking-wide">Acquiring Satellites...</p>
      </div>
    );
  }

  if (status === AppStatus.ON_RIDE) {
    return (
      <div className="bg-[#18181b]/95 backdrop-blur-xl border border-zinc-700 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 w-full max-w-5xl flex flex-col md:flex-row h-auto md:h-[500px]">
        
        {/* Left Side: Ride Details (Bottom on Mobile, Left on Desktop) */}
        <div className="order-2 md:order-1 p-6 md:w-5/12 flex flex-col justify-between border-t md:border-t-0 md:border-r border-zinc-700/50 bg-[#18181b] z-20 relative">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-[pulse_1s_infinite]"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">Driver En Route</h2>
            </div>
            
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-zinc-700 mb-6 group">
               <img 
                src={selectedOption?.imageUrl} 
                alt={selectedOption?.carModel} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
               />
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg leading-tight">{selectedOption?.carModel}</h3>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mt-1">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-600 font-mono text-emerald-400">ABD-1234</span>
                    <span>• White Sedan</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6 bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30">
              <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden ring-2 ring-emerald-500/50 shrink-0">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOption?.id}`} alt="Driver" className="w-full h-full" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Michael R.</p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <span>★</span><span>4.9</span>
                  <span className="text-zinc-500 ml-1">(2,453 rides)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
               <span className="text-zinc-500">Arrival in</span>
               <span className="text-emerald-400 font-mono font-bold text-lg">{formatTime(etaCountdown)}</span>
            </div>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full animate-[shimmer_2s_infinite] w-2/3 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
               </div>
            </div>
            <Button variant="secondary" onClick={resetRide} className="w-full mt-4 !rounded-xl hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-colors">
              Cancel Ride
            </Button>
          </div>
        </div>

        {/* Right Side: Follow-Me Tracking Map */}
        <div className="order-1 md:order-2 md:w-7/12 relative h-64 md:h-full bg-zinc-900 overflow-hidden z-10">
           
           {/* Moving Map Background Container */}
           <div className="absolute inset-[-50%] w-[200%] h-[200%] animate-map-pan">
              {/* Map Texture Layer with Satellite/Realistic Look */}
              <div 
                className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/b/bd/OpenStreetMap_Logo_2011.svg')] opacity-60 mix-blend-normal brightness-75 contrast-125 saturate-50"
                style={{ 
                    backgroundSize: '400px 400px',
                    filter: 'invert(0.9) hue-rotate(180deg) brightness(0.6)' 
                }}
              ></div>
              
              {/* Roads Overlay (Simulated) */}
              <div className="absolute inset-0 bg-transparent">
                <div className="absolute inset-0" style={{
                   backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 4px, transparent 4px), linear-gradient(90deg, rgba(255,255,255,0.1) 4px, transparent 4px)',
                   backgroundSize: '100px 100px',
                }}></div>
                {/* Main Roads */}
                <div className="absolute top-1/2 left-0 right-0 h-20 bg-[#1a1a1d] border-y-2 border-zinc-500/30"></div>
                <div className="absolute top-0 bottom-0 left-1/2 w-16 bg-[#1a1a1d] border-x-2 border-zinc-500/30 transform -translate-x-1/2"></div>
              </div>
           </div>

           {/* Vignette Overlay */}
           <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_90%)] z-10"></div>

           {/* UI Overlay: Status Pill */}
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-2 shadow-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-white text-xs font-medium tracking-wide">LIVE TRACKING</span>
           </div>

           {/* Center Element: The Car (Fixed Position) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                {/* Headlight Beams */}
                <div className="absolute top-1/2 left-full w-32 h-20 -translate-y-1/2 bg-gradient-to-r from-emerald-200/30 to-transparent blur-md transform -skew-y-12 origin-left"></div>
                <div className="absolute top-1/2 left-full w-32 h-20 -translate-y-1/2 bg-gradient-to-r from-emerald-200/30 to-transparent blur-md transform skew-y-12 origin-left"></div>

                {/* Pulse Ring */}
                <div className="absolute -inset-8 bg-emerald-500/20 rounded-full animate-[ping_2s_linear_infinite]"></div>
                
                {/* Car Body */}
                <div className="relative bg-zinc-900 p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50 w-12 h-20 flex items-center justify-center transform rotate-90">
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/c/c2/Taxi_Icon.svg')] bg-contain bg-no-repeat bg-center opacity-80"></div>
                </div>
              </div>
           </div>

           <style>{`
             @keyframes map-pan {
               0% { transform: translate(0, 0); }
               100% { transform: translate(-100px, 50px); }
             }
             .animate-map-pan {
               animation: map-pan 4s linear infinite;
             }
           `}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#18181b]/70 backdrop-blur-xl border border-zinc-700/30 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative transition-all duration-300 hover:shadow-[0_30px_60px_-12px_rgba(16,185,129,0.1)] w-full max-w-md mx-auto">
        
        {/* Header with mini-map effect */}
        <div className="h-24 sm:h-28 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border-b border-zinc-800 p-6 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
             <div>
               <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-0.5">Current Location</p>
               <p className="text-white font-semibold text-lg leading-none">{location ? "Location Found" : "Locating..."}</p>
             </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="relative mb-6 group">
            <label htmlFor="destination" className="sr-only">Where to?</label>
            <div className="relative transform transition-transform group-focus-within:scale-[1.02]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
                 <div className="w-0.5 h-8 bg-gradient-to-b from-white to-transparent opacity-20 absolute top-2"></div>
              </div>
              <input
                id="destination"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (status === AppStatus.SELECTING_RIDE) {
                    setStatus(AppStatus.IDLE);
                    setDestination(null);
                  }
                }}
                placeholder="Where to?"
                className="w-full bg-zinc-900/80 border border-zinc-700 text-white rounded-xl py-4 sm:py-5 pl-10 pr-4 font-medium placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none shadow-inner transition-all text-sm sm:text-base"
                disabled={status === AppStatus.SEARCHING || status === AppStatus.REQUESTING}
              />
              {status === AppStatus.SEARCHING && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {destination && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="mb-6 pl-4 border-l-2 border-zinc-700">
                <h3 className="text-white font-bold text-lg sm:text-xl mb-1">{destination.name}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-2 line-clamp-2">{destination.description}</p>
                {destination.mapUri && (
                   <a 
                     href={destination.mapUri} 
                     target="_blank" 
                     rel="noreferrer"
                     className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                   >
                     View on Google Maps 
                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                   </a>
                )}
              </div>

              {/* Vehicle Preview Section */}
              {selectedOption && (
                <div className="mb-6 bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative h-32 sm:h-40 w-full rounded-xl overflow-hidden mb-3 bg-white/5">
                    <img 
                      src={selectedOption.imageUrl} 
                      alt={selectedOption.carModel} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider">{selectedOption.name}</p>
                      <h4 className="text-white font-bold text-base sm:text-lg">{selectedOption.carModel}</h4>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {selectedOption.eta} min</span>
                      <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 4 Seats</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-white">{currency.symbol} {selectedOption.price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Ride Selection List */}
              <div className="space-y-3 mb-8">
                {rideOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedRide(option.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border group ${
                      selectedRide === option.id
                        ? 'bg-gradient-to-r from-emerald-900/30 to-zinc-800 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-zinc-800/30 border-transparent hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-zinc-900 border border-zinc-700 transition-all ${
                         selectedRide === option.id ? 'border-emerald-500 text-emerald-500' : 'text-zinc-500'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <h4 className={`font-medium text-sm transition-colors ${selectedRide === option.id ? 'text-white' : 'text-zinc-400'}`}>
                          {option.name}
                        </h4>
                      </div>
                    </div>
                    {selectedRide === option.id && (
                       <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full py-5 text-lg font-bold rounded-xl !bg-emerald-500 !hover:bg-emerald-400 !text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]"
                onClick={handleRequestClick}
                isLoading={status === AppStatus.REQUESTING}
              >
                Choose {selectedOption?.carModel}
              </Button>
            </div>
          )}
        </div>
      </div>

      <PaymentModal 
        isOpen={showPayment} 
        ride={selectedOption} 
        onCancel={() => setShowPayment(false)}
        onConfirm={handlePaymentConfirm}
        formattedPrice={formattedPrice}
      />
    </>
  );
};