"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoLockOptions {
  enabled?: boolean;
  timeout?: number; // milliseconds
  onLock?: () => void;
  onUnlock?: () => void;
}

export function useAutoLock(options: UseAutoLockOptions = {}) {
  const { enabled = true, timeout = 5 * 60 * 1000, onLock, onUnlock } = options;
  
  const [isLocked, setIsLocked] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const lock = useCallback(() => {
    if (isPasswordSet && !isLocked) {
      setIsLocked(true);
      onLock?.();
    }
  }, [isPasswordSet, isLocked, onLock]);

  const unlock = useCallback((password: string, storedHash: string) => {
    // Simple hash comparison (in production, use bcrypt)
    const hash = btoa(password); // Simplified for demo
    if (hash === storedHash) {
      setIsLocked(false);
      lastActivityRef.current = Date.now();
      onUnlock?.();
      return true;
    }
    return false;
  }, [onUnlock]);

  const setPassword = useCallback((password: string) => {
    const hash = btoa(password); // Simplified for demo
    localStorage.setItem("zine_lock_password", hash);
    setIsPasswordSet(true);
    return hash;
  }, []);

  const clearPassword = useCallback(() => {
    localStorage.removeItem("zine_lock_password");
    setIsPasswordSet(false);
    setIsLocked(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    lastActivityRef.current = Date.now();
    
    if (enabled && isPasswordSet && !isLocked) {
      timerRef.current = setTimeout(() => {
        lock();
      }, timeout);
    }
  }, [enabled, isPasswordSet, isLocked, timeout, lock]);

  const checkPassword = useCallback((inputPassword: string, storedHash: string): boolean => {
    const hash = btoa(inputPassword);
    return hash === storedHash;
  }, []);

  // Check if password is set on mount
  useEffect(() => {
    const storedPassword = localStorage.getItem("zine_lock_password");
    setIsPasswordSet(!!storedPassword);
  }, []);

  // Activity listeners
  useEffect(() => {
    if (!enabled || !isPasswordSet) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, isPasswordSet, resetTimer]);

  // Visibility change listener (lock when tab is hidden)
  useEffect(() => {
    if (!enabled || !isPasswordSet) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Lock immediately when tab is hidden (optional behavior)
        // lock();
      } else {
        resetTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, isPasswordSet, lock, resetTimer]);

  return {
    isLocked,
    isPasswordSet,
    lock,
    unlock,
    setPassword,
    clearPassword,
    resetTimer,
    checkPassword,
  };
}
