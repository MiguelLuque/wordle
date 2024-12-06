type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;
type ClassArgument = ClassValue | ClassArray | ClassDictionary;

export function cn(...args: ClassArgument[]): string {
  const classes = args.filter(Boolean);
  return classes.join(' ');
}

type StyleVariants = {
  base: string;
  variants?: Record<string, string>;
  sizes?: Record<string, string>;
};

export function getVariantClasses(
  styles: StyleVariants,
  variant?: string,
  size?: string,
  className?: string
) {
  return cn(
    styles.base,
    variant && styles.variants?.[variant],
    size && styles.sizes?.[size],
    className
  );
} 