import React, { useState, useEffect } from 'react';
import { useGameStore } from '../services/gameStore';
import { Button } from '../components/Button';
import { BlindBox } from '../components/BlindBox';
import { RevealedCard } from '../components/RevealedCard';
import { StockData } from '../types';

export const StudentGame: React.FC = () => {
  const [analystName, setAnalystName] = useState('');
  const [hasEntered, setHasEntered] = useState(false);
  const [viewingStock, setViewingStock] = useState<StockData | null>(null);
  
  const { gameState, stockData, loading, claimBox } = useGameStore('STUDENT');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (analystName.trim()) {
      setHasEntered(true);
    }
  };

  // Check if current user already has a box
  const myBoxId = Object.keys(gameState.assignments).find(
    key => gameState.assignments[key] === analystName
  );
  const hasClaimedAny = !!myBoxId;

  // Auto-open the card if I have one and haven't seen it in this session (optional, but good UX)
  // Or simply allow clicking to view. 
  
  const handleBoxClick = (stock: StockData) => {
      const owner = gameState.assignments[stock.id];
      const isMine = owner === analystName;

      // Case 1: Already revealed (By me or others)
      if (owner) {
          // Only show full detail if it's MINE. 
          // If viewing others' boxes is allowed in full screen, remove the `isMine` check.
          // Requirement says "Show student what THEY picked", usually implying privacy or focus on own result.
          // But to make it interactive, let's allow viewing my own box in full screen anytime.
          if (isMine) {
              setViewingStock(stock);
          }
          return;
      }

      // Case 2: Game not running
      if (gameState.status !== 'RUNNING') return;

      // Case 3: I already have a box, can't pick another
      if (hasClaimedAny) {
          alert('您已經擁有一家公司了！每人限搶一盒。');
          return;
      }

      // Case 4: Try to claim
      const success = claimBox(stock.id, analystName);
      if (success) {
          // Immediate reward: Show full screen card
          setViewingStock(stock);
      } else {
        // Error handling
        const freshAssignments = JSON.parse(localStorage.getItem('stock_game_state') || '{}').assignments || {};
        if (freshAssignments[stock.id]) {
           alert('哎呀！慢了一步，這個盲盒剛被別人搶走了！');
        } else {
           alert('搶奪失敗，請稍後再試。');
        }
      }
  };

  // Login Screen
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
            <Button type="submit" className="w-full text-lg">
              進入系統
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
     return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">同步資料中...</div>;
  }

  // Waiting Screen
  if (gameState.status === 'IDLE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-900">
        <div className="text-6xl mb-6 animate-bounce">⏳</div>
        <h2 className="text-3xl font-bold text-white mb-2">等待老師開始遊戲</h2>
        <p className="text-slate-400 text-lg">你好，分析師 <span className="text-blue-400 font-bold">{analystName}</span></p>
        <p className="text-slate-500 mt-8">請留意大螢幕，遊戲即將開始...</p>
      </div>
    );
  }

  // Game Grid
  return (
    <div className="min-h-screen bg-slate-900 pb-12">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md py-3 px-4 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <div>
           <h2 className="text-lg font-bold text-white">
            {gameState.status === 'RUNNING' ? '🔥 搶奪中！' : '🏁 遊戲結束'}
           </h2>
           <p className="text-xs text-slate-400">
             分析師: {analystName} 
           </p>
        </div>
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
        {/* Mobile-optimized Grid: 2 columns with small gaps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {stockData.map(stock => {
            const owner = gameState.assignments[stock.id];
            const isRevealed = !!owner;
            const isMine = owner === analystName;
            
            // Interaction logic:
            // 1. If revealed & mine -> Clickable (View Card)
            // 2. If revealed & not mine -> Disabled (Grayed out)
            // 3. If not revealed & game running & I haven't claimed -> Clickable (Claim)
            // 4. If not revealed & I have claimed -> Disabled
            
            let isDisabled = false;
            if (isRevealed && !isMine) isDisabled = true;
            if (!isRevealed && hasClaimedAny) isDisabled = true;
            if (gameState.status !== 'RUNNING' && !isRevealed) isDisabled = true;

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

      {/* Full Screen Card Overlay */}
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