"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import { type nodeOptions } from "./types"

interface NodeSelectorDrawerProps {
  selectorOpen: boolean
  selectorMode: "all" | "executions"
  searchQuery: string
  setSearchQuery: (query: string) => void
  hasAnyTrigger: boolean
  filteredTriggerNodeOptions: Array<(typeof nodeOptions)[number]>
  filteredExecutionNodeOptions: Array<(typeof nodeOptions)[number]>
  onClose: () => void
  onSelectOption: (option: (typeof nodeOptions)[number]) => void
}

export function NodeSelectorDrawer({
  selectorOpen,
  selectorMode,
  searchQuery,
  setSearchQuery,
  hasAnyTrigger,
  filteredTriggerNodeOptions,
  filteredExecutionNodeOptions,
  onClose,
  onSelectOption,
}: NodeSelectorDrawerProps) {
  if (!selectorOpen) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close node selector"
        className="absolute inset-0 z-20 cursor-default bg-transparent"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-semibold">
              {selectorMode === "executions"
                ? "Add execution step"
                : "What triggers this workflow?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectorMode === "executions"
                ? "Select an execution to continue this workflow."
                : "A trigger is a step that starts your workflow."}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </div>

        <div className="space-y-1 p-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="mb-2"
          />
          {selectorMode === "all" && (
            <>
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                Triggers
              </p>
              {filteredTriggerNodeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.type}
                    onClick={() => onSelectOption(option)}
                    className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                  >
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                )
              })}
              <Separator />
            </>
          )}

          {(selectorMode === "executions" || hasAnyTrigger) && (
            <p className="px-3 pt-1 pb-1 text-xs font-medium text-muted-foreground">
              Executions
            </p>
          )}
          {(selectorMode === "executions" || hasAnyTrigger) &&
            filteredExecutionNodeOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.type}
                  onClick={() => onSelectOption(option)}
                  className="flex w-full items-start gap-3 p-3 text-left transition-colors hover:border-l-2 hover:border-l-primary hover:bg-accent/40"
                >
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </button>
              )
            })}
          <Separator />
        </div>
      </aside>
    </>
  )
}
