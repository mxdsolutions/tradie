import "../global.css";
import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { StatusBar } from "expo-status-bar";
import { Platform } from 'react-native';
import { LogBox } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';
import { useEffect } from "react";

// Ignore specific logs if needed
LogBox.ignoreLogs(['RNOneSignal: OneSignal has already been initialized']);

export default function Layout() {
    useEffect(() => {
        // OneSignal Initialization
        if (Platform.OS !== 'web') {
            const ONE_SIGNAL_APP_ID = "61b8b005-ac21-46b3-b3f7-e58774808651";

            OneSignal.initialize(ONE_SIGNAL_APP_ID);

            // Also, any interactions with OneSignal should happen here
            OneSignal.Notifications.requestPermission(true);

            // Get the User ID (Player ID)
            const id = OneSignal.User.getOnesignalId();
            console.log('OneSignal ID:', id);
        }
    }, []);

    return (
        <UserProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(homeowner)" options={{ headerShown: false }} />
                <Stack.Screen name="(tradie)" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
            </Stack>
        </UserProvider>
    );
}
