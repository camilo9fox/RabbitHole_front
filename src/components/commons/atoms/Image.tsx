import Image from 'next/image';
import { forwardRef } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  unoptimized?: boolean;
}

const CustomImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full h-full">
        <Image
          ref={ref}
          src={src}
          alt={alt}
          width={width ?? 1200}
          height={height ?? 1200}
          className={`object-cover ${className ?? ''}`}
          unoptimized={props.unoptimized ?? false}
          {...props}
        />
      </div>
    );
  }
);

CustomImage.displayName = 'Image';

export default CustomImage;
