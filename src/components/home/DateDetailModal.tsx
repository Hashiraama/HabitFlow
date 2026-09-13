import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Clock, AlertTriangle, Shield, Check, Plus } from 'lucide-react';
import { formatFriendlyDate, isFutureDate, isHabitDueOnDate } from '../../utils/dateUtils';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { Habit, DailyRecord } from '../../types';

interface DateDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  dateStr?: string;
  dateString?: string | null;
  onOpenHabitDetail: (habitId: string) => void;
}

export const DateDetailModal: React.FC<DateDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dateString,
  onOpenHabitDetail,
}) => {
  const {
    todayDate,
    getHabitRecordsForDate,
    toggleHabitCompletion,
    recordLateCompletion,
    applyManualFreeze,
    profile,
  } = useHabitFlow();

  const effectiveDate = dateString || dateStr || '';
  const isVisible = isOpen !== undefined ? isOpen : Boolean(effectiveDate);

  if (!isVisible || !effectiveDate) return null;

  const habitItems = getHabitRecordsForDate(effectiveDate);
  const isPast = effectiveDate < todayDate;
  const isToday = effectiveDate === todayDate;
  const isFuture = isFutureDate(effectiveDate, todayDate);

  const completedCount = habitItems.filter(item => 
    item.record && (item.record.status === 'completed' || item.record.status === 'late_completed')
  ).length;

  const frozenCount = habitItems.filter(item => 
    item.record && item.record.status === 'freeze_protected'
  ).length;

  const dueCount = habitItems.filter(item => 
    isHabitDueOnDate(item.habit, effectiveDate)
  ).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          id="date-detail-modal"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {isToday ? 'Today' : isPast ? 'Past Record' : 'Upcoming Day'}
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {formatFriendlyDate(effectiveDate)}
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

          {/* Quick Summary Pill Banner */}
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {completedCount} of {dueCount} completed
              </span>
              {frozenCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                  <Shield size={10} />
                  Streak Freeze Used
                </span>
              )}
            </div>

            {/* Manual freeze button if past day missed and freezes available */}
            {isPast && completedCount === 0 && frozenCount === 0 && profile.freezeBalance > 0 && (
              <button
                onClick={() => applyManualFreeze(effectiveDate)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition active:scale-95"
              >
                <Shield size={12} />
                <span>Protect with Freeze</span>
              </button>
            )}
          </div>

          {/* Habit records list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {habitItems.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No active habits were scheduled for this date.
              </div>
            ) : (
              habitItems.map(({ habit, record }) => {
                const isCompleted = record?.status === 'completed';
                const isLate = record?.status === 'late_completed';
                const isFrozen = record?.status === 'freeze_protected';
                const isPartial = record?.status === 'partial';
                const isMissed = record?.status === 'missed' || (isPast && !record && isHabitDueOnDate(habit, effectiveDate));

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3"
                  >
                    {/* Left: color dot & name */}
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      onClick={() => onOpenHabitDetail(habit.id)}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                          {habit.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {habit.type === 'target' ? (
                            <span>
                              {record?.progressAmount || 0}/{habit.targetValue} {habit.targetUnit}
                              {record?.extraAmount ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                                  (+{record.extraAmount} extra)
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span>Simple Yes/No</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status badge & action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <CheckCircle2 size={12} />
                          <span>Done (+1 XP)</span>
                        </span>
                      )}

                      {isLate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          <Clock size={12} />
                          <span>Late Completed (0 XP)</span>
                        </span>
                      )}

                      {isFrozen && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                          <Shield size={12} />
                          <span>Frozen</span>
                        </span>
                      )}

                      {isPartial && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                          <span>Partial</span>
                        </span>
                      )}

                      {/* If Today: allow normal toggle */}
                      {isToday && (
                        <button
                          onClick={() => toggleHabitCompletion(habit.id, effectiveDate)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-90 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border-2 border-zinc-300 dark:border-zinc-600 text-transparent hover:border-emerald-500'
                          }`}
                          aria-label={`Toggle completion for ${habit.name}`}
                        >
                          <Check size={16} className={isCompleted ? 'text-white' : 'opacity-0'} />
                        </button>
                      )}

                      {/* If Past and not completed: allow Late Completion */}
                      {isPast && !isCompleted && !isLate && (
                        <button
                          onClick={() => recordLateCompletion(habit.id, effectiveDate)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition active:scale-95"
                          title="Record late completion (0 XP, does not repair streak)"
                        >
                          Log Late
                        </button>
                      )}

                      {/* Future: indicate scheduled */}
                      {isFuture && (
                        <span className="text-[11px] text-zinc-400 italic">Scheduled</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
