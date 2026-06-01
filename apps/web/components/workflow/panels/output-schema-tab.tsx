"use client"

import { SchemaTreeNode } from "./schema-tree-node"
import { getJsonType } from "../utils"

export function OutputSchemaTab({
  parsedOutput,
  draggableFields = false,
  onFieldDragStart,
}: {
  parsedOutput: unknown | null
  draggableFields?: boolean
  onFieldDragStart?: (path: string) => void
}) {
  if (parsedOutput === null) {
    return (
      <div className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        Output is not valid JSON yet. Run the workflow to view schema.
      </div>
    )
  }

  const isArrayOutput = Array.isArray(parsedOutput)
  const isObjectOutput =
    !isArrayOutput && getJsonType(parsedOutput) === "object"

  if (isArrayOutput) {
    return (
      <div className="h-full overflow-auto rounded-md bg-background/40 py-1">
        {(parsedOutput as unknown[]).map((item, index) => (
          <SchemaTreeNode
            key={`schema-array-item-${index}`}
            field={`[${index}]`}
            value={item}
            path={`[${index}]`}
            draggableFields={draggableFields}
            onFieldDragStart={onFieldDragStart}
          />
        ))}
      </div>
    )
  }

  if (isObjectOutput) {
    return (
      <div className="h-full overflow-auto rounded-md bg-background/40 py-1">
        {Object.entries(parsedOutput as Record<string, unknown>).map(
          ([field, value]) => (
            <SchemaTreeNode
              key={`schema-object-field-${field}`}
              field={field}
              value={value}
              depth={0}
              path={field}
              draggableFields={draggableFields}
              onFieldDragStart={onFieldDragStart}
            />
          )
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto rounded-md bg-background/40 py-1">
      <SchemaTreeNode
        field="value"
        value={parsedOutput}
        path="value"
        draggableFields={draggableFields}
        onFieldDragStart={onFieldDragStart}
      />
    </div>
  )
}
