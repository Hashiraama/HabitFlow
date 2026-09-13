import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Archive, Check } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Habit, Goal } from '../../types';

interface ArchivedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchivedItemsModal: React.FC<ArchivedItemsModalProps> = ({ isOpen, onClose }) => {
  const { habits, goals, restoreHabit, restoreGoal } = useHabitFlow();

  const [restoringHabit, setRestoringHabit] = useState<Habit | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<number>(10);
  const [confirmUnit, setConfirmUnit] = useState<string>('pages');

  if (!isOpen) return null;

  const archivedHabits = habits.filter(h => h.status === 'archived');
  const archivedGoals = goals.filter(g => g.status === 'archived');

  const startRestoreHabit = (habit: Habit) => {
    setRestoringHabit(habit);
    setConfirmTarget(habit.targetValue || 10);
    setConfirmUnit(habit.targetUnit || 'times');
  };

  const handleConfirmRestoreHabit = () => {
    if (!restoringHabit) return;

    restoreHabit(restoringHabit.id, {
      targetValue: restoringHabit.type === 'target' ? confirmTarget : undefined,
      targetUnit: restoringHabit.type === 'target' ? confirmUnit : undefined,
    });
    setRestoringHabit(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          id="archived-items-dialog"
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive size={18} className="text-zinc-500" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Archived Habits & Goals
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Modal sub-step: Confirm restore schedule & target */}
            {restoringHabit && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-3">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  Confirm Schedule & Target to Restore "{restoringHabit.name}"
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-snug">
                  Past completion history and XP remain intact. As per product rules, your streak resets to 0 to account for the inactive gap.
                </p>

                {restoringHabit.type === 'target' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Confirm Target Value & Unit:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={confirmTarget}
                        onChange={(e) => setConfirmTarget(parseFloat(e.target.value) || 1)}
                        className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                      />
                      <input
                        type="text"
                        value={confirmUnit}
                        onChange={(e) => setConfirmUnit(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmRestoreHabit}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition active:scale-95"
                  >
                    Confirm & Make Active
                  </button>
                  <button
                    onClick={() => setRestoringHabit(null)}
                    className="py-2 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Archived Habits Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Archived Habits ({archivedHabits.length})
              </span>

              {archivedHabits.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  No archived habits.
                </div>
              ) : (
                archivedHabits.map(h => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                      <div className="truncate">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {h.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {h.type === 'target' ? `${h.targetValue} ${h.targetUnit}` : 'Yes/No'} &bull; Created {h.createdAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startRestoreHabit(h)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 shrink-0"
                    >
                      <RotateCcw size={13} />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Archived Goals Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Archived Goals ({archivedGoals.length})
              </span>

              {archivedGoals.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  No archived goals.
                </div>
              ) : (
                archivedGoals.map(g => (
                  <div
                    key={g.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                      <div className="truncate">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {g.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Version {g.version} &bull; {g.habitIds.length} sub-habits
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => restoreGoal(g.id)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 shrink-0"
                    >
                      <RotateCcw size={13} />
                      <span>Restore</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
