"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, XCircle, CheckCircle2 } from "lucide-react";

/**
 * Handle Verification Protocol Core
 */
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Synchronizing identity protocol...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Security Protocol Mismatch: Missing verification token.");
      return;
    }

    const triggerVerification = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/auth"}/verify-email?token=${token}`);
        if (response.ok) {
          setStatus("success");
          setMessage("Identity Protocol Verified. Initializing redirection...");
          toast.success("Identity Sequence Synchronized Successfully.");
          setTimeout(() => {
            router.push("/sign-in?verified=true");
          }, 3000);
        } else {
          const data = await response.json();
          throw new Error(data.message || "Security Access Denied.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message);
        toast.error(`Verification Sequence Failed: ${error.message}`);
      }
    };

    triggerVerification();
  }, [token, router]);

  return (
    <div className="w-full space-y-6 flex flex-col items-center justify-center text-center">
      <div className="relative">
        {status === "loading" && (
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center animate-spin">
            <Loader2 className="w-10 h-10 text-primary" />
          </div>
        )}
        {status === "success" && (
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
        )}
        {status === "error" && (
          <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground font-display">
          Verification Status
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-sans">
          {message}
        </p>
      </div>

      {status === "error" && (
        <button 
          onClick={() => router.push("/sign-up")}
          className="w-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black py-3.5 transition-all duration-300 font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Return to Sign Up
        </button>
      )}
    </div>
  );
}

/**
 * Loading state for Suspense
 */
function VerifyLoading() {
  return (
    <div className="w-full flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
       <VerifyContent />
    </Suspense>
  );
}
