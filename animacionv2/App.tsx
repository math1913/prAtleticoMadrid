import React, { useState, useEffect, useCallback } from 'react';
import { SeatGrid } from './components/SeatGrid';
import { Confetti } from './components/Confetti';
import { playCrowdCheer } from './utils/audio';
import { Camera, Type } from 'lucide-react';

const App: React.FC = () => {
  const [name, setName] = useState<string>('ATLETI');
  const [celebrating, setCelebrating] = useState<boolean>(false);
  
  // NUEVO ESTADO PARA CONTROLAR SI EL USUARIO ESTÁ EDITANDO
  const [editing, setEditing] = useState<boolean>(false);

  // Perspective Logic:
  // rotateX(10deg): Very slight tilt. The stand faces the user almost vertically like a wall.
  const transformStyle = {
    transform: 'rotateX(10deg) scale(1) translateY(-10%)', 
    transformStyle: 'preserve-3d' as const,
  };
  
  // Effect to handle celebration debounce
  useEffect(() => {
    setCelebrating(false); 
    
    if (name.trim().length === 0) return;

    const timer = setTimeout(() => {
      triggerCelebration();
    }, 500);

    return () => clearTimeout(timer);
  }, [name]);

  const triggerCelebration = useCallback(() => {
    setCelebrating(true);
    playCrowdCheer(); // Plays Stadium Roar
    setTimeout(() => setCelebrating(false), 4000);
  }, [name]);

  {/*
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 14) {
      setName(e.target.value.toUpperCase());
      setEditing(true); // Marcamos que el usuario está escribiendo
    }
  };*/}

  // --- useEffect PARA LEER EL FICHERO EXTERNO CADA 0.5 SEGUNDOS ---
  useEffect(() => {
    const interval = setInterval(async () => {
      if (editing) return; // No sobrescribimos mientras el usuario escribe

      try {
        const res = await fetch("http://localhost:5000/name");
        const data = await res.text();

        if (data !== name) setName(data.toUpperCase().slice(0, 14));
      } catch (err) {
        console.error("Error leyendo el fichero:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [name, editing]);

  // --- RESET EDITING DESPUÉS DE 2 SEGUNDOS SIN ESCRIBIR ---
  useEffect(() => {
    if (!editing) return;
    const timeout = setTimeout(() => setEditing(false), 2000);
    return () => clearTimeout(timeout);
  }, [editing]);

  return (
    <div className="h-screen bg-black flex flex-col font-sans text-neutral-100 relative overflow-hidden selection:bg-red-500 selection:text-white">
      
      {/* Confetti Overlay */}
      <Confetti isActive={celebrating} />

      {/* --- Main Visual Area --- */}
      <div 
        className="relative flex-grow flex flex-col items-center justify-center overflow-hidden bg-black"
        style={{ perspective: '800px' }} 
      >
        
        {/* Background Atmosphere Gradient (No Image) */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black z-0" />

        {/* 3D SCENE CONTAINER */}
        <div 
          className="relative z-10 transition-transform duration-500 ease-out origin-center flex flex-col items-center justify-start h-full pt-10"
          style={transformStyle}
        >
            
            {/* UPPER DECK ("HOLA" + LOGOS) - EXTENDED HEIGHT */}
            <div 
              className="relative z-0"
              style={{ transform: 'translateY(40px) scale(0.95)' }}
            >
              {/* Uses ^ for the Nike Swoosh defined in fontMap. Adjusted padding to 2 spaces for balance. */}
              <SeatGrid text="^ 1903 ^" rows={14} cols={100} className="opacity-90 grayscale-[30%]" />
            </div>

            {/* LED BANNER & SHADOW CONTAINER */}
            <div className="relative z-20 w-[120%] flex flex-col items-center" style={{ transform: 'translateY(-10px)' }}>
               {/* THE LED SCREEN */}
               <div className="
                 relative w-full h-8 md:h-12 
                 bg-black border-y-2 border-neutral-800 
                 shadow-[0_0_30px_rgba(220,38,38,0.4)]
                 overflow-hidden flex items-center
               ">
                  {/* Marquee Content */}
                  <div className="flex whitespace-nowrap animate-marquee">
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>
                    
                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>
                  </div>

               </div>

               {/* Shadow cast by banner onto lower deck */}
               <div className="w-full h-32 bg-gradient-to-b from-black/80 to-transparent absolute top-full left-0 pointer-events-none z-30"></div>
            </div>

            {/* LOWER DECK (USER NAME) - EXTENDED HEIGHT */}
            {/* Tucked slightly under the banner visually */}
            <div 
              className="relative z-10"
              style={{ transform: 'translateY(-30px) ' }}
            >
              <SeatGrid text={name} rows={20} />
            </div>
            <div className="relative z-20 w-[120%] flex flex-col items-center" style={{ transform: 'translateY(-80px)' }}>
               {/* THE LED SCREEN */}
               <div className="
                 relative w-full h-8 md:h-24
                 bg-black border-y-2 border-neutral-800 
                 shadow-[0_0_30px_rgba(220,38,38,0.4)]
                 overflow-hidden flex items-center
               ">
                  {/* Marquee Content */}
                  <div className="flex whitespace-nowrap animate-marquee">
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>
                    
                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">NIKE</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">TESLA</span>
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">1903</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Admira</span>
                    <span className="text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider">Bits & Atoms</span>
                  </div>

               </div>
            </div>

          {/* PITCH (AREA 3D) */}
          <div className="absolute inset-x-0 top-[72vh] flex justify-center pointer-events-none">

            {/* CÉSPED ROTADO (solo esto está en 3D) */}
            <div
              className="w-[180vw] h-[120vh] grass-texture origin-top"
              style={{
                transform: 'rotateX(60deg) translateY(-2vh)',
                transformStyle: 'preserve-3d',
                boxShadow: 'inset 0 3vh 12vh rgba(0,0,0,0.8)',
              }}
            />

            {/* LÍNEAS — SUPERPUESTAS Y SIEMPRE FIJAS ARRIBA (plano 2D que NO se deforma) */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[160vw] h-[0.4vh] bg-white/60 z-50"></div>

            <div className="absolute top-[10%] left-[50%] w-[0.5vh] h-[50vh] bg-white/60 z-50"></div>
          </div>
        </div>

      </div>

      {/* // --- Controls Bar --- 
      <div className="bg-neutral-900 border-t border-red-900/30 p-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row items-center gap-4">
          
          // Input Field 
          <div className="relative w-full md:flex-grow group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Type className="h-5 w-5 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="NOMBRE"
              className="block w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl 
                         text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent
                         text-2xl font-black tracking-widest uppercase transition-all shadow-inner font-mono"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-600">
              {name.length}/14
            </div>
          </div>

          // Action Buttons 
          <div className="flex gap-3 w-full md:w-auto">
             <button
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 
                         bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold 
                         shadow-[0_4px_14px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.6)]
                         transition-all active:scale-95 border border-red-500"
            >
              <span>GUARDAR</span>
            </button>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default App;