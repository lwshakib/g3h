import * as React from "react"
import { Brackets, Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export default function VariablesPage() {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/5">
      <div className="rounded-full bg-muted p-3">
        <Brackets className="size-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold">No variables found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Define global environment variables for your workflows
        </p>
      </div>
      <Button
        variant="outline"
        className="h-9 gap-2 border-border px-4 text-xs transition-colors hover:border-primary/50"
      >
        <Plus className="size-3.5" />
        Add variable
      </Button>
    </div>
  )
}
