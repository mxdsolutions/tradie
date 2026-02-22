import { View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { ArrowUpRightIcon, ArrowDownLeftIcon, ArrowLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

export default function TransactionsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) fetchTransactions();
    }, [user]);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        if (!searchQuery.trim()) return transactions;
        const q = searchQuery.toLowerCase();
        return transactions.filter(
            (tx) =>
                (tx.title && tx.title.toLowerCase().includes(q)) ||
                (tx.status && tx.status.toLowerCase().includes(q))
        );
    }, [transactions, searchQuery]);

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            {/* Header */}
            <View
                className="bg-primary px-6 pb-6 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="white" />
                    </TouchableOpacity>
                    <Typography variant="h3" className="text-white text-lg">Transactions</Typography>
                    <View className="w-10" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/10 rounded-2xl px-4 border border-white/10">
                    {/* @ts-ignore */}
                    <MagnifyingGlassIcon size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search transactions..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 h-12 text-base text-white"
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 40 }} />
                ) : filteredTransactions.length === 0 ? (
                    <View className="p-8 items-center justify-center bg-white rounded-3xl border border-slate-100 mt-4">
                        <Typography variant="body" className="text-slate-500 text-center">
                            {searchQuery.trim() ? 'No matching transactions found.' : 'No transactions yet.'}
                        </Typography>
                    </View>
                ) : (
                    filteredTransactions.map((tx) => (
                        <TouchableOpacity
                            key={tx.id}
                            activeOpacity={0.7}
                            onPress={() => router.push({ pathname: '/(tradie)/transaction/[id]', params: { id: tx.id } })}
                        >
                            <Card variant="flat" className="mb-3 flex-row items-center justify-between p-5 bg-white border border-slate-50 shadow-sm rounded-3xl">
                                <View className="flex-row items-center flex-1">
                                    <View className={`p-3.5 rounded-2xl mr-5 ${String(tx.amount).startsWith('-') ? 'bg-slate-50' : 'bg-emerald-50'}`}>
                                        {String(tx.amount).startsWith('-') ? (
                                            // @ts-ignore
                                            <ArrowUpRightIcon size={24} color="#64748b" />
                                        ) : (
                                            // @ts-ignore
                                            <ArrowDownLeftIcon size={24} color="#059669" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Typography variant="h3" className="text-lg text-slate-900 mb-0.5">{tx.title}</Typography>
                                        <Typography variant="caption" className="text-text-tertiary font-medium">
                                            {new Date(tx.date).toLocaleDateString()} • {tx.status}
                                        </Typography>
                                    </View>
                                </View>
                                <Typography variant="h3" className={`text-lg font-bold ${String(tx.amount).startsWith('-') ? 'text-slate-900' : 'text-emerald-600'}`}>
                                    {String(tx.amount).startsWith('-') ? `$${Math.abs(tx.amount)}` : `+$${tx.amount}`}
                                </Typography>
                            </Card>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
