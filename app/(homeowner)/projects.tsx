import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeftIcon, WrenchScrewdriverIcon } from 'react-native-heroicons/outline';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

const FILTERS = ['All', 'In Progress', 'Planning', 'Completed'];

export default function MyProjectsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const [activeFilter, setActiveFilter] = useState('All');

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('homeowner_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        activeFilter === 'All' ? true : project.status === activeFilter
    );

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />

            {/* Header */}
            <View
                className="bg-primary px-6 pb-6 pt-2 border-b border-white/10 z-10 shadow-medium"
                style={{ paddingTop: insets.top }}
            >
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3 w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-white/10"
                    >
                        {/* @ts-ignore */}
                        <ArrowLeftIcon size={24} color="white" />
                    </TouchableOpacity>
                    <Typography variant="h1" className="text-3xl text-white">My Projects</Typography>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-grow-0"
                >
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full mr-2 border ${activeFilter === filter
                                ? 'bg-white border-white'
                                : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Typography
                                variant="caption"
                                className={`font-semibold ${activeFilter === filter ? 'text-primary' : 'text-white'
                                    }`}
                            >
                                {filter}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Project List */}
            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#2563EB" className="mt-8" />
                ) : (
                    <View className="space-y-4">
                        {filteredProjects.map((project) => (
                            <TouchableOpacity
                                key={project.id}
                                activeOpacity={0.9}
                                onPress={() => router.push(`/(homeowner)/project/${project.id}`)}
                            >
                                <Card
                                    variant="default"
                                    className="w-full p-5 border border-slate-100 bg-white shadow-sm rounded-3xl"
                                >
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                                            {/* @ts-ignore */}
                                            <WrenchScrewdriverIcon size={20} color="#2563EB" />
                                        </View>
                                        <Badge
                                            label={project.status}
                                            variant={project.status === 'Completed' ? 'emerald' : project.status === 'In Progress' ? 'blue' : 'amber'}
                                        />
                                    </View>

                                    <Typography variant="h3" className="mb-1 text-lg">{project.title}</Typography>
                                    <Typography variant="caption" className="text-slate-500 mb-4">
                                        {project.type || 'Renovation'}
                                    </Typography>

                                    <View className="space-y-1">
                                        <View className="flex-row justify-between text-xs mb-1">
                                            <Typography variant="caption" className="text-slate-500 font-medium">{project.progress || 0}% Complete</Typography>
                                            <Typography variant="caption" className="text-slate-500 font-medium">
                                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                                            </Typography>
                                        </View>
                                        <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-accent rounded-full"
                                                style={{ width: `${project.progress || 0}%` }}
                                            />
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))}

                        {filteredProjects.length === 0 && (
                            <View className="items-center justify-center py-20">
                                <Typography variant="body" className="text-slate-400 text-center">No projects found</Typography>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
