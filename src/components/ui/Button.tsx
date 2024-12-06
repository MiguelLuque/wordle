import { ButtonHTMLAttributes, ReactNode } from 'react';
import { styles } from '../../styles/theme';
import { getVariantClasses } from '../../utils/styleUtils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    isLoading?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    isLoading,
    children,
    disabled,
    className,
    ...props
}: ButtonProps) {
    const buttonClasses = getVariantClasses(
        styles.button,
        variant,
        size,
        cn(
            disabled && styles.button.states.disabled,
            isLoading && styles.button.states.loading,
            className
        )
    );

    return (
        <button
            className={buttonClasses}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className={cn(styles.icon.sizes.sm, utils.animation.spin)}>
                    {/* Spinner icon */}
                </span>
            )}
            {icon && !isLoading && (
                <span className={cn(styles.icon.sizes.sm)}>{icon}</span>
            )}
            <span>{children}</span>
        </button>
    );
} 