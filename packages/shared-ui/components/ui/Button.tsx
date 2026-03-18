import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { cn } from '@tradie/core';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
    variant?: Variant;
    size?: Size;
    label: string;
    loading?: boolean;
    icon?: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    label,
    loading,
    icon,
    className,
    textClassName,
    disabled,
    ...props
}: ButtonProps & { textClassName?: string }) {

    const baseStyles = 'flex-row items-center justify-center rounded-full';

    const variants = {
        primary: 'bg-accent active:opacity-90',
        secondary: 'bg-transparent border border-slate-200 active:bg-slate-50',
        ghost: 'bg-transparent active:bg-slate-50',
        danger: 'bg-status-error active:bg-red-600',
    };

    const sizes = {
        sm: 'px-4 py-2',
        md: 'px-6 py-3.5',
        lg: 'px-8 py-4',
    };

    const textStyles = {
        primary: 'text-white font-bold',
        secondary: 'text-text-primary font-semibold',
        ghost: 'text-accent font-semibold',
        danger: 'text-white font-bold',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <TouchableOpacity
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                (disabled || loading) && 'opacity-50',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#ff751f' : 'white'} />
            ) : (
                <>
                    {icon && <Text className="mr-2">{icon}</Text>}
                    <Text className={cn(textStyles[variant], textSizes[size], textClassName)}>
                        {label}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
