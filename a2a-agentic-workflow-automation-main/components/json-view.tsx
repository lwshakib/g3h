"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface JSONViewProps {
  data: unknown;
  maxDepth?: number;
}

export function JSONView({ data, maxDepth = 10 }: JSONViewProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderValue = (value: unknown, path: string = "", depth: number = 0): React.ReactNode => {
    if (depth > maxDepth) {
      return <span className="text-muted-foreground">...</span>;
    }

    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (value === undefined) {
      return <span className="text-muted-foreground">undefined</span>;
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expanded.has(path);
      return (
        <div className="ml-4">
          <button
            onClick={() => toggleExpand(path)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>[</span>
            <span className="text-muted-foreground">{value.length} items</span>
            <span>]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {value.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">{index}:</span>
                  <div>{renderValue(item, `${path}[${index}]`, depth + 1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object") {
      const isExpanded = expanded.has(path);
      const entries = Object.entries(value);
      return (
        <div className="ml-4">
          <button
            onClick={() => toggleExpand(path)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>{"{"}</span>
            <span className="text-muted-foreground">{entries.length} keys</span>
            <span>{"}"}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {entries.map(([key, val]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">"{key}":</span>
                  <div>{renderValue(val, `${path}.${key}`, depth + 1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="text-muted-foreground">{String(value)}</span>;
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy JSON
            </>
          )}
        </Button>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 pr-24 font-mono text-sm overflow-x-auto">
        {renderValue(data)}
      </div>
    </div>
  );
}

