import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
    ArrowLeftIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    ClockIcon,
    StarIcon,
    EyeIcon,
} from 'react-native-heroicons/outline';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [project, setProject] = useState<any>(null);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProjectDetails();
        }
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            // Fetch Project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (projectError) throw projectError;
            setProject(projectData);

            // Fetch Milestones (only relevant when assigned)
            if (projectData?.status !== 'Open') {
                const { data: milestonesData, error: milestonesError } = await supabase
                    .from('milestones')
                    .select('*')
                    .eq('project_id', id)
                    .order('date', { ascending: true });

                if (milestonesError) throw milestonesError;
                setMilestones(milestonesData || []);
            }

        } catch (error) {
            console.error('Error fetching project details:', error);
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

    if (!project) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Typography variant="h3">Project not found</Typography>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Typography variant="body" className="text-primary">Go Back</Typography>
                </TouchableOpacity>
            </View>
        );
    }

    const isOpen = project.status === 'Open';

    const statusBadgeVariant = project.status === 'Completed' ? 'emerald'
        : project.status === 'In Progress' ? 'blue'
            : project.status === 'Open' ? 'success'
                : 'amber';

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Header */}
            <View
                className="bg-primary px-6 pb-8 pt-2 z-10 shadow-medium"
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-white/10"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="white" />
                    </TouchableOpacity>
                    <Typography variant="h2" className="text-white font-bold">
                        {isOpen ? 'Your Posting' : 'Project Details'}
                    </Typography>
                    {project.chat_id && (
                        <TouchableOpacity
                            onPress={() => router.push(`/chat/${project.chat_id}`)}
                            className="w-10 h-10 items-center justify-center -mr-2 rounded-full active:bg-white/10"
                        >
                            {/* @ts-ignore */}
                            <ChatBubbleLeftRightIcon size={24} color="white" />
                        </TouchableOpacity>
                    )}
                    {!project.chat_id && <View className="w-10" />}
                </View>

                <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-4 border border-white/20 backdrop-blur-md">
                        {/* @ts-ignore */}
                        <WrenchScrewdriverIcon size={32} color="white" />
                    </View>
                    <Typography variant="h1" className="text-white text-2xl text-center mb-2">{project.title}</Typography>
                    <Badge
                        label={project.status}
                        variant={statusBadgeVariant}
                        className="bg-white/10 text-white border-white/20 self-center"
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {isOpen ? (
                    /* ============================================================
                       OPEN STATE — Offers-focused view
                       ============================================================ */
                    <View>
                        {/* Project Info Card */}
                        <Card className="p-6 mb-6 border border-slate-100 shadow-sm bg-white rounded-3xl">
                            <Typography variant="h3" className="text-lg mb-4">Project Details</Typography>

                            <View className="gap-3">
                                {project.type && (
                                    <View className="flex-row items-center">
                                        <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                            {/* @ts-ignore */}
                                            <WrenchScrewdriverIcon size={18} color="#2563EB" />
                                        </View>
                                        <View>
                                            <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-wider">Trade</Typography>
                                            <Typography variant="body" className="text-slate-900 font-medium">{project.type}</Typography>
                                        </View>
                                    </View>
                                )}

                                {project.address && (
                                    <View className="flex-row items-center">
                                        <View className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center mr-3">
                                            {/* @ts-ignore */}
                                            <MapPinIcon size={18} color="#64748B" />
                                        </View>
                                        <View>
                                            <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-wider">Location</Typography>
                                            <Typography variant="body" className="text-slate-900 font-medium">{project.address}</Typography>
                                        </View>
                                    </View>
                                )}

                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center mr-3">
                                        {/* @ts-ignore */}
                                        <CalendarDaysIcon size={18} color="#64748B" />
                                    </View>
                                    <View>
                                        <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-wider">Posted</Typography>
                                        <Typography variant="body" className="text-slate-900 font-medium">
                                            {project.created_at ? new Date(project.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                                        </Typography>
                                    </View>
                                </View>
                            </View>
                        </Card>

                        {/* Offers/Activity Stats */}
                        <View className="flex-row gap-3 mb-6">
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <EyeIcon size={22} color="#2563EB" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">0</Typography>
                                <Typography variant="caption" className="text-slate-500 font-medium text-xs">Views</Typography>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-11 h-11 rounded-full bg-emerald-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <UserGroupIcon size={22} color="#059669" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">0</Typography>
                                <Typography variant="caption" className="text-slate-500 font-medium text-xs">Offers</Typography>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-11 h-11 rounded-full bg-amber-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <ClockIcon size={22} color="#F59E0B" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">—</Typography>
                                <Typography variant="caption" className="text-slate-500 font-medium text-xs">Avg Response</Typography>
                            </View>
                        </View>

                        {/* Offers Section */}
                        <View>
                            <Typography variant="h3" className="mb-4 text-lg">Offers</Typography>
                            <View className="bg-white rounded-3xl p-8 border border-slate-100 items-center justify-center">
                                <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4">
                                    {/* @ts-ignore */}
                                    <UserGroupIcon size={32} color="#94A3B8" />
                                </View>
                                <Typography variant="h3" className="text-center mb-2">No offers yet</Typography>
                                <Typography variant="body" className="text-slate-500 text-center text-sm leading-5">
                                    Your project is live and visible to tradies in your area. You'll receive offers here once tradies start responding.
                                </Typography>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* ============================================================
                       ASSIGNED STATE — Progress & milestones view (existing)
                       ============================================================ */
                    <View>
                        {/* Progress Card */}
                        <Card className="p-6 mb-6 border border-slate-100 shadow-sm bg-white rounded-3xl">
                            <View className="flex-row justify-between mb-2">
                                <Typography variant="h3" className="text-lg">Overall Progress</Typography>
                                <Typography variant="h3" className="text-primary">{project.progress || 0}%</Typography>
                            </View>
                            <View className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                                <View
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${project.progress || 0}%` }}
                                />
                            </View>
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center gap-2">
                                    {/* @ts-ignore */}
                                    <CalendarDaysIcon size={16} color="#64748B" />
                                    <Typography variant="caption" className="text-slate-500 font-medium">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                                    </Typography>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    {/* @ts-ignore */}
                                    <MapPinIcon size={16} color="#64748B" />
                                    <Typography variant="caption" className="text-slate-500 font-medium">{project.address || 'No Address'}</Typography>
                                </View>
                            </View>
                        </Card>

                        {/* Quick Actions */}
                        <View className="flex-row gap-3 mb-8">
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 items-center shadow-sm">
                                <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                                    {/* @ts-ignore */}
                                    <CurrencyDollarIcon size={20} color="#059669" />
                                </View>
                                <Typography variant="caption" className="font-bold text-slate-700">Payments</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 items-center shadow-sm">
                                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
                                    {/* @ts-ignore */}
                                    <DocumentTextIcon size={20} color="#2563EB" />
                                </View>
                                <Typography variant="caption" className="font-bold text-slate-700">Documents</Typography>
                            </TouchableOpacity>
                        </View>

                        {/* Milestones */}
                        <View>
                            <Typography variant="h3" className="mb-4 text-lg">Timeline & Milestones</Typography>
                            <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                {milestones.length === 0 ? (
                                    <Typography variant="body" className="text-slate-500 italic">No milestones yet.</Typography>
                                ) : (
                                    milestones.map((milestone, index) => (
                                        <View key={milestone.id} className="flex-row gap-4 mb-12 last:mb-0 relative">
                                            {/* Connector Line */}
                                            {index !== milestones.length - 1 && (
                                                <View className="absolute left-[11px] top-7 bottom-[-48px] w-[2px] bg-slate-100" />
                                            )}

                                            {/* Status Icon */}
                                            <View className={`w-6 h-6 rounded-full items-center justify-center border-2 z-10 bg-white ${milestone.status === 'Completed' ? 'border-emerald-500' :
                                                milestone.status === 'In Progress' ? 'border-primary' : 'border-slate-200'
                                                }`}>
                                                {milestone.status === 'Completed' && (
                                                    <View className="w-3 h-3 bg-emerald-500 rounded-full" />
                                                )}
                                                {milestone.status === 'In Progress' && (
                                                    <View className="w-3 h-3 bg-primary rounded-full" />
                                                )}
                                            </View>

                                            <View className="flex-1 -mt-1">
                                                <View className="flex-row justify-between mb-0.5">
                                                    <Typography variant="body" className={`font-semibold ${milestone.status === 'Pending' ? 'text-slate-400' : 'text-slate-900'
                                                        }`}>
                                                        {milestone.title}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-slate-400 font-medium">
                                                        {milestone.date ? new Date(milestone.date).toLocaleDateString() : ''}
                                                    </Typography>
                                                </View>
                                                <Typography variant="caption" className={`text-xs ${milestone.status === 'Completed' ? 'text-emerald-600' :
                                                    milestone.status === 'In Progress' ? 'text-primary' : 'text-slate-400'
                                                    }`}>
                                                    {milestone.status}
                                                </Typography>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
