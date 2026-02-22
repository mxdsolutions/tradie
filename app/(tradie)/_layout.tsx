import { Stack, useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { Typography } from '../../components/ui/Typography';
import { StatusBar } from 'expo-status-bar';
import { ClockIcon, ArrowLeftOnRectangleIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TradieLayout() {
    const { user, signOut } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const checkApproval = async () => {
            try {
                const { data, error } = await supabase
                    .from('tradie_profiles')
                    .select('is_approved')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching approval status:', error);
                    setIsApproved(false);
                } else {
                    setIsApproved(data?.is_approved ?? false);
                }
            } catch (err) {
                console.error('Unexpected error checking approval:', err);
                setIsApproved(false);
            } finally {
                setLoading(false);
            }
        };

        checkApproval();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/sign-in'); // Ensure redirect to auth view
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (isApproved === false) {
        return (
            <View className="flex-1 bg-background">
                <StatusBar style="light" />
                <View
                    className="bg-primary pb-8 px-6 border-b border-white/10 shadow-medium flex-row justify-between items-center"
                    style={{ paddingTop: insets.top + 12 }}
                >
                    <Typography variant="h1" className="text-2xl text-white">Pending Approval</Typography>
                    <TouchableOpacity onPress={handleSignOut} className="p-2 h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        {/* @ts-ignore */}
                        <ArrowLeftOnRectangleIcon size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-10" contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-soft items-center">
                        <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-6">
                            {/* @ts-ignore */}
                            <ClockIcon size={40} color="#F97316" />
                        </View>
                        <Typography variant="h2" className="text-center mb-4 text-2xl">We're reviewing your profile</Typography>
                        <Typography variant="body" className="text-center text-text-secondary leading-6 mb-8 text-base">
                            Thanks for joining ClearBuild! To ensure high quality for our homeowners, all new tradies go through a quick approval process.
                        </Typography>

                        <View className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <Typography variant="h3" className="text-base mb-3 font-bold">Next Steps:</Typography>
                            <Typography variant="body" className="text-sm text-slate-700 mb-3 font-medium flex-row">•  We'll verify your license details</Typography>
                            <Typography variant="body" className="text-sm text-slate-700 mb-3 font-medium flex-row">•  Our team may reach out for a quick chat</Typography>
                            <Typography variant="body" className="text-sm text-slate-700 font-medium flex-row">•  You'll get a notification once approved!</Typography>
                        </View>

                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="mt-10 px-6 py-3 border border-slate-200 rounded-full flex-row items-center"
                        >
                            {/* @ts-ignore */}
                            <ArrowLeftOnRectangleIcon size={20} color="#64748B" style={{ marginRight: 8 }} />
                            <Typography variant="body" className="font-bold text-slate-600">Sign Out</Typography>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="create-job" options={{ presentation: 'card' }} />
            <Stack.Screen name="transactions" options={{ presentation: 'card' }} />
            <Stack.Screen name="transaction/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="licences" />
        </Stack>
    );
}