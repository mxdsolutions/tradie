import { View, ScrollView, TouchableOpacity, Image, Modal, Switch, TextInput, Animated, Dimensions, PanResponder, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, MapPinIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { StarIcon as StarIconSolid } from 'react-native-heroicons/solid'; // For rating, usually solid
import { Card } from '../../../components/ui/Card';
import { useRouter } from 'expo-router';
import { Badge } from '../../../components/ui/Badge';
import { Typography } from '../../../components/ui/Typography';
import { Input } from '../../../components/ui/Input';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

const CATEGORIES = [
    { id: '1', name: 'Electrician', icon: 'Zap' },
    { id: '2', name: 'Plumber', icon: 'Droplet' },
    { id: '3', name: 'Carpenter', icon: 'Hammer' },
    { id: '4', name: 'Painter', icon: 'Paintbrush' },
];

export default function FindScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

    // Filter States
    const [distance, setDistance] = useState(10);
    const [minRating, setMinRating] = useState(4.0);
    const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
    const [availability, setAvailability] = useState('Any');

    const [tradies, setTradies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const openFilter = () => {
        setIsFilterVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                mass: 1,
                stiffness: 100,
            })
        ]).start();
    };

    const closeFilter = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsFilterVisible(false);
        });
    };

    useEffect(() => {
        fetchTradies();
    }, []);

    const fetchTradies = async () => {
        try {
            const { data, error } = await supabase
                .from('tradie_profiles')
                .select('*, users(full_name, location)');

            if (error) throw error;

            const formatted = data?.map(t => ({
                id: t.user_id,
                name: t.users?.full_name || 'Unknown',
                trade: t.trade || 'General',
                rating: t.rating || 5.0, // Default to 5 if no rating
                reviews: 0, // No reviews table yet
                location: t.users?.location || 'Nearby',
                available: t.is_available ? 'Available' : 'Busy',
                user_id: t.user_id
            })) || [];

            setTradies(formatted);
        } catch (error) {
            console.error('Error fetching tradies:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTradies();
    };

    const filteredTradies = tradies.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.trade.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTrade = selectedTrade ? t.trade === selectedTrade : true;
        // Mock distance/rating filtering for now as data isn't fully there
        return matchesSearch && matchesTrade;
    });

    const FilterOption = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full border mb-2 mr-2 ${selected ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
        >
            <Typography variant="caption" className={`font-medium ${selected ? 'text-white' : 'text-slate-600'}`}>{label}</Typography>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            {/* Header & Search */}
            <View
                className="bg-primary px-6 pb-6 pt-6 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top }}
            >
                <Typography variant="h1" className="mb-6 mt-2 text-3xl text-white">Find an Expert</Typography>

                <View className="flex-row items-center space-x-2 mb-2 gap-2">
                    <View className="flex-1 flex-row items-center bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                        {/* @ts-ignore */}
                        <MagnifyingGlassIcon size={26} color="white" style={{ marginRight: 12 }} />
                        <TextInput
                            placeholder="What do you need help with?"
                            className="flex-1 bg-transparent border-none p-0 text-base text-white font-medium"
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        className="border border-white/20 p-3.5 rounded-2xl active:bg-white/10 shadow-lg"
                        onPress={openFilter}
                    >
                        {/* @ts-ignore */}
                        <FunnelIcon size={26} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                }
            >
                <Typography variant="h3" className="mb-4">Recommended for you</Typography>

                {loading ? (
                    <View className="py-10">
                        <ActivityIndicator size="small" color="#2563EB" />
                    </View>
                ) : filteredTradies.length === 0 ? (
                    <View className="items-center justify-center py-10 opacity-50">
                        {/* @ts-ignore */}
                        <MagnifyingGlassIcon size={48} color="#64748B" />
                        <Typography variant="h3" className="mt-4 text-center">No tradies found</Typography>
                        <Typography variant="body" className="text-center mt-1">Try adjusting your filters or search terms.</Typography>
                    </View>
                ) : null}

                {filteredTradies.map((tradie) => (
                    <TouchableOpacity
                        key={tradie.id}
                        className="mb-4 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm active:scale-[0.99] transition-all flex-row max-h-[120px]"
                        onPress={() => router.push(`/(homeowner)/tradie-profile/${tradie.id}`)}
                    >
                        {/* Image Section - Updated to grey with initials */}
                        <View className="w-32 bg-slate-200 items-center justify-center">
                            <Typography variant="h2" className="text-slate-400 font-bold">
                                {tradie.name.split(' ').map(n => n[0]).join('')}
                            </Typography>
                        </View>

                        {/* Content Section */}
                        <View className="flex-1 p-4">
                            <View className="flex-row justify-between items-start mb-1">
                                <View className="flex-1 mr-2">
                                    <View className="flex-row items-center mb-0.5">
                                        <Typography variant="h3" className="text-base font-bold text-slate-900 mr-2 flex-1" numberOfLines={1}>{tradie.name}</Typography>
                                        {/* Rating */}
                                        <View className="flex-row items-center bg-amber-50 px-1.5 py-0.5 rounded-md self-start">
                                            {/* @ts-ignore */}
                                            <StarIconSolid size={10} color="#F59E0B" />
                                            <Typography variant="caption" className="text-amber-700 font-bold text-[10px] ml-1">{tradie.rating}</Typography>
                                        </View>
                                    </View>
                                    <Typography variant="body" className="text-slate-500 text-xs font-medium mb-2">{tradie.trade}</Typography>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2 mt-auto">
                                <View className="flex-row items-center bg-slate-50 px-2 py-1 rounded-md">
                                    {/* @ts-ignore */}
                                    <MapPinIcon size={12} color="#64748b" />
                                    <Typography variant="caption" className="text-slate-600 text-[10px] ml-1 font-medium line-clamp-1">{tradie.location}</Typography>
                                </View>
                                <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-md">
                                    <Typography variant="caption" className="text-emerald-700 text-[10px] font-bold">{tradie.available}</Typography>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isFilterVisible}
                onRequestClose={closeFilter}
            >
                <View className="flex-1 justify-end">
                    {/* Backdrop */}
                    <Animated.View
                        style={{ opacity: fadeAnim }}
                        className="absolute inset-0 bg-black/50"
                    >
                        <TouchableOpacity style={{ flex: 1 }} onPress={closeFilter} activeOpacity={1} />
                    </Animated.View>

                    {/* Sheet */}
                    <Animated.View
                        style={{ transform: [{ translateY: slideAnim }] }}
                        className="bg-white rounded-t-[32px] px-10 py-8 h-[80%] shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Typography variant="h2">Filter Results</Typography>
                            <TouchableOpacity onPress={closeFilter} className="p-2 bg-slate-50 rounded-full">
                                {/* @ts-ignore */}
                                <XMarkIcon size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Trade */}
                            <View className="mb-6">
                                <Typography variant="h3" className="mb-3 text-base">Trade</Typography>
                                <View className="flex-row flex-wrap">
                                    <FilterOption label="All" selected={selectedTrade === null} onPress={() => setSelectedTrade(null)} />
                                    {CATEGORIES.map(cat => (
                                        <FilterOption
                                            key={cat.id}
                                            label={cat.name}
                                            selected={selectedTrade === cat.name}
                                            onPress={() => setSelectedTrade(cat.name)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Distance */}
                            <View className="mb-6">
                                <View className="flex-row justify-between mb-3">
                                    <Typography variant="h3" className="text-base">Max Distance</Typography>
                                    <Typography variant="body" className="text-primary font-bold">{distance}km</Typography>
                                </View>
                                <View className="flex-row flex-wrap gap-2">
                                    {[5, 10, 25, 50].map((d) => (
                                        <FilterOption key={d} label={`${d}km`} selected={distance === d} onPress={() => setDistance(d)} />
                                    ))}
                                </View>
                            </View>

                            {/* Rating */}
                            <View className="mb-6">
                                <Typography variant="h3" className="mb-3 text-base">Minimum Rating</Typography>
                                <View className="flex-row flex-wrap gap-2">
                                    {[3.5, 4.0, 4.5, 4.8].map((r) => (
                                        <FilterOption key={r} label={`${r}+ Stars`} selected={minRating === r} onPress={() => setMinRating(r)} />
                                    ))}
                                </View>
                            </View>

                            {/* Availability */}
                            <View className="mb-8">
                                <Typography variant="h3" className="mb-3 text-base">Availability</Typography>
                                <View className="flex-row flex-wrap gap-2">
                                    {['Any', 'Today', 'Next 3 Days', 'This Week'].map((a) => (
                                        <FilterOption key={a} label={a} selected={availability === a} onPress={() => setAvailability(a)} />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View className="pt-4 border-t border-slate-100">
                            <TouchableOpacity
                                onPress={closeFilter}
                                className="bg-primary py-4 rounded-2xl items-center shadow-lg active:scale-[0.98]"
                            >
                                <Typography variant="h3" className="text-white text-base font-bold">Show Results</Typography>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
