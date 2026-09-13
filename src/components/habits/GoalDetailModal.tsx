import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Target,
  Award,
  CheckCircle2,
  RotateCcw,
  Archive,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Goal } from '../../types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { calculateGoalBonusXp } from '../../utils/xpProgression';

interface GoalDetailModalProps {
  goalId: string | null;
  onClose: () => void;
  onOpenHabitDetail: (habitId: string) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goalId,
  onClose,
  onOpenHabitDetail,
}) => {
  const {
    goals,
    habits,
    getGoalProgress,
    completeGoalManually,
    reopenGoalAsNewVersion,
    archiveGoal,
  } = useHabitFlow();

  const [showCompletionOptions, setShowCompletionOptions] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const goal = goals.find(g => g.id === goalId);
  if (!goal) return null;

  const progress = getGoalProgress(goal);
  const linkedHabits = habits.filter(h => goal.habitIds.includes(h.id));
  const potentialBonusXp = calculateGoalBonusXp(linkedHabits.length);

  const handleCompleteChoice = (subHabitsAction: 'keep_active' | 'archive_all') => {
    completeGoalManually(goal.id, subHabitsAction);
    setShowCompletionOptions(false);
    onClose();
  };

  const handleReopen = () => {
    reopenGoalAsNewVersion(goal.id);
    onClose();
  };

  const handleArchive = () => {
    archiveGoal(goal.id);
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
          id="goal-detail-modal"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: goal.color }}
              />
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                  {goal.name}
                </h3>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Goal Version {goal.version}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {goal.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                {goal.description}
              </p>
            )}

            {/* Overall Progress Progress Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Overall Goal Progress</span>
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {progress.percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{progress.completedCount} of {progress.totalCount} habits done today</span>
                <span>Reward: +{potentialBonusXp} XP bonus</span>
              </div>
            </div>

            {/* Dates & Timeline */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-0.5">Started</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatFriendlyDate(goal.startDate)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold mb-0.5">Deadline</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {goal.deadline ? formatFriendlyDate(goal.deadline) : 'No set deadline'}
                </span>
              </div>
            </div>

            {/* Linked Sub-Habits List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block px-1">
                Linked Sub-Habits ({linkedHabits.length})
              </span>

              {linkedHabits.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-400">
                  No habits linked to this goal yet.
                </div>
              ) : (
                linkedHabits.map(h => (
                  <div
                    key={h.id}
                    onClick={() => {
                      onClose();
                      onOpenHabitDetail(h.id);
                    }}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                          {h.name}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {h.type === 'target' ? `${h.targetValue} ${h.targetUnit}` : 'Yes/No'} &bull; Streak: {h.streak.current}d
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-zinc-400" />
                  </div>
                ))
              )}
            </div>

            {/* Actions: Reopen as New Version or Complete Goal */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              {goal.status === 'completed' ? (
                <div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 mb-2">
                    <span className="font-bold block mb-0.5">Goal Completed!</span>
                    Completed goals can be reopened only as a new version. Original records stay intact.
                  </div>
                  <button
                    onClick={handleReopen}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw size={14} />
                    <span>Reopen as Version {goal.version + 1}</span>
                  </button>
                </div>
              ) : (
                <>
                  {!showCompletionOptions ? (
                    <button
                      onClick={() => setShowCompletionOptions(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Award size={15} />
                      <span>Mark Goal as 100% Complete</span>
                    </button>
                  ) : (
                    /* Rule: "When a goal reaches 100%, ask the user what they want to do with its sub-habits; do not force one outcome." */
                    <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 space-y-2 text-xs">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        What would you like to do with its {linkedHabits.length} sub-habits?
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <button
                          onClick={() => handleCompleteChoice('keep_active')}
                          className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-semibold text-left border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500"
                        >
                          Keep sub-habits active in my daily schedule
                        </button>
                        <button
                          onClick={() => handleCompleteChoice('archive_all')}
                          className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-semibold text-left border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500"
                        >
                          Archive all sub-habits along with this goal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Archive Goal */}
                  {!showArchiveConfirm ? (
                    <button
                      onClick={() => setShowArchiveConfirm(true)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 transition flex items-center justify-center gap-1.5"
                    >
                      <Archive size={14} />
                      <span>Archive / End Goal</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                      <p>
                        Ending this goal archives it and its sub-habits while preserving all history and statistics. You can restore them anytime.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleArchive}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition"
                        >
                          Yes, Archive Goal
                        </button>
                        <button
                          onClick={() => setShowArchiveConfirm(false)}
                          className="py-1.5 px-3 rounded-lg text-zinc-500 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
