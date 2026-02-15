import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CalendarDaysIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, ChevronDownIcon, XMarkIcon, ArrowLeftIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

// Generate mock days for the calendar strip
const DAYS = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
        active: i === 0
    };
});

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TradieCalendar() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const [selectedDate, setSelectedDate] = useState(DAYS[0].date);
    const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState({ name: 'October', year: 2026 });

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('tradie_id', user?.id)
                .order('scheduled_date', { ascending: true });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching calendar jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter jobs for selected date (mocking strict date matching for demo flexibility)
    // Real implementation would match full date string
    const filteredJobs = jobs.filter(job => {
        if (!job.scheduled_date) return false;
        const jobDate = new Date(job.scheduled_date);
        return jobDate.getDate() === selectedDate;
    });

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            {/* Header */}
            <View
                className="bg-primary pb-6 px-6 border-b border-white/10 shadow-medium z-10"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3 w-10 h-10 items-center justify-center -ml-2"
                        >
                            {/* @ts-ignore */}
                            <ArrowLeftIcon size={26} color="white" />
                        </TouchableOpacity>
                        <Typography variant="h1" className="text-2xl text-white">{selectedMonth.name} {selectedMonth.year}</Typography>
                    </View>

                    <TouchableOpacity
                        className="bg-white/10 px-4 py-2 rounded-xl active:opacity-70"
                        onPress={() => setIsMonthPickerVisible(true)}
                    >
                        <Typography variant="body" className="text-white font-bold text-sm">Change Month</Typography>
                    </TouchableOpacity>
                </View>

                {/* Date Strip */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="-mx-6 px-6"
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    {DAYS.map((day, index) => {
                        const isSelected = selectedDate === day.date;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedDate(day.date)}
                                className={`items-center justify-center w-14 h-20 rounded-2xl mr-3 border ${isSelected ? 'bg-accent border-accent' : 'bg-transparent border-white/10'}`}
                            >
                                <Typography
                                    variant="caption"
                                    className={`mb-1 font-medium ${isSelected ? 'text-white' : 'text-blue-200/60'}`}
                                >
                                    {day.day}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    className={`text-xl ${isSelected ? 'text-white' : 'text-blue-100'}`}
                                >
                                    {day.date}
                                </Typography>
                                {index % 3 === 0 && !isSelected && (
                                    <View className="w-1.5 h-1.5 rounded-full bg-accent mt-1" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Schedule List */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <Typography variant="h3" className="mb-4">
                    {selectedDate === DAYS[0].date ? "Today's Jobs" : `Jobs for ${selectedMonth.name.substring(0, 3)} ${selectedDate}`}
                </Typography>

                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" className="mt-8" />
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <View key={job.id} className="flex-row mb-6">
                            {/* Time Column */}
                            <View className="mr-4 items-center">
                                <Typography variant="caption" className="text-slate-500 font-medium mb-1">
                                    {new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                <View className="w-[1px] h-full bg-slate-200" />
                            </View>

                            {/* Job Card */}
                            <Card className="flex-1 p-5 border border-slate-100 shadow-sm rounded-3xl bg-white mb-2">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View>
                                        <Typography variant="h3" className="text-lg mb-1">{job.title}</Typography>
                                        <View className="flex-row items-center">
                                            {/* @ts-ignore */}
                                            <MapPinIcon size={14} color="#64748b" style={{ marginRight: 4 }} />
                                            <Typography variant="caption" className="text-slate-500">{job.location}</Typography>
                                        </View>
                                    </View>
                                    <Badge label="1h" variant="outline" className="bg-slate-50 border-slate-200" />
                                </View>

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row -space-x-2">
                                        <View className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                                        <View className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white" />
                                    </View>
                                    <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-xl">
                                        <Typography variant="caption" className="text-primary font-bold">Details</Typography>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </View>
                    ))
                ) : (
                    <View className="flex-1 items-center justify-center py-10">
                        <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4">
                            {/* @ts-ignore */}
                            <CalendarDaysIcon size={32} color="#CBD5E1" />
                        </View>
                        <Typography variant="h3" className="text-slate-400 mb-1">No Jobs Scheduled</Typography>
                        <Typography variant="caption" className="text-slate-300 text-center">Enjoy your day off!</Typography>
                    </View>
                )}
            </ScrollView>

            {/* Month Picker Modal */}
            <Modal
                visible={isMonthPickerVisible}
                transparent
                animationType="none"
                onRequestClose={() => setIsMonthPickerVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <TouchableOpacity
                        className="absolute inset-0"
                        onPress={() => setIsMonthPickerVisible(false)}
                        activeOpacity={1}
                    />
                    <MotiView
                        from={{ translateY: 400 }}
                        animate={{ translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 } as any}
                        className="bg-white rounded-t-[32px] p-8 pb-12"
                    >
                        <View className="flex-row justify-between items-center mb-8">
                            <Typography variant="h2" className="text-2xl">Select Month</Typography>
                            <TouchableOpacity
                                onPress={() => setIsMonthPickerVisible(false)}
                                className="p-2 bg-slate-100 rounded-full"
                            >
                                {/* @ts-ignore */}
                                <XMarkIcon size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row flex-wrap justify-between">
                            {MONTH_NAMES.map((month) => {
                                const isSelected = selectedMonth.name === month;
                                return (
                                    <TouchableOpacity
                                        key={month}
                                        onPress={() => {
                                            setSelectedMonth({ ...selectedMonth, name: month });
                                            setIsMonthPickerVisible(false);
                                        }}
                                        className={`w-[30%] mb-4 py-3 rounded-2xl items-center border ${isSelected ? 'bg-primary border-primary' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <Typography
                                            variant="body"
                                            className={`font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}
                                        >
                                            {month.substring(0, 3)}
                                        </Typography>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View className="mt-4 pt-6 border-t border-slate-100 flex-row justify-between items-center">
                            <Typography variant="h3" className="text-lg">Year</Typography>
                            <View className="flex-row items-center bg-slate-100 px-4 py-2 rounded-xl">
                                <Typography variant="body" className="font-bold mr-2">{selectedMonth.year}</Typography>
                                {/* @ts-ignore */}
                                <ChevronDownIcon size={16} color="#0F172A" />
                            </View>
                        </View>
                    </MotiView>
                </View>
            </Modal>
        </View>
    );
}
