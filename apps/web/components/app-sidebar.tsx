"use client"

import * as React from "react"
import {
  LayoutDashboard,
  LayoutTemplate,
  Plus,
  Search,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSettings } from "@/components/nav-settings"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@repo/ui/components/ui/sidebar"
import { Button } from "@repo/ui/components/ui/button"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/home/workflows",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Templates",
      url: "/home/templates",
      icon: LayoutTemplate,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-14 items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/colorful_logo.svg" alt="Axonix Logo" className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-sidebar-foreground">Axonix</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <Plus className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <Search className="size-4" />
                </Button>
                <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
              </div>
              
              {/* Show only trigger in collapsed mode */}
              <div className="hidden group-data-[collapsible=icon]:flex">
                <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
