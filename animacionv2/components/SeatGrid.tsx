import React, { useMemo } from 'react';
import { convertStringToGrid } from '../utils/fontMap';

interface SeatGridProps {
  text: string;
  className?: string;
  rows?: number;
  cols?: number;
}

export const SeatGrid: React.FC<SeatGridProps> = ({ 
  text, 
  className, 
  rows = 13, 
  cols = 95
}) => {
  // Get the text matrix (0s and 1s)
  const { matrix: textMatrix, width: textWidth, height: textHeight } = useMemo(
    () => convertStringToGrid(text), 
    [text]
  );

  // Calculate offsets to center the text in the stadium grid
  const startRow = Math.floor((rows - textHeight) / 2);
  const startCol = Math.floor((cols - textWidth) / 2);

  //  Generate the full stadium grid
  const renderSeats = () => {
    const seats = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < cols; c++) {
        // Determine if this specific seat should be WHITE (part of text)
        let isTextPixel = false;
        
        if (
          r >= startRow && 
          r < startRow + textHeight && 
          c >= startCol && 
          c < startCol + textWidth
        ) {
          const matrixRow = textMatrix[r - startRow];
          if (matrixRow && matrixRow[c - startCol] === 1) {
            isTextPixel = true;
          }
        }

        rowSeats.push(
          <div
            key={`${r}-${c}`}
            className={`
              relative flex-shrink-0
              /* COMPACT & ROUNDED SEAT */
              w-3 h-4 md:w-4 md:h-6 lg:w-5 lg:h-8
              rounded-t-2xl rounded-b-sm
              transition-colors duration-300
              
              /* Deep shadow for stacking depth */
              shadow-[0_4px_4px_rgba(0,0,0,0.6)]
            `}
            style={{
              // Gradient simulates a curved backrest
              background: isTextPixel 
                ? 'linear-gradient(180deg, #ffffff 0%, #e5e5e5 40%, #a3a3a3 100%)' 
                : 'linear-gradient(180deg, #ef4444 0%, #dc2626 40%, #7f1d1d 100%)',
              
              // Highlight to emphasize the rounded top
              boxShadow: isTextPixel
                ? 'inset 0 1px 2px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.2)'
                : 'inset 0 1px 2px rgba(255,200,200,0.5), inset 0 -2px 4px rgba(0,0,0,0.4)',
            }}
          >
          </div>
        );
      }
      
      // Row Rendering with EXTREME OVERLAP
      // -mt-2 (mobile), -mt-4 (md), -mt-6 (lg) pulls rows way up
      seats.push(
        <div 
            key={`row-${r}`} 
            className="flex gap-[1px] md:gap-[2px] justify-center items-end -mt-2 md:-mt-4 lg:-mt-5 relative"
            style={{ zIndex: r }} // Ensure lower rows (front) are on top of upper rows (back)
        >
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* The Stand Structure */}
      <div className="
        relative 
        px-4 py-8 md:px-12 md:py-12
      ">
        {/* The Grid */}
        <div className="relative z-10 flex flex-col items-center">
          {renderSeats()}
        </div>
        
        {/* Base of the stand */}
        <div className="w-[98%] h-4 bg-neutral-900 border-t border-neutral-700 mt-1 rounded-sm shadow-xl mx-auto opacity-80"></div>
      </div>
    </div>
  );
};