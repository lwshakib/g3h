import React from "react";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      
      {/* Left Column: Auth form */}
      <div className="lg:col-span-6 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative">
        {/* Top bar: Brand logo */}
        <div className="flex items-center gap-2 mb-8 lg:mb-0">
          <Logo className="size-8 text-primary" />
          <span className="font-semibold text-2xl tracking-tight font-orbitron">G3H</span>
        </div>

        {/* Form content */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground/60 font-sans mt-8 lg:mt-0">
          © {new Date().getFullYear()} G3H Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Hero / Welcome Panel */}
      <div className="lg:col-span-6 hidden lg:flex p-6">
        <div className="w-full relative rounded-3xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 flex flex-col justify-between p-12 overflow-hidden shadow-2xl">
          
          {/* Subtle glow / grid pattern in background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Top Panel Text */}
          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight text-white leading-tight font-display">
              Welcome back! Please sign in to your G3H account
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-sans font-light max-w-lg">
              Seamlessly manage your Next.js frontend and Express backend in our high-performance monorepo workspace.
            </p>
          </div>

          {/* Bottom Floating Info Card */}
          <div className="bg-white text-zinc-950 rounded-3xl p-8 relative z-10 shadow-xl border border-zinc-200/20 flex flex-col justify-between gap-6">
            
            {/* Top row of floating card */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-xl tracking-tight text-zinc-950 font-display">
                  Please enter your login details
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-sans">
                  Stay connected with G3H. Subscribe now for the latest workflows and developer resources.
                </p>
              </div>
              
              {/* Stylized Logo Square Badge */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
                <Logo className="size-6 text-white" />
              </div>
            </div>

            {/* Bottom row of floating card */}
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-sans">
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
                <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200">
                  +3,695
                </span>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
