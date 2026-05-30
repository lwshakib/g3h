"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Eye, EyeOff, Sun, Moon, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Separator } from "@workspace/ui/components/separator"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"

// Replicating Cal.diy's exact elegant background grid component
function BackgroundGrid() {
  const rows = 9
  const cols = 18
  const size = 60
  const gap = 8
  const radius = 8
  const width = cols * size + (cols - 1) * gap
  const height = rows * size + (rows - 1) * gap

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className="[--grid-fill:#fafafa] [--grid-stroke:rgba(34,42,53,0.06)] dark:[--grid-fill:#121212] dark:[--grid-stroke:rgba(255,255,255,0.05)] transition-colors duration-300"
      >
        <defs>
          <radialGradient id="gridFade" cx="50%" cy="50%" rx="75%" ry="75%">
            <stop offset="25%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridMask">
            <rect width={width} height={height} fill="url(#gridFade)" />
          </mask>
          <filter id="gridShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(34,42,53,0.03)" />
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(19,19,22,0.02)" />
          </filter>
        </defs>
        <g mask="url(#gridMask)">
          {Array.from({ length: rows * cols }).map((_, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = col * (size + gap)
            const y = row * (size + gap)
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={size}
                height={size}
                rx={radius}
                fill="var(--grid-fill)"
                stroke="var(--grid-stroke)"
                strokeWidth="1"
                filter="url(#gridShadow)"
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

const MicrosoftIcon = () => (
  <svg className="size-4 mr-2" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="10.8" height="10.8" fill="#F25022"/>
    <rect x="12" width="10.8" height="10.8" fill="#7FBA00"/>
    <rect y="12" width="10.8" height="10.8" fill="#00A1F1"/>
    <rect x="12" y="12" width="10.8" height="10.8" fill="#FFB900"/>
  </svg>
)

const GoogleIcon = () => (
  <svg className="size-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
)

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  
  // Validation and simulation states
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [status, setStatus] = React.useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [isLoading, setIsLoading] = React.useState(false)

  // Ensure hydration match for theme toggle
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleValidation = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = "Email is a required field"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is a required field"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: null, message: "" })

    if (!handleValidation()) {
      return
    }

    setIsLoading(true)

    // Simulate authentication processing
    setTimeout(() => {
      setIsLoading(false)
      if (email === "demo@cal.diy" && password === "password123") {
        setStatus({
          type: "success",
          message: "Welcome back! Login simulation successful.",
        })
      } else {
        setStatus({
          type: "error",
          message: "Incorrect email or password. Use demo@cal.diy / password123",
        })
      }
    }, 1200)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background/95 transition-colors duration-300 px-4 py-10 overflow-hidden font-sans">
      {/* Background Grid Accent */}
      <BackgroundGrid />

      {/* Modern Theme Switcher Corner Button */}
      {mounted && (
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleTheme}
          className="absolute top-6 right-6 z-20 rounded-full border shadow-sm backdrop-blur-sm bg-background/50 hover:bg-muted transition-all duration-300"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="size-4 text-indigo-600" />
          )}
        </Button>
      )}

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        {/* elegant floating card */}
        <div className="w-full rounded-2xl border border-border/80 bg-card p-8 md:p-10 shadow-lg dark:shadow-zinc-950/20 backdrop-blur-md transition-all duration-300">
          
          {/* Brand Logo & Header */}
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Cal.diy
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mb-8 text-center text-sm text-muted-foreground transition-all">
            Welcome back, sign in to your scheduler
          </p>

          {/* Simulation Alerts */}
          {status.type && (
            <div
              className={`mb-6 flex items-start gap-3 rounded-lg border p-3.5 text-xs transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/20 text-destructive dark:text-destructive-foreground"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="size-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{status.message}</span>
            </div>
          )}

          {/* OAuth Social login block */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="outline"
              className="w-full h-9 hover:bg-muted text-xs font-medium cursor-pointer shadow-sm hover:shadow transition-all"
              onClick={() => {
                setStatus({
                  type: "success",
                  message: "Google sign-in initiated successfully!",
                })
              }}
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-9 hover:bg-muted text-xs font-medium cursor-pointer shadow-sm hover:shadow transition-all"
              onClick={() => {
                setStatus({
                  type: "success",
                  message: "Microsoft Outlook sign-in initiated successfully!",
                })
              }}
            >
              <MicrosoftIcon />
              <span>Sign in with Microsoft</span>
            </Button>
          </div>

          {/* Separator / Divider */}
          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Address Field */}
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-semibold text-foreground/90">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="demo@cal.diy"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={`h-9 text-sm rounded-lg transition-all focus:border-ring ${
                  errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-destructive mt-1 animate-in fade-in-50">
                  {errors.email}
                </p>
              )}
            </Field>

            {/* Password Field */}
            <Field className="space-y-1.5">
              <div className="flex w-full items-center justify-between">
                <FieldLabel className="text-xs font-semibold text-foreground/90">Password</FieldLabel>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault()
                    setStatus({
                      type: "success",
                      message: "Password reset instructions sent to your email!",
                    })
                  }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <InputGroup className="h-9 overflow-hidden rounded-lg">
                <InputGroupInput
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={`text-sm h-full ${
                    errors.password ? "focus-visible:ring-destructive/30" : ""
                  }`}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <InputGroupAddon align="inline-end" className="bg-transparent border-0 pr-1">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md size-7 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.password && (
                <p className="text-[11px] font-medium text-destructive mt-1 animate-in fade-in-50">
                  {errors.password}
                </p>
              )}
            </Field>

            {/* Submit Control Button */}
            <Button
              type="submit"
              className="mt-6 w-full h-9 text-xs font-semibold cursor-pointer shadow-md bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </div>

        {/* Bottom Navigation / Help link details */}
        <div className="mt-6 flex items-center justify-center gap-4 text-center">
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault()
              setStatus({
                type: "success",
                message: "Signup flow initiated! Welcome to Cal.diy.",
              })
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Create a new account
          </a>
        </div>
      </div>
    </div>
  )
}
