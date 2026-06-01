import * as React from "react"
import { Table as TableIcon, Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export default function DataTablesPage() {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/5">
      <div className="rounded-full bg-muted p-3">
        <TableIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold">No data tables found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Create structured data tables for your automated processes
        </p>
      </div>
      <Button
        variant="outline"
        className="h-9 gap-2 border-border px-4 text-xs transition-colors hover:border-primary/50"
      >
        <Plus className="size-3.5" />
        Create table
      </Button>
    </div>
  )
}
