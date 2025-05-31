import { forwardRef, ReactNode, HTMLAttributes } from 'react';

interface TextProps extends HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small';
  className?: string;
  children: ReactNode;
  type?: 'primary' | 'secondary';
}

const Text = forwardRef<HTMLHeadingElement | HTMLParagraphElement, TextProps>(
  ({ variant = 'body', className = '', children, type = 'primary', ...props }, ref) => {
    const baseStyles = 'leading-relaxed tracking-wide transition-all duration-200';
    
    const variants: Record<typeof variant, string> = {
      h1: 'text-4xl font-bold mb-6',
      h2: 'text-3xl font-semibold mb-4',
      h3: 'text-2xl font-medium mb-3',
      h4: 'text-xl font-medium mb-2',
      h5: 'text-lg font-medium mb-2',
      h6: 'text-base font-medium mb-1',
      body: 'text-base',
      small: 'text-sm',
    };

    const fontClass = type === 'primary' ? 'text-primary' : 'text-secondary';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${fontClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Text.displayName = 'Text';

export default Text;
