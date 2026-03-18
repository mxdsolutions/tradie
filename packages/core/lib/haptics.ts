import * as Haptics from 'expo-haptics';

/**
 * Safely trigger haptic feedback, catching any errors if the native module is unavailable.
 */
export const safeHaptics = {
    impactAsync: async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        try {
            await Haptics.impactAsync(style);
        } catch (error) {
            // Silently fail if haptics are not available (e.g., on simulator or missing native module)
            console.warn('Haptics not available:', error);
        }
    },
    notificationAsync: async (type: Haptics.NotificationFeedbackType) => {
        try {
            await Haptics.notificationAsync(type);
        } catch (error) {
            console.warn('Haptics notification not available:', error);
        }
    },
    selectionAsync: async () => {
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            console.warn('Haptics selection not available:', error);
        }
    }
};
