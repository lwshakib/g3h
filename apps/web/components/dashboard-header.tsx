"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

const actions = [
  { label: "Create workflow", href: "/home/workflows" },
  { label: "Create credential", href: "/home/credentials" },
  { label: "Create variable", href: "/home/variables" },
  { label: "Create data table", href: "/home/data-tables" },
]

const getSessionToken = () => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; axonix_session_token=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null
  return null
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCreating, setIsCreating] = React.useState(false)

  // Find current action based on path
  const currentAction =
    actions.find((a) => pathname.includes(a.href)) ?? actions[0]!
  const otherActions = actions.filter((a) => a.label !== currentAction.label)

  const createWorkflow = async () => {
    if (isCreating) return
    const token = getSessionToken()
    if (!token) return

    try {
      setIsCreating(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: "My Workflow" }),
        }
      )

      if (!response.ok) {
        throw new Error("Create workflow failed")
      }

      const payload = await response.json()

      if (typeof window !== "undefined" && payload?.workflow) {
        window.dispatchEvent(
          new CustomEvent("workflow:created", {
            detail: payload.workflow,
          })
        )
      }

      const createdWorkflowId = payload?.workflow?.id as string | undefined
      if (createdWorkflowId) {
        router.push(`/workflow/${createdWorkflowId}`)
      } else if (!pathname.includes("/home/workflows")) {
        router.push("/home/workflows")
      }
    } catch (error) {
      console.error("[DashboardHeader] Failed to create workflow:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleMainAction = () => {
    if (currentAction.href === "/home/workflows") {
      void createWorkflow()
    } else {
      toast.info(`${currentAction.label} is not implemented yet.`)
    }
  }

  const handleDropdownAction = (action: (typeof actions)[number]) => {
    if (action.href === "/home/workflows") {
      void createWorkflow()
    } else {
      router.push(action.href)
      setTimeout(() => {
        toast.info(`${action.label} is not implemented yet.`)
      }, 300)
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All the workflows, credentials and data tables you have access to
        </p>
      </div>

      <div className="flex items-center rounded-lg bg-transparent shadow-xs">
        <Button
          variant="default"
          className="h-10 rounded-l-lg rounded-r-none border-0 px-4 text-xs font-semibold whitespace-nowrap data-[state=open]:bg-primary/80"
          onClick={handleMainAction}
          disabled={isCreating && currentAction.href === "/home/workflows"}
        >
          {currentAction.label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="h-10 w-10 rounded-l-none rounded-r-lg border-0 px-0 data-[state=open]:bg-primary/80"
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {otherActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                className="cursor-pointer"
                onClick={() => handleDropdownAction(action)}
              >
                <Plus className="mr-2 size-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
