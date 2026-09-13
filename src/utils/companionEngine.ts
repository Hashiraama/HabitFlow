import { CompanionMood, DailyRecord, Habit } from '../types';

export interface CompanionState {
  mood: CompanionMood;
  message: string;
  reason: string; // Explains why it has this mood when user taps
}

export interface CompanionContext {
  todayDate: string;
  habits: Habit[];
  todayRecords: DailyRecord[];
  yesterdayRecords: DailyRecord[];
  overallStreak: number;
  bestOverallStreak: number;
  freezeBalance: number;
  totalCompletedToday: number;
  totalDueToday: number;
  hasRecentLevelUp?: boolean;
  hasRecentGoalCompleted?: boolean;
}

export function evaluateCompanionState(ctx: CompanionContext): CompanionState {
  const {
    habits,
    overallStreak,
    bestOverallStreak,
    totalCompletedToday,
    totalDueToday,
    hasRecentLevelUp,
    hasRecentGoalCompleted,
    yesterdayRecords,
  } = ctx;

  // 1. Major milestone event (Level Up or Goal Completed) -> Proud or Excited
  if (hasRecentGoalCompleted) {
    return {
      mood: 'Proud',
      message: 'Incredible achievement! You conquered a major goal today. Take a moment to celebrate!',
      reason: 'I am beaming with pride because you crossed the finish line on your big goal!'
    };
  }

  if (hasRecentLevelUp) {
    return {
      mood: 'Excited',
      message: 'Level Up! Your dedication unlocked brand new upgrades and another streak freeze!',
      reason: 'I am super excited because your consistency pushed you to a whole new level!'
    };
  }

  // 2. All scheduled habits for today are completed
  if (totalDueToday > 0 && totalCompletedToday >= totalDueToday) {
    return {
      mood: 'Proud',
      message: `All ${totalDueToday} habit${totalDueToday > 1 ? 's' : ''} done for today! You are building unstoppable momentum.`,
      reason: `I am proud because you completed every single scheduled habit on your list today.`
    };
  }

  // 3. If at least one scheduled habit is completed today, keep the avatar positive!
  // (Prompt non-negotiable: "If at least one scheduled habit is completed today, keep the avatar positive rather than dwelling on other missed habits.")
  if (totalCompletedToday > 0) {
    if (overallStreak >= 5) {
      return {
        mood: 'Excited',
        message: `${overallStreak}-day streak alive and thriving! You showed up today.`,
        reason: `I am excited because your ${overallStreak}-day streak is rolling and you logged progress today!`
      };
    }
    return {
      mood: 'Happy',
      message: 'Great job logging today! Small daily actions add up to massive growth over time.',
      reason: 'I am happy because you showed up and completed habits today. Consistency in action!'
    };
  }

  // 4. No habits completed yet today. Let's inspect yesterday & streaks.
  // Did yesterday have missed habits without a freeze?
  const yesterdayDue = yesterdayRecords.filter(r => r.isDue);
  const yesterdayMissed = yesterdayDue.some(r => r.status === 'missed');
  const yesterdayFrozen = yesterdayDue.some(r => r.status === 'freeze_protected');

  if (yesterdayFrozen) {
    return {
      mood: 'Concerned',
      message: 'Your streak freeze protected yesterday. Ready to get back into the groove today?',
      reason: 'A streak freeze saved your progress yesterday. Today is our fresh opportunity to reboot momentum!'
    };
  }

  if (yesterdayMissed && overallStreak === 0) {
    return {
      mood: 'Sad',
      message: 'Missed a day? No worries at all. The best part of habits is you can restart right now.',
      reason: 'I felt a bit down seeing yesterday missed, but I am right here cheering for your comeback today!'
    };
  }

  // 5. Day just started, habits are waiting to be done
  if (totalDueToday > 0) {
    if (overallStreak >= 3) {
      return {
        mood: 'Excited',
        message: `You are on a ${overallStreak}-day streak! Ready to tackle your ${totalDueToday} habit${totalDueToday > 1 ? 's' : ''} today?`,
        reason: `I am excited to help you keep your awesome ${overallStreak}-day streak going!`
      };
    }
    return {
      mood: 'Happy',
      message: `Good day! You have ${totalDueToday} habit${totalDueToday > 1 ? 's' : ''} on your schedule today. Let’s take it one step at a time.`,
      reason: 'I am happy and ready to accompany you through today’s checklist!'
    };
  }

  // 6. No habits due today (rest day or newly created)
  if (habits.length === 0) {
    return {
      mood: 'Happy',
      message: 'Welcome to HabitFlow! Tap the + button to plant your very first habit or big goal.',
      reason: 'I am delighted to meet you and excited to accompany you on your journey!'
    };
  }

  return {
    mood: 'Happy',
    message: 'Rest day! No habits are due today. Recharge your energy for tomorrow.',
    reason: 'I am content and resting today because nothing is scheduled on your calendar.'
  };
}
