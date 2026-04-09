"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Play, Save } from "lucide-react";
import { useWorkflowStore } from "@/context";
import { useState } from "react";
import { toast } from "sonner";

export function BreadcrumbNav() {
  const pathname = usePathname();
  const { currentWorkflow, editorNodes, editorEdges } = useWorkflowStore();
  const [isSaving, setIsSaving] = useState(false);

  // Check if we're on a workflow detail page
  const workflowMatch = pathname.match(/^\/workflows\/([^/]+)$/);
  const workflowId = workflowMatch ? workflowMatch[1] : null;

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    let label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    // Replace workflow ID with workflow name from store if available
    if (
      isLast &&
      workflowId &&
      segment === workflowId &&
      currentWorkflow?.name
    ) {
      label = currentWorkflow.name;
    }

    return { href, label, isLast };
  });

  const isWorkflowDetailPage = !!workflowId;
  const isLoading = isWorkflowDetailPage && !currentWorkflow;

  const handleSave = async () => {
    if (!workflowId || !currentWorkflow) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes: editorNodes,
          edges: editorEdges,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save workflow");
      }

      toast.success("Workflow saved successfully");
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save workflow"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumb className="flex-1 min-w-0">
        <BreadcrumbList>
          {breadcrumbs.length > 1 && (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={breadcrumbs[breadcrumbs.length - 2].href}>
                    {breadcrumbs[breadcrumbs.length - 2].label}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          {breadcrumbs.length === 0 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isLoading ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  breadcrumbs[breadcrumbs.length - 1].label
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {isWorkflowDetailPage && (
        <div className="flex items-center gap-2 px-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="size-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </>
  );
}
