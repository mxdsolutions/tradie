import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
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
    PencilIcon,
    XMarkIcon,
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
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [updating, setUpdating] = useState(false);

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
            setEditedTitle(projectData?.title || '');

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

    const handleUpdateTitle = async () => {
        if (!editedTitle.trim()) return;
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ title: editedTitle.trim() })
                .eq('id', id);

            if (error) throw error;
            setProject({ ...project, title: editedTitle.trim() });
            setEditModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update project title');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#ff751f" />
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
                    <Typography variant="h2" className="text-white font-bold text-xl">
                        {isOpen ? 'Your Posting' : 'Project Details'}
                    </Typography>
                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(true)}
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-white/10 mr-1"
                        >
                            {/* @ts-ignore */}
                            <PencilIcon size={22} color="white" />
                        </TouchableOpacity>
                        {project.chat_id && (
                            <TouchableOpacity
                                onPress={() => router.push(`/chat/${project.chat_id}`)}
                                className="w-10 h-10 items-center justify-center -mr-2 rounded-full active:bg-white/10"
                            >
                                {/* @ts-ignore */}
                                <ChatBubbleLeftRightIcon size={24} color="white" />
                            </TouchableOpacity>
                        )}
                        {!project.chat_id && <View className="w-2" />}
                    </View>
                </View>

                <View className="items-center">
                    <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center mb-4 border border-white/20 backdrop-blur-md">
                        {/* @ts-ignore */}
                        <WrenchScrewdriverIcon size={40} color="white" />
                    </View>
                    <Typography variant="h1" className="text-white text-3xl text-center mb-3">{project.title}</Typography>
                    <Badge
                        label={project.status}
                        variant={statusBadgeVariant}
                        className="bg-white/10 text-white border-white/20 self-center px-4 py-1"
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {isOpen ? (
                    <View>
                        {/* Project Info Card */}
                        <Card className="p-6 mb-6 border border-slate-100 shadow-sm bg-white rounded-3xl">
                            <Typography variant="h2" className="text-2xl mb-5">Project Details</Typography>

                            <View className="gap-5">
                                {project.type && (
                                    <View className="flex-row items-center">
                                        <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center mr-4">
                                            {/* @ts-ignore */}
                                            <WrenchScrewdriverIcon size={22} color="#2563EB" />
                                        </View>
                                        <View>
                                            <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-widest font-bold">Trade</Typography>
                                            <Typography variant="body" className="text-slate-900 font-bold text-xl">{project.type}</Typography>
                                        </View>
                                    </View>
                                )}

                                {project.address && (
                                    <View className="flex-row items-center">
                                        <View className="w-11 h-11 rounded-xl bg-slate-50 items-center justify-center mr-4">
                                            {/* @ts-ignore */}
                                            <MapPinIcon size={22} color="#64748B" />
                                        </View>
                                        <View className="flex-1">
                                            <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-widest font-bold">Location</Typography>
                                            <Typography variant="body" className="text-slate-900 font-bold text-xl" numberOfLines={2}>{project.address}</Typography>
                                        </View>
                                    </View>
                                )}

                                <View className="flex-row items-center">
                                    <View className="w-11 h-11 rounded-xl bg-slate-50 items-center justify-center mr-4">
                                        {/* @ts-ignore */}
                                        <CalendarDaysIcon size={22} color="#64748B" />
                                    </View>
                                    <View>
                                        <Typography variant="caption" className="text-text-tertiary text-xs uppercase tracking-widest font-bold">Posted</Typography>
                                        <Typography variant="body" className="text-slate-900 font-bold text-xl">
                                            {project.created_at ? new Date(project.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                                        </Typography>
                                    </View>
                                </View>
                            </View>
                        </Card>

                        {/* Offers/Activity Stats */}
                        <View className="flex-row gap-3 mb-6">
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <EyeIcon size={24} color="#2563EB" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">0</Typography>
                                <Typography variant="caption" className="text-slate-500 font-bold text-xs uppercase">Views</Typography>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <UserGroupIcon size={24} color="#059669" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">0</Typography>
                                <Typography variant="caption" className="text-slate-500 font-bold text-xs uppercase">Offers</Typography>
                            </View>
                            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center">
                                <View className="w-12 h-12 rounded-full bg-amber-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <ClockIcon size={24} color="#F59E0B" />
                                </View>
                                <Typography variant="h2" className="text-2xl font-bold text-slate-900 mb-0.5">—</Typography>
                                <Typography variant="caption" className="text-slate-500 font-bold text-xs uppercase">Avg Response</Typography>
                            </View>
                        </View>

                        {/* Offers Section */}
                        <View>
                            <Typography variant="h2" className="mb-5 text-2xl">Offers</Typography>
                            <View className="bg-white rounded-3xl p-10 border border-slate-100 items-center justify-center">
                                <View className="w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-6">
                                    {/* @ts-ignore */}
                                    <UserGroupIcon size={40} color="#94A3B8" />
                                </View>
                                <Typography variant="h2" className="text-center mb-3 text-xl">No offers yet</Typography>
                                <Typography variant="body" className="text-slate-500 text-center text-lg leading-7">
                                    Your project is live and visible to tradies in your area. You'll receive offers here once tradies start responding.
                                </Typography>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View>
                        {/* Progress Card */}
                        <Card className="p-6 mb-6 border border-slate-100 shadow-sm bg-white rounded-3xl">
                            <View className="flex-row justify-between mb-3">
                                <Typography variant="h2" className="text-2xl">Overall Progress</Typography>
                                <Typography variant="h2" className="text-accent text-2xl">{project.progress || 0}%</Typography>
                            </View>
                            <View className="h-4 bg-slate-100 rounded-full overflow-hidden mb-5">
                                <View
                                    className="h-full bg-accent rounded-full"
                                    style={{ width: `${project.progress || 0}%` }}
                                />
                            </View>
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center gap-3">
                                    {/* @ts-ignore */}
                                    <CalendarDaysIcon size={20} color="#64748B" />
                                    <Typography variant="body" className="text-slate-500 font-bold text-lg">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                                    </Typography>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    {/* @ts-ignore */}
                                    <MapPinIcon size={20} color="#64748B" />
                                    <Typography variant="body" className="text-slate-500 font-bold text-lg">{project.address || 'No Address'}</Typography>
                                </View>
                            </View>
                        </Card>

                        {/* Quick Actions */}
                        <View className="flex-row gap-4 mb-10">
                            <TouchableOpacity className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center shadow-sm">
                                <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <CurrencyDollarIcon size={24} color="#059669" />
                                </View>
                                <Typography variant="caption" className="font-bold text-slate-800 text-sm italic uppercase">Payments</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 items-center shadow-sm">
                                <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-3">
                                    {/* @ts-ignore */}
                                    <DocumentTextIcon size={24} color="#2563EB" />
                                </View>
                                <Typography variant="caption" className="font-bold text-slate-800 text-sm italic uppercase">Documents</Typography>
                            </TouchableOpacity>
                        </View>

                        {/* Milestones */}
                        <View>
                            <Typography variant="h2" className="mb-6 text-2xl">Timeline & Milestones</Typography>
                            <View className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                {milestones.length === 0 ? (
                                    <Typography variant="body" className="text-slate-500 italic text-lg">No milestones yet.</Typography>
                                ) : (
                                    milestones.map((milestone, index) => (
                                        <View key={milestone.id} className="flex-row gap-5 mb-14 last:mb-0 relative">
                                            {/* Connector Line */}
                                            {index !== milestones.length - 1 && (
                                                <View className="absolute left-[13px] top-8 bottom-[-56px] w-[3px] bg-slate-100" />
                                            )}

                                            {/* Status Icon */}
                                            <View className={`w-7 h-7 rounded-full items-center justify-center border-2 z-10 bg-white ${milestone.status === 'Completed' ? 'border-emerald-500' :
                                                milestone.status === 'In Progress' ? 'border-accent' : 'border-slate-200'
                                                }`}>
                                                {milestone.status === 'Completed' && (
                                                    <View className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                                                )}
                                                {milestone.status === 'In Progress' && (
                                                    <View className="w-3.5 h-3.5 bg-accent rounded-full" />
                                                )}
                                            </View>

                                            <View className="flex-1 -mt-1">
                                                <View className="flex-row justify-between mb-1.5">
                                                    <Typography variant="h3" className={`text-xl ${milestone.status === 'Pending' ? 'text-slate-400' : 'text-slate-900'
                                                        }`}>
                                                        {milestone.title}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-slate-400 font-bold text-sm">
                                                        {milestone.date ? new Date(milestone.date).toLocaleDateString() : ''}
                                                    </Typography>
                                                </View>
                                                <Typography variant="caption" className={`text-sm font-bold uppercase ${milestone.status === 'Completed' ? 'text-emerald-600' :
                                                    milestone.status === 'In Progress' ? 'text-accent' : 'text-slate-400'
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

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-end bg-black/60">
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            className="w-full"
                        >
                            <Card
                                variant="default"
                                className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl"
                            >
                                <View className="flex-row justify-between items-center mb-8">
                                    <Typography variant="h2" className="text-3xl">Edit Project Name</Typography>
                                    <TouchableOpacity
                                        onPress={() => setEditModalVisible(false)}
                                        className="w-10 h-10 items-center justify-center bg-slate-100 rounded-full"
                                    >
                                        <XMarkIcon size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                <Typography variant="label" className="mb-3 ml-1">Project Name</Typography>
                                <View className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 mb-8">
                                    <TextInput
                                        value={editedTitle}
                                        onChangeText={setEditedTitle}
                                        placeholder="Enter project name..."
                                        className="text-xl font-roboto font-bold text-slate-900"
                                        autoFocus
                                    />
                                </View>

                                <Button
                                    label={updating ? "Saving..." : "Save Changes"}
                                    variant="primary"
                                    onPress={handleUpdateTitle}
                                    disabled={updating || !editedTitle.trim()}
                                />
                            </Card>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
