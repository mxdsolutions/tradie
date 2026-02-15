import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'emerald' | 'blue' | 'amber';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-primary text-white',
        secondary: 'bg-slate-100 text-slate-900',
        outline: 'border border-slate-200 text-slate-900',
        destructive: 'bg-red-100 text-red-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700',
    };

    return (
        <View className={cn('px-2.5 py-0.5 rounded-full self-start', variants[variant].split(' ')[0], className)}>
            <Text className={cn('text-xs font-semibold', variants[variant].split(' ')[1])}>
                {label}
            </Text>
        </View>
    );
}
