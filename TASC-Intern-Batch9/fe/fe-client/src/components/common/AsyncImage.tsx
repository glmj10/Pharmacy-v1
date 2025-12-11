import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import fileService from '../../api/fileService';
import { cn } from '../../lib/utils';

interface AsyncImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  uuid?: string | null; // UUID để gọi API
  url?: string | null;  // URL trực tiếp (nếu có)
  fallbackSrc?: string;
}

const AsyncImage: React.FC<AsyncImageProps> = ({
  uuid,
  url,
  className,
  alt,
  fallbackSrc = "https://placehold.co/400x400?text=No+Image",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const loadImage = async () => {
      if (url || (uuid && uuid.startsWith('http'))) {
        setImgSrc(url || uuid || null);
        setLoading(false);
        return;
      }

      // TRƯỜNG HỢP 2: Chỉ có UUID -> Gọi API
      if (uuid) {
        try {
          // Gọi API lấy URL thật
          const response: any = await fileService.getFileUrl(uuid);
          const fetchedUrl = response.data || response.result;

          if (isMounted) {
            if (fetchedUrl) {
              setImgSrc(fetchedUrl);
            } else {
              setError(true);
            }
          }
        } catch (err) {
          // console.error(`Error loading image ${uuid}`, err);
          if (isMounted) setError(true);
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      // TRƯỜNG HỢP 3: Không có gì cả
      setError(true);
      setLoading(false);
    };

    loadImage();

    return () => { isMounted = false; };
  }, [uuid, url]); 

  // Render
  if (error || !imgSrc) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center text-gray-400", className)}>
        {/* Nếu không có ảnh thì hiện Icon hoặc ảnh fallback */}
        {fallbackSrc && fallbackSrc.startsWith('http') ? (
          <img src={fallbackSrc} alt="fallback" className={cn("w-full h-full object-cover", className)} />
        ) : (
          <ImageIcon className="w-8 h-8" />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("bg-gray-50 flex items-center justify-center animate-pulse", className)}>
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || "Product Image"}
      className={cn("transition-opacity duration-300", className)}
      {...props}
    />
  );
};

export default AsyncImage;