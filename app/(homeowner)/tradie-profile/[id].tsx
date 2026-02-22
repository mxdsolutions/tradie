import { View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeftIcon,
    ShareIcon,
    MapPinIcon,
    CheckBadgeIcon,
    StarIcon as StarIconOutline,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from 'react-native-heroicons/outline';
import { StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { Typography } from '../../../components/ui/Typography';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TradieProfileScreen() {
    const { id } = useLocalSearchParams(); // id is user_id of the tradie
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [tradie, setTradie] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [licenses, setLicenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTradieData();
        }
    }, [id]);

    const fetchTradieData = async () => {
        try {
            // Fetch Tradie Profile + User Info
            const { data: tradieData, error: tradieError } = await supabase
                .from('tradie_profiles')
                .select('*, users(full_name, avatar_url, phone_number)')
                .eq('user_id', id)
                .single();

            if (tradieError) throw tradieError;
            setTradie(tradieData);

            // Fetch Licenses
            const { data: licensesData, error: licensesError } = await supabase
                .from('tradie_licenses')
                .select('*')
                .eq('user_id', id);

            if (licensesError) {
                console.warn('Error fetching licenses:', licensesError);
            } else {
                setLicenses(licensesData || []);
            }

            // Fetch Reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*, reviewer:reviewer_id(full_name)')
                .eq('tradie_id', id)
                .order('created_at', { ascending: false });

            if (reviewsError) {
                console.warn('Error fetching reviews:', reviewsError);
            } else {
                setReviews(reviewsData || []);
            }

        } catch (error) {
            console.error('Error fetching tradie data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!tradie) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Typography variant="h2">Tradie not found</Typography>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Typography variant="body" className="text-primary">Go Back</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Custom Header with Image Background */}
            <View className="relative h-64 bg-slate-900">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    className="absolute inset-0 w-full h-full opacity-60"
                />
                <View
                    className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-6 z-10"
                    style={{ paddingTop: insets.top + 10 }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={20} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
                    >
                        {/* @ts-ignore */}
                        <ShareIcon size={20} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                {/* Profile Avatar Overlap */}
                <View className="absolute -bottom-10 left-6">
                    <View className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white items-center justify-center overflow-hidden">
                        {tradie.users?.avatar_url ? (
                            <Image
                                source={{ uri: tradie.users.avatar_url }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Typography variant="h1" className="text-3xl text-slate-400 font-bold">
                                {tradie.users?.full_name?.charAt(0) || '?'}
                            </Typography>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 pt-12" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Info */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-1 mr-4">
                            <Typography variant="h1" className="text-2xl mb-1">{tradie.users?.full_name}</Typography>
                            <Typography variant="body" className="text-slate-500 font-medium mb-2">{tradie.trade}</Typography>
                        </View>
                        <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
                            {/* @ts-ignore */}
                            <StarIconSolid size={14} color="#F59E0B" />
                            <Typography variant="caption" className="text-amber-700 font-bold text-xs ml-1">
                                {Number(tradie.rating).toFixed(1)} ({tradie.reviews_count || 0})
                            </Typography>
                        </View>
                    </View>

                    <View className="flex-row items-center space-x-4 mb-6">
                        <View className="flex-row items-center">
                            {/* @ts-ignore */}
                            <MapPinIcon size={16} color="#64748B" />
                            <Typography variant="caption" className="text-slate-600 ml-1">{tradie.location || 'Location varies'}</Typography>
                        </View>
                        <View className="flex-row items-center">
                            {/* @ts-ignore */}
                            <CheckBadgeIcon size={16} color="#059669" />
                            <Typography variant="caption" className="text-emerald-700 ml-1 font-medium">Verified & Insured</Typography>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mb-8">
                        <TouchableOpacity
                            onPress={() => router.push(`/chat/${tradie.user_id}`)} // Initiating chat with user_id, simpler logic needed in chat screen to handle user_id vs chat_id or find existing chat
                            className="flex-1 bg-primary py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg"
                        >
                            {/* @ts-ignore */}
                            <ChatBubbleLeftRightIcon size={20} color="white" style={{ marginRight: 8 }} />
                            <Typography variant="h3" className="text-white text-base font-bold">Message</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-white border border-slate-200 py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm">
                            {/* @ts-ignore */}
                            <PhoneIcon size={20} color="#0F172A" style={{ marginRight: 8 }} />
                            <Typography variant="h3" className="text-slate-900 text-base font-bold">Call</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* About Section */}
                    {tradie.about && (
                        <View className="mb-8">
                            <Typography variant="h3" className="mb-3">About</Typography>
                            <Typography variant="body" className="text-slate-600 leading-6">{tradie.about}</Typography>
                        </View>
                    )}

                    {/* Licenses Section */}
                    {licenses.length > 0 && (
                        <View className="mb-8">
                            <Typography variant="h3" className="mb-3">Licences & Certifications</Typography>
                            <View className="space-y-2">
                                {licenses.map((license, index) => (
                                    <View key={index} className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        {/* @ts-ignore */}
                                        <CheckBadgeIcon size={20} color="#64748B" />
                                        <Typography variant="body" className="text-slate-700 ml-3 font-medium">{license.license_number}</Typography>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Recent Work - TODO: Fetch from a gallery table if exists, currently removed mock data */}


                    {/* Reviews Preview */}
                    <View>
                        <View className="flex-row justify-between items-center mb-4">
                            <Typography variant="h3">Reviews</Typography>
                            <TouchableOpacity>
                                <Typography variant="caption" className="text-primary font-bold">View All</Typography>
                            </TouchableOpacity>
                        </View>

                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <View key={review.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
                                    <View className="flex-row justify-between mb-2">
                                        <Typography variant="h3" className="text-sm font-bold">{review.reviewer?.full_name}</Typography>
                                        <Typography variant="caption" className="text-slate-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </Typography>
                                    </View>
                                    <View className="flex-row items-center mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIconSolid key={i} size={12} color={i < review.rating ? "#F59E0B" : "#E2E8F0"} />
                                        ))}
                                    </View>
                                    <Typography variant="body" className="text-slate-600 text-sm leading-5">{review.text}</Typography>
                                </View>
                            ))
                        ) : (
                            <Typography variant="body" className="text-slate-500 italic">No reviews yet.</Typography>
                        )}
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
