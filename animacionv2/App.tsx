import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SeatGrid } from './components/SeatGrid';
// import { playCrowdCheer } from './utils/audio';

const App: React.FC = () => {
  const [name, setName] = useState<string>('ATLETI MADRID 1903');
  const [antiguedad, setAntiguedad] = useState<string>('1903');
  const [celebrating, setCelebrating] = useState<boolean>(false);
  
  // NUEVO ESTADO PARA CONTROLAR SI EL USUARIO ESTÁ EDITANDO
  const [editing, setEditing] = useState<boolean>(false);

  // Perspective Logic:
  // rotateX(10deg): Very slight tilt. The stand faces the user almost vertically like a wall.
  const transformStyle = {
    transform: 'rotateX(10deg) scale(1) translateY(-10%)', 
    transformStyle: 'preserve-3d' as const,
  };
  
  // Cola de nombres.
  class NameQueue {
    names: { text: string }[];
    maxSize: number;

    constructor(names: { text: string }[], maxSize = 10) {
      this.names = names;
      this.maxSize = maxSize;
    }

    get list() {
      return this.names;
    }

    addName(newName: string) {
      this.names.push({ text: newName });

      if (this.names.length > this.maxSize) {
        this.names.shift();
      }
    }
  }
const queueRef = useRef(
  new NameQueue(
    [
      { text: "MARC" },
      { text: "MATEO" },
      { text: "HANNA" },
      { text: "OMAR" },
      { text: "MARIA" },
      { text: "GABRIEL" },
      { text: "AGUSTIN" },
      { text: "TOMMY" },
      { text: "IVAN" },
      { text: "YADIR" }
    ],
    10 // max
  )
);

// Estado que se usa para pintar
const [namesState, setNamesState] = useState(queueRef.current.list);
  // --- useEffect PARA LEER EL FICHERO EXTERNO CADA 0.5 SEGUNDOS ---
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/name");
        const data = await res.text();
        const dataArray = data.split(" ");
        const nombre = dataArray[0];
        const nameSurname = dataArray[0].concat( " " + dataArray[1]);
        if (dataArray[2] === "^1903^") {
          setAntiguedad(dataArray[2]);
        } else {
          setAntiguedad("since " + dataArray[2])
        }

        if (nameSurname !== name) {
          setName(nameSurname);
          if (data !== 'ATLETI MADRID ^1903^') {
            const queue = queueRef.current;
            queue.addName(nameSurname.toUpperCase());
            setNamesState([...queue.list]);
          }
        }
      } catch (err) {
        console.error("Error leyendo el fichero:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [name, editing]);

  return (
    <div className="h-screen bg-black flex flex-col font-sans text-neutral-100 relative overflow-hidden selection:bg-red-500 selection:text-white">

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
              <SeatGrid text= {antiguedad} rows={20} className="opacity-90 grayscale-[30%]" />
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
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>
                    
                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>
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
              <SeatGrid text={name.split(" ")[0]} rows={20} />
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
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>
                    
                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>

                    {/* Duplicate for infinite loop */}
                    <span className="text-red-500 font-black text-lg md:text-2xl px-8 tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">ATLETICO DE MADRID</span>
                    <div className="flex">
                      {namesState.map((item, idx) => (
                        <span
                          key={idx}
                          className={
                            "text-white/80 font-bold text-sm md:text-lg px-8 tracking-wider"
                          }
                        >
                          {item.text}
                        </span>
                      ))}
                    </div>
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
    </div>
  );
};

export default App;