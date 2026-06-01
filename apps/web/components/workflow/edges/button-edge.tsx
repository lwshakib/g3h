"use client"

import * as React from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { Edge } from "@xyflow/react"
import { EdgeActionsContext } from "../contexts"

export function ButtonEdge({
  id,
  source,
  target,
  style,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps<Edge>) {
  const actions = React.useContext(EdgeActionsContext)
  const [isHovered, setIsHovered] = React.useState(false)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          className={`nodrag nopan absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ left: labelX, top: labelY }}
        >
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              type="button"
              onClick={(event) => {
                handleClick(event)
                actions?.onEdgeInsert(id, source, target)
              }}
              className="pointer-events-auto rounded-md border border-border bg-muted p-1 text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                handleClick(event)
                actions?.onEdgeDelete(id)
              }}
              className="pointer-events-auto rounded-md border border-border bg-muted p-1 text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
