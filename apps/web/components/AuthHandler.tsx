"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Utility function to set session cookie
 */
const setSessionCookie = (value: string, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `axonix_session_token=${value}${expires}; path=/; SameSite=Lax`;
};

function AuthHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Set the session cookie
      setSessionCookie(token);

      // 2. Clean the URL (remove token from history)
      // We use router.replace to the current pathname to strip query params
      router.replace(pathname);
    }
  }, [searchParams, pathname, router]);

  return null;
}

export function AuthHandler() {
  return (
    <Suspense fallback={null}>
      <AuthHandlerContent />
    </Suspense>
  );
}
