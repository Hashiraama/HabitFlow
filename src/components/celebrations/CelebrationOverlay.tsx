import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Shield, Gift, X } from 'lucide-react';
import { AndroidifyAvatar } from '../companion/AndroidifyAvatar';
import { useHabitFlow } from '../../context/HabitFlowContext';

export const CelebrationOverlay: React.FC = () => {
  const { activeCelebration, dismissCelebration, profile } = useHabitFlow();

  useEffect(() => {
    if (activeCelebration) {
      // Fire festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#0284C7', '#8B5CF6', '#F59E0B', '#EC4899'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [activeCelebration]);

  if (!activeCelebration) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center overflow-hidden"
          id="celebration-modal"
        >
          {/* Close button */}
          <button
            onClick={dismissCelebration}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Dismiss celebration"
          >
            <X size={20} />
          </button>

          {/* Avatar doing special celebration animation */}
          <div className="my-3 flex justify-center">
            <AndroidifyAvatar
              mood="Proud"
              skinColor={profile.equippedAvatar.skinColor}
              hat={profile.equippedAvatar.hat}
              accessory={profile.equippedAvatar.accessory}
              outfit={profile.equippedAvatar.outfit}
              size="lg"
              isCelebrating={true}
            />
          </div>

          {activeCelebration.type === 'level_up' ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
                <Sparkles size={14} />
                <span>Level Up Achieved!</span>
              </div>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Level {activeCelebration.level} Reached
              </h2>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 mb-4">
                Your discipline is paying off! You have unlocked higher prestige rewards.
              </p>

              {/* Unlocked rewards list */}
              {activeCelebration.rewards && activeCelebration.rewards.length > 0 && (
                <div className="space-y-2 mb-5 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block px-1">
                    Newly Unlocked:
                  </span>
                  {activeCelebration.rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        {reward.type === 'freeze' ? <Shield size={16} /> : <Gift size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {reward.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {reward.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
                <Award size={14} />
                <span>Goal Complete!</span>
              </div>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {activeCelebration.goalName}
              </h2>

              <div className="my-3 inline-block px-4 py-1.5 rounded-xl bg-emerald-500 text-white font-extrabold text-base shadow-sm">
                +{activeCelebration.goalBonusXp} XP Goal Bonus!
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                100% of the linked work has been conquered! This milestone counts toward today's overall streak.
              </p>
            </div>
          )}

          <button
            onClick={dismissCelebration}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 cursor-pointer"
          >
            Continue Journey
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
