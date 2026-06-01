"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronRightIcon, GlobeIcon } from "lucide-react"
import { getJsonType, formatCellValue } from "../utils"

export function SchemaTreeNode({
  field,
  value,
  depth = 0,
  path,
  draggableFields = false,
  onFieldDragStart,
}: {
  field: string
  value: unknown
  depth?: number
  path?: string
  draggableFields?: boolean
  onFieldDragStart?: (path: string) => void
}) {
  const type = getJsonType(value)
  const isExpandable =
    type === "object"
      ? Object.keys((value ?? {}) as Record<string, unknown>).length > 0
      : type === "array"
        ? (value as unknown[]).length > 0
        : false
  const [expanded, setExpanded] = React.useState(true)

  const valueText =
    type === "object"
      ? ""
      : type === "array"
        ? `${(value as unknown[]).length} item(s)`
        : formatCellValue(value)

  const children: Array<[string, unknown]> =
    type === "object"
      ? Object.entries((value ?? {}) as Record<string, unknown>)
      : type === "array"
        ? (value as unknown[]).map(
            (item, index) => [`[${index}]`, item] as [string, unknown]
          )
        : []

  return (
    <div>
      <div
        className="flex min-h-8 items-center justify-between px-2 py-1 text-sm hover:bg-muted/20"
        style={{ paddingLeft: `${depth * 18 + 6}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isExpandable ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronRightIcon className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="inline-block h-4 w-4" />
          )}
          {schemaTypeBadge(value)}
          <span
            className={`text-sm font-medium text-foreground ${draggableFields && path ? "cursor-grab active:cursor-grabbing" : ""}`}
            draggable={Boolean(draggableFields && path)}
            onDragStart={(event) => {
              if (!draggableFields || !path || !onFieldDragStart) return
              event.dataTransfer.setData("text/plain", path)
              onFieldDragStart(path)
            }}
          >
            {field}
          </span>
        </div>
        <span className="ml-4 max-w-[55%] truncate text-sm text-muted-foreground">
          {valueText}
        </span>
      </div>

      {isExpandable && expanded && (
        <div>
          {children.map(([childField, childValue]) => (
            <SchemaTreeNode
              key={`${field}-${childField}-${depth}`}
              field={childField}
              value={childValue}
              depth={depth + 1}
              path={path ? `${path}.${childField}` : childField}
              draggableFields={draggableFields}
              onFieldDragStart={onFieldDragStart}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function schemaTypeBadge(value: unknown) {
  const type = getJsonType(value)
  if (type === "object" || type === "array") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-[10px] text-muted-foreground">
        <GlobeIcon className="h-3 w-3" />
      </span>
    )
  }
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-[10px] font-medium text-muted-foreground">
      T
    </span>
  )
}
