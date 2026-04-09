import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExecutionById } from "@/actions/execution";
import { CheckCircle2, XCircle, Loader2, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JSONView } from "@/components/json-view";

export default async function ExecutionDetailPage({
  params,
}: {
  params: { executionId: string };
}) {
  const { executionId } = await params;
  const result = await getExecutionById(executionId);

  if (!result.success || !result.execution) {
    notFound();
  }

  const execution = result.execution;
  const startedAt = typeof execution.startedAt === "string" 
    ? new Date(execution.startedAt) 
    : execution.startedAt;
  const completedAt = execution.completedAt
    ? (typeof execution.completedAt === "string"
        ? new Date(execution.completedAt)
        : execution.completedAt)
    : null;
  const duration = completedAt
    ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000)
    : null;

  const getStatusBadge = () => {
    switch (execution.status) {
      case "SUCCESS":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "ERROR":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      default:
        return <Badge variant="outline">{execution.status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/executions">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Executions
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Execution Details</h1>
            <p className="text-muted-foreground mt-1">
              Execution ID: {execution.id}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Execution Info */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Workflow</p>
                <Link
                  href={`/workflows/${execution.workflow.id}`}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {execution.workflow.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trigger Type</p>
                <Badge variant="outline" className="mt-1">
                  {execution.triggerType || "manual"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Started</p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {startedAt.toLocaleString()}
                  <span className="text-muted-foreground">
                    ({formatDistanceToNow(startedAt, { addSuffix: true })})
                  </span>
                </p>
              </div>
              {completedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {completedAt.toLocaleString()}
                    <span className="text-muted-foreground">
                      ({formatDistanceToNow(completedAt, { addSuffix: true })})
                    </span>
                  </p>
                </div>
              )}
              {duration !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="mt-1">{duration} seconds</p>
                </div>
              )}
            </div>
            {execution.error && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Error</p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <p className="text-sm text-destructive font-mono">{execution.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {execution.result && (
          <Card>
            <CardHeader>
              <CardTitle>Execution Result</CardTitle>
            </CardHeader>
            <CardContent>
              <JSONView data={execution.result} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
