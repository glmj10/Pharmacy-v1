import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AsyncImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string; // URL ảnh trực tiếp
  fallbackSrc?: string; // Ảnh thế khi lỗi
}

const AsyncImage: React.FC<AsyncImageProps> = ({ 
  src, 
  className, 
  alt, 
  fallbackSrc = "https://placehold.co/400x400?text=No+Image",
  ...props 
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    // Reset trạng thái khi src thay đổi
    if (!src) {
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    
    // Tạo Image object để kiểm tra load ảnh
    const img = new Image();
    img.src = src;
    
    // Nếu ảnh đã được cache, complete = true ngay lập tức
    if (img.complete) {
      setStatus('loaded');
    } else {
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('error');
    }
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    setStatus('error');
  };

  if (status === 'error' || !src) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center text-gray-400 h-full w-full", className)}>
        {fallbackSrc && fallbackSrc.startsWith('http') ? (
            <img src={fallbackSrc} alt="fallback" className={cn("w-full h-full object-cover", className)} />
        ) : (
            <ImageIcon className="w-8 h-8" />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
        </div>
      )}

      {/* 3. Ảnh thật */}
      <img
        src={src}
        alt={alt || "Product Image"}
        className={cn(
          "transition-opacity duration-300 w-full h-full object-cover",
          status === 'loading' ? 'opacity-0' : 'opacity-100' // Ẩn ảnh khi đang load để tránh hiện tượng giật
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default AsyncImage;