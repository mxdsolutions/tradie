import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { ArrowLeftIcon, CheckBadgeIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

export default function LicencesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const LICENCES = [
        {
            id: '1',
            type: 'Plumbing Licence',
            number: 'PL-12345678',
            expiry: 'Expires: Dec 31, 2026',
            status: 'Active',
        },
        {
            id: '2',
            type: 'White Card',
            number: 'WC-87654321',
            expiry: 'Expires: Jun 15, 2025',
            status: 'Active',
        }
    ];

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
                <Typography variant="h2" className="text-xl font-bold text-white">My Licences</Typography>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                <View className="space-y-4">
                    {LICENCES.map((licence) => (
                        <View key={licence.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-row items-center">
                                    {/* @ts-ignore */}
                                    <CheckBadgeIcon size={20} color="#2563EB" className="mr-2" />
                                    <Typography variant="body" className="font-bold text-slate-900">{licence.type}</Typography>
                                </View>
                                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                    <Typography variant="caption" className="text-green-700 font-medium">{licence.status}</Typography>
                                </View>
                            </View>
                            <Typography variant="body" className="text-slate-600 mb-1">{licence.number}</Typography>
                            <Typography variant="caption" className="text-slate-400">{licence.expiry}</Typography>
                        </View>
                    ))}

                    <TouchableOpacity className="flex-row items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl mt-4 active:bg-slate-50">
                        {/* @ts-ignore */}
                        <PlusIcon size={20} color="#64748B" className="mr-2" />
                        <Typography variant="body" className="text-slate-500 font-medium">Add New Licence</Typography>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
