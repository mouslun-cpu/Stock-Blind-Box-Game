import React from 'react';
import { StockData } from '../types';

interface RevealedCardProps {
  stock: StockData;
  analystName: string;
  onClose: () => void;
}

export const RevealedCard: React.FC<RevealedCardProps> = ({ stock, analystName, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 外部狀態文字 */}
      <div className="mb-6 text-center animate-[bounce_1s_infinite]">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]">
          ✨ 搶奪成功！
        </h2>
        <p className="text-yellow-100/70 text-sm mt-1 font-bold tracking-wider">
          這是您專屬的盲盒股票標的
        </p>
      </div>

      {/* 卡片容器 */}
      <div className="relative w-full max-w-sm group animate-[slideUp_0.5s_ease-out]">
        
        {/* 金色流動光暈背景 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 rounded-[2rem] blur opacity-75 animate-pulse"></div>
        
        {/* 卡片本體 (Dark Mode) */}
        <div className="relative w-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col border border-yellow-500/30 shadow-2xl">
          
          {/* 頂部承諾條 */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-3 px-4 text-center border-b border-white/10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
             <h2 className="font-bold text-lg text-yellow-400 tracking-wide drop-shadow-md">
              ✋ 我保證我會好好研究這家公司
            </h2>
          </div>

          {/* 卡片內容區 */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative min-h-[320px]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
               <span className="text-[10rem] font-black text-white">{stock.symbol[0]}</span>
            </div>

            <div className="mb-4 relative z-10">
              <span className="inline-block px-4 py-1 bg-slate-800 border border-slate-700 text-yellow-400 rounded-full text-sm font-bold tracking-wider shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                {stock.industry}
              </span>
            </div>

            <h1 className="relative z-10 text-6xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {stock.symbol}
            </h1>

            <h3 className="relative z-10 text-2xl font-bold text-white mb-8 leading-tight drop-shadow-md">
              {stock.name}
            </h3>

            <div className="relative z-10 w-full bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
              <p className="text-slate-200 font-medium italic font-serif text-lg leading-relaxed">
                "{stock.hint}"
              </p>
            </div>
          </div>

          {/* 底部資訊 - 姓名置中 + 頭銜 */}
          <div className="bg-black/40 p-6 border-t border-white/10 text-center backdrop-blur-md">
              <div className="inline-flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white tracking-widest">{analystName}</span>
                  <span className="text-sm font-bold text-yellow-500/80 tracking-tighter bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">分析師</span>
              </div>
          </div>

          {/* 關閉按鈕 */}
          <button 
              onClick={onClose}
              className="absolute top-2 right-2 z-20 text-white/30 hover:text-white p-2 transition-colors rounded-full hover:bg-white/10"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          <div className="bg-black py-2 text-center border-t border-white/5">
             <p className="text-[10px] text-slate-600 font-mono tracking-widest">OFFICIAL RESEARCH ASSIGNMENT</p>
          </div>
        </div>
      </div>
    </div>
  );
};