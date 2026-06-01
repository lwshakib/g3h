"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, XCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

/**
 * Handle Verification Protocol Core
 */
function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [message, setMessage] = useState("Synchronizing identity protocol...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Security Protocol Mismatch: Missing verification token.")
      return
    }

    const triggerVerification = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/auth"}/verify-email?token=${token}`
        )
        if (response.ok) {
          setStatus("success")
          setMessage("Identity Protocol Verified. Initializing redirection...")
          toast.success("Identity Sequence Synchronized Successfully.")
          setTimeout(() => {
            router.push("/sign-in?verified=true")
          }, 3000)
        } else {
          const data = await response.json()
          throw new Error(data.message || "Security Access Denied.")
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message)
        toast.error(`Verification Sequence Failed: ${error.message}`)
      }
    }

    triggerVerification()
  }, [token, router])

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <div className="relative">
        {status === "loading" && (
          <div className="flex h-20 w-20 animate-spin items-center justify-center rounded-full border-2 border-primary/20">
            <Loader2 className="h-10 w-10 text-primary" />
          </div>
        )}
        {status === "success" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        )}
        {status === "error" && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive bg-destructive/10">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Verification Status
        </h1>
        <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>

      {status === "error" && (
        <Button onClick={() => router.push("/sign-up")} className="w-full">
          Return to Sign Up
        </Button>
      )}
    </div>
  )
}

/**
 * Loading state for Suspense
 */
function VerifyLoading() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  )
}
