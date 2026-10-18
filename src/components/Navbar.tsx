import React, { useState } from 'react';
import { 
  Bot, 
  Gamepad2, 
  Home, 
  Layers, 
  Menu, 
  PlusCircle, 
  School, 
  Sparkles, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  X,
  Zap
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onJoinDemoRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onJoinDemoRoom,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'teacher-create', label: 'Tạo trò chơi (AI)', icon: Sparkles, badge: 'AI' },
    { id: 'library', label: 'Kho trò chơi', icon: Layers },
    { id: 'student-join', label: 'Học sinh tham gia', icon: Gamepad2, highlight: true },
    { id: 'teacher-dashboard', label: 'Dashboard Giáo viên', icon: School },
    { id: 'about', label: 'Giới thiệu', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#08111F]/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                  AI GAME HỌC TẬP
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full font-semibold">
                  THPT NGUYỄN DỤC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Cô Trần Thị Tuyết Nhung – Tin học THPT
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : item.highlight
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-purple-200 hover:text-white border border-purple-500/30'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action & Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Demo TIN012 button */}
            <button
              onClick={onJoinDemoRoom}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 transition-all shadow-sm active:scale-95"
              title="Vào ngay phòng học demo môn Tin học 12 đã cấu hình sẵn"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Thử mã: TIN012</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title={muted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-cyan-500/20 bg-[#08111F]/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1">
          <div className="p-2 mb-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Giáo viên phụ trách: <strong>Cô Tuyết Nhung</strong></span>
            <span className="text-cyan-400 font-semibold">THPT Nguyễn Dục</span>
          </div>

          <button
            onClick={() => {
              onJoinDemoRoom();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Thử ngay Game Demo: TIN012</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
