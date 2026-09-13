/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HabitFlowProvider, useHabitFlow } from './context/HabitFlowContext';
import { AndroidFrame, ScreenTab } from './components/common/AndroidFrame';
import { HomeScreen } from './components/home/HomeScreen';
import { HabitsScreen } from './components/habits/HabitsScreen';
import { AccountScreen } from './components/account/AccountScreen';
import { CreateEditHabitModal } from './components/creation/CreateEditHabitModal';
import { CreateEditGoalModal } from './components/creation/CreateEditGoalModal';
import { HabitDetailModal } from './components/habits/HabitDetailModal';
import { DateDetailModal } from './components/home/DateDetailModal';
import { CelebrationOverlay } from './components/celebrations/CelebrationOverlay';
import { NotificationSimulator } from './components/notifications/NotificationSimulator';
import { Habit } from './types';

const HabitFlowAppContent: React.FC = () => {
  const { profile } = useHabitFlow();

  const [currentTab, setCurrentTab] = useState<ScreenTab>('home');
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Sync theme class on document element for dark mode
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  const handleOpenEditHabit = (habit: Habit) => {
    setSelectedHabitId(null);
    setHabitToEdit(habit);
    setIsCreateHabitOpen(true);
  };

  return (
    <AndroidFrame
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onOpenCreateHabit={() => {
        setHabitToEdit(null);
        setIsCreateHabitOpen(true);
      }}
      onOpenCreateGoal={() => setIsCreateGoalOpen(true)}
    >
      {/* Active Tab Screen */}
      {currentTab === 'home' && (
        <HomeScreen
          onOpenHabitDetail={(id) => setSelectedHabitId(id)}
          onOpenCreateModal={() => {
            setHabitToEdit(null);
            setIsCreateHabitOpen(true);
          }}
          onSelectDate={(dStr) => setSelectedDate(dStr)}
        />
      )}

      {currentTab === 'habits' && (
        <HabitsScreen
          onOpenCreateModal={() => {
            setHabitToEdit(null);
            setIsCreateHabitOpen(true);
          }}
          onEditHabit={handleOpenEditHabit}
        />
      )}

      {currentTab === 'account' && (
        <AccountScreen />
      )}

      {/* Creation / Edit Modals */}
      <CreateEditHabitModal
        isOpen={isCreateHabitOpen}
        onClose={() => {
          setIsCreateHabitOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      <CreateEditGoalModal
        isOpen={isCreateGoalOpen}
        onClose={() => setIsCreateGoalOpen(false)}
      />

      {/* Habit Detail Modal */}
      <HabitDetailModal
        habitId={selectedHabitId}
        onClose={() => setSelectedHabitId(null)}
        onEditHabit={handleOpenEditHabit}
      />

      {/* Calendar Day Detail Modal */}
      <DateDetailModal
        dateString={selectedDate}
        onClose={() => setSelectedDate(null)}
        onOpenHabitDetail={(id) => setSelectedHabitId(id)}
      />

      {/* Notification Simulator Banner */}
      <NotificationSimulator />

      {/* Level-Up & Goal Celebration Overlay */}
      <CelebrationOverlay />
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <HabitFlowProvider>
      <HabitFlowAppContent />
    </HabitFlowProvider>
  );
}

