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
        <div
          onClick={() => setShowMoodModal(true)}
          className="flex items-center gap-3.5 bg-white dark:bg-zinc-900 rounded-3xl p-4 box-3d-press relative"
          role="button"
          tabIndex={0}
          aria-label="Companion avatar and message, tap to inspect mood"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowMoodModal(true);
            }
          }}
        >
          {/* Avatar button with 3D tactile badge */}
          <div
            className="group relative shrink-0 p-1 rounded-2xl transition"
            title="Tap companion to inspect mood"
          >
            <AndroidifyAvatar
              mood={companion.mood}
              skinColor={profile.equippedAvatar.skinColor}
              hat={profile.equippedAvatar.hat}
              accessory={profile.equippedAvatar.accessory}
              outfit={profile.equippedAvatar.outfit}
              size="md"
            />
            {/* 3D Pulse badge showing current mood indicator */}
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs uppercase tracking-wider">
              {companion.mood}
            </span>
          </div>

          {/* Speech Bubble with 3D recessed card look */}
          <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-700/60 shadow-inner">
            {/* Speech bubble pointer notch */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-zinc-100 dark:border-r-zinc-700/60" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-5 border-t-transparent border-b-5 border-b-transparent border-r-7 border-r-zinc-50 dark:border-r-zinc-800/80" />

            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 leading-snug font-semibold">
              "{companion.message}"
            </p>

            <span className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              Why is companion feeling {companion.mood}? &rarr;
            </span>
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
