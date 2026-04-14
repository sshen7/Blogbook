import * as React from "react";

interface LazyComponentProps {
  component: () => Promise<any>;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  fallback = null,
  loading = <div>加载中...</div>,
  error = <div>加载失败</div>,
}) => {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    component()
      .then((module) => {
        setComponent(() => module.default);
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [component]);

  if (isLoading) {
    return <>{loading}</>;
  }

  if (hasError) {
    return <>{error}</>;
  }

  if (!Component) {
    return <>{fallback}</>;
  }

  return <Component />;
};

// 预加载组件
export function preloadComponent(component: () => Promise<any>): void {
  component().catch(() => {
    // 忽略加载错误，只预加载
  });
}

// 延迟加载组件
export function lazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): T {
  const Component = React.lazy(factory);

  return ((props: React.ComponentProps<T>) => (
    <LazyComponent
      component={factory}
      fallback={<Component {...props} />}
    />
  )) as T;
}