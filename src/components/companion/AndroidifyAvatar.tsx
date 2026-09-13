import React from 'react';
import { motion } from 'motion/react';
import { CompanionMood } from '../../types';

interface AndroidifyAvatarProps {
  mood?: CompanionMood;
  skinColor?: string;
  hat?: string;
  accessory?: string;
  outfit?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isCelebrating?: boolean;
  className?: string;
}

export const AndroidifyAvatar: React.FC<AndroidifyAvatarProps> = ({
  mood = 'Happy',
  skinColor = '#10B981',
  hat,
  accessory,
  outfit,
  size = 'md',
  isCelebrating = false,
  className = '',
}) => {
  // Dimension scaling
  const dimension = {
    sm: 64,
    md: 96,
    lg: 130,
    xl: 180,
  }[size];

  // Eye shapes based on mood
  const renderEyes = () => {
    switch (mood) {
      case 'Happy':
        return (
          <>
            {/* Joyful semi-circle / arch eyes */}
            <path d="M 38 48 Q 44 42 50 48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 70 48 Q 76 42 82 48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'Concerned':
        return (
          <>
            {/* Slanted concerned eyebrows & round eyes */}
            <line x1="36" y1="42" x2="52" y2="45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="84" y1="42" x2="68" y2="45" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <circle cx="44" cy="50" r="4" fill="#FFFFFF" />
            <circle cx="76" cy="50" r="4" fill="#FFFFFF" />
          </>
        );
      case 'Sad':
        return (
          <>
            {/* Drooping sad eyes */}
            <path d="M 38 52 Q 44 46 50 52" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 70 52 Q 76 46 82 52" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Gentle blue tear dot */}
            <circle cx="36" cy="56" r="2.5" fill="#38BDF8" />
          </>
        );
      case 'Excited':
        return (
          <>
            {/* Sparkle / star eyes */}
            <circle cx="44" cy="47" r="5.5" fill="#FFFFFF" />
            <circle cx="46" cy="45" r="2.2" fill="#FEF08A" />
            <circle cx="76" cy="47" r="5.5" fill="#FFFFFF" />
            <circle cx="78" cy="45" r="2.2" fill="#FEF08A" />
            {/* Happy mouth */}
            <path d="M 54 55 Q 60 59 66 55" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'Proud':
        return (
          <>
            {/* Closed contented confident curves */}
            <path d="M 38 48 Q 44 41 50 48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 70 48 Q 76 41 82 48" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Confident smile */}
            <path d="M 52 56 Q 60 61 68 56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Cheerful blush */}
            <circle cx="33" cy="53" r="3.5" fill="#F43F5E" opacity="0.6" />
            <circle cx="87" cy="53" r="3.5" fill="#F43F5E" opacity="0.6" />
          </>
        );
      default:
        return (
          <>
            <circle cx="44" cy="48" r="4.5" fill="#FFFFFF" />
            <circle cx="76" cy="48" r="4.5" fill="#FFFFFF" />
          </>
        );
    }
  };

  // Antennas sway
  const antennaVariants = {
    idle: {
      rotate: [0, -3, 3, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    },
    celebrating: {
      rotate: [-15, 15, -15],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  const armVariants = {
    idle: {
      rotate: [0, 4, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    waving: {
      rotate: [-20, 20, -20],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
    },
    celebrating: {
      y: [-6, 2, -6],
      rotate: [-45, -30, -45],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-sm"
        animate={isCelebrating ? { y: [-5, 5, -5], scale: [1, 1.05, 1] } : { y: [0, -2, 0] }}
        transition={{ duration: isCelebrating ? 0.6 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Hero Cape (Outfit) */}
        {outfit === 'outfit_cape' && (
          <motion.path
            d="M 32 68 Q 20 95 24 112 Q 60 116 96 112 Q 100 95 88 68 Z"
            fill="#E11D48"
            animate={{ scaleY: [1, 1.04, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Antennas */}
        <motion.g variants={antennaVariants} animate={isCelebrating ? 'celebrating' : 'idle'}>
          {/* Left Antenna */}
          <line x1="42" y1="28" x2="34" y2="15" stroke={skinColor} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="33" cy="14" r="3.5" fill={skinColor} />
          {/* Right Antenna */}
          <line x1="78" y1="28" x2="86" y2="15" stroke={skinColor} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="87" cy="14" r="3.5" fill={skinColor} />
        </motion.g>

        {/* Head Dome */}
        <path
          d="M 28 58 A 32 32 0 0 1 92 58 Z"
          fill={skinColor}
        />
        <path
          d="M 28 58 A 32 32 0 0 1 92 58 Z"
          fill="url(#bodyGlow)"
        />

        {/* Eyes & Facial Expression */}
        {renderEyes()}

        {/* Smart Glasses (Accessory) */}
        {accessory === 'acc_glasses' && (
          <g>
            <rect x="34" y="42" width="20" height="13" rx="3" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            <rect x="66" y="42" width="20" height="13" rx="3" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            <line x1="54" y1="48" x2="66" y2="48" stroke="#1E293B" strokeWidth="2.5" />
          </g>
        )}

        {/* Torso */}
        <rect
          x="30"
          y="64"
          width="60"
          height="36"
          rx="6"
          fill={skinColor}
        />
        <rect
          x="30"
          y="64"
          width="60"
          height="36"
          rx="6"
          fill="url(#bodyGlow)"
        />

        {/* Dapper Bowtie (Accessory) */}
        {accessory === 'acc_bowtie' && (
          <g transform="translate(60, 65)">
            <polygon points="0,0 -12,-5 -12,5" fill="#DC2626" />
            <polygon points="0,0 12,-5 12,5" fill="#DC2626" />
            <circle cx="0" cy="0" r="3" fill="#991B1B" />
          </g>
        )}

        {/* Left Arm */}
        <motion.rect
          x="15"
          y="64"
          width="9"
          height="28"
          rx="4.5"
          fill={skinColor}
          variants={armVariants}
          animate={isCelebrating ? 'celebrating' : 'idle'}
          style={{ originX: '20px', originY: '68px' }}
        />

        {/* Right Arm */}
        <motion.rect
          x="96"
          y="64"
          width="9"
          height="28"
          rx="4.5"
          fill={skinColor}
          variants={armVariants}
          animate={isCelebrating ? 'celebrating' : (mood === 'Happy' || mood === 'Excited' ? 'waving' : 'idle')}
          style={{ originX: '100px', originY: '68px' }}
        />

        {/* Legs */}
        <rect x="42" y="100" width="10" height="14" rx="5" fill={skinColor} />
        <rect x="68" y="100" width="10" height="14" rx="5" fill={skinColor} />

        {/* Headphones (Hat/Headgear) */}
        {hat === 'hat_headphones' && (
          <g>
            <path d="M 24 50 A 36 36 0 0 1 96 50" stroke="#334155" strokeWidth="5" strokeLinecap="round" fill="none" />
            <rect x="20" y="44" width="8" height="18" rx="4" fill="#0EA5E9" stroke="#1E293B" strokeWidth="1.5" />
            <rect x="92" y="44" width="8" height="18" rx="4" fill="#0EA5E9" stroke="#1E293B" strokeWidth="1.5" />
          </g>
        )}

        {/* Party Cone Hat */}
        {hat === 'hat_party' && (
          <g>
            <polygon points="60,6 46,28 74,28" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="60" cy="5" r="3" fill="#EF4444" />
            <line x1="50" y1="20" x2="68" y2="16" stroke="#EF4444" strokeWidth="2" />
          </g>
        )}
      </motion.svg>
    </div>
  );
};
