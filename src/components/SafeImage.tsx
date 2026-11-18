import { useState } from 'react';
import { Wind } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  className = 'h-full w-full object-cover',
  fallbackTitle = 'AIRWISE Environmental View',
  priority = false,
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <figure
        className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#102A43] via-[#1B4366] to-[#20C997]/40 p-6 text-center text-white"
        aria-label={alt}
      >
        <Wind className="mb-2 h-8 w-8 text-[#38BDF8]" aria-hidden="true" />
        <figcaption className="text-sm font-medium text-white/90">{fallbackTitle}</figcaption>
      </figure>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
