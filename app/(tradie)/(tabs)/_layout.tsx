import { View, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { safeHaptics } from '../../../lib/haptics';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext, useRouter } from 'expo-router';
import { BriefcaseIcon, WalletIcon, UserIcon, ChatBubbleLeftRightIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef } from 'react';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TradieTabsLayout() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    };

    // Tab bar height estimate: icons + labels + padding + bottom inset
    const tabBarHeight = 56 + insets.bottom;

    return (
        <View className="flex-1">
            <MaterialTopTabs
                tabBarPosition="bottom"
                screenOptions={{
                    tabBarActiveTintColor: '#0F172A',
                    tabBarInactiveTintColor: '#94a3b8',
                    tabBarIndicatorStyle: { backgroundColor: '#0F172A', height: 3, top: 0 },
                    tabBarStyle: {
                        paddingBottom: insets.bottom,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#f1f5f9',
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarShowLabel: true,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginTop: 4,
                    },
                    tabBarIconStyle: { height: 24, width: 24 },
                    swipeEnabled: true,
                }}
                screenListeners={{
                    tabPress: () => {
                        safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    },
                }}
            >
                <MaterialTopTabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }: { color: string }) => (
                            // @ts-ignore
                            <BriefcaseIcon size={24} color={color} />
                        ),
                    }}
                />

                <MaterialTopTabs.Screen
                    name="wallet"
                    options={{
                        title: 'Wallet',
                        tabBarIcon: ({ color }: { color: string }) => (
                            // @ts-ignore
                            <WalletIcon size={24} color={color} />
                        ),
                    }}
                />
                <MaterialTopTabs.Screen
                    name="messages"
                    options={{
                        title: 'Messages',
                        tabBarIcon: ({ color }: { color: string }) => (
                            // @ts-ignore
                            <ChatBubbleLeftRightIcon size={24} color={color} />
                        ),
                    }}
                />
                <MaterialTopTabs.Screen
                    name="account"
                    options={{
                        title: 'Account',
                        tabBarIcon: ({ color }: { color: string }) => (
                            // @ts-ignore
                            <UserIcon size={24} color={color} />
                        ),
                    }}
                />
            </MaterialTopTabs>

            {/* Floating Action Button */}
            <Animated.View
                style={{
                    position: 'absolute',
                    right: 20,
                    bottom: tabBarHeight + 16,
                    transform: [{ scale: scaleAnim }],
                }}
            >
                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/(tradie)/create-job');
                    }}
                    activeOpacity={1}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#2563EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#2563EB',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {/* @ts-ignore */}
                    <PlusIcon size={28} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
