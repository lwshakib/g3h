"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { 
  Headset, 
  Terminal, 
  User, 
  Cpu, 
  Network, 
  ShieldCheck, 
  Radar, 
  Infinity, 
  Search, 
  Home, 
  Inbox, 
  Users, 
  Settings, 
  ChevronLeft, 
  Play, 
  Database, 
  MessageSquareText, 
  Activity, 
  FileText, 
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const scrollProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Progress Indicator
    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollPx / winHeightPx;
      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for Reveal Animations
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-on-scroll, .kinetic-heading").forEach((el) => {
      revealObserver.observe(el);
    });

    // Subtle Magnetic Interaction for Cards
    const cards = document.querySelectorAll(".magnetic-card");
    cards.forEach(card => {
      const cardEl = card as HTMLElement;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        cardEl.style.transform = `translate3d(${x * 0.03}px, ${y * 0.03}px, 0)`;
      };

      const handleMouseLeave = () => {
        cardEl.style.transform = `translate3d(0px, 0px, 0)`;
      };

      cardEl.addEventListener("mousemove", handleMouseMove);
      cardEl.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        cardEl.removeEventListener("mousemove", handleMouseMove);
        cardEl.removeEventListener("mouseleave", handleMouseLeave);
      };
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-black text-white overflow-x-hidden min-h-screen relative selection:bg-cyan-500/30 rounded-none font-sans">
      <Script 
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
        onLoad={() => {
          // @ts-ignore
          if (window.UnicornStudio) {
            // @ts-ignore
            window.UnicornStudio.init();
          }
        }}
      />
      
      <div id="scroll-progress" ref={scrollProgressRef} className="fixed top-0 left-0 h-[2px] w-full z-[70] bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 pointer-events-none origin-left transform scale-x-0 transition-transform duration-120 linear"></div>
      
      {/* Fixed Laboratory Backgrounds */}
      <div className="fixed inset-0 vertical-streaks pointer-events-none z-0"></div>
      <div className="fixed inset-0 crt-scanlines pointer-events-none z-0 opacity-40"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 via-black/95 to-black z-0 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="md:px-10 lg:px-16 flex md:h-20 w-full h-16 pr-6 pl-6 items-center">
          <div className="flex items-center gap-4">
            <Logo className="w-8 h-8 text-cyan-500" />
            <a href="#home" className="font-orbitron text-sm md:text-base tracking-[0.08em] text-white/90 hover:text-cyan-400 transition-colors">Axonix</a>
          </div>

          <div className="ml-auto flex items-center gap-6 md:gap-10">
            <div className="hidden md:flex items-center gap-10">
              <a href="#workflows" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">Workflows</a>
              <a href="#system" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">Platform</a>
              <a href="#licensing" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">Pricing</a>
            </div>

            <a href="/home/workflows" className="font-orbitron text-xs tracking-[0.08em] border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 px-6 py-2.5 md:py-3 transition-all duration-300 relative group overflow-hidden rounded-none inline-flex items-center justify-center">
              <div className="absolute inset-0 w-full h-full bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">Get started</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="z-10 w-full relative pt-16 md:pt-20">
        
        {/* Hero Section */}
        <section id="home" className="relative w-full h-[80vh] min-h-[500px] overflow-hidden flex items-center border-b border-white/5">
          {/* WebGL Background Placeholder */}
          <div data-us-project="q0JSwb0l42Yf6m79xfW9" className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen" style={{ width: '100%', height: '100%' }}></div>

          <div className="absolute bottom-12 left-6 md:left-12 lg:left-16 z-20 pointer-events-none w-full max-w-4xl animate-hero-rise">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs md:text-sm font-orbitron tracking-[0.2em] text-cyan-500">Platform online</span>
              <span className="w-10 h-[1px] bg-cyan-500/50"></span>
            </div>
            <h1 className="font-orbitron text-white leading-[1.1] tracking-tight text-3xl md:text-5xl lg:text-6xl drop-shadow-[0_0_30px_rgba(0,255,255,0.15)] kinetic-heading">
              Build agent workflows<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white/50">that run your operations.</span>
            </h1>
            <p className="mt-6 text-base text-neutral-400 font-light tracking-wide max-w-xl border-l border-cyan-500/30 pl-4 py-1">
              Design automation flows with triggers, AI executions, and data actions. Connect nodes visually, test quickly, and ship reliable agent systems.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4 pointer-events-auto">
              <a href="/home/workflows" className="group relative inline-flex items-center gap-3 border border-cyan-400 bg-cyan-400/10 text-cyan-400 font-orbitron font-normal text-xs tracking-[0.08em] px-6 py-3 transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] rounded-none">
                <span>Start building</span>
                <ArrowRight className="w-4 h-4" />
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 group-hover:border-black/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 group-hover:border-black/50"></div>
              </a>
              <a href="/home/workflows" className="group relative inline-flex items-center gap-3 border border-white/10 bg-transparent text-white font-orbitron font-normal text-xs tracking-[0.08em] px-6 py-3 transition-all duration-300 hover:border-white/30 hover:bg-white/5 rounded-none">
                <span>Explore workflows</span>
                <Radar className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tech Stack Indicators */}
          <div className="absolute bottom-12 right-6 lg:right-16 z-30 flex flex-col items-end gap-2 text-right pointer-events-none reveal-on-scroll" style={{ ["--reveal-delay" as any]: "0ms" }}>
            <p className="font-orbitron text-xs tracking-[0.2em] text-neutral-600">Core technologies</p>
            <div className="flex gap-3 text-xs font-mono text-cyan-500/70 mt-1">
              <span>[ React Flow ]</span>
              <span>[ AI models ]</span>
              <span>[ PostgreSQL ]</span>
            </div>
          </div>
        </section>

        {/* Workflows Section */}
        <section id="workflows" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 w-full border-b border-white/5 bg-black relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 reveal-on-scroll" style={{ ["--reveal-delay" as any]: "0ms" }}>
              <div className="">
                <p className="font-orbitron text-xs uppercase tracking-[0.4em] text-cyan-500 mb-3 flex items-center gap-3">
                  <span className="w-6 md:w-8 h-[1px] bg-cyan-500"></span> Workflow automation
                </p>
                <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-white font-orbitron">Design, connect, execute</h2>
              </div>
              <p className="text-neutral-500 text-xs font-orbitron tracking-[0.08em] max-w-xs text-right">
                Build production-ready agent workflows with a visual editor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* Experiment 1 */}
              <div className="group relative bg-neutral-950 border border-white/10 hover:border-cyan-500/50 transition-colors duration-500 p-5 md:p-6 flex flex-col justify-between min-h-[280px] rounded-none overflow-hidden cursor-crosshair reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "90ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-cyan-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-black flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-orbitron tracking-[0.2em] text-neutral-600 border border-white/5 px-2 py-1 uppercase">Live Demo</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-normal tracking-tight mb-2 text-white font-orbitron uppercase group-hover:text-cyan-300 transition-colors">Neural Particle Field</h3>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    100,000 instanced geometries reacting to cursor velocity and audio input via custom fragment shaders.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-cyan-500 text-xs font-orbitron tracking-[0.2em] uppercase mt-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  Initialize <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Experiment 2 */}
              <div className="group relative bg-neutral-950 border border-white/10 hover:border-cyan-500/50 transition-colors duration-500 p-5 md:p-6 flex flex-col justify-between min-h-[280px] rounded-none overflow-hidden cursor-crosshair reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "180ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-cyan-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-black flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                      <Network className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-orbitron tracking-[0.2em] text-neutral-600 border border-white/5 px-2 py-1 uppercase">Interactive</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-normal tracking-tight mb-2 text-white font-orbitron uppercase group-hover:text-cyan-300 transition-colors">Image Reveal Shader</h3>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    Liquid distortion effects applied to DOM images mapped onto WebGL planes with noise displacement.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-cyan-500 text-xs font-orbitron tracking-[0.2em] uppercase mt-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  Initialize <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Experiment 3 */}
              <div className="group relative bg-neutral-950 border border-white/10 hover:border-cyan-500/50 transition-colors duration-500 p-5 md:p-6 flex flex-col justify-between min-h-[280px] rounded-none overflow-hidden cursor-crosshair reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "270ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-cyan-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-black flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-orbitron tracking-[0.2em] text-neutral-600 border border-white/5 px-2 py-1 uppercase">Motion</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-normal tracking-tight mb-2 text-white font-orbitron uppercase group-hover:text-cyan-300 transition-colors">Scroll Scan Engine</h3>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    Tying camera z-depth and post-processing bloom intensity directly to native browser scroll velocity.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-cyan-500 text-xs font-orbitron tracking-[0.2em] uppercase mt-6 opacity-50 group-hover:opacity-100 transition-opacity">
                  Initialize <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interface Section / Agent Workspace Dashboard */}
        <section className="md:py-24 md:px-12 overflow-hidden bg-neutral-950/30 w-full border-white/5 border-b pt-16 pr-6 pb-16 pl-6 relative" id="system">
          <div className="max-w-[1300px] mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 reveal-on-scroll border-b border-white/10 pb-6" style={{ ["--reveal-delay" as any]: "0ms" }}>
              <div className="">
                <p className="uppercase flex items-center gap-3 text-xs md:text-sm text-cyan-500 tracking-[0.4em] font-orbitron mb-3">
                  <span className="bg-cyan-500 w-6 md:w-8 h-[1px]"></span> Interactive simulation
                </p>
                <h2 className="text-2xl md:text-4xl uppercase font-normal text-white tracking-tight font-orbitron">Agents operation system</h2>
              </div>
              <p className="text-xs md:text-sm text-neutral-500 font-orbitron tracking-[0.2em] uppercase max-w-sm md:text-right">
                Real-time multi-agent processing mapped visually.
              </p>
            </div>

            {/* Dashboard App Container */}
            <div className="border border-[#222] bg-[#0a0a0a] flex h-[800px] w-full overflow-hidden relative rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] reveal-on-scroll font-sans" style={{ ["--reveal-delay" as any]: "90ms" }}>
              
              {/* Left Sidebar */}
              <aside className="w-64 border-r border-[#222] bg-[#0a0a0a] flex flex-col shrink-0 hidden lg:flex">
                {/* Top: Logo & Search */}
                <div className="p-4 flex flex-col gap-4 border-b border-[#222]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center text-white">
                      <Infinity className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-normal text-white">Fleet Command</span>
                  </div>
                  <div className="bg-[#141414] border border-[#222] rounded-md flex items-center px-2.5 py-1.5 text-neutral-400">
                    <Search className="w-4 h-4 mr-2" />
                    <span className="text-xs font-light">Search agents, logs...</span>
                    <kbd className="ml-auto text-xs font-mono bg-[#222] px-1.5 py-0.5 rounded border border-[#333]">⌘K</kbd>
                  </div>
                </div>
                
                {/* Nav Menu */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-6">
                  {/* HQ */}
                  <div>
                    <h3 className="px-2 text-xs font-light tracking-widest text-neutral-500 mb-2 uppercase">HQ</h3>
                    <div className="space-y-0.5">
                      <a href="#" className="flex items-center gap-3 px-2 py-1.5 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors">
                        <Home className="w-4 h-4" />
                        <span className="text-xs font-light">Overview</span>
                      </a>
                      <a href="#" className="flex items-center justify-between px-2 py-1.5 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors">
                        <div className="flex items-center gap-3">
                          <Inbox className="w-4 h-4" />
                          <span className="text-xs font-light">Agent Inbox</span>
                        </div>
                        <span className="bg-[#1e3a8a] text-[#60a5fa] text-xs px-2 py-0.5 rounded-full font-light">12</span>
                      </a>
                    </div>
                  </div>
                  
                  {/* Workforces */}
                  <div>
                    <h3 className="px-2 text-xs font-light tracking-widest text-neutral-500 mb-2 uppercase">Workforces</h3>
                    <div className="space-y-0.5">
                      <a href="#" className="flex items-center gap-3 px-2 py-1.5 bg-[#141414] text-white rounded-md border border-[#222]">
                        <Users className="w-4 h-4 text-[#60a5fa]" />
                        <span className="text-xs font-normal">Sales SDR Swarm</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 px-2 py-1.5 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-light">CEO Co-Pilot</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 px-2 py-1.5 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors">
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs font-light">IT Support Agent</span>
                      </a>
                    </div>
                  </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-[#222] flex items-center justify-between hover:bg-[#111] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-xs text-neutral-300 font-normal">AX</div>
                    <div>
                      <div className="text-sm font-normal text-white">Axonix Admin</div>
                      <div className="text-xs font-light text-neutral-500">admin@axonix.ai</div>
                    </div>
                  </div>
                  <Settings className="w-4 h-4 text-neutral-500" />
                </div>
              </aside>

              {/* Center Canvas Area */}
              <main className="flex-1 flex flex-col relative bg-[#0a0a0a] min-w-0">
                {/* Header */}
                <header className="h-14 border-b border-[#222] flex items-center justify-between px-6 shrink-0 z-20 bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 text-xs font-light text-neutral-500">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Workforces</span>
                    <span>/</span>
                    <span className="text-white font-normal">Sales SDR Swarm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-300 border border-[#222] hover:bg-[#141414] rounded-md transition-colors font-light">
                      <Play className="w-3.5 h-3.5" /> Simulate Run
                    </button>
                    <button className="px-4 py-1.5 text-xs text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-md font-normal transition-colors shadow-[0_0_15px_rgba(2,132,199,0.3)]">
                      Activate Swarm
                    </button>
                  </div>
                </header>

                {/* Canvas Workspace */}
                <div className="flex-1 relative overflow-auto bg-[#0a0a0a]">
                  {/* Dot Grid Overlay */}
                  <div className="absolute inset-0 z-0 opacity-[0.25]" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  
                  {/* Centered Graph Container */}
                  <div className="relative w-[800px] h-[600px] mx-auto mt-12 z-10 flex-shrink-0">
                    
                    {/* SVG Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {/* Curve to SDR Agent */}
                      <path d="M 280 250 C 350 250, 350 150, 420 150" fill="none" stroke="#333" strokeWidth="2"></path>
                      {/* Curve to Co-Pilot */}
                      <path d="M 280 250 C 350 250, 350 350, 420 350" fill="none" stroke="#333" strokeWidth="2"></path>
                      
                      {/* Connectors/Nodes */}
                      <circle cx="280" cy="250" r="4" fill="#0284c7"></circle>
                      <circle cx="420" cy="150" r="4" fill="#333"></circle>
                      <circle cx="420" cy="350" r="4" fill="#333"></circle>
                      
                      {/* Output stubs */}
                      <path d="M 676 150 L 700 150" fill="none" stroke="#333" strokeWidth="2"></path>
                      <circle cx="676" cy="150" r="4" fill="#333"></circle>
                      <path d="M 676 350 L 700 350" fill="none" stroke="#333" strokeWidth="2"></path>
                      <circle cx="676" cy="350" r="4" fill="#333"></circle>
                    </svg>

                    {/* Node: Data Source */}
                    <div className="absolute top-[180px] left-[16px] w-64 bg-[#141414] border border-[#0284c7]/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col z-10 overflow-hidden">
                      <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-1">
                        <span className="text-xs font-normal text-[#0ea5e9] border border-[#0ea5e9]/30 bg-[#0ea5e9]/10 px-2 py-0.5 rounded uppercase tracking-wider">Data Source</span>
                      </div>
                      <div className="p-4 pt-6 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] shrink-0 mt-0.5">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-normal text-white">High-Intent Lead</h4>
                          <p className="text-xs font-light text-neutral-500 mt-0.5">Signal from Apollo</p>
                        </div>
                      </div>
                      <div className="bg-[#1a1a1a] p-3 text-xs font-light text-neutral-400 border-t border-[#222] text-center">
                        Enrich: <span className="font-normal text-white">Clearbit API</span> • Filter: <span className="font-normal text-white">ICP Match</span>
                      </div>
                    </div>

                    {/* Node: Agent SDR */}
                    <div className="absolute top-[80px] left-[420px] w-64 bg-[#141414] border border-[#222] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col z-10">
                      <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-1">
                        <span className="text-xs font-light text-neutral-400 uppercase tracking-wider">Agent: SDR</span>
                      </div>
                      <div className="p-4 pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-neutral-300 shrink-0">
                            <MessageSquareText className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-normal text-white">Draft Outreach</h4>
                        </div>
                        
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 text-center mb-4 relative">
                           <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#141414] px-1 text-xs font-light text-neutral-500">Context</span>
                           <p className="text-xs font-light text-neutral-300 mt-1">Analyze recent company news</p>
                        </div>
                        
                        <div className="inline-flex items-center gap-1.5 border border-[#0ea5e9]/30 bg-[#0ea5e9]/5 text-[#0ea5e9] px-2.5 py-1 rounded-full text-xs font-light">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></div>
                           GPT-4o Reasoning
                        </div>
                      </div>
                    </div>

                    {/* Node: Co-Pilot */}
                    <div className="absolute top-[280px] left-[420px] w-64 bg-[#141414] border border-[#222] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col z-10">
                      <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-1">
                        <span className="text-xs font-light text-neutral-400 uppercase tracking-wider">Agent: Co-Pilot</span>
                      </div>
                      <div className="p-4 pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-neutral-300 shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-normal text-white">Review & Approve</h4>
                        </div>
                        
                        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 flex justify-between items-center text-xs">
                           <span className="font-light text-neutral-500">Rule Engine</span>
                           <span className="font-normal text-[#0ea5e9]">Brand Safety</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Toolbar */}
                <footer className="h-12 border-t border-[#222] flex items-center justify-between px-6 shrink-0 z-20 bg-[#0a0a0a]">
                  <div className="flex items-center gap-4 text-xs font-light text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>Agent Status</span>
                    </div>
                    <span className="text-[#333]">•</span>
                    <span>Success rate <span className="font-normal text-[#0ea5e9]">99.2%</span></span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-light text-neutral-400">
                    <span>Last action: 2m ago</span>
                    <div className="flex items-center gap-2 text-[#10b981] font-normal">
                      <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
                      Swarm Active
                    </div>
                  </div>
                </footer>
              </main>

              {/* Right Properties Sidebar */}
              <aside className="w-80 border-l border-[#222] bg-[#0a0a0a] flex flex-col shrink-0 hidden xl:flex overflow-y-auto">
                <div className="p-6 border-b border-[#222]">
                  <h2 className="text-base font-normal text-white mb-1">AI SDR Agent</h2>
                  <p className="text-xs font-light text-neutral-500">Role • Outbound Sales</p>
                </div>
                
                <div className="p-6 space-y-8 flex-1">
                  <div className="border border-[#222] rounded-xl bg-[#141414] overflow-hidden">
                    <div className="p-4 border-b border-[#222] flex justify-center">
                       <span className="text-xs font-light text-neutral-500 tracking-widest uppercase">Agent Mandate</span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-light text-neutral-400 mb-4 leading-relaxed text-center px-2">
                        Instruct the agent in plain text. It will adapt its approach based on your guidelines.
                      </p>
                      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 relative">
                        <p className="text-xs font-light text-neutral-500 mb-8 leading-relaxed">
                          e.g. Focus on VP level targets. Use a casual tone. Reference their recent funding round if applicable.
                        </p>
                        <div className="flex justify-end">
                          <button className="px-3 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-normal rounded-md transition-colors">
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-light text-neutral-500 tracking-widest uppercase">Knowledge Base</span>
                      <span className="text-xs font-normal text-[#10b981] border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 rounded-full">Synced</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 border border-[#222] rounded-lg bg-[#141414] text-xs font-light text-neutral-300">
                         <FileText className="w-4 h-4 text-neutral-500" />
                         Company_Pitch_Deck.pdf
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-[#222] rounded-lg bg-[#141414] text-xs font-light text-neutral-300">
                         <LinkIcon className="w-4 h-4 text-neutral-500" />
                         looper.ai/case-studies
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#222] bg-[#0a0a0a]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-light text-neutral-400">Swarm Health</span>
                    <span className="text-xs font-normal text-[#10b981] border border-[#10b981]/30 px-2 py-0.5 rounded">Optimal</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-[#222] rounded-lg bg-[#141414] p-3 text-center">
                      <p className="text-xs font-light text-neutral-500 mb-1">Active Agents</p>
                      <p className="text-base font-normal text-white">3</p>
                    </div>
                    <div className="border border-[#222] rounded-lg bg-[#141414] p-3 text-center">
                      <p className="text-xs font-light text-neutral-500 mb-1">Tasks Executed</p>
                      <p className="text-base font-normal text-white">1,402</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
        
        {/* Workforces Section */}
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-neutral-950/30 w-full border-white/5 border-b relative" id="workforces">
          <div className="z-10 max-w-7xl mx-auto relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 reveal-on-scroll border-white/10 border-b mb-12 pb-6 justify-between" style={{ ["--reveal-delay" as any]: "0ms" }}>
              <div className="">
                <p className="uppercase flex items-center gap-3 text-xs md:text-sm text-cyan-500 tracking-[0.4em] font-orbitron mb-3">
                  <span className="w-6 md:w-8 h-[1px] bg-cyan-500"></span> Active units
                </p>
                <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-white font-orbitron uppercase">Agent Workforces</h2>
              </div>
              <p className="text-neutral-500 text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase max-w-xs md:text-right">
                Autonomous multi-agent systems currently deployed in the field.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Unit 1 */}
              <div className="group border border-white/10 bg-black p-5 md:p-6 relative overflow-hidden reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "90ms" }}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 group-hover:bg-cyan-500 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex group-hover:scale-110 transition-transform duration-500 text-cyan-400 bg-neutral-950 w-8 h-8 md:w-10 md:h-10 border-white/10 border rounded-none items-center justify-center">
                     <Cpu className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-cyan-500 uppercase">
                    <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> Online
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-normal tracking-tight text-white font-orbitron uppercase mb-1">Nexus-7</h3>
                <p className="text-xs md:text-sm text-neutral-500 font-light mb-5">Data Synthesis & Pattern Recognition</p>
                <div className="space-y-2 border-t border-white/5 pt-3">
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Throughput</span> <span className="text-cyan-400">1.2 TB/s</span></div>
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Nodes</span> <span className="text-cyan-400">14,020</span></div>
                </div>
              </div>

              {/* Unit 2 */}
              <div className="group border border-white/10 bg-black p-5 md:p-6 relative overflow-hidden reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "180ms" }}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 group-hover:bg-cyan-500 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-neutral-950 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                     <Network className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-cyan-500 uppercase">
                    <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> Online
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-normal tracking-tight text-white font-orbitron uppercase mb-1">Aether-Core</h3>
                <p className="text-xs md:text-sm text-neutral-500 font-light mb-5">Generative Architecture Framework</p>
                <div className="space-y-2 border-t border-white/5 pt-3">
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Latency</span> <span className="text-cyan-400">4ms</span></div>
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Uptime</span> <span className="text-cyan-400">99.99%</span></div>
                </div>
              </div>

              {/* Unit 3 */}
              <div className="group border border-white/10 bg-black p-5 md:p-6 relative overflow-hidden reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "270ms" }}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 group-hover:bg-cyan-500 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-neutral-950 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-cyan-500 uppercase">
                    <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> Online
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-normal tracking-tight text-white font-orbitron uppercase mb-1">Cipher-9</h3>
                <p className="text-xs md:text-sm text-neutral-500 font-light mb-5">Cryptographic Validation & Security</p>
                <div className="space-y-2 border-t border-white/5 pt-3">
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Hashes</span> <span className="text-cyan-400">450M/s</span></div>
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Integrity</span> <span className="text-cyan-400">100%</span></div>
                </div>
              </div>

              {/* Unit 4 */}
              <div className="group border border-white/10 bg-black p-5 md:p-6 relative overflow-hidden reveal-on-scroll magnetic-card" style={{ ["--reveal-delay" as any]: "360ms" }}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 group-hover:bg-cyan-500 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 bg-neutral-950 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 rounded-none">
                     <Radar className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-amber-500 uppercase">
                    <span className="w-1.5 h-1.5 bg-amber-500 animate-pulse"></span> Standby
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-normal tracking-tight text-white font-orbitron uppercase mb-1">Vanguard-X</h3>
                <p className="text-xs md:text-sm text-neutral-500 font-light mb-5">Predictive Telemetry & Forecasting</p>
                <div className="space-y-2 border-t border-white/5 pt-3">
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Forecasts</span> <span className="text-cyan-400">1.4B</span></div>
                   <div className="flex justify-between text-xs md:text-sm font-mono text-neutral-400"><span className="uppercase tracking-wider">Accuracy</span> <span className="text-cyan-400">96.4%</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Units Section */}
        <section id="a-team" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-black w-full border-white/5 border-b relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
             <div className="absolute top-1/2 -translate-y-1/2 right-[-10%] w-[60%]">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg" alt="A-Team Workforce" className="w-full h-auto object-contain" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-2xl mb-12 md:mb-16 reveal-on-scroll">
              <p className="font-orbitron text-xs md:text-sm uppercase tracking-[0.4em] text-cyan-500 mb-3 flex items-center gap-3">
                <span className="w-6 md:w-8 h-[1px] bg-cyan-500"></span> Specialized units
              </p>
              <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white font-orbitron uppercase mb-6 leading-tight">
                The A-Team <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white/50">Agents.</span>
              </h2>
              <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed border-l border-cyan-500/30 pl-4 py-1 text-pretty">
                Deploy specialized autonomous units tailored for high-impact organizational roles. Operating seamlessly in the background to drive acquisition, streamline internal operations, and augment executive strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {/* Card 1: SDR */}
              <div className="group border border-white/10 bg-neutral-950/60 backdrop-blur-md p-6 md:p-8 relative overflow-hidden reveal-on-scroll magnetic-card hover:border-blue-500/50 transition-colors duration-500" style={{ ["--reveal-delay" as any]: "90ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-blue-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <Headset className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-blue-500 uppercase">
                      <span className="w-1.5 h-1.5 bg-blue-500 animate-pulse"></span> Active
                    </span>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 mb-1">[ OUTBOUND / ACQUISITION ]</p>
                  <h3 className="text-xl md:text-2xl font-normal tracking-tight text-white font-orbitron uppercase mb-3">SDR Unit</h3>
                  <p className="text-sm text-neutral-400 font-light mb-6 leading-relaxed">
                    Relentless pipeline generation. Autonomous multi-channel outreach, dynamic script adaptation, and real-time lead qualification at infinite scale.
                  </p>
                  
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-500 uppercase">Volume Cap</span>
                      <span className="text-blue-400">10k+ / Day</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-blue-500 animate-progress" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: INTERNAL */}
              <div className="group border border-white/10 bg-neutral-950/60 backdrop-blur-md p-6 md:p-8 relative overflow-hidden reveal-on-scroll magnetic-card hover:border-cyan-500/50 transition-colors duration-500" style={{ ["--reveal-delay" as any]: "180ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-cyan-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-cyan-500 uppercase">
                      <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"></span> Active
                    </span>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 mb-1">[ INTERNAL / OPERATIONS ]</p>
                  <h3 className="text-xl md:text-2xl font-normal tracking-tight text-white font-orbitron uppercase mb-3">IT Support</h3>
                  <p className="text-sm text-neutral-400 font-light mb-6 leading-relaxed">
                    Automated triage and resolution. Instantly solves 80% of level-1 tickets, provisions access, and maintains internal knowledge graphs securely.
                  </p>
                  
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-500 uppercase">Resolution Rate</span>
                      <span className="text-cyan-400">82.4%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-cyan-500 animate-progress" style={{ width: '82.4%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: EXECUTIVE */}
              <div className="group border border-white/10 bg-neutral-950/60 backdrop-blur-md p-6 md:p-8 relative overflow-hidden reveal-on-scroll magnetic-card hover:border-purple-500/50 transition-colors duration-500" style={{ ["--reveal-delay" as any]: "270ms" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-purple-400 animate-scan-line hidden group-hover:block"></div></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-orbitron tracking-[0.2em] text-purple-500 uppercase">
                      <span className="w-1.5 h-1.5 bg-purple-500 animate-pulse"></span> Active
                    </span>
                  </div>
                  <p className="text-xs font-mono text-neutral-500 mb-1">[ STRATEGY / EXECUTIVE ]</p>
                  <h3 className="text-xl md:text-2xl font-normal tracking-tight text-white font-orbitron uppercase mb-3">CEO Co-Pilot</h3>
                  <p className="text-sm text-neutral-400 font-light mb-6 leading-relaxed">
                    Strategic synthesis and executive summary. Aggregates cross-departmental data into real-time briefings, surfacing critical anomalies before they escalate.
                  </p>
                  
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-neutral-500 uppercase">Data Sources</span>
                      <span className="text-purple-400">14 Active</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-purple-500 animate-progress" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="licensing" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-black w-full relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.05),_transparent_40%)] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 md:mb-24 reveal-on-scroll">
              <p className="font-orbitron text-xs md:text-sm uppercase tracking-[0.4em] text-cyan-500 mb-4 inline-flex items-center gap-3">
                <span className="w-10 h-[1px] bg-cyan-500"></span> System access
              </p>
              <h2 className="text-3xl md:text-6xl font-normal tracking-tighter text-white font-orbitron uppercase mb-6 drop-shadow-2xl">
                Licensing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white/40">Tiers.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-1">
              {/* Plan 1: Starter */}
              <div className="group border border-white/5 bg-neutral-950/20 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between reveal-on-scroll hover:border-white/20 transition-all duration-500 relative" style={{ ["--reveal-delay" as any]: "0ms" }}>
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10 group-hover:border-white/30 transition-colors"></div>
                <div>
                  <div className="text-xs font-mono text-cyan-500/60 uppercase tracking-[0.2em] mb-4">[ Tier 01 ]</div>
                  <h3 className="text-2xl font-normal text-white font-orbitron uppercase mb-2">Starter</h3>
                  <div className="text-4xl font-normal text-white mb-8">$0<span className="text-sm text-neutral-500 font-light ml-2 uppercase tracking-widest">/ Month</span></div>
                  <ul className="space-y-4 mb-12">
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> 3 active agent workflows</li>
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> Basic LLM integrations</li>
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> Community support</li>
                  </ul>
                </div>
                <a href="/home/workflows" className="w-full py-4 text-center border border-white/10 text-white font-orbitron text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">Current Plan</a>
              </div>

              {/* Plan 2: Professional (Featured) */}
              <div className="group border-x border-cyan-500/30 bg-neutral-900/40 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between reveal-on-scroll scale-100 md:scale-110 z-20 shadow-[0_0_100px_rgba(6,182,212,0.1)] relative" style={{ ["--reveal-delay" as any]: "100ms" }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-cyan-500 px-4 py-1 text-[10px] font-orbitron text-black uppercase tracking-[0.2em]">Enforcement Level: High</div>
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em] mb-4">[ Tier 02 ]</div>
                  <h3 className="text-2xl font-normal text-white font-orbitron uppercase mb-2">Power</h3>
                  <div className="text-4xl font-normal text-white mb-8">$49<span className="text-sm text-neutral-500 font-light ml-2 uppercase tracking-widest">/ Month</span></div>
                  <ul className="space-y-4 mb-12">
                    <li className="flex items-center gap-3 text-sm text-white font-light"><div className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div> Unlimited workflows</li>
                    <li className="flex items-center gap-3 text-sm text-white font-light"><div className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div> Advanced reasoning nodes</li>
                    <li className="flex items-center gap-3 text-sm text-white font-light"><div className="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div> Priority execution</li>
                  </ul>
                </div>
                <a href="/home/workflows" className="w-full py-4 text-center bg-cyan-500 text-black font-orbitron text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">Authorize Access</a>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="group border border-white/5 bg-neutral-950/20 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between reveal-on-scroll hover:border-white/20 transition-all duration-500 relative" style={{ ["--reveal-delay" as any]: "200ms" }}>
                <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-white/10 group-hover:border-white/30 transition-colors"></div>
                <div>
                  <div className="text-xs font-mono text-cyan-500/60 uppercase tracking-[0.2em] mb-4">[ Tier 03 ]</div>
                  <h3 className="text-2xl font-normal text-white font-orbitron uppercase mb-2">Corporate</h3>
                  <div className="text-4xl font-normal text-white mb-8">Custom</div>
                  <ul className="space-y-4 mb-12">
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> Dedicated node clusters</li>
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> SOC2 & InfoSec compliance</li>
                    <li className="flex items-center gap-3 text-sm text-neutral-400 font-light"><div className="w-1 h-1 bg-cyan-500"></div> 24/7 technical escort</li>
                  </ul>
                </div>
                <a href="mailto:hello@axonix.ai" className="w-full py-4 text-center border border-white/10 text-white font-orbitron text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">Inquire Within</a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="py-12 md:py-16 px-6 md:px-12 lg:px-24 bg-black border-t border-white/10 w-full relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo className="w-8 h-8 text-cyan-500" />
                <span className="font-orbitron text-sm md:text-base tracking-[0.08em] text-white/90">Axonix</span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">Design workflows. Connect agents. Run automation.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <a href="#" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">GitHub</a>
              <a href="#" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">Twitter</a>
              <a href="#" className="text-xs font-orbitron tracking-[0.08em] text-neutral-500 hover:text-cyan-400 transition-colors">LinkedIn</a>
              <a href="mailto:hello@axonix.ai" className="font-orbitron text-xs tracking-[0.08em] border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 px-6 py-2.5 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
                Contact sales
              </a>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
            <p className="text-xs font-mono text-neutral-600">© 2026 AXONIX EXPERIMENTAL</p>
            <p className="text-xs font-mono text-neutral-600">SYS_STATUS: <span className="text-cyan-500">NOMINAL</span></p>
          </div>
        </footer>
      </main>
    </div>
  );
}
