import { View, ScrollView, TouchableOpacity, RefreshControl, Animated, TextInput, ActivityIndicator, ImageBackground, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { safeHaptics } from '../../../lib/haptics';
import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUser } from '../../../context/UserContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Typography } from '../../../components/ui/Typography';
import { PlusIcon, MagnifyingGlassIcon, ArrowRightIcon, UserIcon, MapPinIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { ProjectCard } from '../../../components/ProjectCard';
import { WrenchScrewdriverIcon, DocumentTextIcon, CheckCircleIcon } from 'react-native-heroicons/outline';

const IconMap: Record<string, any> = {
    Hammer: WrenchScrewdriverIcon,
    FileText: DocumentTextIcon,
    CheckCircle: CheckCircleIcon,
};

const serviceTypes = [
    { id: 'elec', label: 'Electricians', image: require('../../../assets/service_electrician_1772537565099.png') },
    { id: 'plum', label: 'Plumbers', image: require('../../../assets/service_plumber_1772537578068.png') },
    { id: 'build', label: 'Builders', image: require('../../../assets/service_builder_177253791577.png') },
    { id: 'carp', label: 'Carpenters', image: require('../../../assets/service_carpenter_1772537605210.png') },
];

export default function HomeownerDashboard() {
    const { userMode, user } = useUser();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Data State
    const [projects, setProjects] = useState<any[]>([]);
    const [tradies, setTradies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const presetNeeds = [
        { id: '1', label: 'Plumbing' },
        { id: '2', label: 'Electrical' },
        { id: '3', label: 'Cleaning' },
        { id: '4', label: 'Carpentry' },
        { id: '5', label: 'Painting' },
        { id: '6', label: 'Gardening' },
    ];

    // ── Scroll Animation System ──
    // All animations are synchronized to the same scrollDistance for a unified feel.
    // Multi-keyframe interpolations avoid independent "snap" points.
    const scrollDistance = 120;

    // Header shell height — shrinks smoothly with an ease-out feel via 3 keyframes
    const headerHeight = scrollY.interpolate({
        inputRange: [0, scrollDistance * 0.5, scrollDistance],
        outputRange: [insets.top + 178, insets.top + 125, insets.top + 82],
        extrapolate: 'clamp',
    });

    // Logo row — fades out in the first 35% of scroll (quick but smooth)
    const fadeOpacity = scrollY.interpolate({
        inputRange: [0, scrollDistance * 0.35],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Search bar container moves up to fill the space vacated by the logo + label
    const searchSectionTranslateY = scrollY.interpolate({
        inputRange: [0, scrollDistance * 0.4, scrollDistance],
        outputRange: [0, -24, -54],
        extrapolate: 'clamp',
    });

    // "I want to…" label — fades out in the first 40%
    const labelOpacity = scrollY.interpolate({
        inputRange: [0, scrollDistance * 0.4],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Label container height collapses across the full scroll for a gradual close
    const labelHeight = scrollY.interpolate({
        inputRange: [0, scrollDistance * 0.6, scrollDistance],
        outputRange: [32, 12, 0],
        extrapolate: 'clamp',
    });

    // Inner header top padding shrinks to reclaim vertical space
    const headerInnerPaddingTop = scrollY.interpolate({
        inputRange: [0, scrollDistance],
        outputRange: [16, 6],
        extrapolate: 'clamp',
    });

    // Go button width stays constant (kept for future animation hooks)
    const goButtonWidth = scrollY.interpolate({
        inputRange: [0, scrollDistance],
        outputRange: [56, 56],
        extrapolate: 'clamp',
    });

    // Auto-typing placeholder logic
    const [placeholderText, setPlaceholderText] = useState('');
    const phrases = ['renovate my bathroom', 'build a new deck', 'install a new kitchen'];

    const costGuides = [
        { id: '1', title: 'How much does a new kitchen cost?', estimatedPrice: '$15k - $30k', image: require('../../../assets/service_carpenter_1772537605210.png') },
        { id: '2', title: 'Average cost of a bathroom renovation', estimatedPrice: '$10k - $20k', image: require('../../../assets/service_plumber_1772537578068.png') },
        { id: '3', title: 'What to budget for a new deck', estimatedPrice: '$5k - $15k', image: require('../../../assets/service_builder_177253791577.png') },
        { id: '4', title: 'House painting cost guide', estimatedPrice: '$3k - $8k', image: require('../../../assets/service_electrician_1772537565099.png') },
    ];

    useEffect(() => {
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let typingTimeout: NodeJS.Timeout;

        const type = () => {
            const currentPhrase = phrases[currentPhraseIndex];

            if (isDeleting) {
                setPlaceholderText(currentPhrase.substring(0, currentCharIndex - 1));
                currentCharIndex--;
            } else {
                setPlaceholderText(currentPhrase.substring(0, currentCharIndex + 1));
                currentCharIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 60;

            if (!isDeleting && currentCharIndex === currentPhrase.length) {
                typeSpeed = 1500; // Pause at end
                isDeleting = true;
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                typeSpeed = 300; // Pause before new word
            }

            typingTimeout = setTimeout(type, typeSpeed);
        };

        type();

        return () => clearTimeout(typingTimeout);
    }, []);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .eq('homeowner_id', user.id)
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;
            setProjects(projectsData || []);

            // Fetch Tradies (Random sample)
            const { data: tradiesData, error: tradiesError } = await supabase
                .from('tradie_profiles')
                .select('*, users(full_name)')
                .limit(5);

            if (tradiesError) throw tradiesError;

            // Transform tradie data to match UI needs
            const formattedTradies = tradiesData?.map(t => ({
                id: t.user_id,
                name: t.users?.full_name || 'Unknown Tradie',
                specialty: t.trade || 'General',
                rating: t.rating || 5.0,
                distance: '2.5km', // Mock distance for now as we don't have geo
                available: t.is_available
            })) || [];

            setTradies(formattedTradies);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false); // Ensure refreshing is turned off after data fetch
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
    };


    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Header Section */}
            <Animated.View
                className="z-50 shadow-medium bg-primary absolute top-0 left-0 right-0 overflow-hidden"
                style={{
                    paddingTop: insets.top,
                    height: headerHeight,
                }}
            >
                <View className="px-6 pt-4">
                    {/* Header Row (Logo centered) - Fades out */}
                    <Animated.View
                        className="flex-row justify-center items-center mb-6"
                        style={{ opacity: fadeOpacity }}
                    >
                        <View className="flex-row items-center">
                            <Image
                                source={require('../../../assets/logo_icon.png')}
                                style={{ width: 30, height: 30, marginRight: 8 }}
                                contentFit="contain"
                            />
                            <Typography variant="h1" className="text-3xl text-white font-bebas tracking-wider uppercase">TRADIE</Typography>
                        </View>
                    </Animated.View>

                    {/* Search & Action Section - Moves Up */}
                    <Animated.View
                        className="z-10"
                        style={{
                            transform: [{ translateY: searchSectionTranslateY }],
                        }}
                    >
                        <Animated.View style={{ height: labelHeight, opacity: labelOpacity, overflow: 'hidden' }}>
                            <Typography variant="body" className="font-roboto-bold text-[22px] text-white/90 ml-1">I want to...</Typography>
                        </Animated.View>

                        <View className="flex-row items-center mb-4">
                            {/* Search Input Container */}
                            <View
                                className="bg-white/10 rounded-2xl border border-white/20 h-16 px-5 justify-center flex-1"
                            >
                                <TextInput
                                    placeholder={placeholderText}
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    className="text-white text-xl font-roboto font-semibold p-0 h-10"
                                    selectionColor="white"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <View style={{ width: 10 }} />

                            {/* Go Button - Magnifying Glass */}
                            <Animated.View
                                style={{
                                    width: goButtonWidth,
                                }}
                            >
                                <TouchableOpacity
                                    className="bg-accent h-16 rounded-2xl items-center justify-center shadow-lg px-4"
                                    onPress={() => {
                                        safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        router.push('/(homeowner)/find');
                                    }}
                                >
                                    {/* @ts-ignore */}
                                    <MagnifyingGlassIcon size={28} color="white" strokeWidth={3} />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </Animated.View>
                </View>
            </Animated.View>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 178, paddingBottom: 100 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false } // Required for layout measurements in JS, but doesn't cause jank if we keep layout static!
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                }
            >
                {/* Welcome Message Removed */}
                <View className="pt-6" />

                {/* 0. Trade Services */}
                <View className="pb-8 bg-background">
                    <View className="px-6 mb-6 flex-row justify-between items-center">
                        <Typography variant="h2" className="text-3xl">Find a local</Typography>
                        <TouchableOpacity
                            onPress={() => router.push('/(homeowner)/find')}
                            className="flex-row items-center py-1.5 px-3 bg-slate-50 rounded-full"
                        >
                            <Typography variant="body" className="font-roboto-bold text-accent text-lg mr-1">View All</Typography>
                            {/* @ts-ignore */}
                            <ChevronRightIcon size={20} color="#ff751f" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                        className="flex-grow-0"
                    >
                        {serviceTypes.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                className="items-start"
                                onPress={() => {
                                    safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSearchQuery(service.label);
                                }}
                            >
                                <Image
                                    source={service.image}
                                    style={{ width: 140, height: 140, borderRadius: 24 }}
                                    contentFit="cover"
                                />
                                <Typography variant="h3" className="mt-3 font-robot font-bold text-slate-800 text-xl tracking-tight">{service.label}</Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 1. Cost Guides */}
                <View className="pb-24 bg-background">
                    <View className="px-6 mb-6 flex-row justify-between items-center">
                        <Typography variant="h2" className="text-3xl">Cost Guides</Typography>
                        <TouchableOpacity
                            onPress={() => {
                                safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/(homeowner)/cost-guides');
                            }}
                            className="flex-row items-center py-1.5 px-3 bg-slate-50 rounded-full"
                        >
                            <Typography variant="body" className="font-roboto-bold text-accent text-lg mr-1">View All</Typography>
                            {/* @ts-ignore */}
                            <ChevronRightIcon size={20} color="#ff751f" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                        className="flex-grow-0"
                    >
                        {costGuides.map((guide) => (
                            <TouchableOpacity
                                key={guide.id}
                                className="items-start"
                                onPress={() => safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            >
                                <Image
                                    source={guide.image}
                                    style={{ width: 160, height: 160, borderRadius: 24 }}
                                    contentFit="cover"
                                />
                                <Typography variant="h3" className="mt-3 font-robot font-bold text-slate-800 text-lg tracking-tight w-40" numberOfLines={2}>{guide.title}</Typography>
                                <Typography variant="body" className="text-slate-500 font-bold mt-1">{guide.estimatedPrice}</Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Animated.ScrollView>
        </View>
    );
}


