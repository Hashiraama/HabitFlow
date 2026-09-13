import React, { useState, useEffect } from 'react';
import { Home, CheckSquare, User, Plus, Wifi, Battery, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHabitFlow } from '../../context/HabitFlowContext';

export type ScreenTab = 'home' | 'habits' | 'account';

interface AndroidFrameProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenCreateHabit: () => void;
  onOpenCreateGoal: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onTabChange,
  onOpenCreateHabit,
  onOpenCreateGoal,
  children,
}) => {
  const { saveErrorMessage, clearSaveError } = useHabitFlow();
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('9:41');

  // Update status bar clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const shouldShowFab = currentTab === 'home' || currentTab === 'habits';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center sm:p-4 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Mobile Shell Frame */}
      <div className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[880px] bg-white dark:bg-zinc-950 sm:rounded-[44px] shadow-2xl overflow-hidden flex flex-col sm:border-[8px] sm:border-zinc-800 dark:sm:border-zinc-800">
        {/* Android Status Bar */}
        <div className="h-9 px-6 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-30 select-none text-zinc-800 dark:text-zinc-200">
          <div className="text-xs font-bold tracking-tight">
            {currentTimeStr}
          </div>
          {/* Android Camera Punch Hole on top center (desktop view aesthetic) */}
          <div className="hidden sm:block w-3.5 h-3.5 rounded-full bg-black/90 dark:bg-black/90 shadow-inner" />
          <div className="flex items-center gap-1.5 text-xs">
            <Wifi size={13} />
            <Battery size={14} className="fill-current" />
          </div>
        </div>

        {/* Global Save/Storage Error Notification Toast if any */}
        {saveErrorMessage && (
          <div className="bg-rose-500 text-white text-xs px-4 py-2 flex items-center justify-between shrink-0 z-40">
            <span>{saveErrorMessage}</span>
            <button onClick={clearSaveError} className="font-bold underline ml-2">Dismiss</button>
          </div>
        )}

        {/* Main Screen Viewport with smooth scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
          {children}
        </div>

        {/* Floating Action Button (FAB) on Home & Habits */}
        {/* Rule: "Show a prominent floating + button in the lower-right on both Home and Habits. It opens the creation flow." */}
        {shouldShowFab && (
          <div className="absolute bottom-20 right-4 z-30">
            <AnimatePresence>
              {showFabMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="mb-2 flex flex-col items-end gap-2"
                >
                  <button
                    onClick={() => {
                      setShowFabMenu(false);
                      onOpenCreateGoal();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold text-xs shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
                  >
                    <Target size={15} className="text-emerald-500" />
                    <span>New Big Goal</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowFabMenu(false);
                      onOpenCreateHabit();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold text-xs shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
                  >
                    <Sparkles size={15} className="text-emerald-500" />
                    <span>New Habit</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowFabMenu(prev => !prev)}
              className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Create new habit or goal"
            >
              <Plus
                size={26}
                className={`transition-transform duration-200 ${showFabMenu ? 'rotate-45' : ''}`}
              />
            </button>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        {/* Rule: "Use a bottom navigation bar with exactly these top-level destinations: 1. Home, 2. Habits, 3. Account / Settings" */}
        <nav
          className="h-18 px-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-around shrink-0 z-20 select-none pb-2"
          aria-label="Bottom Navigation"
        >
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
              currentTab === 'home'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentTab === 'home' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
              <Home size={20} />
            </div>
            <span className="text-[11px] leading-none">Home</span>
          </button>

          {/* 2. Habits */}
          <button
            onClick={() => onTabChange('habits')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
              currentTab === 'habits'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentTab === 'habits' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
              <CheckSquare size={20} />
            </div>
            <span className="text-[11px] leading-none">Habits</span>
          </button>

          {/* 3. Account / Settings */}
          <button
            onClick={() => onTabChange('account')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition cursor-pointer ${
              currentTab === 'account'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentTab === 'account' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
              <User size={20} />
            </div>
            <span className="text-[11px] leading-none">Account</span>
          </button>
        </nav>

        {/* Android Gesture Bar / Home Indicator */}
        <div className="h-3.5 bg-white/95 dark:bg-zinc-900/95 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
};
