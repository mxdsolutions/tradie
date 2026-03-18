import { View, ImageBackground, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@tradie/shared-ui';
import { Button } from '@tradie/shared-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@tradie/core';
import { useEffect, useRef } from 'react';

export default function LandingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useUser();

    // Animation refs
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(-20)).current;
    const bottomOpacity = useRef(new Animated.Value(0)).current;
    const bottomTranslateY = useRef(new Animated.Value(20)).current;

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Header animation
        Animated.parallel([
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 1000,
                delay: 500,
                useNativeDriver: true,
            }),
            Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 1000,
                delay: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Bottom content animation
        Animated.parallel([
            Animated.timing(bottomOpacity, {
                toValue: 1,
                duration: 1000,
                delay: 800,
                useNativeDriver: true,
            }),
            Animated.timing(bottomTranslateY, {
                toValue: 0,
                duration: 1000,
                delay: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <ImageBackground
                source={require('../assets/brick_bg.jpg')}
                className="flex-1"
                resizeMode="cover"
            >
                <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: insets.top, paddingBottom: insets.bottom + 20, justifyContent: 'space-between' }}>
                    {/* Header */}
                    <View className="items-center mt-12">
                        <Animated.View
                            style={{
                                opacity: headerOpacity,
                                transform: [{ translateY: headerTranslateY }],
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('../assets/logo_icon.png')}
                                style={{ width: 80, height: 80, marginBottom: 24 }}
                                contentFit="contain"
                            />
                            <Typography variant="h1" className="text-white text-5xl font-bebas tracking-widest uppercase">TRADIE</Typography>
                        </Animated.View>
                    </View>

                    {/* Bottom Content */}
                    <View className="w-full mb-8">
                        <Animated.View
                            style={{
                                opacity: bottomOpacity,
                                transform: [{ translateY: bottomTranslateY }],
                                width: '100%',
                            }}
                        >
                            <View className="mb-8 items-center">
                                <Typography variant="h1" className="text-white text-[52px] font-bebas uppercase leading-none tracking-tight shadow-sm text-center">
                                    BUILD WITH
                                </Typography>
                                <View className="bg-accent px-6 pt-3 pb-1 mt-1 -rotate-2">
                                    <Typography variant="h1" className="text-[#0F172A] text-[52px] font-bebas uppercase leading-none tracking-widest text-center">
                                        CONFIDENCE
                                    </Typography>
                                </View>
                            </View>

                            <View className="space-y-4">
                                <Button
                                    label="Get Started"
                                    onPress={() => router.push('/(auth)/onboarding')}
                                    size="lg"
                                    className="w-full bg-white active:bg-slate-100 shadow-xl shadow-black/20"
                                    textClassName="text-slate-900 font-extrabold text-lg"
                                />
                                <Button
                                    label="I already have an account"
                                    variant="ghost"
                                    onPress={() => router.push('/(auth)/sign-in')}
                                    className="w-full"
                                    textClassName="text-white font-semibold text-base opacity-90 tracking-wide"
                                />
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}
