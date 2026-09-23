export type HabitType = 'yes_no' | 'target';

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'specific_dates';

export type HabitStatus = 'active' | 'paused' | 'archived';

export type GoalStatus = 'active' | 'completed' | 'archived';

export type DayRecordStatus = 
  | 'incomplete' 
  | 'partial' 
  | 'completed' 
  | 'missed' 
  | 'late_completed' 
  | 'freeze_protected' 
  | 'paused';

export type CompanionMood = 'Happy' | 'Concerned' | 'Sad' | 'Excited' | 'Proud';

export interface HabitStreak {
  current: number;
  previous: number;
  best: number;
  lastCompletedDate?: string;
  brokeAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  color: string; // hex or tailwind identifier
  type: HabitType;
  targetValue?: number;
  targetUnit?: string;
  frequency: FrequencyType;
  weeklyDays?: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday
  monthlyDays?: number[]; // 1 to 31 (31 adapts to last day of short months)
  specificDates?: string[]; // ISO date strings ['2026-09-13', ...]
  reminderEnabled: boolean;
  reminderTime: string; // "09:00"
  showInMainList: boolean;
  status: HabitStatus;
  pauseConfig?: {
    pausedAt: string;
    resumeDate: string;
    daysCount: number;
  };
  createdAt: string;
  scheduleVersion: number;
  streak: HabitStreak;
}

export interface ProgressEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  type: 'add' | 'set';
  value: number;
  resultingTotal: number;
  timestamp: string;
}

export interface DailyRecord {
  id: string; // `${habitId}_${date}`
  habitId: string;
  date: string; // YYYY-MM-DD
  isDue: boolean;
  status: DayRecordStatus;
  manualCompleted: boolean;
  progressAmount: number; // actual amount recorded so far
  extraAmount: number; // amount recorded exceeding targetValue
  xpEarned: number;
  freezeUsed: boolean;
  isLateCompletion?: boolean;
  lateCompletedAt?: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  originalGoalId?: string; // set when reopened as a new version
  version: number;
  name: string;
  description?: string;
  color: string;
  startDate: string;
  deadline?: string;
  status: GoalStatus;
  completedAt?: string;
  bonusXpAwarded: number;
  habitIds: string[]; // Many-to-many relationship
}

export interface UserProfile {
  name: string;
  theme: 'light' | 'dark' | 'oled';
  accentColor?: 'emerald' | 'purple' | 'amber' | 'cyan';
  autoFreeze: boolean;
  notificationsEnabled: boolean;
  xp: number;
  level: number;
  freezeBalance: number;
  zeroFreezeGraceUsedDate?: string; // Tracks if the 1-time zero-freeze grace was consumed
  lastActiveDate: string;
  overallStreak: {
    current: number;
    previous: number;
    best: number;
    lastCompletedDate?: string;
    brokeAt?: string;
  };
  equippedAvatar: {
    skinColor: string;
    hat?: string;
    accessory?: string;
    outfit?: string;
  };
  unlockedItems: string[];
}

export interface ReminderNotification {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  step: 0 | 1 | 2 | 3; // 0=initial, 1=+3h, 2=+6h, 3=+12h
  timeStr: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'dismissed';
}

export interface BackupMetadata {
  lastBackupAt: string;
  recordsCount: number;
  habitsCount: number;
  goalsCount: number;
  sizeBytes: number;
  status: 'ok' | 'retrying' | 'error';
}

export interface AllTimeStats {
  totalHabitsCompleted: number;
  totalDaysCompleted: number;
  totalMissedDays: number;
  overallCompletionRate: number; // percentage 0-100
  bestOverallStreak: number;
  totalXpEarned: number;
  goalsCompleted: number;
  totalExtraTargetProgress: number;
  mostConsistentHabitName?: string;
  leastConsistentHabitName?: string;
  consistencySummary: string;
}
