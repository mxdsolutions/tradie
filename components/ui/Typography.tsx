import { Text, TextProps } from 'react-native';
import { cn } from '../../lib/utils';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption';

interface TypographyProps extends TextProps {
    variant?: Variant;
    className?: string;
    children?: React.ReactNode;
}

export function Typography({ variant = 'body', className, ...props }: TypographyProps) {
    const baseStyles = 'text-text-primary';

    const variants = {
        h1: 'text-4xl font-bold tracking-tighter text-primary',
        h2: 'text-2xl font-bold tracking-tight text-primary',
        h3: 'text-xl font-semibold tracking-tight text-primary',
        body: 'text-base text-text-secondary leading-relaxed',
        label: 'text-sm font-medium uppercase tracking-wider text-text-tertiary',
        caption: 'text-xs text-text-tertiary',
    };

    return (
        <Text
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        />
    );
}
