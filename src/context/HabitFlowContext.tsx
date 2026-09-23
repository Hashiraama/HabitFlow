import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Habit,
  Goal,
  DailyRecord,
  ProgressEntry,
  UserProfile,
  ReminderNotification,
  BackupMetadata,
  AllTimeStats,
  CompanionMood,
  HabitType,
  FrequencyType
} from '../types';
import {
  formatDateString,
  getTodayDateString,
  addDays,
  isHabitDueOnDate,
  compareDates,
  isFutureDate
} from '../utils/dateUtils';
import {
  getLevelInfo,
  calculateGoalBonusXp,
  LEVEL_REWARDS,
  LevelReward
} from '../utils/xpProgression';
import { evaluateCompanionState, CompanionState } from '../utils/companionEngine';
import { scheduleNativeNotification, requestNativeNotificationPermission } from '../utils/nativeNotifications';

const STORAGE_KEY = 'habitflow_v1_data';
const BACKUP_KEY = 'habitflow_v1_backup';

interface HabitFlowContextType {
  // State
  profile: UserProfile;
  habits: Habit[];
  goals: Goal[];
  records: Record<string, DailyRecord>; // key: `${habitId}_${date}`
  progressEntries: ProgressEntry[];
  backupMeta: BackupMetadata;
  activeNotifications: ReminderNotification[];
  companion: CompanionState;

  // Selected state
  todayDate: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Celebrations
  activeCelebration: {
    type: 'level_up' | 'goal_completed';
    level?: number;
    rewards?: LevelReward[];
    goalName?: string;
    goalBonusXp?: number;
  } | null;
  dismissCelebration: () => void;

  // Habit Actions
  createHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'scheduleVersion' | 'streak'>, linkedGoalIds?: string[]) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string, scheduleUpdates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void; // Removes from active use, archives with history preserved
  pauseHabit: (id: string, daysCount: number, resumeDate: string) => void;
  resumeHabit: (id: string) => void;

  // Daily Record & Progress Actions
  toggleHabitCompletion: (habitId: string, dateStr?: string) => void;
  recordTargetProgress: (habitId: string, type: 'add' | 'set', value: number, dateStr?: string) => void;
  recordLateCompletion: (habitId: string, dateStr: string) => void;
  applyManualFreeze: (dateStr: string) => boolean;

  // Goal Actions
  createGoal: (goalData: Omit<Goal, 'id' | 'version' | 'status' | 'bonusXpAwarded'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  completeGoalManually: (goalId: string, subHabitsAction: 'keep_active' | 'archive_all') => void;
  reopenGoalAsNewVersion: (goalId: string) => void;
  archiveGoal: (goalId: string) => void;
  restoreGoal: (goalId: string) => void;

  // Reminders / Notifications
  respondToNotification: (notificationId: string, action: 'yes' | 'no' | 'not_yet') => void;
  simulateReminderTrigger: (habitId: string) => void;
  dismissNotification: (id: string) => void;

  // Profile / Settings
  setTheme: (theme: 'light' | 'dark') => void;
  toggleAutoFreeze: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  equipAvatarItem: (category: 'skinColor' | 'hat' | 'accessory' | 'outfit', itemId: string) => void;

  // Helpers
  getHabitRecordsForDate: (dateStr: string) => Array<{ habit: Habit; record?: DailyRecord }>;
  getGoalProgress: (goal: Goal) => { percent: number; completedCount: number; totalCount: number };
  calculateAllTimeStats: () => AllTimeStats;
  saveErrorMessage: string | null;
  clearSaveError: () => void;
}

const HabitFlowContext = createContext<HabitFlowContextType | null>(null);

// Default initial state for a fresh app experience
const initialProfile: UserProfile = {
  name: 'Companion',
  theme: 'light',
  autoFreeze: true,
  notificationsEnabled: true,
  xp: 14,
  level: 2,
  freezeBalance: 5,
  lastActiveDate: getTodayDateString(),
  overallStreak: {
    current: 3,
    previous: 0,
    best: 3,
    lastCompletedDate: getTodayDateString(),
  },
  equippedAvatar: {
    skinColor: '#10B981', // Classic Android emerald
    hat: 'hat_headphones',
  },
  unlockedItems: ['skin_teal', 'hat_headphones'],
};

// Seed habits
const seedHabits: Habit[] = [
  {
    id: 'habit_1',
    name: 'Morning Hydration',
    color: '#0284C7', // Sky blue
    type: 'target',
    targetValue: 8,
    targetUnit: 'glasses',
    frequency: 'daily',
    reminderEnabled: true,
    reminderTime: '08:00',
    showInMainList: true,
    status: 'active',
    createdAt: addDays(getTodayDateString(), -10),
    scheduleVersion: 1,
    streak: { current: 3, previous: 0, best: 3, lastCompletedDate: getTodayDateString() },
  },
  {
    id: 'habit_2',
    name: 'Mindful Reading',
    color: '#8B5CF6', // Purple
    type: 'target',
    targetValue: 20,
    targetUnit: 'pages',
    frequency: 'daily',
    reminderEnabled: true,
    reminderTime: '20:30',
    showInMainList: true,
    status: 'active',
    createdAt: addDays(getTodayDateString(), -10),
    scheduleVersion: 1,
    streak: { current: 3, previous: 0, best: 3, lastCompletedDate: getTodayDateString() },
  },
  {
    id: 'habit_3',
    name: 'Daily 30m Walk',
    color: '#10B981', // Emerald
    type: 'yes_no',
    frequency: 'daily',
    reminderEnabled: true,
    reminderTime: '17:00',
    showInMainList: true,
    status: 'active',
    createdAt: addDays(getTodayDateString(), -10),
    scheduleVersion: 1,
    streak: { current: 2, previous: 0, best: 2, lastCompletedDate: addDays(getTodayDateString(), -1) },
  },
];

const seedGoals: Goal[] = [
  {
    id: 'goal_wellness_mastery',
    version: 1,
    name: 'Build Healthy Foundations',
    description: 'Establish consistent daily physical and mental wellbeing habits.',
    color: '#059669',
    startDate: addDays(getTodayDateString(), -10),
    deadline: addDays(getTodayDateString(), 30),
    status: 'active',
    bonusXpAwarded: 0,
    habitIds: ['habit_1', 'habit_2', 'habit_3'],
  },
];

export const HabitFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDate = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) return parsed.profile;
      }
    } catch (e) {
      console.error('Failed reading profile from storage', e);
    }
    return initialProfile;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.habits) return parsed.habits;
      }
    } catch (e) {
      console.error('Failed reading habits from storage', e);
    }
    return seedHabits;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.goals) return parsed.goals;
      }
    } catch (e) {
      console.error('Failed reading goals from storage', e);
    }
    return seedGoals;
  });

  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.records) return parsed.records;
      }
    } catch (e) {
      console.error('Failed reading records from storage', e);
    }
    // Generate initial records for the past 3 days so calendar has dots
    const recs: Record<string, DailyRecord> = {};
    for (let i = 3; i >= 1; i--) {
      const d = addDays(todayDate, -i);
      seedHabits.forEach(h => {
        const key = `${h.id}_${d}`;
        recs[key] = {
          id: key,
          habitId: h.id,
          date: d,
          isDue: true,
          status: 'completed',
          manualCompleted: true,
          progressAmount: h.targetValue || 1,
          extraAmount: 0,
          xpEarned: 1,
          freezeUsed: false,
          updatedAt: new Date().toISOString(),
        };
      });
    }
    return recs;
  });

  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.progressEntries) return parsed.progressEntries;
      }
    } catch (e) {
      console.error('Failed reading progress entries from storage', e);
    }
    return [];
  });

  const [activeNotifications, setActiveNotifications] = useState<ReminderNotification[]>([]);
  const [activeCelebration, setActiveCelebration] = useState<{
    type: 'level_up' | 'goal_completed';
    level?: number;
    rewards?: LevelReward[];
    goalName?: string;
    goalBonusXp?: number;
  } | null>(null);

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Backup metadata tracking
  const [backupMeta, setBackupMeta] = useState<BackupMetadata>(() => {
    try {
      const saved = localStorage.getItem(BACKUP_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading backup metadata', e);
    }
    return {
      lastBackupAt: new Date().toISOString(),
      recordsCount: Object.keys(records).length,
      habitsCount: habits.length,
      goalsCount: goals.length,
      sizeBytes: 1024,
      status: 'ok',
    };
  });

  // Persist data with automatic retry on failure
  const persistState = useCallback((data: {
    profile: UserProfile;
    habits: Habit[];
    goals: Goal[];
    records: Record<string, DailyRecord>;
    progressEntries: ProgressEntry[];
  }) => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);

      // Also create automatic local backup
      const meta: BackupMetadata = {
        lastBackupAt: new Date().toISOString(),
        recordsCount: Object.keys(data.records).length,
        habitsCount: data.habits.length,
        goalsCount: data.goals.length,
        sizeBytes: new Blob([serialized]).size,
        status: 'ok',
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(meta));
      setBackupMeta(meta);
      setSaveErrorMessage(null);
    } catch (err) {
      console.warn('First save attempt failed, retrying...', err);
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        setSaveErrorMessage(null);
      } catch (retryErr) {
        console.error('Storage write failed after retry', retryErr);
        setSaveErrorMessage('Something went wrong saving your data. Please check available device storage.');
      }
    }
  }, []);

  // Sync effect when core data changes
  useEffect(() => {
    persistState({ profile, habits, goals, records, progressEntries });
  }, [profile, habits, goals, records, progressEntries, persistState]);

  // Apply dark/light class to root document element
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Auto-Freeze and Missed Day Check on App Load
  // Rule: Check if yesterday or previous days had due habits and no completions.
  useEffect(() => {
    const yesterday = addDays(todayDate, -1);
    if (profile.lastActiveDate && compareDates(profile.lastActiveDate, yesterday) < 0) {
      // Return after inactive days: Evaluate missing days
      // If autoFreeze is enabled and we have freezes, protect streak
      // If balance is 0, protect once via zeroFreezeGraceUsedDate
    }

    // Check yesterday's habits
    const activeHabits = habits.filter(h => h.status === 'active');
    const yesterdayDueHabits = activeHabits.filter(h => isHabitDueOnDate(h, yesterday));

    if (yesterdayDueHabits.length > 0) {
      const anyYesterdayCompleted = yesterdayDueHabits.some(h => {
        const rec = records[`${h.id}_${yesterday}`];
        return rec && (rec.status === 'completed' || rec.status === 'late_completed');
      });

      if (!anyYesterdayCompleted) {
        // Need freeze protection or streak break
        const anyYesterdayFrozen = yesterdayDueHabits.some(h => {
          const rec = records[`${h.id}_${yesterday}`];
          return rec && rec.status === 'freeze_protected';
        });

        if (!anyYesterdayFrozen && profile.autoFreeze && profile.freezeBalance > 0) {
          // Auto-apply freeze to protect yesterday
          setProfile(prev => ({
            ...prev,
            freezeBalance: Math.max(0, prev.freezeBalance - 1),
            lastActiveDate: todayDate,
          }));

          setRecords(prev => {
            const updated = { ...prev };
            yesterdayDueHabits.forEach(h => {
              const k = `${h.id}_${yesterday}`;
              updated[k] = {
                id: k,
                habitId: h.id,
                date: yesterday,
                isDue: true,
                status: 'freeze_protected',
                manualCompleted: false,
                progressAmount: updated[k]?.progressAmount || 0,
                extraAmount: 0,
                xpEarned: 0,
                freezeUsed: true,
                updatedAt: new Date().toISOString(),
              };
            });
            return updated;
          });
        } else if (!anyYesterdayFrozen && profile.autoFreeze && profile.freezeBalance === 0 && !profile.zeroFreezeGraceUsedDate) {
          // Zero-freeze grace rule: protect streak for one missed day without awarding a freeze
          setProfile(prev => ({
            ...prev,
            zeroFreezeGraceUsedDate: yesterday,
            lastActiveDate: todayDate,
          }));

          setRecords(prev => {
            const updated = { ...prev };
            yesterdayDueHabits.forEach(h => {
              const k = `${h.id}_${yesterday}`;
              updated[k] = {
                id: k,
                habitId: h.id,
                date: yesterday,
                isDue: true,
                status: 'freeze_protected',
                manualCompleted: false,
                progressAmount: updated[k]?.progressAmount || 0,
                extraAmount: 0,
                xpEarned: 0,
                freezeUsed: true,
                notes: 'Protected by Zero-Freeze Grace',
                updatedAt: new Date().toISOString(),
              };
            });
            return updated;
          });
        }
      }
    }

    // Auto-archive specific_date habits whose final date has passed
    habits.forEach(h => {
      if (h.status === 'active' && h.frequency === 'specific_dates' && h.specificDates && h.specificDates.length > 0) {
        const sorted = [...h.specificDates].sort();
        const lastDate = sorted[sorted.length - 1];
        if (compareDates(lastDate, todayDate) < 0) {
          // Automatically archive the habit while preserving history
          setHabits(prev => prev.map(item => item.id === h.id ? { ...item, status: 'archived' } : item));
        }
      }
    });
  }, [todayDate, habits, records, profile.autoFreeze, profile.freezeBalance, profile.zeroFreezeGraceUsedDate, profile.lastActiveDate]);

  // Check XP and trigger level up if needed
  const awardXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setProfile(prev => {
      const newXp = prev.xp + amount;
      const oldLevelInfo = getLevelInfo(prev.xp);
      const newLevelInfo = getLevelInfo(newXp);

      if (newLevelInfo.level > oldLevelInfo.level) {
        // Level up!
        const earnedRewards: LevelReward[] = [];
        let additionalFreezes = 0;

        for (let l = oldLevelInfo.level + 1; l <= newLevelInfo.level; l++) {
          const rList = LEVEL_REWARDS[l] || [];
          rList.forEach(r => {
            earnedRewards.push(r);
            if (r.type === 'freeze') {
              additionalFreezes += 1;
            }
          });
        }

        // Add unlocked item IDs to profile
        const newUnlocked = [...prev.unlockedItems];
        earnedRewards.forEach(r => {
          if (r.itemId && !newUnlocked.includes(r.itemId)) {
            newUnlocked.push(r.itemId);
          }
        });

        // Trigger level up celebration
        setTimeout(() => {
          setActiveCelebration({
            type: 'level_up',
            level: newLevelInfo.level,
            rewards: earnedRewards,
          });
        }, 300);

        return {
          ...prev,
          xp: newXp,
          level: newLevelInfo.level,
          freezeBalance: prev.freezeBalance + additionalFreezes,
          unlockedItems: newUnlocked,
        };
      }

      return {
        ...prev,
        xp: newXp,
      };
    });
  }, []);

  // Recalculate streak after completion on dateStr
  const updateStreakAfterCompletion = useCallback((habitId: string, dateStr: string) => {
    // 1. Individual Habit Streak
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const currentStreak = h.streak.current;
      const lastComp = h.streak.lastCompletedDate;

      // If already counted for this date, do nothing
      if (lastComp === dateStr) return h;

      const newCurrent = (lastComp && (lastComp === addDays(dateStr, -1) || isHabitDueOnDate(h, lastComp))) 
        ? currentStreak + 1 
        : (currentStreak === 0 ? 1 : currentStreak + 1);

      return {
        ...h,
        streak: {
          current: newCurrent,
          previous: h.streak.previous,
          best: Math.max(h.streak.best, newCurrent),
          lastCompletedDate: dateStr,
        }
      };
    }));

    // 2. Overall Streak: continues if at least one scheduled habit completed that day
    setProfile(prev => {
      const overall = prev.overallStreak;
      if (overall.lastCompletedDate === dateStr) {
        return prev;
      }
      const isConsecutive = overall.lastCompletedDate === addDays(dateStr, -1) || overall.current === 0;
      const newCurrent = isConsecutive ? overall.current + 1 : 1;
      return {
        ...prev,
        overallStreak: {
          current: newCurrent,
          previous: overall.current > 0 && !isConsecutive ? overall.current : overall.previous,
          best: Math.max(overall.best, newCurrent),
          lastCompletedDate: dateStr,
        },
        lastActiveDate: dateStr,
      };
    });
  }, []);

  // Toggle habit completion for a day (Yes/No or manual toggle on target)
  const toggleHabitCompletion = useCallback((habitId: string, dateStr = todayDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const recordKey = `${habitId}_${dateStr}`;
    const existing = records[recordKey];
    const isCurrentlyCompleted = existing?.status === 'completed';

    if (isCurrentlyCompleted) {
      // Uncompleting habit
      setRecords(prev => ({
        ...prev,
        [recordKey]: {
          id: recordKey,
          habitId,
          date: dateStr,
          isDue: isHabitDueOnDate(habit, dateStr),
          status: (habit.type === 'target' && (existing.progressAmount || 0) > 0) ? 'partial' : 'incomplete',
          manualCompleted: false,
          progressAmount: existing.progressAmount || 0,
          extraAmount: existing.extraAmount || 0,
          xpEarned: 0,
          freezeUsed: false,
          updatedAt: new Date().toISOString(),
        }
      }));
    } else {
      // Completing habit
      const progress = habit.type === 'target' 
        ? Math.max(existing?.progressAmount || 0, habit.targetValue || 1)
        : 1;
      const extra = habit.type === 'target' && habit.targetValue
        ? Math.max(0, progress - habit.targetValue)
        : 0;

      setRecords(prev => ({
        ...prev,
        [recordKey]: {
          id: recordKey,
          habitId,
          date: dateStr,
          isDue: isHabitDueOnDate(habit, dateStr),
          status: 'completed',
          manualCompleted: true,
          progressAmount: progress,
          extraAmount: extra,
          xpEarned: 1, // Rule: exactly 1 XP per normal completion
          freezeUsed: false,
          updatedAt: new Date().toISOString(),
        }
      }));

      // Cancel any remaining reminders for this habit today!
      setActiveNotifications(prev => prev.filter(n => !(n.habitId === habitId && n.date === dateStr)));

      awardXp(1);
      updateStreakAfterCompletion(habitId, dateStr);

      // Check linked goals for completion
      checkGoalsAfterHabitUpdate(habitId);
    }
  }, [habits, records, todayDate, awardXp, updateStreakAfterCompletion]);

  // Record target progress (amount or set total)
  const recordTargetProgress = useCallback((habitId: string, type: 'add' | 'set', value: number, dateStr = todayDate) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.type !== 'target') return;

    const recordKey = `${habitId}_${dateStr}`;
    const existing = records[recordKey];
    const currentTotal = existing?.progressAmount || 0;
    const newTotal = Math.max(0, type === 'add' ? currentTotal + value : value);
    const target = habit.targetValue || 1;
    const extra = Math.max(0, newTotal - target);

    // Rule: Reaching the target does not auto-complete the habit.
    // The user must tap the completion checkmark (or can manually complete before target).
    const isCompleted = existing?.manualCompleted ?? false;
    const status: DailyRecord['status'] = isCompleted 
      ? 'completed' 
      : (newTotal > 0 ? 'partial' : 'incomplete');

    // Add progress entry to audit log
    const entry: ProgressEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      habitId,
      date: dateStr,
      type,
      value,
      resultingTotal: newTotal,
      timestamp: new Date().toISOString(),
    };
    setProgressEntries(prev => [...prev, entry]);

    setRecords(prev => ({
      ...prev,
      [recordKey]: {
        id: recordKey,
        habitId,
        date: dateStr,
        isDue: isHabitDueOnDate(habit, dateStr),
        status,
        manualCompleted: isCompleted,
        progressAmount: newTotal,
        extraAmount: extra,
        xpEarned: isCompleted ? 1 : 0,
        freezeUsed: false,
        updatedAt: new Date().toISOString(),
      }
    }));

    checkGoalsAfterHabitUpdate(habitId);
  }, [habits, records, todayDate]);

  // Late completion
  // Rule: "A user may select any prior missed scheduled date and record a late completion.
  // Mark it clearly as a late completion in history.
  // It does not repair or extend the original individual or overall streak, and earns 0 XP. It updates history only."
  const recordLateCompletion = useCallback((habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const recordKey = `${habitId}_${dateStr}`;
    const existing = records[recordKey];

    setRecords(prev => ({
      ...prev,
      [recordKey]: {
        id: recordKey,
        habitId,
        date: dateStr,
        isDue: true,
        status: 'late_completed',
        manualCompleted: true,
        progressAmount: habit.type === 'target' ? (habit.targetValue || 1) : 1,
        extraAmount: 0,
        xpEarned: 0, // Rule: earns 0 XP
        freezeUsed: false,
        isLateCompletion: true,
        lateCompletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }));
  }, [habits, records]);

  // Manual freeze application
  const applyManualFreeze = useCallback((dateStr: string): boolean => {
    if (profile.freezeBalance <= 0) return false;

    // Apply freeze to all due habits on dateStr
    const dueHabits = habits.filter(h => h.status === 'active' && isHabitDueOnDate(h, dateStr));
    if (dueHabits.length === 0) return false;

    setProfile(prev => ({
      ...prev,
      freezeBalance: Math.max(0, prev.freezeBalance - 1),
    }));

    setRecords(prev => {
      const updated = { ...prev };
      dueHabits.forEach(h => {
        const k = `${h.id}_${dateStr}`;
        updated[k] = {
          id: k,
          habitId: h.id,
          date: dateStr,
          isDue: true,
          status: 'freeze_protected',
          manualCompleted: false,
          progressAmount: updated[k]?.progressAmount || 0,
          extraAmount: 0,
          xpEarned: 0, // Freeze use earns 0 XP
          freezeUsed: true,
          updatedAt: new Date().toISOString(),
        };
      });
      return updated;
    });

    return true;
  }, [profile.freezeBalance, habits]);

  // Calculate goal progress derived from linked sub-habits
  const getGoalProgress = useCallback((goal: Goal) => {
    if (!goal.habitIds || goal.habitIds.length === 0) {
      return { percent: 0, completedCount: 0, totalCount: 0 };
    }

    const linkedHabits = habits.filter(h => goal.habitIds.includes(h.id));
    if (linkedHabits.length === 0) {
      return { percent: 0, completedCount: 0, totalCount: 0 };
    }

    let totalProgressSum = 0;
    let completedCount = 0;

    linkedHabits.forEach(h => {
      // Calculate habit completion ratio over its active scheduled days or today
      const todayRecord = records[`${h.id}_${todayDate}`];
      if (todayRecord && (todayRecord.status === 'completed' || todayRecord.status === 'late_completed')) {
        completedCount++;
        totalProgressSum += 1;
      } else if (h.type === 'target' && todayRecord && todayRecord.progressAmount > 0) {
        const target = h.targetValue || 1;
        const ratio = Math.min(1, todayRecord.progressAmount / target);
        totalProgressSum += ratio;
      }
    });

    const percent = Math.min(100, Math.round((totalProgressSum / linkedHabits.length) * 100));
    return {
      percent,
      completedCount,
      totalCount: linkedHabits.length,
    };
  }, [habits, records, todayDate]);

  // Check goals after habit completion
  const checkGoalsAfterHabitUpdate = useCallback((habitId: string) => {
    const linkedGoals = goals.filter(g => g.status === 'active' && g.habitIds.includes(habitId));
    linkedGoals.forEach(g => {
      const progress = getGoalProgress(g);
      if (progress.percent >= 100) {
        // Goal reached 100%!
        // Calculate bonus XP
        const bonusXp = calculateGoalBonusXp(g.habitIds.length);

        setGoals(prev => prev.map(item => item.id === g.id ? {
          ...item,
          status: 'completed',
          completedAt: new Date().toISOString(),
          bonusXpAwarded: bonusXp,
        } : item));

        awardXp(bonusXp);

        setActiveCelebration({
          type: 'goal_completed',
          goalName: g.name,
          goalBonusXp: bonusXp,
        });
      }
    });
  }, [goals, getGoalProgress, awardXp]);

  // Reopen goal as new version
  // Rule: "Completed goals can be reopened only as a new version. Preserve the original completed goal and its history unchanged."
  const reopenGoalAsNewVersion = useCallback((goalId: string) => {
    const existing = goals.find(g => g.id === goalId);
    if (!existing) return;

    const newVersionGoal: Goal = {
      id: `goal_${Date.now()}`,
      originalGoalId: existing.originalGoalId || existing.id,
      version: existing.version + 1,
      name: `${existing.name} (V${existing.version + 1})`,
      description: existing.description,
      color: existing.color,
      startDate: todayDate,
      status: 'active',
      bonusXpAwarded: 0,
      habitIds: [...existing.habitIds],
    };

    setGoals(prev => [newVersionGoal, ...prev]);
  }, [goals, todayDate]);

  // Complete goal manually with sub-habits decision
  // Rule: "When a goal reaches 100%, ask the user what they want to do with its sub-habits; do not force one outcome."
  const completeGoalManually = useCallback((goalId: string, subHabitsAction: 'keep_active' | 'archive_all') => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const bonusXp = calculateGoalBonusXp(goal.habitIds.length);

    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      status: 'completed',
      completedAt: new Date().toISOString(),
      bonusXpAwarded: bonusXp,
    } : g));

    if (subHabitsAction === 'archive_all') {
      setHabits(prev => prev.map(h => goal.habitIds.includes(h.id) ? { ...h, status: 'archived' } : h));
    }

    awardXp(bonusXp);
    setActiveCelebration({
      type: 'goal_completed',
      goalName: goal.name,
      goalBonusXp: bonusXp,
    });
  }, [goals, awardXp]);

  // Habit CRUD & Lifecycle
  const createHabit = useCallback((
    habitData: Omit<Habit, 'id' | 'createdAt' | 'scheduleVersion' | 'streak'>,
    linkedGoalIds: string[] = []
  ) => {
    const newId = `habit_${Date.now()}`;
    const newHabit: Habit = {
      ...habitData,
      id: newId,
      createdAt: todayDate,
      scheduleVersion: 1,
      streak: { current: 0, previous: 0, best: 0 },
    };

    setHabits(prev => [newHabit, ...prev]);

    // Link to goals if requested
    if (linkedGoalIds.length > 0) {
      setGoals(prev => prev.map(g => {
        if (linkedGoalIds.includes(g.id)) {
          return { ...g, habitIds: [...g.habitIds, newId] };
        }
        return g;
      }));
    }
  }, [todayDate]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        ...updates,
        // Schedule version increments when schedule changes
        scheduleVersion: updates.frequency || updates.weeklyDays || updates.monthlyDays || updates.specificDates 
          ? h.scheduleVersion + 1 
          : h.scheduleVersion,
      };
    }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, status: 'archived' } : h));
  }, []);

  // Restore habit: requires user to set/confirm schedule and target
  // Rule: "Restoring a habit requires the user to set/confirm schedule and target before becoming active. Its old history and XP stay connected, but its individual streak starts again from 0 because of the archived gap."
  const restoreHabit = useCallback((id: string, scheduleUpdates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        ...scheduleUpdates,
        status: 'active',
        pauseConfig: undefined,
        streak: {
          current: 0, // resets to 0 due to archived gap
          previous: h.streak.current || h.streak.previous,
          best: h.streak.best,
        },
        scheduleVersion: h.scheduleVersion + 1,
      };
    }));
  }, []);

  // Deleting habit: Removes from active use while preserving historical data/statistics (Rule 11)
  const deleteHabit = useCallback((id: string) => {
    archiveHabit(id);
  }, [archiveHabit]);

  // Pause habit: supports chosen resume date and number of days
  const pauseHabit = useCallback((id: string, daysCount: number, resumeDate: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        status: 'paused',
        pauseConfig: {
          pausedAt: todayDate,
          resumeDate,
          daysCount,
        }
      };
    }));
  }, [todayDate]);

  const resumeHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        status: 'active',
        pauseConfig: undefined,
      };
    }));
  }, []);

  // Goal CRUD & Lifecycle
  const createGoal = useCallback((goalData: Omit<Goal, 'id' | 'version' | 'status' | 'bonusXpAwarded'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      version: 1,
      status: 'active',
      bonusXpAwarded: 0,
    };
    setGoals(prev => [newGoal, ...prev]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const archiveGoal = useCallback((id: string) => {
    // Rule: "Ending/deleting a goal archives the goal and its sub-habits, preserves all history/statistics, and allows restoration."
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'archived' } : g));
    setHabits(prev => prev.map(h => goal.habitIds.includes(h.id) ? { ...h, status: 'archived' } : h));
  }, [goals]);

  const restoreGoal = useCallback((id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'active' } : g));
  }, []);

  // Notification Response
  // Rule:
  // "Notification content asks whether the work was done and provides actions: Yes, No, and Not yet.
  // Yes completes the habit immediately (with normal 1 XP) and cancels all remaining reminders for that habit that day.
  // No leaves it incomplete and the remaining reminders continue.
  // Not yet leaves it incomplete; the reminder sequence continues normally.
  // Pressing No on the final +12h reminder leaves it incomplete until day end, at which point it becomes missed."
  const respondToNotification = useCallback((notificationId: string, action: 'yes' | 'no' | 'not_yet') => {
    const notif = activeNotifications.find(n => n.id === notificationId);
    if (!notif) return;

    if (action === 'yes') {
      toggleHabitCompletion(notif.habitId, notif.date);
      setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
    } else if (action === 'no' || action === 'not_yet') {
      // Habit remains incomplete; dismiss this particular notification banner
      setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, [activeNotifications, toggleHabitCompletion]);

  // Trigger reminder delivery (in-app banner + native device local notification)
  const simulateReminderTrigger = useCallback((habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const notif: ReminderNotification = {
      id: `notif_${Date.now()}`,
      habitId: habit.id,
      habitName: habit.name,
      date: todayDate,
      step: 0,
      timeStr: habit.reminderTime || 'Now',
      status: 'pending',
    };
    setActiveNotifications(prev => [notif, ...prev.filter(n => n.habitId !== habitId)]);

    // Trigger real native notification
    scheduleNativeNotification(
      Math.abs(habitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
      `HabitFlow Reminder: ${habit.name}`,
      `Time to complete "${habit.name}" today!`
    );
  }, [habits, todayDate]);

  const dismissNotification = useCallback((id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Settings & Customization
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setProfile(prev => ({ ...prev, theme }));
  }, []);

  const toggleAutoFreeze = useCallback(() => {
    setProfile(prev => ({ ...prev, autoFreeze: !prev.autoFreeze }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setProfile(prev => ({ ...prev, notificationsEnabled: enabled }));
    if (enabled) {
      requestNativeNotificationPermission();
    }
  }, []);

  const equipAvatarItem = useCallback((category: 'skinColor' | 'hat' | 'accessory' | 'outfit', itemId: string) => {
    setProfile(prev => ({
      ...prev,
      equippedAvatar: {
        ...prev.equippedAvatar,
        [category]: itemId,
      }
    }));
  }, []);

  const dismissCelebration = useCallback(() => {
    setActiveCelebration(null);
  }, []);

  const clearSaveError = useCallback(() => {
    setSaveErrorMessage(null);
  }, []);

  // Helper: Get habit records for a specific date
  const getHabitRecordsForDate = useCallback((dateStr: string) => {
    return habits
      .filter(h => h.status === 'active' || isHabitDueOnDate(h, dateStr) || records[`${h.id}_${dateStr}`])
      .map(habit => {
        const record = records[`${habit.id}_${dateStr}`];
        return { habit, record };
      });
  }, [habits, records]);

  // All-time statistics
  // Rule: "Statistics are detailed but use numbers and written summaries—no charts/graphs and no date-range picker. Show all-time statistics only."
  const calculateAllTimeStats = useCallback((): AllTimeStats => {
    const recordList = Object.values(records) as DailyRecord[];
    let totalHabitsCompleted = 0;
    let totalExtraTargetProgress = 0;
    const completedDaysSet = new Set<string>();
    const missedDaysSet = new Set<string>();

    recordList.forEach(r => {
      if (r.status === 'completed' || r.status === 'late_completed') {
        totalHabitsCompleted++;
        completedDaysSet.add(r.date);
      } else if (r.status === 'missed') {
        missedDaysSet.add(r.date);
      }
      if (r.extraAmount) {
        totalExtraTargetProgress += r.extraAmount;
      }
    });

    const totalDaysRecorded = completedDaysSet.size + missedDaysSet.size;
    const overallCompletionRate = totalDaysRecorded > 0 
      ? Math.round((completedDaysSet.size / totalDaysRecorded) * 100) 
      : (completedDaysSet.size > 0 ? 100 : 0);

    const goalsCompleted = goals.filter(g => g.status === 'completed').length;

    // Consistency analysis per habit
    let mostConsistentHabitName: string | undefined;
    let leastConsistentHabitName: string | undefined;
    let highestCompletions = -1;
    let lowestCompletions = 999999;

    habits.forEach(h => {
      const hRecords = recordList.filter(r => r.habitId === h.id && (r.status === 'completed' || r.status === 'late_completed'));
      if (hRecords.length > highestCompletions) {
        highestCompletions = hRecords.length;
        mostConsistentHabitName = h.name;
      }
      if (hRecords.length < lowestCompletions && hRecords.length > 0) {
        lowestCompletions = hRecords.length;
        leastConsistentHabitName = h.name;
      }
    });

    let consistencySummary = 'You have logged solid effort. Consistency builds strong lifelong discipline!';
    if (completedDaysSet.size >= 10) {
      consistencySummary = `You have shown fantastic dedication across ${completedDaysSet.size} active days. Your routines are taking firm root.`;
    } else if (completedDaysSet.size >= 3) {
      consistencySummary = `Strong early rhythm! You have completed habits across ${completedDaysSet.size} days.`;
    }

    return {
      totalHabitsCompleted,
      totalDaysCompleted: completedDaysSet.size,
      totalMissedDays: missedDaysSet.size,
      overallCompletionRate,
      bestOverallStreak: profile.overallStreak.best,
      totalXpEarned: profile.xp,
      goalsCompleted,
      totalExtraTargetProgress: Math.round(totalExtraTargetProgress * 10) / 10,
      mostConsistentHabitName,
      leastConsistentHabitName: leastConsistentHabitName !== mostConsistentHabitName ? leastConsistentHabitName : undefined,
      consistencySummary,
    };
  }, [records, goals, habits, profile.overallStreak.best, profile.xp]);

  // Evaluate Companion State
  const companion = useMemo(() => {
    const todayHabits = habits.filter(h => h.status === 'active' && isHabitDueOnDate(h, todayDate));
    const todayRecList = todayHabits.map(h => records[`${h.id}_${todayDate}`]).filter(Boolean);
    const completedCount = todayRecList.filter(r => r && (r.status === 'completed' || r.status === 'late_completed')).length;

    const yesterday = addDays(todayDate, -1);
    const yesterdayHabits = habits.filter(h => isHabitDueOnDate(h, yesterday));
    const yesterdayRecList = yesterdayHabits.map(h => records[`${h.id}_${yesterday}`]).filter(Boolean);

    return evaluateCompanionState({
      todayDate,
      habits: habits.filter(h => h.status === 'active'),
      todayRecords: todayRecList,
      yesterdayRecords: yesterdayRecList,
      overallStreak: profile.overallStreak.current,
      bestOverallStreak: profile.overallStreak.best,
      freezeBalance: profile.freezeBalance,
      totalCompletedToday: completedCount,
      totalDueToday: todayHabits.length,
      hasRecentLevelUp: activeCelebration?.type === 'level_up',
      hasRecentGoalCompleted: activeCelebration?.type === 'goal_completed',
    });
  }, [habits, records, todayDate, profile.overallStreak, profile.freezeBalance, activeCelebration]);

  const contextValue = useMemo<HabitFlowContextType>(() => ({
    profile,
    habits,
    goals,
    records,
    progressEntries,
    backupMeta,
    activeNotifications,
    companion,
    todayDate,
    selectedDate,
    setSelectedDate,
    activeCelebration,
    dismissCelebration,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    pauseHabit,
    resumeHabit,
    toggleHabitCompletion,
    recordTargetProgress,
    recordLateCompletion,
    applyManualFreeze,
    createGoal,
    updateGoal,
    completeGoalManually,
    reopenGoalAsNewVersion,
    archiveGoal,
    restoreGoal,
    respondToNotification,
    simulateReminderTrigger,
    dismissNotification,
    setTheme,
    toggleAutoFreeze,
    setNotificationsEnabled,
    equipAvatarItem,
    getHabitRecordsForDate,
    getGoalProgress,
    calculateAllTimeStats,
    saveErrorMessage,
    clearSaveError,
  }), [
    profile,
    habits,
    goals,
    records,
    progressEntries,
    backupMeta,
    activeNotifications,
    companion,
    todayDate,
    selectedDate,
    activeCelebration,
    dismissCelebration,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    pauseHabit,
    resumeHabit,
    toggleHabitCompletion,
    recordTargetProgress,
    recordLateCompletion,
    applyManualFreeze,
    createGoal,
    updateGoal,
    completeGoalManually,
    reopenGoalAsNewVersion,
    archiveGoal,
    restoreGoal,
    respondToNotification,
    simulateReminderTrigger,
    dismissNotification,
    setTheme,
    toggleAutoFreeze,
    setNotificationsEnabled,
    equipAvatarItem,
    getHabitRecordsForDate,
    getGoalProgress,
    calculateAllTimeStats,
    saveErrorMessage,
    clearSaveError,
  ]);

  return (
    <HabitFlowContext.Provider value={contextValue}>
      {children}
    </HabitFlowContext.Provider>
  );
};

export const useHabitFlow = () => {
  const ctx = useContext(HabitFlowContext);
  if (!ctx) {
    throw new Error('useHabitFlow must be used within HabitFlowProvider');
  }
  return ctx;
};
