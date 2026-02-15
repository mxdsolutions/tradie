import { View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(false);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View
                className="px-6 py-4 border-b border-white/10 flex-row items-center bg-primary"
                style={{ paddingTop: insets.top + 10 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-8 h-8 items-center justify-center bg-white/10 rounded-full mr-4"
                >
                    {/* @ts-ignore */}
                    <ArrowLeftIcon size={20} color="white" />
                </TouchableOpacity>
                <Typography variant="h2" className="text-xl font-bold text-white">Notifications</Typography>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                <View className="space-y-6">
                    <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                        <View className="flex-1 mr-4">
                            <Typography variant="body" className="font-semibold text-slate-900">Push Notifications</Typography>
                            <Typography variant="caption" className="text-slate-500">Receive real-time updates about your projects and messages.</Typography>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        />
                    </View>

                    <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                        <View className="flex-1 mr-4">
                            <Typography variant="body" className="font-semibold text-slate-900">Email Notifications</Typography>
                            <Typography variant="caption" className="text-slate-500">Receive daily summaries and important alerts via email.</Typography>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        />
                    </View>

                    <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                        <View className="flex-1 mr-4">
                            <Typography variant="body" className="font-semibold text-slate-900">Marketing & Tips</Typography>
                            <Typography variant="caption" className="text-slate-500">Receive helpful tips and promotional offers.</Typography>
                        </View>
                        <Switch
                            value={marketingEnabled}
                            onValueChange={setMarketingEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-6 border-t border-slate-100 bg-white" style={{ paddingBottom: 40 }}>
                <Button
                    label="Save Preferences"
                    onPress={() => router.back()}
                    size="lg"
                    className="w-full shadow-lg shadow-blue-100"
                />
            </View>
        </View>
    );
}
