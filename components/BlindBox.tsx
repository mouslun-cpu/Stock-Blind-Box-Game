import React from 'react';
import { StockData } from '../types';

interface BlindBoxProps {
  stock: StockData;
  isRevealed: boolean;
  ownerName?: string;
  isMyBox: boolean;
  onOpen: () => void;
  disabled: boolean;
}

export const BlindBox: React.FC<BlindBoxProps> = ({
  stock,
  isRevealed,
  ownerName,
  isMyBox,
  onOpen,
  disabled
}) => {
  return (
    <div
      onClick={!disabled ? onOpen : undefined}
      className={`
        relative aspect-[3/4] rounded-xl shadow-lg transition-all duration-300 transform w-full
        ${!isRevealed && !disabled ? 'cursor-pointer hover:scale-[1.02] active:scale-95 hover:shadow-yellow-500/20' : ''}
        ${isRevealed ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-900 border-slate-700'} 
        ${disabled && !isRevealed ? 'opacity-60 cursor-not-allowed' : ''}
        ${isMyBox ? 'ring-4 ring-yellow-400 z-10' : ''}
        overflow-hidden flex flex-col items-center justify-center p-0 text-center select-none border
      `}
    >
      {/* 未開啟狀態 (卡背風格) */}
      {!isRevealed && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-b from-slate-800 to-slate-950">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-2 border border-slate-600/50 rounded-lg border-dashed pointer-events-none"></div>
          
          <div className="mt-4 relative z-10">
            <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-[pulse_3s_ease-in-out_infinite]">
              🎁
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full z-10 space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-wider uppercase drop-shadow-sm leading-none">
              {stock.industry}
            </h3>
            
            <div className="w-full bg-black/40 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
              <p className="text-sm sm:text-base text-slate-200 font-serif italic leading-relaxed line-clamp-4">
                "{stock.hint}"
              </p>
            </div>
          </div>

          <div className="mb-2 z-10">
             <span className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase">Mystery Stock</span>
          </div>

          {/* 鎖定/等待狀態遮罩 */}
          {disabled && (
             <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-[2px]">
                <div className="border-2 border-yellow-500/50 text-yellow-500/80 px-4 py-2 text-xl font-bold uppercase tracking-widest bg-black/50">
                   Waiting...
                </div>
             </div>
          )}
        </div>
      )}

      {/* 已開啟狀態 (主畫面格視圖 - 統一為深色風格) */}
      {isRevealed && (
        <div className="relative w-full h-full flex flex-col justify-between py-2 cursor-pointer bg-slate-900">
           <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
             <span className="text-7xl font-black text-white">{stock.symbol[0]}</span>
           </div>

          <div className="flex-1 flex flex-col items-center justify-center px-2 relative z-10">
            <span className="text-[10px] text-yellow-500/70 uppercase tracking-widest mb-1 font-bold">{stock.industry}</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-400 tracking-tighter mb-1">{stock.symbol}</span>
            <h3 className="text-xs font-bold text-slate-300 leading-tight line-clamp-2 px-1">{stock.name}</h3>
          </div>
          
          <div className={`mt-auto pt-2 border-t ${isMyBox ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-white/5 border-white/10'} -mx-2 -mb-2 py-2 relative z-10`}>
            <p className={`text-xs font-bold truncate px-2 ${isMyBox ? 'text-yellow-400' : 'text-slate-400'}`}>
              {ownerName}
            </p>
          </div>
          
          {isMyBox && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-20">
                  ME
              </div>
          )}
        </div>
      )}
    </div>
  );
};