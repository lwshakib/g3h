"use client"

import { ChevronRight, LogOut, Settings, User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function NavSettings() {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const isActive = pathname.startsWith("/settings")

  const handleSignOut = async () => {
    await authClient.signOut()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Settings" isActive={isActive}>
              <Settings className="size-4" />
              <span>Settings</span>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <a
                href="/settings/personal"
                className="flex w-full cursor-pointer items-center"
              >
                <User className="mr-2 size-4" />
                <span>Personal</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 size-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
