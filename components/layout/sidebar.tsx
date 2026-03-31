"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Plus,
  Star,
  Inbox,
  Trash2,
  Tags,
  Settings,
  LogOut,
  Search,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "新建笔记",
    href: "/note/create",
    icon: Plus,
    variant: "default" as const,
  },
  {
    title: "搜索",
    href: "/search",
    icon: Search,
    variant: "ghost" as const,
  },
  {
    title: "我的书架",
    href: "/",
    icon: BookOpen,
    variant: "ghost" as const,
  },
  {
    title: "未分类",
    href: "/notes/drafts",
    icon: Inbox,
    variant: "ghost" as const,
  },
  {
    title: "星标",
    href: "/notes/starred",
    icon: Star,
    variant: "ghost" as const,
  },
  {
    title: "标签",
    href: "/tags",
    icon: Tags,
    variant: "ghost" as const,
  },
  {
    title: "回收站",
    href: "/trash",
    icon: Trash2,
    variant: "ghost" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", cursive' }}>BlogBook</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={item.variant}
                className={cn(
                  "justify-start gap-3 h-10 px-3",
                  pathname === item.href &&
                    item.variant === "ghost" &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="grid gap-1">
            <Button
              asChild
              variant="ghost"
              className="justify-start gap-3 h-10 px-3"
            >
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                设置
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-3 h-10 px-3 text-muted-foreground"
              onClick={() => window.location.href = "/login"}
            >
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
