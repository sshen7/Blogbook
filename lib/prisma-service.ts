import { PrismaClient, Prisma } from "@prisma/client";
import { cache } from "./cache";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// 错误处理装饰器
function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Prisma 操作失败: ${fn.name}`, error);
      throw error;
    }
  }) as T;
}

// 缓存装饰器
function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKeyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300 // 5 minutes
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = cacheKeyGenerator(...args);
    const cachedValue = await cache.get<ReturnType<T>>(cacheKey);

    if (cachedValue !== null) {
      return cachedValue;
    }

    const result = await fn(...args);
    await cache.set(cacheKey, result, ttl);

    return result;
  }) as T;
}

// 笔记本服务
export const notebookService = {
  // 获取所有笔记本（按用户）- 带缓存
  getAll: withCache(
    withErrorHandling(async (userId: string) => {
      return prisma.notebook.findMany({
        where: {
          userId,
          isArchived: false,
        },
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          _count: {
            select: {
              notes: true,
            },
          },
        },
      });
    }),
    (userId: string) => `notebooks:${userId}`,
    300 // 5 minutes
  ),

  // 获取单个笔记本 - 带缓存
  getById: withCache(
    withErrorHandling(async (id: string, userId: string) => {
      return prisma.notebook.findUnique({
        where: {
          id,
          userId,
        },
        include: {
          notes: {
            include: {
              tags: true,
              images: true,
            },
          },
          _count: {
            select: {
              notes: true,
            },
          },
        },
      });
    }),
    (id: string, userId: string) => `notebook:${id}:${userId}`,
    60 // 1 minute
  ),

  // 创建笔记本 - 清除相关缓存
  create: withErrorHandling(async (data: Prisma.NotebookCreateInput) => {
    const result = await prisma.notebook.create({
      data,
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    // 清除用户笔记本列表缓存
    await cache.delete(`notebooks:${data.userId}`);

    return result;
  }),

  // 更新笔记本 - 清除相关缓存
  update: withErrorHandling(async (id: string, data: Prisma.NotebookUpdateInput, userId: string) => {
    const result = await prisma.notebook.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });

    // 清除相关缓存
    await cache.delete(`notebook:${id}:${userId}`);
    await cache.delete(`notebooks:${userId}`);

    return result;
  }),

  // 删除笔记本 - 清除相关缓存
  delete: withErrorHandling(async (id: string, userId: string) => {
    const result = await prisma.notebook.delete({
      where: {
        id,
        userId,
      },
    });

    // 清除相关缓存
    await cache.delete(`notebook:${id}:${userId}`);
    await cache.delete(`notebooks:${userId}`);

    return result;
  }),

  // 归档笔记本 - 清除相关缓存
  archive: withErrorHandling(async (id: string, userId: string) => {
    const result = await prisma.notebook.update({
      where: {
        id,
        userId,
      },
      data: {
        isArchived: true,
      },
    });

    // 清除相关缓存
    await cache.delete(`notebook:${id}:${userId}`);
    await cache.delete(`notebooks:${userId}`);

    return result;
  }),
};

// 笔记服务
export const noteService = {
  // 获取所有笔记（按用户）
  getAll: withErrorHandling(async (userId: string) => {
    return prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        tags: true,
        images: true,
        notebook: true,
      },
    });
  }),

  // 获取单个笔记
  getById: withErrorHandling(async (id: string, userId: string) => {
    return prisma.note.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        tags: true,
        images: true,
        notebook: true,
      },
    });
  }),

  // 获取笔记本中的笔记
  getByNotebookId: withErrorHandling(async (notebookId: string, userId: string) => {
    return prisma.note.findMany({
      where: {
        notebookId,
        userId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        tags: true,
        images: true,
      },
    });
  }),

  // 创建笔记
  create: withErrorHandling(async (data: Prisma.NoteCreateInput) => {
    return prisma.note.create({
      data,
      include: {
        tags: true,
        images: true,
        notebook: true,
      },
    });
  }),

  // 更新笔记
  update: withErrorHandling(async (id: string, data: Prisma.NoteUpdateInput, userId: string) => {
    return prisma.note.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        tags: true,
        images: true,
        notebook: true,
      },
    });
  }),

  // 删除笔记
  delete: withErrorHandling(async (id: string, userId: string) => {
    return prisma.note.delete({
      where: {
        id,
        userId,
      },
    });
  }),

  // 软删除笔记
  softDelete: withErrorHandling(async (id: string, userId: string) => {
    return prisma.note.update({
      where: {
        id,
        userId,
      },
      data: {
        isDraft: true,
      },
    });
  }),

  // 搜索笔记
  search: withErrorHandling(async (query: string, userId: string) => {
    return prisma.note.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            contentPlain: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        tags: true,
        images: true,
        notebook: true,
      },
    });
  }),
};

// 标签服务
export const tagService = {
  // 获取用户所有标签
  getAll: withErrorHandling(async (userId: string) => {
    return prisma.tag.findMany({
      where: {
        userId,
      },
      orderBy: {
        usageCount: "desc",
      },
    });
  }),

  // 获取标签
  getById: withErrorHandling(async (id: string, userId: string) => {
    return prisma.tag.findUnique({
      where: {
        id,
        userId,
      },
    });
  }),

  // 创建标签
  create: withErrorHandling(async (data: Prisma.TagCreateInput) => {
    return prisma.tag.create({
      data,
    });
  }),

  // 更新标签
  update: withErrorHandling(async (id: string, data: Prisma.TagUpdateInput, userId: string) => {
    return prisma.tag.update({
      where: {
        id,
        userId,
      },
      data,
    });
  }),

  // 删除标签
  delete: withErrorHandling(async (id: string, userId: string) => {
    return prisma.tag.delete({
      where: {
        id,
        userId,
      },
    });
  }),

  // 增加标签使用次数
  incrementUsage: withErrorHandling(async (id: string, userId: string) => {
    return prisma.tag.update({
      where: {
        id,
        userId,
      },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }),
};

// 图片服务
export const imageService = {
  // 获取图片
  getById: withErrorHandling(async (id: string, userId: string) => {
    return prisma.image.findUnique({
      where: {
        id,
        userId,
      },
    });
  }),

  // 创建图片
  create: withErrorHandling(async (data: Prisma.ImageCreateInput) => {
    return prisma.image.create({
      data,
    });
  }),

  // 更新图片
  update: withErrorHandling(async (id: string, data: Prisma.ImageUpdateInput, userId: string) => {
    return prisma.image.update({
      where: {
        id,
        userId,
      },
      data,
    });
  }),

  // 删除图片
  delete: withErrorHandling(async (id: string, userId: string) => {
    return prisma.image.delete({
      where: {
        id,
        userId,
      },
    });
  }),
};

// 用户服务
export const userService = {
  // 获取用户
  getById: withErrorHandling(async (id: string) => {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        notebooks: {
          include: {
            _count: {
              select: {
                notes: true,
              },
            },
          },
        },
        notes: true,
        tags: true,
      },
    });
  }),

  // 获取用户 by email
  getByEmail: withErrorHandling(async (email: string) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }),

  // 更新用户
  update: withErrorHandling(async (id: string, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }),
};

// 导出 Prisma 客户端（供其他模块使用）
export { prisma };