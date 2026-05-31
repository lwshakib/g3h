"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Identity credentials required.");
      return;
    }

    await authClient.forgetPassword(
      { email },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: (data) => {
          toast.success("Recovery protocol initiated.");
          setSubmitted(true);
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(`Security Incident: ${ctx.error.message}`);
          setLoading(false);
        },
      }
    );
  };

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
          <ShieldAlert className="w-8 h-8 text-primary opacity-80" />
          <span>Reset Password</span>
        </h1>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          {submitted ? "Recovery link sent! Please check your inbox to activate your account." : "Enter your email address and we'll send you a verification link to reset your account."}
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground">Email Address*</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                placeholder="email@example.com"
                disabled={loading}
              />
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
                Sending Link...
              </span>
            ) : (
              <span>Send Reset Link</span>
            )}
          </Button>
        </form>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center">
          <p className="text-sm font-sans text-emerald-600 dark:text-emerald-400 mb-4">
            Recovery instructions sent to **{email}**. Please follow the link in your email to reset your password.
          </p>
          <Button
            asChild
            variant="outline"
          >
            <Link href="/sign-in">
              Go back
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
