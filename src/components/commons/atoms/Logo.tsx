'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  showText = true, 
  textClassName = '', 
  className = ''
}) => {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative h-${size/10} w-${size/10} rounded-full overflow-hidden`} style={{ height: size, width: size }}>
        <Image 
          src="/assets/logo_1.jpg" 
          alt="Rabbit Hole Logo" 
          width={size} 
          height={size} 
          className="object-cover rounded-full"
          priority
        />
      </div>
      {showText && (
        <span className={`text-xl font-bold ${textClassName}`}>
          Rabbit Hole
        </span>
      )}
    </Link>
  );
};

export default Logo;
