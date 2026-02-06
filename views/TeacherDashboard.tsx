import React from 'react';
import { useGameStore } from '../services/gameStore';
import { Button } from '../components/Button';
import { BlindBox } from '../components/BlindBox';

export const TeacherDashboard: React.FC = () => {
  const { gameState, stockData, loading, startGame, endGame, resetGame, initializeGame } = useGameStore('TEACHER');

  const totalBoxes = stockData.length;
  const openedBoxes = Object.keys(gameState.assignments).length;
  const progress = totalBoxes > 0 ? (openedBoxes / totalBoxes) * 100 : 0;

  const handleExport = () => {
    // 1. Prepare headers
    const headers = ['股票代碼', '分析師'];

    // 2. Map assignments to symbols and sort them alphabetically by symbol
    // This ensures the list is orderly and not "jumping around"
    const rows = stockData
      .filter(stock => gameState.assignments[stock.id]) // Only exported claimed ones
      .map(stock => ({
        symbol: stock.symbol,
        analyst: gameState.assignments[stock.id]
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol)) // Alphabetical order
      .map(item => [item.symbol, item.analyst]);

    // 3. Generate CSV content with UTF-8 BOM (\uFEFF) to fix Chinese encoding issues in Excel
    const csvString = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const csvContent = BOM + csvString;

    // 4. Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `股票抽籤結果_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-slate-400 font-bold tracking-widest">系統載入中...</p>
      </div>
    );
  }

  // Handle empty database / first run
  if (!stockData || stockData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
        <div className="text-center max-w-lg">
          <h2 className="text-3xl font-bold mb-4">歡迎使用盲盒股票系統</h2>
          <p className="text-slate-400 mb-8">偵測到雲端資料庫為空，請點擊下方按鈕進行初始化。</p>
          <Button onClick={initializeGame} variant="primary" className="text-lg px-8 py-3">
            🛠️ 初始化資料庫
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header / Control Panel */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 pb-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              👨‍🏫 老師控制台
              <span className={`text-sm px-3 py-1 rounded-full border ${gameState.status === 'RUNNING' ? 'border-green-500 text-green-400 bg-green-500/10' :
                  gameState.status === 'ENDED' ? 'border-red-500 text-red-400 bg-red-500/10' :
                    'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                }`}>
                {gameState.status === 'IDLE' ? '準備中' :
                  gameState.status === 'RUNNING' ? '進行中' : '已結束'}
              </span>
            </h1>
            <p className="text-slate-400 mt-1">
              已開啟: {openedBoxes} / {totalBoxes} ({progress.toFixed(0)}%)
            </p>
          </div>

          <div className="flex gap-3">
            {gameState.status === 'IDLE' && (
              <Button onClick={startGame} variant="success" className="text-lg">
                🚀 開始遊戲
              </Button>
            )}

            {gameState.status === 'RUNNING' && (
              <Button onClick={endGame} variant="danger" className="text-lg animate-pulse">
                🛑 結束搶奪
              </Button>
            )}

            {gameState.status === 'ENDED' && (
              <>
                <Button onClick={handleExport} variant="primary">
                  📥 匯出結果 (CSV)
                </Button>
                <Button onClick={resetGame} variant="secondary">
                  🔄 重置遊戲
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-yellow-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {stockData.map(stock => {
          const owner = gameState.assignments[stock.id];
          const isRevealed = !!owner;

          return (
            <BlindBox
              key={stock.id}
              stock={stock}
              isRevealed={isRevealed}
              ownerName={owner}
              isMyBox={false}
              onOpen={() => { }} // Teacher doesn't open boxes interactively
              disabled={true} // Always disabled interaction for teacher, just viewing
            />
          );
        })}
      </div>
    </div>
  );
};