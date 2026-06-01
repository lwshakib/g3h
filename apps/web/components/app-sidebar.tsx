"use client"

import * as React from "react"
import { LayoutDashboard, LayoutTemplate, Plus, Search } from "lucide-react"

import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSettings } from "@/components/nav-settings"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/home/workflows",
      icon: LayoutDashboard,
      isActive: true,
    },
  ],
  footer: [
    {
      title: "Templates",
      url: "/home/templates",
      icon: LayoutTemplate,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (pathname === "/home" && item.url === "/home/workflows"),
  }))

  const footer = data.footer.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col py-2 pr-0 pl-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-4">
              {/* Expanded Branding */}
              <div className="flex h-12 w-full items-center justify-between group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2">
                  <Logo className="size-6 text-sidebar-foreground" />
                  <span className="truncate font-semibold text-sidebar-foreground">
                    G3H
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <SidebarMenuButton
                    size="sm"
                    className="h-8 w-8 text-sidebar-foreground/70"
                    tooltip="New"
                  >
                    <Plus className="size-4" />
                  </SidebarMenuButton>
                  <SidebarMenuButton
                    size="sm"
                    className="h-8 w-8 text-sidebar-foreground/70"
                    tooltip="Search"
                  >
                    <Search className="size-4" />
                  </SidebarMenuButton>
                  <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
                </div>
              </div>

              {/* Collapsed Vertical Stack */}
              <div className="hidden flex-col items-center gap-2 py-2 group-data-[collapsible=icon]:flex">
                <SidebarMenuButton
                  size="sm"
                  className="h-8 w-8 text-sidebar-foreground/70"
                  tooltip="New"
                >
                  <Plus className="size-4" />
                </SidebarMenuButton>
                <SidebarMenuButton
                  size="sm"
                  className="h-8 w-8 text-sidebar-foreground/70"
                  tooltip="Search"
                >
                  <Search className="size-4" />
                </SidebarMenuButton>
                <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          {footer.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
              >
                <a href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
