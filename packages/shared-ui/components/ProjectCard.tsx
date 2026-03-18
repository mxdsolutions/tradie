import { View, TouchableOpacity } from 'react-native';
import { Typography } from './ui/Typography';
import { Badge } from './ui/Badge';
import { cn } from '@tradie/core';

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        status: string;
        progress: number;
    };
    onPress: () => void;
    className?: string;
}

export function ProjectCard({ project, onPress, className }: ProjectCardProps) {
    // Map existing status to outline variants
    const getBadgeVariant = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'completed') return 'outline-emerald';
        if (s === 'in progress') return 'outline-blue';
        if (s === 'open') return 'outline-success';
        return 'outline-amber'; // Planning or others
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className={cn('w-full p-6 border border-slate-100 bg-white shadow-sm rounded-3xl', className)}
        >
            <View className="flex-row justify-between items-center mb-6">
                <Typography variant="h2" className="text-2xl flex-1 mr-4" numberOfLines={1}>
                    {project.title}
                </Typography>
                <Badge
                    label={project.status || 'Planning'}
                    variant={getBadgeVariant(project.status)}
                    className="flex-shrink-0"
                />
            </View>

            <View className="space-y-1">
                <View className="flex-row justify-between text-sm mb-2">
                    <Typography variant="body" className="text-slate-500 font-bold">
                        {project.progress || 0}% Complete
                    </Typography>
                </View>
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${project.progress || 0}%` }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}
