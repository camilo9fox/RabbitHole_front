import { forwardRef } from 'react';

interface CardProps {
  variant?: 'default' | 'glass';
  className?: string;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200';
    
    const variants = {
      default: 'bg-secondary/10 border border-white/10',
      glass: 'bg-white/5 backdrop-blur-sm border border-white/5',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
