"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "../../../lib/auth-client";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    await authClient.signUp.email(
      {
        name,
        email,
        password,
        callbackURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Registration successful");
          router.push("/sign-in");
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="relative z-10 w-full max-w-md bg-neutral-950/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group overflow-hidden">
      {/* Scanning Line Decorator */}
      <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
        <div className="h-full w-1/3 bg-cyan-400 animate-scan-line"></div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="font-orbitron text-[10px] md:text-xs uppercase tracking-[0.4em] text-cyan-500 mb-2">Auth Sequence</p>
          <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white font-orbitron uppercase">Init_Identity</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="font-orbitron font-light text-[10px] uppercase tracking-widest text-neutral-500">Node Alias [ NAME ]</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
              <input
                id="name"
                type="text"
                placeholder="Subject Zero"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 px-10 py-3 text-sm font-light text-white transition-all duration-300 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-none placeholder:text-neutral-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="font-orbitron font-light text-[10px] uppercase tracking-widest text-neutral-500">Node Identifier [ EMAIL ]</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
              <input
                id="email"
                type="email"
                placeholder="identity@axonix.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 px-10 py-3 text-sm font-light text-white transition-all duration-300 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-none placeholder:text-neutral-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="font-orbitron font-light text-[10px] uppercase tracking-widest text-neutral-500">Secure Protocol [ PWD ]</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 px-10 py-3 text-sm font-light text-white transition-all duration-300 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-none placeholder:text-neutral-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="font-orbitron font-light text-[10px] uppercase tracking-widest text-neutral-500">Confirm Protocol [ OK ]</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-white/10 px-10 py-3 text-sm font-light text-white transition-all duration-300 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-none placeholder:text-neutral-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full border border-cyan-400 bg-cyan-400/10 text-cyan-400 font-orbitron font-normal text-xs uppercase tracking-[0.3em] py-4 transition-all duration-300 overflow-hidden rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-black transition-colors duration-300">
              {loading ? "Registering..." : "Init_Identity"} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </form>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="font-orbitron text-[8px] uppercase tracking-widest text-neutral-600">Secondary Identifiers</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={async () => {
                 await authClient.signIn.social({
                   provider: "google",
                   callbackURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
                 });
               }}
               disabled={loading}
               className="border border-white/10 bg-black py-3 text-[10px] font-orbitron text-neutral-400 uppercase tracking-widest hover:border-white/30 hover:bg-white/5 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Google_Link
             </button>
             <button 
               onClick={async () => {
                 await authClient.signIn.social({
                   provider: "github",
                   callbackURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
                 });
               }}
               disabled={loading}
               className="border border-white/10 bg-black py-3 text-[10px] font-orbitron text-neutral-400 uppercase tracking-widest hover:border-white/30 hover:bg-white/5 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
               GitHub_Link
             </button>
          </div>
        </div>

        <p className="font-orbitron font-light text-[10px] uppercase tracking-widest text-neutral-500 text-center mt-4">
          Node already exists? <Link href="/sign-in" className="text-cyan-500 hover:underline">Link identity</Link>
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
    </div>
  );
}
