export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpNeededForNext: number;
}

export interface LevelReward {
  level: number;
  name: string;
  type: 'skin' | 'hat' | 'accessory' | 'outfit' | 'freeze';
  itemId: string;
  description: string;
}

export const LEVEL_REWARDS: Record<number, LevelReward[]> = {
  2: [
    { level: 2, name: 'Cyber Teal Bot', type: 'skin', itemId: 'skin_teal', description: 'Vibrant futuristic teal finish' },
    { level: 2, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  3: [
    { level: 3, name: 'Smart Glasses', type: 'accessory', itemId: 'acc_glasses', description: 'Sleek dark frames for focused study' },
    { level: 3, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  4: [
    { level: 4, name: 'Sunset Orange Bot', type: 'skin', itemId: 'skin_orange', description: 'Warm sunset metallic coating' },
    { level: 4, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  5: [
    { level: 5, name: 'Audio Headphones', type: 'hat', itemId: 'hat_headphones', description: 'Over-ear neon audio cans' },
    { level: 5, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  6: [
    { level: 6, name: 'Neon Violet Bot', type: 'skin', itemId: 'skin_purple', description: 'Electric violet chassis glow' },
    { level: 6, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  7: [
    { level: 7, name: 'Hero Cape', type: 'outfit', itemId: 'outfit_cape', description: 'Flowing hero cape for high achievers' },
    { level: 7, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  8: [
    { level: 8, name: 'Golden Champion Bot', type: 'skin', itemId: 'skin_gold', description: 'Shining gold prestige exterior' },
    { level: 8, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  9: [
    { level: 9, name: 'Dapper Bowtie', type: 'accessory', itemId: 'acc_bowtie', description: 'Crimson gentleman bowtie' },
    { level: 9, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
  10: [
    { level: 10, name: 'Party Cone Hat', type: 'hat', itemId: 'hat_party', description: 'Festive confetti party cap' },
    { level: 10, name: 'Bonus Streak Freeze', type: 'freeze', itemId: 'freeze_plus_1', description: '+1 Streak Freeze added to balance' },
  ],
};

/**
 * Calculates cumulative XP required to reach a specific level.
 * Level 1: 0 XP
 * Level 2: 10 XP (+10)
 * Level 3: 25 XP (+15)
 * Level 4: 45 XP (+20)
 * Level 5: 70 XP (+25)
 * Level L: progressively harder
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 10 + (i - 1) * 5;
  }
  return total;
}

/**
 * Derives current level and progress info from total XP
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }

  const currentLevelXp = getXpRequiredForLevel(level);
  const nextLevelXp = getXpRequiredForLevel(level + 1);
  const diff = nextLevelXp - currentLevelXp;
  const progressInLevel = Math.max(0, totalXp - currentLevelXp);
  const percent = diff > 0 ? Math.min(100, Math.round((progressInLevel / diff) * 100)) : 100;

  return {
    level,
    currentXp: totalXp,
    xpForCurrentLevel: currentLevelXp,
    xpForNextLevel: nextLevelXp,
    progressPercent: percent,
    xpNeededForNext: Math.max(0, nextLevelXp - totalXp),
  };
}

/**
 * Calculates Goal Completion bonus XP based on number of sub-habits.
 * Capped reasonably between 10 and 50 XP.
 */
export function calculateGoalBonusXp(subHabitsCount: number): number {
  const calculated = Math.max(10, subHabitsCount * 8);
  return Math.min(50, calculated);
}
