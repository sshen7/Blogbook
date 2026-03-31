"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: (password: string) => boolean;
  onSetPassword?: (password: string) => void;
  isPasswordSet?: boolean;
}

export function LockScreen({
  isLocked,
  onUnlock,
  onSetPassword,
  isPasswordSet = true,
}: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(password);
    if (success) {
      setPassword("");
      toast.success("已解锁");
    } else {
      toast.error("密码错误");
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast.error("密码至少需要4位");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    onSetPassword?.(password);
    setPassword("");
    setConfirmPassword("");
    setIsSettingPassword(false);
    toast.success("密码设置成功");
  };

  if (!isLocked && !isSettingPassword) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            {isLocked ? (
              <Lock className="w-8 h-8 text-accent" />
            ) : (
              <BookOpen className="w-8 h-8 text-accent" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLocked ? "屏幕已锁定" : "设置锁屏密码"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLocked
              ? "输入密码解锁继续编辑"
              : "设置密码后，离开页面将自动锁定"}
          </p>
        </div>

        {isLocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-11">
              <Unlock className="w-4 h-4 mr-2" />
              解锁
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">设置密码</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="至少4位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setIsSettingPassword(false)}
              >
                取消
              </Button>
              <Button type="submit" className="flex-1 h-11">
                设置
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
