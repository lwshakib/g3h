"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  CheckCircle2Icon,
  InfoIcon,
  SearchIcon,
  PencilIcon,
} from "lucide-react"
import { OutputSchemaTab } from "./output-schema-tab"
import { OutputTableTab } from "./output-table-tab"
import { OutputErrorDetails } from "./output-error-details"
import { getOutputItemCount } from "../utils"

export function OutputTabsPanel({
  parsedOutput,
  prettyJsonOutput,
  hasOutput,
  isExecuting,
  onExecuteStep,
  errorDetails,
}: {
  parsedOutput: unknown | null
  prettyJsonOutput: string
  hasOutput: boolean
  isExecuting: boolean
  onExecuteStep: (targetNodeId?: string) => void
  errorDetails?: {
    source?: string
    code?: number
    fullMessage?: string
    request?: {
      method?: string
      url?: string
      headers?: Record<string, string>
      body?: string | null
    }
  }
}) {
  const [activeTab, setActiveTab] = React.useState("schema")
  const itemCount = getOutputItemCount(parsedOutput)

  if (errorDetails) {
    return <OutputErrorDetails details={errorDetails} />
  }

  if (!hasOutput) {
    return (
      <div className="flex h-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-4">
        <Button onClick={() => onExecuteStep()} disabled={isExecuting}>
          {isExecuting ? "Running..." : "Execute step"}
        </Button>
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="h-full min-w-0 overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="flex min-w-0 items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-[0.18em] text-foreground/80">
            OUTPUT
          </span>
          <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <button
            type="button"
            aria-label="Search output"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <SearchIcon className="h-3.5 w-3.5" />
          </button>
          <TabsList className="h-8 rounded-md bg-muted p-0.5">
            <TabsTrigger value="schema" className="h-7 px-3 text-xs">
              Schema
            </TabsTrigger>
            <TabsTrigger value="table" className="h-7 px-3 text-xs">
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="h-7 px-3 text-xs">
              JSON
            </TabsTrigger>
          </TabsList>
          <button
            type="button"
            aria-label="Edit output"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </div>

      <div className="h-[calc(100%-74px)] min-w-0 overflow-hidden p-2">
        <TabsContent
          value="schema"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <OutputSchemaTab parsedOutput={parsedOutput} />
        </TabsContent>
        <TabsContent
          value="table"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <OutputTableTab parsedOutput={parsedOutput} />
        </TabsContent>
        <TabsContent
          value="json"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <div className="h-full overflow-auto rounded-md bg-background/40 p-3 font-mono text-xs text-foreground">
            <pre className="max-w-full break-words whitespace-pre-wrap">
              {prettyJsonOutput || "{}"}
            </pre>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
