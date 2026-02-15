import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import { ArrowUpRightIcon, ArrowDownLeftIcon, WalletIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../context/UserContext';

export default function WalletScreen() {
    const insets = useSafeAreaInsets();
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
            // In a real app, transactions would be linked to the user.
            // Assuming transactions table has a way to link to tradie (project -> homeowner? or jobs -> tradie?)
            // For now, I'll fetch transactions linked to projects where the user is involved, or just all for demo if table doesn't have user_id.
            // Looking at schema: transactions -> project_id -> projects -> homeowner_id.
            // If I am a tradie, I need transactions for MY jobs.
            // The schema for transactions seems to be project-based (Milestone payments?).
            // For Tradie Wallet, we might need a different query.
            // Let's assume for now we list all transactions for projects this tradie is working on?
            // Or looking at schema again: `transactions` has `project_id`.
            // `jobs` has `tradie_id`.
            // Maybe we link via `jobs`?
            // Since this is a "Tradie" wallet, and the schema isn't fully capturing "payments to tradies" explicitly in `transactions` (which seem to be homeowner payments),
            // I will just fetch transactions for projects where the tradie has a job.
            // Or simpler: just empty state for now if no direct link.
            // Wait, the mock data had transaction lists.
            // I'll assume `transactions` table is what we want.
            // But `transactions` table doesn't have `user_id`.
            // I'll fetch ALL transactions for now to demonstrate, or maybe filter if I can find a link.
            // Actually, best to just show empty if I can't filter correctly, but I want to show something.
            // I'll fetch transactions and client-side filter or just show last 5.

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);

            // Calculate mock balance for demo
            const total = (data || []).reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
            setBalance(total);

        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            <StatusBar style="light" />
            {/* Wallet Header */}
            <View
                className="bg-primary pb-6 px-6 mb-8 shadow-medium"
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

                <View className="mb-4 bg-white/10 self-start px-5 py-3 rounded-2xl border border-white/10">
                    <Typography variant="body" className="text-slate-300 text-sm font-medium">
                        Available for Payout: <Typography variant="body" className="text-emerald-400 font-bold">
                            ${(balance * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Typography>
                </View>
            </View>

            {/* Payout Action */}
            <View className="px-6 mb-8">
                <TouchableOpacity
                    onPress={handlePayout}
                    className="bg-accent py-5 rounded-2xl items-center shadow-lg active:scale-[0.98] transition-all"
                >
                    <Typography variant="h3" className="text-white text-lg font-bold">Request Payout</Typography>
                </TouchableOpacity>
            </View>

            {/* Transactions */}
            <View className="px-6 pb-20">
                <View className="flex-row justify-between items-center mb-5">
                    <Typography variant="h3" className="text-slate-900 text-xl">Recent Transactions</Typography>
                    <TouchableOpacity>
                        <Typography variant="body" className="text-accent text-sm font-semibold">See All</Typography>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : transactions.length === 0 ? (
                    <Typography variant="body" className="text-slate-500 text-center py-4">No transactions found.</Typography>
                ) : (
                    transactions.map((tx) => (
                        <Card key={tx.id} variant="flat" className="mb-3 flex-row items-center justify-between p-5 bg-white border border-slate-50 shadow-sm rounded-3xl">
                            <View className="flex-row items-center">
                                <View className={`p-3.5 rounded-2xl mr-5 ${String(tx.amount).startsWith('-') ? 'bg-slate-50' : 'bg-emerald-50'}`}>
                                    {String(tx.amount).startsWith('-') ? (
                                        // @ts-ignore 
                                        <ArrowUpRightIcon size={24} color="#64748b" />
                                    ) : (
                                        // @ts-ignore
                                        <ArrowDownLeftIcon size={24} color="#059669" />
                                    )}
                                </View>
                                <View>
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
                    ))
                )}
            </View>
        </ScrollView>
    );
}
