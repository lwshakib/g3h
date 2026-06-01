"use client"

import * as React from "react"
import type { NodeRunStatus } from "../types"

export function NodeStatusBorder({ status }: { status: NodeRunStatus }) {
  if (status === "initial") return null

  if (status === "loading") {
    return (
      <>
        <style>
          {`
            @keyframes workflow-node-border-spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .workflow-node-border-spinner {
              animation: workflow-node-border-spin 2s linear infinite;
              position: absolute;
              left: 50%;
              top: 50%;
              width: 140%;
              aspect-ratio: 1;
              transform-origin: center;
            }
          `}
        </style>
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-background" />
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] overflow-hidden rounded-[30px]">
          <div className="workflow-node-border-spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgb(42,67,233)_0deg,rgba(42,138,246,0)_360deg)]" />
        </div>
      </>
    )
  }

  if (status === "success") {
    return (
      <>
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-background" />
        <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] border-[3px] border-emerald-600/60" />
      </>
    )
  }

  return (
    <>
      <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] bg-background" />
      <div className="pointer-events-none absolute -top-1.5 -left-1.5 -z-10 h-[calc(100%+12px)] w-[calc(100%+12px)] rounded-[30px] border-[3px] border-red-600/60" />
    </>
  )
}
