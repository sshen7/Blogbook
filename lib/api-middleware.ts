import { NextRequest, NextResponse } from "next/server";

// 统一错误处理中间件
export function withErrorHandler(fn: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await fn(req);
    } catch (error) {
      console.error("API 错误:", error);

      // 根据错误类型返回不同的响应
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "数据验证失败",
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      // 服务器错误
      return NextResponse.json(
        { error: "服务器内部错误" },
        { status: 500 }
      );
    }
  };
}

// 认证错误类
export class AuthError extends Error {
  constructor(message: string = "未授权") {
    super(message);
    this.name = "AuthError";
  }
}

// 禁止访问错误类
export class ForbiddenError extends Error {
  constructor(message: string = "禁止访问") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// 未找到错误类
export class NotFoundError extends Error {
  constructor(message: string = "资源未找到") {
    super(message);
    this.name = "NotFoundError";
  }
}

// 统一 API 响应格式
export function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function createApiError(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

// 认证中间件
export async function withAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthError();
  }
  return session;
}

// 权限检查中间件
export async function withPermission(req: NextRequest, checkPermission: (user: any) => boolean) {
  const session = await withAuth(req);
  if (!checkPermission(session.user)) {
    throw new ForbiddenError();
  }
  return session;
}

// 资源存在检查中间件
export async function withResource<T>(
  req: NextRequest,
  getResource: (id: string, userId: string) => Promise<T | null>,
  resourceIdParam: string = "id"
) {
  const session = await withAuth(req);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get(resourceIdParam);

  if (!id) {
    throw new NotFoundError("缺少资源ID");
  }

  const resource = await getResource(id, session.user.id);
  if (!resource) {
    throw new NotFoundError("资源不存在");
  }

  return { resource, session };
}