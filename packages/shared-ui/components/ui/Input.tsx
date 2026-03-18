import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '@tradie/core';
import { useState } from 'react';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({
    label,
    error,
    className,
    containerClassName,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={cn('w-full', containerClassName)}>
            {label && (
                <Text className="text-sm font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor="#94A3B8"
                className={cn(
                    'w-full bg-slate-50 rounded-xl px-4 h-14 text-text-primary text-base',
                    'border border-transparent',
                    isFocused && 'border-accent bg-white',
                    error && 'border-status-error bg-red-50',
                    className
                )}
                style={{ lineHeight: 20 }} // Explicit line height to prevent clipping
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && (
                <Text className="text-xs text-status-error mt-1">{error}</Text>
            )}
        </View>
    );
}
