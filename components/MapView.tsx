import React from 'react';

interface MapViewProps {
  status: string;
}

export const MapView: React.FC<MapViewProps> = ({ status }) => {
  const isMoving = status === 'ON_RIDE' || status === 'REQUESTING';

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#101012] pointer-events-none perspective-container">
      {/* 3D Map Plane */}
      <div className={`map-plane ${isMoving ? 'moving' : ''}`}>
        
        {/* Realistic Map Texture Layer */}
        <div 
            className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/b/bd/OpenStreetMap_Logo_2011.svg')] opacity-20 mix-blend-luminosity"
            style={{ 
                backgroundSize: '800px 800px',
                backgroundRepeat: 'repeat',
                filter: 'invert(1) contrast(1.2) brightness(0.6)'
            }}
        ></div>

        {/* Street Grid Overlay for "Real" look */}
        <div className="grid-lines"></div>
        
        {/* Ambient City Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 via-transparent to-transparent"></div>
      </div>

      {/* Atmospheric Fog */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/80 z-0 pointer-events-none"></div>

      {/* Animated Traffic (Dots) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-6xl z-0 transform scale-150">
         {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white/80 rounded-full w-1 h-1 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-car-ambient"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${20 + Math.random() * 15}s`
              }}
            ></div>
         ))}
          {[...Array(5)].map((_, i) => (
            <div 
              key={`red-${i}`}
              className="absolute bg-red-500/80 rounded-full w-1 h-1 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-car-ambient"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 3.5}s`,
                animationDuration: `${25 + Math.random() * 10}s`,
                animationDirection: 'reverse'
              }}
            ></div>
         ))}
      </div>

      <style>{`
        .perspective-container {
          perspective: 1200px;
        }
        .map-plane {
          position: absolute;
          width: 300%;
          height: 300%;
          top: -100%;
          left: -100%;
          background-color: #1a1a1d;
          transform: rotateX(60deg) scale(1.2);
          transform-style: preserve-3d;
        }
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 100px 100px;
        }
        .moving .map-plane {
          /* Simulate movement by animating background position if it was repeating, 
             but here we animate the container for simplicity or just rely on the RideInterface map */
        }
        .animate-car-ambient {
          animation: carAmbientMove linear infinite;
          opacity: 0;
        }
        @keyframes carAmbientMove {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(200px, 100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};