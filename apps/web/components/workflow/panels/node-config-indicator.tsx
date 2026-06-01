"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleXIcon,
  Loader2Icon,
} from "lucide-react"
import type { NodeRunStatus } from "../types"

export function NodeConfigIndicator({
  configured,
  runStatus,
}: {
  configured: boolean
  runStatus: NodeRunStatus
}) {
  if (runStatus === "loading") {
    return (
      <Loader2Icon
        className="pointer-events-none absolute right-2 bottom-2 z-30 h-4 w-4 animate-spin text-[#2a43e9]"
        aria-hidden="true"
      />
    )
  }

  if (runStatus === "success") {
    return (
      <CheckCircle2Icon
        className="pointer-events-none absolute right-2 bottom-2 z-30 h-4 w-4 text-emerald-500"
        aria-hidden="true"
      />
    )
  }

  if (runStatus === "error") {
    return (
      <CircleXIcon
        className="pointer-events-none absolute right-2 bottom-2 z-30 h-4 w-4 text-red-500"
        aria-hidden="true"
      />
    )
  }

  if (configured) return null

  return (
    <AlertTriangleIcon
      className="pointer-events-none absolute right-2 bottom-2 z-30 h-4 w-4 text-red-500"
      aria-hidden="true"
    />
  )
}
