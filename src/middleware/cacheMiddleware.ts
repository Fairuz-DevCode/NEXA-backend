import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  body: any;
  contentType?: string;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, body: any, ttlSeconds: number, contentType?: string) {
    this.cache.set(key, {
      body,
      contentType,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clearPrefix(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();

/**
 * Middleware untuk meng-cache response GET request.
 * @param ttlSeconds Durasi cache dalam detik (default 300 detik / 5 menit)
 * @param prefix Prefix kunci cache untuk mempermudah invalidasi
 */
export const cacheResponse = (ttlSeconds: number = 300, prefix: string = "cache") => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Caching hanya untuk metode GET
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      if (cached.contentType) {
        res.setHeader("Content-Type", cached.contentType);
      }
      return res.send(cached.body);
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.send untuk menyimpan hasil response ke cache jika sukses (status 200)
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.getHeader("Content-Type") as string | undefined;
        memoryCache.set(cacheKey, body, ttlSeconds, contentType);
      }
      return originalSend(body);
    };

    next();
  };
};

/**
 * Middleware untuk menghapus (invalidate) cache berdasarkan prefix setelah mutasi (POST, PATCH, DELETE) berhasil.
 * @param prefix Prefix kunci cache yang ingin dihapus (misal "products" atau "categories")
 */
export const invalidateCache = (prefix: string) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.clearPrefix(prefix);
      }
      return originalSend(body);
    };
    next();
  };
};
