import { View, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@tradie/shared-ui';
import { ArrowLeftIcon, BellIcon, CheckCircleIcon, DocumentTextIcon, CurrencyDollarIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { supabase, useUser } from '@tradie/core';

const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'quote':
            return <DocumentTextIcon size={24} color="#2563EB" />;
        case 'payment':
            return <CurrencyDollarIcon size={24} color="#059669" />;
        case 'project':
            return <CheckCircleIcon size={24} color="#F59E0B" />;
        default:
            return <BellIcon size={24} color="#64748B" />;
    }
};

const IconBgColor = ({ type }: { type: string }) => {
    switch (type) {
        case 'quote':
            return 'bg-blue-50';
        case 'payment':
            return 'bg-emerald-50';
        case 'project':
            return 'bg-amber-50';
        default:
            return 'bg-slate-50';
    }
};

const AnimatedNotificationItem = ({ notification, index, onPress }: { notification: any; index: number; onPress: () => void }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Animated.View
                style={{
                    opacity,
                    transform: [{ translateY }],
                    flexDirection: 'row',
                    padding: 16,
                    marginBottom: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: notification.read ? '#f1f5f9' : '#bfdbfe',
                    backgroundColor: notification.read ? '#ffffff' : 'rgba(239, 246, 255, 0.5)',
                }}
            >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${IconBgColor({ type: notification.type })}`}>
                    {/* @ts-ignore */}
                    <NotificationIcon type={notification.type} />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                        <Typography variant="body" className={`text-base ${notification.read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                            {notification.title}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 text-xs mt-0.5">
                            {new Date(notification.created_at).toLocaleDateString()}
                        </Typography>
                    </View>
                    <Typography variant="body" className="text-slate-600 text-sm leading-5">
                        {notification.message}
                    </Typography>
                </View>
                {!notification.read && (
                    <View className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-2" />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setNotifications(data || []);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await supabase.from('notifications').update({ read: true }).eq('id', id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };


    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View
                className="bg-primary px-6 pb-6 border-b border-white/10 flex-row items-center z-10 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 w-10 h-10 items-center justify-center active:bg-white/20"
                >
                    {/* @ts-ignore */}
                    <ArrowLeftIcon size={26} color="white" />
                </TouchableOpacity>
                <Typography variant="h3" className="text-xl text-white">Notifications</Typography>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" className="mt-8" />
                ) : (
                    <>
                        {notifications.map((notification, index) => (
                            <AnimatedNotificationItem
                                key={notification.id}
                                notification={notification}
                                index={index}
                                onPress={() => !notification.read && markAsRead(notification.id)}
                            />
                        ))}

                        {notifications.length === 0 && (
                            <View className="items-center justify-center py-20">
                                <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4">
                                    {/* @ts-ignore */}
                                    <BellIcon size={32} color="#CBD5E1" />
                                </View>
                                <Typography variant="body" className="text-slate-500 font-medium">No new notifications</Typography>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
