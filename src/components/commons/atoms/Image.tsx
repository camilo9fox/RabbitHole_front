import Image from 'next/image';
import { forwardRef } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const CustomImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full h-full">
        <Image
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover ${className}`}
          {...props}
        />
      </div>
    );
  }
);

CustomImage.displayName = 'Image';

export default CustomImage;
