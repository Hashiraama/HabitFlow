import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, Sparkles } from 'lucide-react';
import { AndroidifyAvatar } from '../companion/AndroidifyAvatar';
import { useHabitFlow } from '../../context/HabitFlowContext';
import { LEVEL_REWARDS } from '../../utils/xpProgression';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { profile, equipAvatarItem } = useHabitFlow();

  const [activeCategory, setActiveCategory] = useState<'skin' | 'hat' | 'accessory' | 'outfit'>('skin');

  if (!isOpen) return null;

  const skinOptions = [
    { id: '#10B981', name: 'Classic Emerald', requiredLevel: 1, unlocked: true },
    { id: '#0D9488', name: 'Cyber Teal', requiredLevel: 2, unlocked: profile.unlockedItems.includes('skin_teal') || profile.level >= 2 },
    { id: '#F97316', name: 'Sunset Orange', requiredLevel: 4, unlocked: profile.unlockedItems.includes('skin_orange') || profile.level >= 4 },
    { id: '#8B5CF6', name: 'Neon Violet', requiredLevel: 6, unlocked: profile.unlockedItems.includes('skin_purple') || profile.level >= 6 },
    { id: '#EAB308', name: 'Golden Champion', requiredLevel: 8, unlocked: profile.unlockedItems.includes('skin_gold') || profile.level >= 8 },
  ];

  const hatOptions = [
    { id: 'none', name: 'None', requiredLevel: 1, unlocked: true },
    { id: 'hat_headphones', name: 'Audio Headphones', requiredLevel: 5, unlocked: profile.unlockedItems.includes('hat_headphones') || profile.level >= 5 },
    { id: 'hat_party', name: 'Party Cone Hat', requiredLevel: 10, unlocked: profile.unlockedItems.includes('hat_party') || profile.level >= 10 },
  ];

  const accessoryOptions = [
    { id: 'none', name: 'None', requiredLevel: 1, unlocked: true },
    { id: 'acc_glasses', name: 'Smart Glasses', requiredLevel: 3, unlocked: profile.unlockedItems.includes('acc_glasses') || profile.level >= 3 },
    { id: 'acc_bowtie', name: 'Dapper Bowtie', requiredLevel: 9, unlocked: profile.unlockedItems.includes('acc_bowtie') || profile.level >= 9 },
  ];

  const outfitOptions = [
    { id: 'none', name: 'None', requiredLevel: 1, unlocked: true },
    { id: 'outfit_cape', name: 'Hero Cape', requiredLevel: 7, unlocked: profile.unlockedItems.includes('outfit_cape') || profile.level >= 7 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          id="avatar-customizer-dialog"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Avatar & Unlocked Items
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-90"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar ios-scroll p-4 space-y-4">
            {/* Live Avatar Preview */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
              <AndroidifyAvatar
                mood="Happy"
                skinColor={profile.equippedAvatar.skinColor}
                hat={profile.equippedAvatar.hat}
                accessory={profile.equippedAvatar.accessory}
                outfit={profile.equippedAvatar.outfit}
                size="lg"
              />
              <span className="mt-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Level {profile.level} Companion
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-semibold">
              {(['skin', 'hat', 'accessory', 'outfit'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition ${
                    activeCategory === cat
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div className="space-y-2">
              {activeCategory === 'skin' && (
                <div className="space-y-2">
                  {skinOptions.map(skin => {
                    const isEquipped = profile.equippedAvatar.skinColor === skin.id;
                    return (
                      <button
                        key={skin.id}
                        disabled={!skin.unlocked}
                        onClick={() => equipAvatarItem('skinColor', skin.id)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                          !skin.unlocked
                            ? 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30'
                            : isEquipped
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full shadow-2xs"
                            style={{ backgroundColor: skin.id }}
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {skin.name}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {skin.unlocked ? 'Unlocked' : `Unlocks at Level ${skin.requiredLevel}`}
                            </div>
                          </div>
                        </div>
                        {isEquipped ? (
                          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : !skin.unlocked ? (
                          <Lock size={14} className="text-zinc-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeCategory === 'hat' && (
                <div className="space-y-2">
                  {hatOptions.map(hat => {
                    const isEquipped = (profile.equippedAvatar.hat || 'none') === hat.id;
                    return (
                      <button
                        key={hat.id}
                        disabled={!hat.unlocked}
                        onClick={() => equipAvatarItem('hat', hat.id === 'none' ? undefined : hat.id)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                          !hat.unlocked
                            ? 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30'
                            : isEquipped
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {hat.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {hat.unlocked ? 'Unlocked' : `Unlocks at Level ${hat.requiredLevel}`}
                          </div>
                        </div>
                        {isEquipped ? (
                          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : !hat.unlocked ? (
                          <Lock size={14} className="text-zinc-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeCategory === 'accessory' && (
                <div className="space-y-2">
                  {accessoryOptions.map(acc => {
                    const isEquipped = (profile.equippedAvatar.accessory || 'none') === acc.id;
                    return (
                      <button
                        key={acc.id}
                        disabled={!acc.unlocked}
                        onClick={() => equipAvatarItem('accessory', acc.id === 'none' ? undefined : acc.id)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                          !acc.unlocked
                            ? 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30'
                            : isEquipped
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {acc.unlocked ? 'Unlocked' : `Unlocks at Level ${acc.requiredLevel}`}
                          </div>
                        </div>
                        {isEquipped ? (
                          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : !acc.unlocked ? (
                          <Lock size={14} className="text-zinc-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeCategory === 'outfit' && (
                <div className="space-y-2">
                  {outfitOptions.map(outfit => {
                    const isEquipped = (profile.equippedAvatar.outfit || 'none') === outfit.id;
                    return (
                      <button
                        key={outfit.id}
                        disabled={!outfit.unlocked}
                        onClick={() => equipAvatarItem('outfit', outfit.id === 'none' ? undefined : outfit.id)}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition ${
                          !outfit.unlocked
                            ? 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30'
                            : isEquipped
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-emerald-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {outfit.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {outfit.unlocked ? 'Unlocked' : `Unlocks at Level ${outfit.requiredLevel}`}
                          </div>
                        </div>
                        {isEquipped ? (
                          <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        ) : !outfit.unlocked ? (
                          <Lock size={14} className="text-zinc-400" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Done Customizing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
