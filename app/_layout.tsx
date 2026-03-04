import "../global.css";
import { Stack } from "expo-router";
import { UserProvider } from "../context/UserContext";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Animated } from 'react-native';
import { LogBox } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { useEffect, useRef, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';

import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

// Keep the native splash visible until we're ready to show our animated one
SplashScreen.preventAutoHideAsync();

// Ignore specific logs if needed
LogBox.ignoreLogs(['RNOneSignal: OneSignal has already been initialized']);

const GIF_DURATION = 2500;
const FADE_DURATION = 400;

export default function Layout() {
    const [splashVisible, setSplashVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const [fontsLoaded] = useFonts({
        BebasNeue_400Regular,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            // Hide native splash immediately — our animated GIF takes over
            SplashScreen.hideAsync();

            // After GIF plays, fade it out
            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: FADE_DURATION,
                    useNativeDriver: true,
                }).start(() => setSplashVisible(false));
            }, GIF_DURATION);

            return () => clearTimeout(timer);
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <UserProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(homeowner)" options={{ headerShown: false }} />
                <Stack.Screen name="(tradie)" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
            </Stack>

            {/* Animated GIF splash — renders above entire app until dismissed */}
            {splashVisible && (
                <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
                    <Image
                        source={require('../assets/tradie_splash.gif')}
                        style={styles.splashImage}
                        contentFit="cover"
                        autoplay={true}
                    />
                </Animated.View>
            )}
        </UserProvider>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        zIndex: 9999,
    },
    splashImage: {
        width: '100%',
        height: '100%',
    },
});
