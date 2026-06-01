import React from "react"
import { Logo } from "@/components/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden bg-background text-foreground lg:grid-cols-12">
      {/* Left Column: Auth form */}
      <div className="relative flex flex-col justify-between p-8 md:p-12 lg:col-span-6 lg:p-16">
        {/* Top bar: Brand logo */}
        <div className="mb-8 flex items-center gap-2 lg:mb-0">
          <Logo className="size-8 text-primary" />
          <span className="font-orbitron text-2xl font-semibold tracking-tight">
            G3H
          </span>
        </div>

        {/* Form content */}
        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 font-sans text-xs text-muted-foreground/60 lg:mt-0">
          © {new Date().getFullYear()} G3H Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Hero / Welcome Panel */}
      <div className="hidden p-6 lg:col-span-6 lg:flex">
        <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-12 shadow-2xl dark:bg-zinc-900">
          {/* Subtle glow / grid pattern in background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent"></div>

          {/* Top Panel Text */}
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight text-white xl:text-5xl">
              Welcome back! Please sign in to your G3H account
            </h2>
            <p className="max-w-lg font-sans text-lg leading-relaxed font-light text-zinc-400">
              Seamlessly manage your Next.js frontend and Express backend in our
              high-performance monorepo workspace.
            </p>
          </div>

          {/* Bottom Floating Info Card */}
          <div className="relative z-10 flex flex-col justify-between gap-6 rounded-3xl border border-zinc-200/20 bg-white p-8 text-zinc-950 shadow-xl">
            {/* Top row of floating card */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-950">
                  Please enter your login details
                </h3>
                <p className="max-w-sm font-sans text-sm leading-relaxed text-zinc-500">
                  Stay connected with G3H. Subscribe now for the latest
                  workflows and developer resources.
                </p>
              </div>

              {/* Stylized Logo Square Badge */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
                <Logo className="size-6 text-white" />
              </div>
            </div>

            {/* Bottom row of floating card */}
            <div className="mt-2 flex items-center justify-between">
              <div className="font-sans text-xs font-semibold tracking-wider text-zinc-400">
                Active Developers
              </div>

              {/* Avatars row */}
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User"
                  />
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-900">
                  +3,695
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
