import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Bell, Calendar, Target, Plus, Trash2 } from 'lucide-react';
import { Habit, HabitType, FrequencyType, Goal } from '../../types';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { getTodayDateString, addDays } from '../../utils/dateUtils';

interface CreateEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const COLOR_PALETTE = [
  '#10B981', // Emerald
  '#0284C7', // Sky
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#F97316', // Orange
  '#0D9488', // Teal
  '#6366F1', // Indigo
];

export const CreateEditHabitModal: React.FC<CreateEditHabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
}) => {
  const { todayDate, createHabit, updateHabit, goals } = useHabitFlow();

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [type, setType] = useState<HabitType>('yes_no');
  const [targetValue, setTargetValue] = useState<string>('10');
  const [targetUnit, setTargetUnit] = useState<string>('pages');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [monthlyDays, setMonthlyDays] = useState<number[]>([1, 15]);
  const [specificDates, setSpecificDates] = useState<string[]>([todayDate]);
  const [newSpecificDateInput, setNewSpecificDateInput] = useState<string>(addDays(todayDate, 1));
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showInMainList, setShowInMainList] = useState(true);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  // Initialize form when opening
  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setColor(habitToEdit.color);
      setType(habitToEdit.type);
      setTargetValue(String(habitToEdit.targetValue || '10'));
      setTargetUnit(habitToEdit.targetUnit || 'times');
      setFrequency(habitToEdit.frequency);
      setWeeklyDays(habitToEdit.weeklyDays || [1, 2, 3, 4, 5]);
      setMonthlyDays(habitToEdit.monthlyDays || [1]);
      setSpecificDates(habitToEdit.specificDates || [todayDate]);
      setReminderEnabled(habitToEdit.reminderEnabled);
      setReminderTime(habitToEdit.reminderTime || '09:00');
      setShowInMainList(habitToEdit.showInMainList);
      // Check which goals this habit belongs to
      const linked = goals.filter(g => g.habitIds.includes(habitToEdit.id)).map(g => g.id);
      setSelectedGoalIds(linked);
    } else {
      setName('');
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setType('yes_no');
      setTargetValue('10');
      setTargetUnit('pages');
      setFrequency('daily');
      setWeeklyDays([1, 2, 3, 4, 5]);
      setMonthlyDays([1]);
      setSpecificDates([todayDate]);
      setReminderEnabled(true);
      setReminderTime('09:00');
      setShowInMainList(true);
      setSelectedGoalIds([]);
    }
  }, [habitToEdit, isOpen, todayDate, goals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTarget = type === 'target' ? parseFloat(targetValue) || 1 : undefined;

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        name: name.trim(),
        color,
        type,
        targetValue: parsedTarget,
        targetUnit: type === 'target' ? targetUnit.trim() : undefined,
        frequency,
        weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
        monthlyDays: frequency === 'monthly' ? monthlyDays : undefined,
        specificDates: frequency === 'specific_dates' ? specificDates : undefined,
        reminderEnabled,
        reminderTime,
        showInMainList,
      });
    } else {
      createHabit({
        name: name.trim(),
        color,
        type,
        targetValue: parsedTarget,
        targetUnit: type === 'target' ? targetUnit.trim() : undefined,
        frequency,
        weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
        monthlyDays: frequency === 'monthly' ? monthlyDays : undefined,
        specificDates: frequency === 'specific_dates' ? specificDates : undefined,
        reminderEnabled,
        reminderTime,
        showInMainList,
        status: 'active',
      }, selectedGoalIds);
    }

    onClose();
  };

  const toggleWeeklyDay = (dayIndex: number) => {
    setWeeklyDays(prev => 
      prev.includes(dayIndex)
        ? (prev.length > 1 ? prev.filter(d => d !== dayIndex) : prev)
        : [...prev, dayIndex].sort()
    );
  };

  const addSpecificDate = () => {
    if (newSpecificDateInput && !specificDates.includes(newSpecificDateInput)) {
      setSpecificDates(prev => [...prev, newSpecificDateInput].sort());
    }
  };

  const removeSpecificDate = (dStr: string) => {
    setSpecificDates(prev => prev.length > 1 ? prev.filter(d => d !== dStr) : prev);
  };

  const toggleGoalLink = (goalId: string) => {
    setSelectedGoalIds(prev => 
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
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
          id="create-edit-habit-dialog"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Name */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Habit Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 pages, Morning Hydration..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:outline-emerald-500"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Assigned Tag Color
              </label>
              <div className="flex items-center gap-2">
                {COLOR_PALETTE.map(c => (
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

            {/* Type: Yes/No vs Target */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Habit Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('yes_no')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition ${
                    type === 'yes_no'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">Yes / No</div>
                  <div className="text-[10px] text-zinc-400 font-normal">Simple completion mark</div>
                </button>

                <button
                  type="button"
                  onClick={() => setType('target')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition ${
                    type === 'target'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">Target-Based</div>
                  <div className="text-[10px] text-zinc-400 font-normal">Track pages, minutes, cups</div>
                </button>
              </div>
            </div>

            {/* Target Settings (if target-based) */}
            {type === 'target' && (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[11px]">
                      Target Value (Decimals OK)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="e.g. 20 or 2.5"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1 text-[11px]">
                      Unit Name
                    </label>
                    <input
                      type="text"
                      required
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      placeholder="pages, km, glasses"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Frequency */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Frequency
              </label>
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 font-semibold text-center">
                {(['daily', 'weekly', 'monthly', 'specific_dates'] as const).map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-1.5 rounded-lg capitalize transition text-[11px] ${
                      frequency === freq
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {freq === 'specific_dates' ? 'Dates' : freq}
                  </button>
                ))}
              </div>

              {/* Weekly Days Picker */}
              {frequency === 'weekly' && (
                <div className="mt-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400 block text-[11px]">
                    Choose active days of the week:
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName, idx) => {
                      const isSel = weeklyDays.includes(idx);
                      return (
                        <button
                          key={dName}
                          type="button"
                          onClick={() => toggleWeeklyDay(idx)}
                          className={`py-2 rounded-xl text-center font-bold text-[11px] transition ${
                            isSel
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          {dName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly Days Picker */}
              {frequency === 'monthly' && (
                <div className="mt-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                    Select days of month (1 to 31). Note: If 31 is selected and a month has fewer days, the month's last day is automatically used.
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[1, 5, 10, 15, 20, 25, 28, 30, 31].map(num => {
                      const isSel = monthlyDays.includes(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setMonthlyDays(prev => 
                              prev.includes(num) ? (prev.length > 1 ? prev.filter(n => n !== num) : prev) : [...prev, num].sort((a,b) => a-b)
                            );
                          }}
                          className={`w-9 h-8 rounded-lg font-bold text-xs ${
                            isSel
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specific Dates Picker */}
              {frequency === 'specific_dates' && (
                <div className="mt-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Habit will be active on these specific dates, then automatically archive after the final date passes.
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newSpecificDateInput}
                      onChange={(e) => setNewSpecificDateInput(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={addSpecificDate}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                    >
                      + Add Date
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {specificDates.map(dStr => (
                      <span
                        key={dStr}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-[11px] font-bold"
                      >
                        <span>{dStr}</span>
                        {specificDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecificDate(dStr)}
                            className="text-zinc-400 hover:text-rose-500"
                          >
                            &times;
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Settings */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                  <Bell size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Reminder Notification</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(prev => !prev)}
                  className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                    reminderEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                      reminderEnabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {reminderEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-[11px] text-zinc-500">Reminder Time:</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">+3h, +6h, +12h follow-ups</span>
                </div>
              )}
            </div>

            {/* Sub-habit Goal Linking & Show in Main List Choice */}
            {/* Rule: "When creating a new sub-habit, ask whether it should also appear in the main habit list." */}
            {goals.length > 0 && (
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-[11px]">
                  Connect to a Big Goal (Optional)
                </span>
                <div className="space-y-1">
                  {goals.map(g => {
                    const isLinked = selectedGoalIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoalLink(g.id)}
                        className={`w-full p-2 rounded-xl text-left border flex items-center justify-between text-xs transition ${
                          isLinked
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                          <span className="font-bold">{g.name}</span>
                        </div>
                        {isLinked && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {selectedGoalIds.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
                      Show in main standalone habits list?
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInMainList(prev => !prev)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        showInMainList ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                          showInMainList ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 cursor-pointer"
              >
                {habitToEdit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
