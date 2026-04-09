"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Execution = {
  id: string;
  workflowId: string;
  status: "RUNNING" | "SUCCESS" | "ERROR";
  startedAt: Date | string;
  completedAt: Date | string | null;
  error: string | null;
  triggerType: string | null;
  workflow: {
    id: string;
    name: string;
  };
};

type Pagination = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
};

function ExecutionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [workflowFilter, setWorkflowFilter] = useState(
    searchParams.get("workflowId") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string }>>([]);

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch("/api/workflows?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  }, []);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
      });
      if (workflowFilter && workflowFilter !== "all") {
        params.append("workflowId", workflowFilter);
      }

      const response = await fetch(`/api/executions?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch executions");
      }

      const data = await response.json();
      let filteredExecutions = data.executions || [];

      // Filter by status on client side
      if (statusFilter !== "all") {
        filteredExecutions = filteredExecutions.filter(
          (exec: Execution) => exec.status === statusFilter.toUpperCase()
        );
      }

      setExecutions(filteredExecutions);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching executions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, workflowFilter, statusFilter]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (workflowFilter && workflowFilter !== "all") params.set("workflowId", workflowFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    router.replace(`/executions?${params.toString()}`, { scroll: false });
  }, [currentPage, workflowFilter, statusFilter, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Execution History</h1>
          <p className="text-muted-foreground mt-1">
            View and monitor workflow executions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          value={workflowFilter}
          onValueChange={(value) => {
            setWorkflowFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Workflows" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workflows</SelectItem>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.id} value={workflow.id}>
                {workflow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : executions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No executions found</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => {
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

                  return (
                    <TableRow key={execution.id}>
                      <TableCell>{getStatusBadge(execution.status)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/workflows/${execution.workflow.id}`}
                          className="text-primary hover:underline"
                        >
                          {execution.workflow.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {execution.triggerType || "manual"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(startedAt)}
                      </TableCell>
                      <TableCell>
                        {duration !== null
                          ? `${duration}s`
                          : execution.status === "RUNNING"
                          ? "Running..."
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/executions/${execution.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ExecutionsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    }>
      <ExecutionsContent />
    </Suspense>
  );
}
