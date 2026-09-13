import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Target, Calendar } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { addDays, getTodayDateString } from '../../utils/dateUtils';

interface CreateEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOAL_COLORS = [
  '#059669', // Emerald
  '#0284C7', // Sky
  '#7C3AED', // Violet
  '#D97706', // Amber
  '#DB2777', // Pink
  '#EA580C', // Orange
];

export const CreateEditGoalModal: React.FC<CreateEditGoalModalProps> = ({ isOpen, onClose }) => {
  const { todayDate, createGoal, habits } = useHabitFlow();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [startDate, setStartDate] = useState(todayDate);
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadline, setDeadline] = useState(addDays(todayDate, 30));
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGoal({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      startDate,
      deadline: hasDeadline ? deadline : undefined,
      habitIds: selectedHabitIds,
    });

    onClose();
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          id="create-goal-dialog"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Create Big Goal
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Goal Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wellness Mastery, Learn Spanish..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What does conquering this goal mean to you?"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
              />
            </div>

            {/* Color */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Theme Color
              </label>
              <div className="flex items-center gap-2">
                {GOAL_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition active:scale-90"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={14} className="text-white drop-shadow-xs" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[11px]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                    Deadline
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasDeadline(!hasDeadline)}
                    className="text-[10px] text-emerald-600 font-bold"
                  >
                    {hasDeadline ? 'Has deadline' : 'No deadline'}
                  </button>
                </div>
                {hasDeadline && (
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
                  />
                )}
              </div>
            </div>

            {/* Link Existing Habits */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Link Existing Habits ({selectedHabitIds.length} selected)
              </label>
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5 max-h-40 overflow-y-auto">
                {habits.length === 0 ? (
                  <div className="text-zinc-400 text-center py-2">
                    No habits created yet. You can create sub-habits anytime later!
                  </div>
                ) : (
                  habits.map(h => {
                    const isSelected = selectedHabitIds.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => toggleHabit(h.id)}
                        className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                          <span className="font-bold">{h.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 cursor-pointer"
              >
                Create Goal
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
