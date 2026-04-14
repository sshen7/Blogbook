import { Redis } from "@upstash/redis";

// 使用 Redis 作为缓存存储
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 缓存配置
const CACHE_CONFIG = {
  // 默认缓存时间（秒）
  DEFAULT_TTL: 60 * 5, // 5 minutes
  // 长期缓存（秒）
  LONG_TTL: 60 * 60 * 24, // 24 hours
  // 短期缓存（秒）
  SHORT_TTL: 60, // 1 minute
  // 缓存前缀
  PREFIX: "cache:",
};

// 缓存键生成器
function getCacheKey(key: string): string {
  return `${CACHE_CONFIG.PREFIX}${key}`;
}

// 设置缓存
export async function setCache(
  key: string,
  value: any,
  ttl: number = CACHE_CONFIG.DEFAULT_TTL
): Promise<void> {
  const cacheKey = getCacheKey(key);
  await redis.set(cacheKey, JSON.stringify(value), { ex: ttl });
}

// 获取缓存
export async function getCache<T>(key: string): Promise<T | null> {
  const cacheKey = getCacheKey(key);
  const value = await redis.get<string>(cacheKey);

  if (value) {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("缓存解析失败:", error);
      return null;
    }
  }

  return null;
}

// 删除缓存
export async function deleteCache(key: string): Promise<void> {
  const cacheKey = getCacheKey(key);
  await redis.del(cacheKey);
}

// 清除所有缓存
export async function clearCache(): Promise<void> {
  const keys = await redis.keys(`${CACHE_CONFIG.PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// 缓存装饰器 - 用于函数缓存
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKeyGenerator: (...args: Parameters<T>) => string,
  ttl: number = CACHE_CONFIG.DEFAULT_TTL
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = cacheKeyGenerator(...args);
    const cachedValue = await getCache<ReturnType<T>>(cacheKey);

    if (cachedValue !== null) {
      return cachedValue;
    }

    const result = await fn(...args);
    await setCache(cacheKey, result, ttl);

    return result;
  }) as T;
}

// 内存缓存（用于开发环境）
const memoryCache = new Map<string, { value: any; expires: number }>();

function getMemoryCacheKey(key: string): string {
  return `${CACHE_CONFIG.PREFIX}${key}`;
}

export function setMemoryCache(
  key: string,
  value: any,
  ttl: number = CACHE_CONFIG.DEFAULT_TTL
): void {
  const cacheKey = getMemoryCacheKey(key);
  memoryCache.set(cacheKey, {
    value: JSON.stringify(value),
    expires: Date.now() + ttl * 1000,
  });
}

export function getMemoryCache<T>(key: string): T | null {
  const cacheKey = getMemoryCacheKey(key);
  const cached = memoryCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    try {
      return JSON.parse(cached.value) as T;
    } catch (error) {
      console.error("内存缓存解析失败:", error);
      return null;
    }
  }

  // 清除过期的缓存
  if (cached) {
    memoryCache.delete(cacheKey);
  }

  return null;
}

// 根据环境选择缓存实现
export const cache = process.env.NODE_ENV === "development" ? {
  set: setMemoryCache,
  get: getMemoryCache,
  delete: () => {},
  clear: () => {},
} : {
  set: setCache,
  get: getCache,
  delete: deleteCache,
  clear: clearCache,
};