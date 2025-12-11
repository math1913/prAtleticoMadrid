import React, { useEffect, useMemo, useRef, useState } from 'react';
import { convertStringToGrid } from '../utils/fontMap';

interface SeatGridProps {
  text: string;
  className?: string;
  rows?: number;
  cols?: number;
}

type Pixel = 0 | 1;
type Matrix = Pixel[][];

interface Cell {
  row: number;
  col: number;
}

// Utilidades
const cloneMatrix = (m: Matrix) => m.map(row => [...row] as Pixel[]);

const createZeroMatrix = (rows: number, cols: number): Matrix =>
  Array.from({ length: rows }, () => Array(cols).fill(0 as Pixel));

const createRandomMatrix = (rows: number, cols: number): Matrix =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() > 0.5 ? 1 : 0) as Pixel)
  );

const computeDiff = (current: Matrix, target: Matrix): Cell[] => {
  const diff: Cell[] = [];

  for (let r = 0; r < target.length; r++) {
    for (let c = 0; c < target[r].length; c++) {
      if (current[r][c] !== target[r][c]) {
        diff.push({ row: r, col: c });
      }
    }
  }
  return diff;
};

// Parámetros de animación
const ANIMATION_INTERVAL_MS = 40;   // ajusta para más rápido/lento

export const SeatGrid: React.FC<SeatGridProps> = ({
  text,
  className,
  rows = 13,
  cols = 95
}) => {
  //
  // MATRIZ OBJETIVO (texto centrado)
  //
  const { matrix: textMatrix, width: textWidth, height: textHeight } = useMemo(
    () => convertStringToGrid(text),
    [text]
  );

  const startRow = Math.floor((rows - textHeight) / 2);
  const startCol = Math.floor((cols - textWidth) / 2);

  // Construir matriz objetivo completa (95x13)
  const targetMatrix: Matrix = useMemo(() => {
    const full = createZeroMatrix(rows, cols);

    for (let r = 0; r < textHeight; r++) {
      for (let c = 0; c < textWidth; c++) {
        full[startRow + r][startCol + c] = textMatrix[r][c] as Pixel;
      }
    }

    return full;
  }, [textMatrix, rows, cols, textHeight, textWidth, startRow, startCol]);

  //
  // MATRIZ MOSTRADA (ANIMADA)
  //
  const [displayMatrix, setDisplayMatrix] = useState<Matrix>(() =>
    createZeroMatrix(rows, cols)
  );

  //
  // CONTROL DE ANIMACIÓN
  //
  const diffRef = useRef<Cell[]>([]);
  const targetRef = useRef<Matrix>(targetMatrix);
  const intervalRef = useRef<number | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  //
  // Cuando cambia el texto → activar animación
  //
  useEffect(() => {
    targetRef.current = targetMatrix;

    // Si había una animación previa, cancelarla
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 1) Matriz de ruido inicial
    const noiseMatrix = createRandomMatrix(rows, cols);

    // 2) Matriz inicial: texto ya fijo, fondo con ruido
    const initialMatrix = createZeroMatrix(rows, cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (targetMatrix[r][c] === 1) {
          initialMatrix[r][c] = 1;           // letra fija desde el inicio
        } else {
          initialMatrix[r][c] = noiseMatrix[r][c]; // ruido en el fondo
        }
      }
    }

    setDisplayMatrix(initialMatrix);

    // 3) Dif diferencias entre matriz inicial (texto + ruido) y la final
    diffRef.current = computeDiff(initialMatrix, targetMatrix);

    // 4) Animación: limpiar ruido hasta llegar exactamente al target
    intervalRef.current = window.setInterval(() => {
      setDisplayMatrix(prev => {
        const next = cloneMatrix(prev);

        if (diffRef.current.length === 0) {
          // nos aseguramos de terminar en el target exacto
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return targetRef.current;
        }

        let remaining = diffRef.current.length;

        // factor de suavizado (+ grande → más suavidad al final)
        const smoothFactor = 15;

        // apagamos menos celdas cuando quedan pocas
        let steps = Math.ceil(remaining / smoothFactor);

        // límite inferior: nunca menos de 1
        steps = Math.max(1, Math.min(steps, remaining));


        for (let i = 0; i < steps; i++) {
          const idx = Math.floor(Math.random() * diffRef.current.length);
          const { row, col } = diffRef.current[idx];

          next[row][col] = targetRef.current[row][col];
          // Eliminamos solo una, pero luego recalculamos el diff desde el estado real
          const removed = diffRef.current[idx];
          diffRef.current.splice(idx, 1);

          // Recalcular diff real contra target basado en "next"
          diffRef.current = computeDiff(next, targetRef.current);

        }

        return next;
      });
    }, ANIMATION_INTERVAL_MS);

  }, [targetMatrix, rows, cols]);

  //
  // RENDER DE BUTACAS
  //
  const renderSeats = () => {
    const seats = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        const isTextPixel = displayMatrix[r][c] === 1;

        rowSeats.push(
          <div
            key={`${r}-${c}`}
            className={`
              relative flex-shrink-0
              w-3 h-4 md:w-4 md:h-6 lg:w-5 lg:h-8
              rounded-t-2xl rounded-b-sm
              transition-colors duration-200
              shadow-[0_4px_4px_rgba(0,0,0,0.6)]
            `}
            style={{
              background: isTextPixel
                ? 'linear-gradient(180deg, #ffffff 0%, #e5e5e5 40%, #a3a3a3 100%)'
                : 'linear-gradient(180deg, #ef4444 0%, #dc2626 40%, #7f1d1d 100%)',
              boxShadow: isTextPixel
                ? 'inset 0 1px 2px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.2)'
                : 'inset 0 1px 2px rgba(255,200,200,0.5), inset 0 -2px 4px rgba(0,0,0,0.4)',
            }}
          ></div>
        );
      }

      seats.push(
        <div
          key={`row-${r}`}
          className="flex gap-[1px] md:gap-[2px] justify-center items-end -mt-2 md:-mt-4 lg:-mt-5 relative"
          style={{ zIndex: r }}
        >
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative px-4 py-8 md:px-12 md:py-12">
        <div className="relative z-10 flex flex-col items-center">
          {renderSeats()}
        </div>

        <div className="w-[98%] h-4 bg-neutral-900 border-t border-neutral-700 mt-1 rounded-sm shadow-xl mx-auto opacity-80"></div>
      </div>
    </div>
  );
};
