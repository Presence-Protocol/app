'use client';

import { useEffect, useState } from 'react';

interface MediaDisplayProps {
  url: string;
  alt?: string;
  title?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
}

// Helper function to check if a URL is a video
const isVideoMedia = (src: string | null | undefined) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:video') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.includes('video/mp4') ||
    lower.includes('video/webm') ||
    lower.includes('video/ogg')
  );
};

// Helper function to determine media type (video or image)
const getMediaType = async (url: string): Promise<'video' | 'image'> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('video/')) {
      return 'video';
    }
    // If content-type header is missing or not video, check the URL
    return isVideoMedia(response.url) ? 'video' : 'image';
  } catch (error) {
    console.error('Error checking media type:', error);
    // Fallback to checking the original URL
    return isVideoMedia(url) ? 'video' : 'image';
  }
};

export default function MediaDisplay({ url, alt, title, eventDateStart, eventDateEnd }: MediaDisplayProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    const checkMediaType = async () => {
      if (url) {
        try {
          const type = await getMediaType(url);
          setMediaType(type);
        } catch (error) {
          console.error('Error determining media type:', error);
          setMediaType('image');
        }
      }
    };

    checkMediaType();
  }, [url]);

  const fallbackContent = (
    <div className="w-full h-full bg-lila-500 flex flex-col items-center justify-center p-2">
      {title && (
        <span className="text-sm font-medium text-black">
          {title}
        </span>
      )}
      {(eventDateStart || eventDateEnd) && (
        <span className="text-xs text-black mt-1">
          {eventDateStart && eventDateEnd ? `${eventDateStart} - ${eventDateEnd}` : eventDateStart || eventDateEnd}
        </span>
      )}
    </div>
  );

  if (!url) {
    return fallbackContent;
  }

  if (mediaType === 'video') {
    return (
      <div className="relative w-full h-full">
        <video
          key={url}
          src={url}
          className="w-full h-full object-cover"
          autoPlay={true}
          loop={true}
          muted
          playsInline
          controls={false}
          onError={(e) => {
            console.error('Video error:', e);
            setMediaError(true);
          }}
        />
        {mediaError && fallbackContent}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={url}
        alt={alt || title || 'Media'}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Image error:', e);
          setMediaError(true);
        }}
      />
      {mediaError && fallbackContent}
    </div>
  );
}
