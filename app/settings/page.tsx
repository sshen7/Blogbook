"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  Moon,
  Type,
  Shield,
  LogOut,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAutoLock } from "@/hooks/use-auto-lock";
import { LockScreen } from "@/components/lock-screen";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Auto lock settings
  const {
    isLocked,
    isPasswordSet,
    unlock,
    setPassword,
    clearPassword,
  } = useAutoLock({
    enabled: false, // We'll handle this manually in settings
    timeout: 5 * 60 * 1000,
  });

  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  const [lockTimeout, setLockTimeout] = useState("5");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Load user settings
    const storedAutoLock = localStorage.getItem("zine_auto_lock_enabled");
    const storedTimeout = localStorage.getItem("zine_lock_timeout");
    
    if (storedAutoLock) {
      setAutoLockEnabled(storedAutoLock === "true");
    }
    if (storedTimeout) {
      setLockTimeout(storedTimeout);
    }
  }, []);

  const handleAutoLockToggle = (enabled: boolean) => {
    setAutoLockEnabled(enabled);
    localStorage.setItem("zine_auto_lock_enabled", enabled.toString());
    
    if (enabled && !isPasswordSet) {
      // Prompt to set password
      toast.info("请先设置锁屏密码");
    } else if (!enabled) {
      toast.success("自动锁屏已关闭");
    }
  };

  const handleTimeoutChange = (value: string) => {
    setLockTimeout(value);
    localStorage.setItem("zine_lock_timeout", value);
    toast.success("锁屏时间已更新");
  };

  const handleSetPassword = () => {
    if (newPassword.length < 4) {
      toast.error("密码至少需要4位");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }
    
    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    toast.success("锁屏密码设置成功");
  };

  const handleClearPassword = () => {
    if (confirm("确定要清除锁屏密码吗？")) {
      clearPassword();
      setAutoLockEnabled(false);
      localStorage.setItem("zine_auto_lock_enabled", "false");
      toast.success("锁屏密码已清除");
    }
  };

  const handleUnlock = (password: string): boolean => {
    const storedHash = localStorage.getItem("zine_lock_password") || "";
    const hash = btoa(password);
    if (hash === storedHash) {
      unlock(password, storedHash);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Lock Screen Overlay */}
      <LockScreen
        isLocked={isLocked}
        onUnlock={handleUnlock}
        isPasswordSet={isPasswordSet}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">设置</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Security Section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              安全与隐私
            </h2>
            
            <div className="space-y-6 bg-card rounded-lg border p-6">
              {/* Auto Lock Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">自动锁屏</Label>
                  <p className="text-sm text-muted-foreground">
                    离开页面后自动锁定
                  </p>
                </div>
                <Switch
                  checked={autoLockEnabled}
                  onCheckedChange={handleAutoLockToggle}
                  disabled={!isPasswordSet}
                />
              </div>

              {/* Lock Timeout */}
              {autoLockEnabled && (
                <div className="space-y-2">
                  <Label>锁屏时间</Label>
                  <Select
                    value={lockTimeout}
                    onValueChange={handleTimeoutChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1分钟</SelectItem>
                      <SelectItem value="5">5分钟</SelectItem>
                      <SelectItem value="10">10分钟</SelectItem>
                      <SelectItem value="30">30分钟</SelectItem>
                      <SelectItem value="60">1小时</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Password Settings */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  锁屏密码
                </h3>

                {isPasswordSet ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      已设置锁屏密码
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleClearPassword}
                    >
                      清除密码
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>设置新密码</Label>
                      <Input
                        type="password"
                        placeholder="至少4位"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>确认密码</Label>
                      <Input
                        type="password"
                        placeholder="再次输入"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSetPassword}>
                      设置密码
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Moon className="h-4 w-4" />
              外观
            </h2>
            
            <div className="space-y-6 bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">深色模式</Label>
                  <p className="text-sm text-muted-foreground">
                    切换深色/浅色主题
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label>默认字体大小</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">小</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="large">大</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              账号
            </h2>
            
            <div className="space-y-6 bg-card rounded-lg border p-6">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
