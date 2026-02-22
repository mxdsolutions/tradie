import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Typography } from '../../../components/ui/Typography';
import { CalendarDaysIcon, MapPinIcon, CurrencyDollarIcon, BellIcon, BriefcaseIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../context/UserContext';

export default function TradieDashboard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, completedCount: 0 });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch Jobs assigned to this tradie
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('tradie_id', user.id)
                .order('scheduled_date', { ascending: true });

            if (jobsError) throw jobsError;

            const fetchedJobs = jobsData || [];
            setJobs(fetchedJobs);

            // Calculate Metrics
            const completedJobs = fetchedJobs.filter(j => j.status === 'Completed');
            const totalRevenue = completedJobs.reduce((sum, job) => sum + (Number(job.amount) || 0), 0);

            setStats({
                revenue: totalRevenue,
                completedCount: completedJobs.length
            });

        } catch (error) {
            console.error('Error fetching tradie dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
        >
            <StatusBar style="light" />
            {/* Header */}
            <View
                className="bg-primary pb-8 px-6 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row justify-between items-center">
                    <View>
                        <Typography variant="label" className="text-white/60 mb-0.5">Welcome Back</Typography>
                        <Typography variant="h1" className="text-2xl text-white">{user?.user_metadata?.full_name || 'Tradie Portal'}</Typography>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <TouchableOpacity
                            className="w-10 h-10 items-center justify-center"
                            onPress={() => router.push('/(tradie)/calendar')}
                        >
                            {/* @ts-ignore */}
                            <CalendarDaysIcon size={26} color="white" />
                        </TouchableOpacity>
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
            </View>

            {/* Metrics Section */}
            <View className="mt-8 px-6">
                <Typography variant="h3" className="mb-4">Overview</Typography>
                {/* Consolidated Metric Card */}
                <View className="bg-primary p-6 rounded-[32px] shadow-medium flex-1">
                    <View className="flex-row items-start justify-between mb-6">
                        <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center backdrop-blur-md">
                            {/* @ts-ignore */}
                            <CurrencyDollarIcon size={24} color="white" />
                        </View>
                        <View className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex-row items-center">
                            {/* @ts-ignore */}
                            <BriefcaseIcon size={14} color="#93C5FD" style={{ marginRight: 6 }} />
                            <Typography variant="caption" className="text-blue-100 font-medium">{stats.completedCount} Jobs Done</Typography>
                        </View>
                    </View>

                    <View>
                        <Typography variant="h1" className="text-5xl text-white mb-2 tracking-tight font-bold">
                            ${stats.revenue.toLocaleString()}
                        </Typography>
                        <Typography variant="body" className="text-blue-200 font-medium text-sm">Total Revenue</Typography>
                    </View>
                </View>
            </View>

            {/* Job List */}
            <View className="mt-8 px-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Typography variant="h3">Current Jobs</Typography>
                    <TouchableOpacity
                        onPress={() => router.push('/(tradie)/create-job')}
                        className="flex-row items-center bg-accent px-4 py-2 rounded-full"
                    >
                        {/* @ts-ignore */}
                        <PlusIcon size={16} color="white" style={{ marginRight: 4 }} />
                        <Typography variant="body" className="text-white text-sm font-bold">Create Job</Typography>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                ) : jobs.length === 0 ? (
                    <View className="p-8 items-center justify-center bg-white rounded-3xl border border-slate-100">
                        <Typography variant="body" className="text-slate-500 text-center">No assigned jobs found.</Typography>
                    </View>
                ) : (
                    jobs.map((job) => (
                        <Card key={job.id} className="mb-3 p-5 border border-slate-100 shadow-sm rounded-3xl">
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Typography variant="h3" className="text-lg mb-1">{job.title}</Typography>
                                    <View className="flex-row items-center">
                                        {/* @ts-ignore */}
                                        <MapPinIcon size={14} color="#64748b" style={{ marginRight: 4 }} />
                                        <Typography variant="caption" className="text-text-secondary font-medium">{job.location || 'No location'}</Typography>
                                    </View>
                                </View>
                                <Badge
                                    label={job.status}
                                    variant={job.status === 'Scheduled' ? 'blue' : 'amber'}
                                    className={job.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}
                                />
                            </View>

                            <View className="border-t border-slate-50 pt-4 flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    {/* @ts-ignore */}
                                    <CalendarDaysIcon size={16} color="#64748b" style={{ marginRight: 6 }} />
                                    <Typography variant="body" className="text-sm font-medium">
                                        {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'TBD'}
                                    </Typography>
                                </View>
                                <View className="flex-row items-center bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                    {/* @ts-ignore */}
                                    <CurrencyDollarIcon size={14} color="#059669" style={{ marginRight: 2 }} />
                                    <Typography variant="body" className="text-emerald-700 font-bold text-sm">
                                        ${Number(job.amount).toLocaleString()}
                                    </Typography>
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </View>
        </ScrollView >
    );
}
