import { View, ScrollView, TouchableOpacity, Image, RefreshControl, Animated, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUser } from '../../../context/UserContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Typography } from '../../../components/ui/Typography';
import { BellIcon, PlusIcon, MagnifyingGlassIcon, ArrowRightIcon, UserIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { WrenchScrewdriverIcon, DocumentTextIcon, CheckCircleIcon } from 'react-native-heroicons/outline';

const IconMap: Record<string, any> = {
    Hammer: WrenchScrewdriverIcon,
    FileText: DocumentTextIcon,
    CheckCircle: CheckCircleIcon,
};

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

    // Estimate threshold for "Active Projects" trigger
    const headerHeight = insets.top + (70 + 72);
    const stickyTrigger = headerHeight;

    // Auto-typing placeholder logic
    const [placeholderText, setPlaceholderText] = useState('');
    const phrases = ['renovate my bathroom', 'build a new deck', 'install a new kitchen'];

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
            {/* Sticky/Persistent Header */}
            <View
                className="bg-primary border-b border-white/10 z-50 px-6 pb-8 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Typography variant="label" className="text-white/60 mb-0.5">Welcome Back</Typography>
                        <Typography variant="h1" className="text-2xl text-white">
                            {user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Homeowner'}
                        </Typography>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="w-10 h-10 items-center justify-center"
                            onPress={() => router.push('/notifications')}
                        >
                            {/* @ts-ignore */}
                            <BellIcon size={26} color="white" />
                            {/* <View className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary" /> */}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Input Section */}
                <View className="flex-row items-center space-x-2 bg-white/10 rounded-2xl p-2 border border-white/20">
                    <View className="flex-1 px-3">
                        <Typography variant="caption" className="text-white/60 text-xs mb-0.5 font-medium">I want to...</Typography>
                        <TextInput
                            placeholder={placeholderText}
                            placeholderTextColor="rgba(255,255,255,0.75)"
                            className="text-white text-base font-semibold p-0 h-6 leading-6"
                            selectionColor="white"
                        />
                    </View>
                    <TouchableOpacity
                        className="bg-white px-5 py-3 rounded-xl flex-row items-center"
                        onPress={() => router.push('/(homeowner)/find')}
                    >
                        <Typography variant="body" className="text-primary font-bold mr-1">Go</Typography>
                        {/* @ts-ignore */}
                        <ArrowRightIcon size={16} color="#0F172A" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]} // index 1 is ActiveProjectsHeader
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                }
            >
                {/* 0. Tradies Near You */}
                <View className="pt-8 pb-2 bg-background">
                    <View className="px-6 mb-4">
                        <Typography variant="h3">Tradies Near You</Typography>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                        className="flex-grow-0"
                    >
                        {tradies.map((tradie) => (
                            <TouchableOpacity
                                key={tradie.id}
                                className="mr-4 w-40 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
                                onPress={() => router.push(`/(homeowner)/tradie-profile/${tradie.id}`)}
                            >
                                <View className="w-12 h-12 rounded-full bg-slate-200 mb-3 items-center justify-center">
                                    <Typography variant="h3" className="text-lg text-slate-400 font-bold">{tradie.name.charAt(0)}</Typography>
                                </View>
                                <Typography variant="body" className="font-semibold text-slate-900 mb-0.5 line-clamp-1" numberOfLines={1}>{tradie.name}</Typography>
                                <Typography variant="caption" className="text-slate-500 text-xs mb-2">{tradie.specialty}</Typography>

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center bg-amber-50 px-1.5 py-0.5 rounded-md">
                                        {/* @ts-ignore */}
                                        <StarIcon size={10} color="#F59E0B" style={{ marginRight: 2 }} />
                                        <Typography variant="caption" className="text-amber-700 font-bold text-[10px]">{tradie.rating}</Typography>
                                    </View>
                                    <Typography variant="caption" className="text-slate-400 text-[10px]">{tradie.distance}</Typography>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {tradies.length === 0 && !loading && (
                            <Typography variant="body" className="text-slate-500 italic">No tradies found nearby.</Typography>
                        )}
                    </ScrollView>
                </View>

                {/* 1. Active Projects Sticky Header */}
                <View className="px-6 py-4 bg-background z-20 flex-row justify-between items-center" style={{ marginTop: 0 }}>
                    <Typography variant="h3">Active Projects</Typography>
                    {projects.length > 0 && (
                        <TouchableOpacity onPress={() => router.push('/(homeowner)/projects')}>
                            <Typography variant="body" className="text-accent text-sm font-semibold">View All</Typography>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 2. Projects List */}
                <View className="px-6 pt-2 pb-24">
                    {loading ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : projects.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-100 items-center justify-center shadow-sm">
                            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                                {/* @ts-ignore */}
                                <WrenchScrewdriverIcon size={32} color="#2563EB" />
                            </View>
                            <Typography variant="h3" className="text-center mb-2">No projects yet</Typography>
                            <Typography variant="body" className="text-center text-slate-500 mb-6">Start your first renovation or build project today.</Typography>
                            <TouchableOpacity
                                className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
                                onPress={() => router.push('/(homeowner)/create-project')}
                            >
                                <PlusIcon size={20} color="white" />
                                <Typography variant="body" className="text-white font-bold ml-2">Create Project</Typography>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="space-y-2">
                            {projects.map((project) => (
                                <TouchableOpacity
                                    key={project.id}
                                    activeOpacity={0.9}
                                    onPress={() => router.push(`/(homeowner)/project/${project.id}`)}
                                >
                                    <Card
                                        variant="default"
                                        className="w-full p-5 border border-slate-100 bg-white shadow-sm rounded-3xl"
                                    >
                                        <View className="flex-row justify-between items-start mb-4">
                                            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                                                {/* @ts-ignore */}
                                                <WrenchScrewdriverIcon size={20} color="#2563EB" />
                                            </View>
                                            <Badge
                                                label={project.status || 'Planning'}
                                                variant={project.status === 'Completed' ? 'emerald' : project.status === 'In Progress' ? 'blue' : project.status === 'Open' ? 'success' : 'amber'}
                                                className="scale-90 origin-top-right"
                                            />
                                        </View>

                                        <Typography variant="h3" className="mb-1 text-lg">{project.title}</Typography>
                                        <Typography variant="caption" className="text-slate-500 mb-4">{project.type}</Typography>

                                        <View className="space-y-1">
                                            <View className="flex-row justify-between text-xs mb-1">
                                                <Typography variant="caption" className="text-slate-500 font-medium">{project.progress || 0}% Complete</Typography>
                                                {/* <Typography variant="caption" className="text-slate-500 font-medium">{project.date}</Typography> */}
                                            </View>
                                            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full bg-accent rounded-full"
                                                    style={{ width: `${project.progress || 0}%` }}
                                                />
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
}

