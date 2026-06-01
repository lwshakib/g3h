"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

const tabs = [
  { name: "Workflows", href: "/home/workflows" },
  { name: "Credentials", href: "/home/credentials" },
  { name: "Executions", href: "/home/executions" },
  { name: "Variables", href: "/home/variables" },
  { name: "Data tables", href: "/home/data-tables" },
]

export function DashboardTabs() {
  const pathname = usePathname()

  return (
    <div className="mt-8 flex h-12 items-center space-x-8 border-b border-muted-foreground/10 px-6">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href === "/home/workflows" && pathname === "/home")

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "relative flex h-full items-center border-b-2 px-1 text-sm font-medium transition-all",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}
