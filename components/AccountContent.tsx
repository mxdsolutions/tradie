import { View, TouchableOpacity, Image, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '../context/UserContext';

import { ArrowLeftOnRectangleIcon, ArrowPathIcon, ChevronRightIcon, UserIcon, Cog6ToothIcon, QuestionMarkCircleIcon, BellIcon, CheckBadgeIcon } from 'react-native-heroicons/outline';
import { Typography } from './ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function AccountContent() {
    const { userMode, toggleUserMode, signOut, user } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch profile data logic or use context if available
    // For now we'll just use what we have or fetch if needed. 
    // Ideally UserContext should provide profile, but let's fetch to be safe/quick.

    // Actually, let's just use a simple fetch for now since we are in a component.
    // In a real app we might want this in the context.

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (data) setProfile(data);
        } catch (e) {
            console.error(e);
        }
    }, [user]); // Depend on user to refetch if user changes

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchProfile();
            }
        }, [user, fetchProfile]) // Add fetchProfile to dependencies as it's a useCallback'd function
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    };

    const handleSwitchMode = async () => {
        const newMode = userMode === 'homeowner' ? 'tradie' : 'homeowner';
        await toggleUserMode();
        router.replace(newMode === 'homeowner' ? '/(homeowner)' : '/(tradie)');
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    const MenuItem = ({ icon: Icon, label, color = "#0F172A", onPress, isDestructive = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center justify-between p-4 bg-white mb-[1px] active:bg-slate-50 ${isDestructive ? 'bg-red-50/50' : ''}`}
        >
            <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-slate-50'}`}>
                    {/* @ts-ignore */}
                    <Icon size={20} color={isDestructive ? "#EF4444" : "#64748B"} />
                </View>
                <Typography variant="body" className={`font-medium ${isDestructive ? 'text-red-600' : 'text-slate-900'}`}>{label}</Typography>
            </View>
            <ChevronRightIcon size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
            }
        >
            {/* Header */}
            <View
                className="items-center px-6 pb-12 bg-primary shadow-medium mb-8"
                style={{ paddingTop: insets.top + 20 }}
            >
                <View className="w-24 h-24 bg-white/10 rounded-full mb-4 border-4 border-white/20 shadow-soft items-center justify-center backdrop-blur-md overflow-hidden">
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                    ) : (
                        <Typography variant="h1" className="text-4xl text-white/50">
                            {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </Typography>
                    )}
                </View>
                <Typography variant="h2" className="text-2xl mb-1 text-white">
                    {profile?.full_name || 'Homeowner'}
                </Typography>
                <Typography variant="body" className="text-blue-200 font-medium">{userMode === 'homeowner' ? 'Homeowner Account' : 'Tradie Account'}</Typography>
            </View>

            {/* Mode Switcher */}
            <View className="px-6 mb-8">
                <View>
                    <TouchableOpacity
                        onPress={handleSwitchMode}
                        className="flex-row items-center justify-between bg-primary p-5 rounded-2xl active:bg-slate-800 shadow-medium"
                        activeOpacity={0.9}
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                                {/* @ts-ignore */}
                                <ArrowPathIcon size={20} color="white" />
                            </View>
                            <View>
                                <Typography variant="h3" className="text-white text-base mb-0.5">Switch Mode</Typography>
                                <Typography variant="caption" className="text-slate-400">
                                    Switch to {userMode === 'homeowner' ? 'Tradie' : 'Homeowner'} view
                                </Typography>
                            </View>
                        </View>
                        <ChevronRightIcon size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Menu */}
            <View className="px-6">
                <Typography variant="label" className="text-slate-400 mb-3 ml-2">Settings</Typography>
                <View className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                    {/* @ts-ignore */}
                    <MenuItem icon={UserIcon} label="Edit Profile" onPress={() => router.push('/edit-profile')} />
                    {/* @ts-ignore */}
                    <MenuItem icon={BellIcon} label="Notifications" onPress={() => router.push('/notification-settings')} />
                    {userMode === 'tradie' && (
                        /* @ts-ignore */
                        <MenuItem icon={CheckBadgeIcon} label="Licences" onPress={() => router.push('/(tradie)/licences')} />
                    )}
                </View>

                <Typography variant="label" className="text-slate-400 mb-3 ml-2 mt-6">Support</Typography>
                <View className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                    {/* @ts-ignore */}
                    <MenuItem icon={QuestionMarkCircleIcon} label="Help & Support" onPress={() => router.push('/help')} />
                    {/* @ts-ignore */}
                    <MenuItem icon={ArrowLeftOnRectangleIcon} label="Sign Out" onPress={handleSignOut} isDestructive />
                </View>
            </View>

            <View className="items-center mt-12 pb-8">
                <Typography variant="caption" className="text-slate-300">Version 1.0.0</Typography>
            </View>
        </ScrollView>
    );
}
