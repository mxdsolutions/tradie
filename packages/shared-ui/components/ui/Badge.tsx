import { View, Text } from 'react-native';
import { cn } from '@tradie/core';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'emerald' | 'blue' | 'amber' | 'outline-emerald' | 'outline-blue' | 'outline-success' | 'outline-amber';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-primary text-white border-transparent',
        secondary: 'bg-slate-100 text-slate-900 border-transparent',
        outline: 'border border-slate-200 text-slate-900',
        destructive: 'bg-red-100 text-red-700 border-transparent',
        success: 'bg-green-100 text-green-700 border-transparent',
        warning: 'bg-amber-100 text-amber-700 border-transparent',
        emerald: 'bg-emerald-100 text-emerald-700 border-transparent',
        blue: 'bg-blue-100 text-blue-700 border-transparent',
        amber: 'bg-amber-100 text-amber-700 border-transparent',
        'outline-emerald': 'border border-emerald-500 text-emerald-600',
        'outline-blue': 'border border-blue-500 text-blue-600',
        'outline-success': 'border border-green-500 text-green-600',
        'outline-amber': 'border border-amber-500 text-amber-600',
    };

    const variantStyles = (variants[variant as keyof typeof variants] || variants.default).split(' ');
    const bgBorderClass = variantStyles.filter(s => s.startsWith('bg-') || s.startsWith('border-')).join(' ');
    const textClass = variantStyles.filter(s => s.startsWith('text-')).join(' ');

    return (
        <View className={cn('px-3 py-1 rounded-full self-start border', bgBorderClass, className)}>
            <Text className={cn('text-xs font-bold uppercase tracking-wider', textClass)}>
                {label}
            </Text>
        </View>
    );
}
