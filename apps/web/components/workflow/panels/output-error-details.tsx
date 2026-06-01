"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

export function OutputErrorDetails({
  details,
}: {
  details: {
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
  return (
    <div className="h-full overflow-auto rounded-md border border-border bg-card p-3">
      <p className="mb-3 text-sm font-semibold text-foreground">
        Error details
      </p>
      <Accordion type="multiple" defaultValue={["source", "request"]}>
        <AccordionItem value="source" className="border-border">
          <AccordionTrigger className="py-2 text-sm">
            From {details.source || "HTTP Request"}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-xs">
              {typeof details.code === "number" && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-muted-foreground">Error code</span>
                  <span className="text-foreground">{details.code}</span>
                </div>
              )}
              {details.fullMessage && (
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-muted-foreground">Full message</span>
                  <span className="break-words text-foreground">
                    {details.fullMessage}
                  </span>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="request" className="border-border">
          <AccordionTrigger className="py-2 text-sm">Request</AccordionTrigger>
          <AccordionContent>
            <pre className="max-w-full rounded-md bg-background/50 p-2 font-mono text-xs break-words whitespace-pre-wrap text-foreground">
              {JSON.stringify(
                {
                  method: details.request?.method,
                  url: details.request?.url,
                  headers: details.request?.headers,
                  body: details.request?.body,
                },
                null,
                2
              )}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
