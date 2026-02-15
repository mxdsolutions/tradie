import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { ArrowLeftIcon, PaperAirplaneIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

export default function ChatScreen() {
    const { id } = useLocalSearchParams(); // chat_id
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [recipient, setRecipient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (user && id) {
            fetchChatData();

            // Subscribe to new messages
            const channel = supabase
                .channel(`chat:${id}`)
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${id}` },
                    (payload) => {
                        setMessages(prev => [...prev, payload.new]);
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, id]);

    const fetchChatData = async () => {
        try {
            // 1. Get recipient (the other participant)
            const { data: participants, error: participantError } = await supabase
                .from('chat_participants')
                .select('users(id, full_name, avatar_url, role)')
                .eq('chat_id', id)
                .neq('user_id', user?.id)
                .single();

            if (participantError) throw participantError;
            setRecipient(participants?.users);

            // 2. Get messages
            const { data: msgs, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', id)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;
            setMessages(msgs || []);

        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || !user) return;

        const content = message.trim();
        setMessage('');

        try {
            const { error } = await supabase.from('messages').insert({
                chat_id: id,
                sender_id: user.id,
                content: content,
                type: 'text'
            });

            if (error) throw error;
            // Optimistic update handled by subscription or we can add manually if sub is slow

        } catch (error) {
            console.error('Error sending message:', error);
            // Verify if we should restore the message text
        }
    };

    const senderInitials = recipient?.full_name
        ? recipient.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
        : '??';

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View
                className="bg-primary px-6 pb-4 border-b border-white/10 flex-row items-center shadow-sm z-10"
                style={{ paddingTop: insets.top + 12 }}
            >
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    {/* @ts-ignore */}
                    <ArrowLeftIcon size={24} color="white" />
                </TouchableOpacity>

                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 border border-white/10 overflow-hidden">
                        {recipient?.avatar_url ? (
                            <Image
                                source={{ uri: recipient.avatar_url }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Typography variant="h3" className="text-white font-bold text-sm">
                                {senderInitials}
                            </Typography>
                        )}
                    </View>
                    <View>
                        <Typography variant="h3" className="text-lg text-white">{recipient?.full_name || 'Chat'}</Typography>
                        <Typography variant="caption" className="text-white/70">
                            {loading ? 'Connecting...' : 'Online'}
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Chat Area */}
            <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-4 py-6"
                contentContainerStyle={{ paddingBottom: 20 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" className="mt-8" />
                ) : messages.length === 0 ? (
                    <Typography variant="caption" className="text-center text-slate-400 mt-8">No messages yet. Say hi!</Typography>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <View
                                key={msg.id}
                                className={`self-${isMe ? 'end' : 'start'} ${isMe ? 'bg-primary' : 'bg-white border border-slate-100'} p-4 rounded-2xl ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'} mb-3 max-w-[80%] shadow-sm`}
                            >
                                <Typography variant="body" className={isMe ? 'text-white' : 'text-slate-800'}>
                                    {msg.content}
                                </Typography>
                                <Typography variant="caption" className={`${isMe ? 'text-blue-200' : 'text-slate-400'} mt-1 text-xs ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View
                    className="bg-white px-4 py-3 border-t border-slate-50 flex-row items-center"
                    style={{ paddingBottom: insets.bottom + 10 }}
                >
                    <TextInput
                        className="flex-1 bg-slate-50 rounded-full px-5 py-3 text-base text-slate-900 border border-slate-100 mr-3 h-12"
                        placeholder="Type a message..."
                        placeholderTextColor="#94A3B8"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity
                        className="w-12 h-12 bg-primary rounded-full items-center justify-center shadow-md active:bg-blue-700"
                        onPress={handleSend}
                    >
                        {/* @ts-ignore */}
                        <PaperAirplaneIcon size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
