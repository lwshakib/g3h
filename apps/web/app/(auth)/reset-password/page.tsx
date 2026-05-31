"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Security mismatch: Missing override token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Integrity check failed: Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Security mismatch: Password must be at least 8 characters.");
      return;
    }

    await authClient.resetPassword(
      { newPassword: password, token },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Security keys successfully overridden.");
          router.push("/sign-in?reset=true");
        },
        onError: (ctx) => {
          toast.error(`Override Failed: ${ctx.error.message}`);
          setLoading(false);
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="w-full space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-destructive">Invalid Link Sequence</h1>
        <p className="text-sm text-muted-foreground font-sans">
          No secure override token detected in the link url.
        </p>
        <Button 
          asChild
          className="w-full"
        >
          <Link href="/forgot-password">
            Request Reset Link
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/sign-in" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground font-display flex items-center gap-3">
          <Lock className="w-8 h-8 text-primary opacity-80" />
          <span>Set New Password</span>
        </h1>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          Inject new security credentials to restore secure workspace access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground">New Password*</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground">Confirm Password*</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Injecting...
            </span>
          ) : (
            <span>Confirm Reset</span>
          )}
        </Button>
      </form>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="w-full flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
