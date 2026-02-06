import React, { useState } from 'react';
import { UserRole } from './types';
import { TeacherDashboard } from './views/TeacherDashboard';
import { StudentGame } from './views/StudentGame';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleTeacherClick = () => {
    setShowPasswordModal(true);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1004') {
      setRole('TEACHER');
      setShowPasswordModal(false);
    } else {
      setError('密碼錯誤，存取被拒');
      setPassword('');
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            盲盒抽股票
          </h1>
          <p className="text-slate-400 mb-8">課堂即時互動系統</p>

          <div className="space-y-4">
            <button
              onClick={handleTeacherClick}
              className="w-full group relative flex items-center justify-center p-6 bg-slate-700 hover:bg-indigo-600 rounded-xl transition-all duration-300 border border-slate-600 hover:border-indigo-400 shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1"
            >
              <div className="text-center">
                <span className="block text-2xl font-bold text-white group-hover:text-white mb-1">我是老師</span>
                <span className="text-sm text-slate-400 group-hover:text-indigo-200">控制遊戲、查看數據、導出結果</span>
              </div>
            </button>

            <button
              onClick={() => setRole('STUDENT')}
              className="w-full group relative flex items-center justify-center p-6 bg-slate-700 hover:bg-emerald-600 rounded-xl transition-all duration-300 border border-slate-600 hover:border-emerald-400 shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-1"
            >
              <div className="text-center">
                <span className="block text-2xl font-bold text-white group-hover:text-white mb-1">我是學生</span>
                <span className="text-sm text-slate-400 group-hover:text-emerald-200">輸入名字、參與搶奪</span>
              </div>
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-500">
            © 2026 Dr. Huang Wei Lun
          </p>
        </div>

        {/* Teacher Password Modal */}
        {showPasswordModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl max-w-sm w-full animate-[fadeIn_0.2s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔒 老師權限驗證
              </h3>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setError('');
                      setPassword('');
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    確認
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setRole(null)}
          className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          ← 返回首頁
        </button>
      </div>
      {role === 'TEACHER' ? <TeacherDashboard /> : <StudentGame />}
    </div>
  );
};

export default App;