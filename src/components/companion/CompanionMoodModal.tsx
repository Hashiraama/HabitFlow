import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, AlertCircle, Award } from 'lucide-react';
import { AndroidifyAvatar } from './AndroidifyAvatar';
import { CompanionMood } from '../../types';
import { useHabitFlow } from '../../context/HabitFlowContext';

interface CompanionMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mood: CompanionMood;
  reason: string;
}

export const CompanionMoodModal: React.FC<CompanionMoodModalProps> = ({
  isOpen,
  onClose,
  mood,
  reason,
}) => {
  const { profile } = useHabitFlow();

  if (!isOpen) return null;

  const moodDetails: Record<CompanionMood, { title: string; color: string; bg: string; icon: any }> = {
    Happy: {
      title: 'Happy & Motivated',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      icon: Heart,
    },
    Concerned: {
      title: 'A Little Concerned',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      icon: AlertCircle,
    },
    Sad: {
      title: 'Gently Encouraging',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
      icon: Heart,
    },
    Excited: {
      title: 'Super Excited!',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      icon: Sparkles,
    },
    Proud: {
      title: 'Beaming with Pride',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      icon: Award,
    },
  };

  const current = moodDetails[mood] || moodDetails.Happy;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 overflow-hidden"
          id="companion-mood-dialog"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative mb-3">
              <AndroidifyAvatar
                mood={mood}
                skinColor={profile.equippedAvatar.skinColor}
                hat={profile.equippedAvatar.hat}
                accessory={profile.equippedAvatar.accessory}
                outfit={profile.equippedAvatar.outfit}
                size="lg"
              />
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.color} mb-3`}>
              <Icon size={14} />
              <span>Current Mood: {mood}</span>
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {current.title}
            </h3>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-left w-full mt-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs uppercase tracking-wider mb-1">Why I feel this way:</span>
              {reason}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 px-4 rounded-xl font-medium text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-98"
            >
              Got it, friend!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
