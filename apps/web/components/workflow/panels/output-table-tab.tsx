"use client"

import { getJsonType, formatCellValue } from "../utils"

export function OutputTableTab({
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
        Output is not valid JSON yet. Run the workflow to view table data.
      </div>
    )
  }

  const rows = Array.isArray(parsedOutput)
    ? parsedOutput
    : getJsonType(parsedOutput) === "object"
      ? [parsedOutput]
      : [{ value: parsedOutput }]

  const objectRows = rows.map((row) =>
    getJsonType(row) === "object"
      ? (row as Record<string, unknown>)
      : ({ value: row } as Record<string, unknown>)
  )

  const columns = Array.from(
    objectRows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key))
      return keys
    }, new Set<string>())
  )

  return (
    <div className="h-full overflow-auto rounded-md bg-background/40">
      <table className="min-w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-muted/30">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className={`border-r border-b border-border px-3 py-2 text-left font-semibold text-foreground ${draggableFields ? "cursor-grab active:cursor-grabbing" : ""}`}
                draggable={draggableFields}
                onDragStart={(event) => {
                  if (!draggableFields || !onFieldDragStart) return
                  event.dataTransfer.setData("text/plain", column)
                  onFieldDragStart(column)
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {objectRows.map((row, index) => (
            <tr key={`output-row-${index}`} className="align-top">
              {columns.map((column) => (
                <td
                  key={`${index}-${column}`}
                  className="border-r border-b border-border px-3 py-2 text-muted-foreground"
                >
                  <div className="max-w-[300px] break-words">
                    {formatCellValue(row[column])}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
