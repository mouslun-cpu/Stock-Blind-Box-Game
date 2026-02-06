import React, { useState } from 'react';
import { useGameStore } from '../services/gameStore';
import { BlindBox } from '../components/BlindBox';
import { RevealedCard } from '../components/RevealedCard';
import { StockData } from '../types';

export const StudentGame: React.FC = () => {
  const [analystName, setAnalystName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [viewingStock, setViewingStock] = useState<StockData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { gameState, stockData, loading, claimBox } = useGameStore('STUDENT');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (analystName.trim()) {
      setHasEntered(true);
    }
  };

  const myBoxId = Object.keys(gameState.assignments).find(
    key => gameState.assignments[key] === analystName
  );
  const hasClaimedAny = !!myBoxId;

  const handleBoxClick = async (stock: StockData) => {
      const owner = gameState.assignments[stock.id];
      const isMine = owner === analystName;

      if (owner) {
          if (isMine) setViewingStock(stock);
          return;
      }

      if (gameState.status !== 'RUNNING' || hasClaimedAny || isProcessing) return;

      setIsProcessing(true);
      try {
        const success = await claimBox(stock.id, analystName);
        if (success) {
            setViewingStock(stock);
        } else {
            alert('搶奪失敗！可能已被搶走或您已擁有一家公司。');
        }
      } finally {
        setIsProcessing(false);
      }
  };

  if (!hasEntered) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">👨‍🎓 學生登入</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">請輸入您的分析師姓名</label>
              <input
                type="text"
                required
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                placeholder="例如：王小明"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95">
              進入系統
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading && stockData.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-4"></div>
            <p>連線至雲端教室中...</p>
        </div>
     );
  }

  if (gameState.status === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-900">
        <div className="text-6xl mb-6 animate-bounce">⏳</div>
        <h2 className="text-3xl font-bold text-white mb-2">等待老師開始遊戲</h2>
        <p className="text-slate-400 text-lg">你好，分析師 <span className="text-blue-400 font-bold">{analystName}</span></p>
        <p className="text-slate-500 mt-8">請留意老師電腦畫面，遊戲即將開始...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md py-3 px-4 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <div>
           <h2 className="text-lg font-bold text-white">
            {gameState.status === 'RUNNING' ? '🔥 搶奪中！' : '🏁 遊戲結束'}
           </h2>
           <p className="text-xs text-slate-400">分析師: {analystName}</p>
        </div>
        
        {isProcessing && <div className="text-xs text-yellow-500 animate-pulse font-bold">同步中...</div>}

        {hasClaimedAny ? (
            <button 
                onClick={() => {
                    const myStock = stockData.find(s => s.id === myBoxId);
                    if(myStock) setViewingStock(myStock);
                }}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition-transform active:scale-95"
            >
                查看我的股票 🎫
            </button>
        ) : (
            <div className="animate-pulse text-yellow-400 font-bold text-xs bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                點擊盲盒進行搶奪
            </div>
        )}
      </div>

      <div className="container mx-auto px-2 py-4 max-w-7xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {stockData.map(stock => {
                const owner = gameState.assignments[stock.id];
                const isRevealed = !!owner;
                const isMine = owner === analystName;
                
                let isDisabled = false;
                if (isRevealed && !isMine) isDisabled = true;
                if (!isRevealed && hasClaimedAny) isDisabled = true;
                if (gameState.status !== 'RUNNING' && !isRevealed) isDisabled = true;
                if (isProcessing) isDisabled = true;

                return (
                    <BlindBox
                        key={stock.id}
                        stock={stock}
                        isRevealed={isRevealed}
                        ownerName={owner}
                        isMyBox={isMine}
                        onOpen={() => handleBoxClick(stock)}
                        disabled={isDisabled}
                    />
                );
            })}
        </div>
      </div>

      {viewingStock && (
          <RevealedCard 
            stock={viewingStock} 
            analystName={analystName} 
            onClose={() => setViewingStock(null)} 
          />
      )}
    </div>
  );
};