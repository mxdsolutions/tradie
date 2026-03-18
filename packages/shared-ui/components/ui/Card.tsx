import { View, ViewProps } from 'react-native';
import { cn } from '@tradie/core';

interface CardProps extends ViewProps {
    className?: string;
    variant?: 'default' | 'flat' | 'outline';
    children?: React.ReactNode;
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
    const variants = {
        default: 'bg-white border border-slate-100', // Flat, subtle border
        flat: 'bg-slate-50 border-none',
        outline: 'bg-transparent border border-slate-200',
    };

    return (
        <View
            className={cn(
                'rounded-3xl p-5',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
