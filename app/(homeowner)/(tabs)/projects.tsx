import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../context/UserContext';
import { ProjectCard } from '../../../components/ProjectCard';

const FILTERS = ['All', 'Open', 'Planning', 'In Progress', 'Completed'];

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
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onPress={() => router.push(`/(homeowner)/project/${project.id}`)}
                            />
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
