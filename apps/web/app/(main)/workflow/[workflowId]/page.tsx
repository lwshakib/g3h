"use client"

import * as React from "react"

type WorkflowPageProps = {
  params: Promise<{ workflowId: string }>
}

type WorkflowItem = {
  id: string
  name: string
}

const getSessionToken = () => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; axonix_session_token=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null
  return null
}

export default function WorkflowByIdPage({ params }: WorkflowPageProps) {
  const { workflowId } = React.use(params)
  const [workflowName, setWorkflowName] = React.useState<string>(workflowId)

  React.useEffect(() => {
    const run = async () => {
      const token = getSessionToken()
      if (!token) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) return
        const payload = await response.json()
        const workflows: WorkflowItem[] = payload.workflows ?? []
        const current = workflows.find((item) => item.id === workflowId)
        if (current?.name) {
          setWorkflowName(current.name)
        }
      } catch (error) {
        console.error("[WorkflowPage] Failed to resolve workflow name:", error)
      }
    }

    void run()
  }, [workflowId])

  return (
    <div className="space-y-4">
      <header className="border-b border-muted-foreground/10 pb-3">
        <h1 className="text-xl font-semibold">{workflowName}</h1>
      </header>
      <p className="text-sm text-muted-foreground">{workflowId}</p>
    </div>
  )
}
