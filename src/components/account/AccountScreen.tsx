import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Sparkles,
  BarChart2,
  Bell,
  Moon,
  Sun,
  Shield,
  HardDrive,
  Info,
  Archive,
  ChevronRight,
  CheckCircle2,
  Flame,
  Award,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { AndroidifyAvatar } from '../companion/AndroidifyAvatar';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { ArchivedItemsModal } from './ArchivedItemsModal';
import { DeviceInstallModal } from '../common/DeviceInstallModal';
import { triggerLightHaptic } from '../../utils/haptics';
import { IOSSwitch } from '../common/IOSSwitch';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { getLevelInfo } from '../../utils/xpProgression';

export const AccountScreen: React.FC = () => {
  const {
    profile,
    habits,
    goals,
    backupMeta,
    setTheme,
    toggleAutoFreeze,
    setNotificationsEnabled,
    calculateAllTimeStats,
  } = useHabitFlow();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const stats = calculateAllTimeStats();
  const levelInfo = getLevelInfo(profile.xp);

  const archivedHabitsCount = habits.filter(h => h.status === 'archived').length;
  const archivedGoalsCount = goals.filter(g => g.status === 'archived').length;

  return (
    <div className="flex flex-col flex-1 pb-28 select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
          Account & Settings
        </h2>
      </div>

      <div className="p-3 sm:p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Android Device & APK Download Card */}
        <div
          onClick={() => setShowInstallModal(true)}
          className="p-4 rounded-3xl bg-linear-to-r from-emerald-600 to-teal-700 text-white box-3d-press flex items-center justify-between cursor-pointer shadow-lg"
          role="button"
          tabIndex={0}
          aria-label="Install on Android or download APK"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowInstallModal(true);
            }
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-xs">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                Android Device Testing
              </div>
              <h3 className="text-sm font-black text-white leading-tight">
                Install on Android / APK
              </h3>
              <p className="text-[11px] text-emerald-100/90 mt-0.5">
                Scan QR code, direct WebAPK install & download options
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-emerald-200 shrink-0" />
        </div>

        {/* 1. Companion Avatar Banner & Customizer */}
        <div
          onClick={() => setShowAvatarModal(true)}
          className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d-press flex items-center justify-between cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Customize avatar and unlocked items"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowAvatarModal(true);
            }
          }}
        >
          <div className="flex items-center gap-3.5">
            <AndroidifyAvatar
              mood="Happy"
              skinColor={profile.equippedAvatar.skinColor}
              hat={profile.equippedAvatar.hat}
              accessory={profile.equippedAvatar.accessory}
              outfit={profile.equippedAvatar.outfit}
              size="md"
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Level {levelInfo.level} Companion
              </div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Avatar & Unlocked Items
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Tap to equip unlocked bot skins, hats, and outfits
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-400 shrink-0" />
        </div>

        {/* 2. All-Time Statistics (Detailed numbers & written summaries, NO charts/graphs) */}
        {/* Rule: "Statistics are detailed but use numbers and written summaries—no charts/graphs and no date-range picker. Show all-time statistics only." */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              All-Time Statistics
            </span>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Habits Completed</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {stats.totalHabitsCompleted}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Active Days Completed</span>
              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {stats.totalDaysCompleted}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Overall Completion Rate</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {stats.overallCompletionRate}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Best Overall Streak</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {stats.bestOverallStreak} days
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Total XP Earned</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                +{stats.totalXpEarned} XP
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press">
              <span className="text-zinc-400 text-[11px] font-bold block mb-0.5">Goals Completed</span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                {stats.goalsCompleted}
              </span>
            </div>
          </div>

          {stats.totalExtraTargetProgress > 0 && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 tile-3d-press flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Extra Target Progress Logged:</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">+{stats.totalExtraTargetProgress} units</span>
            </div>
          )}

          {/* Written Consistency Summary & Non-Ranked Habit Insights */}
          {/* Rule: "Include detailed all-time completion rate/progress/consistency information useful to the user, including most and least consistent habits where meaningful, but do not create a ranked habit leaderboard." */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 text-xs space-y-2">
            <div className="font-bold text-zinc-800 dark:text-zinc-200">
              Consistency Summary
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {stats.consistencySummary}
            </p>

            {stats.mostConsistentHabitName && (
              <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 dark:text-zinc-400">Strongest rhythm:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.mostConsistentHabitName}</span>
              </div>
            )}

            {stats.leastConsistentHabitName && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 dark:text-zinc-400">Needs gentle focus:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{stats.leastConsistentHabitName}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Streaks & Streak Freezes */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Streak Freezes
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 tile-3d-press border border-sky-200/60 dark:border-sky-800/60">
            <div>
              <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Available Freezes: {profile.freezeBalance}
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-300">
                Each level-up grants +1 streak freeze automatically.
              </p>
            </div>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {profile.freezeBalance}
            </span>
          </div>

          {/* Automatic freeze toggle */}
          {/* Rule: "Automatic freeze use is available, but users can toggle it on/off in settings. With automatic use on, apply a freeze automatically when needed. With it off, give the user 24 hours after a missed day to manually use one." */}
          <div className="flex items-center justify-between pt-1">
            <div className="pr-4">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Automatic Streak Protection
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {profile.autoFreeze
                  ? 'Automatically applies freeze when an active scheduled day has no completions.'
                  : 'Manual mode: Gives you 24 hours to review and apply a freeze.'}
              </div>
            </div>
            <IOSSwitch
              checked={profile.autoFreeze}
              onChange={toggleAutoFreeze}
              ariaLabel="Automatic Streak Protection"
            />
          </div>

          <p className="text-[10px] text-zinc-400 leading-normal pt-1">
            Zero-freeze grace rule: If your balance is zero, your streak is still protected for one missed day without awarding a freeze.
          </p>
        </div>

        {/* 4. Appearance (Light and Dark modes only, no "follow system") */}
        {/* Theme Mode Selector (Light, Dark, Pure OLED) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Appearance Theme
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Light, Dark, or Pitch Black OLED
            </div>
          </div>

          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
            <button
              onClick={() => {
                triggerLightHaptic();
                setTheme('light');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                profile.theme === 'light'
                  ? 'tile-3d-press bg-white text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Sun size={12} />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                triggerLightHaptic();
                setTheme('dark');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                profile.theme === 'dark'
                  ? 'tile-3d-press bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon size={12} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                triggerLightHaptic();
                setTheme('oled');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                profile.theme === 'oled'
                  ? 'tile-3d-press bg-black text-emerald-400 border border-emerald-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span>OLED</span>
            </button>
          </div>
        </div>

        {/* 5. Notifications & Reminders Info */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 pr-3">
              <Bell size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Daily Habit Reminders
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Follow-ups at +3h, +6h, and +12h (never past 23:59)
                </div>
              </div>
            </div>

            <IOSSwitch
              checked={profile.notificationsEnabled}
              onChange={(val) => setNotificationsEnabled(val)}
              ariaLabel="Daily Habit Reminders"
            />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 leading-snug">
            Each habit has its own editable reminder time. Responding "Yes" to any reminder completes the habit and cancels subsequent notifications for that day.
          </p>
        </div>

        {/* 6. Archived Items Entry */}
        <div
          onClick={() => setShowArchivedModal(true)}
          className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d-press flex items-center justify-between cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="View archived habits and goals"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowArchivedModal(true);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl tile-3d-press bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Archive size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Archived Habits & Goals
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {archivedHabitsCount} habits &bull; {archivedGoalsCount} goals archived
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-400" />
        </div>

        {/* 7. Data & Automatic Local Backup */}
        {/* Rule: "Create automatic local backups only. Do not create a manual export/import or recovery flow in V1. V1 does not promise recovery after uninstall or phone change. Make no cloud/reinstall recovery claim." */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d space-y-2">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Data & Local Storage
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            HabitFlow operates 100% locally and offline. All your habit records, goals, streaks, and companion customizations are securely stored directly on this device.
          </p>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 tile-3d-press text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Automatic Local Backup:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Active &bull; {backupMeta.status.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Snapshot:</span>
              <span>{backupMeta.lastBackupAt ? new Date(backupMeta.lastBackupAt).toLocaleTimeString() : 'Just now'}</span>
            </div>
            <div className="flex justify-between">
              <span>Saved Records:</span>
              <span>{backupMeta.recordsCount} entries</span>
            </div>
          </div>
        </div>

        {/* 8. About Section */}
        {/* Rule: "About contains only app version and a short description. No 'Reset all data' option in V1." */}
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 box-3d text-center space-y-1.5">
          <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            HabitFlow V1.0.0
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            A friendly companion to help you create good habits and goals, see your progress clearly, and stay motivated every single day.
          </p>
          <div className="text-[10px] text-zinc-400 pt-1">
            Package: <code className="text-zinc-500">com.example.habitflow</code>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeviceInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      <AvatarCustomizerModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />

      <ArchivedItemsModal
        isOpen={showArchivedModal}
        onClose={() => setShowArchivedModal(false)}
      />
    </div>
  );
};
