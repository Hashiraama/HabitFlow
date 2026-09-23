import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerLightHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // ignore
    }
  } else if ('vibrate' in navigator) {
    try {
      navigator.vibrate(10);
    } catch (e) {
      // ignore
    }
  }
};

export const triggerMediumHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // ignore
    }
  } else if ('vibrate' in navigator) {
    try {
      navigator.vibrate(25);
    } catch (e) {
      // ignore
    }
  }
};

export const triggerSuccessHaptic = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // ignore
    }
  } else if ('vibrate' in navigator) {
    try {
      navigator.vibrate([20, 50, 30]);
    } catch (e) {
      // ignore
    }
  }
};
