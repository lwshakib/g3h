"use client"

import { PlayIcon, PowerIcon, Trash2Icon, SparklesIcon, EllipsisIcon } from "lucide-react"

export function NodeTopToolbar({ onDelete }: { onDelete: () => void }) {
  const handleToolbarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className="pointer-events-none absolute top-[-44px] left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/node:opacity-100">
      <div className="pointer-events-auto flex items-center gap-1 text-[#e6e6e6]">
        <button
          type="button"
          onClick={handleToolbarClick}
          className="rounded p-1 hover:bg-white/10"
        >
          <PlayIcon className="h-3.5 w-3.5 fill-current" />
        </button>
        <button
          type="button"
          onClick={handleToolbarClick}
          className="rounded p-1 hover:bg-white/10"
        >
          <PowerIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            handleToolbarClick(event)
            onDelete()
          }}
          className="rounded p-1 hover:bg-white/10"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleToolbarClick}
          className="rounded p-1 hover:bg-white/10"
        >
          <SparklesIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleToolbarClick}
          className="rounded p-1 hover:bg-white/10"
        >
          <EllipsisIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
