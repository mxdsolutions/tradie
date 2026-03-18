import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@tradie/shared-ui';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { safeHaptics } from '@tradie/core';

export default function CostGuidesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const costGuides = [
        { id: '1', title: 'How much does a new kitchen cost?', estimatedPrice: '$15k - $30k', image: require('../assets/service_carpenter_1772537605210.png') },
        { id: '2', title: 'Average cost of a bathroom renovation', estimatedPrice: '$10k - $20k', image: require('../assets/service_plumber_1772537578068.png') },
        { id: '3', title: 'What to budget for a new deck', estimatedPrice: '$5k - $15k', image: require('../assets/service_builder_177253791577.png') },
        { id: '4', title: 'House painting cost guide', estimatedPrice: '$3k - $8k', image: require('../assets/service_electrician_1772537565099.png') },
        { id: '5', title: 'Roof replacement costs', estimatedPrice: '$8k - $20k', image: require('../assets/service_builder_177253791577.png') },
        { id: '6', title: 'Landscaping & garden design', estimatedPrice: '$2k - $10k', image: require('../assets/service_carpenter_1772537605210.png') },
    ];

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Header */}
            <View
                className="bg-primary px-6 pb-6 pt-2 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-white/10"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="white" />
                    </TouchableOpacity>
                    <Typography variant="h1" className="text-3xl text-white text-center flex-1">Cost Guides</Typography>
                    <View className="w-10" />
                </View>
            </View>

            {/* Guides Grid */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row flex-wrap justify-between">
                    {costGuides.map((guide) => (
                        <TouchableOpacity
                            key={guide.id}
                            className="items-start mb-8 w-[48%]"
                            onPress={() => safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                        >
                            <Image
                                source={guide.image}
                                style={{ width: '100%', aspectRatio: 1, borderRadius: 24 }}
                                contentFit="cover"
                            />
                            <Typography variant="h3" className="mt-3 font-robot font-bold text-slate-800 text-lg tracking-tight" numberOfLines={2}>{guide.title}</Typography>
                            <Typography variant="body" className="text-slate-500 font-bold mt-1">{guide.estimatedPrice}</Typography>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
