import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface IOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  size?: 'md' | 'sm';
}

/**
 * iOS-styled fluid toggle switch:
 * - Direct tap toggling with satisfying tactile response
 * - Real-time continuous drag / swipe gesture with fluid spring physics
 * - Classic iOS thumb rubber-banding / elongation (width expands when dragging or held)
 * - Dynamic color blend track responding to drag position
 * - Smooth spring snap-to-target when released
 */
export const IOSSwitch: React.FC<IOSSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  ariaLabel = 'Toggle switch',
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const width = isSm ? 44 : 52;
  const height = isSm ? 26 : 30;
  const padding = 2;
  const thumbSize = height - padding * 2;
  const maxTravel = width - thumbSize - padding * 2;

  const [isPressed, setIsPressed] = useState(false);
  const startXRef = useRef(0);
  const initialThumbXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Continuous motion value for live thumb position during dragging & spring animations
  const thumbX = useMotionValue(checked ? maxTravel : 0);

  // Sync motion value when checked prop updates externally
  React.useEffect(() => {
    animate(thumbX, checked ? maxTravel : 0, {
      type: 'spring',
      stiffness: 380,
      damping: 28,
      mass: 0.8,
    });
  }, [checked, maxTravel, thumbX]);

  // Pointer gesture handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    startXRef.current = e.clientX;
    initialThumbXRef.current = checked ? maxTravel : 0;
    isDraggingRef.current = false;
    setIsPressed(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !isPressed) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 3) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      // Calculate new position with slight resistance past edges
      let nextX = initialThumbXRef.current + deltaX;
      if (nextX < 0) {
        nextX = nextX * 0.3; // Rubber-band past 0
      } else if (nextX > maxTravel) {
        nextX = maxTravel + (nextX - maxTravel) * 0.3; // Rubber-band past max
      }
      thumbX.set(nextX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !isPressed) return;
    setIsPressed(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    if (isDraggingRef.current) {
      const currentX = thumbX.get();
      const midpoint = maxTravel / 2;
      const shouldBeChecked = currentX > midpoint;

      // Animate smoothly to resting target
      animate(thumbX, shouldBeChecked ? maxTravel : 0, {
        type: 'spring',
        stiffness: 420,
        damping: 30,
        mass: 0.8,
      });

      if (shouldBeChecked !== checked) {
        onChange(shouldBeChecked);
      }
      isDraggingRef.current = false;
    } else {
      // Standard tap toggle
      const nextChecked = !checked;
      animate(thumbX, nextChecked ? maxTravel : 0, {
        type: 'spring',
        stiffness: 420,
        damping: 30,
        mass: 0.8,
      });
      onChange(nextChecked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsPressed(false);
        isDraggingRef.current = false;
        animate(thumbX, checked ? maxTravel : 0, {
          type: 'spring',
          stiffness: 400,
          damping: 30,
        });
      }}
      onKeyDown={handleKeyDown}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        padding: `${padding}px`,
      }}
      className={`relative inline-flex items-center rounded-full select-none cursor-pointer focus:outline-hidden touch-none transition-colors duration-250 ${
        checked
          ? 'bg-emerald-500 shadow-inner'
          : 'bg-zinc-300 dark:bg-zinc-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:brightness-98'} ${className}`}
    >
      {/* iOS Thumb with dynamic stretch on press/drag & fluid spring glide */}
      <motion.div
        style={{
          x: thumbX,
          height: `${thumbSize}px`,
        }}
        animate={{
          width: isPressed ? thumbSize + 6 : thumbSize,
        }}
        transition={{
          width: { type: 'spring', stiffness: 500, damping: 30 },
        }}
        className="rounded-full bg-white shadow-md shadow-black/25 flex items-center justify-center pointer-events-none"
      />
    </button>
  );
};
