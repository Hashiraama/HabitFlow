import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Pause,
  Archive,
  Play,
  Clock,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Habit, DailyRecord } from '../../types';
import { addDays, formatFriendlyDate, getDaysInMonth, isFutureDate } from '../../utils/dateUtils';

interface HabitDetailModalProps {
  habitId: string | null;
  onClose: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habitId,
  onClose,
  onEditHabit,
}) => {
  const {
    habits,
    records,
    todayDate,
    pauseHabit,
    resumeHabit,
    archiveHabit,
    toggleHabitCompletion,
  } = useHabitFlow();

  const [showPauseConfig, setShowPauseConfig] = useState(false);
  const [pauseDays, setPauseDays] = useState(7);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const habit = habits.find(h => h.id === habitId);

  // Derive all-time stats for this specific habit
  const habitStats = useMemo(() => {
    if (!habit) return null;
    const allRecords = (Object.values(records) as DailyRecord[]).filter(r => r.habitId === habit.id);
    const completedRecords = allRecords.filter(r => r.status === 'completed' || r.status === 'late_completed');
    const totalExtra = allRecords.reduce((acc, r) => acc + (r.extraAmount || 0), 0);
    const totalXp = completedRecords.reduce((acc, r) => acc + (r.xpEarned || 0), 0);

    return {
      totalCompletions: completedRecords.length,
      totalXpEarned: totalXp,
      totalExtra,
      currentStreak: habit.streak.current,
      previousStreak: habit.streak.previous,
      bestStreak: habit.streak.best,
    };
  }, [habit, records]);

  // Generate mini calendar history (past 28 days)
  const historyDays = useMemo(() => {
    if (!habit) return [];
    const days: Array<{ dateStr: string; status?: string }> = [];
    for (let i = 27; i >= 0; i--) {
      const dStr = addDays(todayDate, -i);
      const rec = records[`${habit.id}_${dStr}`];
      days.push({
        dateStr: dStr,
        status: rec?.status || 'none',
      });
    }
    return days;
  }, [habit, records, todayDate]);

  if (!habit || !habitStats) return null;

  const handlePause = () => {
    const resumeDate = addDays(todayDate, pauseDays);
    pauseHabit(habit.id, pauseDays, resumeDate);
    setShowPauseConfig(false);
  };

  const handleArchive = () => {
    archiveHabit(habit.id);
    setShowArchiveConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          id="habit-detail-modal"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: habit.color }}
              />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                {habit.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onEditHabit(habit);
                }}
                className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Edit habit settings"
                aria-label="Edit habit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status alerts if paused */}
            {habit.status === 'paused' && habit.pauseConfig && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Pause size={15} />
                  <span>Paused until {formatFriendlyDate(habit.pauseConfig.resumeDate)}</span>
                </div>
                <button
                  onClick={() => resumeHabit(habit.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition active:scale-95"
                >
                  Resume Now
                </button>
              </div>
            )}

            {/* Streak Grid: Current, Previous, Best */}
            {/* Rule: "Show current, previous, and best streak for the overall streak and for every habit." */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-0.5">
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                  <span>Current</span>
                </div>
                <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {habitStats.currentStreak}d
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 text-center">
                <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-0.5">
                  Previous
                </div>
                <div className="text-xl font-black text-zinc-700 dark:text-zinc-300">
                  {habitStats.previousStreak}d
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 text-center">
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  Best Record
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {habitStats.bestStreak}d
                </div>
              </div>
            </div>

            {/* All-time stats card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                All-Time Statistics
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Completions</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    {habitStats.totalCompletions} times
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">XP Earned</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{habitStats.totalXpEarned} XP
                  </span>
                </div>
              </div>

              {habit.type === 'target' && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Extra Target Progress</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    +{habitStats.totalExtra} {habit.targetUnit}
                  </span>
                </div>
              )}
            </div>

            {/* Mini History Grid (Past 4 Weeks) */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
                Recent 28-Day Consistency
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {historyDays.map((d, i) => {
                  const isComp = d.status === 'completed' || d.status === 'late_completed';
                  const isFrozen = d.status === 'freeze_protected';
                  const isPartial = d.status === 'partial';

                  return (
                    <div
                      key={i}
                      className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                        isComp
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isFrozen
                          ? 'bg-sky-400 text-white'
                          : isPartial
                          ? 'bg-purple-300 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200'
                          : 'bg-zinc-200/60 dark:bg-zinc-700/50 text-zinc-400'
                      }`}
                      title={`${d.dateStr}: ${d.status}`}
                    >
                      {d.dateStr.slice(8)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pause & Archive Controls */}
            {/* Rule: "Pausing a habit supports both a chosen resume date and a chosen number of days. No due tasks during the pause." */}
            {habit.status === 'active' && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                {!showPauseConfig ? (
                  <button
                    onClick={() => setShowPauseConfig(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition"
                  >
                    <Pause size={14} />
                    <span>Pause Habit Temporarily</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 space-y-2 text-xs">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200">
                      Pause for how many days?
                    </div>
                    <div className="flex items-center gap-2">
                      {[3, 7, 14, 30].map(days => (
                        <button
                          key={days}
                          onClick={() => setPauseDays(days)}
                          className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                            pauseDays === days
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handlePause}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                      >
                        Confirm Pause
                      </button>
                      <button
                        onClick={() => setShowPauseConfig(false)}
                        className="py-1.5 px-3 rounded-lg text-zinc-500 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Archive habit button */}
                {/* Rule: "Deleting a habit means removing it from active use while preserving historical data/statistics. Require confirmation that clearly says this." */}
                {!showArchiveConfirm ? (
                  <button
                    onClick={() => setShowArchiveConfirm(true)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5"
                  >
                    <Archive size={14} />
                    <span>Archive / Remove Habit</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                    <p className="leading-relaxed">
                      Archiving removes this habit from your active list, but all your past completions, streaks, and XP history remain safely preserved.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleArchive}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition active:scale-95"
                      >
                        Yes, Archive Habit
                      </button>
                      <button
                        onClick={() => setShowArchiveConfirm(false)}
                        className="py-1.5 px-3 rounded-lg text-zinc-500 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
