"use client"

import * as React from "react"
import { ArrowLeft, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

const settingsNav = [{ title: "Personal", icon: User, isActive: true }]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="relative flex h-svh w-full overflow-hidden bg-background">
        <Sidebar className="w-64 border-r bg-sidebar">
          <SidebarHeader className="h-14 border-none px-2 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="hover:bg-transparent focus-visible:ring-0 active:bg-transparent data-[active=true]:bg-transparent"
                >
                  <a
                    href="/home/workflows"
                    className="group flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {settingsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <a href="#">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </SidebarProvider>
  )
}
