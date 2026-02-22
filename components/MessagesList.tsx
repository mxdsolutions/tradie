import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from './ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

export default function MessagesList() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchChats();

            // Subscribe to new messages to auto-refresh the chat list
            const channel = supabase
                .channel('messages-list-realtime')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages' },
                    () => {
                        // Re-fetch full chat list when any new message arrives
                        fetchChats();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchChats = async () => {
        try {
            // 1. Get my chat participations
            const { data: myParticipations, error: myPartError } = await supabase
                .from('chat_participants')
                .select('chat_id, last_read_at')
                .eq('user_id', user?.id);

            if (myPartError) throw myPartError;
            if (!myParticipations || myParticipations.length === 0) {
                setMessages([]);
                setLoading(false);
                return;
            }

            const chatsWithDetails = await Promise.all(myParticipations.map(async (participation) => {
                const chatId = participation.chat_id;

                // 2. Get partner (assuming 1-on-1 chats for now)
                const { data: partnerData } = await supabase
                    .from('chat_participants')
                    .select('users(full_name, avatar_url)')
                    .eq('chat_id', chatId)
                    .neq('user_id', user?.id)
                    .single();

                // @ts-ignore
                const partner = partnerData?.users;

                // 3. Get last message
                const { data: lastMsgData } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('chat_id', chatId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // 4. Count unread
                let unreadCount = 0;
                if (participation.last_read_at) {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('chat_id', chatId)
                        .gt('created_at', participation.last_read_at);
                    unreadCount = count || 0;
                } else {
                    const { count } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('chat_id', chatId);
                    unreadCount = count || 0;
                }

                return {
                    id: chatId,
                    sender: partner?.full_name || 'Unknown User',
                    avatar: partner?.avatar_url,
                    lastMessage: lastMsgData?.content || 'No messages yet',
                    time: lastMsgData ? new Date(lastMsgData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    timestamp: lastMsgData ? new Date(lastMsgData.created_at) : new Date(0), // for sorting
                    unread: unreadCount,
                    partnerId: partnerData // could use if needed
                };
            }));

            // Sort by latest message
            chatsWithDetails.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setMessages(chatsWithDetails);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChats();
    };

    const filteredMessages = messages.filter(msg =>
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header & Search */}
            <View
                className="bg-primary pb-6 px-6 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <Typography variant="h1" className="text-3xl mb-4 text-white">Messages</Typography>

                <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                    {/* @ts-ignore */}
                    <MagnifyingGlassIcon size={26} color="white" style={{ marginRight: 8 }} />
                    <TextInput
                        className="flex-1 text-base text-white font-medium"
                        placeholder="Search messages..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Message List */}
            <ScrollView
                className="flex-1 bg-white"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <>
                        {filteredMessages.map((msg) => (
                            <TouchableOpacity
                                key={msg.id}
                                className="flex-row items-center py-5 px-6 border-b border-slate-100 bg-white active:bg-slate-50"
                                onPress={() => router.push(`/chat/${msg.id}`)}
                            >
                                {/* Avatar */}
                                <View className={`w-14 h-14 rounded-full mr-4 items-center justify-center overflow-hidden ${msg.unread > 0 ? 'bg-primary' : 'bg-slate-100'}`}>
                                    <Typography variant="h3" className={`text-lg font-bold ${msg.unread > 0 ? 'text-white' : 'text-slate-500'}`}>
                                        {msg.sender.charAt(0)}
                                    </Typography>
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Typography
                                            variant="h3"
                                            className={`text-lg ${msg.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}
                                        >
                                            {msg.sender}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className={`${msg.unread > 0 ? 'text-accent font-bold' : 'text-slate-400'}`}
                                        >
                                            {msg.time}
                                        </Typography>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Typography
                                            variant="body"
                                            className={`flex-1 text-base line-clamp-1 mr-4 ${msg.unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}
                                            numberOfLines={1}
                                        >
                                            {msg.lastMessage}
                                        </Typography>
                                        {msg.unread > 0 && (
                                            <View className="w-5 h-5 bg-accent rounded-full items-center justify-center">
                                                <Typography variant="caption" className="text-white font-bold text-[10px]">
                                                    {msg.unread}
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {filteredMessages.length === 0 && (
                            <View className="items-center justify-center py-20 opacity-50">
                                {/* @ts-ignore */}
                                <MagnifyingGlassIcon size={48} color="#64748B" />
                                <Typography variant="h3" className="mt-4 text-center">No messages yet</Typography>
                                <Typography variant="body" className="text-center mt-1 text-slate-500">
                                    Start a conversation with a tradie to see it here.
                                </Typography>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
