import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, X, Clock, ExternalLink } from 'lucide-react';
import { useHabitFlow } from '../../context/HabitFlowContext';

interface NotificationSimulatorProps {
  onOpenHabitDetail?: (habitId: string) => void;
}

export const NotificationSimulator: React.FC<NotificationSimulatorProps> = ({ onOpenHabitDetail }) => {
  const { activeNotifications, respondToNotification, dismissNotification } = useHabitFlow();

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-3 left-0 right-0 z-40 px-3 flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {activeNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-sm pointer-events-auto bg-zinc-900/95 text-white dark:bg-zinc-800/95 rounded-2xl shadow-xl border border-zinc-700/80 p-3.5 mb-2 backdrop-blur-md"
            id={`notification-${notif.id}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                <Bell size={13} className="text-emerald-400" />
                <span className="text-zinc-200">HabitFlow Reminder</span>
                <span className="text-zinc-500">&bull;</span>
                <span>{notif.timeStr}</span>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-zinc-400 hover:text-zinc-200 p-0.5"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="text-sm font-semibold text-zinc-100 mb-1">
              Did you complete "{notif.habitName}"?
            </div>
            <p className="text-xs text-zinc-300 leading-snug mb-3">
              Keep your streak protected and log your daily progress.
            </p>

            {/* Quick Actions (Yes / No / Not yet) + Detail */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => respondToNotification(notif.id, 'yes')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Check size={14} />
                <span>Yes</span>
              </button>
              <button
                onClick={() => respondToNotification(notif.id, 'not_yet')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-medium text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Clock size={13} />
                <span>Not yet</span>
              </button>
              <button
                onClick={() => respondToNotification(notif.id, 'no')}
                className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition active:scale-95 cursor-pointer"
              >
                No
              </button>

              {onOpenHabitDetail && (
                <button
                  onClick={() => {
                    dismissNotification(notif.id);
                    onOpenHabitDetail(notif.habitId);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition"
                  title="Open habit detail"
                  aria-label="View habit details"
                >
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
