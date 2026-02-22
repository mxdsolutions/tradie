import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Typography } from '../../../components/ui/Typography';
import {
    ArrowLeftIcon,
    ArrowUpRightIcon,
    ArrowDownLeftIcon,
    CalendarDaysIcon,
    UserIcon,
    BriefcaseIcon,
    TagIcon,
    CurrencyDollarIcon,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TransactionDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setTransaction(data);
        } catch (error) {
            console.error('Error fetching transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!transaction) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-6">
                <Typography variant="body" className="text-slate-500 text-center">Transaction not found.</Typography>
            </View>
        );
    }

    const isDebit = String(transaction.amount).startsWith('-');
    const formattedAmount = isDebit
        ? `-$${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : `+$${Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            {/* Header */}
            <View
                className="bg-primary px-6 pb-8"
                style={{ paddingTop: insets.top }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center -ml-2 rounded-full mb-4"
                >
                    {/* @ts-ignore */}
                    <ArrowLeftIcon size={24} color="white" />
                </TouchableOpacity>

                <View className="items-center">
                    <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isDebit ? 'bg-white/10' : 'bg-emerald-500/20'}`}>
                        {isDebit ? (
                            // @ts-ignore
                            <ArrowUpRightIcon size={32} color="#94a3b8" />
                        ) : (
                            // @ts-ignore
                            <ArrowDownLeftIcon size={32} color="#34d399" />
                        )}
                    </View>
                    <Typography variant="h1" className={`text-4xl tracking-tight font-bold mb-1 ${isDebit ? 'text-white' : 'text-emerald-400'}`}>
                        {formattedAmount}
                    </Typography>
                    <Typography variant="body" className="text-slate-400 text-sm">{transaction.title}</Typography>
                </View>
            </View>

            {/* Details */}
            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    <DetailRow
                        icon={<TagIcon size={20} color="#64748b" />}
                        label="Status"
                        value={transaction.status || 'N/A'}
                    />
                    <DetailRow
                        icon={<CalendarDaysIcon size={20} color="#64748b" />}
                        label="Date"
                        value={transaction.date ? new Date(transaction.date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    />
                    <DetailRow
                        icon={<UserIcon size={20} color="#64748b" />}
                        label="Customer"
                        value={transaction.customer_name || transaction.payer || 'N/A'}
                    />
                    <DetailRow
                        icon={<BriefcaseIcon size={20} color="#64748b" />}
                        label="Related Job"
                        value={transaction.job_title || transaction.project_title || 'N/A'}
                    />
                    <DetailRow
                        icon={<CurrencyDollarIcon size={20} color="#64748b" />}
                        label="Amount"
                        value={formattedAmount}
                        isLast
                    />
                </View>

                {transaction.description && (
                    <View className="mt-6 bg-white rounded-3xl border border-slate-100 p-5">
                        <Typography variant="label" className="text-slate-500 text-xs uppercase tracking-wider mb-2">Notes</Typography>
                        <Typography variant="body" className="text-slate-700 leading-6">{transaction.description}</Typography>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function DetailRow({ icon, label, value, isLast = false }: { icon: React.ReactNode; label: string; value: string; isLast?: boolean }) {
    return (
        <View className={`flex-row items-center px-5 py-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
            <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-4">
                {/* @ts-ignore */}
                {icon}
            </View>
            <View className="flex-1">
                <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-wider mb-0.5">{label}</Typography>
                <Typography variant="body" className="text-slate-900 font-medium text-base">{value}</Typography>
            </View>
        </View>
    );
}
