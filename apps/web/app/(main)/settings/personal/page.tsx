"use client"

import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { authClient } from "@/lib/auth-client"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"

const getSessionToken = () => {
  if (typeof document === "undefined") return ""
  const value = `; ${document.cookie}`
  const parts = value.split(`; axonix_session_token=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? ""
  return ""
}

export default function PersonalSettingsPage() {
  const { data: session, isPending } = authClient.useSession()
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const user = session?.user
  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "PR"

  // Synchronize input states when user data is loaded
  React.useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(" ")
      setFirstName(parts[0] || "")
      setLastName(parts.slice(1).join(" ") || "")
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.")
      return
    }

    const token = getSessionToken()
    if (!token) {
      toast.error("No active session found.")
      return
    }

    setIsUploading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      // 1. Get Presigned URL
      const response = await fetch(`${apiUrl}/v1/user/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: file.type,
          extension: file.name.split(".").pop(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, path } = await response.json()
      if (!uploadUrl) throw new Error("Failed to get upload URL")

      // 2. Upload to S3/R2 directly
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      // 3. Update Profile in DB
      const patchResponse = await fetch(`${apiUrl}/v1/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: `${apiUrl.replace("/api", "")}/${path}`,
        }),
      })

      if (patchResponse.ok) {
        toast.success("Profile image updated!")
        // Refresh page to sync all avatars
        window.location.reload()
      } else {
        throw new Error("Failed to update profile image in database")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Failed to upload image.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required.")
      return
    }

    const token = getSessionToken()
    if (!token) {
      toast.error("No active session found.")
      return
    }

    setIsSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const combinedName = `${firstName.trim()} ${lastName.trim()}`

      const patchResponse = await fetch(`${apiUrl}/v1/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: combinedName,
        }),
      })

      if (patchResponse.ok) {
        toast.success("Personal information updated!")
        // Refresh page to sync session name and header
        window.location.reload()
      } else {
        throw new Error("Failed to save personal settings")
      }
    } catch (error) {
      console.error("Save profile failed:", error)
      toast.error("Failed to update profile settings.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl flex-1 space-y-16 p-10 py-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Header section with User Profile in Top Right */}
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Personal Settings
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm leading-none font-medium">
              {user?.name || "Professor"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Owner</p>
          </div>
          <div
            className="group relative cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-10 w-10 ring-2 ring-background ring-offset-2 ring-offset-muted transition-all group-hover:opacity-80">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-tr from-pink-400 to-indigo-500 font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                <Loader2 className="size-4 animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <section className="space-y-8">
        <h2 className="text-sm text-[11px] font-semibold tracking-tight text-muted-foreground/70">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          <div className="space-y-2.5">
            <Label
              htmlFor="firstName"
              className="text-[13px] font-medium text-foreground/90"
            >
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 border-muted-foreground/10 bg-muted/10 focus-visible:ring-1 focus-visible:ring-sidebar-primary"
            />
          </div>
          <div className="space-y-2.5">
            <Label
              htmlFor="lastName"
              className="text-[13px] font-medium text-foreground/90"
            >
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 border-muted-foreground/10 bg-muted/10 focus-visible:ring-1 focus-visible:ring-sidebar-primary"
            />
          </div>
          <div className="space-y-2.5 md:col-span-2">
            <Label
              htmlFor="email"
              className="text-[13px] font-medium text-foreground/90"
            >
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              defaultValue={user?.email}
              className="h-11 border-muted-foreground/10 bg-muted/10 focus-visible:ring-1 focus-visible:ring-sidebar-primary"
              readOnly
              disabled
            />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-8">
        <h2 className="text-sm text-[11px] font-semibold tracking-tight text-muted-foreground/70">
          Security
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-foreground/90">
              Password
            </p>
            <button className="text-[13px] text-primary/90 transition-all hover:text-primary hover:underline">
              Change password
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-foreground/90">
              Two-factor authentication (2FA)
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Two-factor authentication is currently disabled.{" "}
              <button className="font-medium text-primary/90 hover:underline">
                Learn more
              </button>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-9 border-muted-foreground/20 bg-muted/5 px-4 text-[12px] hover:bg-muted/20"
            >
              Enable 2FA
            </Button>
          </div>
        </div>
      </section>

      {/* Personalisation */}
      <section className="space-y-8">
        <h2 className="text-sm text-[11px] font-semibold tracking-tight text-muted-foreground/70">
          Personalisation
        </h2>
        <div className="space-y-3">
          <Label className="text-[13px] font-medium text-foreground/90">
            Theme
          </Label>
          <Select defaultValue="system">
            <SelectTrigger className="h-11 max-w-xs border-muted-foreground/10 bg-muted/10">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System default</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Final Action Button */}
      <div className="pt-10">
        <Button
          size="lg"
          className="flex h-12 items-center gap-2 rounded-md px-10 shadow-sm transition-all"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  )
}
