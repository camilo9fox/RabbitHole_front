import Link from 'next/link';
import { forwardRef } from 'react';

interface LinkProps {
  href: string;
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
  children: React.ReactNode;
}

const CustomLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, variant = 'primary', className = '', children, ...props }, ref) => {
    const baseStyles = 'transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50';
    
    const variants = {
      primary: 'text-accent hover:text-accent/90',
      secondary: 'text-white/80 hover:text-white',
      text: 'text-white/60 hover:text-white'
    };

    return (
      <Link
        ref={ref}
        href={href}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

CustomLink.displayName = 'Link';

export default CustomLink;
