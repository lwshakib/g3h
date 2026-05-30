"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.35 12.24c0-.72-.06-1.25-.19-1.8H12v3.48h5.38c-.11.87-.72 2.18-2.08 3.06l-.02.12 3.03 2.35.21.02c1.92-1.77 3.03-4.38 3.03-7.23Z" fill="#4285F4"/>
      <path d="M12 21.75c2.64 0 4.85-.87 6.47-2.37l-3.08-2.39c-.82.57-1.93.96-3.39.96-2.59 0-4.79-1.71-5.57-4.08l-.11.01-3.15 2.44-.04.11c1.61 3.18 4.9 5.32 8.87 5.32Z" fill="#34A853"/>
      <path d="M6.43 13.87A5.97 5.97 0 0 1 6.1 12c0-.65.12-1.28.32-1.87l-.01-.13-3.19-2.48-.1.05A9.74 9.74 0 0 0 2.25 12c0 1.58.38 3.07 1.06 4.43l3.12-2.56Z" fill="#FBBC05"/>
      <path d="M12 6.04c1.84 0 3.08.8 3.79 1.47l2.77-2.7C16.84 3.23 14.64 2.25 12 2.25 8.03 2.25 4.74 4.39 3.13 7.57l3.3 2.56C7.22 7.75 9.41 6.04 12 6.04Z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.24.78-.54 0-.27-.01-1.15-.01-2.09-3.19.69-3.86-1.35-3.86-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.28 1.17-3.08-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.14 1.17a10.86 10.86 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.6.23 2.78.11 3.07.73.8 1.17 1.83 1.17 3.08 0 4.41-2.69 5.38-5.25 5.66.41.35.78 1.03.78 2.09 0 1.5-.01 2.7-.01 3.06 0 .3.2.65.79.54A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
    </svg>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await authClient.signUp.email(
      {
        name,
        email,
        password,
        callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/home/workflows`,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Registration successful");
          router.push("/sign-in");
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground font-display">Create Account</h1>
        <p className="text-sm text-muted-foreground font-sans">
          Get started today! Select method to register:
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={async () => {
              await authClient.signIn.social({
                provider: "google",
                callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/home/workflows`,
              });
            }}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-border bg-background py-3 text-xs font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors text-center rounded-xl cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button 
            onClick={async () => {
              await authClient.signIn.social({
                provider: "github",
                callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/home/workflows`,
              });
            }}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 border border-border bg-background py-3 text-xs font-semibold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors text-center rounded-xl cursor-pointer disabled:opacity-50"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border"></div>
          <span className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-muted-foreground">Or continue with Email</span>
          <div className="h-px flex-1 bg-border"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name*</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address*</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password*</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password*</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border px-10 py-3 text-sm rounded-xl transition-colors focus:border-primary focus:outline-hidden disabled:opacity-50"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black py-4 transition-all duration-300 font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center font-medium">
          Already have an account? <Link href="/sign-in" className="text-primary hover:text-primary/80 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
