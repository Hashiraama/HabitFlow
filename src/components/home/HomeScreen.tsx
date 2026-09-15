import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Flame,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  CheckCircle2,
  Clock,
  Smartphone
} from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import {
  formatDateString,
  parseDateString,
  getDaysInMonth,
  addDays,
  isFutureDate,
  getMaxFutureBrowseDate,
  formatFriendlyDate,
  isHabitDueOnDate
} from '../../utils/dateUtils';
import { getLevelInfo } from '../../utils/xpProgression';
import { CompanionBubble } from '../companion/CompanionBubble';
import { DateDetailModal } from './DateDetailModal';
import { DeviceInstallModal } from '../common/DeviceInstallModal';

interface HomeScreenProps {
  onOpenCreateModal: () => void;
  onOpenHabitDetail: (habitId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCreateModal,
  onOpenHabitDetail,
}) => {
  const {
    todayDate,
    selectedDate,
    setSelectedDate,
    habits,
    records,
    profile,
  } = useHabitFlow();

  // Current view month & year state
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => parseDateString(todayDate));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showFullDayModal, setShowFullDayModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth() + 1; // 1-indexed

  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  const maxFutureDate = useMemo(() => getMaxFutureBrowseDate(habits), [habits]);

  // Calendar cells generation
  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=Sun, 6=Sat

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      completedDots: Array<{ id: string; color: string; name: string }>;
      hasFreeze: boolean;
      hasPartial: boolean;
      hasMissed: boolean;
    }> = [];

    // Preceding padding days
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1 === 0 ? 12 : viewMonth - 1);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonthYear = viewMonth === 1 ? viewYear - 1 : viewYear;
      const prevMonthVal = viewMonth === 1 ? 12 : viewMonth - 1;
      const dStr = `${prevMonthYear}-${String(prevMonthVal).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr: dStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dStr === todayDate,
        isFuture: isFutureDate(dStr, todayDate),
        completedDots: [],
        hasFreeze: false,
        hasPartial: false,
        hasMissed: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dStr === todayDate;
      const isFuture = isFutureDate(dStr, todayDate);

      const dots: Array<{ id: string; color: string; name: string }> = [];
      let hasFreeze = false;
      let hasPartial = false;
      let hasMissed = false;

      if (!isFuture) {
        habits.forEach(h => {
          const rec = records[`${h.id}_${dStr}`];
          if (rec && (rec.status === 'completed' || rec.status === 'late_completed')) {
            dots.push({ id: h.id, color: h.color, name: h.name });
          } else if (rec && rec.status === 'freeze_protected') {
            hasFreeze = true;
          } else if (rec && rec.status === 'partial') {
            hasPartial = true;
          } else if (rec && rec.status === 'missed') {
            hasMissed = true;
          }
        });
      }

      cells.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        isFuture,
        completedDots: dots,
        hasFreeze,
        hasPartial,
        hasMissed,
      });
    }

    // Trailing padding days to fill 35 or 42 grid slots
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthYear = viewMonth === 12 ? viewYear + 1 : viewYear;
      const nextMonthVal = viewMonth === 12 ? 1 : viewMonth + 1;
      const dStr = `${nextMonthYear}-${String(nextMonthVal).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === todayDate,
        isFuture: isFutureDate(dStr, todayDate),
        completedDots: [],
        hasFreeze: false,
        hasPartial: false,
        hasMissed: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayDate, habits, records]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth, 1);
    // Future browse limit check
    if (next <= maxFutureDate) {
      setCurrentViewDate(next);
    }
  };

  const canGoNext = useMemo(() => {
    const next = new Date(viewYear, viewMonth, 1);
    return next <= maxFutureDate;
  }, [viewYear, viewMonth, maxFutureDate]);

  // Quick summary calculation for the currently selected date
  const selectedDateSummary = useMemo(() => {
    const activeHabits = habits.filter(h => h.status === 'active' || records[`${h.id}_${selectedDate}`]);
    const dueHabits = activeHabits.filter(h => isHabitDueOnDate(h, selectedDate));
    const completedItems = activeHabits.filter(h => {
      const r = records[`${h.id}_${selectedDate}`];
      return r && (r.status === 'completed' || r.status === 'late_completed');
    });
    const frozenItems = activeHabits.filter(h => {
      const r = records[`${h.id}_${selectedDate}`];
      return r && r.status === 'freeze_protected';
    });
    const partialItems = activeHabits.filter(h => {
      const r = records[`${h.id}_${selectedDate}`];
      return r && r.status === 'partial';
    });

    return {
      dueCount: dueHabits.length,
      completedCount: completedItems.length,
      completedHabits: completedItems,
      hasFreeze: frozenItems.length > 0,
      partialCount: partialItems.length,
    };
  }, [habits, records, selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-col flex-1 pb-24 select-none">
      {/* Top Header: Compact XP/Level indicator & Streaks */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-10">
        {/* Level / XP Pill */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
            L{levelInfo.level}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <span>Level {levelInfo.level}</span>
              <span className="text-zinc-400 font-normal">&bull;</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{profile.xp} XP</span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-0.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streaks & Freezes Pills */}
        <div className="flex items-center gap-2">
          {/* Overall Streak */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 font-bold text-xs"
            title="Overall Streak: at least 1 habit completed consecutive days"
          >
            <Flame size={14} className="fill-amber-500 text-amber-500" />
            <span>{profile.overallStreak.current}d</span>
          </div>

          {/* Freeze Balance */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 font-bold text-xs"
            title="Available Streak Freezes"
          >
            <Shield size={14} className="fill-sky-500 text-sky-500" />
            <span>{profile.freezeBalance}</span>
          </div>

          {/* Android APK / Install Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs tile-3d-press shadow-xs cursor-pointer"
            title="Install on Android Device / Download APK"
          >
            <Smartphone size={13} />
            <span>APK</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-4 max-w-lg mx-auto w-full">
        {/* Calendar Card - 3D Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl box-3d p-3.5 sm:p-4">
          {/* Calendar Month Header with jump selector */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={() => setShowMonthPicker(prev => !prev)}
              className="flex items-center gap-1.5 text-base font-extrabold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer active:scale-95"
            >
              <span>{monthNames[viewMonth - 1]} {viewYear}</span>
              <ChevronDown size={16} className={`text-zinc-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full tile-3d-press bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextMonth}
                disabled={!canGoNext}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  canGoNext
                    ? 'tile-3d-press bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer'
                    : 'bg-zinc-100 dark:bg-zinc-800/40 text-zinc-300 dark:text-zinc-700 border border-zinc-200/40 dark:border-zinc-800 cursor-not-allowed opacity-50'
                }`}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Month/Year Quick Jump Dropdown */}
          {showMonthPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 mb-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-100 dark:border-zinc-700 grid grid-cols-3 gap-1.5 text-xs font-semibold"
            >
              {monthNames.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => {
                    setCurrentViewDate(new Date(viewYear, idx, 1));
                    setShowMonthPicker(false);
                  }}
                  className={`py-1.5 rounded-xl transition ${
                    idx + 1 === viewMonth
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </motion.div>
          )}

          {/* Days of week */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>

          {/* Month Cells Grid */}
          {/* Rule: "Completed habits are represented by their colored dots in the date cell. A day with no completed habit is grey. Future dates are grey as not-yet-happened." */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const hasCompleted = cell.completedDots.length > 0;

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'opacity-25 pointer-events-none'
                      : cell.isFuture
                      ? 'bg-zinc-100/60 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-600 border border-zinc-200/40 dark:border-zinc-800/40'
                      : isSelected
                      ? 'tile-3d-emerald bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 font-black text-emerald-900 dark:text-emerald-100'
                      : cell.isToday
                      ? 'tile-3d-press border-2 border-emerald-500 bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 font-black'
                      : 'tile-3d-press bg-white dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:border-emerald-300'
                  }`}
                  aria-label={`Select date ${cell.dateStr}`}
                >
                  {/* Day number */}
                  <span className={`text-[12px] leading-none ${
                    cell.isToday ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {/* Dots Container */}
                  <div className="w-full flex items-center justify-center gap-0.5 min-h-[14px]">
                    {cell.isFuture ? (
                      // Future date grey indicator
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    ) : hasCompleted ? (
                      // Colored dots representing completed habits
                      cell.completedDots.slice(0, 4).map((dot, idx) => (
                        <span
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: dot.color }}
                          title={dot.name}
                        />
                      ))
                    ) : cell.hasFreeze ? (
                      // Freeze indicator
                      <Shield size={11} className="text-sky-500 fill-sky-500" />
                    ) : (
                      // No completed habit -> grey dot
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300/80 dark:bg-zinc-700/80" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Quick Summary Card - 3D Press Box */}
        {/* Rule: "Tapping a date first opens a quick summary, with an obvious action to open that date’s full detail/history." */}
        <div 
          onClick={() => setShowFullDayModal(true)}
          className="mt-3.5 bg-white dark:bg-zinc-900 rounded-2xl p-4 box-3d-press"
          role="button"
          tabIndex={0}
          aria-label="Open date full details"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowFullDayModal(true);
            }
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CalendarIcon size={14} />
              </div>
              <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                {formatFriendlyDate(selectedDate)}
              </span>
              {selectedDate === todayDate && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Today
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
              <span>Full Details &rarr;</span>
            </span>
          </div>

          {/* Quick breakdown tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {selectedDateSummary.completedCount > 0 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/50 dark:border-emerald-800/50">
                <CheckCircle2 size={12} />
                <span>{selectedDateSummary.completedCount} completed</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold text-[11px] border border-zinc-200/50 dark:border-zinc-700/50">
                0 completed
              </div>
            )}

            {/* Preserving individual habit tags and colors */}
            {selectedDateSummary.completedHabits.map(h => (
              <div
                key={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenHabitDetail(h.id);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl tile-3d-press bg-white dark:bg-zinc-800 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:border-emerald-400"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                <span>{h.name}</span>
              </div>
            ))}

            {selectedDateSummary.hasFreeze && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-[11px] border border-sky-200/50 dark:border-sky-800/50">
                <Shield size={12} />
                <span>Streak Freeze Applied</span>
              </div>
            )}
          </div>
        </div>

        {/* Companion Avatar & Speech Bubble below calendar */}
        {/* Rule: "the avatar belongs below the calendar with one speech bubble." */}
        <CompanionBubble />
      </div>

      {/* Date Detail Modal */}
      <DateDetailModal
        isOpen={showFullDayModal}
        onClose={() => setShowFullDayModal(false)}
        dateStr={selectedDate}
        onOpenHabitDetail={onOpenHabitDetail}
      />

      {/* Device Install & APK Modal */}
      <DeviceInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
