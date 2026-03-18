import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Card, Typography } from '@tradie/shared-ui';
import { ArrowUpRightIcon, ArrowDownLeftIcon, WalletIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase, useUser } from '@tradie/core';

export default function WalletScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const handlePayout = () => {
        Alert.alert('Payout Initiated', 'Your funds are on the way to your bank account.');
    };

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);

            const total = (data || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
            setBalance(total);

        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentTransactions = transactions.slice(0, 5);

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <StatusBar style="light" />
            {/* Wallet Header */}
            <View
                className="bg-primary pb-8 px-6 mb-8 shadow-medium"
                style={{ paddingTop: insets.top + 20 }}
            >
                <View className="flex-row items-center mb-8 justify-between">
                    <View className="flex-row items-center">
                        <View className="mr-4">
                            {/* @ts-ignore */}
                            <WalletIcon size={30} color="white" />
                        </View>
                        <Typography variant="h2" className="text-white text-2xl">My Wallet</Typography>
                    </View>
                </View>

                <View className="mb-4">
                    <Typography variant="label" className="text-slate-400 mb-1 text-sm">Total Balance</Typography>
                    <Typography variant="h1" className="text-white text-5xl tracking-tight font-bold">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                </View>

                <View className="mb-5 bg-white/10 self-start px-5 py-3 rounded-2xl border border-white/10">
                    <Typography variant="body" className="text-slate-300 text-sm font-medium">
                        Available for Payout: <Typography variant="body" className="text-emerald-400 font-bold">
                            ${(balance * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Typography>
                </View>

                <TouchableOpacity
                    onPress={handlePayout}
                    className="bg-white/15 border border-white/20 py-4 rounded-2xl items-center"
                >
                    <Typography variant="h3" className="text-white text-base font-bold">Request Payout</Typography>
                </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View className="px-6 pb-20">
                <View className="flex-row justify-between items-center mb-5">
                    <Typography variant="h3" className="text-slate-900 text-xl">Recent Transactions</Typography>
                    <TouchableOpacity
                        onPress={() => router.push('/transactions')}
                        className="flex-row items-center"
                    >
                        <Typography variant="body" className="text-accent text-sm font-semibold mr-1">View All</Typography>
                        {/* @ts-ignore */}
                        <ChevronRightIcon size={16} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : recentTransactions.length === 0 ? (
                    <View className="p-8 items-center justify-center bg-white rounded-3xl border border-slate-100">
                        <Typography variant="body" className="text-slate-500 text-center">No transactions found.</Typography>
                    </View>
                ) : (
                    recentTransactions.map((tx) => (
                        <TouchableOpacity
                            key={tx.id}
                            activeOpacity={0.7}
                            onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}
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
            </View>
        </ScrollView>
    );
}
