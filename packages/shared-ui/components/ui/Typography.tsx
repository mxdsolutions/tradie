import { Text, TextProps } from 'react-native';
import { cn } from '@tradie/core';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption';

interface TypographyProps extends TextProps {
    variant?: Variant;
    className?: string;
    children?: React.ReactNode;
}

export function Typography({ variant = 'body', className, ...props }: TypographyProps) {
    const baseStyles = 'text-text-primary';

    const variants = {
        h1: 'font-bebas text-5xl text-slate-900',
        h2: 'font-bebas text-3xl text-slate-900',
        h3: 'font-bebas text-2xl text-slate-900',
        body: 'font-roboto text-base text-slate-700',
        label: 'font-roboto-medium text-sm text-slate-500 uppercase tracking-wider',
        caption: 'font-roboto text-sm text-slate-500',
    };

    return (
        <Text
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
}
