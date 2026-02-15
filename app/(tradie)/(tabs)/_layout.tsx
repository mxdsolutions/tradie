import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { BriefcaseIcon, WalletIcon, UserIcon, ChatBubbleLeftRightIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TradieTabsLayout() {
    const insets = useSafeAreaInsets();

    return (
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
        >
            <MaterialTopTabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        // @ts-ignore
                        <BriefcaseIcon size={24} color={color} />
                    ),
                }}
            />

            <MaterialTopTabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({ color }) => (
                        // @ts-ignore
                        <WalletIcon size={24} color={color} />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color }) => (
                        // @ts-ignore
                        <ChatBubbleLeftRightIcon size={24} color={color} />
                    ),
                }}
            />
            <MaterialTopTabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color }) => (
                        // @ts-ignore
                        <UserIcon size={24} color={color} />
                    ),
                }}
            />
        </MaterialTopTabs>
    );
}
