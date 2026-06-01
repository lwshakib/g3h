import * as React from "react"
import { HelpCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

const stats = [
  { label: "Prod. executions", value: "0" },
  { label: "Failed prod. executions", value: "0" },
  { label: "Failure rate", value: "0%" },
  {
    label: "Time saved",
    value: "--",
    info: "Statistical estimation of time saved",
  },
  { label: "Run time (avg.)", value: "0s" },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 px-6 py-2 md:grid-cols-3 lg:grid-cols-5">
      <TooltipProvider>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer border-muted-foreground/10 bg-muted/10 shadow-none transition-all hover:bg-muted/20"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                {stat.label}
              </CardTitle>
              {stat.info && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="size-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-[10px]">{stat.info}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </TooltipProvider>
    </div>
  )
}
