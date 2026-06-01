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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { InfoIcon } from "lucide-react"
import { OutputSchemaTab } from "./output-schema-tab"
import { OutputTableTab } from "./output-table-tab"
import { getOutputItemCount } from "../utils"

export function InputTabsPanel({
  parsedInput,
  prettyJsonInput,
  hasInput,
  isExecuting,
  onExecutePreviousStep,
  previousNodeType,
  expressionFieldPaths,
}: {
  parsedInput: unknown | null
  prettyJsonInput: string
  hasInput: boolean
  isExecuting: boolean
  onExecutePreviousStep: () => void
  previousNodeType?: string
  expressionFieldPaths: string[]
}) {
  const [activeTab, setActiveTab] = React.useState("schema")
  const itemCount = getOutputItemCount(parsedInput)
  const isPreviousTrigger =
    previousNodeType === "manualTrigger" ||
    previousNodeType === "manual-trigger" ||
    previousNodeType === "webhookTrigger" ||
    previousNodeType === "webhook-trigger" ||
    previousNodeType === "scheduleTrigger" ||
    previousNodeType === "schedule-trigger"

  if (isPreviousTrigger) {
    return (
      <div className="h-full min-w-0 overflow-auto rounded-md border border-border bg-card p-3">
        <Accordion type="single" collapsible defaultValue="trigger-input">
          <AccordionItem value="trigger-input" className="border-border">
            <AccordionTrigger className="py-2 text-sm">
              When clicking "Execute workflow"
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              No fields. Node executed, but no items were sent from trigger
              output.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  if (!hasInput) {
    return (
      <div className="flex h-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-4">
        <Button onClick={onExecutePreviousStep} disabled={isExecuting}>
          {isExecuting ? "Running..." : "Execute previous step"}
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
            INPUT
          </span>
          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
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
      </div>

      <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </div>

      <div className="h-[calc(100%-74px)] min-w-0 overflow-hidden p-2">
        <TabsContent
          value="schema"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <OutputSchemaTab
            parsedOutput={parsedInput}
            draggableFields
            onFieldDragStart={() => {
              // No-op: drag data is set via dataTransfer.
            }}
          />
        </TabsContent>
        <TabsContent
          value="table"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <OutputTableTab
            parsedOutput={parsedInput}
            draggableFields
            onFieldDragStart={() => {
              // No-op: drag data is set via dataTransfer.
            }}
          />
        </TabsContent>
        <TabsContent
          value="json"
          className="mt-0 h-full min-w-0 overflow-hidden"
        >
          <div className="h-full overflow-auto rounded-md bg-background/40 p-3 font-mono text-xs text-foreground">
            {expressionFieldPaths.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5 border-b border-border pb-2">
                {expressionFieldPaths.map((path) => (
                  <span
                    key={`json-drag-${path}`}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", path)
                    }}
                    className="cursor-grab rounded border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground active:cursor-grabbing"
                  >
                    {path}
                  </span>
                ))}
              </div>
            )}
            <pre className="max-w-full break-words whitespace-pre-wrap">
              {prettyJsonInput || "{}"}
            </pre>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
