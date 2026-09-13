import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AndroidifyAvatar } from './AndroidifyAvatar';
import { CompanionMoodModal } from './CompanionMoodModal';
import { useHabitFlow } from '../../context/HabitFlowContext';

export const CompanionBubble: React.FC = () => {
  const { companion, profile } = useHabitFlow();
  const [showMoodModal, setShowMoodModal] = useState(false);

  return (
    <>
      <div className="w-full mt-4 px-1 select-none" id="companion-section">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs relative">
          {/* Avatar button with tap prompt */}
          <button
            onClick={() => setShowMoodModal(true)}
            className="group relative shrink-0 p-1 rounded-2xl transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Tap companion to inspect mood"
            aria-label="Companion avatar, tap for mood details"
          >
            <AndroidifyAvatar
              mood={companion.mood}
              skinColor={profile.equippedAvatar.skinColor}
              hat={profile.equippedAvatar.hat}
              accessory={profile.equippedAvatar.accessory}
              outfit={profile.equippedAvatar.outfit}
              size="md"
            />
            {/* Subtle pulse badge showing current mood indicator */}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
              {companion.mood}
            </span>
          </button>

          {/* Speech Bubble */}
          <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 border border-zinc-100 dark:border-zinc-700/60">
            {/* Speech bubble pointer notch */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-zinc-100 dark:border-r-zinc-700/60" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-5 border-t-transparent border-b-5 border-b-transparent border-r-7 border-r-zinc-50 dark:border-r-zinc-800/70" />

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-snug font-medium">
              "{companion.message}"
            </p>

            <button
              onClick={() => setShowMoodModal(true)}
              className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Why is companion feeling {companion.mood}? &rarr;
            </button>
          </div>
        </div>
      </div>

      <CompanionMoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        mood={companion.mood}
        reason={companion.reason}
      />
    </>
  );
};
