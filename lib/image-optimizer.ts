import { ImageProps } from "next/image";

// 图片优化配置
const IMAGE_CONFIG = {
  // 默认图片质量
  DEFAULT_QUALITY: 75,
  // 默认图片格式
  DEFAULT_FORMAT: "webp",
  // 支持的图片格式
  SUPPORTED_FORMATS: ["webp", "jpg", "png", "gif"],
  // 最大图片尺寸
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  // 懒加载阈值（像素）
  LAZY_LOAD_THRESHOLD: 100,
  // 缓存时间（秒）
  CACHE_TTL: 60 * 60 * 24 * 7, // 7 days
};

// 图片优化接口
export interface ImageOptimizerOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  lazy?: boolean;
  priority?: boolean;
}

// 生成优化后的图片 URL
export function optimizeImageUrl(
  url: string,
  options: ImageOptimizerOptions = {}
): string {
  const {
    width = IMAGE_CONFIG.MAX_WIDTH,
    height = IMAGE_CONFIG.MAX_HEIGHT,
    quality = IMAGE_CONFIG.DEFAULT_QUALITY,
    format = IMAGE_CONFIG.DEFAULT_FORMAT,
    lazy = true,
    priority = false,
  } = options;

  // 验证图片 URL
  if (!url || !isValidImageUrl(url)) {
    return "/placeholder.png";
  }

  // 构建优化参数
  const params = new URLSearchParams({
    w: Math.min(width, IMAGE_CONFIG.MAX_WIDTH).toString(),
    h: Math.min(height, IMAGE_CONFIG.MAX_HEIGHT).toString(),
    q: Math.min(quality, 100).toString(),
    f: format,
  });

  // 添加懒加载参数
  if (lazy) {
    params.append("lazy", "true");
  }

  // 添加优先级参数
  if (priority) {
    params.append("priority", "true");
  }

  // 返回优化后的 URL
  return `${url}?${params.toString()}`;
}

// 生成占位符图片 URL
export function getPlaceholderUrl(
  width: number,
  height: number,
  text?: string
): string {
  const textParam = text ? `&text=${encodeURIComponent(text)}` : "";
  return `https://placehold.co/${width}x${height}${textParam}`;
}

// 验证图片 URL
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:", "data:"];
    const allowedDomains = [
      "picsum.photos",
      "placehold.co",
      "images.unsplash.com",
      "localhost",
    ];

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }

    if (parsedUrl.hostname !== "localhost" && !allowedDomains.includes(parsedUrl.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// 图片组件属性
export function getImageProps(
  src: string,
  alt: string,
  options: ImageOptimizerOptions = {}
): ImageProps {
  const optimizedUrl = optimizeImageUrl(src, options);

  return {
    src: optimizedUrl,
    alt,
    loading: options.lazy ? "lazy" : "eager",
    priority: options.priority,
    quality: options.quality,
    width: options.width,
    height: options.height,
  };
}

// 懒加载图片组件
export function LazyImage({
  src,
  alt,
  className,
  style,
  options,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  options?: ImageOptimizerOptions;
}) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  const imageProps = getImageProps(src, alt, {
    ...options,
    lazy: true,
  });

  if (error) {
    return (
      <img
        src="/placeholder.png"
        alt={alt}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      {...imageProps}
      className={cn(className, !isLoaded && "opacity-0")}
      style={{
        ...style,
        transition: "opacity 0.3s ease-in-out",
      }}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

// 预加载图片
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

// 清理图片缓存
export function clearImageCache(): void {
  // 实现图片缓存清理逻辑
  console.log("清理图片缓存");
}