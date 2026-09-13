import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Plus,
  Target,
  Flame,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Bell,
  Clock
} from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Habit, Goal, DailyRecord } from '../../types';
import { isHabitDueOnDate } from '../../utils/dateUtils';
import { HabitDetailModal } from './HabitDetailModal';
import { GoalDetailModal } from './GoalDetailModal';

interface HabitsScreenProps {
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  onOpenCreateModal,
  onEditHabit,
}) => {
  const {
    habits,
    goals,
    records,
    todayDate,
    toggleHabitCompletion,
    recordTargetProgress,
    getGoalProgress,
    simulateReminderTrigger,
  } = useHabitFlow();

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [activeStepperHabitId, setActiveStepperHabitId] = useState<string | null>(null);
  const [customInputValue, setCustomInputValue] = useState<string>('');

  // Active habits due today
  const activeHabits = habits.filter(h => h.status === 'active');
  const dueTodayHabits = activeHabits.filter(h => isHabitDueOnDate(h, todayDate));

  // Active goals
  const activeGoals = goals.filter(g => g.status === 'active');

  // Helper to determine habit grouping
  // Group habits by their big goal. Show standalone habits in their own section.
  // Rule: "A sub-habit may appear in the main list only when its creator chose that option. It must still remain connected to its goal."
  const goalsWithHabits = activeGoals.map(goal => {
    const linked = dueTodayHabits.filter(h => goal.habitIds.includes(h.id));
    return {
      goal,
      habits: linked,
    };
  });

  const linkedHabitIds = new Set(activeGoals.flatMap(g => g.habitIds));
  const standaloneHabits = dueTodayHabits.filter(h => !linkedHabitIds.has(h.id));

  // Habits that are sub-habits but set to show in the main list
  const subHabitsToShowInMain = dueTodayHabits.filter(h => linkedHabitIds.has(h.id) && h.showInMainList);

  const handleTargetInputSubmit = (habit: Habit, type: 'add' | 'set') => {
    const val = parseFloat(customInputValue);
    if (!isNaN(val) && val >= 0) {
      recordTargetProgress(habit.id, type, val, todayDate);
    }
    setActiveStepperHabitId(null);
    setCustomInputValue('');
  };

  const renderHabitRow = (habit: Habit) => {
    const recordKey = `${habit.id}_${todayDate}`;
    const rec = records[recordKey];
    const isCompleted = rec?.status === 'completed';
    const progressAmount = rec?.progressAmount || 0;
    const targetVal = habit.targetValue || 1;
    const isOverTarget = habit.type === 'target' && progressAmount > targetVal;
    const extra = isOverTarget ? Math.round((progressAmount - targetVal) * 10) / 10 : 0;
    const isStepperOpen = activeStepperHabitId === habit.id;

    return (
      <div
        key={habit.id}
        className={`rounded-2xl transition border ${
          isCompleted
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
            : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-2xs'
        } p-3.5 space-y-2.5`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Habit Info & tap to open detail */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => setSelectedHabitId(habit.id)}
          >
            {/* Color Accent Pill */}
            <div
              className="w-2.5 h-10 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: habit.color }}
            />

            <div className="truncate">
              <div className={`text-sm font-bold truncate ${
                isCompleted ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
              }`}>
                {habit.name}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {/* Target progress display or simple yes/no */}
                {habit.type === 'target' ? (
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {/* Rule: "Present this as target achieved plus extra (for example 20/20 + 5 extra), not only 25/20." */}
                    {isOverTarget ? (
                      <span>
                        {targetVal}/{targetVal} <span className="text-emerald-600 dark:text-emerald-400 font-bold">(+{extra} extra)</span> {habit.targetUnit}
                      </span>
                    ) : (
                      <span>
                        {progressAmount}/{targetVal} {habit.targetUnit}
                      </span>
                    )}
                  </span>
                ) : (
                  <span>Yes / No</span>
                )}

                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>

                {/* Streak count */}
                <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <Flame size={12} className="fill-amber-500" />
                  <span>{habit.streak.current}d</span>
                </div>

                {/* Reminder button */}
                {habit.reminderEnabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      simulateReminderTrigger(habit.id);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title={`Reminder at ${habit.reminderTime}. Tap to test reminder notification.`}
                  >
                    <Bell size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Checkmark & Quick Progress Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* If target habit: quick stepper or manual set button */}
            {habit.type === 'target' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => recordTargetProgress(habit.id, 'add', 1, todayDate)}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition active:scale-95"
                  title="Add +1 unit"
                >
                  +1
                </button>
                <button
                  onClick={() => {
                    setActiveStepperHabitId(isStepperOpen ? null : habit.id);
                    setCustomInputValue(String(progressAmount));
                  }}
                  className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 transition active:scale-95"
                  title="Set exact amount or custom progress"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Manual Completion Checkmark */}
            {/* Rule: "Reaching the target does not auto-complete the habit. The user must tap the completion checkmark." */}
            <button
              onClick={() => toggleHabitCompletion(habit.id, todayDate)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-90 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border-2 border-zinc-300 dark:border-zinc-700 text-transparent hover:border-emerald-500'
              }`}
              aria-label={`Mark ${habit.name} complete`}
            >
              <Check size={18} className={isCompleted ? 'text-white' : 'opacity-0'} />
            </button>
          </div>
        </div>

        {/* Expandable Stepper / Exact Amount Input */}
        {isStepperOpen && habit.type === 'target' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs"
          >
            <div className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Log {habit.targetUnit || 'progress'}:</span>
              <span className="text-zinc-400 font-normal">Decimals supported</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-28 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs"
              />
              <button
                onClick={() => handleTargetInputSubmit(habit, 'set')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition active:scale-95"
              >
                Set Total
              </button>
              <button
                onClick={() => handleTargetInputSubmit(habit, 'add')}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 font-bold transition active:scale-95"
              >
                + Add Amount
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-24 select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            Today’s Habits & Goals
          </h2>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {dueTodayHabits.length} active habit{dueTodayHabits.length !== 1 ? 's' : ''} due today
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 max-w-lg mx-auto w-full space-y-5">
        {/* Big Goals Section */}
        {activeGoals.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Active Goals ({activeGoals.length})
              </span>
            </div>

            <div className="space-y-3">
              {goalsWithHabits.map(({ goal, habits: linkedHabits }) => {
                const progress = getGoalProgress(goal);

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    {/* Goal Title Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedGoalId(goal.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <div>
                          <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 transition">
                            {goal.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {linkedHabits.length} sub-habits linked &bull; {progress.percent}% overall
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-400" />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>

                    {/* Sub-habits list under this goal */}
                    <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                      {linkedHabits.length === 0 ? (
                        <div className="text-xs text-zinc-400 py-1">
                          No habits scheduled today for this goal.
                        </div>
                      ) : (
                        linkedHabits.map(h => renderHabitRow(h))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standalone Habits Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Standalone Habits ({standaloneHabits.length})
            </span>
          </div>

          {standaloneHabits.length === 0 && activeGoals.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No habits due today
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Tap the + button below to create your first habit or goal.
                </p>
              </div>
              <button
                onClick={onOpenCreateModal}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                Create Habit
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {standaloneHabits.map(h => renderHabitRow(h))}
            </div>
          )}
        </div>
      </div>

      {/* Habit Detail Modal */}
      <HabitDetailModal
        habitId={selectedHabitId}
        onClose={() => setSelectedHabitId(null)}
        onEditHabit={onEditHabit}
      />

      {/* Goal Detail Modal */}
      <GoalDetailModal
        goalId={selectedGoalId}
        onClose={() => setSelectedGoalId(null)}
        onOpenHabitDetail={(habitId) => {
          setSelectedGoalId(null);
          setSelectedHabitId(habitId);
        }}
      />
    </div>
  );
};
